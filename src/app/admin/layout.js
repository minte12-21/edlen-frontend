'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './admin.css';
import { useApp } from '@/context/Providers';

export default function AdminLayout({ children }) {
  const { user, ready } = useApp();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => { if (ready && (!user || user.role !== 'ADMIN')) router.replace('/login'); }, [ready, user, router]);
  if (!ready || !user || user.role !== 'ADMIN') return null;
  const link = (href, label) => <Link href={href} className={path === href ? 'on' : ''}>{label}</Link>;
  return (
    <div className="ad">
      <div className="ad-bar">
        <b>Edlen Admin</b>
        <nav className="ad-nav">{link('/admin', 'Dashboard')}{link('/admin/prizes/new', '+ New prize')}{link('/admin/settings', 'About & contact')}<Link href="/">Site</Link></nav>
      </div>
      {children}
    </div>
  );
}
