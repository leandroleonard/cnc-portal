import type { Cooperative, Envelope, Paginated, ReviewPayload } from '@/types/cnc';
import { adminRequest } from './client';
import { toQueryString } from './query';

export type ModerationListQuery = {
  status?: string;
  province?: string;
  cadastrador?: string;
  submittedFrom?: string;
  submittedTo?: string;
  search?: string;
  page?: number;
  perPage?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
};

export async function listModerationCooperatives(query: ModerationListQuery = {}): Promise<Paginated<Cooperative>> {
  return adminRequest<Paginated<Cooperative>>(`/api/admin/cooperatives${toQueryString({
    view: 'moderation',
    status: query.status ?? 'pending_review',
    province: query.province,
    cadastrador: query.cadastrador,
    submittedFrom: query.submittedFrom,
    submittedTo: query.submittedTo,
    search: query.search,
    page: query.page,
    perPage: query.perPage,
    sort: query.sort ?? 'submitted_at',
    direction: query.direction ?? 'asc',
  })}`);
}

export async function getModerationCooperative(id: string): Promise<Cooperative> {
  return (await adminRequest<Envelope<Cooperative>>(`/api/admin/cooperatives/${encodeURIComponent(id)}`)).data;
}

export async function reviewCooperative(id: string, payload: ReviewPayload): Promise<Cooperative> {
  return (await adminRequest<Envelope<Cooperative>>(`/api/admin/cooperatives/${encodeURIComponent(id)}/review`, { method: 'POST', body: JSON.stringify(payload) })).data;
}

export async function reopenCooperative(id: string, note: string): Promise<Cooperative> {
  return (await adminRequest<Envelope<Cooperative>>(`/api/admin/cooperatives/${encodeURIComponent(id)}/reopen`, { method: 'POST', body: JSON.stringify({ note }) })).data;
}
