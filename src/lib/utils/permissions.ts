import type { AdminUser } from '@/types/domain';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'publish' | 'manage';

export function hasPermission(user: AdminUser, resource: string, action: PermissionAction): boolean {
  const granted = new Set(user.permissions);
  return granted.has('*') || granted.has(`${resource}.${action}`) || granted.has('admin.content.manage');
}
