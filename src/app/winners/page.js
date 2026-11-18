'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import './page.css';
import Confetti from '@/components/Confetti';
import { api } from '@/lib/api';
import { rankLabel } from '@/lib/i18n';
import { useApp } from '@/context/Providers';

export default function Winners() {
  const { t, lang, user, ready } = useApp();
  const [groups, setGroups] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) return setGroups([]);
    api('/me/winners').then((d) => setGroups(d.groups)).catch(() => setGroups([]));
  }, [ready, user]);

  if (!ready || !groups) return <p className="ed-sub">{t('loading')}</p>;
  if (!user) return (
    <div className="ed-center" style={{ padding: '50px 10px' }}>
      <p className="ed-sub" style={{ marginBottom: 16 }}>{t('need_login')}</p>
      <Link href="/login" className="ed-btn ed-btn-primary">{t('login')}</Link>
    </div>
  );

  const iWon = groups.some((g) => g.winners.some((w) => w.userId === user.id));

  return (
    <div className="ed-page">
      {iWon && <Confetti count={60} />}
      <h1 className="ed-title">🏆 {t('winners_title')}</h1>
      <p className="ed-sub">{t('winners_sub')}</p>
      {groups.length === 0 && <p className="wn-wait" style={{ marginTop: 18 }}>{t('winners_empty')}</p>}

      {groups.map(({ prize, winners }) => {
        const mine = winners.filter((w) => w.userId === user.id);
        return (
          <section key={prize.id}>
            <h2 className="wn-prize">{prize.title}</h2>

            {mine.map((w) => (
              <div key={`me-${w.rank}`} className="wn-congrats">
                <span className="wn-trophy">🏆</span>
                <b>{t('congrats_win')}</b>
                <p>{t('won_place', { place: rankLabel(lang, w.rank) })} · {w.placeName}</p>
                <small>#{w.number}</small>
              </div>
            ))}
            {winners.length > 0 && mine.length === 0 && <div className="wn-hope">{t('hope_next')}</div>}
            {winners.length === 0 && <div className="wn-wait">{t('winners_empty')}</div>}

            {winners.map((w) => (
              <div key={w.rank} className={`wn-card ${w.rank <= 3 ? `r${w.rank}` : 'rn'}`}>
                <div className="wn-medal">{rankLabel(lang, w.rank)}</div>
                <div className="wn-body"><b>{w.name}</b><small>#{w.number} · {w.placeName}</small></div>
                {w.userId === user.id && <span className="wn-me">🎉</span>}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}