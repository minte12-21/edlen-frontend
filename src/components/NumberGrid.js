'use client';
import { useState } from 'react';
import './NumberGrid.css';
import Icon from './Icon';
import { useApp } from '@/context/Providers';

// Bottom sheet: pick one of the free numbers
export default function NumberGrid({ prize, taken, initial = null, onClose, onContinue }) {
  const { t } = useApp();
  const [sel, setSel] = useState(initial);
  const free = prize.totalCards - taken.size;
  const all = Array.from({ length: prize.totalCards }, (_, i) => i + 1);
  return (
    <div className="ng-back" onClick={onClose}>
      <div className="ng-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="ng-head">
          <div><h2>{t('sel_title')}</h2><p>{t('sel_sub')}</p></div>
          <button className="ng-close" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        </div>
        <span className="ng-left">{t('cards_left', { n: free })}</span>
        <div className="ng-grid">
          {all.map((n) => {
            const sold = taken.has(n);
            return (
              <button key={n} disabled={sold} className={`ng-n ${sold ? 'sold' : ''} ${sel === n ? 'on' : ''}`} onClick={() => setSel(n)}>{n}</button>
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
