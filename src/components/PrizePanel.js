'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './PrizePanel.css';
import Icon from './Icon';
import StatusBadge from './StatusBadge';
import NumberGrid from './NumberGrid';
import { api, img } from '@/lib/api';
import { rankLabel } from '@/lib/i18n';
import { useApp } from '@/context/Providers';

// The main prize card: hero, stats, winning places, number list and the Pick button
export default function PrizePanel({ prize }) {
  const { t, lang, user, toast } = useApp();
  const router = useRouter();
  const [showNums, setShowNums] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [initial, setInitial] = useState(null);
  const [taken, setTaken] = useState(null);

  const canBuy = prize.status === 'ONGOING' && prize.left > 0;

  async function loadTaken() {
    try { setTaken(new Set((await api(`/prizes/${prize.id}/numbers`)).taken)); }
    catch (e) { toast(e.message, 'error'); }
  }
  async function toggleNumbers() {
    if (!showNums && !taken) await loadTaken();
    setShowNums((v) => !v);
  }
  async function openSheet(n = null) {
    if (!taken) await loadTaken();
    setInitial(n);
    setSheet(true);
  }
  const free = taken ? Array.from({ length: prize.totalCards }, (_, i) => i + 1).filter((n) => !taken.has(n)) : [];
  const photo = img(prize.imageUrl);

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

      <div className="pp-stats">
        <div className="pp-stat"><b>{prize.price.toLocaleString()} <small>ETB</small></b><span>{t('stat_price')}</span></div>
        <div className="pp-stat"><b>{prize.left}</b><span>{t('stat_left')}</span></div>
        <div className="pp-stat"><b>{prize.places.length}</b><span>{t('stat_places')}</span></div>
        <div className="pp-stat"><b>{prize.status === 'CLOSED' ? t('stat_live') : t('stat_soon')}</b><span>{t('stat_draw')}</span></div>
      </div>

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
          <button className={`pp-toggle ${showNums ? 'open' : ''}`} onClick={toggleNumbers}>
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