'use client';
import { useEffect, useState } from 'react';
import './NumberGrid.css';
import Icon from './Icon';
import { useApp } from '@/context/Providers';

// Bottom sheet: pick one of the free numbers. It updates live when someone else takes a number.
export default function NumberGrid({ prize, taken, initial = null, onClose, onContinue }) {
  const { t, lang } = useApp();
  const [sel, setSel] = useState(initial);
  const [lost, setLost] = useState(null);
  const free = prize.totalCards - taken.size;
  const all = Array.from({ length: prize.totalCards }, (_, i) => i + 1);

  // someone else just took the number you picked
  useEffect(() => {
    if (sel && taken.has(sel)) { setLost(sel); setSel(null); }
  }, [taken, sel]);

  return (
    <div className="ng-back" onClick={onClose}>
      <div className="ng-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="ng-head">
          <div><h2>{t('sel_title')}</h2><p>{t('sel_sub')}</p></div>
          <button className="ng-close" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        </div>
        <span className="ng-left">{t('cards_left', { n: free })}</span>
        {lost && (
          <div className="ed-error" style={{ margin: '0 0 10px' }}>
            {lang === 'am' ? `ቁጥር #${lost} አሁን ተወስዷል። ሌላ ይምረጡ።` : `Number #${lost} was just taken. Pick another one.`}
          </div>
        )}
        <div className="ng-grid">
          {all.map((n) => {
            const sold = taken.has(n);
            return (
              <button key={n} disabled={sold} className={`ng-n ${sold ? 'sold' : ''} ${sel === n ? 'on' : ''}`} onClick={() => { setSel(n); setLost(null); }}>{n}</button>
            );
          })}
        </div>
        <div className="ng-sel">
          <div><span>{t('selected')}</span><b>{sel ? `#${sel}` : '-'}</b></div>
          <div style={{ textAlign: 'right' }}><span>{t('stat_price')}</span><b>{prize.price.toLocaleString()} ETB</b></div>
        </div>
        <button className="ed-btn ed-btn-primary" disabled={!sel} onClick={() => onContinue(sel)}>
          {t('continue')} <Icon name="arrow" size={20} />
        </button>
      </div>
    </div>
  );
}