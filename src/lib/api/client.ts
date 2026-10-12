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

export class AuthenticationRequiredError extends Error {
  constructor() {
    super('An in-memory bearer token is required for this admin request. Please sign in again.');
    this.name = 'AuthenticationRequiredError';
  }
}

let accessToken: string | null = null;
let accessTokenExpiresAt: number | null = null;
let expiryTimer: ReturnType<typeof setTimeout> | null = null;
const tokenSubscribers = new Set<() => void>();

export function getAccessToken(): string | null {
  if (accessTokenExpiresAt !== null && Date.now() >= accessTokenExpiresAt) return null;
  return accessToken;
}

export function subscribeToAccessToken(listener: () => void): () => void {
  tokenSubscribers.add(listener);
  return () => tokenSubscribers.delete(listener);
}

function publishTokenChange() {
  for (const listener of tokenSubscribers) listener();
}

export function setAccessToken(token: string, expiresInSeconds?: number): void {
  accessToken = token.trim() || null;
  accessTokenExpiresAt = accessToken && expiresInSeconds !== undefined && Number.isFinite(expiresInSeconds) && expiresInSeconds >= 0
    ? Date.now() + expiresInSeconds * 1000
    : null;
  if (expiryTimer) clearTimeout(expiryTimer);
  expiryTimer = null;
  if (accessTokenExpiresAt !== null) {
    const delay = Math.min(Math.max(0, accessTokenExpiresAt - Date.now()), 2_147_483_647);
    expiryTimer = setTimeout(() => clearAccessToken(), delay);
  }
  publishTokenChange();
}

export function clearAccessToken(): void {
  const hadToken = accessToken !== null;
  accessToken = null;
  accessTokenExpiresAt = null;
  if (expiryTimer) clearTimeout(expiryTimer);
  expiryTimer = null;
  if (hadToken) publishTokenChange();
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
  const detail = typeof body.detail === 'string' ? body.detail : undefined;
  return new ApiError(status, {
    code: typeof body.code === 'string' ? body.code : undefined,
    message: typeof body.message === 'string' ? body.message : detail ?? `The API request failed (${status}).`,
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

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
      ...init,
      headers,
      credentials: 'omit',
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

export async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    clearAccessToken();
    throw new AuthenticationRequiredError();
  }
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  try {
    return await apiRequest<T>(path, { ...init, headers });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) clearAccessToken();
    throw error;
  }
}

export function unwrapData<T>(payload: { data: T }): T {
  return payload.data;
}
