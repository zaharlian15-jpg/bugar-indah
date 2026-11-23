import React, { useMemo } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  Wallet, Hourglass, CalendarClock, Gauge, Check, X, ArrowRight, MapPin, Users, Phone, Inbox
} from 'lucide-react';
import { formatIDR, formatDateRangeIndo, isDateBookedForBus } from '../utils';

const todayStr = () => format(new Date(), 'yyyy-MM-dd');

export default function AdminDashboard({ me, bookings = [], fleet = [], onNavigate, onUpdate, readOnly = false }) {
  const today = todayStr();

  const stats = useMemo(() => {
    const active = bookings.filter((b) => b.status !== 'Dibatalkan');
    const pending = bookings
      .filter((b) => b.status === 'Menunggu Konfirmasi')
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    const in7 = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    const in14 = format(addDays(new Date(), 14), 'yyyy-MM-dd');
    const upcoming7 = active.filter((b) => b.startDate >= today && b.startDate <= in7);
    const upcoming = active
      .filter((b) => b.endDate >= today && b.startDate <= in14)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    const confirmedRevenue = active
      .filter((b) => b.status === 'Terkonfirmasi' || b.status === 'Selesai')
      .reduce((a, b) => a + Number(b.dealPrice || 0), 0);
    const pipelineRevenue = pending.reduce((a, b) => a + Number(b.dealPrice || 0), 0);

    const horizon = Array.from({ length: 30 }, (_, i) => format(addDays(new Date(), i), 'yyyy-MM-dd'));
    const strips = fleet.map((bus) => {
      const cells = horizon.map((d) => {
        const trip = isDateBookedForBus(d, bus.id, active);
        return { date: d, trip };
      });
      const booked = cells.filter((c) => c.trip).length;
      return { bus, cells, pct: Math.round((booked / 30) * 100), booked };
    });
    const utilization = strips.length ? Math.round(strips.reduce((a, s) => a + s.pct, 0) / strips.length) : 0;

    const monthMap = {};
    active.forEach((b) => {
      const key = b.startDate.slice(0, 7);
      monthMap[key] ??= { key, total: 0 };
      fleet.forEach((bus) => { monthMap[key][bus.id] ??= 0; });
      monthMap[key][b.busId] = (monthMap[key][b.busId] || 0) + Number(b.dealPrice || 0);
      monthMap[key].total += Number(b.dealPrice || 0);
    });
    const monthly = Object.values(monthMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6)
      .map((m) => ({ ...m, label: format(parseISO(`${m.key}-01`), 'MMM yy', { locale: id }) }));

    return { active, pending, upcoming7, upcoming, confirmedRevenue, pipelineRevenue, strips, utilization, monthly, horizon };
  }, [bookings, fleet, today]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 18) return 'Selamat sore';
    return 'Selamat malam';
  })();

  const kpis = [
    { label: 'Omset Terkonfirmasi', value: formatIDR(stats.confirmedRevenue), hint: `+ ${formatIDR(stats.pipelineRevenue)} dalam antrean`, icon: Wallet, tone: 'cobalt' },
    { label: 'Menunggu Konfirmasi', value: stats.pending.length, hint: 'Permintaan dari situs publik', icon: Hourglass, tone: 'amber' },
    { label: 'Berangkat 7 Hari', value: stats.upcoming7.length, hint: 'Perjalanan siap dinas', icon: CalendarClock, tone: 'emerald' },
    { label: 'Utilisasi 30 Hari', value: `${stats.utilization}%`, hint: 'Rata-rata hari terisi armada', icon: Gauge, tone: 'violet' },
  ];
  const toneCls = {
    cobalt: 'bg-cobalt/10 text-cobalt',
    amber: 'bg-amber-100 text-ticket-amber',
    emerald: 'bg-emerald-100 text-terminal',
    violet: 'bg-violet-100 text-violet-700',
  };

  return (
    <div className="py-8 space-y-8">
      {/* Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-caption">{format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}</div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-obsidian tracking-tight">
            {greeting}, {(me?.name || 'Admin').split(' ')[0]}.
          </h1>
          <p className="text-sm text-caption">
            {stats.pending.length > 0
              ? `Ada ${stats.pending.length} permintaan reservasi yang menunggu keputusan Anda.`
              : 'Semua permintaan reservasi sudah ditangani. Operasional berjalan lancar.'}
          </p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-surface rounded-3xl border border-slate-200/90 p-5 shadow-tactile space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-caption">{k.label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${toneCls[k.tone]}`}>
                  <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-obsidian tabular-nums truncate">{k.value}</div>
              <div className="text-[11px] text-caption pt-2 border-t border-slate-100">{k.hint}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Antrean konfirmasi */}
        <section className="xl:col-span-7 bg-surface rounded-3xl border border-slate-200/90 shadow-tactile overflow-hidden">
          <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-display font-extrabold text-lg text-obsidian">Antrean Konfirmasi</h2>
              <p className="text-[11px] text-caption">Permintaan baru dari pengunjung situs</p>
            </div>
            <button onClick={() => onNavigate('reservasi')} className="text-xs font-bold text-cobalt hover:underline flex items-center gap-1">
              Semua reservasi <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </header>
          {stats.pending.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">Tidak ada permintaan tertunda.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.pending.slice(0, 6).map((b) => (
                <li key={b.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-cobalt">{b.bookingCode}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600">{b.busName}</span>
                    </div>
                    <div className="font-bold text-sm text-obsidian truncate">{b.partnerName}</div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-caption">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{b.destination}</span>
                      <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" />{formatDateRangeIndo(b.startDate, b.endDate)}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{b.passengers} pax</span>
                      {b.picPhone && <span className="flex items-center gap-1 font-mono"><Phone className="w-3 h-3" />{b.picPhone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-sm text-obsidian mr-1">{formatIDR(b.dealPrice)}</span>
                    {!readOnly && <button
                      onClick={() => onUpdate(b.id, { status: 'Dibatalkan' })}
                      title="Tolak"
                      className="w-9 h-9 rounded-xl border border-slate-200 hover:border-alert hover:bg-alert-subtle text-slate-500 hover:text-alert flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>}
                    {!readOnly && <button
                      onClick={() => onUpdate(b.id, { status: 'Terkonfirmasi' })}
                      className="h-9 px-3 rounded-xl bg-terminal hover:bg-terminal-dark text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Konfirmasi
                    </button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Keberangkatan mendatang */}
        <section className="xl:col-span-5 bg-obsidian text-white rounded-3xl shadow-lifted overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:14px_14px]" />
          <header className="relative px-6 py-4 border-b border-white/10">
            <h2 className="font-display font-extrabold text-lg">Papan Keberangkatan</h2>
            <p className="text-[11px] text-slate-400">14 hari ke depan • waktu WIB</p>
          </header>
          <ul className="relative divide-y divide-white/5 max-h-[420px] overflow-y-auto">
            {stats.upcoming.length === 0 && (
              <li className="p-8 text-center text-sm text-slate-400">Belum ada jadwal dalam 14 hari ke depan.</li>
            )}
            {stats.upcoming.map((b) => {
              const bus = fleet.find((f) => f.id === b.busId);
              const onTrip = b.startDate <= today && b.endDate >= today;
              return (
                <li key={b.id} className="px-6 py-3 flex items-center gap-4">
                  <div className="w-14 text-center shrink-0">
                    <div className="text-[10px] uppercase font-bold text-slate-400">{format(parseISO(b.startDate), 'MMM', { locale: id })}</div>
                    <div className="font-mono font-extrabold text-2xl text-ticket-gold leading-none">{format(parseISO(b.startDate), 'dd')}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold truncate">{b.destination}</div>
                    <div className="text-[11px] text-slate-400 truncate">{b.partnerName} • {b.days} hari</div>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <div className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ background: `${bus?.colorHex || '#1D4ED8'}33`, color: '#fff' }}>
                      {b.busName}
                    </div>
                    <div className={`text-[10px] font-bold ${onTrip ? 'text-emerald-400' : b.status === 'Menunggu Konfirmasi' ? 'text-amber-400' : 'text-slate-400'}`}>
                      {onTrip ? '● Dalam perjalanan' : b.status}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Strip utilisasi */}
        <section className="xl:col-span-7 bg-surface rounded-3xl border border-slate-200/90 shadow-tactile p-6 space-y-5">
          <div>
            <h2 className="font-display font-extrabold text-lg text-obsidian">Okupansi Armada 30 Hari</h2>
            <p className="text-[11px] text-caption">Setiap kotak = 1 hari. Kotak kosong adalah peluang penjualan.</p>
          </div>
          {stats.strips.map(({ bus, cells, pct, booked }) => (
            <div key={bus.id} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: bus.colorHex }} />
                  <span className="font-bold text-obsidian">{bus.name}</span>
                  <span className="font-mono text-caption">{bus.plateNumber}</span>
                </div>
                <span className="font-mono font-bold text-obsidian">{booked}/30 hari • {pct}%</span>
              </div>
              <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}>
                {cells.map((c) => (
                  <div
                    key={c.date}
                    title={`${format(parseISO(c.date), 'EEE, d MMM', { locale: id })}${c.trip ? ` — ${c.trip.partnerName}` : ' — kosong'}`}
                    className="h-7 rounded-[5px] border"
                    style={c.trip
                      ? { background: c.trip.status === 'Menunggu Konfirmasi' ? `${bus.colorHex}66` : bus.colorHex, borderColor: 'transparent' }
                      : { background: '#F8FAFC', borderColor: '#E2E8F0' }}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4 text-[10px] text-caption font-semibold pt-1">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-700" />Terkonfirmasi</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-700/40" />Menunggu</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-slate-200 bg-slate-50" />Kosong</span>
            <span className="ml-auto font-mono">{format(new Date(), 'd MMM', { locale: id })} → {format(addDays(new Date(), 29), 'd MMM', { locale: id })}</span>
          </div>
        </section>

        {/* Grafik omset */}
        <section className="xl:col-span-5 bg-surface rounded-3xl border border-slate-200/90 shadow-tactile p-6 space-y-4">
          <div>
            <h2 className="font-display font-extrabold text-lg text-obsidian">Omset per Bulan</h2>
            <p className="text-[11px] text-caption">Berdasarkan tanggal keberangkatan, per armada</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthly} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#EEF2F7" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tickFormatter={(v) => `${Math.round(v / 1_000_000)}jt`}
                />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  formatter={(v, name) => [formatIDR(v), fleet.find((f) => f.id === name)?.name || name]}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                />
                {fleet.map((bus, i) => (
                  <Bar
                    key={bus.id}
                    dataKey={bus.id}
                    stackId="rev"
                    fill={bus.colorHex}
                    radius={i === fleet.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                    maxBarSize={36}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-caption">
            {fleet.map((bus) => (
              <span key={bus.id} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: bus.colorHex }} />
                {bus.name}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
