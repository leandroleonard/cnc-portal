import { Suspense } from 'react';
import { AdminNewsletterPageClient } from '@/components/admin/AdminPageClients';

export default function NewsletterAdminPage() {
  return <Suspense fallback={<div className="admin-inline-state">A carregar subscritores…</div>}><AdminNewsletterPageClient /></Suspense>;
}
