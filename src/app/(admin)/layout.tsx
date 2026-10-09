import type { Metadata } from 'next';
import { siteUrl } from '@/lib/utils/site';
import '../globals.css';
import './admin.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'Administração | CNC', template: '%s | Administração CNC' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt"><body>{children}</body></html>;
}
