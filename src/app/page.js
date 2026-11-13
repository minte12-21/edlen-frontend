'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import './page.css';
import PrizePanel from '@/components/PrizePanel';
import PrizeRow from '@/components/PrizeRow';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function Home() {
  const { t, toast } = useApp();
  const [prizes, setPrizes] = useState(null);

  useEffect(() => {
    api('/prizes').then((d) => setPrizes(d.prizes)).catch((e) => { toast(e.message, 'error'); setPrizes([]); });
  }, [toast]);

  if (!prizes) return <div className="home-skel" />;
  if (prizes.length === 0) return <div className="home-empty"><b>🎁</b>{t('empty_prizes')}</div>;

  const featured = prizes.find((p) => p.status === 'ONGOING') || prizes.find((p) => p.status === 'CLOSED') || prizes[0];
  const others = prizes.filter((p) => p.id !== featured.id);

  return (
    <div>
      <PrizePanel prize={featured} />
      {others.length > 0 && (
        <>
          <h2 className="home-h">{t('more_prizes')}</h2>
          {others.slice(0, 3).map((p) => <PrizeRow key={p.id} prize={p} />)}
        </>
      )}
      <p className="ed-center ed-sub" style={{ marginTop: 26 }}>
        <Link href="/about" style={{ textDecoration: 'underline' }}>{t('about')} · {t('contact_title')}</Link>
      </p>
    </div>
  );
}
