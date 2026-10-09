import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { AdminPageHeader, AdminPanel, AdminCreateLink, AdminApiState, AdminSearch, AdminPagination, AdminTable } from '@/components/admin/AdminUI';
import { listAdminDocuments } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';
import { clampPage, firstParam } from '@/lib/api/query';
import { formatFileSize } from '@/lib/utils/format';
import type { AdminDocumentListItem } from '@/types/domain';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function DocumentsAdminPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const search = firstParam(raw.search);
  const status = firstParam(raw.status);
  const result = await loadApi(() => listAdminDocuments({ search, status, page: clampPage(raw.page), perPage: 20, sort: 'updatedAt', direction: 'desc' }));
  return <><AdminPageHeader title="Documentos" description="Publica legislação, regulamentos, relatórios, manuais, publicações e formulários." action={<AdminCreateLink href="/admin/documentos/novo">Adicionar documento</AdminCreateLink>} />{result.error ? <AdminApiState error={result.error} /> : <AdminPanel title="Biblioteca documental"><div className="admin-list-toolbar"><AdminSearch initialValue={search} placeholder="Pesquisar documento…" /><form method="get"><label className="sr-only" htmlFor="document-status">Estado do documento</label><select className="admin-filter-select" id="document-status" name="status" defaultValue={status ?? ''}><option value="">Todos os estados</option><option value="draft">Rascunho</option><option value="published">Publicado</option></select></form></div>{result.data && <><AdminTable<AdminDocumentListItem> rows={result.data.data} getKey={(row) => row.id} emptyTitle="Sem documentos" emptyDescription="Os documentos carregados e publicados aparecerão nesta lista." columns={[{ key: 'title', label: 'Documento', render: (row) => <><strong>{row.title}</strong><small className="admin-table-subline">{row.category.name} · {row.year ?? '—'}</small></> }, { key: 'type', label: 'Formato / tamanho', render: (row) => `${row.fileType.toUpperCase()} · ${formatFileSize(row.fileSizeBytes, 'pt')}` }, { key: 'language', label: 'Idioma', render: (row) => row.language.toUpperCase() }, { key: 'status', label: 'Estado', render: (row) => <span className={`admin-tag ${row.status === 'published' ? 'admin-tag--green' : 'admin-tag--gold'}`}>{row.status === 'published' ? 'Publicado' : 'Rascunho'}</span> }, { key: 'actions', label: 'Editar', align: 'end', render: (row) => <div className="admin-table-actions"><Link href={`/admin/documentos/${row.id}`} aria-label={`Editar ${row.title}`}><Pencil size={15} /></Link></div> }]} /><AdminPagination meta={result.data.meta} basePath="/admin/documentos" query={{ search, status }} /></>}</AdminPanel>}</>;
}
