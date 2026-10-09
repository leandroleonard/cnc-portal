import type { ApiErrorBody } from '@/types/domain';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string[]>;
  readonly requestId?: string;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.fieldErrors = body.errors;
    this.requestId = body.requestId;
  }
}

export class ApiConfigurationError extends Error {
  constructor() {
    super('NEXT_PUBLIC_API_URL is not configured.');
    this.name = 'ApiConfigurationError';
  }
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function apiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '');
  if (!base) throw new ApiConfigurationError();
  return base;
}

function sanctumBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SANCTUM_URL?.trim().replace(/\/$/, '') || apiBaseUrl();
}

export async function initializeCsrfCookie(): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${sanctumBaseUrl()}/sanctum/csrf-cookie`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include',
      cache: 'no-store',
    });
  } catch (error) {
    if (error instanceof ApiConfigurationError) throw error;
    throw new ApiError(0, { code: 'network_error', message: 'The CNC API could not be reached to initialize a secure session.' });
  }
  if (!response.ok) throw parseError(response.status, await response.json().catch(() => null));
}

function readXsrfCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const cookie = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='));
  if (!cookie) return undefined;
  const value = cookie.slice('XSRF-TOKEN='.length);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseError(status: number, payload: unknown): ApiError {
  const outer = isRecord(payload) ? payload : {};
  const body = isRecord(outer.error) ? outer.error : outer;
  const fieldErrors = isRecord(body.errors)
    ? Object.fromEntries(
        Object.entries(body.errors).flatMap(([key, value]) =>
          Array.isArray(value) ? [[key, value.filter((item): item is string => typeof item === 'string')]] : [],
        ),
      )
    : undefined;
  return new ApiError(status, {
    code: typeof body.code === 'string' ? body.code : undefined,
    message: typeof body.message === 'string' ? body.message : `The API request failed (${status}).`,
    errors: fieldErrors,
    requestId: typeof body.requestId === 'string' ? body.requestId : undefined,
  });
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  const hasFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (init.body && !hasFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const method = (init.method ?? 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const xsrfToken = readXsrfCookie();
    if (xsrfToken && !headers.has('X-XSRF-TOKEN')) headers.set('X-XSRF-TOKEN', xsrfToken);
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
      ...init,
      headers,
      credentials: init.credentials ?? 'include',
      cache: init.cache ?? 'no-store',
    });
  } catch (error) {
    if (error instanceof ApiConfigurationError) throw error;
    throw new ApiError(0, {
      code: 'network_error',
      message: 'The CNC API could not be reached. Check the API URL and network connection.',
    });
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw parseError(response.status, payload);
  return payload as T;
}

export function unwrapData<T>(payload: { data: T }): T {
  return payload.data;
}
