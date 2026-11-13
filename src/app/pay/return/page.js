'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import './page.css';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

// Chapa sends people back here. We ask the server to confirm the payment with Chapa.
function Return() {
  const sp = useSearchParams();
  const txRef = sp.get('tx_ref') || sp.get('trx_ref');
  const router = useRouter();
  const { t, withLoader } = useApp();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!txRef) return setFailed(true);
    let stop = false;
    withLoader(t('ld_check'), async () => {
      for (let i = 0; i < 8 && !stop; i++) {
        const { status } = await api('/payments/verify', { method: 'POST', body: { txRef } }).catch(() => ({ status: 'PENDING' }));
        if (status === 'PAID') return router.replace('/my-card');
        if (status === 'FAILED') return setFailed(true);
        await new Promise((r) => setTimeout(r, 2000));
      }
      setFailed(true);
    }, 600);
    return () => { stop = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txRef]);

  if (!failed) return null;
  return (
    <div className="pr-box">
      <b>😕</b>
      <h1 className="ed-title">Payment not confirmed</h1>
      <p className="ed-sub">If money left your account, wait a minute and open My Card. Otherwise pick your number again.</p>
      <Link href="/my-card" className="ed-btn ed-btn-primary">{t('nav_mycard')}</Link>
      <Link href="/" className="ed-btn ed-btn-ghost">{t('nav_home')}</Link>
    </div>
  );
}

export default function ReturnPage() {
  return <Suspense fallback={null}><Return /></Suspense>;
}
