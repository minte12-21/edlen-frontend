'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import './page.css';
import Icon from '@/components/Icon';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

// Pay by bank transfer (send a screenshot) or "I paid". You approve it in the dashboard.
function ManualPay() {
  const cardId = useSearchParams().get('card');
  const router = useRouter();
  const { lang, user, ready, toast, withLoader } = useApp();
  const L = (en, am) => (lang === 'am' ? am : en);
  const [d, setD] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace('/login'); return; }
    api(`/payments/manual/${cardId}`)
      .then((info) => {
        if (info.card.status === 'PAID') return router.replace('/my-card');
        setSent(info.card.status === 'PENDING');
        setD(info);
      })
      .catch((e) => setError(e.message));
  }, [ready, user, cardId, router]);

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
    form.append('cardId', cardId);
    if (file) form.append('screenshot', file);
    try {
      await withLoader(L('Sending…', 'በመላክ ላይ…'), () => api('/payments/submit', { method: 'POST', form }));
      setSent(true);
    } catch (e) { setError(e.message); }
  }

  if (error && !d) return (
    <div className="pm-done"><b>😕</b><div className="ed-error">{error}</div><Link href="/" className="ed-btn ed-btn-primary">{L('Home', 'መነሻ')}</Link></div>
  );
  if (!d) return <p className="ed-sub">{L('Loading…', 'በመጫን ላይ…')}</p>;

  const { card, prize, bank } = d;
  const screenshot = prize.payMethod === 'SCREENSHOT';

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

        {bank.accountNumber ? (
          <div className="pm-bank">
            {bank.bankName && <div className="pm-row"><small>{L('Bank', 'ባንክ')}</small><b>{bank.bankName}</b></div>}
            {bank.accountName && <div className="pm-row"><small>{L('Account name', 'የሂሳብ ስም')}</small><b>{bank.accountName}</b></div>}
            <div className="pm-row">
              <small>{L('Account number', 'የሂሳብ ቁጥር')}</small>
              <button type="button" className="pm-acc" onClick={() => copy(bank.accountNumber)}>
                {bank.accountNumber} <span>{L('Tap to copy', 'ለመቅዳት ይንኩ')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="pm-warn">{L('The payment account is not set yet. Please contact the admin.', 'የክፍያ ሂሳብ ገና አልተሞላም። እባክዎ አስተዳዳሪውን ያግኙ።')}</div>
        )}

        <ol className="pm-steps">
          <li>{L(`Send ${prize.price} ETB to the account above.`, `${prize.price} ብር ወደ ላይ ወዳለው ሂሳብ ይላኩ።`)}</li>
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
          {L('Your number is held while you pay.', 'በሚከፍሉበት ጊዜ ቁጥርዎ ተይዞ ይቆያል።')}
        </p>
      </div>
    </div>
  );
}

export default function ManualPayPage() {
  return <Suspense fallback={null}><ManualPay /></Suspense>;
}