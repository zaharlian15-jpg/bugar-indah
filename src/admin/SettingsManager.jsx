import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  Building2, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Mail, 
  CreditCard, 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { getCompanySettings, saveCompanySettings, DEFAULT_SETTINGS } from '../data/catalog';

export default function SettingsManager() {
  const [form, setForm] = useState(getCompanySettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Pastikan format nomor WhatsApp internasional (tanpa tanda +, spasi, atau strip)
      let cleanWa = form.whatsapp.replace(/[^0-9]/g, '');
      if (cleanWa.startsWith('0')) {
        cleanWa = '62' + cleanWa.slice(1);
      }
      const updated = {
        ...form,
        whatsapp: cleanWa,
      };
      setForm(updated);
      saveCompanySettings(updated);
      toast.success('Pengaturan PO Bus & Kontak Berhasil Disimpan!', {
        description: 'Nomor WhatsApp admin, alamat, dan informasi kontak langsung diperbarui di seluruh web.',
      });
    } catch (err) {
      toast.error('Gagal menyimpan pengaturan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan semua pengaturan ke nilai default awal?')) {
      saveCompanySettings(DEFAULT_SETTINGS);
      setForm(DEFAULT_SETTINGS);
      toast.info('Pengaturan telah direset ke nilai awal.');
    }
  };

  return (
    <div className="space-y-8 py-2 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cobalt/10 text-cobalt text-xs font-bold uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Konfigurasi PO Bus</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-obsidian tracking-tight">
            Pengaturan Kontak & WhatsApp Admin
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola nomor WhatsApp tujuan formulir reservasi, nomor telepon hotline, alamat garasi, dan rekening bank.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Pengaturan (8/12) */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Kontak WhatsApp & Telepon */}
          <div className="p-6 rounded-3xl bg-surface border border-slate-200/90 shadow-tactile space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-obsidian">WhatsApp Admin & Kontak Hotline</h3>
                <p className="text-[11px] text-slate-500">Nomor ini menjadi tujuan pengiriman form reservasi pemesan.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nomor WhatsApp Admin (Format 62xxx / 08xxx) <span className="text-alert">*</span>
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={form.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    placeholder="Contoh: 6281234567890 atau 081234567890"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Nomor aktif WhatsApp yang menerima pesan pemesanan.</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Format Tampilan Nomor WhatsApp
                </label>
                <input
                  type="text"
                  value={form.whatsappDisplay}
                  onChange={(e) => handleChange('whatsappDisplay', e.target.value)}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Format teks yang dibaca oleh pengunjung.</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Hotline Operasional Biro (24 Jam)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="Contoh: 0812-3456-7890 (24 Jam)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Telepon Layanan Reservasi / Kantor
                </label>
                <input
                  type="text"
                  value={form.reservationPhone}
                  onChange={(e) => handleChange('reservationPhone', e.target.value)}
                  placeholder="Contoh: 0343-631234"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  Email Resmi Reservasi
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Contoh: charter@trevelwisata.id"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Identitas PO Bus & Garasi */}
          <div className="p-6 rounded-3xl bg-surface border border-slate-200/90 shadow-tactile space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-cobalt flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-obsidian">Identitas Perusahaan & Alamat Garasi</h3>
                <p className="text-[11px] text-slate-500">Nama resmi perusahaan otobus dan lokasi pool armada.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Resmi Perusahaan Otobus (PO) <span className="text-alert">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Contoh: PO Bus Pariwisata Bugar Indah Sejahtera"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Alamat Lengkap Garasi & Pool Armada
                </label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Contoh: CMX2+7M8, Manding, Purwosari, Kec. Wonoasri, Kabupaten Madiun, Jawa Timur 63157"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Link Google Maps Garasi (URL)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-alert absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={form.mapUrl}
                    onChange={(e) => handleChange('mapUrl', e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  SK Izin Trayek & Legalitas
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.license}
                    onChange={(e) => handleChange('license', e.target.value)}
                    placeholder="Contoh: SK Izin Trayek: 503/108/KPTS/DISPERHUB/2024"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Rekening Pembayaran Transfer DP */}
          <div className="p-6 rounded-3xl bg-surface border border-slate-200/90 shadow-tactile space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-obsidian">Rekening Pembayaran & Transfer DP</h3>
                <p className="text-[11px] text-slate-500">Informasi rekening resmi untuk konfirmasi pembayaran tiket.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Bank</label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  placeholder="Contoh: Bank BCA"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  value={form.bankAccount}
                  onChange={(e) => handleChange('bankAccount', e.target.value)}
                  placeholder="Contoh: 1234-5678-90"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Atas Nama Rekening</label>
                <input
                  type="text"
                  value={form.bankHolder}
                  onChange={(e) => handleChange('bankHolder', e.target.value)}
                  placeholder="Contoh: PO Bugar Indah Sejahtera"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-cobalt hover:bg-cobalt-hover text-white text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cobalt/30 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}</span>
            </button>
          </div>
        </form>

        {/* Live Preview (4/12) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <div className="p-5 rounded-3xl bg-obsidian text-white space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-ticket-gold text-xs font-mono font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Live Preview Kontak Web</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Nama PO Bus</span>
                <div className="font-display font-extrabold text-base text-white mt-0.5">{form.name}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> Nomor WhatsApp Admin
                </span>
                <div className="font-mono font-bold text-sm text-white">{form.whatsappDisplay || form.whatsapp}</div>
                <a
                  href={`https://wa.me/${form.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-ticket-gold hover:underline flex items-center gap-1 pt-1"
                >
                  <span>Test Link WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Garasi & Pool</span>
                <div className="text-slate-200 text-[11px] leading-relaxed">{form.address}</div>
                {form.mapUrl && (
                  <a
                    href={form.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cobalt-light hover:underline flex items-center gap-1 pt-1"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Lihat di Google Maps</span>
                  </a>
                )}
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-purple-400 font-mono uppercase font-bold flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Rekening Pembayaran DP
                </span>
                <div className="font-bold text-white text-xs">{form.bankName} — {form.bankAccount}</div>
                <div className="text-[11px] text-slate-300">a.n. {form.bankHolder}</div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 pt-2 border-t border-white/10">
              Perubahan nomor WhatsApp & profil akan langsung berlaku di formulir reservasi pemesan secara otomatis.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
