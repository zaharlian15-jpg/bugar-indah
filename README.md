# Trevel — Tourism & Fleet Management System

> Sistem Enterprise Operasional & Reservasi Bus Pariwisata Premium Jawa Timur & Bali berbasis React 18 + Vite dengan estetika **High-End Swiss Editorial Transit & Tactile Skeuomorphic Ticket**.

---

## 1. Ikhtisar Aplikasi

**Trevel** (PO. Trevel Wisata Nusantara) adalah platform sistem manajemen armada dan reservasi bus pariwisata eksekutif yang menggabungkan profil perusahaan berstandar internasional dengan sistem enterprise operasional biro perjalanan. Platform ini melayani pemesanan armada bus premium seperti **Zotopia** (Jetbus 5 Royal Coach) dan **Cocomelon** (Avante H8 Prime) dengan kapasitas 33 kursi eksekutif.

Aplikasi ini dirancang dengan konsep desain **Swiss Editorial Transit**, tata letak asimetris berpresisi tinggi, navigasi *floating glassmorphism*, kalender anti-bentrok matrix, denah kursi interaktif, tiket termal taktil dengan stempel berpegas (*spring slam stamp*), serta analitik eksekutif real-time.

---

## 2. Fitur Utama

1. **Floating Glassmorphism Navbar & Real-Time WIB Clock**:
   - Header mengambang dengan efek *backdrop-blur 16px* dan pill navigasi dinamis (*framer-motion layoutId*).
   - Jam berdetik real-time Waktu Indonesia Barat (WIB).
   - Indikator status jaringan (`Server Online` / `Demo Mode`) dan tombol sinkronisasi data manual.

2. **Beranda & Company Profile**:
   - Editorial Hero dengan statistik langsung: On-time departure (99.8%), 1.450+ trip, kepuasan 4.9/5, dan 100% legalitas KIR.
   - Peta interaktif destinasi populer Jawa Timur & Bali (Bromo, Ijen, Batu/Malang, Baluran, Sarangan, Bali Overland).
   - 4 Pilar Standar Operasional Keselamatan Kru & Armada (uji fisik 24 titik, driver berlisensi, APAR/P3K, asuransi Jasa Raharja).

3. **Katalog Armada & Modal Denah Kursi 33 Seats**:
   - Kartu armada interaktif dengan spesifikasi chassis, karoseri, fasilitas, dan tarif harian (Rp3.500.000/hari).
   - Modal denah lantai kabin 33 kursi: konfigurasi 2-2 baris 1 s/d 7, lorong tengah, kursi supir/tour leader, sofa belakang 5 kursi (8A-8E), serta inspeksi fasilitas individual per kursi.
   - Tombol "Pilih Armada Ini & Buat Jadwal" yang mengunci unit dan langsung mengarahkan ke formulir booking.

4. **Mesin Pemesanan Cerdas & Kalender Anti-Bentrok (Booking Engine)**:
   - Split layout desktop: 7/12 Formulir Pintar vs 5/12 Tiket Taktil Sticky Live.
   - Deteksi tabrakan jadwal (*Collision Detection Matrix*): Tanggal terbooking otomatis diarsir, dicoret, dan menampilkan identitas biro pemesan sebelumnya. Rentang yang menabrak jadwal diblokir secara interaktif.
   - Pemilihan biro rekanan, counter penumpang 1-33 kursi dengan indikator persentase okupansi.
   - Kalkulator biaya sewa transparan (biaya harian + estimasi BBM/tol + negosiasi harga kesepakatan).

5. **Tiket Taktil Skeuomorphic (Live Preview & Print Ready)**:
   - Desain tiket cetak termal dengan lubang setengah lingkaran (*radial cut notches*), perforasi sobekan putus-putus, dan barcode SVG Code128.
   - Animasi stempel 3D elastis: Transisi dari stempel kuning `-8°` *"DRAFT RESERVASI"* menjadi stempel hijau tua *"TERKONFIRMASI - RESERVED #ID"* dengan dentuman efek `canvas-confetti`.
   - Format cetak surat jalan rapi (`window.print()`).

6. **Jadwal & Riwayat Operasional (Timeline Gantt & Data Grid)**:
   - Mode Timeline Gantt 30 hari visual: visualisasi blok tanggal dinas aktif vs siaga garasi (idle) untuk armada Zotopia dan Cocomelon.
   - Mode Data Grid: Pencarian instan (biro, bus, rute, kode booking), filter armada, filter status, pengurutan tanggal dan harga.
   - Transformasi responsif mobile menjadi susunan tiket vertikal (*Ticket Stacks*).

7. **Executive Recap & Visualisasi Data Recharts**:
   - Kartu KPI: Total omset tercatat, total hari dinas bus, total wisatawan terangkut, dan nilai rata-rata transaksi.
   - Bar Chart Recharts: Kontribusi nominal omset per biro rekanan wisata.
   - Donut Chart Recharts: Rasio utilisasi hari dinas armada bus.
   - Leaderboard Loyalitas Biro: Peringkat biro berdasarkan frekuensi trip dan total belanja dengan status *"Mitra Prioritas"*.

---

## 3. Daftar Pustaka & Teknologi (Tech Stack)

| Pustaka | Versi | Peran & Fungsi dalam Aplikasi |
| :--- | :--- | :--- |
| **React 18 & React DOM** | `^18.3.1` | Core UI engine, state reactivity, component architecture |
| **Vite** | `^5.4.8` | Modern bundler, hot module replacement, optimized production build |
| **Tailwind CSS** | `^3.4.14` | Utility-first styling, custom design tokens, color palette & grid |
| **Framer Motion** | `^11.11.9` | Spring physics, layoutId navbar pill, entrance micro-interactions |
| **@tanstack/react-query**| `^5.59.0` | Server state management, cache invalidation, optimistic updates |
| **React Hook Form** | `^7.53.0` | Form control, validation, interactive pax & price calculator |
| **Recharts** | `^2.13.0` | Bar Chart kontribusi biro & Donut Chart rasio utilisasi armada |
| **Date-fns** | `^3.6.0` | Manipulasi tanggal, locale bahasa Indonesia (`id`), collision checks |
| **Lucide React** | `^0.453.0` | Ikonografi transportasi, kontrol metrik, status, dan navigasi |
| **Sonner** | `^1.5.0` | Notifikasi toast interaktif |
| **Canvas-Confetti** | `^1.9.3` | Haptik visual pesta konfeti saat tiket berhasil diterbitkan |

---

## 4. Panduan Menjalankan Secara Lokal

### Prasyarat
- Node.js versi 18 atau 20+
- npm atau pnpm

### Langkah Instalasi
```bash
# 1. Masuk ke direktori proyek
cd trevel-management-system

# 2. Instal dependensi
npm install

# 3. Jalankan server pengembangan lokal
npm run dev
```

Server lokal akan berjalan di `http://localhost:8889` (atau port default Vite `http://localhost:5173`).

Data armada dan reservasi menggunakan Google Apps Script yang dikonfigurasi di `src/api.js`. Source Apps Script lengkap siap tempel ada di `apps-script/Code.gs`.

1. Tempel seluruh isi `apps-script/Code.gs` ke editor Google Apps Script yang terikat ke spreadsheet, lalu simpan.
2. Pastikan sheet bernama `Armada`, `Penyewa`, dan `Booking`. Header inti armada: `ID_Armada`, `Nama_Bus`, `Kapasitas`, `Plat_Nomor`, `Status`, `Tarif_Per_Hari`; penyewa: `ID_Penyewa`, `Nama_Biro`, `No_Telepon`, `Alamat`; booking: `ID_Booking`, `ID_Penyewa`, `ID_Armada`, `Tgl_Mulai`, `Tgl_Selesai`, `Tujuan`, `Jumlah_Penumpang`, `Harga`. Script menambahkan kolom metadata armada/booking bila belum tersedia.
3. Muat ulang spreadsheet, buka menu **Trevel Admin > Atur email dan password admin**, lalu buat password kuat minimal 12 karakter. Password baru disimpan memakai PBKDF2-HMAC-SHA-256 dengan salt acak; hash SHA-256 lama dimigrasikan saat login admin pertama yang berhasil setelah script diperbarui.
4. Pilih **Trevel Admin > Aktifkan upload foto bus (Google Drive)** dan setujui izin Drive. Foto yang diunggah admin dikompres di browser, disimpan di folder `Trevel Bus Images`, dan dibagikan sebagai gambar publik untuk katalog.
5. Deploy sebagai **Web app**, jalankan sebagai pemilik script, dan izinkan akses web sesuai kebutuhan situs. Deploy versi baru setelah setiap perubahan kode Apps Script.
6. Jalankan aplikasi dengan `npm run dev`, buka `/admin`, lalu masuk memakai kredensial yang tadi dibuat.


Untuk memastikan Web app sudah memakai kode terbaru, kirim `POST` berisi `{"action":"system.ping"}` ke URL `/exec`. Respons harus memuat `version` yang sama dengan konstanta `BACKEND_VERSION` di `apps-script/Code.gs`. Fungsi `selfTestPasswordHash` dapat dijalankan dari editor Apps Script untuk memeriksa bahwa hash password cocok dengan implementasi bawaan Google dan untuk melihat lama hashing 100.000 iterasi.

Booking baru menghasilkan tautan pelacakan dengan token acak; sheet hanya menyimpan hash token pada kolom `Tracking_Token_Hash`. Tautan tersebut bersifat rahasia dan dapat melihat detail booking, jadi jangan dibagikan secara publik. Booking yang dibuat sebelum fitur ini di-deploy belum memiliki token dan tidak dapat dilacak melalui tautan ini.

Admin menyediakan CRUD reservasi dan CRUD katalog bus. Hapus armada ditolak bila masih memiliki booking aktif. AI Analyst tetap memerlukan backend/API tersendiri. Jangan memasukkan password atau token sesi admin ke frontend, dan jangan gunakan/restore database dump.

### Membangun untuk Produksi
```bash
npm run build
```
Hasil kompilasi siap saji akan berada di direktori `dist/`.

---

## 5. Panduan Pengujian Fitur Khusus

1. **Uji Deteksi Bentrok Jadwal**:
   - Buka menu **Reservasi Baru**.
   - Pilih armada **Zotopia**.
   - Pada kalender, periksa tanggal **23 Oktober 2026**. Tanggal tersebut telah terbooking oleh *Mitra Wisata Tour*.
   - Arahkan kursor ke tanggal 23 untuk melihat tooltip identitas pemesan.
   - Klik tanggal tersebut atau pilih rentang yang melompati tanggal 23; sistem akan menolak dan memberikan peringatan jadwal bentrok.

2. **Uji Penerbitan Tiket & Konfeti**:
   - Pilih tanggal yang kosong (misal 1 November s/d 3 November 2026).
   - Isi tujuan, atur jumlah penumpang, dan klik tombol **"Konfirmasi & Terbitkan Tiket"**.
   - Perhatikan stempel tiket berputar dan terbanting elastis dengan efek konfeti dan pembaruan kode booking otomatis.

3. **Uji Optimistic Updates**:
   - Setelah tiket terbit, buka menu **Jadwal & Riwayat** atau **Executive Recap**.
   - Tiket yang baru dibuat langsung muncul di Data Grid dan grafik omset tanpa perlu memuat ulang peramban (*zero-latency update*).
