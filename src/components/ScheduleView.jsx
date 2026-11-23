import React, { useState, useMemo } from 'react';
import { 
  format, 
  parseISO, 
  addDays, 
  isWithinInterval, 
  isSameDay, 
  compareAsc, 
  compareDesc,
  differenceInCalendarDays
} from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Search, 
  Filter, 
  Calendar, 
  Table as TableIcon, 
  ArrowUpDown, 
  Bus, 
  CheckCircle2, 
  Printer, 
  MapPin, 
  Clock, 
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { formatIDR, formatDateIndo, formatDateRangeIndo, isDateBookedForBus } from '../utils';

export default function ScheduleView({ 
  bookings = [], 
  fleet = [], 
  onViewTicket = null 
}) {
  const [viewMode, setViewMode] = useState('gantt'); // 'gantt' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFleetFilter, setSelectedFleetFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('date'); // 'date' | 'price'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'
  const [selectedGanttBooking, setSelectedGanttBooking] = useState(null);

  // Timeline 30 hari dimulai 3 hari sebelum hari ini
  const ganttStartBase = useMemo(() => addDays(new Date(new Date().setHours(0, 0, 0, 0)), -3), []);
  const ganttDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 30; i++) {
      days.push(addDays(ganttStartBase, i));
    }
    return days;
  }, [ganttStartBase]);

  // Filtered and Sorted Bookings for Data Grid
  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        (b.partnerName && b.partnerName.toLowerCase().includes(q)) ||
        (b.busName && b.busName.toLowerCase().includes(q)) ||
        (b.destination && b.destination.toLowerCase().includes(q)) ||
        (b.bookingCode && b.bookingCode.toLowerCase().includes(q)) ||
        (b.picName && b.picName.toLowerCase().includes(q))
      );
    }

    // Filter Fleet
    if (selectedFleetFilter !== 'all') {
      result = result.filter(b => b.busId === selectedFleetFilter || b.busName?.toLowerCase() === selectedFleetFilter.toLowerCase());
    }

    // Filter Status
    if (selectedStatusFilter !== 'all') {
      result = result.filter(b => b.status === selectedStatusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortField === 'date') {
        const dateA = parseISO(a.startDate);
        const dateB = parseISO(b.startDate);
        return sortDirection === 'asc' ? compareAsc(dateA, dateB) : compareDesc(dateA, dateB);
      }
      if (sortField === 'price') {
        const priceA = Number(a.dealPrice) || 0;
        const priceB = Number(b.dealPrice) || 0;
        return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
      }
      return 0;
    });

    return result;
  }, [bookings, searchQuery, selectedFleetFilter, selectedStatusFilter, sortField, sortDirection]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-8 py-6 pb-20">
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt/10 text-cobalt text-xs font-bold uppercase tracking-widest mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Master Fleet Schedule & Booking Register</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-obsidian tracking-tight">
            Jadwal Keberangkatan & Riwayat Reservasi
          </h1>
          <p className="text-sm text-caption max-w-xl">
            Monitoring utilisasi armada visual 30 hari ke depan serta manajemen data grid komprehensif seluruh pesanan perjalanan biro rekanan.
          </p>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-200/80 border border-slate-300/80 shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode('gantt')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'gantt'
                ? 'bg-white text-obsidian shadow-sm'
                : 'text-slate-600 hover:text-obsidian'
            }`}
          >
            <Calendar className="w-4 h-4 text-cobalt" />
            <span>Timeline Gantt (30 Hari)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'table'
                ? 'bg-white text-obsidian shadow-sm'
                : 'text-slate-600 hover:text-obsidian'
            }`}
          >
            <TableIcon className="w-4 h-4 text-cobalt" />
            <span>Data Grid ({bookings.length} Pesanan)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TIMELINE GANTT (VISUAL 30-DAY SCHEDULE) */}
      {viewMode === 'gantt' && (
        <div className="bg-surface rounded-3xl border border-slate-200/90 shadow-tactile p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-lg text-obsidian flex items-center gap-2">
                <span>Visual Utilisasi Armada 30 Hari</span>
                <span className="text-xs font-mono font-medium text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                  {format(ganttDays[0], 'd MMM yyyy', { locale: id })} – {format(ganttDays[29], 'd MMM yyyy', { locale: id })}
                </span>
              </h3>
              <p className="text-xs text-caption">
                Garis waktu status jalan (Dinas Aktif) dan siaga (Idle Depo). Klik pada blok warna untuk melihat ringkasan pesanan.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-cobalt inline-block" />
                <span>Zotopia Dinas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 inline-block" />
                <span>Cocomelon Dinas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-300 inline-block" />
                <span className="text-slate-500">Standby Garasi</span>
              </div>
            </div>
          </div>

          {/* Horizontal Scrollable Gantt Canvas */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[1000px] space-y-4">
              
              {/* Date Header Row */}
              <div className="grid grid-cols-[160px_repeat(30,1fr)] gap-1 text-center font-mono">
                <div className="text-left font-sans text-xs font-bold uppercase text-slate-400 py-1 pl-2">
                  Unit Armada
                </div>
                {ganttDays.map((day, idx) => {
                  const dayName = format(day, 'E', { locale: id });
                  const dayNum = format(day, 'd');
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div 
                      key={idx} 
                      className={`py-1 rounded-lg text-[10px] ${
                        isWeekend ? 'bg-amber-50 text-amber-900 font-bold' : 'bg-slate-100 text-slate-600 font-medium'
                      }`}
                    >
                      <div className="text-[9px] uppercase">{dayName}</div>
                      <div className="text-[11px] font-bold">{dayNum}</div>
                    </div>
                  );
                })}
              </div>

              {/* Rows for Each Bus */}
              {fleet.map((bus) => {
                const isZotopia = bus.id === 'zotopia';
                const busBookings = bookings.filter(b => b.busId === bus.id && b.status !== 'Dibatalkan');
                
                // Calculate total operational days in this 30 day window
                let activeDaysCount = 0;
                ganttDays.forEach(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  if (isDateBookedForBus(dateStr, bus.id, bookings)) {
                    activeDaysCount++;
                  }
                });

                return (
                  <div 
                    key={bus.id} 
                    className="grid grid-cols-[160px_repeat(30,1fr)] gap-1 items-center p-2 rounded-2xl bg-slate-50/70 border border-slate-200/80"
                  >
                    {/* Bus Sidebar Info */}
                    <div className="pr-3 border-r border-slate-200">
                      <div className="font-display font-extrabold text-sm text-obsidian flex items-center gap-1.5">
                        <Bus className={`w-4 h-4 ${isZotopia ? 'text-cobalt' : 'text-emerald-600'}`} />
                        <span>{bus.name}</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 font-semibold">
                        {bus.plateNumber}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-1 font-semibold">
                        Utilisasi: <span className="font-mono text-obsidian">{activeDaysCount}</span> / 30 Hari
                      </div>
                    </div>

                    {/* 30 Days Grid Blocks */}
                    {ganttDays.map((day, idx) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const trip = isDateBookedForBus(dateStr, bus.id, bookings);

                      if (trip) {
                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedGanttBooking(trip)}
                            title={`${trip.partnerName} - ${trip.destination}`}
                            className={`h-11 rounded-lg cursor-pointer transition-all flex items-center justify-center p-0.5 relative group ${
                              isZotopia 
                                ? 'bg-cobalt text-white hover:bg-cobalt-hover shadow-sm' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                            }`}
                          >
                            <span className="text-[9px] font-bold truncate px-1">
                              {trip.partnerName.split(' ')[0]}
                            </span>

                            {/* Floating Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none w-52 p-2.5 rounded-xl bg-obsidian text-white text-[11px] shadow-ticket text-left">
                              <div className="font-bold text-ticket-gold">{trip.partnerName}</div>
                              <div className="text-slate-200 text-[10px] mt-0.5 line-clamp-2">📍 {trip.destination}</div>
                              <div className="text-[9px] font-mono text-slate-400 mt-1">
                                {formatDateRangeIndo(trip.startDate, trip.endDate)}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Idle cell
                      return (
                        <div
                          key={idx}
                          className="h-11 rounded-lg bg-white border border-slate-200/50 flex items-center justify-center text-[10px] text-slate-300 font-mono"
                          title="Siaga Garasi (Idle)"
                        >
                          ·
                        </div>
                      );
                    })}
                  </div>
                );
              })}

            </div>
          </div>

          {/* Selected Gantt Booking Preview Card */}
          {selectedGanttBooking && (
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-obsidian flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cobalt bg-white px-2 py-0.5 rounded border border-blue-200">
                    {selectedGanttBooking.bookingCode}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {selectedGanttBooking.busName} ({selectedGanttBooking.plateNumber})
                  </span>
                </div>
                <h4 className="font-display font-bold text-base text-obsidian">
                  {selectedGanttBooking.partnerName} → {selectedGanttBooking.destination}
                </h4>
                <div className="text-xs text-slate-600 flex items-center gap-3">
                  <span>📅 {formatDateRangeIndo(selectedGanttBooking.startDate, selectedGanttBooking.endDate)}</span>
                  <span>👥 {selectedGanttBooking.passengers} Penumpang</span>
                  <span>💰 {formatIDR(selectedGanttBooking.dealPrice)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGanttBooking(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-white"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-cobalt text-white text-xs font-bold hover:bg-cobalt-hover shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Surat Jalan</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: DATA GRID & TICKET STACKS */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          
          {/* Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-surface border border-slate-200/90 shadow-subtle flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari biro, nama bus, rute tujuan, atau kode booking..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-obsidian focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500 font-semibold">Armada:</span>
                <select
                  value={selectedFleetFilter}
                  onChange={(e) => setSelectedFleetFilter(e.target.value)}
                  className="bg-transparent font-bold text-obsidian focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Bus</option>
                  <option value="zotopia">Zotopia</option>
                  <option value="cocomelon">Cocomelon</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-500 font-semibold">Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-transparent font-bold text-obsidian focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="Terkonfirmasi">Terkonfirmasi</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Berjalan">Berjalan</option>
                </select>
              </div>
            </div>

          </div>

          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block bg-surface rounded-3xl border border-slate-200/90 shadow-tactile overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-4 font-mono">Kode</th>
                    <th className="py-3.5 px-4">Biro Rekanan & PIC</th>
                    <th className="py-3.5 px-4">Armada</th>
                    <th className="py-3.5 px-4">Rute Tujuan</th>
                    <th 
                      onClick={() => toggleSort('date')}
                      className="py-3.5 px-4 cursor-pointer hover:text-cobalt select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Jadwal & Hari</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-center">Pax</th>
                    <th 
                      onClick={() => toggleSort('price')}
                      className="py-3.5 px-4 text-right cursor-pointer hover:text-cobalt select-none"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Total Biaya</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Tidak ada riwayat reservasi yang cocok dengan pencarian Anda.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-cobalt">
                          {b.bookingCode}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-display font-bold text-obsidian">{b.partnerName}</div>
                          <div className="text-[11px] text-slate-500">PIC: {b.picName} ({b.picPhone})</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-obsidian flex items-center gap-1">
                            <Bus className="w-3.5 h-3.5 text-cobalt" />
                            <span>{b.busName}</span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">{b.plateNumber}</div>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-medium text-slate-800 truncate" title={b.destination}>
                            {b.destination}
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-medium text-obsidian">{formatDateRangeIndo(b.startDate, b.endDate)}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Mulai: {formatDateIndo(b.startDate)}</div>
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-semibold">
                          {b.passengers} Seat
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-obsidian">
                          {formatIDR(b.dealPrice)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => window.print()}
                            title="Cetak Surat Jalan"
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-obsidian bg-white hover:bg-slate-100 text-slate-700 transition-colors inline-flex items-center justify-center"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Ticket Stacks (Visible on mobile/tablet) */}
          <div className="md:hidden space-y-3">
            {filteredBookings.map((b) => (
              <div 
                key={b.id}
                className="bg-surface rounded-2xl border border-slate-200 p-4 shadow-subtle space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-cobalt">{b.bookingCode}</span>
                    <h4 className="font-display font-bold text-sm text-obsidian mt-0.5">{b.partnerName}</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {b.status}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5 text-cobalt" />
                    <span>{b.busName} ({b.plateNumber})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span className="truncate">{b.destination}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDateRangeIndo(b.startDate, b.endDate)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="font-mono font-bold text-sm text-obsidian">
                    {formatIDR(b.dealPrice)}
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-obsidian text-xs font-bold flex items-center gap-1"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Cetak</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
