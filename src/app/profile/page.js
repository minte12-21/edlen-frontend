'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './page.css';
import Icon from '@/components/Icon';
import PasswordInput from '@/components/PasswordInput';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function Profile() {
  const { t, user, setUser, ready, logout, withLoader, toast } = useApp();
  const router = useRouter();
  const [f, setF] = useState({ name: '', phone: '', telegram: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setF({ name: user.name, phone: user.phone, telegram: user.telegram, password: '' });
  }, [user]);

  if (!ready) return <p className="ed-sub">{t('loading')}</p>;
  if (!user) return (
    <div className="ed-center" style={{ padding: '50px 10px' }}>
      <p className="ed-sub" style={{ marginBottom: 16 }}>{t('need_login')}</p>
      <Link href="/login" className="ed-btn ed-btn-primary">{t('login')}</Link>
    </div>
  );

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      const body = { name: f.name, phone: f.phone, telegram: f.telegram };
      if (f.password) body.password = f.password;
      const d = await api('/me', { method: 'PUT', body });
      setUser(d.user);
      setF((x) => ({ ...x, password: '' }));
      toast(t('saved'));
    } catch (err) { setError(err.message); }
  }

  const doLogout = () => withLoader(t('ld_logout'), async () => { logout(); router.replace('/'); });

  return (
    <div className="ed-page">
      <div className="pf-head">
        <div className="pf-avatar">{user.name.trim().charAt(0).toUpperCase()}</div>
        <h1 className="ed-title">{user.name}</h1>
        <p className="ed-sub">{user.phone}</p>
      </div>

      <form className="ed-paper" onSubmit={save}>
        <h2 style={{ color: 'var(--ink)', fontSize: 18, marginBottom: 14 }}><Icon name="edit" size={18} /> {t('edit_profile')}</h2>
        <label className="ed-field"><span>{t('f_name')}</span><input className="ed-input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="ed-field"><span>{t('f_phone')}</span><input className="ed-input" required inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
        <label className="ed-field"><span>{t('f_tg')}</span><input className="ed-input" required value={f.telegram} onChange={(e) => setF({ ...f, telegram: e.target.value })} autoCapitalize="none" /></label>
        <label className="ed-field"><span>{t('f_pass')}</span><PasswordInput minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="••••••" autoComplete="new-password" /></label>
        {error && <div className="ed-error">{error}</div>}
        <button className="ed-btn ed-btn-primary" type="submit">{t('save')}</button>
      </form>

      <div className="pf-menu">
        <Link href="/my-card" className="ed-btn ed-btn-ghost"><Icon name="ticket" size={20} /> {t('my_cards')}</Link>
        <Link href="/about" className="ed-btn ed-btn-ghost"><Icon name="star" size={20} /> {t('about')}</Link>
        {user.role === 'ADMIN' && <Link href="/admin" className="ed-btn ed-btn-gold"><Icon name="dashboard" size={20} /> Admin</Link>}
        <button className="ed-btn ed-btn-danger" onClick={doLogout}>{t('logout')}</button>
      </div>
    </div>
  );
}