'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Container } from '@/components/ui/primitives';

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('common');
  useEffect(() => { console.error('Public page render failed', error); }, [error]);
  return <Container className="section"><div className="state-page"><h1>{t('errorTitle')}</h1><p>{t('errorDescription')}</p><Button onClick={reset}>{t('retry')}</Button></div></Container>;
}
