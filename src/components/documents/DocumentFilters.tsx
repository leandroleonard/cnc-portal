'use client';

import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { DocumentFacets, Locale } from '@/types/domain';
import { Button } from '@/components/ui/primitives';

export function DocumentFilters({ facets, initial }: { facets: DocumentFacets | null; initial: { search?: string; category?: string; year?: string; fileType?: string } }) {
  const t = useTranslations('pages.documents');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [search, setSearch] = useState(initial.search ?? '');
  const [category, setCategory] = useState(initial.category ?? '');
  const [year, setYear] = useState(initial.year ?? '');
  const [fileType, setFileType] = useState(initial.fileType ?? '');
  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query: Record<string, string> = {};
    if (search.trim()) query.search = search.trim();
    if (category) query.category = category;
    if (year) query.year = year;
    if (fileType) query.fileType = fileType;
    router.push({ pathname: '/documentos', query });
  }
  return <form className="library-toolbar" onSubmit={apply}>
    <label className="search-field"><Search size={19} aria-hidden="true" /><span className="sr-only">{t('searchPlaceholder')}</span><input className="input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchPlaceholder')} /></label>
    <label className="select-label"><span>{t('category')}</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">{locale === 'pt' ? 'Todas' : 'All'}</option>{facets?.categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
    <label className="select-label"><span>{t('year')}</span><select value={year} onChange={(event) => setYear(event.target.value)}><option value="">{locale === 'pt' ? 'Todos' : 'All'}</option>{facets?.years.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
    <label className="select-label"><span>{t('type')}</span><select value={fileType} onChange={(event) => setFileType(event.target.value)}><option value="">{locale === 'pt' ? 'Todos' : 'All'}</option>{facets?.fileTypes.map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}</select></label>
    <Button type="submit">{locale === 'pt' ? 'Filtrar' : 'Filter'}</Button>
  </form>;
}
