'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import PrizePanel from '@/components/PrizePanel';
import Icon from '@/components/Icon';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function PrizePage() {
  const { id } = useParams();
  const { t } = useApp();
  const { data, error } = useSWR(`/prizes/${id}`, api);

  return (
    <div className="ed-page">
      <Link href="/prizes" className="ed-back"><Icon name="back" size={18} /> {t('nav_prizes')}</Link>
      {error && <p className="ed-sub ed-center">{t('empty_prizes')}</p>}
      {!data && !error && <p className="ed-sub">{t('loading')}</p>}
      {data && <PrizePanel prize={data.prize} />}
    </div>
  );
}