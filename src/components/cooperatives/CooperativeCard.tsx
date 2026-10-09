import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { CooperativeSummary } from '@/types/domain';
import { mediaUrl } from '@/lib/media';
import { TextLink } from '@/components/ui/primitives';

export function CooperativeCard({ item, detailLabel = 'Ver perfil' }: { item: CooperativeSummary; detailLabel?: string }) {
  const image = mediaUrl(item.coverImage) ?? mediaUrl(item.logo);
  return (
    <article className="coop-card">
      <Link href={{ pathname: '/cooperativas/[slug]', params: { slug: item.slug } }} className="card-image" aria-label={item.name}>
        {image ? <Image src={image} alt={item.coverImage?.altText ?? item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" /> : <span className="image-placeholder" aria-hidden="true" />}
        <span className={`status ${item.status === 'active' ? 'status--active' : ''}`}>{item.status}</span>
      </Link>
      <div className="coop-card__body">
        {item.activityNames.length > 0 && <span className="card-kicker">{item.activityNames.join(' · ')}</span>}
        <h3><Link href={{ pathname: '/cooperativas/[slug]', params: { slug: item.slug } }}>{item.name}</Link></h3>
        <p className="meta"><MapPin size={15} aria-hidden="true" /> {item.municipality?.name ? `${item.municipality.name}, ` : ''}{item.province.name}</p>
        {item.summary && <p>{item.summary}</p>}
        <TextLink href={{ pathname: '/cooperativas/[slug]', params: { slug: item.slug } }}>{detailLabel}</TextLink>
      </div>
    </article>
  );
}
