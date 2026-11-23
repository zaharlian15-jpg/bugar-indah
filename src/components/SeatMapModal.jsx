import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Armchair, Check, DoorOpen, X } from 'lucide-react';

const seatNumber = (number) => String(number).padStart(2, '0');

export default function SeatMapModal({ isOpen, onClose, bus, onSelectBusForBooking }) {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const capacity = Math.max(1, Math.floor(Number(bus?.capacity) || 33));
  const frontSeats = Array.from({ length: Math.min(2, capacity) }, (_, index) => seatNumber(index + 1));
  const rearCount = Math.min(5, Math.max(0, capacity - frontSeats.length));
  const middleCount = capacity - frontSeats.length - rearCount;
  const middleSeats = Array.from({ length: middleCount }, (_, index) => seatNumber(frontSeats.length + index + 1));
  const middleRows = Array.from({ length: Math.ceil(middleSeats.length / 4) }, (_, index) => middleSeats.slice(index * 4, index * 4 + 4));
  const rearSeats = Array.from({ length: rearCount }, (_, index) => seatNumber(frontSeats.length + middleCount + index + 1));

  useEffect(() => {
    setSelectedSeat(null);
  }, [bus?.id, capacity, isOpen]);

  if (!isOpen || !bus) return null;

  const renderSeat = (seat) => (
    <button
      key={seat}
      type="button"
      onClick={() => setSelectedSeat(seat)}
      aria-label={`Pilih kursi ${seat}`}
      aria-pressed={selectedSeat === seat}
      className={`group flex h-[50px] min-w-0 flex-col items-center justify-between rounded-lg border p-1 shadow-[0_3px_0_0_rgba(15,38,48,0.28)] transition-all active:translate-y-[2px] active:shadow-none ${
        selectedSeat === seat
          ? 'border-[#f2b84b] bg-[#f2b84b] text-[#17343a] shadow-[0_3px_0_0_rgba(147,92,25,0.35)]'
          : 'border-[#245a62] bg-[#347c78] text-white hover:bg-[#286a68]'
      }`}
    >
      <span className={`h-2 w-3/4 rounded-t-md border ${selectedSeat === seat ? 'border-[#e5a839] bg-[#ffd77d]' : 'border-[#63a69d] bg-[#67aaa0]'}`} />
      <span className="flex h-7 w-full items-center justify-center rounded-md bg-black/10 text-xs font-extrabold leading-none">{seat}</span>
    </button>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6">
        <motion.button
          type="button"
          aria-label="Tutup denah kursi"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/55"
        />

        <motion.section
          role="dialog"
          aria-modal="true"
          aria-labelledby="seat-map-title"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="relative z-10 my-6 w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-cobalt">Denah tempat duduk</p>
              <h2 id="seat-map-title" className="mt-1 truncate font-display text-xl font-extrabold text-obsidian">
                {bus.name} <span className="font-mono text-sm font-semibold text-slate-500">{bus.plateNumber}</span>
              </h2>
              <p className="mt-1 text-xs text-slate-600">{capacity} kursi • Susunan kursi tengah 2–2 dengan bangku belakang hingga 5 kursi</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-md p-2 text-slate-600 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="grid max-h-[72vh] grid-cols-1 gap-5 overflow-y-auto p-4 sm:p-6 md:grid-cols-[minmax(0,1fr)_190px]">
            <div className="mx-auto w-full max-w-[390px] rounded-[2.4rem] border-[5px] border-[#203e46] bg-[#f3f5ef] p-3 shadow-[inset_0_0_0_2px_#b8c9bc] sm:p-4">
              <div className="mb-2 text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#31545a]">Depan</div>
              <div className="relative mb-4 overflow-hidden rounded-t-[2rem] border border-[#527b7b] bg-[#dbe9df] px-3 pb-3 pt-2">
                <div className="absolute inset-x-4 top-2 h-6 rounded-t-2xl bg-[#94bac0]" />
                <div className="relative flex items-center justify-between pt-7">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md border-2 border-dashed border-[#668a83] bg-[#eef4e9] text-[#31545a]">
                    <DoorOpen className="h-4 w-4" />
                    <span className="text-[8px] font-extrabold uppercase">Pintu</span>
                  </div>
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md border border-[#668a83] bg-[#dbe9df] text-[#31545a]">
                    <Armchair className="h-4 w-4" />
                    <span className="text-[7px] font-extrabold uppercase">Kernet</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-md bg-[#34565d] px-2 py-1.5 text-white">
                    <span className="rounded-sm bg-[#8dd5c0] px-2 py-1 text-[9px] font-extrabold text-[#17343a]">TV</span>
                    <span className="text-[7px] font-bold uppercase">Dashboard</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div aria-label="Setir sopir" className="relative flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#34565d]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#34565d]" />
                      <span className="absolute left-1/2 top-1/2 h-3 w-[2px] -translate-x-1/2 -translate-y-[90%] bg-[#34565d]" />
                      <span className="absolute left-1/2 top-1/2 h-[2px] w-3 -translate-x-1/2 translate-y-[2px] bg-[#34565d]" />
                    </div>
                    <span className="text-[8px] font-extrabold uppercase text-[#31545a]">Sopir</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="grid grid-cols-[1fr_1fr_24px_1fr_1fr] items-center gap-1.5 px-1">
                  {frontSeats.map(renderSeat)}
                  {Array.from({ length: 2 - frontSeats.length }, (_, index) => <span key={`front-left-${index}`} aria-hidden="true" />)}
                  <span aria-hidden="true" />
                  {Array.from({ length: 2 }, (_, index) => <span key={`front-right-${index}`} aria-hidden="true" />)}
                </div>
                {middleRows.map((rowSeats, rowIndex) => {
                  const leftCount = Math.max(0, rowSeats.length - 2);
                  const leftSeats = rowSeats.slice(0, leftCount);
                  const rightSeats = rowSeats.slice(leftCount);
                  return (
                    <div key={rowIndex} className="grid grid-cols-[1fr_1fr_24px_1fr_1fr] items-center gap-1.5 px-1">
                      {leftSeats.map(renderSeat)}
                      {Array.from({ length: 2 - leftSeats.length }, (_, index) => <span key={`left-${index}`} aria-hidden="true" />)}
                      <span aria-hidden="true" className="h-full border-x border-dashed border-[#c6d1c7]" />
                      {rightSeats.map(renderSeat)}
                      {Array.from({ length: 2 - rightSeats.length }, (_, index) => <span key={`right-${index}`} aria-hidden="true" />)}
                    </div>
                  );
                })}
              </div>

              {rearSeats.length > 0 && (
                <div className="my-4 border-t-2 border-[#b8c9bc] pt-3">
                  <div className="mb-2 text-center text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#49666a]">Bangku belakang</div>
                  <div className="grid grid-cols-5 gap-1.5">{rearSeats.map(renderSeat)}</div>
                </div>
              )}
              <div className="rounded-b-xl bg-[#203e46] px-3 py-1.5 text-center text-[9px] font-extrabold uppercase tracking-[0.2em] text-white">Belakang bus</div>
            </div>

            <aside className="space-y-4 text-sm">
              <div className="space-y-2 border-b border-slate-200 pb-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Keterangan</h3>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="h-5 w-5 rounded-md border border-[#245a62] bg-[#347c78]" /> Kursi penumpang
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="h-5 w-5 rounded-md border border-[#e5a839] bg-[#f2b84b]" /> Kursi dipilih
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                {selectedSeat ? (
                  <span className="font-semibold text-obsidian">Kursi {selectedSeat} dipilih.</span>
                ) : (
                  'Pilih nomor kursi untuk menandainya pada denah.'
                )}
                <p className="mt-2 text-[11px]">Denah ini menunjukkan susunan kursi bus.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Armchair className="h-4 w-4 text-emerald-700" /> Total {capacity} kursi penumpang
              </div>
            </aside>
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-white">Tutup denah</button>
            <button
              type="button"
              onClick={() => { onClose(); onSelectBusForBooking(bus.id); }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-cobalt px-4 py-2.5 text-xs font-bold text-white hover:bg-cobalt-hover"
            >
              <Check className="h-4 w-4" /> Pilih bus ini
            </button>
          </footer>
        </motion.section>
      </div>
    </AnimatePresence>
  );
}
