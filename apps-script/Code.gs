const TZ = Session.getScriptTimeZone();
const ADMIN_SESSION_TTL_SECONDS = 21600;
const ADMIN_PASSWORD_SCHEME = 'pbkdf2-sha256-v1';
const ADMIN_PASSWORD_ITERATIONS = 100000;
// Bump this when the backend changes so the deployed version can be checked via action "system.ping".
const BACKEND_VERSION = '2026-11-23-auth-js-pbkdf2';
const BOOKING_STATUSES = ['Menunggu Konfirmasi', 'Terkonfirmasi', 'Selesai', 'Dibatalkan'];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Trevel Admin')
    .addItem('Atur email dan password admin', 'configureAdminAccess')
    .addItem('Aktifkan upload foto bus (Google Drive)', 'authorizeDriveAccess')
    .addToUi();
}

function authorizeDriveAccess() {
  const folderName = DriveApp.getRootFolder().getName();
  SpreadsheetApp.getUi().alert('Akses Google Drive aktif (' + folderName + '). Upload foto bus siap digunakan.');
}

function configureAdminAccess() {
  const ui = SpreadsheetApp.getUi();
  const emailResult = ui.prompt('Atur Admin Trevel', 'Masukkan email admin:', ui.ButtonSet.OK_CANCEL);
  if (emailResult.getSelectedButton() !== ui.Button.OK) return;
  const email = emailResult.getResponseText().trim().toLowerCase();
  if (!email || !email.includes('@')) throw new Error('Email admin tidak valid.');

  const passwordResult = ui.prompt('Atur Admin Trevel', 'Masukkan password minimal 12 karakter:', ui.ButtonSet.OK_CANCEL);
  if (passwordResult.getSelectedButton() !== ui.Button.OK) return;
  const password = passwordResult.getResponseText();
  if (password.length < 12) throw new Error('Password admin minimal 12 karakter.');

  const salt = generatePasswordSalt();
  PropertiesService.getScriptProperties().setProperties({
    ADMIN_EMAIL: email,
    ADMIN_PASSWORD_HASH: hashPasswordPbkdf2(password, salt, ADMIN_PASSWORD_ITERATIONS),
    ADMIN_PASSWORD_SALT: salt,
    ADMIN_PASSWORD_ITERATIONS: String(ADMIN_PASSWORD_ITERATIONS),
    ADMIN_PASSWORD_SCHEME: ADMIN_PASSWORD_SCHEME,
  });
  ui.alert('Kredensial admin tersimpan di Script Properties.');
}

function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.track) {
      return json({ ok: false, error: 'Pelacakan publik tidak tersedia.' });
    }

    const bookings = readTable('Booking')
      .filter(row => row.Status !== 'Dibatalkan')
      .map(row => ({
        ID_Armada: row.ID_Armada,
        Tgl_Mulai: row.Tgl_Mulai,
        Tgl_Selesai: row.Tgl_Selesai,
        Status: row.Status || 'Terkonfirmasi',
      }));
    const penyewa = readTable('Penyewa').map(row => ({
      ID_Penyewa: row.ID_Penyewa,
      Nama_Biro: row.Nama_Biro,
    }));
    const armada = readTable('Armada').map(row => ({
      ID_Armada: row.ID_Armada,
      Nama_Bus: row.Nama_Bus,
      Kapasitas: row.Kapasitas,
      Plat_Nomor: row.Plat_Nomor,
      Status: row.Status,
      Tarif_Per_Hari: row.Tarif_Per_Hari,
      Body_Type: row.Body_Type,
      Chassis: row.Chassis,
      Year: row.Year,
      Tagline: row.Tagline,
      Color_Hex: row.Color_Hex,
      Image: row.Image,
      Facilities: row.Facilities,
    }));
    return json({ armada: armada, penyewa: penyewa, booking: bookings });
  } catch (error) {
    return json({ ok: false, error: error.message });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e && e.postData ? e.postData.contents : '{}');
    if (data.action === 'system.ping') return json({ ok: true, version: BACKEND_VERSION });
    if (data.action === 'auth.login') return loginAdmin(data);
    if (data.action === 'booking.create') return createBooking(data);
    if (data.action === 'booking.track') return trackBooking(data.trackingToken);

    const admin = requireAdmin(data.adminToken);
    switch (data.action) {
      case 'admin.me':
        return json({ ok: true, user: { email: admin.email, name: 'Admin Trevel' } });
      case 'admin.data':
        return json({ ok: true, armada: readTable('Armada'), penyewa: readTable('Penyewa'), booking: readTable('Booking') });
      case 'auth.logout':
        CacheService.getScriptCache().remove('admin:' + data.adminToken);
        return json({ ok: true });
      case 'booking.update':
        return updateBooking(data);
      case 'booking.delete':
        return deleteBooking(data);
      case 'fleet.create':
        return createFleet(data);
      case 'fleet.update':
        return updateFleet(data);
      case 'fleet.delete':
        return deleteFleet(data);
      default:
        return json({ ok: false, error: 'Action tidak dikenal.' });
    }
  } catch (error) {
    return json({ ok: false, error: error.message || 'Permintaan gagal.', code: error.code || 'SERVER_ERROR' });
  }
}

function codedError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function generateTrackingToken() {
  return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '').toLowerCase();
}

function hashTrackingToken(token) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(token),
    Utilities.Charset.UTF_8
  );
  return Utilities.base64EncodeWebSafe(digest);
}

function trackBooking(token) {
  const normalized = String(token || '').trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(normalized)) throw new Error('Token pelacakan tidak valid.');

  const tokenHash = hashTrackingToken(normalized);
  const row = readTable('Booking').find(item => String(item.Tracking_Token_Hash || '') === tokenHash);
  if (!row) throw new Error('Reservasi tidak ditemukan atau token pelacakan sudah tidak berlaku.');

  const partner = findRecord('Penyewa', 'ID_Penyewa', row.ID_Penyewa) || {};
  const bus = findRecord('Armada', 'ID_Armada', row.ID_Armada) || {};
  const startDate = row.Tgl_Mulai;
  const endDate = row.Tgl_Selesai || startDate;
  const days = Number(row.Hari) || Math.max(
    1,
    Math.floor((Date.parse(endDate + 'T00:00:00Z') - Date.parse(startDate + 'T00:00:00Z')) / 86400000) + 1
  );
  const id = String(row.ID_Booking);

  return json({
    ok: true,
    booking: {
      bookingCode: row.Kode_Booking || 'TRV-' + id.padStart(6, '0'),
      partnerName: row.Nama_Biro || partner.Nama_Biro || 'Pemesan',
      picName: row.Nama_PIC || partner.Nama_PIC || '',
      picPhone: row.No_Telepon || partner.No_Telepon || '',
      busName: bus.Nama_Bus || '',
      plateNumber: bus.Plat_Nomor || '',
      startDate: startDate,
      endDate: endDate,
      durationDays: days,
      destination: row.Tujuan || '',
      passengers: Number(row.Jumlah_Penumpang) || 0,
      status: row.Status || 'Menunggu Konfirmasi',
      dealPrice: Number(row.Harga) || 0,
      notes: row.Catatan || '',
    },
  });
}

function loginAdmin(data) {
  const properties = PropertiesService.getScriptProperties();
  const email = String(data.email || '').trim().toLowerCase();
  const throttleKey = 'login-fail:' + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email, Utilities.Charset.UTF_8)
  );
  const cache = CacheService.getScriptCache();
  const failedAttempts = Number(cache.get(throttleKey) || 0);
  if (failedAttempts >= 8) throw codedError('Terlalu banyak percobaan. Coba lagi dalam 15 menit.', 'AUTH_THROTTLED');
  const passwordHash = properties.getProperty('ADMIN_PASSWORD_HASH');
  const adminEmail = properties.getProperty('ADMIN_EMAIL');
  if (!adminEmail || !passwordHash) throw codedError('Admin belum diatur. Jalankan Trevel Admin > Atur email dan password admin.', 'AUTH_NOT_CONFIGURED');
  const password = String(data.password || '');
  const passwordScheme = properties.getProperty('ADMIN_PASSWORD_SCHEME') || 'legacy-sha256';
  let passwordMatches = false;

  if (passwordScheme === ADMIN_PASSWORD_SCHEME) {
    const salt = properties.getProperty('ADMIN_PASSWORD_SALT');
    const iterations = Number(properties.getProperty('ADMIN_PASSWORD_ITERATIONS'));
    if (!salt || !Number.isInteger(iterations) || iterations < 1000 || iterations > 1000000) {
      throw codedError('Konfigurasi hash admin tidak valid. Atur ulang email dan password admin.', 'AUTH_NOT_CONFIGURED');
    }
    passwordMatches = secureStringEquals(
      hashPasswordPbkdf2(password, salt, iterations),
      passwordHash
    );
  } else if (passwordScheme === 'legacy-sha256') {
    passwordMatches = secureStringEquals(hashPasswordLegacy(password), passwordHash);
  } else {
    throw codedError('Format hash admin tidak dikenal. Atur ulang email dan password admin.', 'AUTH_NOT_CONFIGURED');
  }

  if (email !== adminEmail || !passwordMatches) {
    cache.put(throttleKey, String(failedAttempts + 1), 900);
    throw codedError('Email atau password admin salah.', 'AUTH_INVALID');
  }
  cache.remove(throttleKey);

  const storedIterations = Number(properties.getProperty('ADMIN_PASSWORD_ITERATIONS'));
  if (passwordScheme === 'legacy-sha256' || storedIterations !== ADMIN_PASSWORD_ITERATIONS) {
    const salt = generatePasswordSalt();
    properties.setProperties({
      ADMIN_PASSWORD_HASH: hashPasswordPbkdf2(password, salt, ADMIN_PASSWORD_ITERATIONS),
      ADMIN_PASSWORD_SALT: salt,
      ADMIN_PASSWORD_ITERATIONS: String(ADMIN_PASSWORD_ITERATIONS),
      ADMIN_PASSWORD_SCHEME: ADMIN_PASSWORD_SCHEME,
    });
  }

  const token = Utilities.getUuid() + Utilities.getUuid();
  CacheService.getScriptCache().put('admin:' + token, email, ADMIN_SESSION_TTL_SECONDS);
  return json({ ok: true, token: token, user: { email: email, name: 'Admin Trevel' } });
}

function requireAdmin(token) {
  const email = token ? CacheService.getScriptCache().get('admin:' + token) : null;
  if (!email) throw codedError('Sesi admin habis. Silakan masuk kembali.', 'SESSION_EXPIRED');
  return { email: email };
}

function hashPasswordLegacy(password) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  return Utilities.base64Encode(digest);
}

function generatePasswordSalt() {
  const seed = Utilities.getUuid() + Utilities.getUuid();
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    seed,
    Utilities.Charset.UTF_8
  ).slice(0, 16);
  return Utilities.base64EncodeWebSafe(bytes);
}

// PBKDF2-HMAC-SHA256 (32-byte key) implemented in plain JavaScript.
// Calling Utilities.computeHmacSha256Signature once per iteration costs ~1 ms per call,
// which made 100k iterations take ~90 s and time out the login. This version produces
// byte-for-byte the same output (existing stored hashes stay valid) but runs in-process.
function hashPasswordPbkdf2(password, salt, iterations) {
  const passwordBytes = Utilities.newBlob(String(password)).getBytes();
  const saltBytes = Utilities.base64DecodeWebSafe(salt);
  return Utilities.base64EncodeWebSafe(pbkdf2Sha256Bytes(passwordBytes, saltBytes, iterations));
}

// Reference implementation using the Apps Script HMAC service (slow). Used only by selfTestPasswordHash.
function hashPasswordPbkdf2Native(password, salt, iterations) {
  const passwordBytes = Utilities.newBlob(String(password)).getBytes();
  const saltBytes = Utilities.base64DecodeWebSafe(salt);
  let block = Utilities.computeHmacSha256Signature(saltBytes.concat([0, 0, 0, 1]), passwordBytes);
  const derivedKey = block.slice();
  for (let i = 1; i < iterations; i += 1) {
    block = Utilities.computeHmacSha256Signature(block, passwordBytes);
    for (let j = 0; j < derivedKey.length; j += 1) derivedKey[j] ^= block[j];
  }
  return Utilities.base64EncodeWebSafe(derivedKey);
}

// Run from the Apps Script editor to confirm both implementations agree (uses a dummy password).
function selfTestPasswordHash() {
  const salt = generatePasswordSalt();
  const fast = hashPasswordPbkdf2('self-test-dummy-password', salt, 200);
  const slow = hashPasswordPbkdf2Native('self-test-dummy-password', salt, 200);
  const started = Date.now();
  hashPasswordPbkdf2('self-test-dummy-password', salt, ADMIN_PASSWORD_ITERATIONS);
  const message = (fast === slow ? 'OK: hash identik' : 'GAGAL: hash berbeda')
    + ' | ' + ADMIN_PASSWORD_ITERATIONS + ' iterasi = ' + (Date.now() - started) + ' ms';
  Logger.log(message);
  return message;
}

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];
const SHA256_IV = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

// One SHA-256 compression: returns the new 8-word state for `state` after processing 16 words.
function sha256Compress(state, words, schedule) {
  const w = schedule;
  for (let i = 0; i < 16; i += 1) w[i] = words[i] | 0;
  for (let i = 16; i < 64; i += 1) {
    const x = w[i - 15];
    const y = w[i - 2];
    const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
    const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
    w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
  }
  let a = state[0], b = state[1], c = state[2], d = state[3];
  let e = state[4], f = state[5], g = state[6], h = state[7];
  for (let i = 0; i < 64; i += 1) {
    const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
    const t1 = (h + S1 + ((e & f) ^ (~e & g)) + SHA256_K[i] + w[i]) | 0;
    const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
    const t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
    h = g; g = f; f = e; e = (d + t1) | 0;
    d = c; c = b; b = a; a = (t1 + t2) | 0;
  }
  return [
    (state[0] + a) | 0, (state[1] + b) | 0, (state[2] + c) | 0, (state[3] + d) | 0,
    (state[4] + e) | 0, (state[5] + f) | 0, (state[6] + g) | 0, (state[7] + h) | 0,
  ];
}

// SHA-256 of `bytes` (unsigned 0..255) continuing from `state`, where `prefixLength` bytes were already hashed.
function sha256Finish(state, bytes, prefixLength, schedule) {
  const totalBits = (prefixLength + bytes.length) * 8;
  const padded = bytes.concat([0x80]);
  while (padded.length % 64 !== 56) padded.push(0);
  // 64-bit big-endian bit length; inputs here are far below 2^32 bits, so the high word is 0.
  padded.push(0, 0, 0, 0);
  padded.push((totalBits >>> 24) & 0xff, (totalBits >>> 16) & 0xff, (totalBits >>> 8) & 0xff, totalBits & 0xff);
  let current = state;
  const words = new Array(16);
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      const p = offset + i * 4;
      words[i] = (padded[p] << 24) | (padded[p + 1] << 16) | (padded[p + 2] << 8) | padded[p + 3];
    }
    current = sha256Compress(current, words, schedule);
  }
  return current;
}

function wordsToBytes(words) {
  const bytes = [];
  for (let i = 0; i < words.length; i += 1) {
    bytes.push((words[i] >>> 24) & 0xff, (words[i] >>> 16) & 0xff, (words[i] >>> 8) & 0xff, words[i] & 0xff);
  }
  return bytes;
}

// Returns the 32-byte derived key as signed bytes (-128..127), matching Apps Script byte arrays.
function pbkdf2Sha256Bytes(passwordBytes, saltBytes, iterations) {
  const schedule = new Array(64);
  let key = passwordBytes.map(b => b & 0xff);
  if (key.length > 64) key = wordsToBytes(sha256Finish(SHA256_IV, key, 0, schedule));
  const ipadWords = new Array(16);
  const opadWords = new Array(16);
  for (let i = 0; i < 16; i += 1) {
    let inner = 0;
    let outer = 0;
    for (let j = 0; j < 4; j += 1) {
      const k = key[i * 4 + j] || 0;
      inner = (inner << 8) | (k ^ 0x36);
      outer = (outer << 8) | (k ^ 0x5c);
    }
    ipadWords[i] = inner;
    opadWords[i] = outer;
  }
  const innerState = sha256Compress(SHA256_IV, ipadWords, schedule);
  const outerState = sha256Compress(SHA256_IV, opadWords, schedule);

  // U1 = HMAC(password, salt || INT(1))
  const firstMessage = saltBytes.map(b => b & 0xff).concat([0, 0, 0, 1]);
  const firstInner = sha256Finish(innerState, firstMessage, 64, schedule);
  let u = sha256Finish(outerState, wordsToBytes(firstInner), 64, schedule);
  const result = u.slice();

  // Ui = HMAC(password, U(i-1)); a 32-byte message after the 64-byte pad fits one padded block.
  const block = [0, 0, 0, 0, 0, 0, 0, 0, 0x80000000, 0, 0, 0, 0, 0, 0, (64 + 32) * 8];
  for (let i = 1; i < iterations; i += 1) {
    for (let j = 0; j < 8; j += 1) block[j] = u[j];
    const inner = sha256Compress(innerState, block, schedule);
    for (let j = 0; j < 8; j += 1) block[j] = inner[j];
    u = sha256Compress(outerState, block, schedule);
    for (let j = 0; j < 8; j += 1) result[j] ^= u[j];
  }
  return wordsToBytes(result).map(b => (b > 127 ? b - 256 : b));
}

function secureStringEquals(left, right) {
  const a = String(left || '');
  const b = String(right || '');
  if (a.length !== b.length) return false;

  let difference = 0;
  for (let i = 0; i < a.length; i += 1) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return difference === 0;
}

function readTable(name) {
  const sheet = getSheet(name);
  const values = sheet.getDataRange().getValues();
  if (!values.length) return [];
  const headers = values.shift().map(String);
  return values.filter(row => row[0] !== '' && row[0] != null).map(row => {
    const record = {};
    headers.forEach((key, index) => {
      record[key] = row[index] instanceof Date
        ? Utilities.formatDate(row[index], TZ, 'yyyy-MM-dd')
        : row[index];
    });
    return record;
  });
}

function getSheet(name) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) throw new Error('Sheet ' + name + ' tidak ditemukan.');
  return sheet;
}

function getHeaders(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (!lastColumn) throw new Error('Header sheet ' + sheet.getName() + ' belum dibuat.');
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);
}

function ensureHeaders(sheet, requiredHeaders) {
  let headers = getHeaders(sheet);
  const missing = requiredHeaders.filter(header => headers.indexOf(header) < 0);
  if (missing.length) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    headers = headers.concat(missing);
  }
  return headers;
}

function appendRecord(sheet, record) {
  const headers = getHeaders(sheet);
  sheet.appendRow(headers.map(key => {
    const value = record[key];
    return key.indexOf('Tgl_') === 0 && value ? new Date(value + 'T00:00:00') : (value == null ? '' : value);
  }));
}

function findRecord(tableName, idField, id) {
  return readTable(tableName).find(row => String(row[idField]) === String(id));
}

function findRowNumber(sheet, idField, id) {
  const headers = getHeaders(sheet);
  const idColumn = headers.indexOf(idField) + 1;
  if (!idColumn) throw new Error('Kolom ' + idField + ' tidak ditemukan.');
  if (sheet.getLastRow() < 2) return 0;
  const values = sheet.getRange(2, idColumn, sheet.getLastRow() - 1, 1).getValues();
  const index = values.findIndex(row => String(row[0]) === String(id));
  return index < 0 ? 0 : index + 2;
}

function updateRecord(sheet, idField, id, updates) {
  const rowNumber = findRowNumber(sheet, idField, id);
  if (!rowNumber) throw new Error('Data tidak ditemukan.');
  const headers = getHeaders(sheet);
  const row = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
  headers.forEach((key, index) => {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      const value = updates[key];
      row[index] = key.indexOf('Tgl_') === 0 && value ? new Date(value + 'T00:00:00') : value;
    }
  });
  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
  return rowNumber;
}

function deleteRecord(sheet, idField, id) {
  const rowNumber = findRowNumber(sheet, idField, id);
  if (!rowNumber) throw new Error('Data tidak ditemukan.');
  sheet.deleteRow(rowNumber);
}

function nextId(tableName, idField) {
  return Math.max(0, ...readTable(tableName).map(row => Number(row[idField]) || 0)) + 1;
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) && !Number.isNaN(Date.parse(value + 'T00:00:00Z'));
}

function createBooking(data) {
  const source = data.source === 'admin' ? 'admin' : 'publik';
  if (source === 'admin') requireAdmin(data.adminToken);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    ensureHeaders(getSheet('Booking'), [
      'Status', 'Sumber', 'Hari', 'Catatan', 'Catatan_Admin',
      'Nama_Biro', 'Nama_PIC', 'No_Telepon', 'Email', 'Tracking_Token_Hash',
    ]);
    const bus = readTable('Armada').find(row => String(row.ID_Armada) === String(data.ID_Armada));
    if (!bus) throw new Error('Armada tidak ada.');

    const startDate = String(data.Tgl_Mulai || '');
    const endDate = String(data.Tgl_Selesai || startDate);
    if (!validDate(startDate) || !validDate(endDate) || endDate < startDate) throw new Error('Rentang tanggal tidak valid.');
    const destination = String(data.Tujuan || '').trim();
    if (!destination) throw new Error('Tujuan wajib diisi.');
    const passengers = Number(data.Jumlah_Penumpang);
    if (!(passengers >= 1 && passengers <= Number(bus.Kapasitas))) throw new Error('Penumpang melebihi kapasitas bus.');
    const price = Number(data.Harga);
    if (!(price > 0)) throw new Error('Harga harus lebih dari 0.');

    const status = source === 'admin' ? (data.Status || 'Terkonfirmasi') : 'Menunggu Konfirmasi';
    if (BOOKING_STATUSES.indexOf(status) < 0) throw new Error('Status booking tidak valid.');

    const conflict = readTable('Booking').some(row =>
      String(row.ID_Armada) === String(bus.ID_Armada) &&
      row.Status !== 'Dibatalkan' &&
      row.Tgl_Mulai <= endDate && row.Tgl_Selesai >= startDate
    );
    if (conflict) throw new Error('Bus sudah dibooking pada tanggal tersebut.');

    const partner = resolvePartner(data);
    const id = nextId('Booking', 'ID_Booking');
    const trackingToken = generateTrackingToken();
    const days = Math.floor((Date.parse(endDate + 'T00:00:00Z') - Date.parse(startDate + 'T00:00:00Z')) / 86400000) + 1;
    appendRecord(getSheet('Booking'), {
      ID_Booking: id,
      ID_Penyewa: partner.ID_Penyewa,
      ID_Armada: bus.ID_Armada,
      Nama_Biro: String(data.Nama_Biro || partner.Nama_Biro || '').slice(0, 120),
      Nama_PIC: String(data.Nama_PIC || partner.Nama_PIC || '').slice(0, 120),
      No_Telepon: String(data.No_Telepon || partner.No_Telepon || '').slice(0, 40),
      Email: String(data.Email || partner.Email || '').slice(0, 160),
      Tracking_Token_Hash: hashTrackingToken(trackingToken),
      Tgl_Mulai: startDate,
      Tgl_Selesai: endDate,
      Tujuan: destination,
      Jumlah_Penumpang: passengers,
      Harga: price,
      Status: status,
      Sumber: source,
      Hari: days,
      Catatan: String(data.Catatan || ''),
      Catatan_Admin: source === 'admin' ? String(data.Catatan_Admin || '') : '',
    });
    return json({
      ok: true,
      ID_Booking: id,
      bookingCode: 'TRV-' + String(id).padStart(6, '0'),
      trackingToken: trackingToken,
    });
  } finally {
    lock.releaseLock();
  }
}

function resolvePartner(data) {
  const partners = readTable('Penyewa');
  let partner = data.ID_Penyewa
    ? partners.find(row => String(row.ID_Penyewa) === String(data.ID_Penyewa))
    : null;
  const name = String(data.Nama_Biro || '').trim();
  if (!partner && name) {
    partner = partners.find(row => String(row.Nama_Biro || '').trim().toLowerCase() === name.toLowerCase());
  }
  if (partner) return partner;
  if (!name) throw new Error('Nama biro/penyewa wajib diisi.');

  const id = nextId('Penyewa', 'ID_Penyewa');
  const newPartner = {
    ID_Penyewa: id,
    Nama_Biro: name,
    Nama_PIC: String(data.Nama_PIC || ''),
    No_Telepon: String(data.No_Telepon || ''),
    Email: String(data.Email || ''),
    Alamat: String(data.Alamat || ''),
  };
  appendRecord(getSheet('Penyewa'), newPartner);
  return newPartner;
}

function updateBooking(data) {
  return withScriptLock(function() {
    ensureHeaders(getSheet('Booking'), ['Status', 'Sumber', 'Hari', 'Catatan', 'Catatan_Admin']);
    const id = data.ID_Booking;
    const existing = findRecord('Booking', 'ID_Booking', id);
    if (!existing) throw new Error('Booking tidak ditemukan.');
    const updates = {};
    if (data.Status != null) {
      if (BOOKING_STATUSES.indexOf(data.Status) < 0) throw new Error('Status booking tidak valid.');
      updates.Status = data.Status;
    }
    if (data.Harga != null) {
      const price = Number(data.Harga);
      if (!(price > 0)) throw new Error('Harga harus lebih dari 0.');
      updates.Harga = price;
    }
    if (data.Catatan_Admin != null) updates.Catatan_Admin = String(data.Catatan_Admin).slice(0, 1000);
    if (updates.Status && updates.Status !== 'Dibatalkan' && existing.Status === 'Dibatalkan') {
      const conflict = readTable('Booking').some(row =>
        String(row.ID_Booking) !== String(id) &&
        String(row.ID_Armada) === String(existing.ID_Armada) &&
        row.Status !== 'Dibatalkan' &&
        row.Tgl_Mulai <= existing.Tgl_Selesai && row.Tgl_Selesai >= existing.Tgl_Mulai
      );
      if (conflict) throw new Error('Jadwal bentrok; booking tidak dapat diaktifkan.');
    }
    updateRecord(getSheet('Booking'), 'ID_Booking', id, updates);
    return json({ ok: true, booking: findRecord('Booking', 'ID_Booking', id) });
  });
}

function deleteBooking(data) {
  return withScriptLock(function() {
    deleteRecord(getSheet('Booking'), 'ID_Booking', data.ID_Booking);
    return json({ ok: true });
  });
}

function normalizeFleet(data, existingImage) {
  const name = String(data.Nama_Bus || '').trim();
  const plate = String(data.Plat_Nomor || '').trim();
  const capacity = Number(data.Kapasitas);
  const rate = Number(data.Tarif_Per_Hari);
  if (!name || !plate) throw new Error('Nama bus dan nomor polisi wajib diisi.');
  if (!(capacity >= 1 && capacity <= 100)) throw new Error('Kapasitas bus tidak valid.');
  if (!(rate > 0)) throw new Error('Tarif harian harus lebih dari 0.');
  let image = String(data.Image || existingImage || '');
  if (data.ImageData) image = saveFleetImage(data.ImageData);
  else if (image.indexOf('data:image/') === 0) throw new Error('Gunakan pemilih file untuk mengunggah gambar.');

  return {
    Nama_Bus: name,
    Plat_Nomor: plate,
    Kapasitas: capacity,
    Status: String(data.Status || 'Tersedia'),
    Tarif_Per_Hari: rate,
    Body_Type: String(data.Body_Type || ''),
    Chassis: String(data.Chassis || ''),
    Year: Number(data.Year) || '',
    Tagline: String(data.Tagline || ''),
    Color_Hex: String(data.Color_Hex || '#1D4ED8'),
    Image: image,
    Facilities: String(data.Facilities || ''),
  };
}

function saveFleetImage(imageData) {
  const mimeType = String(imageData.mimeType || '');
  const base64 = String(imageData.base64 || '');
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.indexOf(mimeType) < 0) throw new Error('Format gambar harus JPG, PNG, atau WebP.');
  if (!base64 || base64.length > 2200000) throw new Error('Ukuran foto terlalu besar setelah kompresi.');

  const bytes = Utilities.base64Decode(base64);
  const safeName = String(imageData.name || 'bus.jpg').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
  const blob = Utilities.newBlob(bytes, mimeType, safeName);
  const folderName = 'Trevel Bus Images';
  const folders = DriveApp.getFoldersByName(folderName);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  const file = folder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (error) {
    file.setTrashed(true);
    throw new Error('Google Drive tidak mengizinkan berbagi gambar publik. Periksa kebijakan berbagi akun.');
  }
  return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1600';
}

function createFleet(data) {
  return withScriptLock(function() {
    const fleet = normalizeFleet(data);
    ensureHeaders(getSheet('Armada'), ['Body_Type', 'Chassis', 'Year', 'Tagline', 'Color_Hex', 'Image', 'Facilities']);
    const id = nextId('Armada', 'ID_Armada');
    appendRecord(getSheet('Armada'), Object.assign({ ID_Armada: id }, fleet));
    return json({ ok: true, ID_Armada: id, armada: findRecord('Armada', 'ID_Armada', id) });
  });
}

function updateFleet(data) {
  return withScriptLock(function() {
    const id = data.ID_Armada;
    const existing = findRecord('Armada', 'ID_Armada', id);
    if (!existing) throw new Error('Armada tidak ditemukan.');
    const fleet = normalizeFleet(data, existing.Image);
    ensureHeaders(getSheet('Armada'), ['Body_Type', 'Chassis', 'Year', 'Tagline', 'Color_Hex', 'Image', 'Facilities']);
    updateRecord(getSheet('Armada'), 'ID_Armada', id, fleet);
    return json({ ok: true, armada: findRecord('Armada', 'ID_Armada', id) });
  });
}

function deleteFleet(data) {
  return withScriptLock(function() {
    const id = data.ID_Armada;
    if (!findRecord('Armada', 'ID_Armada', id)) throw new Error('Armada tidak ditemukan.');
    const hasBooking = readTable('Booking').some(row => String(row.ID_Armada) === String(id) && row.Status !== 'Dibatalkan');
    if (hasBooking) throw new Error('Armada masih memiliki booking aktif dan tidak dapat dihapus.');
    deleteRecord(getSheet('Armada'), 'ID_Armada', id);
    return json({ ok: true });
  });
}

function withScriptLock(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
