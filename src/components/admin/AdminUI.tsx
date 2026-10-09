import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import type { PaginationMeta } from '@/types/domain';
import { ResourceState } from '@/components/ui/resource-state';

export function AdminPageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="admin-page-header"><div><p className="admin-eyebrow">CNC · GESTÃO DE CONTEÚDOS</p><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}

export function AdminCreateLink({ href, children = 'Novo registo' }: { href: string; children?: ReactNode }) {
  return <Link className="button button--primary" href={href}><Plus size={17} />{children}</Link>;
}

export function AdminBackLink({ href, children = 'Voltar à lista' }: { href: string; children?: ReactNode }) {
  return <Link className="admin-back-link" href={href}><ArrowLeft size={16} />{children}</Link>;
}

export function AdminPanel({ title, description, children, action }: { title?: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return <section className="admin-panel">{(title || action) && <div className="admin-panel__header"><div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>{action}</div>}{children}</section>;
}

export function AdminApiState({ error, title = 'Não foi possível carregar os dados' }: { error: Error; title?: string }) {
  return <div className="admin-state"><ResourceState variant="error" title={title} description={error.message} /></div>;
}

export function AdminEmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="admin-empty"><div className="admin-empty__icon"><span>—</span></div><h2>{title}</h2><p>{description}</p>{action}</div>;
}

export function AdminTable<T>({
  columns,
  rows,
  getKey,
  emptyTitle,
  emptyDescription,
}: {
  columns: Array<{ key: string; label: string; render: (row: T) => ReactNode; align?: 'start' | 'end' }>;
  rows: T[];
  getKey: (row: T) => string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (rows.length === 0) return <AdminEmptyState title={emptyTitle} description={emptyDescription} />;
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr>{columns.map((column) => <th key={column.key} className={column.align === 'end' ? 'text-end' : ''}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={getKey(row)}>{columns.map((column) => <td key={column.key} className={column.align === 'end' ? 'text-end' : ''}>{column.render(row)}</td>)}</tr>)}</tbody></table></div>;
}

export function AdminPagination({ meta, basePath, query = {} }: { meta: PaginationMeta; basePath: string; query?: Record<string, string | undefined> }) {
  if (meta.lastPage <= 1) return null;
  const params = new URLSearchParams(Object.entries(query).filter((entry): entry is [string, string] => Boolean(entry[1])));
  const href = (page: number) => { const next = new URLSearchParams(params); next.set('page', String(page)); return `${basePath}?${next.toString()}`; };
  return <nav className="admin-pagination" aria-label="Paginação"><Link aria-disabled={meta.currentPage <= 1} href={href(Math.max(1, meta.currentPage - 1))}>Anterior</Link><span>Página {meta.currentPage} de {meta.lastPage}</span><Link aria-disabled={meta.currentPage >= meta.lastPage} href={href(Math.min(meta.lastPage, meta.currentPage + 1))}>Seguinte</Link></nav>;
}

export function AdminSearch({ placeholder = 'Pesquisar…', initialValue = '' }: { placeholder?: string; initialValue?: string }) {
  return <form className="admin-search" method="get"><label className="sr-only" htmlFor="admin-search">{placeholder}</label><input id="admin-search" type="search" name="search" defaultValue={initialValue} placeholder={placeholder} /><button type="submit">Pesquisar</button></form>;
}

export function FormFeedback({ error, success }: { error?: string; success?: string }) {
  if (error) return <p className="admin-form-error" role="alert">{error}</p>;
  if (success) return <p className="admin-form-success" role="status">{success}</p>;
  return null;
}
