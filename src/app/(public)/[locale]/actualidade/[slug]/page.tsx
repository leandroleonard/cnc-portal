import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, Download, ExternalLink, Landmark } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { NewsCard } from '@/components/news/NewsCard';
import { RichContent } from '@/components/news/RichContent';
import { Container } from '@/components/ui/primitives';
import { ResourceState } from '@/components/ui/resource-state';
import { getArticle } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';
import { loadApi } from '@/lib/api/loader';
import { formatDate, formatFileSize } from '@/lib/utils/format';
import { localizedUrl } from '@/lib/utils/site';
import { mediaUrl } from '@/lib/media';
import type { Locale } from '@/types/domain';

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  try {
    const article = await getArticle(slug, locale);
    const description = article.summary ?? article.title;
    const canonical = localizedUrl(locale, 'news', article.slug);
    return { title: article.title, description, alternates: { canonical, languages: { pt: localizedUrl('pt', 'news', article.slug), en: localizedUrl('en', 'news', article.slug) } }, openGraph: { title: article.title, description, url: canonical, type: 'article', publishedTime: article.publishedAt, authors: article.author ? [article.author] : undefined, images: article.image?.url ? [{ url: article.image.url }] : undefined }, twitter: { card: 'summary_large_image', title: article.title, description, images: article.image?.url ? [article.image.url] : undefined } };
  } catch {
    return { title: locale === 'pt' ? 'Actualidade' : 'News' };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const result = await loadApi(() => getArticle(slug, locale));
  if (result.error instanceof ApiError && result.error.status === 404) notFound();
  const t = await getTranslations({ locale, namespace: 'pages.news' });
  const common = await getTranslations({ locale, namespace: 'common' });
  if (!result.data) return <Container className="section"><ResourceState variant="error" title={common('errorTitle')} description={result.error?.message ?? common('errorDescription')} /></Container>;
  const article = result.data;
  const image = mediaUrl(article.image);
  const canonical = localizedUrl(locale, 'news', article.slug);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`;
  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(`${article.title} ${canonical}`)}`;

  return <article className="article-page"><Container>
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">{locale === 'pt' ? 'Início' : 'Home'}</Link><span>/</span><Link href="/actualidade">{t('title')}</Link><span>/</span><span>{article.category.name}</span></nav>
    <header className="article-header"><span className="card-kicker">{article.category.name}</span><h1>{article.title}</h1>{article.summary && <p>{article.summary}</p>}<div className="article-meta"><span><CalendarDays size={16} aria-hidden="true" /> {formatDate(article.publishedAt, locale)}</span>{article.author && <span><Landmark size={16} aria-hidden="true" /> {article.author}</span>}</div></header>
    {image && <figure className="article-image"><Image src={image} alt={article.image?.altText ?? article.title} width={article.image?.width ?? 1800} height={article.image?.height ?? 1000} priority sizes="(max-width: 768px) 100vw, 1200px" />{article.image?.caption && <figcaption>{article.image.caption}</figcaption>}</figure>}
    <div className="article-layout"><aside className="share-bar"><span>{t('share')}</span><a href={facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook">f</a><a href={whatsAppUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp">w</a><a href={linkedInUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a></aside><RichContent blocks={article.content} /></div>
    {article.gallery && article.gallery.length > 0 && <section className="article-extra"><h2>{locale === 'pt' ? 'Galeria' : 'Gallery'}</h2><div className="gallery">{article.gallery.map((media) => <a href={media.url} target="_blank" rel="noreferrer" key={media.id}><Image src={media.url} alt={media.altText ?? article.title} width={media.width ?? 800} height={media.height ?? 600} sizes="(max-width: 768px) 100vw, 40vw" /></a>)}</div></section>}
    {article.videos && article.videos.length > 0 && <section className="article-extra"><h2>{locale === 'pt' ? 'Vídeos' : 'Videos'}</h2>{article.videos.map((video) => <p key={video.url}><a href={video.url} target="_blank" rel="noreferrer">{video.title ?? video.provider ?? video.url} <ExternalLink size={14} /></a></p>)}</section>}
    {article.documents && article.documents.length > 0 && <section className="article-extra"><h2>{locale === 'pt' ? 'Documentos relacionados' : 'Related documents'}</h2><div className="document-list">{article.documents.map((document) => <article className="document-card" key={document.id}><Download size={22} aria-hidden="true" /><div><h3>{document.title}</h3><p>{document.fileType.toUpperCase()} · {formatFileSize(document.fileSizeBytes, locale)}</p></div><a className="document-download" href={document.fileUrl} target="_blank" rel="noreferrer">{locale === 'pt' ? 'Descarregar' : 'Download'}</a></article>)}</div></section>}
    {article.links && article.links.length > 0 && <section className="article-extra"><h2>{locale === 'pt' ? 'Links úteis' : 'Useful links'}</h2><ul>{article.links.map((link) => <li key={link.url}><a href={link.url} target="_blank" rel="noreferrer">{link.label} <ExternalLink size={14} /></a></li>)}</ul></section>}
    {article.related && article.related.length > 0 && <section className="section section--soft article-related"><div className="section-heading"><div><h2>{t('related')}</h2></div></div><div className="card-grid card-grid--three">{article.related.map((item) => <NewsCard key={item.id} item={item} locale={locale} readLabel={t('read')} />)}</div></section>}
  </Container></article>;
}
