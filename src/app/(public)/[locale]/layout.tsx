import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ApiConfigurationError } from '@/lib/api/client';
import { getPublicSettings } from '@/lib/api/public';
import { PublicShell } from '@/components/layout/PublicShell';
import { siteUrl } from '@/lib/utils/site';
import { routing } from '@/i18n/routing';
import type { Locale, SiteSettings } from '@/types/domain';
import '../../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  applicationName: 'CNC — Conselho Nacional de Cooperativas',
  authors: [{ name: 'Conselho Nacional de Cooperativas' }],
  creator: 'Conselho Nacional de Cooperativas',
  publisher: 'Conselho Nacional de Cooperativas',
};

type LayoutProps = { children: React.ReactNode; params: Promise<{ locale: string }> };

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale: localeParam } = await params;
  if (!routing.locales.includes(localeParam as Locale)) notFound();
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const messages = await getMessages();
  let settings: SiteSettings | null = null;
  try {
    settings = await getPublicSettings(locale);
  } catch (error) {
    if (!(error instanceof ApiConfigurationError)) {
      // Public chrome remains available when the backend is temporarily unavailable.
    }
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PublicShell locale={locale} settings={settings}>{children}</PublicShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
