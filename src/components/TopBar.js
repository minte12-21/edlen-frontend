'use client';
import Link from 'next/link';
import './TopBar.css';
import Icon from './Icon';
import LangSwitch from './LangSwitch';
import { useApp } from '@/context/Providers';

export default function TopBar() {
  const { user, lang } = useApp();
  return (
    <header className="tb">
      <Link href="/" className="tb-brand" aria-label="Edlen home">
        <span className="tb-mark"><img src="/logo.png" alt="Edlen" /></span>
        <span className="tb-name">{lang === 'am' ? 'እድሌን' : 'Edlen'}<small>{lang === 'am' ? 'Edlen' : 'እድሌን'}</small></span>
      </Link>
      <div className="tb-right">
        <LangSwitch />
        <Link href={user ? '/profile' : '/login'} className="tb-avatar" aria-label="Account">
          {user ? user.name.trim().charAt(0).toUpperCase() : <Icon name="user" size={20} />}
        </Link>
      </div>
    </header>
  );
}