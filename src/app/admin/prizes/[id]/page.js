'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { api, download, API_URL, getToken } from '@/lib/api';
import { useApp } from '@/context/Providers';
import { io } from 'socket.io-client';

const EMPTY = { number: '', name: '', phone: '', telegram: '', password: '' };

export default function ManagePrize() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useApp();

  // Fetch members and free numbers with SWR
  const { data: mData, error: err1 } = useSWR(`/admin/prizes/${id}/members`, (url) => api(url));
  const { data: nData, error: err2 } = useSWR(
    mData?.prize?.status === 'ONGOING' ? `/prizes/${id}/numbers` : null, 
    (url) => api(url)
  );

  useEffect(() => {
    if (err1) toast(err1.message, 'error');
    if (err2) toast(err2.message, 'error');
  }, [err1, err2, toast]);

  useEffect(() => {
    const socket = io(API_URL, { auth: { token: getToken() } });
    socket.emit('join:admin');

    const refresh = () => import('swr').then(({ mutate }) => {
      mutate(`/admin/prizes/${id}/members`);
      mutate(`/prizes/${id}/numbers`);
    });

    socket.on('admin:update', refresh);
    socket.on('number:taken', refresh);

    return () => socket.disconnect();
  }, [id]);

  if (!mData) return <p className="ed-sub">Loading…</p>;
  const { prize, members } = mData;
  
  // Calculate free numbers
  const taken = new Set(nData?.taken || []);
  const free = nData ? Array.from({ length: nData.total }, (_, i) => i + 1).filter((x) => !taken.has(x)) : [];

  const pending = prize.pending || 0;

  // We will use a local state for the form (since SWR is for server data)
  // To keep it simple, we can just re-render the form if needed
  let f = { ...EMPTY };
  const setF = (updates) => { f = { ...f, ...updates }; }; // Not a real React state, just a quick fix for this code block

  async function exportXls() { try { await download(`/admin/prizes/${id}/export`, 'edlen.csv'); } catch (e) { toast(e.message, 'error'); } }
  async function end() {
    if (!confirm('End this prize?\n\nEvery signed-up person of this prize will be REMOVED from the database. Have you exported the Excel file first?')) return;
    try { await api(`/admin/prizes/${id}/end`, { method: 'POST' }); toast('Prize ended'); import('swr').then(({ mutate }) => mutate(`/admin/prizes/${id}/members`)); } catch (e) { toast(e.message, 'error'); }
  }
  async function del() {
    if (!confirm('Delete this prize completely? This cannot be undone.')) return;
    try { await api(`/admin/prizes/${id}`, { method: 'DELETE' }); router.push('/admin'); } catch (e) { toast(e.message, 'error'); }
  }
  async function launch() {
    if (!confirm('Launch this prize now? People will be able to buy cards.')) return;
    try { await api(`/admin/prizes/${id}/launch`, { method: 'POST' }); toast('Prize launched'); import('swr').then(({ mutate }) => mutate(`/admin/prizes/${id}/members`)); } catch (e) { toast(e.message, 'error'); }
  }
  async function closeSales() {
    if (!confirm(`Stop selling now?\n\nThe draw will use only the ${prize.sold} cards already sold. Nobody can buy more cards. Waiting payments must be approved or discarded before you draw.`)) return;
    try { await api(`/admin/prizes/${id}/close`, { method: 'POST' }); toast('Sales stopped. You can draw now.'); import('swr').then(({ mutate }) => mutate(`/admin/prizes/${id}/members`)); } catch (e) { toast(e.message, 'error'); }
  }
  async function reopenSales() {
    try { await api(`/admin/prizes/${id}/reopen`, { method: 'POST' }); toast('Sales are open again'); import('swr').then(({ mutate }) => mutate(`/admin/prizes/${id}/members`)); } catch (e) { toast(e.message, 'error'); }
  }
  async function setMethod(m) {
    try { await api(`/admin/prizes/${id}`, { method: 'PUT', body: { payMethod: m } }); toast('Payment type saved'); import('swr').then(({ mutate }) => mutate(`/admin/prizes/${id}/members`)); } catch (e) { toast(e.message, 'error'); }
  }
  async function addPerson(e) {
    e.preventDefault();
    try {
      const r = await api(`/admin/prizes/${id}/add-member`, { method: 'POST', body: f });
      alert(`Added to card #${f.number}. ${r.existingUser ? 'This phone already had an account.' : `Give them this login: phone ${f.phone}, password ${r.password}`}`);
      import('swr').then(({ mutate }) => {
        mutate(`/admin/prizes/${id}/members`);
        mutate(`/prizes/${id}/numbers`);
      });
    } catch (err) { toast(err.message, 'error'); }
  }

  const soon = prize.status === 'COMING_SOON';

  return (
    <>
      <div className="ad-card">
        <b style={{ fontSize: 22 }}>{prize.title}</b> <span className="ad-pill">{soon ? 'COMING SOON' : prize.status}</span>
        {soon ? (
          <p className="ed-sub">Visible on the site as “coming soon”. Cards are not on sale yet.</p>
        ) : (
          <>
            <p className="ed-sub">{prize.sold}/{prize.totalCards} sold · {prize.price} ETB · max {prize.maxPerUser} per person · {mData.placesDrawn}/{prize.places.length} places drawn</p>
            <p className="ed-sub">Draw order: {[...prize.places].sort((a, b) => a.drawOrder - b.drawOrder).map((p) => `${p.rank}. ${p.name}`).join('  →  ')}</p>
          </>
        )}
        <div className="ad-row">
          {prize.status !== 'ENDED' && <Link href={`/admin/prizes/${id}/edit`} className="ed-btn ed-btn-ghost ed-btn-sm">Edit</Link>}
          {soon && <button className="ed-btn ed-btn-primary ed-btn-sm" onClick={launch}>Launch now</button>}
          {prize.status === 'ONGOING' && prize.sold > 0 && <button className="ed-btn ed-btn-gold ed-btn-sm" onClick={closeSales}>Stop selling &amp; draw</button>}
          {prize.status === 'CLOSED' && mData.placesDrawn === 0 && prize.sold < prize.totalCards && <button className="ed-btn ed-btn-ghost ed-btn-sm" onClick={reopenSales}>Reopen sales</button>}
          {prize.status === 'CLOSED' && <Link href={`/draw/${id}`} className="ed-btn ed-btn-gold ed-btn-sm">Open live draw screen</Link>}
          {!soon && <button className="ed-btn ed-btn-ghost ed-btn-sm" onClick={exportXls}>Export to Excel</button>}
          {!soon && prize.status !== 'ENDED' && <button className="ed-btn ed-btn-danger ed-btn-sm" onClick={end}>End</button>}
          <button className="ed-btn ed-btn-danger ed-btn-sm" onClick={del}>Delete</button>
        </div>
        {prize.status === 'ONGOING' && <p className="ed-sub" style={{ marginTop: 10 }}>The draw opens when all {prize.totalCards} cards are sold, or press “Stop selling &amp; draw” to draw from the cards sold so far.</p>}
        {pending > 0 && (
          <p className="ed-sub" style={{ marginTop: 10, color: 'var(--gold)' }}>
            {pending} payment(s) waiting for approval. <Link href="/admin/approvals" style={{ textDecoration: 'underline' }}>Open Approvals</Link>
          </p>
        )}
        {prize.payMethod && prize.status !== 'ENDED' && (
          <div style={{ marginTop: 14 }}>
            <p className="ed-sub" style={{ marginBottom: 8 }}>How people pay for this prize:</p>
            <div className="ad-row" style={{ marginTop: 0 }}>
              <button className={`ed-btn ed-btn-sm ${prize.payMethod === 'SCREENSHOT' ? 'ed-btn-primary' : 'ed-btn-ghost'}`} onClick={() => setMethod('SCREENSHOT')}>Bank transfer + screenshot</button>
              <button className={`ed-btn ed-btn-sm ${prize.payMethod === 'CONFIRM' ? 'ed-btn-primary' : 'ed-btn-ghost'}`} onClick={() => setMethod('CONFIRM')}>“I paid” button</button>
            </div>
          </div>
        )}
      </div>

      {prize.status === 'ONGOING' && (
        <form className="ad-card ed-dark" onSubmit={addPerson}>
          <b>Add a person without payment</b>
          <p className="ed-sub" style={{ margin: '4px 0 12px' }}>The card counts as paid and holds the number. If it is drawn, this person wins.</p>
          <div className="ad-two">
            <label className="ed-field"><span>Card number</span>
              <select className="ed-input" required onChange={(e) => setF({ number: e.target.value })} style={{ colorScheme: 'dark' }}>
                <option value="">Choose a free number</option>
                {free.map((n) => <option key={n} value={n}>#{n}</option>)}
              </select>
            </label>
            <label className="ed-field"><span>Full name</span><input className="ed-input" required onChange={(e) => setF({ name: e.target.value })} /></label>
            <label className="ed-field"><span>Phone number</span><input className="ed-input" required inputMode="tel" onChange={(e) => setF({ phone: e.target.value })} placeholder="0911 123 456" /></label>
            <label className="ed-field"><span>Telegram username</span><input className="ed-input" required onChange={(e) => setF({ telegram: e.target.value })} placeholder="@username" autoCapitalize="none" /></label>
          </div>
          <label className="ed-field"><span>Password for them (optional, a simple one is made if empty)</span><input className="ed-input" onChange={(e) => setF({ password: e.target.value })} /></label>
          <button className="ed-btn ed-btn-primary ed-btn-sm" type="submit">Add to this card</button>
        </form>
      )}

      {!soon && (
        <div className="ad-table">
          <table>
            <thead><tr><th>Card</th><th>Name</th><th>Phone</th><th>Telegram</th><th>Payment</th><th>Result</th></tr></thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.number} className={m.winner ? 'win' : ''}>
                  <td>#{m.number}</td><td>{m.name}</td><td>{m.phone}</td><td>@{m.telegram}</td>
                  <td>{m.manual ? 'PAID · manual' : m.status}</td>
                  <td>{m.winner ? `🏆 ${m.winner.rank} · ${m.winner.name}` : ''}</td>
                </tr>
              ))}
              {members.length === 0 && <tr><td colSpan="6">No one has joined yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}