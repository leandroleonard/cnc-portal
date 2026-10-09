import type { AdminListQuery } from '@/types/api';
import type { NewsletterSubscription } from '@/types/domain';
import { AdminApiState, AdminPageHeader, AdminPanel, AdminSearch, AdminPagination, AdminTable } from '@/components/admin/AdminUI';
import { SubscriberStatus } from '@/components/admin/SubscriberStatus';
import { listSubscribers } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';
import { clampPage, firstParam } from '@/lib/api/query';
import { formatDate } from '@/lib/utils/format';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function NewsletterAdminPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const search = firstParam(raw.search);
  const status = firstParam(raw.status);
  const query: AdminListQuery = { search, status, page: clampPage(raw.page), perPage: 30, sort: 'subscribedAt', direction: 'desc' };
  const result = await loadApi(() => listSubscribers(query));
  return <><AdminPageHeader title="Newsletter" description="Gerencie contactos que aceitaram receber novidades. O backend gere armazenamento e envio de email." />{result.error ? <AdminApiState error={result.error} /> : <AdminPanel title="Subscritores" description={`${result.data?.meta.total ?? 0} subscrições devolvidas pela API.`}><div className="admin-list-toolbar"><AdminSearch initialValue={search} placeholder="Pesquisar por email…" /><form method="get"><label className="sr-only" htmlFor="subscriber-status">Estado da subscrição</label><select className="admin-filter-select" id="subscriber-status" name="status" defaultValue={status ?? ''}><option value="">Todos os estados</option><option value="active">Activa</option><option value="pending">Pendente</option><option value="unsubscribed">Removida</option></select></form></div>{result.data && <><AdminTable<NewsletterSubscription> rows={result.data.data} getKey={(row) => row.id} emptyTitle="Sem subscritores" emptyDescription="As novas subscrições públicas aparecerão aqui." columns={[{ key: 'email', label: 'Email', render: (row) => <strong>{row.email}</strong> }, { key: 'status', label: 'Estado', render: (row) => <SubscriberStatus status={row.status} /> }, { key: 'date', label: 'Data de subscrição', render: (row) => formatDate(row.subscribedAt, 'pt') }]} /><AdminPagination meta={result.data.meta} basePath="/admin/newsletter" query={{ search, status }} /></>}</AdminPanel>}</>;
}
