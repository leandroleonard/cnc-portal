'use client';

import { useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { Activity, CooperativeFacets, Locale, Municipality, Province } from '@/types/domain';
import { Button } from '@/components/ui/primitives';

export function CooperativeDirectoryFilters({
  provinces,
  municipalities,
  activities,
  facets,
  initial,
}: {
  provinces: Province[];
  municipalities: Municipality[];
  activities: Activity[];
  facets: CooperativeFacets | null;
  initial: { search?: string; province?: string; municipality?: string; activity?: string; status?: string; type?: string };
}) {
  const t = useTranslations('pages.cooperatives');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [search, setSearch] = useState(initial.search ?? '');
  const [province, setProvince] = useState(initial.province ?? '');
  const [municipality, setMunicipality] = useState(initial.municipality ?? '');
  const [activity, setActivity] = useState(initial.activity ?? '');
  const [status, setStatus] = useState(initial.status ?? '');
  const [type, setType] = useState(initial.type ?? '');

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query: Record<string, string> = {};
    if (search.trim()) query.search = search.trim();
    if (province) query[locale === 'pt' ? 'provincia' : 'province'] = province;
    if (municipality) query[locale === 'pt' ? 'municipio' : 'municipality'] = municipality;
    if (activity) query[locale === 'pt' ? 'actividade' : 'activity'] = activity;
    if (status) query[locale === 'pt' ? 'estado' : 'status'] = status;
    if (type) query[locale === 'pt' ? 'tipo' : 'type'] = type;
    router.push({ pathname: '/cooperativas', query });
  }

  function clear() {
    setSearch(''); setProvince(''); setMunicipality(''); setActivity(''); setStatus(''); setType('');
    router.push('/cooperativas');
  }

  return (
    <form className="filter-panel" onSubmit={apply}>
      <div className="filter-panel__title"><h2>{t('filters')}</h2><button type="button" onClick={clear}>{locale === 'pt' ? 'Limpar' : 'Clear'}</button></div>
      <label className="filter-search-label"><span>{locale === 'pt' ? 'Pesquisa' : 'Search'}</span><input className="input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchPlaceholder')} /></label>
      <label className="select-label"><span>{t('province')}</span><select value={province} onChange={(event) => { setProvince(event.target.value); setMunicipality(''); }}><option value="">{t('all')}</option>{provinces.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
      <label className="select-label"><span>{t('municipality')}</span><select value={municipality} onChange={(event) => setMunicipality(event.target.value)}><option value="">{t('all')}</option>{municipalities.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
      <label className="select-label"><span>{t('activity')}</span><select value={activity} onChange={(event) => setActivity(event.target.value)}><option value="">{t('all')}</option>{activities.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
      <label className="select-label"><span>{t('status')}</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">{t('all')}</option>{(facets?.statuses ?? []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      <label className="select-label"><span>{t('type')}</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="">{t('all')}</option>{(facets?.types ?? []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      <Button type="submit" className="full-width">{locale === 'pt' ? 'Aplicar filtros' : 'Apply filters'}</Button>
    </form>
  );
}
