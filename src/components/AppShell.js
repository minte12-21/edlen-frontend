'use client';
import { usePathname } from 'next/navigation';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

// Public pages get the phone-style frame. The admin area has its own layout.
export default function AppShell({ children }) {
  const path = usePathname();
  if (path.startsWith('/admin')) return children;
  return (
    <div className="ed-app">
      <TopBar />
      {children}
      <BottomNav />
    </div>
  );
}
