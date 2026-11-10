'use client';
import type { ApiError } from '@/types/cnc';

/** Erro tipado lançado pelas chamadas client → BFF (/api/*). */
export class BffError extends Error {
  constructor(public readonly error: ApiError) {
    super(error.message);
  }
  get code() { return this.error.code; }
  get fieldErrors() { return this.error.errors ?? {}; }
}

export async function bff<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(path, {
      ...rest,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      cache: 'no-store',
    });
  } catch {
    throw new BffError({ status: 0, code: 'network_error', message: 'Sem ligação ao servidor. Verifique a sua rede.' });
  }
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const e = body?.error ?? {};
    throw new BffError({ status: res.status, code: e.code ?? 'internal_error', message: e.message ?? 'Ocorreu um erro inesperado.', errors: e.errors, ...e });
  }
  return body as T;
}

export const qs = (params: Record<string, string | number | undefined | null>) => {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') s.set(k, String(v)); });
  const str = s.toString();
  return str ? `?${str}` : '';
};