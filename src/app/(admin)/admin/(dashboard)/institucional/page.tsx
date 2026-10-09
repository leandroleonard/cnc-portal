import { AdminApiState, AdminPageHeader } from '@/components/admin/AdminUI';
import { InstitutionalEditor } from '@/components/admin/ContentForms';
import { getAdminInstitutional } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';

export default async function InstitutionalAdminPage() {
  const result = await loadApi(getAdminInstitutional);
  return <><AdminPageHeader title="Institucional" description="Edite as secções públicas do CNC em Português e English numa única área." />{result.error ? <AdminApiState error={result.error} /> : <InstitutionalEditor initial={result.data ?? []} />}</>;
}
