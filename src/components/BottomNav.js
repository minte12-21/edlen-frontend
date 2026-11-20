'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import { useApp } from '@/context/Providers';

const ITEMS = [
  { href: '/', icon: 'home', key: 'nav_home' },
  { href: '/prizes', icon: 'gift', key: 'nav_prizes' },
  { href: '/my-card', icon: 'ticket', key: 'nav_mycard' },
  { href: '/winners', icon: 'trophy', key: 'nav_winners' },
  { href: '/profile', icon: 'user', key: 'nav_profile' },
];

const NO_KEYBOARD = ['checkbox', 'radio', 'button', 'submit', 'file', 'range', 'color'];

export default function BottomNav() {
  const path = usePathname();
  const { t } = useApp();
  const [typing, setTyping] = useState(false);
  const isActive = (href) => (href === '/' ? path === '/' : path.startsWith(href));

  // Hide the nav while the keyboard is open (like a real mobile app)
  useEffect(() => {
    const isField = (el) =>
      el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !NO_KEYBOARD.includes(el.type);

    const onIn = (e) => { if (isField(e.target)) setTyping(true); };
    const onOut = () => setTimeout(() => { if (!isField(document.activeElement)) setTyping(false); }, 120);

    // Backup: the screen height shrinks a lot when the keyboard opens
    let maxH = window.innerHeight;
    const onResize = () => {
      maxH = Math.max(maxH, window.innerHeight);
      if (window.innerHeight < maxH - 150) setTyping(true);
      else if (!isField(document.activeElement)) setTyping(false);
    };

    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  if (typing) return null;

  return (
    <nav className="fixed bottom-[env(safe-area-inset-bottom)] left-1/2 -translate-x-1/2 z-50 flex w-[calc(100%-28px)] max-w-[452px] justify-around rounded-full bg-white px-2 py-2 shadow-[0_10px_40px_rgba(0,0,0,.45)]">
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href}
          className={`flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[11px] font-bold ${isActive(i.href) ? 'text-g500' : 'text-[#44544a]'}`}>
          <Icon name={i.icon} size={22} stroke={isActive(i.href) ? 2.6 : 2} />
          {t(i.key)}
          <i className={`h-[3px] w-5 rounded-full ${isActive(i.href) ? 'bg-g500' : 'bg-transparent'}`} />
        </Link>
      ))}
    </nav>
  );
}