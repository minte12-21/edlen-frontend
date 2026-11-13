'use client';
import { useApp } from '@/context/Providers';

export default function LangSwitch() {
  const { lang, setLang } = useApp();
  const base = 'px-3 py-1.5 rounded-full text-xs font-extrabold transition-colors';
  return (
    <div className="inline-flex bg-white/10 border border-white/20 rounded-full p-0.5" role="group" aria-label="Language">
      <button className={`${base} ${lang === 'en' ? 'bg-white text-ink' : 'text-white/80'}`} onClick={() => setLang('en')}>EN</button>
      <button className={`${base} ${lang === 'am' ? 'bg-white text-ink' : 'text-white/80'}`} onClick={() => setLang('am')}>አማ</button>
    </div>
  );
}
