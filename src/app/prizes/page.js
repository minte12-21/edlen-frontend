'use client';
import { useEffect } from 'react';
import useSWR from 'swr';
import PrizeRow from '@/components/PrizeRow';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function Prizes() {
  const { t, toast } = useApp();

  // Shows the saved list instantly, then updates by itself
  const { data, error } = useSWR('/prizes', api, { keepPreviousData: true });

  useEffect(() => {
    if (error) toast(error.message, 'error');
  }, [error, toast]);

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