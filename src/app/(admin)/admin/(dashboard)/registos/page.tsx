import { Suspense } from 'react';
import { AdminRegistrationsPageClient } from '@/components/admin/RegistrationsPageClients';

export default function RegistrationsAdminPage() {
  return <Suspense fallback={<div className="admin-inline-state">A carregar registos…</div>}><AdminRegistrationsPageClient /></Suspense>;
}
