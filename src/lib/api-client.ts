import 'server-only';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import type { ApiError } from '@/types/cnc';

/**
 * Cliente interno BFF → Laravel. Executa APENAS no servidor (Route Handlers).
 * O Bearer token Sanctum vive num cookie httpOnly/SameSite=Strict do domínio do portal;
 * o browser nunca o lê nem chama o Laravel directamente. Para o Laravel o pedido é
 * puramente Bearer (sem cookies, sem CSRF).
 */
export const SESSION_COOKIE = process.env.CNC_BFF_SESSION_COOKIE ?? 'cnc_bff_session';

const FRIENDLY: Record<string, string> = {
  profile_expired: 'O prazo de validade do seu perfil expirou. Contacte o administrador do CNC.',
  account_inactive: 'A sua conta está desactivada. Contacte o administrador do CNC.',
  editing_window_expired: 'A janela de tolerância de 1 hora para retificação foi excedida. Contacte o administrador do CNC.',
  editing_locked: 'Este registo já foi moderado e não pode ser alterado.',
  unauthenticated: 'Sessão inválida ou expirada. Inicie sessão novamente.',
  network_error: 'Não foi possível contactar a API do CNC.',
};

function laravelBase(): string {
  const base = (process.env.CNC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').trim().replace(/\/$/, '');
  if (!base) throw new Error('CNC_API_URL não configurado.');
  return base;
}

export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export function normalizeError(status: number, payload: unknown): ApiError {
  const outer = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
  const body = (outer.error && typeof outer.error === 'object' ? outer.error : outer) as Record<string, unknown>;
  const code = typeof body.code === 'string' ? body.code
    : status === 401 ? 'unauthenticated' : status === 403 ? 'forbidden' : status === 404 ? 'not_found'
    : status === 422 ? 'validation_failed' : status >= 500 ? 'internal_error' : 'http_error';
  return {
    status,
    code,
    message: FRIENDLY[code] ?? (typeof body.message === 'string' ? body.message : `Pedido falhou (${status}).`),
    errors: body.errors && typeof body.errors === 'object' ? (body.errors as Record<string, string[]>) : undefined,
    requestId: typeof body.requestId === 'string' ? body.requestId : undefined,
    editingWindowEndsAt: typeof body.editingWindowEndsAt === 'string' ? body.editingWindowEndsAt : undefined,
    validUntil: typeof body.validUntil === 'string' ? body.validUntil : undefined,
  };
}

export type LaravelResult<T> = { ok: true; status: number; data: T } | { ok: false; status: number; error: ApiError };

export async function laravelFetch<T>(path: string, init: RequestInit & { token?: string | null; auth?: boolean } = {}): Promise<LaravelResult<T>> {
  const { token, auth = true, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set('Accept', 'application/json');
  if (rest.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (auth) {
    const bearer = token ?? (await getSessionToken());
    if (!bearer) return { ok: false, status: 401, error: normalizeError(401, { error: { code: 'unauthenticated' } }) };
    headers.set('Authorization', `Bearer ${bearer}`);
  }

  let res: Response;
  try {
    res = await fetch(`${laravelBase()}${path}`, { ...rest, headers, cache: 'no-store', credentials: 'omit' });
  } catch {
    return { ok: false, status: 502, error: normalizeError(502, { error: { code: 'network_error' } }) };
  }
  if (res.status === 204) return { ok: true, status: 204, data: null as T };
  const payload: unknown = await res.json().catch(() => null);
  return res.ok ? { ok: true, status: res.status, data: payload as T } : { ok: false, status: res.status, error: normalizeError(res.status, payload) };
}

/** Converte o resultado em NextResponse; limpa a sessão em 401 e em 403 de perfil expirado/inactivo. */
export function toResponse<T>(result: LaravelResult<T>, successStatus?: number): NextResponse {
  if (result.ok) return NextResponse.json(result.data, { status: successStatus ?? (result.status === 204 ? 200 : result.status) });
  const response = NextResponse.json({ error: result.error }, { status: result.status });
  if (result.status === 401 || ['profile_expired', 'account_inactive'].includes(result.error.code)) {
    response.cookies.delete(SESSION_COOKIE);
  }
  return response;
}

/** Proxy genérico: reencaminha query-string e corpo JSON. */
export async function proxy(request: NextRequest, path: string, method?: string): Promise<NextResponse> {
  const m = method ?? request.method;
  const search = request.nextUrl.search;
  let body: string | undefined;
  if (!['GET', 'HEAD', 'DELETE'].includes(m)) {
    const json = await request.json().catch(() => undefined);
    if (json === undefined) {
      return NextResponse.json({ error: { status: 400, code: 'invalid_request', message: 'Corpo JSON inválido.' } }, { status: 400 });
    }
    body = JSON.stringify(json);
  }
  return toResponse(await laravelFetch(`${path}${search}`, { method: m, body }));
}

export function badRequest(message: string, errors?: Record<string, string[]>) {
  return NextResponse.json({ error: { status: 422, code: 'validation_failed', message, errors } }, { status: 422 });
}

/** Valida ids de rota (UUID) antes de os injectar no path do Laravel. */
export function safeId(id: string): string | null {
  return /^[0-9a-f-]{36}$/i.test(id) ? id : null;
}