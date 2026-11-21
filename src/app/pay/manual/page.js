'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import './page.css';
import Icon from '@/components/Icon';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

// Pay by bank transfer (send a screenshot) or "I paid". You approve it in the dashboard.
// Nothing is saved (no account, no held number) until the screenshot is sent.
function ManualPay() {
  const params = useSearchParams();
  const cardId = params.get('card');
  const isDraft = params.get('draft') === '1';
  const router = useRouter();
  const { lang, user, ready, toast, withLoader, login, logout } = useApp();
  const L = (en, am) => (lang === 'am' ? am : en);
  const [d, setD] = useState(null);
  const [draft, setDraft] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const sentRef = useRef(false);
  const timerRef = useRef(null);

  const dropDraft = () => { try { sessionStorage.removeItem('edlen_draft'); } catch {} };

  // Old reservations only: free the number if the person leaves without sending
  async function cancelHold() {
    if (isDraft || sentRef.current || !cardId) return;
    try {
      const r = await api('/payments/cancel', { method: 'POST', body: { cardId } });
      if (r && r.loggedOut) logout();
    } catch {}
  }

  // When the person leaves this page without sending: forget the form. (Short delay avoids a false trigger in dev mode.)
  useEffect(() => {
    clearTimeout(timerRef.current);
    return () => {
      timerRef.current = setTimeout(() => {
        if (sentRef.current) return;
        cancelHold();
        dropDraft();
      }, 500);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || sentRef.current) return;

    if (isDraft) {
      let dr = null;
      try { dr = JSON.parse(sessionStorage.getItem('edlen_draft') || 'null'); } catch {}
      if (!dr || !dr.prizeId || !dr.number) {
        setError(L('Your session expired. Please pick your number again.', 'ጊዜው አልፏል። እባክዎ ቁጥርዎን እንደገና ይምረጡ።'));
        return;
      }
      setDraft(dr);
      api(`/payments/draft-info?prizeId=${dr.prizeId}&number=${dr.number}`)
        .then((info) => setD({ card: { number: info.number, status: 'DRAFT' }, prize: info.prize, bank: info.bank }))
        .catch((e) => setError(e.message));
      return;
    }

    if (!user) { router.replace('/login'); return; }
    api(`/payments/manual/${cardId}`)
      .then((info) => {
        if (info.card.status === 'PAID') return router.replace('/my-card');
        if (info.card.status !== 'RESERVED') sentRef.current = true;
        setSent(info.card.status === 'PENDING');
        setD(info);
      })
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user, cardId, isDraft, router]);

  function pick(e) {
    const f = e.target.files[0];
    if (preview) URL.revokeObjectURL(preview);
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : '');
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast(L('Account number copied', 'የሂሳብ ቁጥር ተቀድቷል')); }
    catch { toast(text); }
  }

  async function send() {
    setError('');
    const form = new FormData();
    if (isDraft) Object.entries(draft || {}).forEach(([k, v]) => form.append(k, v));
    else form.append('cardId', cardId);
    if (file) form.append('screenshot', file);
    try {
      const res = await withLoader(L('Sending…', 'በመላክ ላይ…'), () =>
        api(isDraft ? '/payments/submit-new' : '/payments/submit', { method: 'POST', form }));
      sentRef.current = true;
      if (isDraft) {
        dropDraft();
        if (res.token) login(res.token, res.user); // the person is signed in only now
      }
      setSent(true);
    } catch (e) { setError(e.message); }
  }

  if (error && !d) return (
    <div className="pm-done"><b>😕</b><div className="ed-error">{error}</div><Link href="/" className="ed-btn ed-btn-primary">{L('Home', 'መነሻ')}</Link></div>
  );
  if (!d) return <p className="ed-sub">{L('Loading…', 'በመጫን ላይ…')}</p>;

  const { card, prize, bank } = d;
  const screenshot = prize.payMethod === 'SCREENSHOT';

  // All accounts. Falls back to the old single-account fields if the list is missing.
  const accounts = (
    bank.banks && bank.banks.length
      ? bank.banks
      : [{ bankName: bank.bankName, accountName: bank.accountName, accountNumber: bank.accountNumber }]
  ).filter((b) => b && b.accountNumber);
  const many = accounts.length > 1;

  if (sent) return (
    <div className="pm-done">
      <b>⏳</b>
      <h1 className="ed-title">{L('Sent!', 'ተልኳል!')}</h1>
      <p>{L(`We are checking your payment. Card #${card.number} is held for you.`, `ክፍያዎን እያረጋገጥን ነው። ካርድ #${card.number} ተይዞልዎታል።`)}</p>
      <Link href="/my-card" className="ed-btn ed-btn-primary">{L('My Card', 'ካርዴ')}</Link>
    </div>
  );

  return (
    <div className="ed-page">
      <div className="pm-card">
        <div className="pm-top">
          <div><small>{prize.title}</small><b>#{card.number}</b></div>
          <div className="pm-amount">{prize.price.toLocaleString()} ETB</div>
        </div>

        {accounts.length > 0 ? (
          <>
            {many && (
              <p className="ed-sub" style={{ color: 'var(--muted)', margin: '0 0 8px' }}>
                {L('Pay to any one of these accounts:', 'ከእነዚህ ሂሳቦች ወደ አንዱ ይክፈሉ፦')}
              </p>
            )}
            {accounts.map((b, i) => (
              <div className="pm-bank" key={i} style={i > 0 ? { marginTop: 10 } : undefined}>
                {many && <div className="pm-row"><small>{L(`Account ${i + 1}`, `ሂሳብ ${i + 1}`)}</small></div>}
                {b.bankName && <div className="pm-row"><small>{L('Bank', 'ባንክ')}</small><b>{b.bankName}</b></div>}
                {b.accountName && <div className="pm-row"><small>{L('Account name', 'የሂሳብ ስም')}</small><b>{b.accountName}</b></div>}
                <div className="pm-row">
                  <small>{L('Account number', 'የሂሳብ ቁጥር')}</small>
                  <button type="button" className="pm-acc" onClick={() => copy(b.accountNumber)}>
                    {b.accountNumber} <span>{L('Tap to copy', 'ለመቅዳት ይንኩ')}</span>
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="pm-warn">{L('The payment account is not set yet. Please contact the admin.', 'የክፍያ ሂሳብ ገና አልተሞላም። እባክዎ አስተዳዳሪውን ያግኙ።')}</div>
        )}

        <ol className="pm-steps">
          <li>{L(`Send ${prize.price} ETB to ${many ? 'one of the accounts' : 'the account'} above.`, `${prize.price} ብር ወደ ላይ ${many ? 'ካሉት ሂሳቦች ወደ አንዱ' : 'ወዳለው ሂሳብ'} ይላኩ።`)}</li>
          {screenshot ? (
            <>
              <li>{L('Take a screenshot of your payment.', 'የክፍያዎን ስክሪንሾት ያንሱ።')}</li>
              <li>{L('Add it below and press Send.', 'ከታች ያስገቡና ላክ ይጫኑ።')}</li>
            </>
          ) : (
            <li>{L('Then tap "I paid". I will check and approve it.', 'ከዚያ "ከፍያለሁ" ይጫኑ። አረጋግጬ አጸድቃለሁ።')}</li>
          )}
        </ol>

        {screenshot && (
          <>
            <label className="pm-file">
              <input type="file" accept="image/*" onChange={pick} />
              {file ? L('Change screenshot', 'ስክሪንሾት ቀይር') : L('Tap to add your payment screenshot', 'የክፍያ ስክሪንሾት ለማስገባት ይንኩ')}
            </label>
            {preview && <img className="pm-preview" src={preview} alt="" />}
          </>
        )}

        {error && <div className="ed-error">{error}</div>}
        <button className="ed-btn ed-btn-primary" onClick={send} disabled={screenshot && !file}>
          <Icon name="send" size={20} /> {screenshot ? L('Send', 'ላክ') : L('I paid', 'ከፍያለሁ')}
        </button>
        <p className="ed-sub" style={{ color: 'var(--muted)', textAlign: 'center', marginTop: 12 }}>
          {screenshot
            ? L('Your number is held only after you send the screenshot.', 'ቁጥርዎ የሚያዘው ስክሪንሾቱን ከላኩ በኋላ ብቻ ነው።')
            : L('Your number is held only after you tap "I paid".', 'ቁጥርዎ የሚያዘው "ከፍያለሁ" ከተጫኑ በኋላ ብቻ ነው።')}
        </p>
      </div>
    </div>
  );
}

export default function ManualPayPage() {
  return <Suspense fallback={null}><ManualPay /></Suspense>;
}