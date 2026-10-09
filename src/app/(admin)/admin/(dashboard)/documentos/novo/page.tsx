import { AdminApiState, AdminBackLink, AdminPageHeader } from '@/components/admin/AdminUI';
import { DocumentEditor } from '@/components/admin/ContentForms';
import { getAdminDocumentCategories } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';

export default async function CreateDocumentPage() {
  const categories = await loadApi(getAdminDocumentCategories);
  return <><AdminBackLink href="/admin/documentos" /><AdminPageHeader title="Adicionar documento" description="Carregue o ficheiro e preencha a informação em Português e English." />{categories.error ? <AdminApiState error={categories.error} /> : <DocumentEditor initial={null} categories={categories.data ?? []} />}</>;
}
