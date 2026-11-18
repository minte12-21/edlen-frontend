'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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

  // language + first-visit splash + restore session
  useEffect(() => {
    const saved = localStorage.getItem('edlen_lang');
    if (saved === 'am' || saved === 'en') setLangState(saved);

    const seen = sessionStorage.getItem('edlen_seen');
    const minSplash = seen ? 0 : 2000;
    const started = Date.now();

    (async () => {
      if (getToken()) {
        try { setUser((await api('/me')).user); } catch { setToken(null); }
      }
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

  // The same message is never stacked twice
  const toast = useCallback((msg, type = 'ok') => {
    const id = ++idRef.current;
    setToasts((l) => (l.some((x) => x.msg === msg) ? l : [...l, { id, msg, type }]));
    setTimeout(() => setToasts((l) => l.filter((x) => x.id !== id)), 3200);
  }, []);

  // Show the loader while an async job runs (at least ~1s so it never flickers)
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
      {children}
      {splash && <Loader text={t('loading')} />}
      {!splash && overlay && <Loader text={overlay} />}
      <ToastHost toasts={toasts} />
    </Ctx.Provider>
  );
}