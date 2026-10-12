import { Suspense } from 'react';
import { AdminCooperativesPageClient } from '@/components/admin/AdminPageClients';

export default function CooperativesAdminPage() {
  return <Suspense fallback={<div className="admin-inline-state">A carregar cooperativas…</div>}><AdminCooperativesPageClient /></Suspense>;
}
