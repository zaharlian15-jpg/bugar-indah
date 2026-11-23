import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users, 
  Award, 
  Building2, 
  Sparkles,
  ArrowUpRight,
  Bus
} from 'lucide-react';
import { formatIDR } from '../utils';

export default function ExecutiveRecap({ bookings = [], fleet = [], partners = [] }) {
  
  // KPI Calculations
  const metrics = useMemo(() => {
    const totalOmset = bookings.reduce((acc, b) => acc + (Number(b.dealPrice) || 0), 0);
    const totalDays = bookings.reduce((acc, b) => acc + (Number(b.days) || 1), 0);
    const totalPassengers = bookings.reduce((acc, b) => acc + (Number(b.passengers) || 0), 0);
    const avgBookingValue = bookings.length > 0 ? Math.round(totalOmset / bookings.length) : 0;
    const avgOccupancy = bookings.length > 0 ? Math.round((totalPassengers / (bookings.length * 33)) * 100) : 0;

    return {
      totalOmset,
      totalDays,
      totalPassengers,
      avgBookingValue,
      avgOccupancy,
      totalTrips: bookings.length
    };
  }, [bookings]);

  // Bar Chart Data: Revenue per Partner
  const partnerChartData = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      const pName = b.partnerName || 'Lainnya';
      if (!map[pName]) {
        map[pName] = { name: pName.split(' ')[0], fullName: pName, omset: 0, trips: 0 };
      }
      map[pName].omset += Number(b.dealPrice) || 0;
      map[pName].trips += 1;
    });

    return Object.values(map)
      .sort((a, b) => b.omset - a.omset)
      .slice(0, 6)
      .map(item => ({
        ...item,
        omsetJuta: Math.round(item.omset / 1000000)
      }));
  }, [bookings]);

  // Donut Chart Data: Fleet Utilization
  const fleetUtilizationData = useMemo(() => {
    const map = {};
    fleet.forEach(f => {
      map[f.id] = { name: f.name, days: 0, revenue: 0, color: f.id === 'zotopia' ? '#1D4ED8' : '#059669' };
    });

    bookings.forEach(b => {
      const busKey = b.busId || (b.busName && b.busName.toLowerCase().includes('zotopia') ? 'zotopia' : 'cocomelon');
      if (map[busKey]) {
        map[busKey].days += Number(b.days) || 1;
        map[busKey].revenue += Number(b.dealPrice) || 0;
      }
    });

    return Object.values(map);
  }, [bookings, fleet]);

  // Leaderboard Ranking
  const leaderboard = useMemo(() => {
    const map = {};
    partners.forEach(p => {
      map[p.name] = {
        name: p.name,
        city: p.city,
        tier: p.tier,
        pic: p.pic,
        trips: 0,
        totalContribution: 0
      };
    });

    bookings.forEach(b => {
      const pName = b.partnerName || 'Lainnya';
      if (!map[pName]) {
        map[pName] = {
          name: pName,
          city: 'Jawa Timur',
          tier: 'Mitra Reguler',
          pic: b.picName || '-',
          trips: 0,
          totalContribution: 0
        };
      }
      map[pName].trips += 1;
      map[pName].totalContribution += Number(b.dealPrice) || 0;
    });

    return Object.values(map).sort((a, b) => b.totalContribution - a.totalContribution);
  }, [bookings, partners]);

  return (
    <div className="space-y-10 py-6 pb-20">
      
      {/* Header Editorial */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt/10 text-cobalt text-xs font-bold uppercase tracking-widest">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Executive Intelligence & Financial Analytics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-obsidian tracking-tight">
          Executive Recap & Analitik Operasional
        </h1>
        <p className="text-sm sm:text-base text-caption max-w-2xl leading-relaxed">
          Laporan performa pendapatan kotor armada, efisiensi utilisasi hari sewa bus, 
          dan loyalitas kontribusi biro rekanan pariwisata.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Omset */}
        <div className="bg-surface rounded-3xl border border-slate-200/90 p-6 shadow-tactile space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-caption">
              Total Omset Tercatat
            </span>
            <div className="w-9 h-9 rounded-xl bg-cobalt/10 text-cobalt flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-obsidian tabular-nums">
            {formatIDR(metrics.totalOmset)}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-1 border-t border-slate-100">
            <ArrowUpRight className="w-4 h-4" />
            <span>+18.4% vs kuartal sebelumnya</span>
          </div>
        </div>

        {/* KPI 2: Total Days */}
        <div className="bg-surface rounded-3xl border border-slate-200/90 p-6 shadow-tactile space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-caption">
              Hari Operasional Bus
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-display font-extrabold text-obsidian">
            {metrics.totalDays} <span className="text-base font-normal text-slate-500">Hari Dinas</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
            <span>Rata-rata 2.6 hari perjalanan per trip</span>
          </div>
        </div>

        {/* KPI 3: Total Passengers */}
        <div className="bg-surface rounded-3xl border border-slate-200/90 p-6 shadow-tactile space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-caption">
              Penumpang Terangkut
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-display font-extrabold text-obsidian">
            {metrics.totalPassengers} <span className="text-base font-normal text-slate-500">Wisatawan</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-1 border-t border-slate-100">
            <span>Rata-rata okupansi kursi: {metrics.avgOccupancy}%</span>
          </div>
        </div>

        {/* KPI 4: Average Booking Value */}
        <div className="bg-surface rounded-3xl border border-slate-200/90 p-6 shadow-tactile space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-caption">
              Rata-rata per Booking
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-obsidian tabular-nums">
            {formatIDR(metrics.avgBookingValue)}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
            <span>Dari total {metrics.totalTrips} kontrak sewa</span>
          </div>
        </div>

      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Chart 1: Revenue by Partner (7/12) */}
        <div className="lg:col-span-7 bg-surface rounded-3xl border border-slate-200/90 shadow-tactile p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-obsidian">
                Distribusi Omset per Biro Rekanan
              </h3>
              <p className="text-xs text-caption">
                Kontribusi nominal pendapatan kotor (dalam Juta Rupiah) dari biro perjalanan top.
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partnerChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#94A3B8" 
                  fontSize={11} 
                  tickLine={false}
                />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => `Rp${val}Jt`}
                />
                <Tooltip 
                  formatter={(val) => [`Rp ${val}.000.000`, 'Kontribusi Omset']}
                  labelFormatter={(name) => `Biro: ${name}`}
                  contentStyle={{
                    backgroundColor: '#0B132B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                  }}
                />
                <Bar 
                  dataKey="omsetJuta" 
                  fill="#1D4ED8" 
                  radius={[8, 8, 0, 0]} 
                  name="Omset (Juta Rp)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fleet Utilization Ratio (5/12) */}
        <div className="lg:col-span-5 bg-surface rounded-3xl border border-slate-200/90 shadow-tactile p-6 sm:p-7 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-obsidian">
              Rasio Utilisasi Armada Bus
            </h3>
            <p className="text-xs text-caption">
              Perbandingan total hari dinas operasional jalan antara Zotopia & Cocomelon.
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetUtilizationData}
                  dataKey="days"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                >
                  {fleetUtilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val, name) => [`${val} Hari Dinas`, name]}
                  contentStyle={{
                    backgroundColor: '#0B132B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            {fleetUtilizationData.map((item, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-obsidian">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-700 pl-4">
                  {item.days} Hari Dinas
                </div>
                <div className="text-[10px] text-slate-500 pl-4">
                  Omset: {formatIDR(item.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Partner Loyalty Leaderboard */}
      <div className="bg-surface rounded-3xl border border-slate-200/90 shadow-tactile p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-display font-bold text-xl text-obsidian flex items-center gap-2">
              <Award className="w-5 h-5 text-ticket-gold" />
              <span>Klasemen Loyalitas Biro Wisata (Partner Leaderboard)</span>
            </h3>
            <p className="text-xs text-caption">
              Pemeringkatan biro rekanan berdasarkan frekuensi sewa bus dan total kontribusi nilai transaksi.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold self-start sm:self-auto">
            Program Diskon Mitra Prioritas 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Nama Biro Rekanan</th>
                <th className="py-3 px-4">Kota Asal</th>
                <th className="py-3 px-4">Penanggung Jawab (PIC)</th>
                <th className="py-3 px-4 text-center">Total Trip</th>
                <th className="py-3 px-4 text-right">Total Kontribusi</th>
                <th className="py-3 px-4 text-center">Status Keanggotaan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {leaderboard.map((partner, index) => {
                const isTop3 = index < 3;
                const isPriority = partner.tier === 'Mitra Prioritas' || partner.trips >= 2;

                return (
                  <tr key={partner.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <span className={`w-7 h-7 rounded-xl inline-flex items-center justify-center font-display font-extrabold text-xs ${
                        index === 0
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : index === 1
                          ? 'bg-slate-200 text-slate-800'
                          : index === 2
                          ? 'bg-orange-100 text-orange-900'
                          : 'text-slate-400'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-display font-bold text-obsidian text-sm">{partner.name}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {partner.city}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {partner.pic}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-obsidian">
                      {partner.trips} Trip
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-cobalt text-sm">
                      {formatIDR(partner.totalContribution)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPriority
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {partner.tier || (isPriority ? 'Mitra Prioritas' : 'Mitra Reguler')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
