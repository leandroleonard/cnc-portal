import { getTranslations } from 'next-intl/server';
import { AppLink, Container } from '@/components/ui/primitives';

export default async function NotFoundPage() {
  const t = await getTranslations('common');
  return <Container><section className="state-page"><strong className="error-code">404</strong><h1>{t('notFoundTitle')}</h1><p>{t('notFoundDescription')}</p><AppLink href="/">{t('backHome')}</AppLink></section></Container>;
}
