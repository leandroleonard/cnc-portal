import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsFilters } from '@/components/news/NewsFilters';
import { Container, PageHero } from '@/components/ui/primitives';
import { Pagination } from '@/components/ui/pagination';
import { ResourceState } from '@/components/ui/resource-state';
import { getNews, getNewsCategories } from '@/lib/api/public';
import { apiErrorDescription, loadApi } from '@/lib/api/loader';
import { clampPage, firstParam, normalizeSortDirection } from '@/lib/api/query';
import { localizedUrl } from '@/lib/utils/site';
import type { Locale } from '@/types/domain';

type PageProps = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Pick<PageProps, 'params'>): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.news' });
  const canonical = localizedUrl(locale, 'news');
  return { title: t('title'), description: t('description'), alternates: { canonical, languages: { pt: localizedUrl('pt', 'news'), en: localizedUrl('en', 'news') } }, openGraph: { title: t('title'), description: t('description'), url: canonical, type: 'website' } };
}

export default async function NewsPage({ params, searchParams }: PageProps) {
  const [{ locale: rawLocale }, raw] = await Promise.all([params, searchParams]);
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const query = { locale, search: firstParam(raw.search ?? raw.q), category: firstParam(raw.category), page: clampPage(raw.page), perPage: 9, sort: firstParam(raw.sort) ?? 'publishedAt', direction: normalizeSortDirection(raw.direction) } as const;
  const [newsResult, categoriesResult] = await Promise.all([
    loadApi(() => getNews(query)),
    loadApi(() => getNewsCategories(locale)),
  ]);
  const t = await getTranslations({ locale, namespace: 'pages.news' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const result = newsResult.data;
  const filterQuery: Record<string, string | number | undefined> = { search: query.search, category: query.category, sort: query.sort, direction: query.direction };
  return <>
    <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('description')} />
    <section className="section"><Container>
      <NewsFilters categories={categoriesResult.data ?? []} initialSearch={query.search} initialCategory={query.category} />
      {newsResult.error ? <ResourceState variant="error" title={common('errorTitle')} description={apiErrorDescription(newsResult.error, common('apiNotConfigured'), common('errorDescription'))} /> : !result || result.data.length === 0 ? <ResourceState variant="empty" title={t('empty')} description={common('emptyDescription')} /> : <>
        <div className="news-page-grid card-grid card-grid--three">{result.data.map((item, index) => <NewsCard item={item} locale={locale} featured={item.featured && index === 0} key={item.id} readLabel={t('read')} />)}</div>
        <Pagination meta={result.meta} pathname="/actualidade" query={filterQuery} labels={{ previous: common('previous'), next: common('next'), page: common('page', { current: result.meta.currentPage, total: result.meta.lastPage }) }} />
      </>}
    </Container></section>
  </>;
}
