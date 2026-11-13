'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

// Owner photo, bio and contact links shown on the About page
const FIELDS = [
  ['ownerName', 'Your name'], ['ownerTitle', 'Title'], ['bioEn', 'Bio (English)'], ['bioAm', 'Bio (Amharic)'],
  ['telegram', 'Telegram username or link'], ['phone', 'Phone number'], ['tiktok', 'TikTok username or link'], ['email', 'Email'], ['location', 'Location'],
];

export default function Settings() {
  const { toast } = useApp();
  const [f, setF] = useState(null);
  const [file, setFile] = useState(null);
  useEffect(() => { api('/about').then((d) => setF(d.about)); }, []);
  if (!f) return <p className="ed-sub">Loading…</p>;

  async function save(e) {
    e.preventDefault();
    const form = new FormData();
    FIELDS.forEach(([k]) => form.append(k, f[k] || ''));
    if (file) form.append('photo', file);
    try { setF((await api('/admin/about', { method: 'PUT', form })).about); toast('Saved'); } catch (err) { toast(err.message, 'error'); }
  }

  return (
    <form className="ad-form" onSubmit={save}>
      <h1 style={{ marginBottom: 14 }}>About & contact</h1>
      <label className="ed-field"><span>Your photo (shown in a circle)</span><input className="ed-input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ paddingTop: 11 }} /></label>
      {FIELDS.map(([k, label]) => (
        <label key={k} className="ed-field"><span>{label}</span>
          {k.startsWith('bio') ? <textarea className="ed-input" value={f[k] || ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
            : <input className="ed-input" value={f[k] || ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
        </label>
      ))}
      <button className="ed-btn ed-btn-primary" type="submit">Save changes</button>
    </form>
  );
}
