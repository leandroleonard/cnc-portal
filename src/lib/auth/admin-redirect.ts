export function safeAdminRedirect(target: string | null, origin: string): string {
  if (!target) return '/admin';
  try {
    const expectedOrigin = new URL(origin).origin;
    const destination = new URL(target, expectedOrigin);
    const isAdminPath = destination.pathname === '/admin' || destination.pathname.startsWith('/admin/');
    if (destination.origin !== expectedOrigin || !isAdminPath) return '/admin';
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return '/admin';
  }
}
