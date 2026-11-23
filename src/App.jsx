import React, { useState, lazy, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import HomeHero from './components/HomeHero';
import FleetCatalog from './components/FleetCatalog';
import BookingForm from './components/BookingForm';
import TrackingView from './components/TrackingView';
import { fetchPublicData, submitPublicBooking, FLEET_DATA, PARTNERS_DATA } from './api';
import { useCompanySettings } from './data/catalog';
import { Bus, MapPin } from 'lucide-react';
import { ADMIN_ROUTE } from './admin/route';

const AdminApp = lazy(() => import('./admin/AdminApp'));

export default function App() {
  const isAdminRoute = window.location.pathname === ADMIN_ROUTE || window.location.pathname.startsWith(`${ADMIN_ROUTE}/`);
  if (isAdminRoute) {
    return (
      <Suspense fallback={<FullScreenLoader label="Memuat Panel Admin Trevel..." />}>
        <AdminApp />
      </Suspense>
    );
  }
  return <PublicSite />;
}

export function FullScreenLoader({ label }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-[3px] border-cobalt border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-mono font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function PublicSite() {
  const queryClient = useQueryClient();
  const company = useCompanySettings();
  const urlParams = new URLSearchParams(window.location.search);
  const initialTrackingToken = urlParams.get('lacak') || urlParams.get('track') || '';

  const [activeTab, setActiveTab] = useState(initialTrackingToken ? 'lacak' : 'beranda');
  const [preselectedBusId, setPreselectedBusId] = useState(null);
  const [preselectedDestination, setPreselectedDestination] = useState('');
  const [activeTrackingToken, setActiveTrackingToken] = useState(initialTrackingToken);

  const handleNavigateToTracking = (token) => {
    setActiveTrackingToken(token);
    setActiveTab('lacak');
    const newUrl = `${window.location.pathname}?lacak=${encodeURIComponent(token)}`;
    window.history.pushState({}, '', newUrl);
  };

  // Publik hanya menerima data armada, mitra terdaftar + tanggal terisi (tanpa identitas pelanggan lain)
  const { data, isLoading } = useQuery({
    queryKey: ['publicAvailability'],
    queryFn: fetchPublicData,
    staleTime: 30_000,
  });

  const bookingMutation = useMutation({
    mutationFn: submitPublicBooking,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['publicAvailability'] }),
  });

  const handleSelectBusForBooking = (busId) => {
    setPreselectedBusId(busId);
    setActiveTab('reservasi');
  };

  const handleQuickBookDestination = (destTitle) => {
    setPreselectedDestination(destTitle);
    setActiveTab('reservasi');
  };

  const fleet = data?.fleet || FLEET_DATA;
  const partners = data?.partners || PARTNERS_DATA;
  const blocked = data?.blocked || [];

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cobalt selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-2">
        {activeTab === 'beranda' && (
          <HomeHero onSelectTab={setActiveTab} onQuickBookDestination={handleQuickBookDestination} />
        )}
        {activeTab === 'katalog' && (
          <FleetCatalog fleet={fleet} onSelectBusForBooking={handleSelectBusForBooking} />
        )}
        {activeTab === 'reservasi' && (
          isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-[3px] border-cobalt border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono font-semibold text-slate-500">Memuat ketersediaan armada...</p>
            </div>
          ) : (
            <BookingForm
              mode="public"
              fleet={fleet}
              partners={partners}
              bookings={blocked}
              preselectedBusId={preselectedBusId}
              preselectedDestination={preselectedDestination}
              onNavigateToTracking={handleNavigateToTracking}
              onBookingSubmitted={(payload) => bookingMutation.mutateAsync(payload)}
            />
          )
        )}
        {activeTab === 'lacak' && (
          <TrackingView
            initialTrackingToken={activeTrackingToken}
            onGoToBooking={() => setActiveTab('reservasi')}
          />
        )}
      </main>

      {/* Footer Editorial */}
      <footer className="mt-20 border-t border-slate-800 bg-obsidian text-slate-300 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                  <Bus className="w-4 h-4 text-cobalt-light" />
                </div>
                <span className="max-w-[220px] font-display text-sm font-bold leading-tight text-white">
                  {company.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {company.name} — layanan bus pariwisata eksekutif.
              </p>
            </div>

            {/* Hub Operasional */}
            <div className="space-y-2 text-xs">
              <h5 className="font-display font-bold uppercase tracking-wider text-white">Garasi &amp; Pool Armada</h5>
              <div className="text-slate-400 space-y-1">
                <p>{company.name}</p>
                <p>{company.address}</p>
                {company.mapUrl && (
                  <a href={company.mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 pt-1 font-semibold text-slate-200 hover:text-white">
                    <MapPin className="h-3.5 w-3.5" /> Buka lokasi di Google Maps
                  </a>
                )}
              </div>
            </div>

            {/* Layanan Operasional */}
            <div className="space-y-2 text-xs">
              <h5 className="font-display font-bold uppercase tracking-wider text-white">Dispatch &amp; Dispatcher</h5>
              <div className="text-slate-400 space-y-1">
                <p>Hotline Biro: {company.phone || company.whatsappDisplay} (24 Jam)</p>
                <p>Layanan Reservasi: {company.reservationPhone || '0343-631234'}</p>
                <p>Email: {company.email || 'charter@trevelwisata.id'}</p>
              </div>
            </div>

            {/* Legalitas & Safety */}
            <div className="space-y-2 text-xs">
              <h5 className="font-display font-bold uppercase tracking-wider text-white">Izin Penyelenggaraan</h5>
              <div className="text-slate-400 space-y-1">
                <p>SK Izin Trayek: {company.license || '503/108/KPTS/DISPERHUB/2024'}</p>
                <p>Sertifikat Uji KIR: Elektronik Blue Dishub RI</p>
                <p>Proteksi: Asuransi Penumpang Jasa Raharja</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>© 2026 {company.name}. Hak Cipta Dilindungi Undang-Undang.</div>
            <div className="font-mono text-[10px] text-slate-500">
              Swiss Editorial Transit Design System • React 18 + Vite
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
