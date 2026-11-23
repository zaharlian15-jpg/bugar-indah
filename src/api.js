import { FLEET_DATA, PARTNERS_DATA, BOOKING_STATUSES } from './data/catalog';

export { FLEET_DATA, PARTNERS_DATA, BOOKING_STATUSES };

const TIMEOUT_MS = 8000;
// Login hashes the password server-side and may hit an Apps Script cold start.
const LOGIN_TIMEOUT_MS = 30000;
const ADMIN_TOKEN_KEY = 'trevel_admin_token';
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxvZRBmV0rLiFGcyjy66RINlv1SFoymkSUlSNW1dcLuJj-wq7ULm5OWA6k2fhvwNgG4/exec';

// Error kinds let the UI tell a slow backend, a blocked request and bad credentials apart.
export const API_ERROR = {
  TIMEOUT: 'timeout',
  NETWORK: 'network',
  BAD_RESPONSE: 'bad_response',
  AUTH: 'auth',
  SERVER: 'server',
};

const AUTH_CODES = ['AUTH_INVALID', 'AUTH_THROTTLED', 'AUTH_NOT_CONFIGURED', 'SESSION_EXPIRED'];

function apiError(message, kind, extra = {}) {
  const err = new Error(message);
  err.kind = kind;
  Object.assign(err, extra);
  return err;
}

async function fetchDatabase({ method = 'GET', body, queryParams = '', timeout = TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const url = queryParams
      ? `${GAS_ENDPOINT}${queryParams.startsWith('?') ? '' : '?'}${queryParams}`
      : GAS_ENDPOINT;
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'text/plain;charset=utf-8' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw apiError(
        'Google Apps Script mengembalikan respons yang bukan JSON. Pastikan Web app di-deploy dengan akses "Anyone" dan URL /exec sudah benar.',
        API_ERROR.BAD_RESPONSE,
        { status: res.status },
      );
    }
    if (!res.ok) throw apiError(data.error || `HTTP ${res.status}`, API_ERROR.SERVER, { status: res.status });
    if (data.ok === false || data.error) {
      const code = data.code || '';
      const kind = AUTH_CODES.includes(code) || /password admin salah|sesi admin habis/i.test(data.error || '')
        ? API_ERROR.AUTH
        : API_ERROR.SERVER;
      throw apiError(data.error || 'Permintaan ke Apps Script gagal.', kind, { code });
    }
    return data;
  } catch (err) {
    if (err.kind) throw err;
    if (err.name === 'AbortError') {
      throw apiError(
        `Google Apps Script tidak menjawab dalam ${Math.round(timeout / 1000)} detik. Ini bukan tanda kata sandi salah: backend sedang lambat atau belum memakai versi kode terbaru.`,
        API_ERROR.TIMEOUT,
      );
    }
    if (err instanceof TypeError) {
      throw apiError(
        'Browser tidak dapat menghubungi Google Apps Script (koneksi terputus atau diblokir CORS). Periksa internet Anda dan pastikan Web app di-deploy dengan akses "Anyone".',
        API_ERROR.NETWORK,
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function adminAction(action, values = {}) {
  return fetchDatabase({
    method: 'POST',
    body: { action, ...values, adminToken: sessionStorage.getItem(ADMIN_TOKEN_KEY) },
  });
}

function parseFacilities(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* Treat plain cell text as a list. */ }
  return String(value).split(/[\n;]/).map((item) => item.trim()).filter(Boolean);
}

function busIdFromSheet(value) {
  const byId = FLEET_DATA.find((bus) => String(bus.id) === String(value));
  if (byId) return byId.id;
  const numericIndex = Number(value) - 1;
  return FLEET_DATA[numericIndex]?.id || FLEET_DATA[0].id;
}

function mapDatabaseResponse(data) {
  const fleet = (data.armada || []).map((row, index) => {
    const template = FLEET_DATA.find((bus) => bus.name.toLowerCase() === String(row.Nama_Bus || '').toLowerCase())
      || FLEET_DATA[index % FLEET_DATA.length];
    return {
      ...template,
      id: ['zotopia', 'cocomelon'].includes(template.id) && template.name.toLowerCase() === String(row.Nama_Bus || '').toLowerCase()
        ? template.id
        : `bus-${row.ID_Armada ?? index + 1}`,
      name: row.Nama_Bus || template.name,
      capacity: Number(row.Kapasitas) || template.capacity,
      plateNumber: row.Plat_Nomor || template.plateNumber,
      status: row.Status || template.status,
      dailyRate: Number(row.Tarif_Per_Hari) || template.dailyRate,
      bodyType: row.Body_Type || template.bodyType,
      chassis: row.Chassis || template.chassis,
      year: Number(row.Year) || template.year,
      tagline: row.Tagline || template.tagline,
      colorHex: row.Color_Hex || template.colorHex,
      image: row.Image || template.image,
      facilities: parseFacilities(row.Facilities, template.facilities),
      databaseId: row.ID_Armada,
    };
  });
  const partners = (data.penyewa || []).map((row) => ({
    id: String(row.ID_Penyewa),
    name: row.Nama_Biro || 'Penyewa',
    pic: row.Nama_PIC || '',
    phone: row.No_Telepon || '',
    city: row.Alamat || '',
    tier: 'Mitra Reguler',
    totalTrips: 0,
    rating: 0,
  }));
  const partnerById = new Map(partners.map((partner) => [partner.id, partner]));
  const bookings = (data.booking || []).map((row) => {
    const bus = fleet.find((item) => String(item.databaseId) === String(row.ID_Armada))
      || fleet.find((item) => item.id === busIdFromSheet(row.ID_Armada))
      || FLEET_DATA[0];
    const partner = partnerById.get(String(row.ID_Penyewa));
    const startDate = row.Tgl_Mulai;
    const endDate = row.Tgl_Selesai || startDate;
    const days = Math.max(1, Math.floor((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86400000) + 1);
    const id = String(row.ID_Booking);
    return {
      id,
      bookingCode: row.Kode_Booking || `TRV-${id.padStart(6, '0')}`,
      partnerId: partner?.id || String(row.ID_Penyewa || ''),
      partnerName: row.Nama_Biro || partner?.name || 'Penyewa',
      picName: row.Nama_PIC || partner?.pic || '',
      picPhone: row.No_Telepon || partner?.phone || '',
      picEmail: row.Email || '',
      busId: bus.id,
      busName: bus.name,
      plateNumber: bus.plateNumber,
      destination: row.Tujuan || '',
      startDate,
      endDate,
      days,
      passengers: Number(row.Jumlah_Penumpang) || 1,
      baseRate: Number(bus.dailyRate) * days,
      tollFuelEstimate: 0,
      dealPrice: Number(row.Harga) || 0,
      status: row.Status || 'Terkonfirmasi',
      source: row.Sumber || 'publik',
      notes: row.Catatan || '',
      adminNotes: row.Catatan_Admin || '',
    };
  });
  return { fleet: fleet.length ? fleet : FLEET_DATA, partners, bookings, lastSync: new Date().toISOString() };
}

function requireAdmin() {
  if (!sessionStorage.getItem(ADMIN_TOKEN_KEY)) {
    const error = new Error('Silakan masuk ke panel admin.');
    error.status = 401;
    throw error;
  }
}

async function createSheetBooking(payload, source) {
  const data = source === 'admin'
    ? await adminAction('admin.data')
    : await fetchDatabase();
  const mapped = mapDatabaseResponse(data);
  const bus = mapped.fleet.find((item) => item.id === payload.busId);
  if (!bus?.databaseId) throw new Error('ID armada tidak ditemukan di sheet Armada.');

  const partner = mapped.partners.find((item) => item.id === String(payload.partnerId))
    || mapped.partners.find((item) => item.name.trim().toLowerCase() === String(payload.partnerName || '').trim().toLowerCase());
  if (!partner && source === 'admin') {
    throw new Error('Biro belum terdaftar di sheet Penyewa. Daftarkan biro terlebih dahulu sebelum membuat booking.');
  }

  const bookingFields = {
      ID_Armada: bus.databaseId,
      ID_Penyewa: partner?.id || payload.partnerId || '',
      Tgl_Mulai: payload.startDate,
      Tgl_Selesai: payload.endDate || payload.startDate,
      Tujuan: payload.destination,
      Jumlah_Penumpang: Number(payload.passengers),
      Harga: Number(payload.dealPrice),
      Nama_Biro: partner?.name || payload.partnerName || '',
      Nama_PIC: payload.picName || partner?.pic || '',
      No_Telepon: payload.picPhone || partner?.phone || '',
      Email: payload.picEmail || '',
      Status: payload.status || (source === 'admin' ? 'Terkonfirmasi' : 'Menunggu Konfirmasi'),
      Sumber: source,
      Catatan: payload.notes || '',
      Catatan_Admin: payload.adminNotes || '',
  };
  const result = source === 'admin'
    ? await adminAction('booking.create', bookingFields)
    : await fetchDatabase({ method: 'POST', body: { action: 'booking.create', ...bookingFields } });

  const id = String(result.ID_Booking);
  return {
    ...payload,
    id,
    bookingCode: `TRV-${id.padStart(6, '0')}`,
    trackingToken: result.trackingToken,
    partnerId: partner?.id || String(result.ID_Penyewa || payload.partnerId || ''),
    partnerName: partner?.name || payload.partnerName || '',
    busId: bus.id,
    busName: bus.name,
  };
}

// ------------------------------------------------------------------
// Public – backed by the same bookings database as the admin panel
// ------------------------------------------------------------------

export async function fetchPublicData() {
  const result = mapDatabaseResponse(await fetchDatabase());
  return {
    fleet: result.fleet,
    partners: (result.partners?.length ? result.partners : PARTNERS_DATA).map(({ id, name, tier }) => ({
      id,
      name,
      tier,
    })),
    blocked: result.bookings.map(({ busId, startDate, endDate, status }) => ({
      busId,
      startDate,
      endDate,
      status,
    })),
  };
}

export async function submitPublicBooking(payload) {
  const booking = await createSheetBooking(payload, 'publik');
  const fullBooking = {
    ...payload,
    ...booking,
    bookingCode: booking.bookingCode,
    status: 'Menunggu Konfirmasi',
  };
  return fullBooking;
}

export async function trackPublicBooking(token) {
  const normalized = String(token || '').trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new Error('Token pelacakan tidak valid. Buka tautan pelacakan yang dikirim setelah pemesanan.');
  }

  const result = await fetchDatabase({
    method: 'POST',
    body: { action: 'booking.track', trackingToken: normalized },
  });
  if (!result.booking) throw new Error('Apps Script tidak mengembalikan data reservasi.');
  return result.booking;
}

// ------------------------------------------------------------------
// Admin – local panel session; reservation data stays in Google Apps Script
// ------------------------------------------------------------------

export async function loginAdmin(email, password) {
  const result = await fetchDatabase({ method: 'POST', body: { action: 'auth.login', email, password }, timeout: LOGIN_TIMEOUT_MS });
  if (!result.token || !result.user) throw new Error('Apps Script tidak memberikan sesi admin.');
  sessionStorage.setItem(ADMIN_TOKEN_KEY, result.token);
  return { id: result.user.email, ...result.user, roles: ['admin'] };
}

export async function logoutAdmin() {
  try {
    await adminAction('auth.logout');
  } finally {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

export function clearLocalAdminSession() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function hasLocalAdminSession() {
  return Boolean(sessionStorage.getItem(ADMIN_TOKEN_KEY));
}

export async function fetchAdminMe() {
  const result = await adminAction('admin.me');
  return { id: result.user.email, ...result.user, roles: ['admin'] };
}

export async function fetchAdminData() {
  return mapDatabaseResponse(await adminAction('admin.data'));
}

export async function createAdminBooking(payload) {
  return createSheetBooking(payload, 'admin');
}

export async function updateAdminBooking(id, updates) {
  const result = await adminAction('booking.update', {
    ID_Booking: id,
    ...(updates.status !== undefined ? { Status: updates.status } : {}),
    ...(updates.dealPrice !== undefined ? { Harga: updates.dealPrice } : {}),
    ...(updates.adminNotes !== undefined ? { Catatan_Admin: updates.adminNotes } : {}),
  });
  return mapDatabaseResponse({ armada: [], penyewa: [], booking: [result.booking] }).bookings[0];
}

export async function deleteAdminBooking(id) {
  return adminAction('booking.delete', { ID_Booking: id });
}

function toSheetFleet(bus) {
  return {
    Nama_Bus: bus.name,
    Plat_Nomor: bus.plateNumber,
    Kapasitas: Number(bus.capacity),
    Status: bus.status,
    Tarif_Per_Hari: Number(bus.dailyRate),
    Body_Type: bus.bodyType,
    Chassis: bus.chassis,
    Year: Number(bus.year),
    Tagline: bus.tagline,
    Color_Hex: bus.colorHex,
    Image: bus.image,
    ImageData: bus.imageUpload ? {
      base64: bus.imageUpload.base64,
      mimeType: bus.imageUpload.mimeType,
      name: bus.imageUpload.name,
    } : undefined,
    Facilities: JSON.stringify(bus.facilities || []),
  };
}

export async function createAdminFleet(bus) {
  return adminAction('fleet.create', toSheetFleet(bus));
}

export async function updateAdminFleet(id, bus) {
  const result = await adminAction('fleet.update', { ID_Armada: id, ...toSheetFleet(bus) });
  return result.armada;
}

export async function deleteAdminFleet(id) {
  return adminAction('fleet.delete', { ID_Armada: id });
}
