import { UserEditorPageClient } from '@/components/admin/UsersPageClients';

export default async function EditUserAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserEditorPageClient id={id} />;
}
