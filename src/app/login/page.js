'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PasswordInput from '@/components/PasswordInput';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function Login() {
  const { t, login, withLoader } = useApp();
  const router = useRouter();
  const [f, setF] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const d = await withLoader(t('ld_login'), () => api('/login', { method: 'POST', body: f }));
      login(d.token, d.user);
      router.replace(d.user.role === 'ADMIN' ? '/admin' : '/my-card');
    } catch (err) { setError(err.message); }
  }

  return (
    <form className="ed-paper ed-page" style={{ marginTop: 20 }} onSubmit={submit}>
      <h1 className="ed-title" style={{ color: 'var(--ink)', marginBottom: 16 }}>{t('login_title')}</h1>
      <label className="ed-field"><span>{t('f_phone')}</span><input className="ed-input" required inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="09********" autoComplete="tel" /></label>
      <label className="ed-field"><span>{t('f_pass')}</span><PasswordInput required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" /></label>
      {error && <div className="ed-error">{error}</div>}
      <button className="ed-btn ed-btn-primary" type="submit">{t('login')}</button>
      <p className="ed-sub" style={{ color: 'var(--muted)', marginTop: 14, textAlign: 'center' }}>{t('no_account')} <Link href="/" style={{ color: 'var(--g500)', fontWeight: 800 }}>{t('nav_home')}</Link></p>
    </form>
  );
}