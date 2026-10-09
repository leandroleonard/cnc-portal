import type { ReactNode } from 'react';
import type { Locale, SiteSettings } from '@/types/domain';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

export async function PublicShell({ children, locale, settings }: { children: ReactNode; locale: Locale; settings: SiteSettings | null }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#content">{locale === 'pt' ? 'Saltar para o conteúdo' : 'Skip to content'}</a>
      <PublicHeader />
      <main id="content">{children}</main>
      <PublicFooter locale={locale} settings={settings} />
    </div>
  );
}
