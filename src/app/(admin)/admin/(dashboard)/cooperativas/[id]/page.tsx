import { AdminCooperativeEditorPageClient } from '@/components/admin/AdminPageClients';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditCooperativePage({ params }: PageProps) {
  const { id } = await params;
  return <AdminCooperativeEditorPageClient id={id} />;
}
