import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loginAdmin } from './auth';
import {
  adminRequest,
  AuthenticationRequiredError,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from './client';

const API_URL = 'https://api.example.test';

function mockJsonResponse(payload: unknown, status = 200) {
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  }));
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = API_URL;
  vi.stubGlobal('fetch', vi.fn());
  clearAccessToken();
});

afterEach(() => {
  clearAccessToken();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('OAuth2 password-bearer login', () => {
  it('posts form-encoded credentials and returns the bearer token without persisting it', async () => {
    mockJsonResponse({ access_token: 'issued-token', token_type: 'bearer', expires_in: 900 });
    const storageSetItem = vi.fn();
    vi.stubGlobal('localStorage', { setItem: storageSetItem });
    vi.stubGlobal('sessionStorage', { setItem: storageSetItem });

    const result = await loginAdmin({ email: 'admin@cnc.ao', password: 'p@ss word' });
    const [url, init] = vi.mocked(fetch).mock.calls[0] as unknown as [string, RequestInit];

    expect(url).toBe(`${API_URL}/api/auth/token`);
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/x-www-form-urlencoded');
    expect(init.body).toBe('username=admin%40cnc.ao&password=p%40ss+word');
    expect(init.credentials).toBe('omit');
    expect(result).toEqual({ accessToken: 'issued-token', expiresInSeconds: 900 });
    setAccessToken(result.accessToken, result.expiresInSeconds);
    expect(getAccessToken()).toBe('issued-token');
    expect(storageSetItem).not.toHaveBeenCalled();
  });

  it('rejects responses that do not identify a bearer token', async () => {
    mockJsonResponse({ access_token: 'issued-token', token_type: 'mac' });

    await expect(loginAdmin({ email: 'admin@cnc.ao', password: 'secret' }))
      .rejects.toMatchObject({ status: 502, code: 'invalid_token_response' });
  });

  it('rejects malformed token expiry values', async () => {
    mockJsonResponse({ access_token: 'issued-token', token_type: 'bearer', expires_in: '900' });

    await expect(loginAdmin({ email: 'admin@cnc.ao', password: 'secret' }))
      .rejects.toMatchObject({ status: 502, code: 'invalid_token_response' });
  });

  it('treats a zero-second lifetime as immediately expired', async () => {
    mockJsonResponse({ access_token: 'issued-token', token_type: 'Bearer', expires_in: 0 });
    const token = await loginAdmin({ email: 'admin@cnc.ao', password: 'secret' });

    setAccessToken(token.accessToken, token.expiresInSeconds);
    expect(getAccessToken()).toBeNull();
  });
});

describe('in-memory admin bearer token', () => {
  it('sends the token on admin calls while omitting browser credentials', async () => {
    setAccessToken('  memory-only-token  ');
    mockJsonResponse({ data: { id: 'admin-1' } });

    await adminRequest('/api/admin/me');
    const [, init] = vi.mocked(fetch).mock.calls[0] as unknown as [string, RequestInit];

    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer memory-only-token');
    expect(init.credentials).toBe('omit');
  });

  it('does not make an admin request when the in-memory token is absent', async () => {
    await expect(adminRequest('/api/admin/me')).rejects.toBeInstanceOf(AuthenticationRequiredError);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('clears the token after an unauthorized API response', async () => {
    setAccessToken('expired-token');
    mockJsonResponse({ detail: 'Not authenticated' }, 401);

    await expect(adminRequest('/api/admin/me')).rejects.toMatchObject({ status: 401 });
    expect(getAccessToken()).toBeNull();
  });

  it('expires a token after its advertised lifetime', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-11T12:00:00Z'));
    setAccessToken('short-lived-token', 2);
    expect(getAccessToken()).toBe('short-lived-token');

    vi.advanceTimersByTime(2_000);
    expect(getAccessToken()).toBeNull();
  });
});
