import { Link } from '@/i18n/navigation';
import type { PaginationMeta } from '@/types/domain';

export function Pagination({
  meta,
  pathname,
  query,
  labels,
}: {
  meta: PaginationMeta;
  pathname: '/cooperativas' | '/actualidade' | '/documentos' | '/pesquisa';
  query: Record<string, string | number | undefined>;
  labels: { previous: string; next: string; page: string };
}) {
  if (meta.lastPage <= 1) return null;
  const pageItems = Array.from({ length: Math.min(meta.lastPage, 5) }, (_, index) => {
    const start = Math.max(1, Math.min(meta.currentPage - 2, meta.lastPage - 4));
    return start + index;
  }).filter((page) => page <= meta.lastPage);
  const makeHref = (page: number) => ({ pathname, query: { ...query, page: String(page) } }) as const;
  return (
    <nav className="pagination" aria-label={labels.page}>
      <Link aria-disabled={meta.currentPage <= 1} className={meta.currentPage <= 1 ? 'is-disabled' : ''} href={makeHref(Math.max(1, meta.currentPage - 1))}>{labels.previous}</Link>
      {pageItems.map((page) => (
        <Link key={page} aria-current={page === meta.currentPage ? 'page' : undefined} className={page === meta.currentPage ? 'active' : ''} href={makeHref(page)}>{page}</Link>
      ))}
      <Link aria-disabled={meta.currentPage >= meta.lastPage} className={meta.currentPage >= meta.lastPage ? 'is-disabled' : ''} href={makeHref(Math.min(meta.lastPage, meta.currentPage + 1))}>{labels.next}</Link>
    </nav>
  );
}
