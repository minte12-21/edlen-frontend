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

const NO_KEYBOARD = ['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'range', 'color', 'image'];

export default function BottomNav() {
  const path = usePathname();
  const { t } = useApp();
  // null = nav sits at the bottom. A number = nav is parked just below the screen (keyboard open)
  const [hideTop, setHideTop] = useState(null);
  const isActive = (href) => (href === '/' ? path === '/' : path.startsWith(href));

  useEffect(() => {
    let baseH = window.innerHeight; // biggest screen height seen (keyboard closed)
    let baseW = window.innerWidth;
    let focused = false; // a text field is focused
    let sawOpen = false; // the keyboard really opened
    let shown = null;
    let focusTimer = null;
    let burstTimer = null;

    const isField = (el) =>
      !!el && (el.tagName === 'TEXTAREA' || el.isContentEditable ||
        (el.tagName === 'INPUT' && !NO_KEYBOARD.includes(el.type)));

    // Height of what you can see (ignored when the page is pinch-zoomed)
    const viewH = () => {
      const vv = window.visualViewport;
      return vv && vv.scale <= 1.01 ? Math.min(window.innerHeight, vv.height) : window.innerHeight;
    };

    const apply = () => {
      if (window.innerWidth !== baseW) { // phone rotated: start again
        baseW = window.innerWidth;
        baseH = window.innerHeight;
        sawOpen = false;
      } else if (window.innerHeight > baseH) {
        baseH = window.innerHeight;
      }

      const keyboardOpen = viewH() < baseH - 120;
      if (keyboardOpen) sawOpen = true;
      else if (sawOpen) { focused = false; sawOpen = false; } // keyboard was closed (e.g. back button)

      const next = focused || keyboardOpen ? baseH : null;
      if (next !== shown) { shown = next; setHideTop(next); }
    };

    // The keyboard changes size while it animates (numbers, letters, password bar),
    // so keep checking for a moment after every focus change.
    const burst = () => {
      clearInterval(burstTimer);
      let n = 0;
      burstTimer = setInterval(() => { apply(); if (++n > 15) clearInterval(burstTimer); }, 100);
    };

    const onFocusIn = (e) => {
      if (!isField(e.target)) return;
      clearTimeout(focusTimer);
      focused = true;
      apply();
      burst();
    };

    const onFocusOut = () => {
      clearTimeout(focusTimer);
      focusTimer = setTimeout(() => {
        if (!isField(document.activeElement)) { focused = false; apply(); burst(); }
      }, 150);
    };

    window.addEventListener('resize', apply);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', apply);

    return () => {
      clearTimeout(focusTimer);
      clearInterval(burstTimer);
      window.removeEventListener('resize', apply);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', apply);
    };
  }, []);

  const hidden = hideTop !== null;

  return (
    <nav
      aria-hidden={hidden}
      style={hidden ? { top: hideTop, bottom: 'auto' } : { bottom: 'env(safe-area-inset-bottom)' }}
      className="fixed left-1/2 -translate-x-1/2 z-50 flex w-[calc(100%-28px)] max-w-[452px] justify-around rounded-full bg-white px-2 py-2 shadow-[0_10px_40px_rgba(0,0,0,.45)]"
    >
      {ITEMS.map((i) => (
        <Link 
          key={i.href} 
          href={i.href}
          prefetch={true} // <-- ADDED THIS
          className={`flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[11px] font-bold ${isActive(i.href) ? 'text-g500' : 'text-[#44544a]'}`}
        >
          <Icon name={i.icon} size={22} stroke={isActive(i.href) ? 2.6 : 2} />
          {t(i.key)}
          <i className={`h-[3px] w-5 rounded-full ${isActive(i.href) ? 'bg-g500' : 'bg-transparent'}`} />
        </Link>
      ))}
    </nav>
  );
}