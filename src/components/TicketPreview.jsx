import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Printer, 
  MapPin, 
  Calendar, 
  Bus, 
  Users, 
  Phone, 
  UserCheck, 
  FileText, 
  Sparkles,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import { formatIDR, formatDateRangeIndo, generateBarcodeBars } from '../utils';

export default function TicketPreview({ 
  formData, 
  isConfirmed = false, 
  confirmedBookingCode = null,
  onPrint = null,
  variant = 'admin'
}) {
  const isPublic = variant === 'public';
  const currentBookingCode = confirmedBookingCode || 'TRV-DRAFT-XXXX';
  const barcodeBars = generateBarcodeBars(currentBookingCode);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const occupancyPercent = Math.min(100, Math.round(((formData.passengers || 0) / (formData.busCapacity || 33)) * 100));

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cobalt" />
          <span className="text-xs font-bold uppercase tracking-wider text-obsidian">
            {isPublic ? 'Pratinjau Bukti Permintaan Reservasi' : 'Pratinjau Bukti Reservasi & Rincian Biaya'}
          </span>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-obsidian bg-white hover:bg-slate-50 text-obsidian text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Printer className="w-3.5 h-3.5 text-cobalt" />
          <span>{isPublic ? 'Cetak Bukti' : 'Cetak Nota'}</span>
        </button>
      </div>

      {/* Tactile Skeuomorphic Ticket Card */}
      <div className="ticket-container print-ticket-root bg-surface rounded-3xl border border-slate-300 shadow-ticket overflow-hidden transition-all duration-300 relative select-none">
        
        {/* Top Header Section */}
        <div className="p-6 bg-obsidian text-white relative">
          {/* Subtle noise/grid in header */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:12px_12px]" />
          
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-ticket-gold text-[10px] font-mono uppercase tracking-widest font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PO. TREVEL WISATA NUSANTARA</span>
              </div>
              <h3 className="text-xl font-display font-black tracking-tight text-white mt-0.5">
                {isPublic ? 'BUKTI PERMINTAAN RESERVASI' : 'BUKTI RESERVASI & RINCIAN BIAYA'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {isPublic ? 'Menunggu konfirmasi tim reservasi PO. Trevel' : 'Ringkasan pemesanan dan nilai sewa, bukan bukti pelunasan'}
              </p>
            </div>

            {/* Serial Booking Code */}
            <div className="text-right">
              <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider">
                KODE RESERVASI
              </span>
              <div className="text-sm font-mono font-bold text-ticket-gold tracking-wider">
                {currentBookingCode}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Upper Body (Partner & Route Info) */}
        <div className="p-6 space-y-5 bg-white relative">
          
          {/* Spring Slammed Rubber Stamp Animation */}
          <div className="absolute top-8 right-6 z-20 pointer-events-none">
            <AnimatePresence mode="wait">
              {isConfirmed ? (
                <motion.div
                  key="confirmed-stamp"
                  initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
                  animate={{ scale: 1, opacity: 1, rotate: -8 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 400, 
                    damping: 14,
                    mass: 0.8
                  }}
                  className={`stamp-badge ${isPublic ? 'stamp-draft' : 'stamp-confirmed'}`}
                >
                  <div className="text-center">
                    <div className="text-[12px] font-black tracking-widest leading-none">
                      {isPublic ? 'TERKIRIM' : 'TERKONFIRMASI'}
                    </div>
                    <div className="text-[9px] font-mono tracking-tight opacity-90 mt-0.5">
                      RESERVED #{currentBookingCode.slice(-4)}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="draft-stamp"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1, rotate: -8 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="stamp-badge stamp-draft"
                >
                  <div className="text-center">
                    <div className="text-[12px] font-black tracking-widest leading-none">
                      DRAFT RESERVASI
                    </div>
                    <div className="text-[8px] font-mono tracking-tight opacity-85 mt-0.5">
                      MENUNGGU TERBIT
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Partner & PIC Details */}
          <div className="grid grid-cols-2 gap-4 text-xs pr-20">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-caption block">
                Biro Penyewa / Rekanan:
              </span>
              <div className="font-display font-bold text-sm text-obsidian mt-0.5">
                {formData.partnerName || 'Belum dipilih'}
              </div>
              <div className="text-slate-600 text-[11px] flex items-center gap-1 mt-0.5">
                <UserCheck className="w-3 h-3 text-slate-400" />
                <span>PIC: {formData.picName || '-'}</span>
              </div>
              <div className="text-slate-600 text-[11px] flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{formData.picPhone || '-'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-caption block">
                Armada Bus Ditugaskan:
              </span>
              <div className="font-display font-bold text-sm text-cobalt mt-0.5 flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5" />
                <span>{formData.busName || 'Zotopia'}</span>
              </div>
              <div className="font-mono text-[11px] text-slate-700 font-semibold">
                Plat: {formData.plateNumber || 'N 7122 UZ'}
              </div>
              <div className="text-[11px] text-slate-500">
                Kapasitas: {formData.busCapacity || 33} Kursi Eksekutif
              </div>
            </div>
          </div>

          {/* Route & Schedule Dates */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-caption block">
                  Rute & Destinasi Wisata:
                </span>
                <span className="text-xs sm:text-sm font-display font-bold text-obsidian">
                  {formData.destination || 'Belum diisi'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-cobalt" />
                <span className="font-medium">
                  {formatDateRangeIndo(formData.startDate, formData.endDate)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-700">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono font-semibold">
                  {formData.passengers || 0} Pax ({occupancyPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Notes if present */}
          {formData.notes && (
            <div className="text-[11px] text-slate-600 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
              Catatan Khusus: "{formData.notes}"
            </div>
          )}

        </div>

        {/* Perforated Tear-off Line with Radial Notches */}
        <div className="relative py-2 bg-white">
          <div className="ticket-notch-left" />
          <div className="ticket-notch-right" />
          <div className="ticket-perforation" />
        </div>

        {/* Ticket Lower Body (Financial Breakdown & Barcode) */}
        <div className="p-6 bg-slate-50/90 space-y-4">
          
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Tarif Pokok ({formData.durationDays || 1} Hari x {formatIDR(formData.dailyRate || 3500000)}):</span>
              <span className="font-mono font-medium">{formatIDR(formData.baseCost || 3500000)}</span>
            </div>
            
            {Number(formData.tollFuel) > 0 && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Taksiran BBM & Tol Operasional:</span>
                <span className="font-mono font-medium">{formatIDR(formData.tollFuel)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm">
              <span className="text-obsidian font-display uppercase tracking-wider">
                Total Kesepakatan Sewa:
              </span>
              <span className="font-mono text-base text-cobalt font-extrabold tabular-nums">
                {formatIDR(formData.dealPrice || formData.baseCost || 3500000)}
              </span>
            </div>
          </div>

          {/* Barcode SVG Container */}
          <div className="pt-3 border-t border-slate-200 flex flex-col items-center justify-center space-y-1">
            <div className="h-12 w-full max-w-[280px] flex items-center justify-center gap-0.5 px-2 bg-white rounded-lg border border-slate-200 py-1.5">
              {barcodeBars.map((bar, i) => (
                <div
                  key={i}
                  style={{
                    width: `${bar.width}px`,
                    backgroundColor: bar.isBlack ? '#0B132B' : 'transparent',
                    height: '100%'
                  }}
                />
              ))}
            </div>
            <div className="font-mono text-[10px] tracking-widest text-slate-500 font-semibold">
              *{currentBookingCode}*
            </div>
          </div>

          {/* Security & Validation footer */}
          <div className="text-center text-[10px] text-slate-400">
            Validasi sistem otomatis PO. Trevel Wisata Nusantara • Bebas Pungutan Liar
          </div>

        </div>

      </div>
    </div>
  );
}
