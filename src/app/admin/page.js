'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function AdminHome() {
  const { toast } = useApp();
  const [stats, setStats] = useState(null);
  const [prizes, setPrizes] = useState([]);
  useEffect(() => {
    api('/admin/stats').then(setStats).catch((e) => toast(e.message, 'error'));
    api('/admin/prizes').then((d) => setPrizes(d.prizes)).catch((e) => toast(e.message, 'error'));
  }, [toast]);
  return (
    <>
      {stats && (
        <div className="ad-stats">
          <div className="ad-stat"><b>{stats.prizes}</b><span>Prizes</span></div>
          <div className="ad-stat"><b>{stats.cardsSold}</b><span>Cards sold</span></div>
          <div className="ad-stat"><b>{stats.sales.toLocaleString()}</b><span>Sales (ETB)</span></div>
          <div className="ad-stat"><b>{stats.members}</b><span>Members</span></div>
        </div>
      )}
      {prizes.map((p) => (
        <div key={p.id} className="ad-card">
          <b>{p.title}</b> <span className="ad-pill">{p.status}</span>
          <p className="ed-sub">{p.sold}/{p.totalCards} sold · {p.price} ETB · {p.places.length} winning place(s)</p>
          <div className="ad-row"><Link className="ed-btn ed-btn-primary ed-btn-sm" href={`/admin/prizes/${p.id}`}>Manage</Link></div>
        </div>
      ))}
      {prizes.length === 0 && <p className="ed-sub">No prizes yet. Create your first one.</p>}
    </>
  );
}
