import { describe, expect, it } from 'vitest';
import { safeAdminRedirect } from './admin-redirect';

describe('safeAdminRedirect', () => {
  const origin = 'https://cnc.ao';

  it('preserves a same-origin admin route, search and hash', () => {
    expect(safeAdminRedirect('/admin/cooperativas?page=2#list', origin))
      .toBe('/admin/cooperativas?page=2#list');
  });

  it('falls back to the admin dashboard when no target is provided', () => {
    expect(safeAdminRedirect(null, origin)).toBe('/admin');
  });

  it.each([
    'https://attacker.example/admin',
    '//attacker.example/admin',
    '/public',
    '/admin/../../public',
    'javascript:alert(1)',
  ])('rejects unsafe target %s', (target) => {
    expect(safeAdminRedirect(target, origin)).toBe('/admin');
  });
});
