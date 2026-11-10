'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { NextIntlClientProvider } from 'next-intl';
import ptMessages from '@/i18n/messages/pt.json';
import { clearAccessToken } from '@/lib/api/client';
import { clampPage, firstParam } from '@/lib/api/query';
import { getRegistration, getRegistrationUser, listRegistrationProvinces, listRegistrations } from '@/lib/api/registrations';
import { formatDate } from '@/lib/utils/format';
import { hasPermission } from '@/lib/utils/permissions';
import { useAdminUser } from '@/components/admin/AdminShell';
import { AdminApiState, AdminBackLink, AdminCreateLink, AdminPageHeader, AdminPagination, AdminPanel, AdminSearch, AdminTable } from '@/components/admin/AdminUI';
import { useAdminResource } from '@/components/admin/useAdminResource';
import { CooperativeSurveyForm } from '@/components/cooperative/CooperativeSurveyForm';
import type { Cooperative } from '@/types/cnc';

function InlineLoading({ label = 'A carregar dados…' }: { label?: string }) {
  return <div className="admin-inline-state" role="status">{label}</div>;
}

function statusLabel(row: Cooperative): string {
  if (row.isDraft) return 'Rascunho';
  switch (row.status) {
    case 'active': return 'Activa';
    case 'pending_review': return 'Em validação';
    case 'rejected': return 'Rejeitada';
    case 'inactive': return 'Inactiva';
    default: return row.status;
  }
}

export function AdminRegistrationsPageClient() {
  const params = useSearchParams();
  const search = firstParam(params.get('search') ?? undefined);
  const status = firstParam(params.get('status') ?? undefined);
  const page = clampPage(params.get('page') ?? undefined);
  const perPage = 20;
  const key = JSON.stringify({ search, status, page, perPage });
  const load = useCallback(() => listRegistrations({ search, status, page, perPage }), [search, status, page, perPage]);
  const { loading, data, error } = useAdminResource(key, load);
  const user = useAdminUser();
  const canCreate = user ? hasPermission(user, 'registrations', 'create') : false;

  return (
    <>
      <AdminPageHeader
        title="Registos"
        description="Fichas Nacionais de cooperativas submetidas para validação do CNC."
        action={canCreate ? <AdminCreateLink href="/admin/registos/novo">Nova ficha</AdminCreateLink> : undefined}
      />
      {loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : (
        <AdminPanel title="Fichas de registo" description="Rascunhos, submissões e estados de validação.">
          <div className="admin-list-toolbar">
            <AdminSearch initialValue={search} placeholder="Pesquisar nome ou código…" />
            <form method="get">
              <input type="hidden" name="search" value={search ?? ''} />
              <label className="sr-only" htmlFor="registration-status">Estado</label>
              <select className="admin-filter-select" id="registration-status" name="status" defaultValue={status ?? ''} onChange={(event) => event.currentTarget.form?.requestSubmit()}>
                <option value="">Todos os estados</option>
                <option value="draft">Rascunho</option>
                <option value="pending_review">Em validação</option>
                <option value="active">Activa</option>
                <option value="rejected">Rejeitada</option>
                <option value="inactive">Inactiva</option>
              </select>
            </form>
          </div>
          {data ? (
            <>
              <AdminTable<Cooperative>
                rows={data.data}
                getKey={(row) => row.id}
                emptyTitle="Sem registos"
                emptyDescription="As fichas criadas ou submetidas aparecerão aqui."
                columns={[
                  { key: 'name', label: 'Cooperativa / operador', render: (row) => <><strong>{row.name}</strong><br/><small className="admin-table-subline">{row.registrationCode ?? 'Sem código'}</small></> },
                  { key: 'place', label: 'Localização', render: (row) => `${row.municipality?.name ? `${row.municipality.name}, ` : ''}${row.province?.name ?? '—'}` },
                  { key: 'status', label: 'Estado', render: (row) => <span className={`admin-tag ${row.status === 'active' ? 'admin-tag--green' : 'admin-tag--gold'}`}>{statusLabel(row)}</span> },
                  { key: 'submitted', label: 'Submetido', render: (row) => formatDate(row.submittedAt, 'pt') },
                  { key: 'actions', label: 'Acções', align: 'end', render: (row) => <div className="admin-table-actions"><Link href={`/admin/registos/${row.id}`} aria-label={`Abrir ${row.name}`}><Pencil size={15} /></Link></div> },
                ]}
              />
              <AdminPagination meta={data.meta} basePath="/admin/registos" query={{ search, status }} />
            </>
          ) : null}
        </AdminPanel>
      )}
    </>
  );
}

export function RegistrationEditorPageClient({ id }: { id?: string }) {
  const router = useRouter();
  const load = useCallback(async () => {
    const [user, provinces, record] = await Promise.all([
      getRegistrationUser(),
      listRegistrationProvinces(),
      id ? getRegistration(id) : Promise.resolve(null),
    ]);
    return { user, provinces, record };
  }, [id]);
  const { loading, data, error } = useAdminResource(id ?? 'new', load);

  const onSessionEnded = useCallback(() => {
    clearAccessToken();
    router.replace('/admin/login');
  }, [router]);

  if (loading) return <InlineLoading label="A carregar a ficha…" />;
  if (error) return <AdminApiState error={error} />;
  if (!data) return <AdminApiState error={new Error('O sistema não devolveu dados para a ficha.')} />;

  return (
    <NextIntlClientProvider locale="pt" messages={ptMessages}>
      <AdminBackLink href="/admin/registos" />
      <CooperativeSurveyForm
        user={data.user}
        provinces={data.provinces}
        initial={data.record}
        onSaved={(record) => {
          if (!id) router.replace(`/admin/registos/${record.id}`);
        }}
        onSessionEnded={onSessionEnded}
      />
    </NextIntlClientProvider>
  );
}
