import { RegistrationEditorPageClient } from '@/components/admin/RegistrationsPageClients';

export default async function EditRegistrationAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RegistrationEditorPageClient id={id} />;
}
