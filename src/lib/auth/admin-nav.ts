import type { AdminUser } from '@/types/domain';
import { hasPermission } from '@/lib/utils/permissions';

/**
 * Fontes de verdade para permissões de navegação administrativa.
 * O layout/shell continua o mesmo; apenas as entradas visíveis e o destino
 * inicial mudam conforme as permissões reais devolvidas pela API.
 */
export const adminNavPermissions = [
  { href: '/admin', resource: 'dashboard', action: 'view', exact: true },
  { href: '/admin/registos', resource: 'registrations', action: 'view' },
  { href: '/admin/moderacao', resource: 'cooperatives', action: 'review' },
  { href: '/admin/utilizadores', resource: 'users', action: 'view' },
  { href: '/admin/hero', resource: 'hero-slides', action: 'view' },
  { href: '/admin/cooperativas', resource: 'cooperatives', action: 'view' },
  { href: '/admin/noticias', resource: 'news', action: 'view' },
  { href: '/admin/documentos', resource: 'documents', action: 'view' },
  { href: '/admin/institucional', resource: 'institutional', action: 'view' },
  { href: '/admin/media', resource: 'media', action: 'view' },
  { href: '/admin/redes-sociais', resource: 'social-links', action: 'view' },
  { href: '/admin/newsletter', resource: 'newsletter', action: 'view' },
  { href: '/admin/contactos', resource: 'contact-messages', action: 'view' },
  { href: '/admin/configuracoes', resource: 'settings', action: 'view' },
] as const;

export const adminNoPermissionPath = '/admin/sem-permissao';
export const adminPasswordChangePath = '/admin/alterar-password';

export function adminLandingPath(user: AdminUser): string {
  for (const item of adminNavPermissions) {
    if (hasPermission(user, item.resource, item.action)) return item.href;
  }
  return adminNoPermissionPath;
}

export function canAccessAdminPath(user: AdminUser, pathname: string): boolean {
  const path = pathname.split('?')[0].split('#')[0];
  if (path === adminNoPermissionPath) return true;
  const item = adminNavPermissions.find((entry) => (
    'exact' in entry && entry.exact
      ? path === entry.href
      : path === entry.href || path.startsWith(`${entry.href}/`)
  ));
  if (!item) return true;
  return hasPermission(user, item.resource, item.action);
}
