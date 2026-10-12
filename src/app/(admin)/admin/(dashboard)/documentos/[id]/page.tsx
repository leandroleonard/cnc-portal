import { AdminDocumentEditorPageClient } from '@/components/admin/AdminPageClients';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditDocumentPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminDocumentEditorPageClient id={id} />;
}
