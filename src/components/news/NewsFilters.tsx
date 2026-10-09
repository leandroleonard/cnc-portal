'use client';

import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { Locale, NewsCategory } from '@/types/domain';
import { Button } from '@/components/ui/primitives';

export function NewsFilters({ categories, initialSearch = '', initialCategory = '' }: { categories: NewsCategory[]; initialSearch?: string; initialCategory?: string }) {
  const t = useTranslations('pages.news');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query: Record<string, string> = {};
    if (search.trim()) query.search = search.trim();
    if (category) query.category = category;
    router.push({ pathname: '/actualidade', query });
  }
  return <form className="content-toolbar" onSubmit={apply}>
    <label className="small-search"><Search size={18} aria-hidden="true" /><input className="input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchPlaceholder')} /></label>
    <div className="news-filter-controls"><label className="sr-only" htmlFor="news-category">{t('categories')}</label><select id="news-category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">{t('all')}</option>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select><Button type="submit">{locale === 'pt' ? 'Filtrar' : 'Filter'}</Button></div>
  </form>;
}
