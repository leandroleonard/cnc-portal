import Link from 'next/link';
import { Pencil } from 'lucide-react';
import type { AdminListQuery } from '@/types/api';
import { AdminPageHeader, AdminPanel, AdminCreateLink, AdminApiState, AdminSearch, AdminPagination, AdminTable } from '@/components/admin/AdminUI';
import { listAdminCooperatives } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';
import { clampPage, firstParam } from '@/lib/api/query';
import type { CooperativeSummary } from '@/types/domain';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CooperativesAdminPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const search = firstParam(raw.search);
  const status = firstParam(raw.status);
  const query: AdminListQuery = { search, status, page: clampPage(raw.page), perPage: 20, sort: 'updatedAt', direction: 'desc' };
  const result = await loadApi(() => listAdminCooperatives(query));
  return <><AdminPageHeader title="Cooperativas" description="Cadastro central das cooperativas nacionais. O CNC gere e valida todos os perfis." action={<AdminCreateLink href="/admin/cooperativas/novo">Adicionar cooperativa</AdminCreateLink>} />{result.error ? <AdminApiState error={result.error} /> : <AdminPanel title="Directório de cooperativas" description="Pesquisa e gestão server-side, com filtros e paginação pela API."><div className="admin-list-toolbar"><AdminSearch initialValue={search} placeholder="Pesquisar nome, província ou registo…" /><form method="get"><label className="sr-only" htmlFor="cooperative-status">Estado</label><select className="admin-filter-select" id="cooperative-status" name="status" defaultValue={status ?? ''}><option value="">Todos os estados</option><option value="active">Activa</option><option value="pending_review">Em validação</option><option value="inactive">Inactiva</option></select></form></div>{result.data && <><AdminTable<CooperativeSummary> rows={result.data.data} getKey={(row) => row.id} emptyTitle="Sem cooperativas cadastradas" emptyDescription="Os registos de cooperativas serão listados aqui após criação através do CMS." columns={[{ key: 'name', label: 'Cooperativa', render: (row) => <><strong>{row.name}</strong><small className="admin-table-subline">{row.slug}</small></> }, { key: 'place', label: 'Localização', render: (row) => `${row.municipality?.name ? `${row.municipality.name}, ` : ''}${row.province.name}` }, { key: 'activity', label: 'Actividade', render: (row) => row.activityNames.join(', ') || '—' }, { key: 'status', label: 'Estado', render: (row) => <span className={`admin-tag ${row.status === 'active' ? 'admin-tag--green' : 'admin-tag--gold'}`}>{row.status === 'active' ? 'Activa' : row.status === 'inactive' ? 'Inactiva' : 'Em validação'}</span> }, { key: 'actions', label: 'Editar', align: 'end', render: (row) => <div className="admin-table-actions"><Link href={`/admin/cooperativas/${row.id}`} aria-label={`Editar ${row.name}`}><Pencil size={15} /></Link></div> }]} /><AdminPagination meta={result.data.meta} basePath="/admin/cooperativas" query={{ search, status }} /></>}</AdminPanel>}</>;
}
