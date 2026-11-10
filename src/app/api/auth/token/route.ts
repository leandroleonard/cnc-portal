import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { laravelFetch, SESSION_COOKIE, toResponse } from '@/lib/api-client';

const schema = z.object({ username: z.string().trim().email().max(191), password: z.string().min(1).max(255) });

type ChallengeEnvelope = { data?: { challengeId?: string; emailMasked?: string; expiresInSeconds?: number; resendCooldownSeconds?: number } };
type TokenResponse = { access_token?: string; token_type?: string; expires_in?: number; password_change_required?: boolean };

/**
 * POST /api/auth/token — aceita JSON ou form-urlencoded {username|email, password}.
 * Com 2FA activo o Laravel devolve um desafio (202) e NÃO há token: repassamos o desafio sem
 * gravar cookie. Com 2FA desactivado, guarda o token em cookie httpOnly (caminho legado).
 */
export async function POST(request: NextRequest) {
  const type = request.headers.get('content-type') ?? '';
  const raw = type.includes('application/x-www-form-urlencoded')
    ? Object.fromEntries(new URLSearchParams(await request.text()))
    : await request.json().catch(() => ({}));
  const parsed = schema.safeParse({ username: raw.username ?? raw.email, password: raw.password });
  if (!parsed.success) {
    return NextResponse.json({ error: { status: 422, code: 'validation_failed', message: 'Indique um email e palavra-passe válidos.' } }, { status: 422 });
  }
  const result = await laravelFetch<TokenResponse & ChallengeEnvelope>('/api/auth/token', {
    method: 'POST', auth: false,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(parsed.data).toString(),
  });
  if (!result.ok) return toResponse(result);

  // Desafio 2FA: repassa sem cookie; o token só existe após /auth/2fa/verify.
  const challenge = result.data.data;
  if (challenge && typeof challenge.challengeId === 'string' && challenge.challengeId) {
    return NextResponse.json({ data: { twoFactorRequired: true, ...challenge } }, { status: 202 });
  }

  const accessToken = result.data.access_token;
  if (typeof accessToken !== 'string' || !accessToken) {
    return NextResponse.json({ error: { status: 502, code: 'invalid_token_response', message: 'O serviço de autenticação não devolveu um token válido.' } }, { status: 502 });
  }
  const me = await laravelFetch<{ data: unknown }>('/api/admin/me', { token: accessToken });
  const response = NextResponse.json({ data: { user: me.ok ? me.data.data : null, expiresIn: result.data.expires_in ?? null, passwordChangeRequired: Boolean(result.data.password_change_required) } });
  response.cookies.set(SESSION_COOKIE, accessToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/',
    maxAge: result.data.expires_in ?? 8 * 3600,
  });
  return response;
}
