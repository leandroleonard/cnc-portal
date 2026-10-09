import { AdminApiState, AdminPageHeader, AdminPanel } from '@/components/admin/AdminUI';
import { SocialLinksManager } from '@/components/admin/AdminExtraForms';
import { listSocialLinks } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';

export default async function SocialLinksAdminPage() {
  const result = await loadApi(listSocialLinks);
  return <><AdminPageHeader title="Redes sociais" description="Configure plataformas e endereços oficiais. Links não definidos ou inactivos não aparecem no rodapé." />{result.error ? <AdminApiState error={result.error} /> : <AdminPanel><SocialLinksManager initial={result.data ?? []} /></AdminPanel>}</>;
}
