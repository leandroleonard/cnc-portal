import { notFound } from 'next/navigation';
import { AdminApiState, AdminBackLink, AdminPageHeader } from '@/components/admin/AdminUI';
import { CooperativeEditor } from '@/components/admin/ContentForms';
import { getAdminCooperative, listActivities, listProvinces } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { loadApi } from '@/lib/api/loader';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditCooperativePage({ params }: PageProps) {
  const { id } = await params;
  const [record, provinces, activities] = await Promise.all([loadApi(() => getAdminCooperative(id)), loadApi(listProvinces), loadApi(listActivities)]);
  if (record.error instanceof ApiError && record.error.status === 404) notFound();
  const error = record.error ?? provinces.error ?? activities.error;
  return <><AdminBackLink href="/admin/cooperativas" /><AdminPageHeader title="Editar cooperativa" description="Actualize os campos administrativos e o conteúdo publicado em Português e English." />{error || !record.data ? <AdminApiState error={error ?? new Error('Cooperativa não encontrada.')} /> : <CooperativeEditor initial={record.data} provinces={provinces.data ?? []} activities={activities.data ?? []} />}</>;
}
