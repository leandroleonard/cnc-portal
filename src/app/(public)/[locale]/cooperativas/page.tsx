import { Building2, Map } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CooperativeCard } from '@/components/cooperatives/CooperativeCard';
import { CooperativeDirectoryFilters } from '@/components/cooperatives/CooperativeDirectoryFilters';
import { AngolaProvinceMap } from '@/components/maps/AngolaProvinceMap';
import { Container, PageHero } from '@/components/ui/primitives';
import { Pagination } from '@/components/ui/pagination';
import { ResourceState } from '@/components/ui/resource-state';
import { getActivities, getCooperativeFacets, getCooperatives, getMunicipalities, getProvinces } from '@/lib/api/public';
import { apiErrorDescription, loadApi } from '@/lib/api/loader';
import { firstParam, normalizeSortDirection, toPublicCooperativeQuery } from '@/lib/api/query';
import { localizedUrl } from '@/lib/utils/site';
import type { Locale, Municipality } from '@/types/domain';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Pick<PageProps, 'params'>): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.cooperatives' });
  const canonical = localizedUrl(locale, 'cooperatives');
  return { title: t('title'), description: t('description'), alternates: { canonical, languages: { pt: localizedUrl('pt', 'cooperatives'), en: localizedUrl('en', 'cooperatives') } }, openGraph: { title: t('title'), description: t('description'), url: canonical, type: 'website' } };
}

export default async function CooperativesPage({ params, searchParams }: PageProps) {
  const [{ locale: rawLocale }, raw] = await Promise.all([params, searchParams]);
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const query = toPublicCooperativeQuery(raw, locale);
  const [cooperativesResult, provincesResult, activitiesResult, facetsResult] = await Promise.all([
    loadApi(() => getCooperatives(query)),
    loadApi(() => getProvinces(locale)),
    loadApi(() => getActivities(locale)),
    loadApi(() => getCooperativeFacets(locale)),
  ]);
  const province = provincesResult.data?.find((item) => item.slug === query.province);
  const municipalitiesResult = query.province && province
    ? await loadApi(() => getMunicipalities(province.id, locale))
    : null;
  const municipalities: Municipality[] = municipalitiesResult?.data ?? [];
  const t = await getTranslations({ locale, namespace: 'pages.cooperatives' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const rawView = firstParam(raw.view);
  const view = rawView === 'map' || rawView === 'mapa' ? 'map' : 'list';
  const pageQuery: Record<string, string | number | undefined> = {
    search: query.search,
    [locale === 'pt' ? 'provincia' : 'province']: query.province,
    [locale === 'pt' ? 'municipio' : 'municipality']: query.municipality,
    [locale === 'pt' ? 'actividade' : 'activity']: query.activity,
    [locale === 'pt' ? 'estado' : 'status']: query.status,
    [locale === 'pt' ? 'tipo' : 'type']: query.type,
    view: view === 'map' ? (locale === 'pt' ? 'mapa' : 'map') : undefined,
  };
  const result = cooperativesResult.data;

  return <>
    <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('description')} />
    <section className="section directory">
      <Container>
        <div className="directory-layout">
          <CooperativeDirectoryFilters
            provinces={provincesResult.data ?? []}
            municipalities={municipalities}
            activities={activitiesResult.data ?? []}
            facets={facetsResult.data}
            initial={{ search: query.search, province: query.province, municipality: query.municipality, activity: query.activity, status: query.status, type: query.type }}
          />
          <div className="results-panel">
            <div className="results-toolbar">
              <div><strong>{result ? `${result.meta.total} ${t('found').toLowerCase()}` : t('title')}</strong><small>{result ? `${common('page', { current: result.meta.currentPage, total: Math.max(result.meta.lastPage, 1) })}` : common('officialPending')}</small></div>
              <div className="view-switch" role="group" aria-label={t('sort')}>
                <a className={view === 'list' ? 'active' : ''} href={`?${new URLSearchParams(Object.entries({ ...pageQuery, view: undefined }).filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)]))}`}><Building2 size={16} aria-hidden="true" /> {t('list')}</a>
                {/* <a className={view === 'map' ? 'active' : ''} href={`?${new URLSearchParams(Object.entries({ ...pageQuery, view: 'mapa' }).filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)]))}`}><Map size={16} aria-hidden="true" /> {t('map')}</a> */}
                <form method="get" className="sort-form">
                  {Object.entries(pageQuery).filter(([key, value]) => key !== 'view' && value !== undefined).map(([key, value]) => <input key={key} type="hidden" name={key} value={String(value)} />)}
                  <label className="sr-only" htmlFor="cooperative-sort">{t('sort')}</label>
                  <select id="cooperative-sort" name="sort" defaultValue={query.sort} aria-label={t('sort')}>
                    <option value="name">{t('sortName')}</option><option value="updatedAt">{t('sortUpdated')}</option>
                  </select>
                  <input type="hidden" name="direction" value={normalizeSortDirection(raw.direction)} />
                </form>
              </div>
            </div>
            {cooperativesResult.error ? <ResourceState variant="error" title={common('errorTitle')} description={apiErrorDescription(cooperativesResult.error, common('apiNotConfigured'), common('errorDescription'))} /> : !result || result.data.length === 0 ? <ResourceState variant="empty" title={t('emptyTitle')} description={t('emptyDescription')} /> : view === 'map' ? <div className="directory-map-view"><AngolaProvinceMap provinces={provincesResult.data ?? []} selectedCode={province?.code} showList /><div className="card-grid card-grid--two">{result.data.map((item) => <CooperativeCard key={item.id} item={item} detailLabel={t('detail')} />)}</div></div> : <div className="card-grid card-grid--two">{result.data.map((item) => <CooperativeCard key={item.id} item={item} detailLabel={t('detail')} />)}</div>}
            {result && <Pagination meta={result.meta} pathname="/cooperativas" query={pageQuery} labels={{ previous: common('previous'), next: common('next'), page: common('page', { current: result.meta.currentPage, total: result.meta.lastPage }) }} />}
          </div>
        </div>
        {(provincesResult.error || activitiesResult.error || facetsResult.error) && <p className="filter-service-note">{locale === 'pt' ? 'Alguns filtros poderão estar indisponíveis enquanto o sistema não estiver configurado.' : 'Some filters may be unavailable until the system is configured.'}</p>}
      </Container>
    </section>
  </>;
}
