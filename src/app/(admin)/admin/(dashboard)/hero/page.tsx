import { AdminPageHeader, AdminPanel, AdminCreateLink, AdminApiState, AdminSearch, AdminPagination } from '@/components/admin/AdminUI';
import { HeroSlidesTable } from '@/components/admin/HeroSlidesTable';
import { listHeroSlides } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';
import { clampPage, firstParam } from '@/lib/api/query';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function HeroAdminPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const search = firstParam(raw.search);
  const page = clampPage(raw.page);
  const result = await loadApi(() => listHeroSlides({ search, page, perPage: 20, sort: 'order', direction: 'asc' }));
  return <><AdminPageHeader title="Hero / Banners" description="Gira os slides apresentados na página inicial, com conteúdo em Português e English." action={<AdminCreateLink href="/admin/hero/novo">Novo slide</AdminCreateLink>} />{result.error ? <AdminApiState error={result.error} /> : <AdminPanel title="Slides da página inicial" description="O slide CNC institucional é sempre apresentado primeiro. A ordenação publicada é controlada pela API."><div className="admin-list-toolbar"><AdminSearch initialValue={search} placeholder="Pesquisar título…" /><span className="admin-tag">{result.data?.meta.total ?? 0} registos</span></div><HeroSlidesTable initialItems={result.data?.data ?? []} />{result.data && <AdminPagination meta={result.data.meta} basePath="/admin/hero" query={{ search }} />}</AdminPanel>}</>;
}
