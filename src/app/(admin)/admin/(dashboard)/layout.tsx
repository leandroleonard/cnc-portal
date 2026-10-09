import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/api/auth';
import { AdminShell } from '@/components/admin/AdminShell';
import { ApiError } from '@/lib/api/client';
import type { AdminUser } from '@/types/domain';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get('cookie') ?? undefined;
  let user: AdminUser;
  try {
    user = await getCurrentAdmin(cookieHeader);
  } catch (error) {
    const next = '/admin';
    if (error instanceof ApiError && error.status === 403) redirect('/admin/login');
    redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  }
  return <AdminShell user={user}>{children}</AdminShell>;
}
