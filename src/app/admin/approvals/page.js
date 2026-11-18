'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, img } from '@/lib/api';
import { useApp } from '@/context/Providers';

const EMPTY = { bankName: '', accountName: '', accountNumber: '' };
const MAX_BANKS = 10;

export default function Approvals() {
  const { toast } = useApp();
  const [list, setList] = useState(null);
  const [banks, setBanks] = useState([{ ...EMPTY }]);
  const [busy, setBusy] = useState(0);

  const load = useCallback(() => api('/admin/approvals').then((d) => setList(d.approvals)).catch((e) => toast(e.message, 'error')), [toast]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    api('/admin/payment-info')
      .then((d) => setBanks(d.banks && d.banks.length ? d.banks : [{ ...EMPTY }]))
      .catch(() => {});
  }, []);

  async function act(id, what) {
    if (what === 'discard' && !confirm('Discard this request? The card number becomes free again.')) return;
    setBusy(id);
    try {
      await api(`/admin/approvals/${id}/${what}`, { method: 'POST' });
      toast(what === 'approve' ? 'Approved' : 'Discarded');
      load();
    } catch (e) { toast(e.message, 'error'); }
    finally { setBusy(0); }
  }

  async function saveBanks(e) {
    e.preventDefault();
    try {
      const d = await api('/admin/payment-info', { method: 'PUT', body: { banks } });
      setBanks(d.banks && d.banks.length ? d.banks : [{ ...EMPTY }]);
      toast('Saved');
    } catch (err) { toast(err.message, 'error'); }
  }

  const setField = (i, k) => (e) =>
    setBanks(banks.map((b, idx) => (idx === i ? { ...b, [k]: e.target.value } : b)));
  const addBank = () => setBanks([...banks, { ...EMPTY }]);
  const removeBank = (i) => {
    const next = banks.filter((_, idx) => idx !== i);
    setBanks(next.length ? next : [{ ...EMPTY }]);
  };

  return (
    <>
      <form className="ad-card ed-dark" onSubmit={saveBanks}>
        <b>Your bank accounts (shown to people when they pay)</b>

        {banks.map((bank, i) => (
          <div key={i} style={{ marginTop: 14, paddingTop: 14, borderTop: i ? '1px solid rgba(255,255,255,.12)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="ad-pill">Account {i + 1}</span>
              {banks.length > 1 && (
                <button
                  type="button"
                  className="ed-btn ed-btn-danger ed-btn-sm"
                  style={{ width: 'auto', flex: '0 0 auto' }}
                  onClick={() => removeBank(i)}
                >
                  Remove
                </button>
              )}
            </div>
            <div className="ad-two">
              <label className="ed-field"><span>Bank</span><input className="ed-input" value={bank.bankName} onChange={setField(i, 'bankName')} placeholder="Commercial Bank of Ethiopia" /></label>
              <label className="ed-field"><span>Account name</span><input className="ed-input" value={bank.accountName} onChange={setField(i, 'accountName')} placeholder="Your name" /></label>
            </div>
            <label className="ed-field"><span>Account number</span><input className="ed-input" value={bank.accountNumber} onChange={setField(i, 'accountNumber')} placeholder="1000123456789" /></label>
          </div>
        ))}

        <div className="ad-row" style={{ marginTop: 14 }}>
          <button type="button" className="ed-btn ed-btn-sm" onClick={addBank} disabled={banks.length >= MAX_BANKS}>+ Add another account</button>
          <button className="ed-btn ed-btn-primary ed-btn-sm" type="submit">Save accounts</button>
        </div>
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