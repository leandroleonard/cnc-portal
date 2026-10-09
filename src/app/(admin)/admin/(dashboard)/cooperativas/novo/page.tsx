import { AdminApiState, AdminBackLink, AdminPageHeader } from '@/components/admin/AdminUI';
import { CooperativeEditor } from '@/components/admin/ContentForms';
import { listActivities, listProvinces } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';

export default async function CreateCooperativePage() {
  const [provinces, activities] = await Promise.all([loadApi(listProvinces), loadApi(listActivities)]);
  return <><AdminBackLink href="/admin/cooperativas" /><AdminPageHeader title="Adicionar cooperativa" description="O CNC é responsável pelo cadastro e validação dos perfis. Não existe login para cooperativas." />{provinces.error || activities.error ? <AdminApiState error={provinces.error ?? activities.error ?? new Error('Não foi possível carregar os dados de referência.')} /> : <CooperativeEditor initial={null} provinces={provinces.data ?? []} activities={activities.data ?? []} />}</>;
}
