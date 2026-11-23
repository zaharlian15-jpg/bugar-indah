import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search, X, Check, Ban, Flag, Trash2, MapPin, CalendarDays, Users, Phone, Mail, Globe, UserCog, Save, StickyNote, ArrowUpDown, Printer, MessageCircle
} from 'lucide-react';
import { formatIDR, formatDateRangeIndo, formatDateIndo, printElement } from '../utils';
import { BOOKING_STATUSES } from '../api';
import TicketPreview from '../components/TicketPreview';

export const STATUS_STYLE = {
  'Menunggu Konfirmasi': 'bg-amber-50 text-amber-700 border-amber-200',
  Terkonfirmasi: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Selesai: 'bg-slate-100 text-slate-600 border-slate-200',
  Dibatalkan: 'bg-rose-50 text-rose-600 border-rose-200',
};

export function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${STATUS_STYLE[status] || STATUS_STYLE.Selesai}`}>
      {status === 'Menunggu Konfirmasi' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
      {status}
    </span>
  );
}

function openBookingWhatsApp(booking) {
  const phone = String(booking.picPhone || '').replace(/\D/g, '');
  const targetPhone = phone.startsWith('0') ? `62${phone.slice(1)}` : phone;
  if (!targetPhone) {
    toast.error('Nomor WhatsApp PIC belum tersedia.');
    return;
  }

  const statusMessage = booking.status === 'Terkonfirmasi' || booking.status === 'Selesai'
    ? 'Reservasi Anda telah kami konfirmasi.'
    : booking.status === 'Dibatalkan'
      ? 'Reservasi Anda telah dibatalkan.'
      : 'Permintaan reservasi Anda telah kami terima dan sedang menunggu konfirmasi.';
  const message = [
    `Halo ${booking.picName || 'Bapak/Ibu'},`,
    '',
    statusMessage,
    '',
    'Detail reservasi:',
    `Kode booking: ${booking.bookingCode}`,
    `Penyewa: ${booking.partnerName || '-'}`,
    `Tujuan: ${booking.destination || '-'}`,
    `Armada: ${booking.busName || '-'}`,
    `Jadwal: ${formatDateRangeIndo(booking.startDate, booking.endDate)}`,
    `Penumpang: ${booking.passengers || 0} orang`,
    `Harga kesepakatan: ${formatIDR(booking.dealPrice)}`,
    '',
    'Terima kasih, PO. Trevel Wisata Nusantara.',
  ].join('\n');

  window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

export default function ReservationManager({ bookings = [], fleet = [], onUpdate, onDelete, readOnly = false }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [busFilter, setBusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ field: 'startDate', dir: 'desc' });
  const [selectedId, setSelectedId] = useState(null);
  const [printOnOpen, setPrintOnOpen] = useState(false);

  const counts = useMemo(() => {
    const c = { all: bookings.length };
    BOOKING_STATUSES.forEach((s) => { c[s] = bookings.filter((b) => b.status === s).length; });
    return c;
  }, [bookings]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings
      .filter((b) => statusFilter === 'all' || b.status === statusFilter)
      .filter((b) => busFilter === 'all' || b.busId === busFilter)
      .filter((b) => !q || [b.bookingCode, b.partnerName, b.destination, b.picName, b.picPhone].some((v) => String(v || '').toLowerCase().includes(q)))
      .sort((a, b) => {
        const av = a[sort.field]; const bv = b[sort.field];
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sort.dir === 'asc' ? cmp : -cmp;
      });
  }, [bookings, statusFilter, busFilter, query, sort]);

  const selected = bookings.find((b) => b.id === selectedId) || null;
  const totalShown = rows.reduce((a, b) => a + Number(b.dealPrice || 0), 0);

  const toggleSort = (field) => setSort((s) => ({ field, dir: s.field === field && s.dir === 'desc' ? 'asc' : 'desc' }));

  const tabs = [['all', 'Semua'], ...BOOKING_STATUSES.map((s) => [s, s])];

  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-obsidian tracking-tight">Manajemen Reservasi</h1>
          <p className="text-sm text-caption">Periksa detail reservasi dan terbitkan Surat Jalan.</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase font-bold tracking-wider text-caption">Nilai {rows.length} pesanan tampil</div>
          <div className="font-mono font-extrabold text-xl text-obsidian">{formatIDR(totalShown)}</div>
        </div>
      </div>

      {readOnly && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900">
          Endpoint Apps Script saat ini hanya mendukung baca dan tambah reservasi. Ubah status, harga, catatan, dan hapus belum tersedia.
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-surface rounded-2xl border border-slate-200/90 shadow-subtle p-3 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex gap-1 overflow-x-auto bg-slate-100/80 p-1 rounded-xl">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                statusFilter === key ? 'bg-white shadow-sm text-obsidian' : 'text-slate-500 hover:text-obsidian'
              }`}
            >
              {label}
              <span className={`text-[10px] font-mono px-1.5 rounded ${statusFilter === key ? 'bg-cobalt/10 text-cobalt' : 'bg-slate-200 text-slate-500'}`}>{counts[key] || 0}</span>
            </button>
          ))}
        </div>
        <select
          value={busFilter}
          onChange={(e) => setBusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
        >
          <option value="all">Semua Armada</option>
          {fleet.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kode, mitra, tujuan, PIC, telepon..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cobalt"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-3xl border border-slate-200/90 shadow-tactile overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-caption">
              <tr>
                <th className="text-left px-5 py-3 font-bold">Kode / Sumber</th>
                <th className="text-left px-3 py-3 font-bold">Pemesan</th>
                <th className="text-left px-3 py-3 font-bold">Armada</th>
                <th className="text-left px-3 py-3 font-bold">
                  <button onClick={() => toggleSort('startDate')} className="flex items-center gap-1 uppercase">Jadwal <ArrowUpDown className="w-3 h-3" /></button>
                </th>
                <th className="text-right px-3 py-3 font-bold">
                  <button onClick={() => toggleSort('dealPrice')} className="flex items-center gap-1 ml-auto uppercase">Harga <ArrowUpDown className="w-3 h-3" /></button>
                </th>
                <th className="text-left px-3 py-3 font-bold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && (
                <tr><td colSpan={7} className="py-14 text-center text-slate-400 font-semibold">Tidak ada reservasi yang cocok dengan filter.</td></tr>
              )}
              {rows.map((b) => {
                const bus = fleet.find((f) => f.id === b.busId);
                return (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedId(b.id)}
                    className={`cursor-pointer hover:bg-blue-50/40 transition-colors ${selectedId === b.id ? 'bg-blue-50/60' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <div className="font-mono font-bold text-cobalt">{b.bookingCode}</div>
                      <div className="text-[10px] text-caption flex items-center gap-1 mt-0.5">
                        {b.source === 'publik' ? <Globe className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
                        {b.source === 'publik' ? 'Situs publik' : 'Input admin'}
                      </div>
                    </td>
                    <td className="px-3 py-3 max-w-[220px]">
                      <div className="font-bold text-obsidian truncate">{b.partnerName}</div>
                      <div className="text-[11px] text-caption truncate">{b.destination}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <span className="w-2 h-2 rounded-full" style={{ background: bus?.colorHex }} />
                        {b.busName}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-semibold text-obsidian">{formatDateRangeIndo(b.startDate, b.endDate)}</div>
                      <div className="text-[10px] text-caption">{b.passengers} pax</div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-obsidian whitespace-nowrap">{formatIDR(b.dealPrice)}</td>
                    <td className="px-3 py-3"><StatusPill status={b.status} /></td>
                    <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => openBookingWhatsApp(b)}
                        title="Buka WhatsApp PIC dengan detail reservasi"
                        aria-label={`Buka WhatsApp untuk reservasi ${b.bookingCode}`}
                        disabled={!b.picPhone}
                        className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPrintOnOpen(true); setSelectedId(b.id); }}
                        title="Cetak nota reservasi"
                        aria-label={`Cetak nota reservasi ${b.bookingCode}`}
                        className="p-2 rounded-lg text-slate-500 hover:text-cobalt hover:bg-blue-50 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {!readOnly && b.status === 'Menunggu Konfirmasi' && (
                        <button
                          onClick={() => onUpdate(b.id, { status: 'Terkonfirmasi' }).then(() => toast.success(`${b.bookingCode} dikonfirmasi.`)).catch(() => {})}
                          className="px-2.5 py-1.5 rounded-lg bg-terminal hover:bg-terminal-dark text-white text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Konfirmasi
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <BookingDrawer
            key={selected.id}
            booking={selected}
            fleet={fleet}
            onClose={() => { setSelectedId(null); setPrintOnOpen(false); }}
            onUpdate={onUpdate}
            onDelete={(id) => { onDelete(id); setSelectedId(null); }}
            readOnly={readOnly}
            autoPrint={printOnOpen}
            onAutoPrintComplete={setPrintOnOpen}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BookingDrawer({ booking: b, fleet, onClose, onUpdate, onDelete, readOnly, autoPrint, onAutoPrintComplete }) {
  const [price, setPrice] = useState(b.dealPrice);
  const [adminNotes, setAdminNotes] = useState(b.adminNotes || '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ticketRef = useRef(null);
  const bus = fleet.find((f) => f.id === b.busId);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!autoPrint) return undefined;
    const frame = window.requestAnimationFrame(() => {
      printElement(ticketRef.current?.querySelector('.print-ticket-root'));
      onAutoPrintComplete(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [autoPrint, onAutoPrintComplete]);

  const dirty = Number(price) !== Number(b.dealPrice) || adminNotes !== (b.adminNotes || '');

  const save = async (updates, msg) => {
    setSaving(true);
    try {
      await onUpdate(b.id, updates);
      toast.success(msg);
    } catch { /* toast ditangani parent */ } finally {
      setSaving(false);
    }
  };

  const actions = [
    { status: 'Terkonfirmasi', label: 'Konfirmasi', icon: Check, cls: 'bg-terminal hover:bg-terminal-dark text-white' },
    { status: 'Selesai', label: 'Tandai Selesai', icon: Flag, cls: 'bg-obsidian hover:bg-obsidian-light text-white' },
    { status: 'Dibatalkan', label: 'Batalkan', icon: Ban, cls: 'bg-white border border-rose-200 text-alert hover:bg-alert-subtle' },
    { status: 'Menunggu Konfirmasi', label: 'Kembalikan ke Antrean', icon: CalendarDays, cls: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' },
  ].filter((a) => a.status !== b.status);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-obsidian/40 backdrop-blur-sm z-40 no-print"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-canvas z-50 shadow-2xl overflow-y-auto"
      >
        <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-center justify-between no-print">
          <div>
            <div className="font-mono text-xs font-bold text-cobalt">{b.bookingCode}</div>
            <div className="font-display font-extrabold text-lg text-obsidian">{b.partnerName}</div>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill status={b.status} />
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Aksi status */}
          {!readOnly && <div className="flex flex-wrap gap-2 no-print">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.status}
                  disabled={saving}
                  onClick={() => save({ status: a.status }, `Status diubah menjadi ${a.status}.`)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 ${a.cls}`}
                >
                  <Icon className="w-3.5 h-3.5" /> {a.label}
                </button>
              );
            })}
          </div>}

          {/* Detail */}
          <div className="grid grid-cols-2 gap-3 text-xs no-print">
            {[
              [MapPin, 'Tujuan', b.destination],
              [CalendarDays, 'Jadwal', formatDateRangeIndo(b.startDate, b.endDate)],
              [Users, 'Penumpang', `${b.passengers} / ${bus?.capacity || 33} kursi`],
              [UserCog, 'PIC', b.picName || '-'],
              [Phone, 'Telepon', b.picPhone || '-'],
              [Mail, 'Email', b.picEmail || '-'],
            ].map(([Icon, label, value]) => (
              <div key={label} className="p-3 rounded-xl bg-surface border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-caption flex items-center gap-1"><Icon className="w-3 h-3" />{label}</div>
                <div className="font-semibold text-obsidian mt-0.5 break-words">{value}</div>
              </div>
            ))}
          </div>

          {b.notes && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 no-print">
              <div className="font-bold uppercase text-[10px] mb-0.5">Catatan pelanggan</div>
              {b.notes}
            </div>
          )}

          {/* Harga & catatan admin */}
          <div className="p-4 rounded-2xl bg-surface border border-slate-200 space-y-3 no-print">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-obsidian">Harga Kesepakatan Final</div>
                <div className="text-[10px] text-caption">
                  Sewa {b.days} × {formatIDR(b.baseRate)} + BBM/tol {formatIDR(b.tollFuelEstimate)}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-cobalt font-mono font-bold text-xs">Rp</span>
                <input
                  type="number"
                  step="50000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={readOnly}
                  className="w-36 px-3 py-2 rounded-xl border-2 border-cobalt font-mono font-extrabold text-sm text-cobalt text-right"
                />
              </div>
            </div>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase font-bold text-caption flex items-center gap-1"><StickyNote className="w-3 h-3" />Catatan internal (tidak terlihat pelanggan)</span>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                disabled={readOnly}
                placeholder="Contoh: DP 30% diterima 12 Nov, driver Pak Slamet."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </label>
            {!readOnly && <button
              disabled={!dirty || saving}
              onClick={() => save({ dealPrice: Number(price) || 0, adminNotes }, 'Perubahan reservasi tersimpan.')}
              className="w-full py-2.5 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Save className="w-3.5 h-3.5" /> Simpan Perubahan
            </button>}
          </div>

          {/* Bukti reservasi */}
          <div ref={ticketRef}>
          <TicketPreview
            formData={{
              ...b,
              durationDays: b.days,
              busCapacity: bus?.capacity || 33,
              dailyRate: b.baseRate,
              baseCost: b.days * b.baseRate,
              tollFuel: b.tollFuelEstimate,
            }}
            isConfirmed={b.status === 'Terkonfirmasi' || b.status === 'Selesai'}
            confirmedBookingCode={b.bookingCode}
            onPrint={() => printElement(ticketRef.current?.querySelector('.print-ticket-root'))}
          />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between no-print">
            <span className="text-[10px] text-caption font-mono">Dibuat {formatDateIndo(b.createdAt?.slice(0, 10))}</span>
            {readOnly ? null : confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-alert">Hapus permanen?</span>
                <button onClick={() => setConfirmDelete(false)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold">Batal</button>
                <button onClick={() => onDelete(b.id)} className="px-2.5 py-1.5 rounded-lg bg-alert text-white text-[11px] font-bold">Ya, hapus</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="text-[11px] font-bold text-slate-400 hover:text-alert flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Hapus reservasi
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
