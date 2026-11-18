'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function AdminHome() {
  const { toast } = useApp();
  const [stats, setStats] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [mode, setMode] = useState(null);

  useEffect(() => {
    api('/admin/stats').then(setStats).catch((e) => toast(e.message, 'error'));
    api('/admin/prizes').then((d) => setPrizes(d.prizes)).catch((e) => toast(e.message, 'error'));
    api('/admin/payment-mode').then(setMode).catch((e) => toast(e.message, 'error'));
  }, [toast]);

  async function switchMode(m) {
    try {
      setMode(await api('/admin/payment-mode', { method: 'PUT', body: { mode: m } }));
      toast(m === 'mock' ? 'Mock payment is ON (fake, free cards)' : 'Normal payment is ON');
    } catch (e) { toast(e.message, 'error'); }
  }

  return (
    <>
      {stats && (
        <div className="ad-stats">
          <div className="ad-stat"><b>{stats.prizes}</b><span>Prizes</span></div>
          <div className="ad-stat"><b>{stats.cardsSold}</b><span>Cards sold</span></div>
          <div className="ad-stat"><b>{stats.sales.toLocaleString()}</b><span>Real sales (ETB)</span></div>
          <div className="ad-stat"><b>{stats.members}</b><span>Members</span></div>
        </div>
      )}

      {mode && (
        <div className="ad-card">
          <b>Payment mode</b>
          <p className="ed-sub" style={{ margin: '4px 0 0' }}>
            Now: <b style={{ color: mode.mode === 'mock' ? 'var(--gold)' : 'var(--glow)' }}>{mode.mode === 'mock' ? 'MOCK (fake payment)' : 'NORMAL (real payment, you approve)'}</b>
          </p>
          <div className="ad-row">
            <button className={`ed-btn ed-btn-sm ${mode.mode === 'mock' ? 'ed-btn-gold' : 'ed-btn-ghost'}`} onClick={() => switchMode('mock')}>Mock · for showing people live</button>
            <button className={`ed-btn ed-btn-sm ${mode.mode === 'chapa' ? 'ed-btn-primary' : 'ed-btn-ghost'}`} onClick={() => switchMode('chapa')}>Normal · real payment</button>
          </div>
          <p className="ed-sub" style={{ marginTop: 10 }}>
            Mock gives anyone a free card, so only keep it on while you demo. Switch to Normal before real people buy.
            {!mode.cloudinary && ' Images are saved on this computer: add the Cloudinary keys in backend/.env.'}
          </p>
        </div>
      )}

      {prizes.map((p) => (
        <div key={p.id} className="ad-card">
          <b>{p.title}</b> <span className="ad-pill">{p.status === 'COMING_SOON' ? 'COMING SOON' : p.status}</span>
          <p className="ed-sub">
            {p.status === 'COMING_SOON' ? 'Not on sale yet' : `${p.sold}/${p.totalCards} sold · ${p.price} ETB · ${p.places.length} winning place(s)`}
          </p>
          <div className="ad-row"><Link className="ed-btn ed-btn-primary ed-btn-sm" href={`/admin/prizes/${p.id}`}>Manage</Link></div>
        </div>
      ))}
      {prizes.length === 0 && <p className="ed-sub">No prizes yet. Create your first one.</p>}
    </>
  );
}