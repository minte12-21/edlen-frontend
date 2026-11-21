'use client';
import Link from 'next/link';
import useSWR from 'swr';
import './page.css';
import Icon from '@/components/Icon';
import { api, img } from '@/lib/api';
import { rankLabel } from '@/lib/i18n';
import { useApp } from '@/context/Providers';

export default function MyCard() {
  const { t, lang, user, ready } = useApp();

  // Updates by itself when you are approved, discarded or win
  const { data, error } = useSWR(ready && user ? '/me/cards' : null, api);

  if (!ready || (user && !data && !error)) return <p className="ed-sub">{t('loading')}</p>;
  if (!user) return (
    <div className="mc-empty"><b>🔒</b><p>{t('need_login')}</p><Link href="/login" className="ed-btn ed-btn-primary" style={{ marginTop: 16 }}>{t('login')}</Link></div>
  );

  const cards = data?.cards || [];
  if (cards.length === 0) return (
    <div className="mc-empty"><b>🎟️</b><p>{t('no_cards')}</p><Link href="/" className="ed-btn ed-btn-primary" style={{ marginTop: 16 }}>{t('pick_number')}</Link></div>
  );

  const paid = cards.filter((c) => c.status === 'PAID');
  const latest = paid[0];

  return (
    <div className="ed-page">
      {latest && (
        <>
          <div className="mc-top">
            <div className="mc-check"><Icon name="check" size={34} stroke={3.4} /></div>
            <h1 className="ed-title" style={{ fontSize: 22 }}>{t('chosen')}</h1>
          </div>
          <div className="mc-big">
            <div className="mc-num">#{latest.number}</div>
            {latest.prize.imageUrl && <img className="mc-img" src={img(latest.prize.imageUrl)} alt="" />}
            <div className="mc-title">{latest.prize.title}</div>
            {latest.won && <div className="mc-won">🏆 {t('won_place', { place: rankLabel(lang, latest.won.rank) })}</div>}
          </div>
          <div className="mc-actions">
            {latest.prize.status === 'ONGOING' && <Link href={`/prize/${latest.prize.id}`} className="ed-btn ed-btn-primary">{t('buy_another')}</Link>}
            {latest.prize.status === 'CLOSED' && <Link href={`/draw/${latest.prize.id}`} className="ed-btn ed-btn-gold"><Icon name="play" size={20} /> {t('go_draw')}</Link>}
          </div>
        </>
      )}

      <h2 className="mc-list-h">{t('my_cards')}</h2>
      {cards.map((c) => (
        <div key={c.id} className="mc-row">
          <b>#{c.number}</b>
          <div>{c.prize.title}<small>{c.prize.status === 'ENDED' ? t('status_ended') : t(`status_${c.prize.status.toLowerCase()}`)}</small></div>
          {c.won ? <span className="mc-tag win">🏆 {rankLabel(lang, c.won.rank)}</span>
            : <span className={`mc-tag ${c.status === 'PAID' ? '' : 'pend'}`}>{c.status === 'PAID' ? t('active') : t('pending')}</span>}
        </div>
      ))}
    </div>
  );
}