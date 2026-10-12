import { Suspense } from 'react';
import { AdminNewsPageClient } from '@/components/admin/AdminPageClients';

export default function NewsAdminPage() {
  return <Suspense fallback={<div className="admin-inline-state">A carregar publicações…</div>}><AdminNewsPageClient /></Suspense>;
}
