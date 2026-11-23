import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isWithinInterval, 
  parseISO,
  isBefore,
  isAfter
} from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, AlertCircle, Info, Calendar as CalendarIcon, Check } from 'lucide-react';
import { isDateBookedForBus, checkRangeCollision, formatDateIndo } from '../utils';

export default function RangeCalendar({ 
  selectedBusId, 
  selectedBusName,
  startDate, 
  endDate, 
  onChangeRange, 
  bookings = [],
  disablePast = false
}) {
  // Start with default view month (October 2026 based on demo context, or current month)
  const initialMonth = startDate ? parseISO(startDate) : new Date();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [hoverDate, setHoverDate] = useState(null);
  const [collisionWarning, setCollisionWarning] = useState(null);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDateCalendar = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDateCalendar = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDateCalendar,
    end: endDateCalendar
  });

  const weekDayHeaders = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const handleDayClick = (day) => {
    setCollisionWarning(null);
    const dateStr = format(day, 'yyyy-MM-dd');
    
    // Check if clicked date is already booked
    if (disablePast && dateStr < todayStr) return;
    const conflict = isDateBookedForBus(dateStr, selectedBusId, bookings);
    if (conflict) {
      setCollisionWarning(conflict.partnerName
        ? `Bus ini sudah dipesan oleh ${conflict.partnerName} (${conflict.bookingCode}) pada tanggal ini.`
        : 'Bus ini sudah terisi jadwal pada tanggal ini. Silakan pilih tanggal lain.');
      return;
    }

    if (!startDate || (startDate && endDate)) {
      // Step 1: Click start date
      onChangeRange(dateStr, '');
    } else if (startDate && !endDate) {
      // Step 2: Click end date
      const startParsed = parseISO(startDate);
      
      if (isBefore(day, startParsed)) {
        // If user clicked earlier date, set this as new start date
        onChangeRange(dateStr, '');
        return;
      }

      // Check if range [startDate, dateStr] crosses any booked dates
      const { hasCollision, conflict } = checkRangeCollision(startDate, dateStr, selectedBusId, bookings);
      
      if (hasCollision) {
        setCollisionWarning(`Rentang tanggal melompati jadwal terisi${conflict.partnerName ? `: ${conflict.partnerName}` : ''} (${formatDateIndo(conflict.startDate)} s/d ${formatDateIndo(conflict.endDate)})`);
        return;
      }

      onChangeRange(startDate, dateStr);
    }
  };

  const handleDayMouseEnter = (day) => {
    if (startDate && !endDate) {
      setHoverDate(day);
    }
  };

  const handleMouseLeave = () => {
    setHoverDate(null);
  };

  const resetSelection = () => {
    onChangeRange('', '');
    setCollisionWarning(null);
  };

  return (
    <div className="bg-surface rounded-2xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
      
      {/* Calendar Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-caption block">
            Jadwal Operasional Armada
          </span>
          <h4 className="text-base font-display font-bold text-obsidian capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </h4>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collision Warning Message */}
      {collisionWarning && (
        <div className="p-3 rounded-xl bg-alert-subtle border border-alert-light text-alert text-xs flex items-start gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold block">Peringatan Jadwal Bentrok!</strong>
            <span>{collisionWarning}</span>
          </div>
          <button 
            type="button"
            onClick={() => setCollisionWarning(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Day of week headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDayHeaders.map((header, i) => (
          <div key={i} className="text-[11px] font-semibold text-slate-400 py-1">
            {header}
          </div>
        ))}
      </div>

      {/* Calendar Days Matrix */}
      <div 
        className="grid grid-cols-7 gap-1"
        onMouseLeave={handleMouseLeave}
      >
        {calendarDays.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const conflict = isDateBookedForBus(dateStr, selectedBusId, bookings);
          const isPast = disablePast && dateStr < todayStr;
          const isConflict = Boolean(conflict) || isPast;

          const startParsed = startDate ? parseISO(startDate) : null;
          const endParsed = endDate ? parseISO(endDate) : null;

          const isStart = startParsed && isSameDay(day, startParsed);
          const isEnd = endParsed && isSameDay(day, endParsed);

          // Range highlight check
          let isInRange = false;
          if (startParsed && endParsed) {
            isInRange = isWithinInterval(day, { start: startParsed, end: endParsed });
          } else if (startParsed && !endParsed && hoverDate) {
            const rangeStart = isBefore(startParsed, hoverDate) ? startParsed : hoverDate;
            const rangeEnd = isAfter(hoverDate, startParsed) ? hoverDate : startParsed;
            isInRange = isWithinInterval(day, { start: rangeStart, end: rangeEnd });
          }

          return (
            <div 
              key={idx} 
              className="relative group p-0.5"
            >
              <button
                type="button"
                disabled={isConflict}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => handleDayMouseEnter(day)}
                aria-disabled={isConflict}
                className={`w-full aspect-square rounded-xl text-xs font-medium transition-all flex flex-col items-center justify-center relative select-none ${
                  isPast
                    ? 'bg-transparent text-slate-300 cursor-not-allowed'
                    : isConflict
                    ? 'bg-rose-50 border border-rose-200/80 text-rose-400 line-through cursor-not-allowed'
                    : isStart || isEnd
                    ? 'bg-cobalt text-white font-bold shadow-md shadow-cobalt/30 scale-105 z-10'
                    : isInRange
                    ? 'bg-blue-100/70 text-cobalt font-semibold'
                    : isCurrentMonth
                    ? 'bg-slate-50 hover:bg-slate-100 text-obsidian border border-slate-100'
                    : 'bg-transparent text-slate-300 opacity-40'
                }`}
              >
                <span>{format(day, 'd')}</span>
                
                {/* Conflict Dot */}
                {conflict && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute bottom-1" />
                )}
              </button>

              {/* Tooltip on Hover for Booked Dates */}
              {isConflict && conflict && conflict.partnerName && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none w-48 p-2 rounded-xl bg-obsidian text-white text-[11px] shadow-ticket text-center">
                  <div className="font-bold text-ticket-gold">{conflict.partnerName}</div>
                  <div className="text-[10px] text-slate-300">Tujuan: {conflict.destination}</div>
                  <div className="text-[9px] font-mono text-slate-400 mt-0.5">{conflict.bookingCode}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Footnote & Action Helper */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300 inline-block line-through text-rose-500 text-[8px] text-center">✕</span>
            <span>Jadwal Terisi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cobalt inline-block" />
            <span>Pilihan Anda</span>
          </div>
        </div>

        {startDate && (
          <button
            type="button"
            onClick={resetSelection}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline"
          >
            Reset Rentang Tanggal
          </button>
        )}
      </div>

      {/* Selection Status Summary */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-cobalt" />
          <div>
            <span className="text-slate-500 text-[10px] block uppercase font-bold">Periode Sewa:</span>
            <span className="font-semibold text-obsidian">
              {startDate ? formatDateIndo(startDate) : 'Pilih Tanggal Mulai'}
              {' → '}
              {endDate ? formatDateIndo(endDate) : (startDate ? 'Pilih Tanggal Selesai' : '-')}
            </span>
          </div>
        </div>

        {startDate && endDate && (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Jadwal Tersedia</span>
          </span>
        )}
      </div>

    </div>
  );
}
