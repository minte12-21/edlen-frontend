'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './admin.css';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function AdminLayout({ children }) {
  const { user, ready } = useApp();
  const router = useRouter();
  const path = usePathname();
  const [count, setCount] = useState(null); // payments waiting for approval

  useEffect(() => { if (ready && (!user || user.role !== 'ADMIN')) router.replace('/login'); }, [ready, user, router]);

  // Number on the Approvals tab, refreshed every 10 seconds
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    let stop = false;
    const tick = () => api('/admin/approvals/count').then((d) => { if (!stop) setCount(d.count); }).catch(() => {});
    tick();
    const timer = setInterval(tick, 10000);
    return () => { stop = true; clearInterval(timer); };
  }, [user]);

  if (!ready || !user || user.role !== 'ADMIN') return null;
  const link = (href, label) => <Link href={href} className={path === href ? 'on' : ''}>{label}</Link>;
  return (
    <div className="ad">
      <div className="ad-bar">
        <b>Edlen Admin</b>
        <nav className="ad-nav">
          {link('/admin', 'Dashboard')}
          {count !== null && (
            <Link href="/admin/approvals" className={path === '/admin/approvals' ? 'on' : ''}>
              Approvals
              {count > 0 && <span style={{ marginLeft: 6, padding: '2px 8px', borderRadius: 999, background: '#e5484d', color: '#fff', fontSize: 12, fontWeight: 800 }}>{count}</span>}
            </Link>
          )}
          {link('/admin/prizes/new', '+ New prize')}
          {link('/admin/settings', 'About & contact')}
          <Link href="/">Site</Link>
        </nav>
      </div>
      {children}
    </div>
  );
}