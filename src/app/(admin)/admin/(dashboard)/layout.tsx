'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { getCurrentAdmin } from '@/lib/api/auth';
import { clearAccessToken, getAccessToken, subscribeToAccessToken } from '@/lib/api/client';
import { restoreAdminSession } from '@/lib/api/session';
import { adminLandingPath, adminPasswordChangePath, canAccessAdminPath } from '@/lib/auth/admin-nav';
import type { AdminUser } from '@/types/domain';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useSyncExternalStore(subscribeToAccessToken, getAccessToken, () => null);
  const [identity, setIdentity] = useState<{ token: string; user: AdminUser } | null>(null);

  // Refresh: tenta reidratar a sessão a partir do cookie httpOnly antes de expulsar o utilizador.
  useEffect(() => {
    if (token) return;
    let active = true;
    void restoreAdminSession()
      .then((user) => {
        if (!active) return;
        if (!user) router.replace(`/admin/login?next=${encodeURIComponent(pathname || '/admin')}`);
      })
      .catch(() => { if (active) router.replace(`/admin/login?next=${encodeURIComponent(pathname || '/admin')}`); });
    return () => { active = false; };
  }, [token, pathname, router]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    void getCurrentAdmin()
      .then((user) => { if (active) setIdentity({ token, user }); })
      .catch(() => {
        if (!active) return;
        clearAccessToken();
        router.replace(`/admin/login?next=${encodeURIComponent(pathname || '/admin')}`);
      });
    return () => { active = false; };
  }, [token, pathname, router]);

  const mustChangePassword = Boolean(identity?.user.mustChangePassword);
  const allowed = identity ? canAccessAdminPath(identity.user, pathname || '/admin') : false;

  useEffect(() => {
    if (!identity) return;
    // Troca de senha obrigatória: o servidor bloqueia tudo até o utilizador a redefinir.
    if (identity.user.mustChangePassword) {
      router.replace(adminPasswordChangePath);
      return;
    }
    if (!allowed) router.replace(adminLandingPath(identity.user));
  }, [identity, allowed, router]);

  if (!token || !identity || identity.token !== token || !allowed || mustChangePassword) {
    return <main className="admin-state" role="status"><p>A validar o token de acesso…</p></main>;
  }
  return <AdminShell user={identity.user}>{children}</AdminShell>;
}
