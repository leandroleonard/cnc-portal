import { Suspense } from 'react';
import { AdminHeroPageClient } from '@/components/admin/AdminPageClients';

export default function HeroAdminPage() {
  return <Suspense fallback={<div className="admin-inline-state">A carregar slides…</div>}><AdminHeroPageClient /></Suspense>;
}
