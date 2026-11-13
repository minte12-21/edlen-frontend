import { Outfit, Noto_Sans_Ethiopic } from 'next/font/google';
import './globals.css';
import Providers from '@/context/Providers';
import AppShell from '@/components/AppShell';

const latin = Outfit({ subsets: ['latin'], variable: '--font-latin', display: 'swap' });
const ethiopic = Noto_Sans_Ethiopic({ subsets: ['ethiopic'], variable: '--font-ethiopic', display: 'swap' });

export const metadata = {
  title: 'Edlen | እድሌን',
  description: 'Pick a number, pay, and win. Campus prize draws.',
  manifest: '/manifest.json',
  icons: { icon: '/logo.png', apple: '/logo.png' },
};

export const viewport = { themeColor: '#0a3a1b', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${latin.variable} ${ethiopic.variable}`}>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
