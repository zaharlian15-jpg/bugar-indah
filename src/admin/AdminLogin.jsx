import React, { useState } from 'react';
import { toast } from 'sonner';
import { Bus, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { loginAdmin, API_ERROR } from '../api';
import { useCompanySettings } from '../data/catalog';

const ERROR_TITLES = {
  [API_ERROR.TIMEOUT]: 'Server terlalu lama merespons',
  [API_ERROR.NETWORK]: 'Tidak dapat terhubung ke server',
  [API_ERROR.BAD_RESPONSE]: 'Respons server tidak valid',
  [API_ERROR.AUTH]: 'Login ditolak',
  [API_ERROR.SERVER]: 'Server mengalami kesalahan',
};

export default function AdminLogin({ onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const company = useCompanySettings();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await loginAdmin(email.trim(), password);
      toast.success('Berhasil masuk ke panel admin.');
      await onDone(user);
    } catch (err) {
      setError({
        title: ERROR_TITLES[err.kind] || ERROR_TITLES[API_ERROR.SERVER],
        message: err.message || 'Login gagal karena kesalahan yang tidak diketahui.',
        tone: err.kind === API_ERROR.AUTH ? 'alert' : 'warning',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel kiri: editorial brand */}
      <div className="hidden lg:flex ai-aurora relative overflow-hidden p-12 flex-col justify-between text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:18px_18px]" />
        <a href="/" className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur">
            <Bus className="w-5 h-5" />
          </div>
          <span className="font-display font-extrabold text-xl leading-tight line-clamp-2">
            {company.name}
          </span>
        </a>

        <div className="relative space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-ticket-gold" />
            Pusat Operasional Armada
          </div>
          <h1 className="font-display font-extrabold text-5xl leading-[1.05] tracking-tight">
            Kendalikan armada, reservasi & omset dalam satu layar.
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Kelola reservasi, pantau utilisasi armada, dan tinjau performa operasional dari satu panel.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[['2', 'Unit Armada'], ['33', 'Kursi / Bus'], ['24/7', 'Dispatch']].map(([v, l]) => (
              <div key={l} className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="font-mono font-extrabold text-2xl text-ticket-gold">{v}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          Akses terenkripsi • Sesi diverifikasi server
        </div>
      </div>

      {/* Panel kanan: form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-obsidian flex items-center justify-center text-white">
              <Bus className="w-5 h-5" />
            </div>
            <span className="font-display font-extrabold text-sm text-obsidian leading-tight line-clamp-2">{company.name}</span>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-cobalt/10 text-cobalt flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="font-display font-extrabold text-3xl text-obsidian tracking-tight">Masuk Panel Admin</h2>
            <p className="text-sm text-caption">Akses panel operasional PO. Trevel.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Email</span>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@trevelwisata.id"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-obsidian focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt"
                  />
                </div>
            </label>
            <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex justify-between">
                  Kata Sandi
                </span>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-obsidian focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt"
                  />
                </div>
            </label>

            {error && (
              <div
                role="alert"
                className={error.tone === 'alert'
                  ? 'p-3 rounded-xl bg-alert-subtle border border-rose-200 text-xs text-alert space-y-1'
                  : 'p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1'}
              >
                <p className="font-bold">{error.title}</p>
                <p className="font-medium leading-relaxed">{error.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl bg-obsidian hover:bg-cobalt text-white text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {busy ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi…</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Bukan staf?{' '}
            <a href="/" className="text-cobalt font-semibold hover:underline">Kembali ke situs Trevel</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
