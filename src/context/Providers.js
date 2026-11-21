'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SWRConfig, useSWRConfig } from 'swr';
import { io } from 'socket.io-client';
import { api, setToken, getToken, API_URL } from '@/lib/api';
import { dict } from '@/lib/i18n';
import Loader from '@/components/Loader';
import ToastHost from '@/components/Toast';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Providers({ children }) {
  const { mutate } = useSWRConfig();
  const [lang, setLangState] = useState('en');
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [splash, setSplash] = useState(true);
  const [overlay, setOverlay] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [socket, setSocket] = useState(null);
  const idRef = useRef(0);

  // language + short first-visit splash + restore session (the splash never waits more than 1.5 s)
  useEffect(() => {
    const saved = localStorage.getItem('edlen_lang');
    if (saved === 'am' || saved === 'en') setLangState(saved);

    const seen = sessionStorage.getItem('edlen_seen');
    const minSplash = seen ? 0 : 800;
    const started = Date.now();

    (async () => {
      const restore = (async () => {
        if (getToken()) {
          try { setUser((await api('/me')).user); } catch (e) { if (e.status === 401) setToken(null); }
        }
        setReady(true);
      })();
      await Promise.race([restore, sleep(1500)]);
      await sleep(Math.max(0, minSplash - (Date.now() - started)));
      sessionStorage.setItem('edlen_seen', '1');
      setSplash(false);
    })();
  }, []);

  // ONE live connection for the whole app. When anything changes, every screen quietly reloads its data.
  useEffect(() => {
    if (!ready) return;
    const s = io(API_URL, { auth: { token: getToken() }, transports: ['websocket', 'polling'] });
    let wait;
    const refresh = () => {
      clearTimeout(wait);
      wait = setTimeout(() => mutate(() => true), 150 + Math.random() * 600); // spreads the load
    };
    s.on('data:changed', refresh);
    s.io.on('reconnect', refresh);
    setSocket(s);
    return () => { clearTimeout(wait); s.disconnect(); setSocket(null); };
  }, [ready, user?.id, mutate]);

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
    () => ({ lang, setLang, t, user, setUser, ready, login, logout, withLoader, toast, socket }),
    [lang, setLang, t, user, ready, login, logout, withLoader, toast, socket],
  );

  return (
    <SWRConfig value={{ revalidateOnFocus: true, dedupingInterval: 1500, errorRetryCount: 2 }}>
      <Ctx.Provider value={value}>
        {children}
        {splash && <Loader text={t('loading')} />}
        {!splash && overlay && <Loader text={overlay} />}
        <ToastHost toasts={toasts} />
      </Ctx.Provider>
    </SWRConfig>
  );
}