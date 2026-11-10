import { describe, expect, it } from 'vitest';
import type { AdminUser } from '@/types/domain';
import { adminLandingPath, canAccessAdminPath } from './admin-nav';

function user(permissions: string[]): AdminUser {
  return { id: 'u1', name: 'Test', email: 'test@cnc.ao', role: 'cadastrador', permissions };
}

describe('admin navigation permissions', () => {
  it('sends administrators to the dashboard', () => {
    expect(adminLandingPath(user(['*']))).toBe('/admin');
  });

  it('sends cadastradores to their registration panel', () => {
    const registrador = user(['registrations.view', 'registrations.create', 'registrations.update']);
    expect(adminLandingPath(registrador)).toBe('/admin/registos');
    expect(canAccessAdminPath(registrador, '/admin/registos')).toBe(true);
    expect(canAccessAdminPath(registrador, '/admin/registos/novo')).toBe(true);
    expect(canAccessAdminPath(registrador, '/admin')).toBe(false);
    expect(canAccessAdminPath(registrador, '/admin/noticias')).toBe(false);
  });

  it('allows moderators and user managers into their own panels', () => {
    const moderator = user(['cooperatives.review']);
    expect(adminLandingPath(moderator)).toBe('/admin/moderacao');
    expect(canAccessAdminPath(moderator, '/admin/moderacao')).toBe(true);
    expect(canAccessAdminPath(moderator, '/admin/utilizadores')).toBe(false);

    const userManager = user(['users.view']);
    expect(adminLandingPath(userManager)).toBe('/admin/utilizadores');
    expect(canAccessAdminPath(userManager, '/admin/utilizadores/novo')).toBe(true);
  });

  it('falls back to a no-permission page when nothing is granted', () => {
    expect(adminLandingPath(user([]))).toBe('/admin/sem-permissao');
  });
});
