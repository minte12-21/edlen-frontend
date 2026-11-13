'use client';
import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import '../return/page.css';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

// Test payment page. Only used while PAYMENT_MODE=mock on the backend.
function Mock() {
  const txRef = useSearchParams().get('tx_ref');
  const router = useRouter();
  const { withLoader, t } = useApp();
  const [error, setError] = useState('');

  async function pay() {
    try {
      await withLoader(t('ld_pay'), () => api('/payments/mock/confirm', { method: 'POST', body: { txRef } }));
      router.replace(`/pay/return?tx_ref=${txRef}`);
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="pr-box">
      <b>🧪</b>
      <h1 className="ed-title">Test payment</h1>
      <p className="ed-sub">Chapa is not connected yet, so this is a fake checkout for testing. Set PAYMENT_MODE=chapa on the backend to take real payments.</p>
      {error && <div className="ed-error">{error}</div>}
      <button className="ed-btn ed-btn-primary" onClick={pay}>Pay now (test)</button>
    </div>
  );
}

export default function MockPage() {
  return <Suspense fallback={null}><Mock /></Suspense>;
}
