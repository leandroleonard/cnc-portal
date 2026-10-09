import type {
  Activity,
  ApiEnvelope,
  ApiPaginatedEnvelope,
  ContactPayload,
  Cooperative,
  CooperativeFacets,
  CooperativeSummary,
  DocumentFacets,
  DocumentItem,
  GlobalSearchResult,
  HeroSlide,
  InstitutionalPage,
  Municipality,
  NewsArticle,
  NewsArticleSummary,
  NewsCategory,
  Paginated,
  Province,
  PublicHome,
  SiteSettings,
  StatisticsDataset,
} from '@/types';
import type { CooperativeQuery, DocumentQuery, NewsQuery, SearchQuery } from '@/types/api';
import { apiRequest } from './client';
import { cooperativeQueryString, documentQueryString, newsQueryString, searchQueryString, toQueryString } from './query';

function paginated<T>(response: ApiPaginatedEnvelope<T>): Paginated<T> {
  return { data: response.data, meta: response.meta };
}

export async function getPublicHome(locale: 'pt' | 'en'): Promise<PublicHome> {
  const response = await apiRequest<ApiEnvelope<PublicHome>>(`/api/public/home?locale=${locale}`);
  return response.data;
}

export async function getPublicSettings(locale: 'pt' | 'en'): Promise<SiteSettings> {
  const response = await apiRequest<ApiEnvelope<SiteSettings>>(`/api/public/site-settings?locale=${locale}`);
  return response.data;
}

export async function getHeroSlides(locale: 'pt' | 'en'): Promise<HeroSlide[]> {
  const response = await apiRequest<ApiEnvelope<HeroSlide[]>>(`/api/public/hero-slides?locale=${locale}`);
  return response.data;
}

export async function getCooperatives(query: CooperativeQuery): Promise<Paginated<CooperativeSummary>> {
  return paginated(await apiRequest<ApiPaginatedEnvelope<CooperativeSummary>>(`/api/public/cooperatives${cooperativeQueryString(query)}`));
}

export async function getCooperative(slug: string, locale: 'pt' | 'en'): Promise<Cooperative> {
  const response = await apiRequest<ApiEnvelope<Cooperative>>(`/api/public/cooperatives/${encodeURIComponent(slug)}?locale=${locale}`);
  return response.data;
}

export async function getProvinces(locale: 'pt' | 'en'): Promise<Province[]> {
  const response = await apiRequest<ApiEnvelope<Province[]>>(`/api/public/provinces?locale=${locale}`);
  return response.data;
}

export async function getMunicipalities(provinceId: string | undefined, locale: 'pt' | 'en'): Promise<Municipality[]> {
  const response = await apiRequest<ApiEnvelope<Municipality[]>>(`/api/public/municipalities${toQueryString({ provinceId, locale })}`);
  return response.data;
}

export async function getCooperativeFacets(locale: 'pt' | 'en'): Promise<CooperativeFacets> {
  const response = await apiRequest<ApiEnvelope<CooperativeFacets>>(`/api/public/cooperatives/filters?locale=${locale}`);
  return response.data;
}

export async function getActivities(locale: 'pt' | 'en'): Promise<Activity[]> {
  const response = await apiRequest<ApiEnvelope<Activity[]>>(`/api/public/activities?locale=${locale}`);
  return response.data;
}

export async function getNews(query: NewsQuery): Promise<Paginated<NewsArticleSummary>> {
  return paginated(await apiRequest<ApiPaginatedEnvelope<NewsArticleSummary>>(`/api/public/news${newsQueryString(query)}`));
}

export async function getNewsCategories(locale: 'pt' | 'en'): Promise<NewsCategory[]> {
  const response = await apiRequest<ApiEnvelope<NewsCategory[]>>(`/api/public/news/categories?locale=${locale}`);
  return response.data;
}

export async function getArticle(slug: string, locale: 'pt' | 'en'): Promise<NewsArticle> {
  const response = await apiRequest<ApiEnvelope<NewsArticle>>(`/api/public/news/${encodeURIComponent(slug)}?locale=${locale}`);
  return response.data;
}

export async function getDocuments(query: DocumentQuery): Promise<Paginated<DocumentItem>> {
  return paginated(await apiRequest<ApiPaginatedEnvelope<DocumentItem>>(`/api/public/documents${documentQueryString(query)}`));
}

export async function getDocumentFacets(locale: 'pt' | 'en'): Promise<DocumentFacets> {
  const response = await apiRequest<ApiEnvelope<DocumentFacets>>(`/api/public/documents/filters?locale=${locale}`);
  return response.data;
}

export async function getStatistics(locale: 'pt' | 'en'): Promise<StatisticsDataset> {
  const response = await apiRequest<ApiEnvelope<StatisticsDataset>>(`/api/public/statistics?locale=${locale}`);
  return response.data;
}

export async function getInstitutional(locale: 'pt' | 'en'): Promise<InstitutionalPage> {
  const response = await apiRequest<ApiEnvelope<InstitutionalPage>>(`/api/public/institutional?locale=${locale}`);
  return response.data;
}

export async function searchPublicContent(query: SearchQuery): Promise<Paginated<GlobalSearchResult>> {
  return paginated(await apiRequest<ApiPaginatedEnvelope<GlobalSearchResult>>(`/api/public/search${searchQueryString(query)}`));
}

export async function submitContact(payload: ContactPayload): Promise<{ reference: string; receivedAt: string }> {
  const response = await apiRequest<ApiEnvelope<{ reference: string; receivedAt: string }>>('/api/public/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function subscribeNewsletter(email: string, locale: 'pt' | 'en'): Promise<{ status: 'subscribed' | 'already_subscribed'; subscriptionId?: string }> {
  const response = await apiRequest<ApiEnvelope<{ status: 'subscribed' | 'already_subscribed'; subscriptionId?: string }>>('/api/public/newsletter/subscriptions', {
    method: 'POST',
    body: JSON.stringify({ email, locale }),
  });
  return response.data;
}
