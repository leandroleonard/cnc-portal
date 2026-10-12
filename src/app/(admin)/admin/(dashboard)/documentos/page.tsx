import { Suspense } from 'react';
import { AdminDocumentsPageClient } from '@/components/admin/AdminPageClients';

export default function DocumentsAdminPage() {
  return <Suspense fallback={<div className="admin-inline-state">A carregar documentos…</div>}><AdminDocumentsPageClient /></Suspense>;
}
