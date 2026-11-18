'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import './page.css';
import Icon from '@/components/Icon';
import PasswordInput from '@/components/PasswordInput';
import { api, img } from '@/lib/api';
import { useApp } from '@/context/Providers';

function Checkout() {
  const params = useSearchParams();
  const router = useRouter();
  const { t, lang, user, login, withLoader } = useApp();
  const prizeId = params.get('prize');
  const number = params.get('number');
  const [prize, setPrize] = useState(null);
  const [error, setError] = useState('');
  const [f, setF] = useState({ name: '', phone: '', telegram: '', password: '', password2: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => { api(`/prizes/${prizeId}`).then((d) => setPrize(d.prize)).catch((e) => setError(e.message)); }, [prizeId]);

  async function pay(e) {
    e.preventDefault();
    setError('');
    if (!user && f.password !== f.password2) return setError(t('e_pass_mismatch'));
    try {
      const data = await withLoader(user ? t('ld_pay') : t('ld_signup'), async () => {
        const body = user ? { prizeId, number } : { prizeId, number, name: f.name, phone: f.phone, telegram: f.telegram, password: f.password };
        return api(user ? '/checkout/more' : '/checkout', { method: 'POST', body });
      });
      if (data.token) login(data.token, data.user);
      if (data.manual) router.push(`/pay/manual?card=${data.cardId}`); // bank transfer / "I paid" screen
      else window.location.href = data.checkoutUrl; // free test payment
    } catch (err) {
      setError(err.message);
    }
  }

  if (!prize) return <p className="ed-sub">{error || t('loading')}</p>;

  return (
    <div className="ed-page">
      <button className="ed-back" onClick={() => router.back()}><Icon name="back" size={18} /> {t('nav_home')}</button>
      <form className="ed-paper" onSubmit={pay}>
        <h1 className="ed-title" style={{ color: 'var(--ink)' }}>{t('reg_title')}</h1>
        <p className="ed-sub" style={{ color: 'var(--muted)', margin: '4px 0 16px' }}>{t('reg_sub')}</p>

        <div className="co-sum">
          <div className="co-ico">{prize.imageUrl ? <img src={img(prize.imageUrl)} alt="" /> : '🎁'}</div>
          <div><small>{t('selected')}</small><b>#{number}</b></div>
          <div className="co-price">{prize.price.toLocaleString()} ETB</div>
        </div>

        {user ? (
          <div className="co-as">{t('signed_as', { name: user.name })}</div>
        ) : (
          <>
            <label className="ed-field"><span>{t('f_name')}</span><input className="ed-input" required value={f.name} onChange={set('name')} placeholder="John Doe" autoComplete="name" /></label>
            <label className="ed-field"><span>{t('f_phone')}</span><input className="ed-input" required inputMode="tel" value={f.phone} onChange={set('phone')} placeholder="0911 123 456" autoComplete="tel" /></label>
            <label className="ed-field"><span>{t('f_tg')}</span><input className="ed-input" required value={f.telegram} onChange={set('telegram')} placeholder="@username" autoCapitalize="none" /></label>
            <label className="ed-field"><span>{t('f_pass')}</span><PasswordInput required minLength={6} value={f.password} onChange={set('password')} autoComplete="new-password" /></label>
            <label className="ed-field"><span>{t('f_pass2')}</span><PasswordInput required minLength={6} value={f.password2} onChange={set('password2')} autoComplete="new-password" /></label>
          </>
        )}

        {error && <div className="ed-error">{error}</div>}
        <button className="ed-btn ed-btn-primary" type="submit">
          <Icon name="card" size={22} /> {lang === 'am' ? 'ወደ ክፍያ ቀጥል' : 'Continue to payment'} · {prize.price.toLocaleString()} ETB
        </button>
        <div className="co-secure"><Icon name="lock" size={15} /> {t('secure_pay')}</div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={null}><Checkout /></Suspense>;
}