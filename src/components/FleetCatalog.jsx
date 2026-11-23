import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bus, 
  Check, 
  Armchair, 
  ShieldCheck, 
  Sparkles, 
  Tv, 
  Zap, 
  Wind, 
  Coffee, 
  Package, 
  ArrowRight,
  Info
} from 'lucide-react';
import { formatIDR } from '../utils';
import SeatMapModal from './SeatMapModal';

export default function FleetCatalog({ fleet = [], onSelectBusForBooking }) {
  const [activeModalBus, setActiveModalBus] = useState(null);

  return (
    <div className="space-y-10 py-6 pb-20">
      
      {/* Header Editorial */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt/10 text-cobalt text-xs font-bold uppercase tracking-widest">
          <Bus className="w-3.5 h-3.5" />
          <span>Armada Bus Pariwisata</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-obsidian tracking-tight">
          Katalog Armada & Spesifikasi Kabin Bus
        </h1>
        <p className="text-sm sm:text-base text-caption max-w-2xl leading-relaxed">
          Koleksi bus pariwisata eksekutif terbaru yang dikonfigurasi khusus untuk kenyamanan jarak jauh, 
          dilengkapi fasilitas premium dan denah kursi interaktif yang mengikuti kapasitas tiap armada.
        </p>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {fleet.map((bus) => (
          <div
            key={bus.id}
            className="bg-surface rounded-3xl border border-slate-200/90 shadow-tactile overflow-hidden flex flex-col justify-between group hover:border-slate-300 hover:shadow-lifted transition-all duration-300"
          >
            {/* Bus Image & Header Badge */}
            <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-900">
              <img
                src={bus.image}
                alt={bus.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
              
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {bus.status}
                </span>
                <span className="px-3 py-1 rounded-full bg-obsidian/80 text-white text-xs font-mono font-semibold backdrop-blur-md border border-white/20">
                  {bus.plateNumber}
                </span>
              </div>

              {/* Chassis & Body Info on Image Bottom */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-[11px] font-mono uppercase tracking-wider text-ticket-gold font-bold">
                  {bus.chassis}
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                  {bus.name}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                  {bus.bodyType}
                </p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-7 space-y-6 flex-1 flex flex-col justify-between">
              
              <div className="space-y-5">
                {/* Daily Price & Capacity Banner */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-caption block">
                      Tarif Sewa Harian
                    </span>
                    <div className="text-xl sm:text-2xl font-mono font-extrabold text-cobalt tabular-nums">
                      {formatIDR(bus.dailyRate)}
                      <span className="text-xs text-slate-500 font-normal"> / hari</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-caption block">
                      Kapasitas Kursi
                    </span>
                    <div className="text-base sm:text-lg font-display font-bold text-obsidian">
                      {bus.capacity} Seat Eksekutif
                    </div>
                  </div>
                </div>

                {/* Facilities List Grid */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-ticket-gold" />
                    <span>Fasilitas Standar Eksekutif</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {bus.facilities.map((fac, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-700"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium">{fac}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <button
                  type="button"
                  onClick={() => setActiveModalBus(bus)}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-obsidian bg-white hover:bg-slate-50 text-obsidian text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Armchair className="w-4 h-4 text-cobalt" />
                  <span>Pratinjau Denah Kursi ({bus.capacity} Kursi)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectBusForBooking(bus.id)}
                  className="w-full py-3.5 px-5 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-cobalt/20 flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[0px]"
                >
                  <span>Pilih Armada Ini & Buat Jadwal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Fleet Maintenance Note Card */}
      <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="font-bold font-display text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Garansi Kebersihan & Kesiapan Perjalanan</span>
          </div>
          <p className="text-amber-800">
            Setiap bus telah melalui proses pencucian interior uap panas, sanitasi AC ozon, dan pemeriksaan mesin oleh mekanik bersertifikat sebelum diberangkatkan.
          </p>
        </div>
        <div className="shrink-0 font-mono text-[11px] bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200 font-semibold text-amber-800">
          SOP KIR-BERKALA 2026
        </div>
      </div>

      {/* Interactive Seating Modal */}
      <SeatMapModal
        isOpen={Boolean(activeModalBus)}
        onClose={() => setActiveModalBus(null)}
        bus={activeModalBus}
        onSelectBusForBooking={(busId) => {
          setActiveModalBus(null);
          onSelectBusForBooking(busId);
        }}
      />

    </div>
  );
}
