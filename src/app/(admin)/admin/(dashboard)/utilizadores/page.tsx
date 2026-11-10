import { Suspense } from 'react';
import { AdminUsersPageClient } from '@/components/admin/UsersPageClients';

export default function AdminUsersPage() {
  return <Suspense fallback={<div className="admin-inline-state">A carregar utilizadores…</div>}><AdminUsersPageClient /></Suspense>;
}
