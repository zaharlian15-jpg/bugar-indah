import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Award, 
  Wrench, 
  Users, 
  HeartHandshake,
  Compass,
  Bus
} from 'lucide-react';
import { COMPANY_ADDRESS, COMPANY_MAP_EMBED_URL, COMPANY_MAP_URL, COMPANY_NAME } from '../data/catalog';

export default function HomeHero({ onSelectTab, onQuickBookDestination }) {
  const stats = [
    { value: '99.8%', label: 'On-Time Departure', sub: 'Keandalan Waktu Armada' },
    { value: '1.450+', label: 'Trip Berhasil', sub: 'Ekskursi Jawa Timur & Bali' },
    { value: '4.9/5', label: 'Skor Kepuasan Biro', sub: 'Dari 50+ Biro Rekanan' },
    { value: '100%', label: 'Lolos Uji KIR & Berizin', sub: 'Dishub & Kemenhub RI' },
  ];

  const popularRoutes = [
    {
      id: 'bromo',
      title: 'Sunrise Bromo & Lautan Pasir',
      location: 'Probolinggo & Pasuruan',
      duration: '2 Hari 1 Malam',
      distance: '~140 km via Tol Gempol',
      recommendedBus: 'Cocomelon (Avante H8)',
      terrain: 'Rute Menanjak & Dingin Ekstrem',
      description: 'Penjemputan tengah malam dari Surabaya/Malang menuju Sukapura Bromo dengan suspensi empuk anti guncangan.',
      tags: ['Populer', 'Tanjakan Curam', 'Pemandangan']
    },
    {
      id: 'ijen-baluran',
      title: 'Kawah Ijen & Afrika Van Java Baluran',
      location: 'Banyuwangi & Situbondo',
      duration: '3 Hari 2 Malam',
      distance: '~290 km Jalur Pantura',
      recommendedBus: 'Zotopia (Jetbus 5)',
      terrain: 'Jalur Tol Trans Jawa + Hutan',
      description: 'Eksplorasi api biru Ijen dan savana luas Baluran. Bagasi luas menampung ransel hiking dan oleh-oleh khas.',
      tags: ['Eksotis', 'Jarak Jauh', 'Dual AC Ducting']
    },
    {
      id: 'batu-malang',
      title: 'Wisata Edukasi Kota Batu & Malang',
      location: 'Kota Batu & Malang Raya',
      duration: '2 - 3 Hari',
      distance: '~95 km via Tol Mapan',
      recommendedBus: 'Zotopia atau Cocomelon',
      terrain: 'Perbukitan Sejuk & Wisata Keluarga',
      description: 'Kunjungan Jatim Park 1-3, Museum Angkut, BNS, hingga petik apel dengan interior kabin karaoke Smart TV.',
      tags: ['Family Gathering', 'Karaoke On', 'Full AC']
    },
    {
      id: 'sarangan',
      title: 'Telaga Sarangan & Tawangmangu',
      location: 'Magetan & Karanganyar',
      duration: '2 Hari 1 Malam',
      distance: '~180 km Jalur Cemorosewu',
      recommendedBus: 'Cocomelon (Avante H8)',
      terrain: 'Tanjakan Gunung Lawu',
      description: 'Menikmati sate kelinci di tepi danau vulkanik Sarangan dengan transmisi kuat serta driver berpengalaman.',
      tags: ['Pegunungan', 'Panorama Lawu', 'Air Suspension']
    },
    {
      id: 'bali-overland',
      title: 'Ekspedisi Bali Overland Sunset',
      location: 'Denpasar, Kuta & Bedugul',
      duration: '4 - 5 Hari',
      distance: '~430 km via Penyeberangan',
      recommendedBus: 'Zotopia (Jetbus 5)',
      terrain: 'Rute Lintas Provinsi & Feri',
      description: 'Perjalanan panjang santai dengan kursi Alcantara reclining, dispenser kopi/teh, dan charging port di setiap baris.',
      tags: ['Long Trip', 'VIP Comfort', 'Full Entertainment']
    }
  ];

  const safetyPillars = [
    {
      icon: Wrench,
      title: 'Pemeriksaan Fisik 24 Titik Harian',
      desc: 'Setiap bus menjalani pra-uji ketat sebelum kunci diserahkan: rem angin ganda, tekanan ban, suspensi udara, hingga sistem kelistrikan & AC.'
    },
    {
      icon: Users,
      title: 'Driver Berlisensi Khusus & Sopan',
      desc: 'Kru kami memegang SIM BII Umum aktif, melewati tes bebas alkohol & narkoba berkala, serta dibekali pelatihan tata krama biro bintang lima.'
    },
    {
      icon: ShieldCheck,
      title: 'Peralatan Tanggap Darurat & Kotak P3K',
      desc: 'Dilengkapi 2 tabung APAR serbuk kimia, palu pemecah kaca darurat di tiap pilar jendela, pintu darurat atas, serta kotak obat standar medis.'
    },
    {
      icon: Award,
      title: 'Asuransi Penumpang Resmi',
      desc: 'Seluruh armada dilindungi proteksi Jasa Raharja dan asuransi komprehensif perjalanan wisata demi ketenangan total penyewa dan penumpang.'
    }
  ];

  return (
    <div className="space-y-16 py-6 pb-20">
      
      {/* Editorial Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-white text-obsidian p-8 sm:p-12 lg:p-16 border border-slate-200/90 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.06)]">
        {/* Subtle Architectural Dot Pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_top_left,black_40%,transparent_80%)]" />
        
        {/* Watermark Monogram */}
        <div className="pointer-events-none absolute -right-8 -bottom-10 opacity-[0.03] select-none text-obsidian font-display font-black text-[160px] leading-none">
          TRV
        </div>
        
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cobalt" />
            <span>{COMPANY_NAME}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.08] text-obsidian">
            Standar Baru Perjalanan Wisata di{' '}
            <span className="text-cobalt">Jawa Timur & Bali.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal max-w-2xl leading-relaxed">
            Menghadirkan layanan transportasi bus pariwisata eksekutif dengan armada karoseri terkini, 
            kabin kedap suara bersuspensi udara murni, komitmen keselamatan nol insiden, 
            dan transparansi reservasi digital real-time untuk biro perjalanan profesional.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onSelectTab('reservasi')}
              className="px-6 py-3.5 rounded-xl bg-obsidian hover:bg-slate-800 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Pesan Armada Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectTab('katalog')}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-obsidian font-semibold text-sm transition-all duration-200 border border-slate-200 hover:border-slate-300 shadow-2xs flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Lihat Armada Kami</span>
            </button>
            <a
              href={COMPANY_MAP_URL}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-obsidian font-semibold text-sm transition-all border border-slate-200 hover:border-slate-300 shadow-2xs flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-cobalt" />
              <span>Lokasi PO</span>
            </a>
          </div>
        </div>

        {/* Floating Fleet Badge */}
        <div className="relative z-10 mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-display font-extrabold text-obsidian tracking-tight">
                {item.value}
              </div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-cobalt">
                {item.label}
              </div>
              <div className="text-[11px] text-caption">
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-[1.35fr_1fr]">
        <div className="min-h-[280px] bg-slate-100 sm:min-h-[360px]">
          <iframe
            title={`Peta lokasi ${COMPANY_NAME}`}
            src={COMPANY_MAP_EMBED_URL}
            className="h-full min-h-[280px] w-full border-0 sm:min-h-[360px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-9">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cobalt">
            <MapPin className="h-4 w-4" /> Lokasi PO
          </div>
          <h2 className="font-display text-2xl font-extrabold text-obsidian">Kunjungi {COMPANY_NAME}</h2>
          <address className="not-italic text-sm leading-relaxed text-slate-600">{COMPANY_ADDRESS}</address>
          <a
            href={COMPANY_MAP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-cobalt px-4 py-2.5 text-sm font-bold text-white hover:bg-cobalt-hover"
          >
            <MapPin className="h-4 w-4" /> Buka petunjuk arah
          </a>
        </div>
      </section>

      {/* Fleet Spotlight Quick Banner */}
      <section className="bg-surface rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-tactile">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                2 Unit Royal Coach Siap Dinas
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-obsidian">
              Kenyamanan Tertinggi Bagi Tamu Istimewa Anda
            </h2>
            <p className="text-sm text-caption">
              Unit "Zotopia" (Jetbus 5 Royal Coach) dan "Cocomelon" (Avante H8 Prime) dirancang dengan interior 33 kursi lapang, Smart Karaoke, dan coolbox siap melayani tur keluarga, dinas instansi, hingga ziarah.
            </p>
          </div>

          <button
            onClick={() => onSelectTab('katalog')}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:border-obsidian text-obsidian text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 bg-slate-50 hover:bg-white"
          >
            <Bus className="w-4 h-4 text-cobalt" />
            <span>Lihat Spesifikasi & Denah Kursi</span>
          </button>
        </div>
      </section>

      {/* Interactive Popular Routes Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cobalt mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Destinasi Favorit Jawa Timur & Bali</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-obsidian">
              Jelajahi Rute Wisata Paling Diminati
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-caption max-w-md">
            Pilihan rute terpopuler dengan estimasi waktu, rekomendasi tipe armada, dan kesiapan pengemudi berlisensi medan khusus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularRoutes.map((route) => (
            <div 
              key={route.id}
              className="bg-surface rounded-2xl border border-slate-200 p-5 shadow-subtle hover:shadow-lifted transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cobalt" />
                    {route.duration}
                  </span>
                  <span className="text-[11px] font-semibold text-caption flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-600" />
                    {route.location}
                  </span>
                </div>

                <h3 className="text-lg font-display font-bold text-obsidian group-hover:text-cobalt transition-colors">
                  {route.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {route.description}
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Rekomendasi Armada:</span>
                    <span className="font-semibold text-obsidian">{route.recommendedBus}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Karakter Medan:</span>
                    <span className="font-medium text-amber-700">{route.terrain}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {route.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (onQuickBookDestination) {
                      onQuickBookDestination(route.title);
                    } else {
                      onSelectTab('reservasi');
                    }
                  }}
                  className="text-xs font-bold text-cobalt group-hover:translate-x-0.5 transition-all flex items-center gap-1"
                >
                  <span>Pesan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety First & Crew SOP Section */}
      <section className="relative overflow-hidden rounded-3xl bg-obsidian text-white p-8 sm:p-12 border border-slate-800 shadow-ticket">
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="relative z-10 space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Safety First Standard Operating Procedure</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Komitmen Nol Insiden & Kru Profesional
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Keselamatan penumpang adalah prioritas mutlak {COMPANY_NAME}. Kami menerapkan 4 pilar pengawasan operasional yang tidak dapat dinegosiasikan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {safetyPillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cobalt/20 border border-cobalt/30 flex items-center justify-center text-cobalt-light">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-white">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Seluruh dokumen armada (STNK, Trayek Wisata, Uji KIR Elektronik Blue) dapat diperiksa langsung di kantor operasional.</span>
            </div>
            <div className="font-mono text-emerald-400 text-[11px] shrink-0 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800">
              DISPERHUB JATIM CERTIFIED #2026-TRV
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
