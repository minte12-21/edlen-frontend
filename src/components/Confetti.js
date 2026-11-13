import { useMemo } from 'react';
import './Confetti.css';

const COLORS = ['#ffc83d', '#7cfc4a', '#ff5d73', '#4cc9f0', '#ffffff', '#b57bff'];

export default function Confetti({ count = 70 }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 1.2, dur: 2.6 + Math.random() * 2.4,
    color: COLORS[i % COLORS.length], w: 6 + Math.random() * 8,
  })), [count]);
  return (
    <div className="cf" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ left: `${p.left}%`, width: p.w, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
      ))}
    </div>
  );
}
