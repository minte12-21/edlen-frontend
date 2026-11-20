'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SWRConfig, mutate } from 'swr';
import { api, setToken, getToken } from '@/lib/api';
import { dict } from '@/lib/i18n';
import Loader from '@/components/Loader';
import ToastHost from '@/components/Toast';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Providers({ children }) {
  const [lang, setLangState] = useState('en');
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [splash, setSplash] = useState(true);
  const [overlay, setOverlay] = useState(null);
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  // language + first-visit splash + restore session + PREFETCH ALL DATA
  useEffect(() => {
    const saved = localStorage.getItem('edlen_lang');
    if (saved === 'am' || saved === 'en') setLangState(saved);

    const seen = sessionStorage.getItem('edlen_seen');
    const minSplash = seen ? 0 : 2000;
    const started = Date.now();

    (async () => {
      // 1. Start fetching all data simultaneously
      const fetches = [
        mutate('/prizes', api('/prizes')),
        mutate('/about', api('/about')),
      ];
      
      if (getToken()) {
        fetches.push(mutate('/me/cards', api('/me/cards')));
        fetches.push(mutate('/me/winners', api('/me/winners')));
        fetches.push(mutate('/admin/stats', api('/admin/stats')));
        fetches.push(mutate('/admin/prizes', api('/admin/prizes')));
        fetches.push(mutate('/admin/payment-mode', api('/admin/payment-mode')));
        
        try { 
          const userReq = api('/me');
          fetches.push(mutate('/me', userReq)); // Add /me to the wait list
          setUser((await userReq).user); 
        } catch { 
          setToken(null); 
        }
      }

      // 2. Wait for ALL fetches to finish before removing the splash screen
      await Promise.all(fetches);
      
      setReady(true);
      await sleep(Math.max(0, minSplash - (Date.now() - started)));
      sessionStorage.setItem('edlen_seen', '1');
      setSplash(false);
    })();
  }, []);

  // Keep every open tab and the server in agreement about who is logged in
  useEffect(() => {
    const signedOut = () => setUser(null);
    const otherTab = (e) => {
      if (e.key !== 'edlen_token') return;
      if (!e.newValue) setUser(null);
      else api('/me').then((d) => setUser(d.user)).catch(() => setUser(null));
    };
    window.addEventListener('edlen:unauthorized', signedOut);
    window.addEventListener('storage', otherTab);
    return () => {
      window.removeEventListener('edlen:unauthorized', signedOut);
      window.removeEventListener('storage', otherTab);
    };
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = useCallback((l) => { setLangState(l); localStorage.setItem('edlen_lang', l); }, []);

  const t = useCallback((key, vars = {}) => {
    const s = dict[lang][key] ?? dict.en[key] ?? key;
    return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
  }, [lang]);

  const toast = useCallback((msg, type = 'ok') => {
    const id = ++idRef.current;
    setToasts((l) => (l.some((x) => x.msg === msg) ? l : [...l, { id, msg, type }]));
    setTimeout(() => setToasts((l) => l.filter((x) => x.id !== id)), 3200);
  }, []);

  const withLoader = useCallback(async (text, fn, minMs = 1100) => {
    setOverlay(text);
    const started = Date.now();
    try {
      return await fn();
    } finally {
      await sleep(Math.max(0, minMs - (Date.now() - started)));
      setOverlay(null);
    }
  }, []);

  const login = useCallback((token, u) => { setToken(token); setUser(u); }, []);
  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  const value = useMemo(
    () => ({ lang, setLang, t, user, setUser, ready, login, logout, withLoader, toast }),
    [lang, setLang, t, user, ready, login, logout, withLoader, toast],
  );

  return (
    <Ctx.Provider value={value}>
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
        {splash && <Loader text={t('loading')} />}
        {!splash && overlay && <Loader text={overlay} />}
        <ToastHost toasts={toasts} />
      </SWRConfig>
    </Ctx.Provider>
  );
}