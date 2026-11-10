import { AdminPageHeader, AdminPanel } from '@/components/admin/AdminUI';

export default function AdminNoPermissionPage() {
  return (
    <>
      <AdminPageHeader title="Sem permissão" description="O seu perfil não tem acesso a nenhuma área administrativa." />
      <AdminPanel title="Acesso restrito">
        <p className="admin-inline-state">Contacte o administrador do CNC para solicitar as permissões necessárias.</p>
      </AdminPanel>
    </>
  );
}
