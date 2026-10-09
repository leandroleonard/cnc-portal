import { AdminApiState, AdminPageHeader, AdminPanel } from '@/components/admin/AdminUI';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import { listMedia } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';
import { clampPage, firstParam } from '@/lib/api/query';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function MediaAdminPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const search = firstParam(raw.search);
  const type = firstParam(raw.type);
  const page = clampPage(raw.page);
  const result = await loadApi(() => listMedia({ search, mimeType: type || undefined, page, perPage: 24, sort: 'createdAt', direction: 'desc' }));
  return <><AdminPageHeader title="Media Library" description="Biblioteca centralizada de imagens, logótipos e documentos utilizados pelo portal." />{result.error ? <AdminApiState error={result.error} /> : <AdminPanel><MediaLibrary initial={result.data?.data ?? []} initialMeta={result.data?.meta ?? { currentPage: 1, perPage: 24, total: 0, lastPage: 1, from: null, to: null }} initialSearch={search} initialType={type} /></AdminPanel>}</>;
}
