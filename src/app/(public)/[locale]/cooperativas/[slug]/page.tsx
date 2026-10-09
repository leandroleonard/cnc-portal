import Image from 'next/image';
import { ArrowLeft, ExternalLink, Mail, MapPin, Phone, Users } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CooperativeCard } from '@/components/cooperatives/CooperativeCard';
import { Container, StatusPill } from '@/components/ui/primitives';
import { ResourceState } from '@/components/ui/resource-state';
import { getCooperative } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';
import { loadApi } from '@/lib/api/loader';
import { formatFileSize } from '@/lib/utils/format';
import { localizedUrl } from '@/lib/utils/site';
import { mediaUrl } from '@/lib/media';
import type { Locale } from '@/types/domain';

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  try {
    const item = await getCooperative(slug, locale);
    const description = item.summary ?? item.description ?? item.name;
    const canonical = localizedUrl(locale, 'cooperatives', slug);
    return { title: item.name, description, alternates: { canonical, languages: { pt: localizedUrl('pt', 'cooperatives', slug), en: localizedUrl('en', 'cooperatives', slug) } }, openGraph: { title: item.name, description, url: canonical, type: 'article', images: item.coverImage?.url ? [{ url: item.coverImage.url }] : undefined } };
  } catch {
    return { title: locale === 'pt' ? 'Cooperativa' : 'Cooperative' };
  }
}

export default async function CooperativeDetailPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const result = await loadApi(() => getCooperative(slug, locale));
  if (result.error instanceof ApiError && result.error.status === 404) notFound();
  const t = await getTranslations({ locale, namespace: 'pages.cooperatives' });
  const common = await getTranslations({ locale, namespace: 'common' });
  if (!result.data) return <Container className="section"><ResourceState variant="error" title={common('errorTitle')} description={result.error?.message ?? common('errorDescription')} /></Container>;
  const item = result.data;
  const cover = mediaUrl(item.coverImage);
  const status = item.status === 'active' ? (locale === 'pt' ? 'Activa' : 'Active') : item.status === 'pending_review' ? (locale === 'pt' ? 'Em validação' : 'Under review') : (locale === 'pt' ? 'Inactiva' : 'Inactive');
  const summary = [
    item.province.name && [t('province'), item.province.name],
    item.municipality?.name && [t('municipality'), item.municipality.name],
    item.activityNames.length > 0 && [t('activityTitle'), item.activityNames.join(', ')],
    item.foundedYear && [t('founded'), String(item.foundedYear)],
    item.memberCount !== null && item.memberCount !== undefined && [t('members'), new Intl.NumberFormat(locale === 'pt' ? 'pt-AO' : 'en-GB').format(item.memberCount)],
  ].filter((entry): entry is [string, string] => Array.isArray(entry));
  const productsAndServices = [...(item.products ?? []), ...(item.services ?? [])];
  const gallery = item.gallery ?? [];

  return <>
    <section className={`detail-cover ${cover ? '' : 'detail-cover--plain'}`}>
      {cover && <Image src={cover} alt={item.coverImage?.altText ?? ''} fill sizes="100vw" priority />}
      <div className="detail-cover__overlay" />
      <Container>
        <Link href="/cooperativas" className="back-link"><ArrowLeft size={17} aria-hidden="true" /> {t('back')}</Link>
        <div className="detail-title">
          {item.logo?.url ? <Image className="coop-monogram coop-monogram--image" src={item.logo.url} alt={item.logo.altText ?? item.name} width={88} height={88} /> : <div className="coop-monogram" aria-hidden="true">{item.name.charAt(0)}</div>}
          <div><StatusPill tone={item.status === 'active' ? 'success' : item.status === 'inactive' ? 'neutral' : 'warning'}>{status}</StatusPill><h1>{item.name}</h1><p><MapPin size={18} aria-hidden="true" />{item.municipality?.name ? `${item.municipality.name}, ` : ''}{item.province.name}</p></div>
        </div>
      </Container>
    </section>
    <section className="section detail-page"><Container>
      {summary.length > 0 && <div className="summary-strip">{summary.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}
      <div className="detail-layout">
        <article className="detail-content">
          {item.description && <section><p className="eyebrow">{t('about')}</p><h2>{t('about')}</h2><p>{item.description}</p></section>}
          {item.activityNames.length > 0 && <section><h2>{t('activityTitle')}</h2><div className="tag-list">{item.activityNames.map((name) => <span key={name}>{name}</span>)}</div></section>}
          {productsAndServices.length > 0 && <section><h2>{t('products')}</h2><div className="product-grid">{productsAndServices.map((entry) => <article key={`${entry.name}-${entry.description ?? ''}`}><h3>{entry.name}</h3>{entry.description && <p>{entry.description}</p>}</article>)}</div></section>}
          {gallery.length > 0 && <section><h2>{t('gallery')}</h2><div className="gallery">{gallery.map((image) => <a key={image.id} href={image.url} target="_blank" rel="noreferrer" aria-label={image.altText ?? item.name}><Image src={image.url} alt={image.altText ?? ''} width={image.width ?? 800} height={image.height ?? 600} sizes="(max-width: 768px) 100vw, 40vw" /></a>)}</div></section>}
          {item.documents && item.documents.length > 0 && <section><h2>{locale === 'pt' ? 'Documentos' : 'Documents'}</h2><ul className="detail-document-list">{item.documents.map((document) => <li key={document.id}><a href={document.fileUrl} target="_blank" rel="noreferrer">{document.title} <span>{document.fileType} · {formatFileSize(document.fileSizeBytes, locale)}</span></a></li>)}</ul></section>}
        </article>
        <aside className="detail-aside">
          {(item.registrationNumber || item.type || item.foundedYear || item.memberCount !== null && item.memberCount !== undefined) && <div className="info-card"><h2>{locale === 'pt' ? 'Informação institucional' : 'Organisation details'}</h2>{item.registrationNumber && <InfoRow label={t('registration')} value={item.registrationNumber} />}{item.type && <InfoRow label={t('type')} value={item.type} />}{item.foundedYear && <InfoRow label={t('founded')} value={String(item.foundedYear)} />}{item.memberCount !== null && item.memberCount !== undefined && <InfoRow label={t('members')} value={new Intl.NumberFormat(locale === 'pt' ? 'pt-AO' : 'en-GB').format(item.memberCount)} icon={<Users size={15} />} />}</div>}
          {(item.location || item.address || item.municipality) && <div className="info-card"><h2>{t('location')}</h2>{item.location && <div className="mini-map"><MapPin size={26} aria-hidden="true" /><span>{item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}</span><a href={`https://www.openstreetmap.org/?mlat=${item.location.latitude}&mlon=${item.location.longitude}#map=12/${item.location.latitude}/${item.location.longitude}`} target="_blank" rel="noreferrer">{locale === 'pt' ? 'Abrir mapa' : 'Open map'} <ExternalLink size={14} /></a></div>}{item.address && <InfoRow label={locale === 'pt' ? 'Endereço' : 'Address'} value={item.address} />}{item.municipality?.name && <InfoRow label={t('municipality')} value={item.municipality.name} />}{item.province.name && <InfoRow label={t('province')} value={item.province.name} />}</div>}
          {(item.contacts?.email || item.contacts?.phone || item.contacts?.website) && <div className="info-card"><h2>{t('contacts')}</h2>{item.contacts.phone && <InfoRow label={t('contacts')} value={item.contacts.phone} icon={<Phone size={15} />} href={`tel:${item.contacts.phone}`} />}{item.contacts.email && <InfoRow label="Email" value={item.contacts.email} icon={<Mail size={15} />} href={`mailto:${item.contacts.email}`} />}{item.contacts.website && <InfoRow label="Website" value={item.contacts.website} icon={<ExternalLink size={15} />} href={item.contacts.website} />}</div>}
        </aside>
      </div>
    </Container></section>
    {item.related && item.related.length > 0 && <section className="section section--soft"><Container><div className="section-heading"><div><h2>{t('related')}</h2></div></div><div className="card-grid card-grid--three">{item.related.map((related) => <CooperativeCard key={related.id} item={related} detailLabel={t('detail')} />)}</div></Container></section>}
  </>;
}

function InfoRow({ label, value, icon, href }: { label: string; value: string; icon?: React.ReactNode; href?: string }) {
  return <p className="info-row"><span>{icon}{label}</span>{href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}><strong>{value}</strong></a> : <strong>{value}</strong>}</p>;
}
