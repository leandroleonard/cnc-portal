import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RichContent } from '@/components/news/RichContent';
import { Container, PageHero } from '@/components/ui/primitives';
import { ResourceState } from '@/components/ui/resource-state';
import { getInstitutional } from '@/lib/api/public';
import { apiErrorDescription, loadApi } from '@/lib/api/loader';
import { localizedUrl } from '@/lib/utils/site';
import { staticMedia } from '@/lib/media';
import type { Locale } from '@/types/domain';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.institutional' });
  const canonical = localizedUrl(locale, 'institutional');
  return { title: t('title'), description: t('description'), alternates: { canonical, languages: { pt: localizedUrl('pt', 'institutional'), en: localizedUrl('en', 'institutional') } }, openGraph: { title: t('title'), description: t('description'), url: canonical, type: 'website' } };
}

export default async function InstitutionalPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const result = await loadApi(() => getInstitutional(locale));
  const t = await getTranslations({ locale, namespace: 'pages.institutional' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const page = result.data;
  const sections = page?.sections.filter((section) => section.active).sort((a, b) => a.order - b.order) ?? [];
  return <>
    <PageHero eyebrow={t('eyebrow')} title={page?.title ?? t('title')} body={page?.summary ?? t('description')} />
    <section className="section"><Container>
      {result.error ? <ResourceState variant="error" title={common('errorTitle')} description={apiErrorDescription(result.error, common('apiNotConfigured'), common('errorDescription'))} /> : sections.length === 0 ? <ResourceState variant="empty" title={t('empty')} description={common('emptyDescription')} /> : <div className="institutional-sections">{sections.map((section, index) => <section className={`institutional-section ${index % 2 === 1 ? 'institutional-section--reverse' : ''}`} key={section.id}><div><p className="eyebrow">{section.key}</p><h2>{section.title}</h2>{section.body && <p className="section-intro">{section.body}</p>}{section.content && <RichContent blocks={section.content} />}</div>{section.image?.url && <div className="institutional-section__image"><Image src={section.image.url} alt={section.image.altText ?? section.title} width={section.image.width ?? 1000} height={section.image.height ?? 700} sizes="(max-width: 768px) 100vw, 45vw" /></div>}</section>)}</div>}
      {!result.error && page?.updatedAt && <p className="content-updated">{locale === 'pt' ? 'Actualizado em' : 'Updated'} {new Intl.DateTimeFormat(locale === 'pt' ? 'pt-AO' : 'en-GB', { dateStyle: 'long' }).format(new Date(page.updatedAt))}</p>}
    </Container></section>
    <section className="section institutional-brand"><Container><Image src={staticMedia.cncLogo} alt="" width={120} height={120} /><div><p className="eyebrow">CNC</p><h2>{locale === 'pt' ? 'Conselho Nacional de Cooperativas' : 'National Council of Cooperatives'}</h2><p>{t('description')}</p></div></Container></section>
  </>;
}
