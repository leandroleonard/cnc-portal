import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentFilters } from '@/components/documents/DocumentFilters';
import { Container, PageHero } from '@/components/ui/primitives';
import { Pagination } from '@/components/ui/pagination';
import { ResourceState } from '@/components/ui/resource-state';
import { getDocumentFacets, getDocuments } from '@/lib/api/public';
import { apiErrorDescription, loadApi } from '@/lib/api/loader';
import { clampPage, firstParam, normalizeSortDirection } from '@/lib/api/query';
import { localizedUrl } from '@/lib/utils/site';
import type { Locale } from '@/types/domain';

type PageProps = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Pick<PageProps, 'params'>): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.documents' });
  const canonical = localizedUrl(locale, 'documents');
  return { title: t('title'), description: t('description'), alternates: { canonical, languages: { pt: localizedUrl('pt', 'documents'), en: localizedUrl('en', 'documents') } }, openGraph: { title: t('title'), description: t('description'), url: canonical, type: 'website' } };
}

export default async function DocumentsPage({ params, searchParams }: PageProps) {
  const [{ locale: rawLocale }, raw] = await Promise.all([params, searchParams]);
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const search = firstParam(raw.search ?? raw.q);
  const category = firstParam(raw.category);
  const yearRaw = firstParam(raw.year);
  const year = yearRaw && /^\d{4}$/.test(yearRaw) ? Number(yearRaw) : undefined;
  const fileType = firstParam(raw.fileType ?? raw.type);
  const query = { locale, search, category, year, fileType, page: clampPage(raw.page), perPage: 12, sort: firstParam(raw.sort) ?? 'publishedAt', direction: normalizeSortDirection(raw.direction) } as const;
  const [documentsResult, facetsResult] = await Promise.all([loadApi(() => getDocuments(query)), loadApi(() => getDocumentFacets(locale))]);
  const t = await getTranslations({ locale, namespace: 'pages.documents' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const result = documentsResult.data;
  const filterQuery: Record<string, string | number | undefined> = { search, category, year, fileType, sort: query.sort, direction: query.direction };
  return <>
    <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('description')} />
    <section className="section"><Container>
      <DocumentFilters facets={facetsResult.data} initial={{ search, category, year: yearRaw, fileType }} />
      {documentsResult.error ? <ResourceState variant="error" title={common('errorTitle')} description={apiErrorDescription(documentsResult.error, common('apiNotConfigured'), common('errorDescription'))} /> : !result || result.data.length === 0 ? <ResourceState variant="empty" title={t('empty')} description={common('emptyDescription')} /> : <>
        <div className="library-count"><strong>{common('results', { count: result.meta.total })}</strong></div>
        <div className="document-list">{result.data.map((item) => <DocumentCard key={item.id} item={item} locale={locale} downloadLabel={t('download')} />)}</div>
        <Pagination meta={result.meta} pathname="/documentos" query={filterQuery} labels={{ previous: common('previous'), next: common('next'), page: common('page', { current: result.meta.currentPage, total: result.meta.lastPage }) }} />
      </>}
      {facetsResult.error && <p className="filter-service-note">{apiErrorDescription(facetsResult.error, common('apiNotConfigured'), common('errorDescription'))}</p>}
    </Container></section>
  </>;
}
