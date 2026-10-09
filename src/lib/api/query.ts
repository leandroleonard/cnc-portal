import type { CooperativeQuery, DocumentQuery, NewsQuery, SearchQuery } from '@/types/api';

export function toQueryString(values: Record<string, string | number | boolean | undefined | null>): string {
  const params = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(values)) {
    if (rawValue === undefined || rawValue === null || rawValue === '') continue;
    params.set(key, String(rawValue));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function cooperativeQueryString(query: CooperativeQuery): string {
  return toQueryString({
    locale: query.locale,
    search: query.search,
    province: query.province,
    municipality: query.municipality,
    activity: query.activity,
    status: query.status,
    type: query.type,
    page: query.page,
    perPage: query.perPage,
    sort: query.sort,
    direction: query.direction,
  });
}

export function newsQueryString(query: NewsQuery): string {
  return toQueryString({
    locale: query.locale,
    search: query.search,
    category: query.category,
    featured: query.featured,
    page: query.page,
    perPage: query.perPage,
    sort: query.sort,
    direction: query.direction,
  });
}

export function documentQueryString(query: DocumentQuery): string {
  return toQueryString({
    locale: query.locale,
    search: query.search,
    category: query.category,
    year: query.year,
    fileType: query.fileType,
    page: query.page,
    perPage: query.perPage,
    sort: query.sort,
    direction: query.direction,
  });
}

export function searchQueryString(query: SearchQuery): string {
  const params = new URLSearchParams();
  params.set('locale', query.locale);
  params.set('q', query.q);
  if (query.types?.length) params.set('types', query.types.join(','));
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.perPage !== undefined) params.set('perPage', String(query.perPage));
  return `?${params.toString()}`;
}

export function clampPage(value: string | string[] | undefined): number {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeSortDirection(value: string | string[] | undefined): 'asc' | 'desc' {
  return firstParam(value)?.toLowerCase() === 'asc' ? 'asc' : 'desc';
}

export function toPublicCooperativeQuery(
  raw: Record<string, string | string[] | undefined>,
  locale: 'pt' | 'en',
): CooperativeQuery {
  const pt = locale === 'pt';
  return {
    locale,
    search: firstParam(raw.search ?? raw.q),
    province: firstParam(raw[pt ? 'provincia' : 'province'] ?? raw.province ?? raw.provincia),
    municipality: firstParam(raw[pt ? 'municipio' : 'municipality'] ?? raw.municipality ?? raw.municipio),
    activity: firstParam(raw[pt ? 'actividade' : 'activity'] ?? raw.activity ?? raw.actividade),
    status: firstParam(raw[pt ? 'estado' : 'status'] ?? raw.status ?? raw.estado),
    type: firstParam(raw[pt ? 'tipo' : 'type'] ?? raw.type ?? raw.tipo),
    page: clampPage(raw.page),
    perPage: 12,
    sort: firstParam(raw.sort) ?? 'name',
    direction: normalizeSortDirection(raw.direction),
  };
}
