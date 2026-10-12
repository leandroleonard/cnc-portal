import { AdminHeroEditorPageClient } from '@/components/admin/AdminPageClients';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditHeroSlidePage({ params }: PageProps) {
  const { id } = await params;
  return <AdminHeroEditorPageClient id={id} />;
}
