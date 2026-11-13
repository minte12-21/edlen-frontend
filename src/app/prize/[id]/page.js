'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PrizePanel from '@/components/PrizePanel';
import Icon from '@/components/Icon';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function PrizePage() {
  const { id } = useParams();
  const { t } = useApp();
  const [prize, setPrize] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api(`/prizes/${id}`).then((d) => setPrize(d.prize)).catch(() => setMissing(true));
  }, [id]);

  return (
    <div className="ed-page">
      <Link href="/prizes" className="ed-back"><Icon name="back" size={18} /> {t('nav_prizes')}</Link>
      {missing && <p className="ed-sub ed-center">{t('empty_prizes')}</p>}
      {!prize && !missing && <p className="ed-sub">{t('loading')}</p>}
      {prize && <PrizePanel prize={prize} />}
    </div>
  );
}
