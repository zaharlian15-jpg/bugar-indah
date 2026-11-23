import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, 
  Ticket, 
  Home, 
  Clock, 
  Menu,
  X,
  Search
} from 'lucide-react';
import { COMPANY_NAME } from '../data/catalog';

export default function Navbar({ activeTab, setActiveTab }) {
  const [currentTime, setCurrentTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Compact the bar slightly once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Clock WIB (UTC+7)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format WIB
      const timeStr = now.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(timeStr + ' WIB');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home, badge: null },
    { id: 'katalog', label: 'Katalog Bus', icon: Bus, badge: '2 Unit' },
    { id: 'reservasi', label: 'Cek Jadwal & Pesan', icon: Ticket, badge: 'Live' },
    { id: 'lacak', label: 'Lacak Pesanan', icon: Search, badge: null },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky z-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full no-print transition-all duration-300 ${
        scrolled ? 'top-2' : 'top-4'
      }`}
    >
      <div
        className={`relative rounded-2xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_12px_36px_-18px_rgba(11,19,43,0.32)] ring-1 ring-obsidian/5 px-3.5 sm:px-5 transition-all duration-300 ${
          scrolled ? 'py-2' : 'py-2.5'
        }`}
      >
        <div className="relative flex items-center justify-between gap-3">
          {/* Logo & Identity */}
          <button
            type="button"
            onClick={() => handleNavClick('beranda')}
            className="flex items-center gap-3 group select-none shrink-0 text-left"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-obsidian flex items-center justify-center text-white shadow-md shadow-obsidian/20 transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105">
              <Bus className="w-5 h-5" />
              <span className="absolute -right-1 -bottom-1 w-3 h-3 rounded-full bg-ticket-gold border-2 border-white" />
            </div>
            <div className="max-w-[155px] sm:max-w-[245px]">
              <div className="font-display text-xs sm:text-sm font-extrabold leading-tight text-obsidian line-clamp-2">
                {COMPANY_NAME}
              </div>
              <p className="text-[9px] font-bold tracking-[0.16em] uppercase text-cobalt mt-1 hidden sm:block">
                Fleet · Charter · Tourism
              </p>
            </div>
          </button>

          {/* Desktop Capsule Navigation */}
          <nav aria-label="Navigasi utama" className="hidden xl:flex items-center gap-1 bg-[#f2f4f7] p-1 rounded-xl border border-slate-200/70">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative z-10 flex h-[52px] w-[116px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 ${
                    isActive ? 'text-white' : 'text-slate-600 hover:text-obsidian hover:bg-white/70'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-pill"
                      className="absolute inset-0 rounded-lg bg-obsidian shadow-md shadow-obsidian/20 -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="flex h-4 items-center justify-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-ticket-gold' : 'text-slate-400'}`} />
                  {item.badge && (
                    <span
                      className={`flex h-4 items-center gap-1 rounded-full px-1.5 text-[9px] font-bold uppercase tracking-wider ${
                        isActive ? 'bg-white/10 text-white' : 'bg-white text-slate-500 border border-slate-200'
                      }`}
                    >
                      {item.badge === 'Live' && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                      )}
                      {item.badge}
                    </span>
                  )}
                  </span>
                  <span className="line-clamp-2 px-1 text-center text-[11px] leading-3">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Bar & Clock */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live WIB Clock */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 text-obsidian text-[11px] font-mono font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[9px] uppercase tracking-[0.14em] text-slate-400">WIB</span>
              <Clock className="w-3.5 h-3.5 text-cobalt" />
              <span className="tabular-nums tracking-wide text-slate-700">{currentTime?.replace(' WIB', '') || '00:00:00'}</span>
            </div>

            {/* CTA Pesan */}
            <button
              onClick={() => handleNavClick('reservasi')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-cobalt hover:bg-cobalt-hover text-white text-xs font-bold transition-all shadow-md shadow-cobalt/20 hover:shadow-lg hover:shadow-cobalt/25 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Pesan Sekarang</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              className="xl:hidden p-2.5 rounded-lg bg-obsidian hover:bg-cobalt text-white border border-obsidian shadow-md shadow-obsidian/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="xl:hidden relative overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-1 ${
                        isActive
                          ? 'bg-obsidian text-white shadow-md shadow-obsidian/15'
                          : 'bg-slate-50 border border-slate-200/70 text-slate-700 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => handleNavClick('reservasi')}
                  className="sm:hidden flex items-center justify-center gap-2 p-3 rounded-lg text-xs font-bold text-white bg-cobalt hover:bg-cobalt-hover shadow-md shadow-cobalt/20"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Pesan Sekarang</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
