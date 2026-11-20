'use client';
import { useEffect } from 'react';
import useSWR from 'swr';
import PrizeRow from '@/components/PrizeRow';
import { api, API_URL, getToken } from '@/lib/api';
import { useApp } from '@/context/Providers';
import { io } from 'socket.io-client';

export default function Prizes() {
  const { t, toast } = useApp();

  // SWR: instantly shows data from Home page, then revalidates in background
  const { data, error } = useSWR('/prizes', (url) => api(url));

  useEffect(() => {
    if (error) toast(error.message, 'error');
  }, [error, toast]);

  useEffect(() => {
    const socket = io(API_URL, { auth: { token: getToken() } });
    const refresh = () => import('swr').then(({ mutate }) => mutate('/prizes'));

    socket.on('prize:new', refresh);
    socket.on('admin:update', refresh);
    socket.on('number:taken', refresh);

    return () => socket.disconnect();
  }, []);

  const prizes = data?.prizes;

  return (
    <div className="ed-page">
      <h1 className="ed-title" style={{ marginBottom: 14 }}>{t('all_prizes')}</h1>
      
      {!prizes && <p className="ed-sub">{t('loading')}</p>}
      {prizes && prizes.length === 0 && <p className="ed-sub ed-center" style={{ padding: 40 }}>{t('empty_prizes')}</p>}
      {prizes && prizes.map((p) => <PrizeRow key={p.id} prize={p} />)}
    </div>
  );
}