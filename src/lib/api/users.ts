import type { Envelope, Paginated, User, UserInput } from '@/types/cnc';
import { adminRequest } from './client';
import { toQueryString } from './query';

export type UserListQuery = {
  role?: string;
  province?: string;
  status?: string;
  search?: string;
  page?: number;
  perPage?: number;
};

export async function listUsers(query: UserListQuery = {}): Promise<Paginated<User>> {
  return adminRequest<Paginated<User>>(`/api/admin/users${toQueryString({
    role: query.role,
    province: query.province,
    status: query.status,
    search: query.search,
    page: query.page,
    perPage: query.perPage,
  })}`);
}

export async function getUser(id: string): Promise<User> {
  return (await adminRequest<Envelope<User>>(`/api/admin/users/${encodeURIComponent(id)}`)).data;
}

export async function createUser(payload: UserInput): Promise<User> {
  return (await adminRequest<Envelope<User>>('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) })).data;
}

export async function updateUser(id: string, payload: Partial<UserInput>): Promise<User> {
  return (await adminRequest<Envelope<User>>(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) })).data;
}

export async function deleteUser(id: string): Promise<{ deleted: boolean; deactivated?: boolean }> {
  return (await adminRequest<Envelope<{ deleted: boolean; deactivated?: boolean }>>(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' })).data;
}
