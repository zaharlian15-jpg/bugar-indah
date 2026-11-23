import React, { useState } from 'react';
import { Bus, ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { formatIDR } from '../utils';

const emptyFleetForm = {
  name: '',
  plateNumber: '',
  capacity: 33,
  status: 'Tersedia',
  dailyRate: 3500000,
  bodyType: '',
  chassis: '',
  year: new Date().getFullYear(),
  tagline: '',
  colorHex: '#1D4ED8',
  image: '',
  imageUpload: null,
  facilitiesText: '',
};

async function compressImageFile(file) {
  if (file.size > 15 * 1024 * 1024) throw new Error('Pilih gambar berukuran di bawah 15 MB.');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Format gambar harus JPG, PNG, atau WebP.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const scale = Math.min(1, 1600 / image.width, 1000 / image.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Browser tidak dapat memproses gambar.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    if (!blob) throw new Error('Gambar gagal dikompres.');
    const preview = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Gambar gagal dibaca.'));
      reader.readAsDataURL(blob);
    });
    const base64 = String(preview).split(',')[1] || '';
    if (base64.length > 2000000) throw new Error('Foto masih terlalu besar setelah dikompres. Pilih gambar lain.');
    return {
      preview,
      upload: { base64, mimeType: 'image/jpeg', name: file.name.replace(/\.[^.]+$/, '') + '.jpg' },
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function formFromBus(bus) {
  return {
    name: bus.name || '',
    plateNumber: bus.plateNumber || '',
    capacity: bus.capacity || 33,
    status: bus.status || 'Tersedia',
    dailyRate: bus.dailyRate || 3500000,
    bodyType: bus.bodyType || '',
    chassis: bus.chassis || '',
    year: bus.year || new Date().getFullYear(),
    tagline: bus.tagline || '',
    colorHex: bus.colorHex || '#1D4ED8',
    image: bus.image || '',
    imageUpload: null,
    facilitiesText: (bus.facilities || []).join('\n'),
  };
}

function toFleetPayload(form) {
  return {
    ...form,
    capacity: Number(form.capacity),
    dailyRate: Number(form.dailyRate),
    year: Number(form.year),
    facilities: form.facilitiesText.split(/[\n,;]/).map((value) => value.trim()).filter(Boolean),
  };
}

export default function FleetManager({ fleet = [], onCreate, onUpdate, onDelete }) {
  const [selected, setSelected] = useState(undefined);
  const [form, setForm] = useState(emptyFleetForm);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openCreate = () => {
    setSelected(null);
    setForm(emptyFleetForm);
    setImagePreview('');
    setError('');
  };

  const openEdit = (bus) => {
    setSelected(bus);
    setForm(formFromBus(bus));
    setImagePreview('');
    setError('');
  };

  const closeForm = () => {
    setSelected(undefined);
    setError('');
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value, ...(name === 'image' ? { imageUpload: null } : {}) }));
    if (name === 'image') setImagePreview('');
  };

  const handleImageFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const result = await compressImageFile(file);
      setForm((current) => ({ ...current, imageUpload: result.upload }));
      setImagePreview(result.preview);
    } catch (imageError) {
      setError(imageError.message || 'Foto gagal diproses.');
    } finally {
      event.target.value = '';
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = toFleetPayload(form);
      if (selected) await onUpdate(selected.databaseId, payload);
      else await onCreate(payload);
      setSelected(undefined);
    } catch (submitError) {
      setError(submitError.message || 'Gagal menyimpan armada.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (bus) => {
    if (!window.confirm(`Hapus armada ${bus.name}?`)) return;
    try {
      await onDelete(bus.databaseId);
    } catch (deleteError) {
      setError(deleteError.message || 'Gagal menghapus armada.');
    }
  };

  const fields = [
    ['name', 'Nama bus', 'text', true],
    ['plateNumber', 'Nomor polisi', 'text', true],
    ['capacity', 'Kapasitas', 'number', true],
    ['dailyRate', 'Tarif per hari (Rp)', 'number', true],
    ['bodyType', 'Tipe bodi', 'text', false],
    ['chassis', 'Sasis', 'text', false],
    ['year', 'Tahun', 'number', false],
    ['tagline', 'Tagline', 'text', false],
    ['image', 'URL foto', 'url', false],
  ];

  return (
    <div className="py-8 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-cobalt">Armada & spesifikasi</div>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-obsidian">Katalog Bus</h1>
          <p className="mt-2 text-sm text-caption">Kelola armada yang ditampilkan pada katalog publik.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-obsidian px-4 py-2.5 text-sm font-bold text-white hover:bg-cobalt">
          <Plus className="h-4 w-4" /> Tambah bus
        </button>
      </header>

      {error && selected === undefined && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      )}

      <div className="overflow-x-auto border-y border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Armada</th>
              <th className="px-4 py-3">Kapasitas</th>
              <th className="px-4 py-3">Tarif / hari</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fleet.map((bus) => (
              <tr key={bus.databaseId || bus.id}>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {bus.image ? (
                      <img src={bus.image} alt={bus.name} className="h-12 w-16 rounded-md border border-slate-200 object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <span className="flex h-12 w-16 items-center justify-center rounded-md bg-slate-100" style={{ color: bus.colorHex }}><Bus className="h-4 w-4" /></span>
                    )}
                    <div>
                      <div className="font-bold text-obsidian">{bus.name}</div>
                      <div className="font-mono text-xs text-caption">{bus.plateNumber}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">{bus.capacity} kursi</td>
                <td className="px-4 py-4 font-mono font-semibold">{formatIDR(bus.dailyRate)}</td>
                <td className="px-4 py-4">{bus.status}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(bus)} title={`Ubah ${bus.name}`} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(bus)} title={`Hapus ${bus.name}`} className="rounded-md border border-rose-200 p-2 text-rose-700 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {fleet.length === 0 && <tr><td colSpan="5" className="px-4 py-12 text-center text-sm text-slate-500">Belum ada data armada di sheet Armada.</td></tr>}
          </tbody>
        </table>
      </div>

      {selected !== undefined && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-obsidian/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeForm()}>
          <form onSubmit={submit} className="my-auto w-full max-w-2xl space-y-5 rounded-xl bg-white p-5 shadow-2xl sm:p-7">
            <header className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="font-display text-xl font-extrabold text-obsidian">{selected ? 'Ubah armada' : 'Tambah armada'}</h2>
                <p className="mt-1 text-xs text-caption">Perubahan disimpan ke sheet Armada.</p>
              </div>
              <button type="button" onClick={closeForm} aria-label="Tutup" className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map(([name, label, type, required]) => (
                <label key={name} className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700">{name === 'image' ? 'URL gambar publik' : label}</span>
                  <input name={name} type={type} required={required} min={type === 'number' ? 1 : undefined} value={form[name]} onChange={updateField} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-cobalt focus:outline-none focus:ring-2 focus:ring-cobalt/20" />
                  {name === 'image' && <span className="block text-[11px] text-caption">Tempel URL publik atau pilih file foto di bawah.</span>}
                </label>
              ))}
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-bold text-slate-700">Upload foto dari perangkat</span>
                <span className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-600">
                  <ImagePlus className="h-4 w-4 text-cobalt" />
                  <span className="flex-1">JPG, PNG, atau WebP; otomatis dikompres</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageFile} className="max-w-[190px] text-xs file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2 file:py-1.5 file:font-semibold" />
                </span>
              </label>
              <div className="sm:col-span-2">
                <div className="mb-1.5 text-xs font-bold text-slate-700">Pratinjau foto katalog</div>
                {imagePreview || form.image ? (
                  <img src={imagePreview || form.image} alt="Pratinjau foto bus" className="h-48 w-full rounded-lg border border-slate-200 bg-slate-100 object-cover" onError={(event) => { event.currentTarget.alt = 'URL gambar tidak dapat dimuat'; }} />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500">Belum ada URL gambar</div>
                )}
                {form.imageUpload && <p className="mt-1.5 text-[11px] font-semibold text-emerald-700">Foto baru siap diunggah ke Google Drive saat disimpan.</p>}
              </div>
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Status</span>
                <select name="status" value={form.status} onChange={updateField} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
                  <option value="Tersedia">Tersedia</option>
                  <option value="Servis">Servis</option>
                  <option value="Tidak Tersedia">Tidak Tersedia</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Warna bus</span>
                <input name="colorHex" type="color" value={form.colorHex} onChange={updateField} className="h-10 w-full rounded-lg border border-slate-300 p-1" />
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-bold text-slate-700">Fasilitas, satu per baris</span>
                <textarea name="facilitiesText" rows="4" value={form.facilitiesText} onChange={updateField} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
              </label>
            </div>

            {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</div>}
            <footer className="flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button type="button" onClick={closeForm} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700">Batal</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-cobalt px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Menyimpan...' : 'Simpan armada'}</button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}
