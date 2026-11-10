'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import ptMessages from '@/i18n/messages/pt.json';
import { clearAccessToken } from '@/lib/api/client';
import { listRegistrationProvinces } from '@/lib/api/registrations';
import { AdminApiState } from '@/components/admin/AdminUI';
import { useAdminResource } from '@/components/admin/useAdminResource';
import AdminModerationView from '@/components/admin/AdminModerationView';

export function ModerationPageClient() {
  const router = useRouter();
  const load = useCallback(() => listRegistrationProvinces(), []);
  const { loading, data, error } = useAdminResource('moderation-provinces', load);

  if (loading) return <div className="admin-inline-state" role="status">A carregar a fila de moderação…</div>;
  if (error) return <AdminApiState error={error} />;

  return (
    <NextIntlClientProvider locale="pt" messages={ptMessages}>
      <AdminModerationView
        provinces={data ?? []}
        onSessionEnded={() => {
          clearAccessToken();
          router.replace('/admin/login');
        }}
      />
    </NextIntlClientProvider>
  );
}
