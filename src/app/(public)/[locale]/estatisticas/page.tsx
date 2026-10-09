import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Activity, Building2, MapPin, Users } from 'lucide-react';
import { AngolaProvinceMap } from '@/components/maps/AngolaProvinceMap';
import { BarChart, HorizontalBreakdown, TrendChart } from '@/components/charts/StatisticsCharts';
import { Container, PageHero } from '@/components/ui/primitives';
import { ResourceState } from '@/components/ui/resource-state';
import { getProvinces, getStatistics } from '@/lib/api/public';
import { apiErrorDescription, loadApi } from '@/lib/api/loader';
import { localizedUrl } from '@/lib/utils/site';
import type { Locale } from '@/types/domain';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.statistics' });
  const canonical = localizedUrl(locale, 'statistics');
  return { title: t('title'), description: t('description'), alternates: { canonical, languages: { pt: localizedUrl('pt', 'statistics'), en: localizedUrl('en', 'statistics') } }, openGraph: { title: t('title'), description: t('description'), url: canonical, type: 'website' } };
}

export default async function StatisticsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const [statsResult, provincesResult] = await Promise.all([loadApi(() => getStatistics(locale)), loadApi(() => getProvinces(locale))]);
  const t = await getTranslations({ locale, namespace: 'pages.statistics' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const dataset = statsResult.data;
  const totals = dataset?.totals;
  const allEmpty = dataset && !Object.values(dataset.totals).some((value) => value !== null) && !dataset.byProvince.length && !dataset.byActivity.length && !dataset.byStatus.length && !dataset.evolution.length;
  const cards = [
    { label: t('provinceChart'), value: totals?.cooperatives, Icon: Building2 },
    { label: locale === 'pt' ? 'Cooperados' : 'Cooperative members', value: totals?.members, Icon: Users },
    { label: locale === 'pt' ? 'Províncias com dados' : 'Provinces with data', value: totals?.provinces, Icon: MapPin },
    { label: locale === 'pt' ? 'Áreas de actividade' : 'Activity areas', value: totals?.activities, Icon: Activity },
  ];
  return <>
    <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('description')} />
    <section className="section statistics-page"><Container>
      {statsResult.error ? <ResourceState variant="error" title={common('errorTitle')} description={apiErrorDescription(statsResult.error, common('apiNotConfigured'), common('errorDescription'))} /> : allEmpty ? <ResourceState variant="empty" title={t('empty')} description={common('emptyDescription')} /> : <>
        <div className="stat-grid">{cards.map(({ label, value, Icon }) => <article className="stat-card" key={label}><Icon size={22} aria-hidden="true" /><strong>{value === null || value === undefined ? '—' : new Intl.NumberFormat(locale === 'pt' ? 'pt-AO' : 'en-GB').format(value)}</strong><span>{label}</span></article>)}</div>
        <div className="chart-grid"><BarChart title={t('provinceChart')} items={dataset?.byProvince ?? []} emptyLabel={t('empty')} /><HorizontalBreakdown title={t('activityChart')} items={dataset?.byActivity ?? []} emptyLabel={t('empty')} /><HorizontalBreakdown title={t('statusChart')} items={dataset?.byStatus ?? []} emptyLabel={t('empty')} /><TrendChart title={t('trendChart')} items={dataset?.evolution ?? []} emptyLabel={t('empty')} /></div>
        <section className="stats-territory"><div className="section-heading"><div><h2>{locale === 'pt' ? 'Distribuição territorial' : 'Territorial distribution'}</h2><p className="section-intro">{locale === 'pt' ? 'Selecione uma província para consultar o directório.' : 'Select a province to browse the directory.'}</p></div></div><AngolaProvinceMap provinces={provincesResult.data ?? []} showList /></section>
        {dataset?.generatedAt && <p className="data-updated">{locale === 'pt' ? 'Dados actualizados em' : 'Data updated'} {new Intl.DateTimeFormat(locale === 'pt' ? 'pt-AO' : 'en-GB', { dateStyle: 'long' }).format(new Date(dataset.generatedAt))}</p>}
      </>}
    </Container></section>
  </>;
}
