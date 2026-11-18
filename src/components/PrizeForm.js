'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

// Create or edit a prize. Only the title is required.
// A "coming soon" prize can be saved half-empty and launched later.
export default function PrizeForm({ prize = null, lockCards = false, lockPlaces = false }) {
  const router = useRouter();
  const { toast } = useApp();
  const editing = !!prize;
  const wasSoon = editing && prize.status === 'COMING_SOON';

  const [soon, setSoon] = useState(wasSoon);
  const [f, setF] = useState({
    title: prize?.title || '',
    description: prize?.description || '',
    totalCards: prize?.totalCards || (editing ? '' : 100),
    price: prize?.price || (editing ? '' : 100),
    maxPerUser: prize?.maxPerUser || 5,
  });
  const [places, setPlaces] = useState(
    prize?.places?.length
      ? prize.places.map((p) => ({ rank: p.rank, name: p.name, drawOrder: p.drawOrder }))
      : [{ rank: 1, name: '', drawOrder: 1 }],
  );
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setPlace = (i, k, v) => setPlaces(places.map((p, j) => (j === i ? { ...p, [k]: v } : p)));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const form = new FormData();
    ['title', 'description', 'totalCards', 'price', 'maxPerUser'].forEach((k) => form.append(k, f[k]));
    if (!lockPlaces) {
      form.append('places', JSON.stringify(places.map((p) => ({ rank: Number(p.rank), name: p.name, drawOrder: Number(p.drawOrder) }))));
    }
    if (file) form.append('image', file);
    try {
      if (!editing) {
        form.append('comingSoon', String(soon));
        const d = await api('/admin/prizes', { method: 'POST', form });
        toast(soon ? 'Saved as coming soon' : 'Prize created');
        router.push(`/admin/prizes/${d.prize.id}`);
      } else {
        await api(`/admin/prizes/${prize.id}`, { method: 'PUT', form });
        if (wasSoon && !soon) {
          await api(`/admin/prizes/${prize.id}/launch`, { method: 'POST' });
          toast('Prize launched');
        } else {
          toast('Saved');
        }
        router.push(`/admin/prizes/${prize.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const label = !editing ? (soon ? 'Save as coming soon' : 'Create prize') : wasSoon && !soon ? 'Save & launch now' : 'Save changes';

  return (
    <form className="ad-form" onSubmit={submit}>
      <h1 style={{ marginBottom: 14 }}>{editing ? 'Edit prize' : 'New prize'}</h1>

      {(!editing || wasSoon) && (
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 12, borderRadius: 14, background: '#e3f2e8', marginBottom: 14, cursor: 'pointer' }}>
          <input type="checkbox" checked={soon} onChange={(e) => setSoon(e.target.checked)} style={{ width: 20, height: 20, marginTop: 2 }} />
          <span><b>Coming soon</b><br />Show it on the site but do not sell cards yet. Everything below is optional except the title.</span>
        </label>
      )}

      <label className="ed-field"><span>Prize image (optional)</span><input className="ed-input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ paddingTop: 11 }} /></label>
      <label className="ed-field"><span>Title</span><input className="ed-input" required value={f.title} onChange={set('title')} placeholder="iPad" /></label>
      <label className="ed-field"><span>Description (optional)</span><textarea className="ed-input" value={f.description} onChange={set('description')} /></label>

      <div className="ad-two">
        <label className="ed-field"><span>Total cards{soon ? ' (optional)' : ''}</span><input className="ed-input" type="number" min="2" required={!soon} disabled={lockCards} value={f.totalCards} onChange={set('totalCards')} /></label>
        <label className="ed-field"><span>Card price, ETB{soon ? ' (optional)' : ''}</span><input className="ed-input" type="number" min="1" required={!soon} disabled={lockCards} value={f.price} onChange={set('price')} /></label>
      </div>
      <label className="ed-field"><span>Max cards per person</span><input className="ed-input" type="number" min="1" value={f.maxPerUser} onChange={set('maxPerUser')} /></label>
      {lockCards && <p className="ed-sub" style={{ color: 'var(--muted)', marginBottom: 10 }}>Cards and price are locked because people already joined.</p>}

      <p style={{ fontWeight: 800, margin: '8px 0' }}>
        Winning places{soon ? ' (optional)' : ''} <small style={{ color: 'var(--muted)' }}>(rank, prize name, draw order)</small>
      </p>
      {lockPlaces ? (
        <p className="ed-sub" style={{ color: 'var(--muted)', marginBottom: 10 }}>Places are locked because the draw already started.</p>
      ) : (
        <>
          {places.map((p, i) => (
            <div key={i} className="ad-place">
              <input className="ed-input" type="number" min="1" value={p.rank} onChange={(e) => setPlace(i, 'rank', e.target.value)} aria-label="Rank" />
              <input className="ed-input" required={!soon} value={p.name} onChange={(e) => setPlace(i, 'name', e.target.value)} placeholder="Prize name" />
              <input className="ed-input" type="number" min="1" value={p.drawOrder} onChange={(e) => setPlace(i, 'drawOrder', e.target.value)} aria-label="Draw order" />
              <button type="button" onClick={() => setPlaces(places.filter((_, j) => j !== i))} disabled={places.length === 1}>×</button>
            </div>
          ))}
          <button type="button" className="ed-btn ed-btn-ghost ed-btn-sm" style={{ color: 'var(--ink)', background: '#e3efe7' }}
            onClick={() => setPlaces([...places, { rank: places.length + 1, name: '', drawOrder: places.length + 1 }])}>+ Add place</button>
        </>
      )}

      {error && <div className="ed-error">{error}</div>}
      <button className="ed-btn ed-btn-primary" style={{ marginTop: 16 }} type="submit" disabled={busy}>{busy ? 'Saving…' : label}</button>
    </form>
  );
}