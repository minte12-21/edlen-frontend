'use client';
import { useApp } from '@/context/Providers';

const STYLE = {
  ONGOING: 'bg-glow/15 text-glow border-glow/60',
  CLOSED: 'bg-gold/15 text-gold border-gold/60',
  ENDED: 'bg-white/10 text-white/70 border-white/30',
};

export default function StatusBadge({ status }) {
  const { t } = useApp();
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold ${STYLE[status] || STYLE.ENDED}`}>
      <i className={`inline-block w-1.5 h-1.5 rounded-full bg-current ${status === 'ONGOING' ? 'animate-pulse' : ''}`} />
      {t(`status_${String(status).toLowerCase()}`)}
    </span>
  );
}
