import { Suspense } from 'react';
import { AdminStatisticsPageClient } from '@/components/admin/AdminPageClients';

export default function StatisticsAdminPage() {
  return <Suspense fallback={<div className="admin-inline-state">A carregar indicadores…</div>}><AdminStatisticsPageClient /></Suspense>;
}
