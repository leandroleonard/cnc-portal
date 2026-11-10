import type { AdminUser } from '@/types/domain';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'publish' | 'manage' | 'review';

export function hasPermission(user: AdminUser, resource: string, action: PermissionAction): boolean {
  // O perfil admin tem acesso total no painel (UX); o servidor continua a validar cada pedido.
  if (user.role === 'admin') return true;
  const granted = new Set(user.permissions);
  return granted.has('*') || granted.has(`${resource}.${action}`) || granted.has('admin.content.manage');
}