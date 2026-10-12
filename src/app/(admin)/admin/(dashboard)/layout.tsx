'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { getCurrentAdmin } from '@/lib/api/auth';
import { clearAccessToken, getAccessToken, subscribeToAccessToken } from '@/lib/api/client';
import type { AdminUser } from '@/types/domain';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useSyncExternalStore(subscribeToAccessToken, getAccessToken, () => null);
  const [identity, setIdentity] = useState<{ token: string; user: AdminUser } | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname || '/admin')}`);
      return;
    }
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

  if (!token || !identity || identity.token !== token) {
    return <main className="admin-state" role="status"><p>A validar o token de acesso…</p></main>;
  }
  return <AdminShell user={identity.user}>{children}</AdminShell>;
}
