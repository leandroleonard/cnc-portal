'use client';

import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/primitives';

export function GlobalSearchForm({ initialQuery = '' }: { initialQuery?: string }) {
  const t = useTranslations('pages.search');
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push({ pathname: '/pesquisa', query: query.trim() ? { q: query.trim() } : {} });
  }
  return <form className="directory-search" onSubmit={submit}><Search size={22} aria-hidden="true" /><label className="sr-only" htmlFor="global-search-input">{t('placeholder')}</label><input id="global-search-input" className="input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('placeholder')} /><Button type="submit">{t('submit')}</Button></form>;
}
