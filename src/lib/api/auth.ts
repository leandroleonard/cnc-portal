import type { AdminUser } from '@/types/domain';
import type { ApiEnvelope } from '@/types/api';
import { adminRequest, apiRequest, ApiError } from './client';
import { clearAdminSession } from './session';

export type AdminBearerToken = { accessToken: string; expiresInSeconds?: number };
export type AdminLoginToken = AdminBearerToken & { mustChangePassword: boolean };

type OAuth2TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
  password_change_required?: boolean;
};

export type TwoFactorChallenge = {
  challengeId: string;
  emailMasked: string;
  expiresInSeconds: number;
  resendCooldownSeconds: number;
};

export type LoginStartResult =
  | ({ twoFactorRequired: false } & AdminLoginToken)
  | ({ twoFactorRequired: true } & TwoFactorChallenge);

function parseBearerToken(response: OAuth2TokenResponse): AdminBearerToken {
  const validToken = typeof response?.access_token === 'string' && response.access_token.trim().length > 0;
  const validTokenType = typeof response?.token_type === 'string' && response.token_type.toLowerCase() === 'bearer';
  const validExpiry = response?.expires_in === undefined
    || (typeof response.expires_in === 'number' && Number.isFinite(response.expires_in) && response.expires_in >= 0);
  if (!validToken || !validTokenType || !validExpiry) {
    throw new ApiError(502, { code: 'invalid_token_response', message: 'The authentication did not return a valid bearer access token.' });
  }
  return { accessToken: response.access_token, expiresInSeconds: response.expires_in };
}

function credentialsForm(payload: { email: string; password: string }): URLSearchParams {
  return new URLSearchParams({ username: payload.email, password: payload.password });
}

/**
 * Caminho legado do contrato §4.1 (token directo), usado quando o 2FA está desactivado.
 * Mantido para retrocompatibilidade; o fluxo por defeito é `startLogin` + `verifyLoginCode`.
 */
export async function loginAdmin(payload: { email: string; password: string }): Promise<AdminBearerToken> {
  const response = await apiRequest<OAuth2TokenResponse>('/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: credentialsForm(payload).toString(),
  });
  return parseBearerToken(response);
}

/**
 * Inicia o login. Com 2FA activo devolve um desafio (código enviado por email); com 2FA
 * desactivado devolve já o token. O servidor é a autoridade — nunca decide o papel no cliente.
 */
export async function startLogin(payload: { email: string; password: string }): Promise<LoginStartResult> {
  const response = await apiRequest<OAuth2TokenResponse | { data: TwoFactorChallenge }>('/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: credentialsForm(payload).toString(),
  });
  const challenge = (response as { data?: TwoFactorChallenge }).data;
  if (challenge && typeof challenge.challengeId === 'string' && challenge.challengeId) {
    return {
      twoFactorRequired: true,
      challengeId: challenge.challengeId,
      emailMasked: challenge.emailMasked ?? '',
      expiresInSeconds: challenge.expiresInSeconds ?? 0,
      resendCooldownSeconds: challenge.resendCooldownSeconds ?? 60,
    };
  }
  const token = parseBearerToken(response as OAuth2TokenResponse);
  return {
    twoFactorRequired: false,
    ...token,
    mustChangePassword: Boolean((response as OAuth2TokenResponse).password_change_required),
  };
}

/** Valida o código de 6 dígitos e devolve o token (restrito se for obrigatório trocar a senha). */
export async function verifyLoginCode(challengeId: string, code: string): Promise<AdminLoginToken> {
  const response = await apiRequest<OAuth2TokenResponse>('/api/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({ challengeId, code }),
  });
  return { ...parseBearerToken(response), mustChangePassword: Boolean(response.password_change_required) };
}

/** Reenvia um novo código para o mesmo desafio (respeita o cooldown imposto pelo servidor). */
export async function resendLoginCode(challengeId: string): Promise<TwoFactorChallenge> {
  const response = await apiRequest<{ data: TwoFactorChallenge }>('/api/auth/2fa/resend', {
    method: 'POST',
    body: JSON.stringify({ challengeId }),
  });
  return response.data;
}

/** Troca de senha (obrigatória no 1º acesso do cadastrador). Devolve um token completo novo. */
export async function changeAdminPassword(currentPassword: string, password: string): Promise<AdminLoginToken> {
  const response = await adminRequest<OAuth2TokenResponse>('/api/auth/password/change', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, password, password_confirmation: password }),
  });
  return { ...parseBearerToken(response), mustChangePassword: Boolean(response.password_change_required) };
}

export async function getCurrentAdmin(): Promise<AdminUser> {
  const response = await adminRequest<ApiEnvelope<AdminUser>>('/api/admin/me');
  return response.data;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await adminRequest<ApiEnvelope<{ revoked: boolean }>>('/api/admin/logout', { method: 'POST' });
  } finally {
    await clearAdminSession();
  }
}
