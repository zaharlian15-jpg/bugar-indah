import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { clearLocalAdminSession, hasLocalAdminSession, logoutAdmin } from '../api';
import {
  LayoutDashboard, Ticket, CalendarRange, BarChart3, PlusCircle,
  LogOut, RefreshCw, Bus, ExternalLink, Menu, X, ShieldAlert, Settings
} from 'lucide-react';
import {
  fetchAdminMe, fetchAdminData, createAdminBooking, updateAdminBooking, deleteAdminBooking,
  createAdminFleet, updateAdminFleet, deleteAdminFleet
} from '../api';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import ReservationManager from './ReservationManager';
import ScheduleView from '../components/ScheduleView';
import ExecutiveRecap from '../components/ExecutiveRecap';
import BookingForm from '../components/BookingForm';
import FleetManager from './FleetManager';
import SettingsManager from './SettingsManager';
import { useCompanySettings } from '../data/catalog';
import { ADMIN_ROUTE } from './route';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reservasi', label: 'Reservasi', icon: Ticket, countKey: 'pending' },
  { id: 'armada', label: 'Katalog Bus', icon: Bus },
  { id: 'baru', label: 'Input Reservasi', icon: PlusCircle },
  { id: 'jadwal', label: 'Jadwal Armada', icon: CalendarRange },
  { id: 'laporan', label: 'Laporan Eksekutif', icon: BarChart3 },
  { id: 'pengaturan', label: 'Pengaturan & Kontak WA', icon: Settings },
];

export default function AdminApp() {
  const [authState, setAuthState] = useState({ loading: true, user: null, callback: null });

  useEffect(() => {
    const user = hasLocalAdminSession() ? { id: 'apps-script-admin', name: 'Admin Trevel' } : null;
    setAuthState({ loading: false, user, callback: null });
  }, []);

  if (authState.loading) return <Splash label="Memverifikasi sesi admin..." />;

  if (!authState.user || authState.callback) {
    return (
      <AdminLogin
        onDone={(localUser) => setAuthState({ loading: false, user: localUser, callback: null })}
      />
    );
  }

  return <AdminGate />;
}

function Splash({ label }) {
  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center gap-4 text-white">
      <div className="w-12 h-12 rounded-2xl bg-cobalt flex items-center justify-center animate-pulse">
        <Bus className="w-6 h-6" />
      </div>
      <p className="text-xs font-mono text-slate-400">{label}</p>
    </div>
  );
}

function AdminGate() {
  const { data: me, isLoading, error } = useQuery({
    queryKey: ['adminMe'],
    queryFn: fetchAdminMe,
    retry: false,
    staleTime: Infinity,
  });

  if (isLoading) return <Splash label="Memeriksa hak akses..." />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface rounded-3xl border border-slate-200 shadow-lifted p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-alert-subtle text-alert flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-obsidian">Akses Ditolak</h1>
          <p className="text-sm text-caption leading-relaxed">
            {error.status === 403
              ? 'Akun Anda berhasil masuk, tetapi belum memiliki role admin. Minta pemilik sistem menambahkan role "admin" pada akun Anda.'
              : error.message}
          </p>
          <button
            onClick={async () => { await logoutAdmin().catch(() => clearLocalAdminSession()); window.location.reload(); }}
            className="w-full py-3 rounded-xl bg-obsidian hover:bg-obsidian-light text-white text-sm font-bold"
          >
            Keluar & Gunakan Akun Lain
          </button>
          <a href="/" className="block text-xs text-cobalt font-semibold hover:underline">Kembali ke situs publik</a>
        </div>
      </div>
    );
  }

  return <AdminShell me={me} />;
}

function AdminShell({ me }) {
  const queryClient = useQueryClient();
  const company = useCompanySettings();
  const [active, setActive] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['adminData'],
    queryFn: fetchAdminData,
    refetchInterval: 60_000,
  });

  const fleet = data?.fleet || [];
  const partners = data?.partners || [];
  const bookings = data?.bookings || [];
  const activeBookings = bookings.filter((b) => b.status !== 'Dibatalkan');
  const pendingCount = bookings.filter((b) => b.status === 'Menunggu Konfirmasi').length;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['adminData'] });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => updateAdminBooking(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['adminData'] });
      const previous = queryClient.getQueryData(['adminData']);
      queryClient.setQueryData(['adminData'], (old) => old && ({
        ...old,
        bookings: old.bookings.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      }));
      return { previous };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['adminData'], ctx.previous);
      toast.error(err.message);
    },
    onSettled: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminBooking,
    onSuccess: () => toast.success('Reservasi dihapus permanen.'),
    onError: (err) => toast.error(err.message),
    onSettled: invalidate,
  });

  const createMutation = useMutation({
    mutationFn: createAdminBooking,
    onSettled: invalidate,
  });

  const createFleetMutation = useMutation({
    mutationFn: createAdminFleet,
    onSuccess: () => toast.success('Armada berhasil ditambahkan.'),
    onError: (error) => toast.error(error.message),
    onSettled: invalidate,
  });

  const updateFleetMutation = useMutation({
    mutationFn: ({ id, bus }) => updateAdminFleet(id, bus),
    onSuccess: () => toast.success('Data armada berhasil diperbarui.'),
    onError: (error) => toast.error(error.message),
    onSettled: invalidate,
  });

  const deleteFleetMutation = useMutation({
    mutationFn: deleteAdminFleet,
    onSuccess: () => toast.success('Armada berhasil dihapus.'),
    onError: (error) => toast.error(error.message),
    onSettled: invalidate,
  });

  const handleSync = () => {
    toast.promise(refetch(), {
      loading: 'Sinkronisasi data operasional...',
      success: 'Data reservasi terbaru berhasil dimuat.',
      error: 'Sinkronisasi gagal.',
    });
  };

  const handleLogout = async () => {
    await logoutAdmin().catch(() => clearLocalAdminSession());
    queryClient.clear();
    window.location.href = ADMIN_ROUTE;
  };

  const go = (id) => { setActive(id); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const current = NAV.find((n) => n.id === active);

  const sidebar = (
    <div className="flex flex-col h-full">
      <a href={ADMIN_ROUTE} className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-xl bg-cobalt flex items-center justify-center shadow-lg shadow-cobalt/40">
          <Bus className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-display font-extrabold text-sm text-white leading-tight line-clamp-2" title={company.name}>
            {company.name}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-1">Control Center</div>
        </div>
      </a>

      <nav className="mt-8 space-y-1 flex-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Operasional</div>
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          const count = item.countKey === 'pending' ? pendingCount : 0;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-nav-pill"
                  className="absolute inset-0 rounded-xl bg-white/10 border border-white/10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Icon className={`relative w-4 h-4 ${isActive ? 'text-ticket-gold' : ''}`} />
              <span className="relative flex-1 text-left">{item.label}</span>
              {count > 0 && (
                <span className="relative min-w-[20px] h-5 px-1.5 rounded-full bg-ticket-amber text-white text-[10px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
              {item.badge && (
                <span className="relative text-[9px] px-1.5 py-0.5 rounded-md bg-gradient-to-r from-cobalt-glow to-violet-500 text-white font-black tracking-wider">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 space-y-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Lihat Situs Publik
        </a>
        <a
          href="https://docs.google.com/spreadsheets/d/17zwn_zGDW8rK92_QYvYISZ-Ykr3Ba5rwcf8-TPHNjqA/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white hover:bg-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Lihat Google Sheet
        </a>
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ticket-gold to-ticket-amber flex items-center justify-center text-obsidian font-display font-black">
            {(me?.name || me?.email || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">{me?.name || 'Administrator'}</div>
            <div className="text-[10px] text-slate-400 truncate font-mono">{me?.email}</div>
          </div>
          <button onClick={handleLogout} title="Keluar" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block w-64 shrink-0 bg-obsidian p-5 sticky top-0 h-screen no-print">
        {sidebar}
      </aside>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-obsidian/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-obsidian p-5 z-50 lg:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-canvas/85 backdrop-blur-xl border-b border-slate-200/80 no-print">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg bg-white border border-slate-200">
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-caption">Panel Admin</div>
              <div className="font-display font-extrabold text-lg text-obsidian leading-tight truncate">{current?.label}</div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${import.meta.env.DEV ? 'bg-amber-50 border-amber-200/70 text-amber-800' : 'bg-emerald-50 border-emerald-200/70 text-emerald-700'}`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${import.meta.env.DEV ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${import.meta.env.DEV ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                </span>
                Google Apps Script
              </div>
              <button
                onClick={handleSync}
                disabled={isFetching}
                title="Sinkronisasi data"
                className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-cobalt' : 'text-slate-600'}`} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-16">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-[3px] border-cobalt border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono font-semibold text-slate-500">Memuat data operasional...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {active === 'dashboard' && (
                  <AdminDashboard
                    me={me}
                    bookings={bookings}
                    fleet={fleet}
                    onNavigate={go}
                    onUpdate={(id, updates) => updateMutation.mutate({ id, updates })}
                  />
                )}
                {active === 'reservasi' && (
                  <ReservationManager
                    bookings={bookings}
                    fleet={fleet}
                    onUpdate={(id, updates) => updateMutation.mutateAsync({ id, updates })}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                )}
                {active === 'armada' && (
                  <FleetManager
                    fleet={fleet}
                    onCreate={(bus) => createFleetMutation.mutateAsync(bus)}
                    onUpdate={(id, bus) => updateFleetMutation.mutateAsync({ id, bus })}
                    onDelete={(id) => deleteFleetMutation.mutateAsync(id)}
                  />
                )}
                {active === 'baru' && (
                  <BookingForm
                    mode="admin"
                    fleet={fleet}
                    partners={partners}
                    bookings={bookings}
                    onBookingSubmitted={(payload) => createMutation.mutateAsync(payload)}
                  />
                )}
                {active === 'jadwal' && <ScheduleView bookings={bookings} fleet={fleet} />}
                {active === 'laporan' && (
                  <ExecutiveRecap bookings={activeBookings} fleet={fleet} partners={partners} />
                )}
                {active === 'pengaturan' && <SettingsManager />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
