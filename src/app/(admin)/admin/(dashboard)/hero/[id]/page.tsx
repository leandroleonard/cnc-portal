import { notFound } from 'next/navigation';
import { AdminApiState, AdminBackLink, AdminPageHeader } from '@/components/admin/AdminUI';
import { HeroSlideEditor } from '@/components/admin/ContentForms';
import { getHeroSlide } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { loadApi } from '@/lib/api/loader';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditHeroSlidePage({ params }: PageProps) {
  const { id } = await params;
  const result = await loadApi(() => getHeroSlide(id));
  if (result.error instanceof ApiError && result.error.status === 404) notFound();
  return <><AdminBackLink href="/admin/hero" /><AdminPageHeader title="Editar slide" description="Atualize imagem, traduções, ordem e estado do banner." />{result.error || !result.data ? <AdminApiState error={result.error ?? new Error('Slide não encontrado.')} /> : <HeroSlideEditor initial={result.data} />}</>;
}
