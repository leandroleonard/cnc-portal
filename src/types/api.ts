import type { ApiErrorBody, Paginated, PaginationMeta } from './domain';

export type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown> | PaginationMeta;
};

export type ApiPaginatedEnvelope<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type ApiList<T> = Paginated<T> | T[];
export type ApiErrorResponse = { error: ApiErrorBody };

export type CooperativeQuery = {
  locale: 'pt' | 'en';
  search?: string;
  province?: string;
  municipality?: string;
  activity?: string;
  status?: string;
  type?: string;
  page?: number;
  perPage?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
};

export type NewsQuery = {
  locale: 'pt' | 'en';
  search?: string;
  category?: string;
  featured?: boolean;
  page?: number;
  perPage?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
};

export type DocumentQuery = {
  locale: 'pt' | 'en';
  search?: string;
  category?: string;
  year?: number;
  fileType?: string;
  page?: number;
  perPage?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
};

export type SearchQuery = {
  locale: 'pt' | 'en';
  q: string;
  types?: Array<'cooperative' | 'news' | 'document' | 'institutional'>;
  page?: number;
  perPage?: number;
};

export type AdminListQuery = {
  search?: string;
  status?: string;
  page?: number;
  perPage?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
};

export type AdminLoginPayload = { username: string; password: string };
export type AdminLoginResponse = { access_token: string; token_type: 'bearer'; expires_in?: number; scope?: string };
export type ApiResult<T> = { data: T; meta?: Record<string, unknown> };
