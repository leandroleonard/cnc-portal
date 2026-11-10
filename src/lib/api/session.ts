import type { AdminUser } from '@/types/domain';
import type { ApiEnvelope } from '@/types/api';
import { clearAccessToken, setAccessToken } from './client';

/** Persiste o token em cookie httpOnly via BFF (same-origin). */
export async function persistAdminSession(accessToken: string, expiresInSeconds?: number): Promise<void> {
  await fetch('/api/auth/session', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, expiresInSeconds }),
  });
}

/** Reidrata a sessão após refresh. Devolve o user se o cookie ainda for válido. */
export async function restoreAdminSession(): Promise<AdminUser | null> {
  const response = await fetch('/api/auth/session', { method: 'GET', credentials: 'same-origin', cache: 'no-store' });
  if (!response.ok) return null;
  const payload = await response.json().catch(() => null) as { data?: { accessToken?: string; user?: AdminUser } } | null;
  const token = payload?.data?.accessToken;
  const user = payload?.data?.user;
  if (!token || !user) return null;
  setAccessToken(token);
  return user;
}

export async function clearAdminSession(): Promise<void> {
  clearAccessToken();
  await fetch('/api/auth/session', { method: 'DELETE', credentials: 'same-origin' }).catch(() => null);
}

export type SessionEnvelope = ApiEnvelope<{ accessToken: string; user: AdminUser }>;
