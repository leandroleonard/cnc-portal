import { AdminBackLink, AdminPageHeader } from '@/components/admin/AdminUI';
import { HeroSlideEditor } from '@/components/admin/ContentForms';

export default function CreateHeroSlidePage() {
  return <><AdminBackLink href="/admin/hero" /><AdminPageHeader title="Criar slide" description="O primeiro slide institucional deve representar o CNC; os restantes podem promover cooperativas e campanhas." /><HeroSlideEditor initial={null} /></>;
}
