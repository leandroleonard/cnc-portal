import { Link } from '@/i18n/navigation';

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: Parameters<typeof Link>[0]['href'] }> }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">{items[0]?.label}</Link>{items.slice(1).map((item, index) => <span key={`${item.label}-${index}`}>{item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</span>)}</nav>;
}
