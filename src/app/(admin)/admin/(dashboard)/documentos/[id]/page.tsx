import { notFound } from 'next/navigation';
import { AdminApiState, AdminBackLink, AdminPageHeader } from '@/components/admin/AdminUI';
import { DocumentEditor } from '@/components/admin/ContentForms';
import { getAdminDocument, getAdminDocumentCategories } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { loadApi } from '@/lib/api/loader';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditDocumentPage({ params }: PageProps) {
  const { id } = await params;
  const [record, categories] = await Promise.all([loadApi(() => getAdminDocument(id)), loadApi(getAdminDocumentCategories)]);
  if (record.error instanceof ApiError && record.error.status === 404) notFound();
  const error = record.error ?? categories.error;
  return <><AdminBackLink href="/admin/documentos" /><AdminPageHeader title="Editar documento" description="Actualize as traduções, arquivo, categoria e estado." />{error || !record.data ? <AdminApiState error={error ?? new Error('Documento não encontrado.')} /> : <DocumentEditor initial={record.data} categories={categories.data ?? []} />}</>;
}
