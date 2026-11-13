'use client';
import { useEffect, useState } from 'react';
import PrizeRow from '@/components/PrizeRow';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function Prizes() {
  const { t, toast } = useApp();
  const [prizes, setPrizes] = useState(null);
  useEffect(() => {
    api('/prizes').then((d) => setPrizes(d.prizes)).catch((e) => { toast(e.message, 'error'); setPrizes([]); });
  }, [toast]);

  return (
    <div className="ed-page">
      <h1 className="ed-title" style={{ marginBottom: 14 }}>{t('all_prizes')}</h1>
      {!prizes && <p className="ed-sub">{t('loading')}</p>}
      {prizes && prizes.length === 0 && <p className="ed-sub ed-center" style={{ padding: 40 }}>{t('empty_prizes')}</p>}
      {prizes && prizes.map((p) => <PrizeRow key={p.id} prize={p} />)}
    </div>
  );
}
