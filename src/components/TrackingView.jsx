import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Printer, 
  MessageCircle, 
  RefreshCw,
  Calendar, 
  MapPin, 
  Bus, 
  User, 
  Phone, 
  DollarSign, 
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import TicketPreview from './TicketPreview';
import { trackPublicBooking } from '../api';
import { useCompanySettings } from '../data/catalog';
import { formatIDR, formatDateRangeIndo } from '../utils';

export default function TrackingView({ initialTrackingToken = '', onGoToBooking = null }) {
  const company = useCompanySettings();
  const [searchToken, setSearchToken] = useState(initialTrackingToken);
  const [activeToken, setActiveToken] = useState(initialTrackingToken);

  useEffect(() => {
    if (initialTrackingToken) {
      setSearchToken(initialTrackingToken);
      setActiveToken(initialTrackingToken);
    }
  }, [initialTrackingToken]);

  const { data: booking, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['trackBooking', activeToken],
    queryFn: () => trackPublicBooking(activeToken),
    enabled: Boolean(activeToken && activeToken.trim()),
    staleTime: 10_000,
    retry: 1,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const clean = searchToken.trim();
    if (!clean) {
      toast.error('Tempel token dari tautan pelacakan terlebih dahulu.');
      return;
    }
    setActiveToken(clean);
  };

  const handleWhatsAppChat = () => {
    if (!booking) return;
    const text = `Halo Admin ${company.name}, saya ingin menanyakan status pesanan dengan Kode Booking: *${booking.bookingCode}* atas nama *${booking.partnerName}* (PIC: ${booking.picName}).`;
    window.open(`https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('menunggu')) {
      return {
        label: 'Menunggu Konfirmasi',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: Clock,
        desc: 'Permintaan Anda telah tercatat di sistem kami dan sedang dalam antrean verifikasi oleh tim reservasi.',
      };
    }
    if (s.includes('selesai')) {
      return {
        label: 'Selesai',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: CheckCircle2,
        desc: 'Perjalanan pariwisata telah selesai dilaksanakan.',
      };
    }
    if (s.includes('batal')) {
      return {
        label: 'Dibatalkan',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircle,
        desc: 'Jadwal pemesanan ini telah dibatalkan.',
      };
    }
    return {
      label: 'Terkonfirmasi',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
      desc: 'Pesanan resmi terkonfirmasi! Jadwal dan armada terkunci, Surat Jalan & Tiket siap jalan.',
    };
  };

  const statusInfo = booking ? getStatusBadge(booking.status) : null;
  const StatusIcon = statusInfo ? statusInfo.icon : null;

  return (
    <div className="py-6 space-y-8 pb-24">
      {/* Header */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt/10 text-cobalt text-xs font-bold uppercase tracking-widest">
          <FileText className="w-3.5 h-3.5" />
          <span>Peninjauan & Pelacakan Status Pesanan</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-obsidian tracking-tight">
          Lacak Reservasi & Bukti Transaksi
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Gunakan tautan rahasia yang diterima setelah memesan untuk melihat status terbaru. Siapa pun yang memiliki tautan dapat melihat ringkasan reservasi, jadi jangan bagikan ke publik.
        </p>

        {/* Input Box Token Pelacakan */}
        <form onSubmit={handleSearch} className="pt-4 flex flex-col sm:flex-row items-center gap-2 max-w-lg mx-auto">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              placeholder="Tempel token pelacakan dari tautan"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-obsidian text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white text-sm font-bold uppercase tracking-wider transition-all shadow-md shadow-cobalt/20 flex items-center justify-center gap-2 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Lacak</span>
          </button>
        </form>
      </div>

      {/* State Loading */}
      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-9 h-9 border-[3px] border-cobalt border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono font-semibold text-slate-500">Memeriksa tautan pelacakan...</p>
        </div>
      )}

      {/* State Error / Not Found */}
      {isError && !isLoading && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="font-display font-bold text-obsidian text-base">Pesanan Tidak Ditemukan</h3>
          <p className="text-xs text-slate-600">
            {error?.message || 'Tautan pelacakan tidak valid atau sudah tidak berlaku.'}
          </p>
          <p className="text-[11px] text-slate-500">
            Pastikan tautan dibuka secara utuh atau hubungi hotline kami melalui WhatsApp di{' '}
            <a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer" className="text-cobalt font-semibold underline">
              {company.whatsappDisplay || company.whatsapp}
            </a>.
          </p>
        </div>
      )}

      {/* State Belum Mengisi Token */}
      {!activeToken && !isLoading && (
        <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-cobalt flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-obsidian text-lg">Punya Tautan Pelacakan?</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Buka tautan rahasia yang disertakan pada pesan konfirmasi, atau tempel tokennya di kolom pencarian. Kode booking saja tidak cukup untuk mengakses data.
          </p>
          {onGoToBooking && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onGoToBooking}
                className="text-xs text-cobalt font-bold underline hover:text-cobalt-hover"
              >
                Atau buat reservasi bus baru →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tampilan Hasil Booking */}
      {booking && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          {/* Kolom Kiri: Detail & Aksi (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Kartu Status Utama */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    KODE RESERVASI
                  </span>
                  <span className="font-mono font-extrabold text-2xl text-cobalt tracking-wider">
                    {booking.bookingCode}
                  </span>
                </div>

                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${statusInfo.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span>{statusInfo.label}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {statusInfo.desc}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleWhatsAppChat}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Konfirmasi via WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                  <span>Perbarui Status</span>
                </button>
              </div>
            </div>

            {/* Rincian Perjalanan */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-obsidian flex items-center gap-2">
                <Bus className="w-4 h-4 text-cobalt" />
                <span>Rincian Reservasi & Pemesan</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Biro / Pemesan</span>
                  <div className="font-bold text-obsidian text-sm">{booking.partnerName || '-'}</div>
                  <div className="text-slate-500">PIC: {booking.picName || '-'} ({booking.picPhone || '-'})</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Unit Armada</span>
                  <div className="font-bold text-cobalt text-sm">{booking.busName || '-'}</div>
                  <div className="font-mono text-slate-600">Plat: {booking.plateNumber || '-'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Jadwal Perjalanan</span>
                  <div className="font-semibold text-obsidian">{formatDateRangeIndo(booking.startDate, booking.endDate)}</div>
                  <div className="text-slate-500">Durasi: {booking.durationDays || 1} Hari Sewa</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Rute / Tujuan Wisata</span>
                  <div className="font-semibold text-obsidian">{booking.destination || '-'}</div>
                  <div className="text-slate-500">Kapasitas: {booking.passengers || 0} Penumpang (Pax)</div>
                </div>
              </div>

              {booking.notes && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-slate-700 italic">
                  <strong>Catatan Pemesan:</strong> "{booking.notes}"
                </div>
              )}

              {/* Total Biaya */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Kesepakatan / Estimasi</span>
                  <span className="text-xs text-slate-500">Dapat disesuaikan sesuai rute</span>
                </div>
                <div className="font-mono font-extrabold text-xl text-cobalt">
                  {formatIDR(booking.dealPrice || booking.baseCost || 0)}
                </div>
              </div>
            </div>

          </div>

          {/* Kolom Kanan: Pratinjau Tiket & Surat Jalan Resmi (5/12) */}
          <div className="lg:col-span-5 space-y-4">
            <TicketPreview
              formData={{
                ...booking,
                busCapacity: 33,
              }}
              isConfirmed={booking.status === 'Terkonfirmasi'}
              confirmedBookingCode={booking.bookingCode}
              variant="public"
            />
          </div>
        </div>
      )}
    </div>
  );
}
