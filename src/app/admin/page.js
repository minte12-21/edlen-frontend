'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { api, API_URL, getToken } from '@/lib/api';
import { useApp } from '@/context/Providers';
import { io } from 'socket.io-client';

export default function AdminHome() {
  const { toast } = useApp();
  
  // SWR automatically caches this data
  const { data: stats, error: err1 } = useSWR('/admin/stats', (url) => api(url));
  const { data: prizesData, error: err2 } = useSWR('/admin/prizes', (url) => api(url));
  const { data: mode, error: err3 } = useSWR('/admin/payment-mode', (url) => api(url));

  useEffect(() => {
    if (err1) toast(err1.message, 'error');
    if (err2) toast(err2.message, 'error');
    if (err3) toast(err3.message, 'error');
  }, [err1, err2, err3, toast]);

  useEffect(() => {
    const socket = io(API_URL, { auth: { token: getToken() } });
    socket.emit('join:admin');

    const refresh = () => {
      mutate('/admin/stats');
      mutate('/admin/prizes');
      mutate('/admin/payment-mode');
    };

    socket.on('admin:update', refresh);
    socket.on('number:taken', refresh);

    return () => socket.disconnect();
  }, []);

  async function switchMode(m) {
    try {
      await api('/admin/payment-mode', { method: 'PUT', body: { mode: m } });
      toast(m === 'mock' ? 'Mock payment is ON (fake, free cards)' : 'Normal payment is ON');
      mutate('/admin/payment-mode');
    } catch (e) { toast(e.message, 'error'); }
  }

  const prizes = prizesData?.prizes || [];

  if (!stats && !err1) return <p className="ed-sub">Loading stats...</p>;

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