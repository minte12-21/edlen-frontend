'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import './PrizePanel.css';
import Icon from './Icon';
import StatusBadge from './StatusBadge';
import NumberGrid from './NumberGrid';
import { api, img } from '@/lib/api';
import { rankLabel } from '@/lib/i18n';
import { useApp } from '@/context/Providers';

// The main prize card: hero, stats, winning places, number list and the Pick button
export default function PrizePanel({ prize }) {
  const { t, lang, user } = useApp();
  const router = useRouter();
  const [showNums, setShowNums] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [initial, setInitial] = useState(null);

  const soon = prize.status === 'COMING_SOON';
  const onSale = prize.status === 'ONGOING';
  const canBuy = onSale && prize.left > 0;

  // taken numbers: loaded ahead of time and refreshed live
  const { data: nums } = useSWR(onSale ? `/prizes/${prize.id}/numbers` : null, api);
  const taken = nums ? new Set(nums.taken) : null;
  const free = taken ? Array.from({ length: prize.totalCards }, (_, i) => i + 1).filter((n) => !taken.has(n)) : [];

  function openSheet(n = null) { setInitial(n); setSheet(true); }

  const photo = img(prize.imageUrl);
  const soonMsg = lang === 'am' ? 'ይህ ሽልማት በቅርቡ ይከፈታል። ተመልሰው ይመልከቱ!' : 'This prize opens soon. Check back!';

  return (
    <div>
      <section className="pp-hero">
        <div className="pp-glow" />
        <div className="pp-img">{photo ? <img src={photo} alt={prize.title} /> : <span className="pp-ph">🎁</span>}</div>
        <div className="pp-text">
          <StatusBadge status={prize.status} />
          <h1>{t('win_title', { title: prize.title })}</h1>
          <p>{prize.description || t('win_sub')}</p>
        </div>
      </section>

      {!soon && (
        <div className="pp-stats">
          <div className="pp-stat"><b>{prize.price.toLocaleString()} <small>ETB</small></b><span>{t('stat_price')}</span></div>
          <div className="pp-stat"><b>{prize.left}</b><span>{t('stat_left')}</span></div>
          <div className="pp-stat"><b>{prize.places.length}</b><span>{t('stat_places')}</span></div>
          <div className="pp-stat"><b>{prize.status === 'CLOSED' ? t('stat_live') : t('stat_soon')}</b><span>{t('stat_draw')}</span></div>
        </div>
      )}

      {soon && <div className="pp-note" style={{ marginTop: 14 }}>{soonMsg}</div>}

      {prize.places.length > 0 && (
        <section className="pp-places">
          <h2>{t('prizes_to_win')}</h2>
          {prize.places.map((p) => (
            <div key={p.id} className={`pp-place ${p.rank <= 3 ? `r${p.rank}` : 'rn'}`}>
              <span className="pp-medal">{rankLabel(lang, p.rank)}</span>
              <b>{p.name}</b>
            </div>
          ))}
        </section>
      )}

      {prize.status === 'ENDED' && <div className="pp-note">{t('ended_msg')}</div>}
      {prize.status === 'CLOSED' && (
        <div className="pp-note">
          {t('closed_msg')}
          {user && <><br /><Link href={`/draw/${prize.id}`}>{t('go_draw')}</Link></>}
        </div>
      )}

      {canBuy && (
        <>
          <button className={`pp-toggle ${showNums ? 'open' : ''}`} onClick={() => setShowNums((v) => !v)}>
            {showNums ? t('hide_numbers') : t('show_numbers')} <Icon name="down" size={18} />
          </button>
          {showNums && (
            <div className="pp-free">
              {free.map((n) => <button key={n} className="pp-chip" onClick={() => openSheet(n)}>{n}</button>)}
            </div>
          )}
          <button className="ed-btn ed-btn-primary" onClick={() => openSheet()}>
            <Icon name="ticket" size={22} /> {t('pick_number')} <Icon name="arrow" size={20} />
          </button>
        </>
      )}

      <div className="pp-trust">
        <span><Icon name="shield" size={16} /> {t('trust_safe')}</span>
        <span><Icon name="check" size={16} /> {t('trust_clear')}</span>
        <span><Icon name="star" size={16} /> {t('trust_fair')}</span>
      </div>

      {sheet && taken && (
        <NumberGrid prize={prize} taken={taken} initial={initial} onClose={() => setSheet(false)}
          onContinue={(n) => router.push(`/checkout?prize=${prize.id}&number=${n}`)} />
      )}
    </div>
  );
}