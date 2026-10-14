import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RichContent } from '@/components/news/RichContent';
import { AppLink, Container, DemoBadge, PageHero, SectionHeading } from '@/components/ui/primitives';
import { ResourceState } from '@/components/ui/resource-state';
import { getInstitutional } from '@/lib/api/public';
import { apiErrorDescription, loadApi } from '@/lib/api/loader';
import { staticMedia } from '@/lib/media';
import { filterManagedInstitutionalSections, INSTITUTIONAL_STATIC_SECTION_KEYS, institutionSectionExists } from '@/lib/utils/institutional';
import { localizedUrl } from '@/lib/utils/site';
import type { Locale } from '@/types/domain';
import { TrendingUp, Sprout, ShieldCheck, Users, ArrowRight, Handshake, MessageSquareText, Leaf, HeartHandshake, type LucideIcon } from 'lucide-react';

const institutionalLeaderImage = 'https://api.cnc.onaka.ao/storage/images/2026/10/f57e0d720fe244218c38406ba90c857a.png';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.institutional' });
  const canonical = localizedUrl(locale, 'institutional');

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical,
      languages: { pt: localizedUrl('pt', 'institutional'), en: localizedUrl('en', 'institutional') },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: canonical,
      type: 'website',
    },
  };
}

export default async function InstitutionalPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const result = await loadApi(() => getInstitutional(locale));
  const t = await getTranslations({ locale, namespace: 'pages.institutional' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const page = result.data;
  const sections = filterManagedInstitutionalSections(page?.sections ?? []);
  const hasAboutSection = institutionSectionExists(page?.sections, INSTITUTIONAL_STATIC_SECTION_KEYS.about);
  const hasLeaderSection = institutionSectionExists(page?.sections, INSTITUTIONAL_STATIC_SECTION_KEYS.leader);
  const hasStructureSection = institutionSectionExists(page?.sections, INSTITUTIONAL_STATIC_SECTION_KEYS.structure);

  const valueCards = [
    { title: t('intro.mission.title'), body: t('intro.mission.body'), Icon: TrendingUp },
    { title: t('intro.vision.title'), body: t('intro.vision.body'), Icon: Sprout },
    { title: t('intro.values.title'), body: t('intro.values.body'), Icon: ShieldCheck },
  ];

  const workCards = [
    { title: t('work.items.support.title'), body: t('work.items.support.body'), Icon: HeartHandshake },
    { title: t('work.items.promotion.title'), body: t('work.items.promotion.body'), Icon: TrendingUp },
    { title: t('work.items.capacity.title'), body: t('work.items.capacity.body'), Icon: Users },
    { title: t('work.items.articulation.title'), body: t('work.items.articulation.body'), Icon: Handshake },
    { title: t('work.items.information.title'), body: t('work.items.information.body'), Icon: MessageSquareText },
    { title: t('work.items.development.title'), body: t('work.items.development.body'), Icon: Leaf },
  ];

  return <>
    <PageHero eyebrow={t('eyebrow')} title={page?.title ?? t('title')} body={page?.summary ?? t('description')} />

    {hasAboutSection && (
      <section className="section">
        <Container>
          <div className="institution-intro">
            <div>
              <p className="eyebrow">{t('intro.eyebrow')}</p>
              <h2>{t('intro.title')}</h2>
            </div>
            <div>
              <p>{t('intro.body1')}</p>
              <p>{t('intro.body2')}</p>
            </div>
          </div>
          <div className="value-grid">
            {valueCards.map(({ title, body, Icon }) => (
              <article key={title}>
                <Icon size={28} />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    )}

    {hasLeaderSection && (
      <section className="leader-message">
        <Container>
          <div className="leader-photo">
            <Image src={institutionalLeaderImage} alt={t('leader.photoAlt')} width={880} height={620} sizes="(max-width: 768px) 100vw, 45vw" />
          </div>
          <div>
            <p className="eyebrow eyebrow--gold">{t('leader.eyebrow')}</p>
            <h2>{t('leader.title')}</h2>
            <p>{t('leader.body')}</p>
            <div className="signature-line" />
          </div>
        </Container>
      </section>
    )}

    <WorkSection t={t} work={workCards} />

    {hasStructureSection && (
      <section className="section">
        <Container>
          <SectionHeading
            eyebrow={t('structure.eyebrow')}
            title={t('structure.title')}
            body={t('structure.body')}
          />
          <div className="structure-tree">
            <div>{t('structure.main')}</div>
            <span />
            <div className="structure-row">
              <div>{t('structure.institutional')}</div>
              <div>{t('structure.technical')}</div>
              <div>{t('structure.communication')}</div>
            </div>
            <DemoBadge />
          </div>
        </Container>
      </section>
    )}

    <section className="section">
      <Container>
        {result.error ? (
          <ResourceState variant="error" title={common('errorTitle')} description={apiErrorDescription(result.error, common('apiNotConfigured'), common('errorDescription'))} />
        ) : sections.length === 0 ? (
          // <ResourceState variant="empty" title={t('empty')} description={common('emptyDescription')} />
          <div></div>
        ) : (
          <div className="institutional-sections">
            {sections.map((section, index) => (
              <section className={`institutional-section ${index % 2 === 1 ? 'institutional-section--reverse' : ''}`} key={section.id}>
                <div>
                  <p className="eyebrow">{section.key}</p>
                  <h2>{section.title}</h2>
                  {section.body && <p className="section-intro">{section.body}</p>}
                  {section.content && <RichContent blocks={section.content} />}
                </div>
                {section.image?.url && (
                  <div className="institutional-section__image">
                    <Image src={section.image.url} alt={section.image.altText ?? section.title} width={section.image.width ?? 1000} height={section.image.height ?? 700} sizes="(max-width: 768px) 100vw, 45vw" />
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
        {!result.error && page?.updatedAt && (
          <p className="content-updated">{locale === 'pt' ? 'Actualizado em' : 'Updated'} {new Intl.DateTimeFormat(locale === 'pt' ? 'pt-AO' : 'en-GB', { dateStyle: 'long' }).format(new Date(page.updatedAt))}</p>
        )}
      </Container>
    </section>

    <section className="section institutional-brand">
      <Container>
        <Image src={staticMedia.cncLogo} alt="" width={120} height={120} />
        <div>
          <p className="eyebrow">{t('brand.eyebrow')}</p>
          <h2>{t('brand.title')}</h2>
          <p>{t('description')}</p>
        </div>
      </Container>
    </section>
  </>;
}

function WorkSection({ t, work }: { t: (key: string) => string; work: Array<{ title: string; body: string; Icon: LucideIcon }> }) {
  return (
    <section className="section work-section">
      <Container>
        <div className="work-layout">
          <div>
            <p className="eyebrow eyebrow--gold">{t('work.eyebrow')}</p>
            <h2>{t('work.title')}</h2>
            <p>{t('work.body')}</p>
            <AppLink href="/institucional" variant="light">
              {t('work.cta')} <ArrowRight size={17} aria-hidden="true" />
            </AppLink>
          </div>
          <div className="work-grid">
            {work.map(({ title, body, Icon }) => (
              <article key={title}>
                <Icon size={22} />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}