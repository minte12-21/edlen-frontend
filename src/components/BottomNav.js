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

export default function BottomNav() {
  const path = usePathname();
  const { t } = useApp();
  const [shift, setShift] = useState(0);
  const isActive = (href) => (href === '/' ? path === '/' : path.startsWith(href));

  // When the keyboard opens, the screen gets shorter and the nav is pushed up.
  // We push it back down by the same amount, so it stays at the real bottom of the phone.
  useEffect(() => {
    let fullH = window.innerHeight;
    let width = window.innerWidth;

    const update = () => {
      if (window.innerWidth !== width) { // phone was rotated: start again
        width = window.innerWidth;
        fullH = window.innerHeight;
      }
      if (window.innerHeight > fullH) fullH = window.innerHeight;
      const diff = fullH - window.innerHeight;
      setShift(diff > 120 ? diff : 0);
    };

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <nav
      style={{ bottom: `calc(env(safe-area-inset-bottom) - ${shift}px)` }}
      className="fixed left-1/2 -translate-x-1/2 z-50 flex w-[calc(100%-28px)] max-w-[452px] justify-around rounded-full bg-white px-2 py-2 shadow-[0_10px_40px_rgba(0,0,0,.45)]"
    >
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