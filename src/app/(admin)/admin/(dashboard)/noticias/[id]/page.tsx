import { notFound } from 'next/navigation';
import { AdminApiState, AdminBackLink, AdminPageHeader } from '@/components/admin/AdminUI';
import { NewsEditor } from '@/components/admin/ContentForms';
import { getAdminNews, getAdminNewsCategories } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { loadApi } from '@/lib/api/loader';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditNewsPage({ params }: PageProps) {
  const { id } = await params;
  const [record, categories] = await Promise.all([loadApi(() => getAdminNews(id)), loadApi(getAdminNewsCategories)]);
  if (record.error instanceof ApiError && record.error.status === 404) notFound();
  const error = record.error ?? categories.error;
  return <><AdminBackLink href="/admin/noticias" /><AdminPageHeader title="Editar publicação" description="Edite conteúdo estruturado, imagens e estado de publicação." />{error || !record.data ? <AdminApiState error={error ?? new Error('Publicação não encontrada.')} /> : <NewsEditor initial={record.data} categories={categories.data ?? []} />}</>;
}
