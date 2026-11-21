'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR, { useSWRConfig } from 'swr';
import { api, download } from '@/lib/api';
import { useApp } from '@/context/Providers';

const EMPTY = { number: '', name: '', phone: '', telegram: '', password: '' };

export default function ManagePrize() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useApp();
  const { mutate } = useSWRConfig();
  const [f, setF] = useState(EMPTY);
  const [added, setAdded] = useState(null);
  const [busy, setBusy] = useState(false);

  // Members, money and numbers update by themselves
  const { data: d, error } = useSWR(`/admin/prizes/${id}/members`, api);
  const { data: nums } = useSWR(d && d.prize.status === 'ONGOING' ? `/prizes/${id}/numbers` : null, api);

  useEffect(() => { if (error) toast(error.message, 'error'); }, [error, toast]);
  const refresh = () => mutate(() => true);

  if (!d) return <p className="ed-sub">Loading…</p>;
  const { prize, members } = d;
  const taken = new Set(nums ? nums.taken : []);
  const free = nums ? Array.from({ length: nums.total }, (_, i) => i + 1).filter((x) => !taken.has(x)) : [];
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const pending = prize.pending || 0;

  async function exportXls() { try { await download(`/admin/prizes/${id}/export`, 'edlen.csv'); } catch (e) { toast(e.message, 'error'); } }
  async function end() {
    if (!confirm('End this prize?\n\nEvery signed-up person of this prize will be REMOVED from the database. Have you exported the Excel file first?')) return;
    try { await api(`/admin/prizes/${id}/end`, { method: 'POST' }); toast('Prize ended'); refresh(); } catch (e) { toast(e.message, 'error'); }
  }
  async function del() {
    if (!confirm('Delete this prize completely? This cannot be undone.')) return;
    try { await api(`/admin/prizes/${id}`, { method: 'DELETE' }); router.push('/admin'); } catch (e) { toast(e.message, 'error'); }
  }
  async function launch() {
    if (!confirm('Launch this prize now? People will be able to buy cards.')) return;
    try { await api(`/admin/prizes/${id}/launch`, { method: 'POST' }); toast('Prize launched'); refresh(); } catch (e) { toast(e.message, 'error'); }
  }
  async function closeSales() {
    if (!confirm(`Stop selling now?\n\nThe draw will use only the ${prize.sold} cards already sold. Nobody can buy more cards. Waiting payments must be approved or discarded before you draw.`)) return;
    try { await api(`/admin/prizes/${id}/close`, { method: 'POST' }); toast('Sales stopped. You can draw now.'); refresh(); } catch (e) { toast(e.message, 'error'); }
  }
  async function reopenSales() {
    try { await api(`/admin/prizes/${id}/reopen`, { method: 'POST' }); toast('Sales are open again'); refresh(); } catch (e) { toast(e.message, 'error'); }
  }
  async function setMethod(m) {
    try { await api(`/admin/prizes/${id}`, { method: 'PUT', body: { payMethod: m } }); toast('Payment type saved'); refresh(); } catch (e) { toast(e.message, 'error'); }
  }
  async function addPerson(e) {
    e.preventDefault();
    setBusy(true);
    setAdded(null);
    try {
      const r = await api(`/admin/prizes/${id}/add-member`, { method: 'POST', body: f });
      setAdded({ phone: f.phone, password: r.password, existing: r.existingUser, number: f.number });
      setF(EMPTY);
      refresh();
    } catch (err) { toast(err.message, 'error'); }
    finally { setBusy(false); }
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
            <p className="ed-sub">{prize.sold}/{prize.totalCards} sold · {prize.price} ETB · max {prize.maxPerUser} per person · {d.placesDrawn}/{prize.places.length} places drawn</p>
            <p className="ed-sub">Draw order: {[...prize.places].sort((a, b) => a.drawOrder - b.drawOrder).map((p) => `${p.rank}. ${p.name}`).join('  →  ')}</p>
          </>
        )}
        <div className="ad-row">
          {prize.status !== 'ENDED' && <Link href={`/admin/prizes/${id}/edit`} className="ed-btn ed-btn-ghost ed-btn-sm">Edit</Link>}
          {soon && <button className="ed-btn ed-btn-primary ed-btn-sm" onClick={launch}>Launch now</button>}
          {prize.status === 'ONGOING' && prize.sold > 0 && <button className="ed-btn ed-btn-gold ed-btn-sm" onClick={closeSales}>Stop selling &amp; draw</button>}
          {prize.status === 'CLOSED' && d.placesDrawn === 0 && prize.sold < prize.totalCards && <button className="ed-btn ed-btn-ghost ed-btn-sm" onClick={reopenSales}>Reopen sales</button>}
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
              <select className="ed-input" required value={f.number} onChange={set('number')} style={{ colorScheme: 'dark' }}>
                <option value="">Choose a free number</option>
                {free.map((n) => <option key={n} value={n}>#{n}</option>)}
              </select>
            </label>
            <label className="ed-field"><span>Full name</span><input className="ed-input" required value={f.name} onChange={set('name')} /></label>
            <label className="ed-field"><span>Phone number</span><input className="ed-input" required inputMode="tel" value={f.phone} onChange={set('phone')} placeholder="0911 123 456" /></label>
            <label className="ed-field"><span>Telegram username</span><input className="ed-input" required value={f.telegram} onChange={set('telegram')} placeholder="@username" autoCapitalize="none" /></label>
          </div>
          <label className="ed-field"><span>Password for them (optional, a simple one is made if empty)</span><input className="ed-input" value={f.password} onChange={set('password')} /></label>
          <button className="ed-btn ed-btn-primary ed-btn-sm" type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add to this card'}</button>
          {added && (
            <div className="ed-error" style={{ background: 'rgba(34,197,94,.15)', borderColor: 'rgba(34,197,94,.5)', color: '#c8f7d6' }}>
              Added to card #{added.number}. {added.existing
                ? 'This phone already had an account, so they log in with their own password.'
                : <>Give them this login: phone <b>{added.phone}</b>, password <b>{added.password}</b></>}
            </div>
          )}
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