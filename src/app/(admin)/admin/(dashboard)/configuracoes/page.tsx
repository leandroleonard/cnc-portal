import { AdminApiState, AdminPageHeader } from '@/components/admin/AdminUI';
import { SettingsEditor } from '@/components/admin/AdminExtraForms';
import { getAdminSettings } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';

export default async function SettingsAdminPage() {
  const result = await loadApi(getAdminSettings);
  return <><AdminPageHeader title="Configurações" description="Identidade institucional, dados de contacto e textos globais do website em PT e EN." />{result.error ? <AdminApiState error={result.error} /> : <SettingsEditor initial={result.data ?? { logoId: null, faviconUrl: '', translations: { pt: { organizationName: '', footerText: '', address: '' }, en: { organizationName: '', footerText: '', address: '' } }, phone: '', email: '' }} />}</>;
}
