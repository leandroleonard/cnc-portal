import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getSessionToken, laravelFetch, SESSION_COOKIE, toResponse } from '@/lib/api-client';

/**
 * Ponte de sessão do painel (divergência documentada ao contrato §4.1, pedida explicitamente):
 * o token Sanctum continua a ser Bearer no Laravel, mas é guardado num cookie httpOnly do
 * próprio portal para sobreviver a refresh. O browser nunca o lê directamente; apenas este
 * Route Handler o devolve ao cliente same-origin para reidratar a memória.
 */
const postSchema = z.object({
  accessToken: z.string().trim().min(10).max(2048),
  expiresInSeconds: z.number().int().min(0).max(86400).optional(),
});

export async function GET() {
  const bearer = await getSessionToken();
  if (!bearer) return NextResponse.json({ error: { status: 401, code: 'unauthenticated', message: 'Sessão inválida ou expirada.' } }, { status: 401 });
  const me = await laravelFetch<{ data: unknown }>('/api/admin/me', { token: bearer });
  if (!me.ok) return toResponse(me);
  return NextResponse.json({ data: { accessToken: bearer, user: me.data.data } });
}

export async function POST(request: NextRequest) {
  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { status: 422, code: 'validation_failed', message: 'Token de sessão inválido.' } }, { status: 422 });
  }
  const me = await laravelFetch<{ data: unknown }>('/api/admin/me', { token: parsed.data.accessToken });
  if (!me.ok) return toResponse(me);
  const response = NextResponse.json({ data: { persisted: true, user: me.data.data } });
  response.cookies.set(SESSION_COOKIE, parsed.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: parsed.data.expiresInSeconds ?? 8 * 3600,
  });
  return response;
}

export async function DELETE() {
  await laravelFetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
  const response = NextResponse.json({ data: { revoked: true } });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
