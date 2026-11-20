'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import PrizePanel from '@/components/PrizePanel';
import Icon from '@/components/Icon';
import { api, API_URL, getToken } from '@/lib/api';
import { useApp } from '@/context/Providers';
import { io } from 'socket.io-client';

export default function PrizePage() {
  const { id } = useParams();
  const { t, toast } = useApp();

  const { data, error } = useSWR(`/prizes/${id}`, (url) => api(url));
  
  useEffect(() => {
    if (error) toast(error.message, 'error');
  }, [error, toast]);

  useEffect(() => {
    const socket = io(API_URL, { auth: { token: getToken() } });
    
    // Join this specific prize's room
    socket.emit('join:prize', id);

    // Silent background refresh for this specific prize
    socket.on('number:taken', () => import('swr').then(({ mutate }) => mutate(`/prizes/${id}`)));
    socket.on('card:paid', () => import('swr').then(({ mutate }) => mutate(`/prizes/${id}`)));
    socket.on('card:freed', () => import('swr').then(({ mutate }) => mutate(`/prizes/${id}`)));
    socket.on('admin:update', () => import('swr').then(({ mutate }) => mutate(`/prizes/${id}`)));

    return () => socket.disconnect();
  }, [id]);

  return (
    <div className="ed-page">
      <Link href="/prizes" className="ed-back"><Icon name="back" size={18} /> {t('nav_prizes')}</Link>
      
      {error && <p className="ed-sub ed-center">{t('empty_prizes')}</p>}
      {!data && !error && <p className="ed-sub">{t('loading')}</p>}
      
      {data?.prize && <PrizePanel prize={data.prize} />}
    </div>
  );
}