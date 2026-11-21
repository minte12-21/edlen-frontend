'use client';
import { useEffect, useRef, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { api, img } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function Approvals() {
  const { toast } = useApp();
  const { mutate } = useSWRConfig();
  const { data, error } = useSWR('/admin/approvals', api); // new payments appear instantly
  const { data: info } = useSWR('/admin/payment-info', api);
  const [bank, setBank] = useState({ bankName: '', accountNumber: '', accountName: '' });
  const [busy, setBusy] = useState(0);
  const filled = useRef(false);

  // fill the bank form once, so typing is never overwritten
  useEffect(() => {
    if (info && !filled.current) { filled.current = true; setBank(info); }
  }, [info]);
  useEffect(() => { if (error) toast(error.message, 'error'); }, [error, toast]);

  const list = data ? data.approvals : null;

  async function act(id, what) {
    if (what === 'discard' && !confirm('Discard this request? The card number becomes free again.')) return;
    setBusy(id);
    try {
      await api(`/admin/approvals/${id}/${what}`, { method: 'POST' });
      toast(what === 'approve' ? 'Approved' : 'Discarded');
      mutate(() => true);
    } catch (e) { toast(e.message, 'error'); }
    finally { setBusy(0); }
  }

  async function saveBank(e) {
    e.preventDefault();
    try { setBank(await api('/admin/payment-info', { method: 'PUT', body: bank })); toast('Saved'); }
    catch (err) { toast(err.message, 'error'); }
  }

  const set = (k) => (e) => setBank({ ...bank, [k]: e.target.value });

  return (
    <>
      <form className="ad-card ed-dark" onSubmit={saveBank}>
        <b>Your bank account (shown to people when they pay)</b>
        <div className="ad-two" style={{ marginTop: 12 }}>
          <label className="ed-field"><span>Bank</span><input className="ed-input" value={bank.bankName} onChange={set('bankName')} placeholder="Commercial Bank of Ethiopia" /></label>
          <label className="ed-field"><span>Account name</span><input className="ed-input" value={bank.accountName} onChange={set('accountName')} placeholder="Your name" /></label>
        </div>
        <label className="ed-field"><span>Account number</span><input className="ed-input" value={bank.accountNumber} onChange={set('accountNumber')} placeholder="1000123456789" /></label>
        <button className="ed-btn ed-btn-primary ed-btn-sm" type="submit">Save account</button>
      </form>

      <h2 style={{ margin: '18px 0 10px', fontSize: 18 }}>Waiting for approval {list ? `(${list.length})` : ''}</h2>
      {!list && <p className="ed-sub">Loading…</p>}
      {list && list.length === 0 && <p className="ed-sub">Nothing is waiting right now.</p>}

      {list && list.map((a) => (
        <div key={a.id} className="ad-card">
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {a.proofUrl && (
              <a href={img(a.proofUrl)} target="_blank" rel="noreferrer">
                <img src={img(a.proofUrl)} alt="Payment screenshot" style={{ width: 110, height: 150, objectFit: 'cover', borderRadius: 12, background: '#000' }} />
              </a>
            )}
            <div style={{ flex: 1, minWidth: 180 }}>
              <b style={{ fontSize: 18 }}>{a.user.name}</b> <span className="ad-pill">#{a.number}</span>
              <p className="ed-sub">{a.user.phone} · @{a.user.telegram}</p>
              <p className="ed-sub">{a.prize.title} · {a.amount} ETB</p>
              <p className="ed-sub">{a.method === 'SCREENSHOT' ? 'Bank transfer + screenshot' : '“I paid” message'} · {new Date(a.submittedAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="ad-row">
            <button className="ed-btn ed-btn-primary ed-btn-sm" disabled={busy === a.id} onClick={() => act(a.id, 'approve')}>Approve</button>
            <button className="ed-btn ed-btn-danger ed-btn-sm" disabled={busy === a.id} onClick={() => act(a.id, 'discard')}>Discard</button>
          </div>
        </div>
      ))}
    </>
  );
}