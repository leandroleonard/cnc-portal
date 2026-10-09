'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { Activity, Locale, Province } from '@/types/domain';
import { Button } from '@/components/ui/primitives';

export function CooperativeFinder({
  provinces,
  activities,
  initialSearch = '',
  initialProvince = '',
  initialActivity = '',
  compact = false,
}: {
  provinces: Province[];
  activities: Activity[];
  initialSearch?: string;
  initialProvince?: string;
  initialActivity?: string;
  compact?: boolean;
}) {
  const t = useTranslations('home');
  const filterT = useTranslations('pages.cooperatives');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [province, setProvince] = useState(initialProvince);
  const [activity, setActivity] = useState(initialActivity);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query: Record<string, string> = {};
    if (search.trim()) query.search = search.trim();
    if (province) query[locale === 'pt' ? 'provincia' : 'province'] = province;
    if (activity) query[locale === 'pt' ? 'actividade' : 'activity'] = activity;
    router.push({ pathname: '/cooperativas', query });
  }

  return (
    <form className={`finder__controls ${compact ? 'finder__controls--compact' : ''}`} onSubmit={submit}>
      <label className="search-field">
        <span className="sr-only">{t('searchPlaceholder')}</span>
        <Search size={20} aria-hidden="true" />
        <input className="input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchPlaceholder')} />
      </label>
      <label className="select-label"><span>{t('province')}</span><select value={province} onChange={(event) => setProvince(event.target.value)}><option value="">{filterT('all')}</option>{provinces.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
      <label className="select-label"><span>{t('activity')}</span><select value={activity} onChange={(event) => setActivity(event.target.value)}><option value="">{filterT('all')}</option>{activities.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
      <Button type="submit">{t('searchButton')} <ArrowRight size={17} aria-hidden="true" /></Button>
    </form>
  );
}
