// Katalog armada & mitra resmi PO. Trevel — dipakai oleh frontend dan Netlify Server.
import { useState, useEffect } from 'react';

export const DEFAULT_SETTINGS = {
  name: 'PO Bus Pariwisata Bugar Indah Sejahtera',
  address: 'CMX2+7M8, Manding, Purwosari, Kec. Wonoasri, Kabupaten Madiun, Jawa Timur 63157',
  mapUrl: 'https://www.google.com/maps/place/PO+BUS+PARIWISATA+BUGAR+INDAH+SEJAHTERA/@-7.5518315,111.6517124,17z/data=!3m1!4b1!4m6!3m5!1s0x2e79c7ef2c359b27:0x5d0e2ff1e2aa53e8!8m2!3d-7.5518315!4d111.6517124!16s%2Fg%2F11hcfdhnmj?entry=ttu&g_ep=EgoyMDI2MTExNy4wIKXMDSoASAFQAw%3D%3D',
  mapEmbedUrl: 'https://www.google.com/maps?q=-7.5518315,111.6517124&z=17&output=embed',
  whatsapp: '6281234567890',
  whatsappDisplay: '0812-3456-7890',
  phone: '0812-3456-7890',
  reservationPhone: '0343-631234',
  email: 'charter@trevelwisata.id',
  license: '503/108/KPTS/DISPERHUB/2024',
  bankName: 'Bank BCA',
  bankAccount: '1234-5678-90',
  bankHolder: 'PO Bugar Indah Sejahtera',
};

export function getCompanySettings() {
  try {
    const saved = localStorage.getItem('trevel_company_settings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function saveCompanySettings(newSettings) {
  try {
    const current = getCompanySettings();
    const merged = { ...current, ...newSettings };
    localStorage.setItem('trevel_company_settings', JSON.stringify(merged));
    window.dispatchEvent(new Event('trevel_settings_updated'));
    return merged;
  } catch (e) {
    // ignore
  }
  return newSettings;
}

export function useCompanySettings() {
  const [settings, setSettings] = useState(getCompanySettings);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getCompanySettings());
    };
    window.addEventListener('trevel_settings_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('trevel_settings_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return settings;
}

// Backward compatibility static constants
export const COMPANY_NAME = DEFAULT_SETTINGS.name;
export const COMPANY_ADDRESS = DEFAULT_SETTINGS.address;
export const COMPANY_MAP_URL = DEFAULT_SETTINGS.mapUrl;
export const COMPANY_MAP_EMBED_URL = DEFAULT_SETTINGS.mapEmbedUrl;
export const COMPANY_WHATSAPP = DEFAULT_SETTINGS.whatsapp;
export const COMPANY_WHATSAPP_DISPLAY = DEFAULT_SETTINGS.whatsappDisplay;

export const FLEET_DATA = [
  {
    id: 'zotopia',
    name: 'Zotopia',
    bodyType: 'Jetbus 5 Royal Coach Single Glass',
    chassis: 'Mercedes-Benz OH 1626 Air Suspension',
    plateNumber: 'N 7122 UZ',
    capacity: 33,
    seatLayout: '2-2 + 5 kursi baris belakang',
    dailyRate: 3500000,
    status: 'Siap Dinas',
    year: 2025,
    tagline: 'Kemewahan Suspensi Udara & Akustik Suara Jernih JBL',
    colorHex: '#1D4ED8',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    facilities: [
      'AC Ducting Individual Louver',
      'Reclining Seats 2-2 Alcantara Fabric',
      'Smart TV Karaoke 43" + JBL Sound System',
      'Port USB Type-A & Type-C Tiap Baris',
      'Dispenser Air Panas & Coolbox Dingin',
      'Bagasi Luas Tembus Kanan-Kiri',
      'Lampu Baca LED & Ambiance Cabin Light',
      'Air Purifier Medis HEPA Filter'
    ]
  },
  {
    id: 'cocomelon',
    name: 'Cocomelon',
    bodyType: 'Avante H8 Prime Facelift',
    chassis: 'Hino RN 285 Custom Air Suspension',
    plateNumber: 'N 7890 UZ',
    capacity: 33,
    seatLayout: '2-2 + 5 kursi baris belakang',
    dailyRate: 3500000,
    status: 'Siap Dinas',
    year: 2024,
    tagline: 'Visibilitas Pandangan Ekstra Luas dengan Kaca Aerodinamis',
    colorHex: '#059669',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
    facilities: [
      'AC Ducting Individual Louver',
      'Reclining Seats 2-2 Ergonomic Plush',
      'Dual TV 32" Depan & Tengah + Subwoofer',
      'Fast Charging Port USB Tiap Kursi',
      'Dispenser Teh/Kopi & Kulkas Mini',
      'Bagasi Ekstra Tinggi Muat Kargo Sepeda',
      'Tirai UV Protection Block 99%',
      'Sistem Suspensi Udara Terkalibrasi'
    ]
  }
];

export const PARTNERS_DATA = [
  {
    id: '1',
    name: 'Putra Jaya',
    pic: 'Bpk. Putra Jaya',
    phone: '081234500001',
    city: 'Surabaya',
    tier: 'Mitra Prioritas',
    totalTrips: 18,
    rating: 4.9
  },
  {
    id: '2',
    name: 'Garasi',
    pic: 'Pengelola Garasi',
    phone: '081234500002',
    city: 'Sidoarjo',
    tier: 'Mitra Prioritas',
    totalTrips: 14,
    rating: 4.8
  },
  {
    id: '3',
    name: 'Royal Holiday',
    pic: 'Admin Royal Holiday',
    phone: '081234500003',
    city: 'Malang',
    tier: 'Mitra Prioritas',
    totalTrips: 12,
    rating: 4.9
  },
  {
    id: '4',
    name: 'Mutiara Tour',
    pic: 'Admin Mutiara Tour',
    phone: '081234500004',
    city: 'Gresik',
    tier: 'Mitra Reguler',
    totalTrips: 9,
    rating: 4.7
  },
  {
    id: '5',
    name: 'BD Jaya',
    pic: 'Admin BD Jaya',
    phone: '081234500005',
    city: 'Mojokerto',
    tier: 'Mitra Reguler',
    totalTrips: 8,
    rating: 4.7
  },
  {
    id: '6',
    name: 'Deka Trans',
    pic: 'Admin Deka Trans',
    phone: '081234500006',
    city: 'Surabaya',
    tier: 'Mitra Reguler',
    totalTrips: 6,
    rating: 4.6
  }
];

export const BOOKING_STATUSES = ['Menunggu Konfirmasi', 'Terkonfirmasi', 'Selesai', 'Dibatalkan'];
