import type { Cooperative, Envelope, Municipality, Paginated, Province, RegistrationMedia, RegistrationPayload, User } from '@/types/cnc';
import { adminRequest } from './client';
import { toQueryString } from './query';

export type RegistrationListQuery = {
  search?: string;
  status?: string;
  page?: number;
  perPage?: number;
  mine?: boolean;
  province_id?: string;
};

export async function listRegistrations(query: RegistrationListQuery = {}): Promise<Paginated<Cooperative>> {
  return adminRequest<Paginated<Cooperative>>(`/api/registrations${toQueryString({
    search: query.search,
    status: query.status,
    page: query.page,
    perPage: query.perPage,
    mine: query.mine,
    province_id: query.province_id,
  })}`);
}

export async function getRegistration(id: string): Promise<Cooperative> {
  return (await adminRequest<Envelope<Cooperative>>(`/api/registrations/${encodeURIComponent(id)}`)).data;
}

export async function createRegistration(payload: RegistrationPayload): Promise<Cooperative> {
  return (await adminRequest<Envelope<Cooperative>>('/api/registrations', { method: 'POST', body: JSON.stringify(payload) })).data;
}

export async function updateRegistration(id: string, payload: RegistrationPayload): Promise<Cooperative> {
  return (await adminRequest<Envelope<Cooperative>>(`/api/registrations/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) })).data;
}

export async function submitRegistration(id: string): Promise<Cooperative> {
  return (await adminRequest<Envelope<Cooperative>>(`/api/registrations/${encodeURIComponent(id)}/submit`, { method: 'POST' })).data;
}

export async function getRegistrationUser(): Promise<User> {
  return (await adminRequest<Envelope<User>>('/api/admin/me')).data;
}

export async function listRegistrationProvinces(): Promise<Province[]> {
  return (await adminRequest<Envelope<Province[]>>('/api/provinces')).data;
}

export async function listRegistrationMunicipalities(provinceId: string): Promise<Municipality[]> {
  return (await adminRequest<Envelope<Municipality[]>>(`/api/municipalities${toQueryString({ provinceId })}`)).data;
}

/**
 * Carrega uma imagem para a galeria da ficha (endpoint próprio do cadastrador, que não tem
 * media.create). Devolve o media para a ficha referenciar pelo id em `gallery_media_ids`.
 */
export async function uploadRegistrationMedia(file: File, metadata: { altText?: string; caption?: string } = {}): Promise<RegistrationMedia> {
  const form = new FormData();
  form.append('file', file);
  if (metadata.altText) form.append('altText', metadata.altText);
  if (metadata.caption) form.append('caption', metadata.caption);
  return (await adminRequest<Envelope<RegistrationMedia>>('/api/registrations/media', { method: 'POST', body: form })).data;
}
