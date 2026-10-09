import type { AdminListQuery } from '@/types/api';
import { AdminApiState, AdminPageHeader, AdminPanel, AdminPagination } from '@/components/admin/AdminUI';
import { StatisticsManager } from '@/components/admin/StatisticsManager';
import { listActivities, listProvinces, listStatisticIndicators } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';
import { clampPage, firstParam } from '@/lib/api/query';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function StatisticsAdminPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const query: AdminListQuery = { search: firstParam(raw.search), page: clampPage(raw.page), perPage: 30, sort: 'key', direction: 'asc' };
  const [indicators, provinces, activities] = await Promise.all([loadApi(() => listStatisticIndicators(query)), loadApi(listProvinces), loadApi(listActivities)]);
  const error = indicators.error ?? provinces.error ?? activities.error;
  return <><AdminPageHeader title="Estatísticas" description="Gira valores e indicadores públicos. Agregações e regras complexas continuam sob responsabilidade da API." />{error ? <AdminApiState error={error} /> : <><AdminPanel title="Indicadores públicos" description="Não calcule totais no frontend; publique somente valores aprovados e respectivos períodos."><StatisticsManager initial={indicators.data?.data ?? []} provinces={(provinces.data ?? []).map(({ id, code, name }) => ({ id, code, name, slug: code.toLowerCase() }))} activities={activities.data ?? []} /><AdminPagination meta={indicators.data?.meta ?? { currentPage: 1, perPage: 30, total: 0, lastPage: 1, from: null, to: null }} basePath="/admin/estatisticas" query={{ search: query.search }} /></AdminPanel></>}</>;
}
