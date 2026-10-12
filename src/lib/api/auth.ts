import type { AdminUser } from '@/types/domain';
import type { ApiEnvelope } from '@/types/api';
import { adminRequest, apiRequest, clearAccessToken, ApiError } from './client';

export type AdminBearerToken = { accessToken: string; expiresInSeconds?: number };

type OAuth2TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
};

export async function loginAdmin(payload: { email: string; password: string }): Promise<AdminBearerToken> {
  const form = new URLSearchParams({ username: payload.email, password: payload.password });
  const response = await apiRequest<OAuth2TokenResponse>('/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  const validToken = typeof response?.access_token === 'string' && response.access_token.trim().length > 0;
  const validTokenType = typeof response?.token_type === 'string' && response.token_type.toLowerCase() === 'bearer';
  const validExpiry = response?.expires_in === undefined
    || (typeof response.expires_in === 'number' && Number.isFinite(response.expires_in) && response.expires_in >= 0);
  if (!validToken || !validTokenType || !validExpiry) {
    throw new ApiError(502, { code: 'invalid_token_response', message: 'The authentication API did not return a valid bearer access token.' });
  }
  return { accessToken: response.access_token, expiresInSeconds: response.expires_in };
}

export async function getCurrentAdmin(): Promise<AdminUser> {
  const response = await adminRequest<ApiEnvelope<AdminUser>>('/api/admin/me');
  return response.data;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await adminRequest<ApiEnvelope<{ revoked: boolean }>>('/api/admin/logout', { method: 'POST' });
  } finally {
    clearAccessToken();
  }
}
