import {
  Activity,
  ArrowRight,
  Building2,
  CircleDollarSign,
  Construction,
  Factory,
  Fish,
  MapPin,
  Sprout,
  Tractor,
  Users,
  Wheat,
  Wrench,
} from 'lucide-react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { HeroSlider } from '@/components/home/HeroSlider';
import { CooperativeFinder } from '@/components/cooperatives/CooperativeFinder';
import { CooperativeCard } from '@/components/cooperatives/CooperativeCard';
import { NewsCard } from '@/components/news/NewsCard';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { AngolaProvinceMap } from '@/components/maps/AngolaProvinceMap';
import { NewsletterSignup } from '@/components/forms/NewsletterSignup';
import { AppLink, Container, SectionHeading, TextLink } from '@/components/ui/primitives';
import { Link } from '@/i18n/navigation';
import { ResourceState } from '@/components/ui/resource-state';
import { getActivities, getProvinces, getPublicHome } from '@/lib/api/public';
import { apiErrorDescription, loadApi } from '@/lib/api/loader';
import { localizedUrl } from '@/lib/utils/site';
import { staticMedia } from '@/lib/media';
import type { Locale } from '@/types/domain';

type PageProps = { params: Promise<{ locale: string }> };

const normalizeActivityKey = (value?: string | null) =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const activityIconMap: Record<string, typeof Activity> = {
  agricultura: Wheat,
  agriculture: Wheat,
  agropecuaria: Tractor,
  livestock: Sprout,
  pecuaria: Sprout,
  pesca: Fish,
  pescas: Fish,
  fishing: Fish,
  comercio: CircleDollarSign,
  trade: CircleDollarSign,
  industria: Factory,
  industry: Factory,
  servicos: Wrench,
  services: Wrench,
  construcao: Construction,
  construction: Construction,
};

function getActivityIcon(activity: { slug?: string | null; name?: string | null }) {
  const keys = [activity.slug, activity.name];

  for (const key of keys) {
    const normalizedKey = normalizeActivityKey(key);
    if (normalizedKey && activityIconMap[normalizedKey]) {
      return activityIconMap[normalizedKey];
    }
  }

  return Activity;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = (localeParam === 'en' ? 'en' : 'pt') as Locale;
  const t = await getTranslations({ locale, namespace: 'brand' });
  const title = locale === 'pt' ? t('tagline') : t('tagline');
  const description = locale === 'pt'
    ? 'Portal público do Conselho Nacional de Cooperativas de Angola. Informação, conteúdos e serviços do movimento cooperativo.'
    : 'The public portal of Angola’s National Council of Cooperatives. Information, content and services for the cooperative movement.';
  const canonical = localizedUrl(locale, 'home');
  return {
    title: `${title} | CNC`,
    description,
    alternates: { canonical, languages: { pt: localizedUrl('pt', 'home'), en: localizedUrl('en', 'home'), 'x-default': localizedUrl('pt', 'home') } },
    openGraph: { title: `${title} | CNC`, description, url: canonical, siteName: 'CNC — Conselho Nacional de Cooperativas', locale: locale === 'pt' ? 'pt_AO' : 'en_GB', type: 'website', images: [{ url: staticMedia.cncLogo, width: 1080, height: 1113 }] },
    twitter: { card: 'summary_large_image', title: `${title} | CNC`, description, images: [staticMedia.cncLogo] },
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = (localeParam === 'en' ? 'en' : 'pt') as Locale;
  const [homeResult, provincesResult, activitiesResult] = await Promise.all([
    loadApi(() => getPublicHome(locale)),
    loadApi(() => getProvinces(locale)),
    loadApi(() => getActivities(locale)),
  ]);
  const home = homeResult.data;
  const provinces = provincesResult.data ?? [];
  const activities = home?.activities?.length ? home.activities : activitiesResult.data ?? [];
  const t = await getTranslations({ locale, namespace: 'home' });
  const common = await getTranslations({ locale, namespace: 'common' });

  const stats = home?.statistics;
  const statItems = [
    { label: t('totalCooperatives'), value: stats?.cooperatives, Icon: Building2 },
    { label: t('members'), value: stats?.members, Icon: Users },
    { label: t('provinces'), value: stats?.provinces, Icon: MapPin },
    { label: t('activities'), value: stats?.activities, Icon: Activity },
  ];

  return (
    <>
      <HeroSlider slides={home?.heroSlides ?? []} locale={locale} />
      <section className="finder">
        <Container>
          <div className="finder__header"><div><p className="eyebrow">{t('directoryEyebrow')}</p><h2>{t('directoryTitle')}</h2></div><p>{t('directoryBody')}</p></div>
          <CooperativeFinder provinces={provinces} activities={activities} />
        </Container>
      </section>

      <section className="section stats-band">
        <Container>
          <SectionHeading eyebrow={t('statisticsEyebrow')} title={t('statisticsTitle')} body={t('statisticsBody')} />
          <div className="stat-grid">
            {statItems.map(({ label, value, Icon }) => <article className="stat-card" key={label}><Icon size={22} aria-hidden="true" /><strong>{value === null || value === undefined ? '—' : new Intl.NumberFormat(locale === 'pt' ? 'pt-AO' : 'en-GB').format(value)}</strong><span>{label}</span></article>)}
          </div>
          {!home?.statistics && <p className="data-note data-note--inline">{common('officialPending')}</p>}
        </Container>
      </section>

      <section className="section territory-section">
        <Container>
          <SectionHeading eyebrow={t('territoryEyebrow')} title={t('territoryTitle')} body={t('territoryBody')} light />
          <AngolaProvinceMap provinces={provinces} />
          {provincesResult.error && <p className="territory-note">{apiErrorDescription(provincesResult.error, common('apiNotConfigured'), common('officialPending'))}</p>}
        </Container>
      </section>

      <section className="section activity-section">
        <Container>
          <SectionHeading eyebrow={t('activitiesEyebrow')} title={t('activitiesTitle')} />
          {activities.length ?
            <div className="activity-grid">
              {activities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity);

                return (
                  <Link className="activity-card" href={{ pathname: '/cooperativas', query: locale === 'pt' ? { actividade: activity.slug } : { activity: activity.slug } }} key={activity.id}>
                    <ActivityIcon size={25} aria-hidden="true" />
                    <strong>{activity.name}</strong>
                    <span>{activity.cooperativeCount ?? ''}</span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                );
              })}
            </div> :
            <ResourceState variant={activitiesResult.error ? 'error' : 'empty'} title={activitiesResult.error ? common('errorTitle') : common('emptyTitle')} description={activitiesResult.error ? apiErrorDescription(activitiesResult.error, common('apiNotConfigured'), common('errorDescription')) : common('emptyDescription')} compact />}
        </Container>
      </section>

      <section className="section section--soft">
        <Container>
          <SectionHeading eyebrow={t('featuredEyebrow')} title={t('featuredTitle')} body={t('directoryBody')} action={<TextLink href="/cooperativas">{common('viewAll')}</TextLink>} />
          {home?.featuredCooperatives.length ? <div className="card-grid card-grid--three">{home.featuredCooperatives.map((item) => <CooperativeCard item={item} detailLabel={locale === 'pt' ? 'Ver perfil' : 'View profile'} key={item.id} />)}</div> : <ResourceState variant={homeResult.error ? 'error' : 'empty'} title={homeResult.error ? common('errorTitle') : common('emptyTitle')} description={homeResult.error ? apiErrorDescription(homeResult.error, common('apiNotConfigured'), common('errorDescription')) : common('emptyDescription')} compact />}
        </Container>
      </section>

      <section className="section news-section">
        <Container>
          <SectionHeading eyebrow={t('newsEyebrow')} title={t('newsTitle')} body={locale === 'pt' ? 'Notícias, actividades, eventos e comunicados.' : 'News, activities, events and announcements published by CNC.'} action={<TextLink href="/actualidade">{common('viewAll')}</TextLink>} />
          {home?.latestNews.length ? <div className="news-layout"><NewsCard item={home.latestNews[0]} locale={locale} featured readLabel={locale === 'pt' ? 'Ler notícia' : 'Read article'} /><div className="news-stack">{home.latestNews.slice(1, 4).map((item) => <NewsCard item={item} locale={locale} key={item.id} readLabel={locale === 'pt' ? 'Ler notícia' : 'Read article'} />)}</div></div> : <ResourceState variant={homeResult.error ? 'error' : 'empty'} title={homeResult.error ? common('errorTitle') : common('emptyTitle')} description={homeResult.error ? apiErrorDescription(homeResult.error, common('apiNotConfigured'), common('errorDescription')) : common('emptyDescription')} compact />}
        </Container>
      </section>

      <section className="section work-section">
        <Container>
          <div className="work-layout"><div><p className="eyebrow eyebrow--gold">{t('workEyebrow')}</p><h2>{t('workTitle')}</h2><p>{t('workBody')}</p><AppLink href="/institucional" variant="light">{locale === 'pt' ? 'Conhecer a instituição' : 'About the institution'} <ArrowRight size={17} aria-hidden="true" /></AppLink></div><div className="home-institution-panel"><Image src={staticMedia.cncLogo} alt="" width={160} height={160} /><p>{locale === 'pt' ? '' : ''}</p></div></div>
        </Container>
      </section>

      <section className="section section--soft">
        <Container>
          <SectionHeading eyebrow={locale === 'pt' ? 'Centro de conteúdos' : 'Content centre'} title={t('documentsTitle')} body={locale === 'pt' ? 'Consulte os documentos e publicações disponibilizados.' : 'Browse documents and publications.'} action={<TextLink href="/documentos">{common('viewAll')}</TextLink>} />
          {home?.featuredDocuments.length ? <div className="document-list">{home.featuredDocuments.slice(0, 4).map((item) => <DocumentCard item={item} locale={locale} key={item.id} downloadLabel={locale === 'pt' ? 'Descarregar' : 'Download'} />)}</div> : <ResourceState variant={homeResult.error ? 'error' : 'empty'} title={homeResult.error ? common('errorTitle') : common('emptyTitle')} description={homeResult.error ? apiErrorDescription(homeResult.error, common('apiNotConfigured'), common('errorDescription')) : common('emptyDescription')} compact />}
        </Container>
      </section>

      <Container className="newsletter-container"><NewsletterSignup /></Container>
      <section className="main-cta"><Container><div><p className="eyebrow eyebrow--gold">{t('ctaEyebrow')}</p><h2>{t('ctaTitle')}</h2><p>{t('ctaBody')}</p></div><div className="button-row"><AppLink href="/institucional" variant="light">{locale === 'pt' ? 'Conhecer o CNC' : 'Discover CNC'}</AppLink><AppLink href="/contactos" variant="secondary">{locale === 'pt' ? 'Contactar o CNC' : 'Contact CNC'}</AppLink></div></Container></section>
    </>
  );
}

