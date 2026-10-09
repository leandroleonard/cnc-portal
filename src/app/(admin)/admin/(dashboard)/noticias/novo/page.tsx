import { AdminApiState, AdminBackLink, AdminPageHeader } from '@/components/admin/AdminUI';
import { NewsEditor } from '@/components/admin/ContentForms';
import { getAdminNewsCategories } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';

export default async function CreateNewsPage() {
  const categories = await loadApi(getAdminNewsCategories);
  return <><AdminBackLink href="/admin/noticias" /><AdminPageHeader title="Nova publicação" description="Crie notícia, actividade, evento ou comunicado. O conteúdo precisa de tradução PT e EN." />{categories.error ? <AdminApiState error={categories.error} /> : <NewsEditor initial={null} categories={categories.data ?? []} />}</>;
}
