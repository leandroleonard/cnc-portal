import { AdminNewsEditorPageClient } from '@/components/admin/AdminPageClients';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditNewsPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminNewsEditorPageClient id={id} />;
}
