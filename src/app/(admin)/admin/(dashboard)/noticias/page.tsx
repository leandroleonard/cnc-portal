import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { AdminPageHeader, AdminPanel, AdminCreateLink, AdminApiState, AdminSearch, AdminPagination, AdminTable } from '@/components/admin/AdminUI';
import { listAdminNews } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';
import { clampPage, firstParam } from '@/lib/api/query';
import type { AdminNewsListItem } from '@/types/domain';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function NewsAdminPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const search = firstParam(raw.search);
  const status = firstParam(raw.status);
  const result = await loadApi(() => listAdminNews({ search, status, page: clampPage(raw.page), perPage: 20, sort: 'updatedAt', direction: 'desc' }));
  return <><AdminPageHeader title="Actualidade" description="Gere notícias, actividades, eventos e comunicados, com traduções separadas em PT e EN." action={<AdminCreateLink href="/admin/noticias/novo">Nova publicação</AdminCreateLink>} />{result.error ? <AdminApiState error={result.error} /> : <AdminPanel title="Publicações" description="Rascunhos, agendamentos e conteúdos publicados."><div className="admin-list-toolbar"><AdminSearch initialValue={search} placeholder="Pesquisar título ou slug…" /><form method="get"><label className="sr-only" htmlFor="news-status">Estado da publicação</label><select className="admin-filter-select" id="news-status" name="status" defaultValue={status ?? ''}><option value="">Todos os estados</option><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="scheduled">Agendado</option></select></form></div>{result.data && <><AdminTable<AdminNewsListItem> rows={result.data.data} getKey={(row) => row.id} emptyTitle="Sem publicações" emptyDescription="Crie uma publicação para a disponibilizar no website público." columns={[{ key: 'title', label: 'Publicação', render: (row) => <><strong>{row.title}</strong><small className="admin-table-subline">{row.category.name} · {row.slug}</small></> }, { key: 'date', label: 'Data', render: (row) => new Intl.DateTimeFormat('pt-AO', { dateStyle: 'medium' }).format(new Date(row.publishedAt)) }, { key: 'status', label: 'Estado', render: (row) => <span className={`admin-tag ${row.status === 'published' ? 'admin-tag--green' : 'admin-tag--gold'}`}>{row.status === 'published' ? 'Publicado' : row.status === 'scheduled' ? 'Agendado' : 'Rascunho'}</span> }, { key: 'featured', label: 'Destaque', render: (row) => row.featured ? 'Sim' : '—' }, { key: 'actions', label: 'Editar', align: 'end', render: (row) => <div className="admin-table-actions"><Link href={`/admin/noticias/${row.id}`} aria-label={`Editar ${row.title}`}><Pencil size={15} /></Link></div> }]} /><AdminPagination meta={result.data.meta} basePath="/admin/noticias" query={{ search, status }} /></>}</AdminPanel>}</>;
}
