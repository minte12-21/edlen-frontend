'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { usePathname, useRouter } from 'next/navigation';
import './admin.css';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function AdminLayout({ children }) {
  const { user, ready } = useApp();
  const router = useRouter();
  const path = usePathname();
  const isAdmin = !!user && user.role === 'ADMIN';

  useEffect(() => { if (ready && !isAdmin) router.replace('/login'); }, [ready, isAdmin, router]);

  // Number on the Approvals tab, updates the moment someone sends a payment
  const { data: pend } = useSWR(isAdmin ? '/admin/approvals/count' : null, api, { shouldRetryOnError: false });
  const count = pend ? pend.count : null;

  if (!ready || !isAdmin) return null;
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