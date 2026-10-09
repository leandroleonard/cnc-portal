import { describe, expect, it } from 'vitest';
import type { AdminUser } from '@/types/domain';
import { hasPermission } from './permissions';

const user: AdminUser = { id: 'user-1', name: 'CNC Editor', email: 'editor@example.ao', role: 'editor', permissions: ['news.view', 'news.create', 'admin.content.manage'] };

describe('admin visual permissions', () => {
  it('matches named resource actions', () => {
    expect(hasPermission(user, 'news', 'view')).toBe(true);
    expect(hasPermission(user, 'media', 'delete')).toBe(true);
  });

  it('does not grant unlisted actions to a restricted user', () => {
    const restricted = { ...user, permissions: ['news.view'] };
    expect(hasPermission(restricted, 'news', 'delete')).toBe(false);
  });

  it('recognizes an explicit full-access grant', () => {
    expect(hasPermission({ ...user, permissions: ['*'] }, 'settings', 'manage')).toBe(true);
  });
});
