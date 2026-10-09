import type { AdminUser } from '@/types/domain';
import type { ApiEnvelope, AdminLoginPayload } from '@/types/api';
import { apiRequest, initializeCsrfCookie } from './client';

export async function loginAdmin(payload: AdminLoginPayload): Promise<AdminUser> {
  await initializeCsrfCookie();
  const response = await apiRequest<ApiEnvelope<{ user: AdminUser }>>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data.user;
}

export async function getCurrentAdmin(cookieHeader?: string): Promise<AdminUser> {
  const headers = new Headers();
  if (cookieHeader) headers.set('Cookie', cookieHeader);
  const response = await apiRequest<ApiEnvelope<AdminUser>>('/api/admin/me', { headers });
  return response.data;
}

export async function logoutAdmin(): Promise<void> {
  await apiRequest<ApiEnvelope<{ loggedOut: boolean }>>('/api/admin/logout', { method: 'POST' });
}
