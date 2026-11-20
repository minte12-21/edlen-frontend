'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import './page.css';
import Hero from '@/components/Hero';
import PrizePanel from '@/components/PrizePanel';
import PrizeRow from '@/components/PrizeRow';
import { api, API_URL, getToken } from '@/lib/api';
import { useApp } from '@/context/Providers';
import { io } from 'socket.io-client';

export default function Home() {
  const { t, toast } = useApp();

  // SWR fetches, caches, and auto-revalidates
  const { data, error } = useSWR('/prizes', (url) => api(url), {
    revalidateOnFocus: true, // updates if user tabs back
    revalidateOnReconnect: true,
  });

  useEffect(() => {
    if (error) toast(error.message, 'error');
  }, [error, toast]);

  // Live Socket Connection
  useEffect(() => {
    const socket = io(API_URL, { auth: { token: getToken() } });
    
    // When the server shouts, SWR silently fetches the new data in the background
    socket.on('prize:new', () => import('swr').then(({ mutate }) => mutate('/prizes')));
    socket.on('admin:update', () => import('swr').then(({ mutate }) => mutate('/prizes')));
    socket.on('number:taken', () => import('swr').then(({ mutate }) => mutate('/prizes')));

    return () => socket.disconnect();
  }, []);

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