import type { AdminListQuery } from '@/types/api';
import { AdminApiState, AdminPageHeader, AdminPanel, AdminSearch } from '@/components/admin/AdminUI';
import { ContactMessages } from '@/components/admin/ContactMessages';
import { listContactMessages } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';
import { clampPage, firstParam } from '@/lib/api/query';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ContactMessagesAdminPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const search = firstParam(raw.search);
  const status = firstParam(raw.status);
  const query: AdminListQuery = { search, status, page: clampPage(raw.page), perPage: 20, sort: 'receivedAt', direction: 'desc' };
  const result = await loadApi(() => listContactMessages(query));
  return <><AdminPageHeader title="Mensagens de contacto" description="Leia e acompanhe mensagens enviadas pelo formulário público." />{result.error ? <AdminApiState error={result.error} /> : <AdminPanel title="Caixa de entrada" description={`${result.data?.meta.total ?? 0} mensagens nesta consulta.`}><div className="admin-list-toolbar"><AdminSearch initialValue={search} placeholder="Pesquisar nome, email ou assunto…" /><form method="get"><label className="sr-only" htmlFor="contact-status">Estado da mensagem</label><select className="admin-filter-select" id="contact-status" name="status" defaultValue={status ?? ''}><option value="">Todos os estados</option><option value="new">Nova</option><option value="read">Lida</option><option value="responded">Respondida</option><option value="archived">Arquivada</option></select></form></div>{result.data && <ContactMessages initial={result.data.data} meta={result.data.meta} query={{ search, status }} />}</AdminPanel>}</>;
}
