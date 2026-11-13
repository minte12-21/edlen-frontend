'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

// Create a prize: cards, price, winning places and their draw order
export default function NewPrize() {
  const router = useRouter();
  const { toast } = useApp();
  const [f, setF] = useState({ title: '', description: '', totalCards: 100, price: 100, maxPerUser: 5 });
  const [places, setPlaces] = useState([{ rank: 1, name: '', drawOrder: 1 }]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setPlace = (i, k, v) => setPlaces(places.map((p, j) => (j === i ? { ...p, [k]: v } : p)));

  async function submit(e) {
    e.preventDefault();
    setError('');
    const form = new FormData();
    Object.entries(f).forEach(([k, v]) => form.append(k, v));
    form.append('places', JSON.stringify(places.map((p) => ({ ...p, rank: Number(p.rank), drawOrder: Number(p.drawOrder) }))));
    if (file) form.append('image', file);
    try { const d = await api('/admin/prizes', { method: 'POST', form }); toast('Prize created'); router.push(`/admin/prizes/${d.prize.id}`); }
    catch (err) { setError(err.message); }
  }

  return (
    <form className="ad-form" onSubmit={submit}>
      <h1 style={{ marginBottom: 14 }}>New prize</h1>
      <label className="ed-field"><span>Prize image</span><input className="ed-input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ paddingTop: 11 }} /></label>
      <label className="ed-field"><span>Title</span><input className="ed-input" required value={f.title} onChange={set('title')} placeholder="iPad" /></label>
      <label className="ed-field"><span>Description</span><textarea className="ed-input" value={f.description} onChange={set('description')} /></label>
      <div className="ad-two">
        <label className="ed-field"><span>Total cards</span><input className="ed-input" type="number" min="2" required value={f.totalCards} onChange={set('totalCards')} /></label>
        <label className="ed-field"><span>Card price (ETB)</span><input className="ed-input" type="number" min="1" required value={f.price} onChange={set('price')} /></label>
      </div>
      <label className="ed-field"><span>Max cards per person</span><input className="ed-input" type="number" min="1" required value={f.maxPerUser} onChange={set('maxPerUser')} /></label>
      <p style={{ fontWeight: 800, margin: '8px 0' }}>Winning places <small style={{ color: 'var(--muted)' }}>(rank, prize name, draw order)</small></p>
      {places.map((p, i) => (
        <div key={i} className="ad-place">
          <input className="ed-input" type="number" min="1" value={p.rank} onChange={(e) => setPlace(i, 'rank', e.target.value)} aria-label="Rank" />
          <input className="ed-input" required value={p.name} onChange={(e) => setPlace(i, 'name', e.target.value)} placeholder="Prize name" />
          <input className="ed-input" type="number" min="1" value={p.drawOrder} onChange={(e) => setPlace(i, 'drawOrder', e.target.value)} aria-label="Draw order" />
          <button type="button" onClick={() => setPlaces(places.filter((_, j) => j !== i))} disabled={places.length === 1}>×</button>
        </div>
      ))}
      <button type="button" className="ed-btn ed-btn-ghost ed-btn-sm" style={{ color: 'var(--ink)', background: '#e3efe7' }}
        onClick={() => setPlaces([...places, { rank: places.length + 1, name: '', drawOrder: places.length + 1 }])}>+ Add place</button>
      {error && <div className="ed-error">{error}</div>}
      <button className="ed-btn ed-btn-primary" style={{ marginTop: 16 }} type="submit">Create prize</button>
    </form>
  );
}
