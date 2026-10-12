import { Suspense } from 'react';
import { AdminMediaPageClient } from '@/components/admin/AdminPageClients';

export default function MediaAdminPage() {
  return <Suspense fallback={<div className="admin-inline-state">A carregar biblioteca media…</div>}><AdminMediaPageClient /></Suspense>;
}
