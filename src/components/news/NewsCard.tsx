import Image from 'next/image';
import { CalendarDays } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { NewsArticleSummary } from '@/types/domain';
import { mediaUrl } from '@/lib/media';
import { formatDate } from '@/lib/utils/format';
import type { Locale } from '@/types/domain';
import { TextLink } from '@/components/ui/primitives';

export function NewsCard({ item, locale, featured = false, readLabel = 'Ler notícia' }: { item: NewsArticleSummary; locale: Locale; featured?: boolean; readLabel?: string }) {
  const image = mediaUrl(item.image);
  const href = { pathname: '/actualidade/[slug]' as const, params: { slug: item.slug } };
  return (
    <article className={`news-card ${featured ? 'news-card--featured' : ''}`}>
      <Link href={href} className="card-image" aria-label={item.title}>
        {image ? <Image src={image} alt={item.image?.altText ?? item.title} fill sizes={featured ? '(max-width: 768px) 100vw, 55vw' : '(max-width: 768px) 40vw, 30vw'} /> : <span className="image-placeholder" aria-hidden="true" />}
      </Link>
      <div className="news-card__body">
        <div className="news-meta"><span>{item.category.name}</span><span><CalendarDays size={14} aria-hidden="true" /> {formatDate(item.publishedAt, locale)}</span></div>
        <h3><Link href={href}>{item.title}</Link></h3>
        {item.summary && <p>{item.summary}</p>}
        <TextLink href={href}>{readLabel}</TextLink>
      </div>
    </article>
  );
}
