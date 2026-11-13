'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, download } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function ManagePrize() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useApp();
  const [d, setD] = useState(null);
  const load = useCallback(() => api(`/admin/prizes/${id}/members`).then(setD).catch((e) => toast(e.message, 'error')), [id, toast]);
  useEffect(() => { load(); }, [load]);
  if (!d) return <p className="ed-sub">Loading…</p>;
  const { prize, members } = d;

  async function exportXls() { try { await download(`/admin/prizes/${id}/export`, 'edlen.csv'); } catch (e) { toast(e.message, 'error'); } }
  async function end() {
    if (!confirm('End this prize?\n\nEvery signed-up person of this prize will be REMOVED from the database. Have you exported the Excel file first?')) return;
    try { await api(`/admin/prizes/${id}/end`, { method: 'POST' }); toast('Prize ended'); load(); } catch (e) { toast(e.message, 'error'); }
  }
  async function del() {
    if (!confirm('Delete this prize completely? This cannot be undone.')) return;
    try { await api(`/admin/prizes/${id}`, { method: 'DELETE' }); router.push('/admin'); } catch (e) { toast(e.message, 'error'); }
  }

  return (
    <>
      <div className="ad-card">
        <b style={{ fontSize: 22 }}>{prize.title}</b> <span className="ad-pill">{prize.status}</span>
        <p className="ed-sub">{prize.sold}/{prize.totalCards} sold · {prize.price} ETB · max {prize.maxPerUser} per person · {d.placesDrawn}/{prize.places.length} places drawn</p>
        <p className="ed-sub">Draw order: {[...prize.places].sort((a, b) => a.drawOrder - b.drawOrder).map((p) => `${p.rank}. ${p.name}`).join('  →  ')}</p>
        <div className="ad-row">
          {prize.status === 'CLOSED' && <Link href={`/draw/${id}`} className="ed-btn ed-btn-gold ed-btn-sm">Open live draw screen</Link>}
          <button className="ed-btn ed-btn-ghost ed-btn-sm" onClick={exportXls}>Export to Excel</button>
          {prize.status !== 'ENDED' && <button className="ed-btn ed-btn-danger ed-btn-sm" onClick={end}>End</button>}
          <button className="ed-btn ed-btn-danger ed-btn-sm" onClick={del}>Delete</button>
        </div>
        {prize.status === 'ONGOING' && <p className="ed-sub" style={{ marginTop: 10 }}>The draw unlocks when all {prize.totalCards} cards are sold.</p>}
      </div>
      <div className="ad-table">
        <table>
          <thead><tr><th>Card</th><th>Name</th><th>Phone</th><th>Telegram</th><th>Payment</th><th>Result</th></tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.number} className={m.winner ? 'win' : ''}>
                <td>#{m.number}</td><td>{m.name}</td><td>{m.phone}</td><td>@{m.telegram}</td><td>{m.status}</td>
                <td>{m.winner ? `🏆 ${m.winner.rank} · ${m.winner.name}` : ''}</td>
              </tr>
            ))}
            {members.length === 0 && <tr><td colSpan="6">No one has joined yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
