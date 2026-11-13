'use client';
import Link from 'next/link';
import './PrizeRow.css';
import Icon from './Icon';
import StatusBadge from './StatusBadge';
import { img } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function PrizeRow({ prize }) {
  const { t } = useApp();
  return (
    <Link href={`/prize/${prize.id}`} className="pr">
      <div className="pr-img">{prize.imageUrl ? <img src={img(prize.imageUrl)} alt="" /> : '🎁'}</div>
      <div className="pr-body">
        <b>{prize.title}</b>
        <StatusBadge status={prize.status} />
        <div className="pr-meta">{prize.price.toLocaleString()} ETB · {t('cards_left', { n: prize.left })}</div>
      </div>
      <Icon name="arrow" size={20} />
    </Link>
  );
}
