'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { clampPage, firstParam } from '@/lib/api/query';
import { listRegistrationProvinces } from '@/lib/api/registrations';
import { deleteUser, getUser, listUsers } from '@/lib/api/users';
import { formatDate } from '@/lib/utils/format';
import { hasPermission } from '@/lib/utils/permissions';
import { useAdminUser } from '@/components/admin/AdminShell';
import { AdminApiState, AdminBackLink, AdminCreateLink, AdminPageHeader, AdminPagination, AdminPanel, AdminSearch, AdminTable } from '@/components/admin/AdminUI';
import { useAdminResource } from '@/components/admin/useAdminResource';
import UserManagementForm from '@/components/admin/UserManagementForm';
import type { User } from '@/types/cnc';

function InlineLoading({ label = 'A carregar dados…' }: { label?: string }) {
  return <div className="admin-inline-state" role="status">{label}</div>;
}

function userStatus(user: User): { label: string; className: string } {
  if (!user.isActive) return { label: 'Inactivo', className: 'admin-tag' };
  if (user.isExpired || (user.validUntil && new Date(user.validUntil).getTime() < Date.now())) return { label: 'Expirado', className: 'admin-tag admin-tag--gold' };
  return { label: 'Activo', className: 'admin-tag admin-tag--green' };
}

export function AdminUsersPageClient() {
  const router = useRouter();
  const params = useSearchParams();
  const search = firstParam(params.get('search') ?? undefined);
  const role = firstParam(params.get('role') ?? undefined);
  const status = firstParam(params.get('status') ?? undefined);
  const province = firstParam(params.get('province') ?? undefined);
  const page = clampPage(params.get('page') ?? undefined);
  const perPage = 20;
  const admin = useAdminUser();
  const canCreate = admin ? hasPermission(admin, 'users', 'create') : false;
  const canUpdate = admin ? hasPermission(admin, 'users', 'update') : false;
  const canDelete = admin ? hasPermission(admin, 'users', 'delete') : false;
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const key = JSON.stringify({ search, role, status, province, page, perPage });
  const load = useCallback(async () => {
    const [users, provinces] = await Promise.all([
      listUsers({ search, role, status, province, page, perPage }),
      listRegistrationProvinces(),
    ]);
    return { users, provinces };
  }, [search, role, status, province, page, perPage]);
  const { loading, data, error: loadError } = useAdminResource(key, load);

  async function remove(user: User) {
    if (!window.confirm(`Eliminar ou desactivar ${user.name}?`)) return;
    setMessage(''); setError('');
    try {
      const result = await deleteUser(user.id);
      setMessage(result.deactivated ? 'Utilizador desactivado porque possui registos associados.' : 'Utilizador eliminado.');
      window.dispatchEvent(new Event('cnc:admin-data-changed'));
      router.refresh();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível eliminar o utilizador.');
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Utilizadores"
        description="Perfis administrativos e cadastradores provinciais, com validade e âmbito geográfico."
        action={canCreate ? <AdminCreateLink href="/admin/utilizadores/novo">Novo utilizador</AdminCreateLink> : undefined}
      />
      {message && <p className="admin-form-success" role="status">{message}</p>}
      {error && <p className="admin-form-error" role="alert">{error}</p>}
      {loading ? <InlineLoading /> : loadError ? <AdminApiState error={loadError} /> : (
        <AdminPanel title="Contas de acesso" description="Cadastradores exigem província e data/hora de validade.">
          <div className="admin-list-toolbar">
            <AdminSearch initialValue={search} placeholder="Pesquisar nome ou email…" />
            <form method="get">
              <input type="hidden" name="search" value={search ?? ''} />
              <label className="sr-only" htmlFor="user-role">Perfil</label>
              <select className="admin-filter-select" id="user-role" name="role" defaultValue={role ?? ''} onChange={(event) => event.currentTarget.form?.requestSubmit()}>
                <option value="">Todos os perfis</option>
                <option value="admin">Administrador</option>
                <option value="cadastrador">Cadastrador</option>
              </select>
            </form>
            <form method="get">
              <input type="hidden" name="search" value={search ?? ''} />
              <label className="sr-only" htmlFor="user-status">Estado</label>
              <select className="admin-filter-select" id="user-status" name="status" defaultValue={status ?? ''} onChange={(event) => event.currentTarget.form?.requestSubmit()}>
                <option value="">Todos os estados</option>
                <option value="active">Activo</option>
                <option value="expired">Expirado</option>
                <option value="inactive">Inactivo</option>
              </select>
            </form>
          </div>
          {data ? (
            <>
              <AdminTable<User>
                rows={data.users.data}
                getKey={(row) => row.id}
                emptyTitle="Sem utilizadores"
                emptyDescription="Os perfis criados aparecerão aqui."
                columns={[
                  { key: 'name', label: 'Utilizador', render: (row) => <><strong>{row.name}</strong><small className="admin-table-subline">{row.email}</small></> },
                  { key: 'role', label: 'Perfil', render: (row) => row.role === 'admin' ? 'Administrador' : 'Cadastrador' },
                  { key: 'province', label: 'Província', render: (row) => row.province?.name ?? '—' },
                  { key: 'valid', label: 'Válido até', render: (row) => row.validUntil ? formatDate(row.validUntil, 'pt') : '—' },
                  { key: 'status', label: 'Estado', render: (row) => { const s = userStatus(row); return <span className={s.className}>{s.label}</span>; } },
                  { key: 'actions', label: 'Acções', align: 'end', render: (row) => (
                    <div className="admin-table-actions">
                      {canUpdate && <Link href={`/admin/utilizadores/${row.id}`} aria-label={`Editar ${row.name}`}><Pencil size={15} /></Link>}
                      {canDelete && <button type="button" aria-label={`Eliminar ${row.name}`} onClick={() => void remove(row)}><Trash2 size={15} /></button>}
                    </div>
                  ) },
                ]}
              />
              <AdminPagination meta={data.users.meta} basePath="/admin/utilizadores" query={{ search, role, status, province }} />
            </>
          ) : null}
        </AdminPanel>
      )}
    </>
  );
}

export function UserEditorPageClient({ id }: { id?: string }) {
  const router = useRouter();
  const load = useCallback(async () => {
    const [user, provinces] = await Promise.all([
      id ? getUser(id) : Promise.resolve(null),
      listRegistrationProvinces(),
    ]);
    return { user, provinces };
  }, [id]);
  const { loading, data, error } = useAdminResource(`user-editor:${id ?? 'new'}`, load);

  if (loading) return <InlineLoading label="A carregar o utilizador…" />;
  if (error) return <AdminApiState error={error} />;
  if (!data) return <AdminApiState error={new Error('O sistema não devolveu dados para o utilizador.')} />;

  return (
    <>
      <AdminBackLink href="/admin/utilizadores" />
      <AdminPageHeader
        title={id ? 'Editar utilizador' : 'Novo utilizador'}
        description="Defina o perfil, a província e a validade do acesso. Cadastradores só podem registar na sua província enquanto o perfil estiver válido."
      />
      <UserManagementForm
        provinces={data.provinces}
        user={data.user}
        onSaved={() => {
          window.dispatchEvent(new Event('cnc:admin-data-changed'));
          router.replace('/admin/utilizadores');
          router.refresh();
        }}
        onCancel={() => router.back()}
      />
    </>
  );
}
