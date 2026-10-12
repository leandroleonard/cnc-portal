import { Suspense } from 'react';
import { AdminContactsPageClient } from '@/components/admin/AdminPageClients';

export default function ContactMessagesAdminPage() {
  return <Suspense fallback={<div className="admin-inline-state">A carregar mensagens…</div>}><AdminContactsPageClient /></Suspense>;
}
