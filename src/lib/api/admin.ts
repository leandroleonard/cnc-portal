import type {
  Activity,
  AdminCooperativeRecord,
  AdminDocumentCategory,
  AdminDocumentListItem,
  AdminDocumentRecord,
  AdminHeroSlideRecord,
  AdminNewsCategory,
  AdminNewsListItem,
  AdminNewsRecord,
  AdminStatisticIndicator,
  AdminUser,
  ApiEnvelope,
  ApiPaginatedEnvelope,
  Cooperative,
  CooperativeInput,
  CooperativeSummary,
  ContactMessage,
  DashboardSummary,
  DocumentInput,
  HeroSlideInput,
  InstitutionalSectionInput,
  MediaAsset,
  NewsInput,
  Paginated,
  SiteSettingsInput,
  SocialNetwork,
  SocialLinkInput,
  StatisticIndicatorInput,
} from '@/types';
import type { AdminListQuery } from '@/types/api';
import type { NewsletterSubscription } from '@/types/domain';
import { adminRequest } from './client';
import { toQueryString } from './query';

function adminQuery(query: AdminListQuery): string {
  return toQueryString({
    search: query.search,
    status: query.status,
    page: query.page,
    perPage: query.perPage,
    sort: query.sort,
    direction: query.direction,
  });
}

function paginated<T>(response: ApiPaginatedEnvelope<T>): Paginated<T> {
  return { data: response.data, meta: response.meta };
}

export async function getAdminDashboard(): Promise<DashboardSummary> {
  return (await adminRequest<ApiEnvelope<DashboardSummary>>('/api/admin/dashboard')).data;
}

export async function listHeroSlides(query: AdminListQuery = {}): Promise<Paginated<AdminHeroSlideRecord>> {
  return paginated(await adminRequest<ApiPaginatedEnvelope<AdminHeroSlideRecord>>(`/api/admin/hero-slides${adminQuery(query)}`));
}
export async function getHeroSlide(id: string): Promise<AdminHeroSlideRecord> {
  return (await adminRequest<ApiEnvelope<AdminHeroSlideRecord>>(`/api/admin/hero-slides/${encodeURIComponent(id)}`)).data;
}
export async function createHeroSlide(payload: HeroSlideInput): Promise<AdminHeroSlideRecord> {
  return (await adminRequest<ApiEnvelope<AdminHeroSlideRecord>>('/api/admin/hero-slides', { method: 'POST', body: JSON.stringify(payload) })).data;
}
export async function updateHeroSlide(id: string, payload: Partial<HeroSlideInput>): Promise<AdminHeroSlideRecord> {
  return (await adminRequest<ApiEnvelope<AdminHeroSlideRecord>>(`/api/admin/hero-slides/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) })).data;
}
export async function deleteHeroSlide(id: string): Promise<void> {
  await adminRequest<ApiEnvelope<{ deleted: boolean }>>(`/api/admin/hero-slides/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
export async function reorderHeroSlides(items: Array<{ id: string; order: number }>): Promise<void> {
  await adminRequest<ApiEnvelope<{ updated: number }>>('/api/admin/hero-slides/reorder', { method: 'PUT', body: JSON.stringify({ items }) });
}

export async function listAdminCooperatives(query: AdminListQuery = {}): Promise<Paginated<CooperativeSummary>> {
  return paginated(await adminRequest<ApiPaginatedEnvelope<CooperativeSummary>>(`/api/admin/cooperatives${adminQuery(query)}`));
}
export async function getAdminCooperative(id: string): Promise<AdminCooperativeRecord> {
  return (await adminRequest<ApiEnvelope<AdminCooperativeRecord>>(`/api/admin/cooperatives/${encodeURIComponent(id)}`)).data;
}
export async function createCooperative(payload: CooperativeInput): Promise<AdminCooperativeRecord> {
  return (await adminRequest<ApiEnvelope<AdminCooperativeRecord>>('/api/admin/cooperatives', { method: 'POST', body: JSON.stringify(payload) })).data;
}
export async function updateCooperative(id: string, payload: Partial<CooperativeInput>): Promise<AdminCooperativeRecord> {
  return (await adminRequest<ApiEnvelope<AdminCooperativeRecord>>(`/api/admin/cooperatives/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) })).data;
}
export async function deleteCooperative(id: string): Promise<void> {
  await adminRequest<ApiEnvelope<{ deleted: boolean }>>(`/api/admin/cooperatives/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
export async function setCooperativeStatus(id: string, status: Cooperative['status']): Promise<Cooperative> {
  return (await adminRequest<ApiEnvelope<Cooperative>>(`/api/admin/cooperatives/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })).data;
}

export async function listAdminNews(query: AdminListQuery = {}): Promise<Paginated<AdminNewsListItem>> {
  return paginated(await adminRequest<ApiPaginatedEnvelope<AdminNewsListItem>>(`/api/admin/news${adminQuery(query)}`));
}
export async function getAdminNews(id: string): Promise<AdminNewsRecord> {
  return (await adminRequest<ApiEnvelope<AdminNewsRecord>>(`/api/admin/news/${encodeURIComponent(id)}`)).data;
}
export async function createNews(payload: NewsInput): Promise<AdminNewsRecord> {
  return (await adminRequest<ApiEnvelope<AdminNewsRecord>>('/api/admin/news', { method: 'POST', body: JSON.stringify(payload) })).data;
}
export async function updateNews(id: string, payload: Partial<NewsInput>): Promise<AdminNewsRecord> {
  return (await adminRequest<ApiEnvelope<AdminNewsRecord>>(`/api/admin/news/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) })).data;
}
export async function getAdminNewsCategories(): Promise<AdminNewsCategory[]> {
  return (await adminRequest<ApiEnvelope<AdminNewsCategory[]>>('/api/admin/news/categories')).data;
}
export async function deleteNews(id: string): Promise<void> {
  await adminRequest<ApiEnvelope<{ deleted: boolean }>>(`/api/admin/news/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function listAdminDocuments(query: AdminListQuery = {}): Promise<Paginated<AdminDocumentListItem>> {
  return paginated(await adminRequest<ApiPaginatedEnvelope<AdminDocumentListItem>>(`/api/admin/documents${adminQuery(query)}`));
}
export async function getAdminDocument(id: string): Promise<AdminDocumentRecord> {
  return (await adminRequest<ApiEnvelope<AdminDocumentRecord>>(`/api/admin/documents/${encodeURIComponent(id)}`)).data;
}
export async function createDocument(payload: DocumentInput): Promise<AdminDocumentRecord> {
  return (await adminRequest<ApiEnvelope<AdminDocumentRecord>>('/api/admin/documents', { method: 'POST', body: JSON.stringify(payload) })).data;
}
export async function updateDocument(id: string, payload: Partial<DocumentInput>): Promise<AdminDocumentRecord> {
  return (await adminRequest<ApiEnvelope<AdminDocumentRecord>>(`/api/admin/documents/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) })).data;
}
export async function getAdminDocumentCategories(): Promise<AdminDocumentCategory[]> {
  return (await adminRequest<ApiEnvelope<AdminDocumentCategory[]>>('/api/admin/documents/categories')).data;
}
export async function deleteDocument(id: string): Promise<void> {
  await adminRequest<ApiEnvelope<{ deleted: boolean }>>(`/api/admin/documents/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function listActivities(): Promise<Activity[]> {
  return (await adminRequest<ApiEnvelope<Activity[]>>('/api/admin/activities')).data;
}
export async function listProvinces(): Promise<Array<{ id: string; code: string; name: string; municipalities: Array<{ id: string; name: string }> }>> {
  return (await adminRequest<ApiEnvelope<Array<{ id: string; code: string; name: string; municipalities: Array<{ id: string; name: string }> }>>>('/api/admin/provinces?includeMunicipalities=true')).data;
}

export async function getAdminInstitutional(): Promise<InstitutionalSectionInput[]> {
  return (await adminRequest<ApiEnvelope<InstitutionalSectionInput[]>>('/api/admin/institutional')).data;
}
export async function updateInstitutional(sections: InstitutionalSectionInput[]): Promise<InstitutionalSectionInput[]> {
  return (await adminRequest<ApiEnvelope<InstitutionalSectionInput[]>>('/api/admin/institutional', { method: 'PUT', body: JSON.stringify({ sections }) })).data;
}

export async function listStatisticIndicators(query: AdminListQuery = {}): Promise<Paginated<AdminStatisticIndicator>> {
  return paginated(await adminRequest<ApiPaginatedEnvelope<AdminStatisticIndicator>>(`/api/admin/statistics${adminQuery(query)}`));
}
export async function saveStatisticIndicator(payload: StatisticIndicatorInput): Promise<AdminStatisticIndicator> {
  const path = payload.id ? `/api/admin/statistics/${encodeURIComponent(payload.id)}` : '/api/admin/statistics';
  const method = payload.id ? 'PATCH' : 'POST';
  const body = { ...payload };
  delete body.id;
  return (await adminRequest<ApiEnvelope<AdminStatisticIndicator>>(path, { method, body: JSON.stringify(body) })).data;
}
export async function deleteStatisticIndicator(id: string): Promise<void> {
  await adminRequest<ApiEnvelope<{ deleted: boolean }>>(`/api/admin/statistics/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function listMedia(query: AdminListQuery & { mimeType?: string } = {}): Promise<Paginated<MediaAsset>> {
  return paginated(await adminRequest<ApiPaginatedEnvelope<MediaAsset>>(`/api/admin/media${toQueryString({ ...query, mimeType: query.mimeType })}`));
}
export async function deleteMedia(id: string): Promise<void> {
  await adminRequest<ApiEnvelope<{ deleted: boolean }>>(`/api/admin/media/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
export async function updateMediaMetadata(id: string, payload: { altText?: string | null; caption?: string | null }): Promise<MediaAsset> {
  return (await adminRequest<ApiEnvelope<MediaAsset>>(`/api/admin/media/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) })).data;
}

export async function listSocialLinks(): Promise<SocialNetwork[]> {
  return (await adminRequest<ApiEnvelope<SocialNetwork[]>>('/api/admin/social-links')).data;
}
export async function saveSocialLink(payload: SocialLinkInput & { id?: string }): Promise<SocialNetwork> {
  const path = payload.id ? `/api/admin/social-links/${encodeURIComponent(payload.id)}` : '/api/admin/social-links';
  const method = payload.id ? 'PATCH' : 'POST';
  const body = { ...payload };
  delete body.id;
  return (await adminRequest<ApiEnvelope<SocialNetwork>>(path, { method, body: JSON.stringify(body) })).data;
}
export async function deleteSocialLink(id: string): Promise<void> {
  await adminRequest<ApiEnvelope<{ deleted: boolean }>>(`/api/admin/social-links/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
export async function reorderSocialLinks(items: Array<{ id: string; order: number }>): Promise<void> {
  await adminRequest<ApiEnvelope<{ updated: number }>>('/api/admin/social-links/reorder', { method: 'PUT', body: JSON.stringify({ items }) });
}

export async function listSubscribers(query: AdminListQuery = {}): Promise<Paginated<NewsletterSubscription>> {
  return paginated(await adminRequest<ApiPaginatedEnvelope<NewsletterSubscription>>(`/api/admin/newsletter/subscribers${adminQuery(query)}`));
}
export async function listContactMessages(query: AdminListQuery = {}): Promise<Paginated<ContactMessage>> {
  return paginated(await adminRequest<ApiPaginatedEnvelope<ContactMessage>>(`/api/admin/contact-messages${adminQuery(query)}`));
}
export async function updateContactMessageStatus(id: string, status: ContactMessage['status']): Promise<ContactMessage> {
  return (await adminRequest<ApiEnvelope<ContactMessage>>(`/api/admin/contact-messages/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })).data;
}

export async function getAdminSettings(): Promise<SiteSettingsInput> {
  return (await adminRequest<ApiEnvelope<SiteSettingsInput>>('/api/admin/settings')).data;
}
export async function updateAdminSettings(payload: SiteSettingsInput): Promise<SiteSettingsInput> {
  return (await adminRequest<ApiEnvelope<SiteSettingsInput>>('/api/admin/settings', { method: 'PUT', body: JSON.stringify(payload) })).data;
}

export type CurrentAdminIdentity = AdminUser;
