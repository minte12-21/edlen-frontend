'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import './page.css';
import Hero from '@/components/Hero';
import PrizePanel from '@/components/PrizePanel';
import PrizeRow from '@/components/PrizeRow';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function Home() {
  const { t, toast } = useApp();

  // Loads once, then updates by itself when anything changes
  const { data, error } = useSWR('/prizes', api, { keepPreviousData: true });

  useEffect(() => {
    if (error) toast(error.message, 'error');
  }, [error, toast]);

  let body;

  if (!data && !error) {
    body = <div className="home-skel" />;
  } else if (!data?.prizes || data.prizes.length === 0) {
    body = <div className="home-empty"><b>🎁</b>{t('empty_prizes')}</div>;
  } else {
    const prizes = data.prizes;
    const featured = prizes.find((p) => p.status === 'ONGOING') || prizes.find((p) => p.status === 'CLOSED') || prizes[0];
    const others = prizes.filter((p) => p.id !== featured.id);

    body = (
      <>
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
      </>
    );
  }

  return (
    <div>
      <Hero />
      {body}
    </div>
  );
}