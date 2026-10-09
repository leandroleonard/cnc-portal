import type { Locale } from '@/types/domain';

export type SeoRoute = 'home' | 'cooperatives' | 'news' | 'institutional' | 'documents' | 'statistics' | 'contact' | 'search';

const localizedRoutes: Record<Locale, Record<SeoRoute, string>> = {
  pt: {
    home: '',
    cooperatives: 'cooperativas',
    news: 'actualidade',
    institutional: 'institucional',
    documents: 'documentos',
    statistics: 'estatisticas',
    contact: 'contactos',
    search: 'pesquisa',
  },
  en: {
    home: '',
    cooperatives: 'cooperatives',
    news: 'news',
    institutional: 'about',
    documents: 'documents',
    statistics: 'statistics',
    contact: 'contact',
    search: 'search',
  },
};

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export function localizedUrl(locale: Locale, route: SeoRoute, slug?: string): string {
  const base = `/${locale}${localizedRoutes[locale][route] ? `/${localizedRoutes[locale][route]}` : ''}`;
  return `${siteUrl()}${slug ? `${base}/${encodeURIComponent(slug)}` : base}`;
}
