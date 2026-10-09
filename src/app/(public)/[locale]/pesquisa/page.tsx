import type { Metadata } from 'next';
import { Building2, CalendarDays, FileText, Landmark, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { GlobalSearchForm } from '@/components/forms/GlobalSearchForm';
import { Container, PageHero } from '@/components/ui/primitives';
import { Pagination } from '@/components/ui/pagination';
import { ResourceState } from '@/components/ui/resource-state';
import { searchPublicContent } from '@/lib/api/public';
import { apiErrorDescription, loadApi } from '@/lib/api/loader';
import { clampPage, firstParam } from '@/lib/api/query';
import { localizedUrl } from '@/lib/utils/site';
import type { GlobalSearchResult, Locale } from '@/types/domain';

type PageProps = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Pick<PageProps, 'params'>): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.search' });
  const canonical = localizedUrl(locale, 'search');
  return { title: t('title'), description: t('description'), alternates: { canonical, languages: { pt: localizedUrl('pt', 'search'), en: localizedUrl('en', 'search') } }, robots: { index: false, follow: true } };
}

const icons = { cooperative: Building2, news: CalendarDays, document: FileText, institutional: Landmark };

export default async function SearchPage({ params, searchParams }: PageProps) {
  const [{ locale: rawLocale }, raw] = await Promise.all([params, searchParams]);
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const q = firstParam(raw.q)?.trim() ?? '';
  const page = clampPage(raw.page);
  const result = q ? await loadApi(() => searchPublicContent({ locale, q, page, perPage: 10 })) : null;
  const t = await getTranslations({ locale, namespace: 'pages.search' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const groups: GlobalSearchResult['type'][] = ['cooperative', 'news', 'document', 'institutional'];
  return <>
    <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('description')} />
    <section className="section"><Container className="search-results">
      <GlobalSearchForm initialQuery={q} />
      {!q ? <ResourceState variant="empty" title={t('title')} description={t('description')} /> : result?.error ? <ResourceState variant="error" title={common('errorTitle')} description={apiErrorDescription(result.error, common('apiNotConfigured'), common('errorDescription'))} /> : result?.data && result.data.data.length === 0 ? <ResourceState variant="empty" title={common('noResults')} description={common('emptyDescription')} /> : result?.data && <>
        {groups.map((type) => {
          const items = result.data.data.filter((item) => item.type === type);
          if (items.length === 0) return null;
          const Icon = icons[type];
          return <section key={type}><div className="search-category"><h2>{t(`groups.${type}`)}</h2><span>{items.length}</span></div>{items.map((item) => <a href={item.url} key={`${item.type}-${item.id}`}><Icon size={20} aria-hidden="true" /><div><strong>{item.title}</strong>{item.summary && <span>{item.summary}</span>}</div><ArrowRight size={18} aria-hidden="true" /></a>)}</section>;
        })}
        <Pagination meta={result.data.meta} pathname="/pesquisa" query={{ q }} labels={{ previous: common('previous'), next: common('next'), page: common('page', { current: result.data.meta.currentPage, total: result.data.meta.lastPage }) }} />
      </>}
    </Container></section>
  </>;
}
