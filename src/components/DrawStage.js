'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import './DrawStage.css';
import Icon from './Icon';
import Confetti from './Confetti';
import { api } from '@/lib/api';
import { rankLabel } from '@/lib/i18n';
import { useApp } from '@/context/Providers';

// The live draw screen. Everyone who joined the prize sees the same countdown.
// The server picks the winner exactly when the countdown ends and pushes the result to everyone.
export default function DrawStage({ prizeId }) {
  const { t, lang, user, ready, toast, socket } = useApp();
  const router = useRouter();
  const [prize, setPrize] = useState(null);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | counting | number | winner
  const [current, setCurrent] = useState(null);
  const [result, setResult] = useState(null);
  const [left, setLeft] = useState(0);
  const [frac, setFrac] = useState(0);
  const [flash, setFlash] = useState(1);
  const [starting, setStarting] = useState(false);
  const offset = useRef(0); // server clock minus our clock
  const timer = useRef(null);
  const isAdmin = user?.role === 'ADMIN';

  const refresh = useCallback(async () => {
    const [p, s] = await Promise.all([api(`/prizes/${prizeId}`), api(`/prizes/${prizeId}/draw-state`)]);
    setPrize(p.prize);
    setInfo(s);
    offset.current = s.serverNow - Date.now();
    return s;
  }, [prizeId]);

  const begin = useCallback((d) => {
    if (d.serverNow) offset.current = d.serverNow - Date.now();
    clearTimeout(timer.current);
    setResult(null);
    setCurrent(d);
    setPhase('counting');
  }, []);

  // first load
  useEffect(() => {
    if (!ready || !user) return;
    refresh().then((s) => { if (s.active) begin(s.active); }).catch((e) => setError(e.message));
  }, [ready, user, refresh, begin]);

  // live events, on the one shared connection
  useEffect(() => {
    if (!socket) return;
    const join = () => {
      socket.emit('join:prize', Number(prizeId));
      refresh().then((s) => { if (s.active) begin(s.active); }).catch(() => {});
    };
    const onResult = (r) => {
      offset.current = r.serverNow - Date.now();
      setResult(r);
      setPhase('number');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setPhase('winner'), 1000); // short pause for suspense
      refresh().catch(() => {});
    };
    const onError = (e) => { toast(e.message, 'error'); setPhase('idle'); };
    const onEnded = () => router.replace('/');

    if (socket.connected) join();
    socket.on('connect', join);
    socket.on('draw:start', begin);
    socket.on('draw:result', onResult);
    socket.on('draw:error', onError);
    socket.on('prize:ended', onEnded);
    return () => {
      socket.off('connect', join);
      socket.off('draw:start', begin);
      socket.off('draw:result', onResult);
      socket.off('draw:error', onError);
      socket.off('prize:ended', onEnded);
      clearTimeout(timer.current);
    };
  }, [socket, prizeId, refresh, begin, toast, router]);

  // countdown + flashing numbers (from the sold numbers only)
  useEffect(() => {
    if (phase !== 'counting' || !current) return;
    const tick = setInterval(() => {
      const remain = current.endsAt - (Date.now() + offset.current);
      setLeft(Math.max(0, Math.ceil(remain / 1000)));
      setFrac(Math.min(1, Math.max(0, 1 - remain / (current.seconds * 1000))));
    }, 80);
    const spin = setInterval(() => {
      if (current.soldNumbers && current.soldNumbers.length > 0) {
        setFlash(current.soldNumbers[Math.floor(Math.random() * current.soldNumbers.length)]);
      } else {
        setFlash(1 + Math.floor(Math.random() * current.totalCards));
      }
    }, 70);
    return () => { clearInterval(tick); clearInterval(spin); };
  }, [phase, current]);

  async function start() {
    setStarting(true);
    try {
      await api(`/admin/prizes/${prizeId}/draw`, { method: 'POST' });
      // make sure the admin's own screen starts the countdown too
      refresh().then((s) => { if (s.active) begin(s.active); }).catch(() => {});
    } catch (e) { toast(e.message, 'error'); }
    finally { setStarting(false); }
  }

  if (!ready) return <p className="ed-sub">{t('loading')}</p>;
  if (!user) return <p className="ed-sub ed-center" style={{ padding: 40 }}>{t('need_login')}</p>;
  if (error) return <div className="ed-error">{error}</div>;
  if (!prize || !info) return <p className="ed-sub">{t('loading')}</p>;

  const allDrawn = info.placesDrawn >= info.placesTotal;
  const iWon = result && result.winnerUserId === user.id;
  const placeText = (r) => `${rankLabel(lang, r.rank)} · ${r.placeName}`;

  return (
    <div className="ds">
      <span className="ds-live"><i /> {t('draw_title')}</span>
      <h1>{prize.title}</h1>

      {phase === 'idle' && (
        <>
          <div className="ds-ball">🎁</div>
          <p className="ed-sub">{prize.status !== 'CLOSED' ? t('draw_closed_first') : allDrawn ? t('all_drawn') : t('draw_wait')}</p>
          <p className="ed-sub" style={{ marginTop: 6 }}>{t('good_luck_all')}</p>
          {isAdmin && prize.status === 'CLOSED' && !allDrawn && (
            <div className="ds-actions">
              <button className="ed-btn ed-btn-gold" disabled={starting} onClick={start}><Icon name="play" size={20} /> {t('start_draw')}</button>
            </div>
          )}
        </>
      )}

      {phase === 'counting' && current && (
        <>
          <div className="ds-place">{placeText(current)}</div>
          <div className="ds-ring" style={{ background: `conic-gradient(var(--glow) ${frac * 360}deg, rgba(255,255,255,.14) 0)` }}>
            <div className="ds-count"><b>{left}</b><span>{t('seconds')}</span></div>
          </div>
          <div className="ds-flash">#{flash}</div>
          <p className="ed-sub">{t('drawing')}</p>
        </>
      )}

      {phase === 'number' && result && (
        <>
          <div className="ds-place">{placeText(result)}</div>
          <div className="ds-bignum">#{result.number}</div>
        </>
      )}

      {phase === 'winner' && result && (
        <>
          <Confetti count={iWon ? 110 : 70} />
          <div className="ds-place">{placeText(result)}</div>
          <div className="ds-bignum" style={{ fontSize: 64 }}>#{result.number}</div>
          <div className={`ds-win ${iWon ? 'me' : ''}`}>
            {iWon ? (
              <>
                <small>🎉🎉🎉</small>
                <h2>{t('congrats_win')}</h2>
                <p>{result.winnerName}</p>
                <span className="ds-prize">🏆 {result.placeName}</span>
              </>
            ) : (
              <>
                <small>{t('winner_is')}</small>
                <h2>{result.winnerName}</h2>
                <span className="ds-prize">🏆 {result.placeName}</span>
                <p style={{ marginTop: 12 }}>{t('hope_next')}</p>
              </>
            )}
          </div>
          {isAdmin && !allDrawn && (
            <div className="ds-actions">
              <button className="ed-btn ed-btn-gold" disabled={starting} onClick={start}><Icon name="play" size={20} /> {t('start_draw')}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}