'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

// Everything here is optional. Empty fields are simply hidden on the About page.
const FIELDS = [
  ['ownerName', 'Your name', 'Bebi Mesfin'],
  ['ownerTitle', 'Title', 'Owner & Developer'],
  ['bioEn', 'Bio (English)', 'A short line about you'],
  ['bioAm', 'Bio (Amharic)', 'ስለ እርስዎ አጭር መግለጫ'],
  ['telegram', 'Telegram username or link', '@username'],
  ['phone', 'Phone number', '0911 123 456'],
  ['tiktok', 'TikTok username or link', '@username'],
  ['email', 'Email', 'you@example.com'],
  ['location', 'Location', 'Jimma University'],
];

export default function Settings() {
  const { toast } = useApp();
  const [f, setF] = useState(null);
  const [file, setFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  useEffect(() => { api('/about').then((d) => setF(d.about)).catch((e) => toast(e.message, 'error')); }, [toast]);
  if (!f) return <p className="ed-sub">Loading…</p>;

  async function save(e) {
    e.preventDefault();
    const form = new FormData();
    FIELDS.forEach(([k]) => form.append(k, f[k] || ''));
    if (file) form.append('photo', file);
    else if (removePhoto) form.append('removePhoto', 'true');
    try {
      setF((await api('/admin/about', { method: 'PUT', form })).about);
      setFile(null);
      setRemovePhoto(false);
      toast('Saved');
    } catch (err) { toast(err.message, 'error'); }
  }

  return (
    <form className="ad-form" onSubmit={save}>
      <h1 style={{ marginBottom: 6 }}>About & contact</h1>
      <p className="ed-sub" style={{ color: 'var(--muted)', marginBottom: 14 }}>Everything is optional. Leave a field empty and it will not show on the site.</p>
      <label className="ed-field"><span>Your photo (shown in a circle)</span><input className="ed-input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ paddingTop: 11 }} /></label>
      {f.photoUrl && (
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, fontWeight: 700 }}>
          <input type="checkbox" checked={removePhoto} onChange={(e) => setRemovePhoto(e.target.checked)} /> Remove my current photo
        </label>
      )}
      {FIELDS.map(([k, label, ph]) => (
        <label key={k} className="ed-field"><span>{label}</span>
          {k.startsWith('bio')
            ? <textarea className="ed-input" value={f[k] || ''} placeholder={ph} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
            : <input className="ed-input" value={f[k] || ''} placeholder={ph} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
        </label>
      ))}
      <button className="ed-btn ed-btn-primary" type="submit">Save changes</button>
    </form>
  );
}