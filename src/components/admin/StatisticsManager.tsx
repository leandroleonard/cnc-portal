'use client';

import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import type { Activity, AdminStatisticIndicator, Province, StatisticIndicatorInput } from '@/types/domain';
import { deleteStatisticIndicator, saveStatisticIndicator } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { AdminPanel, FormFeedback } from './AdminUI';
import { Button } from '@/components/ui/primitives';

const emptyForm: StatisticIndicatorInput = { key: '', translations: { pt: { label: '', description: '' }, en: { label: '', description: '' } }, value: 0, unit: '', period: '', provinceId: null, activityId: null, published: false };

export function StatisticsManager({ initial, provinces, activities }: { initial: AdminStatisticIndicator[]; provinces: Province[]; activities: Activity[] }) {
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState<StatisticIndicatorInput | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function edit(item?: AdminStatisticIndicator) {
    setError(''); setSuccess('');
    setForm(item ? { id: item.id, key: item.key, translations: item.translations, value: item.value, unit: item.unit ?? '', period: item.period ?? '', provinceId: item.provinceId ?? item.province?.id ?? null, activityId: item.activityId ?? item.activity?.id ?? null, published: item.published } : { ...emptyForm, translations: { pt: { ...emptyForm.translations.pt }, en: { ...emptyForm.translations.en } } });
  }

  function update<K extends keyof StatisticIndicatorInput>(key: K, value: StatisticIndicatorInput[K]) { setForm((current) => current ? { ...current, [key]: value } : current); }
  function updateTranslation(locale: 'pt' | 'en', key: 'label' | 'description', value: string) { setForm((current) => current ? { ...current, translations: { ...current.translations, [locale]: { ...current.translations[locale], [key]: value } } } : current); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!form) return;
    setError(''); setSuccess('');
    if (!form.translations.pt.label.trim() || !form.translations.en.label.trim()) { setError('O nome do indicador é obrigatório em PT e EN.'); return; }
    setBusy(true);
    try {
      const saved = await saveStatisticIndicator({ ...form, key: form.key.trim() || form.translations.pt.label.toLowerCase().replace(/[^a-z0-9]+/g, '-'), value: Number(form.value) });
      setItems((current) => current.some((item) => item.id === saved.id) ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
      setSuccess('Indicador guardado com sucesso.'); setForm(null);
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Não foi possível guardar o indicador.'); }
    finally { setBusy(false); }
  }

  async function remove(item: AdminStatisticIndicator) {
    if (!window.confirm('Eliminar este indicador?')) return;
    setError('');
    try { await deleteStatisticIndicator(item.id); setItems((current) => current.filter((entry) => entry.id !== item.id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível eliminar o indicador.'); }
  }

  return <>
    <div className="admin-stat-toolbar"><div><p>Os valores e agregados são calculados e validados pela API.</p></div><Button onClick={() => edit()}><Plus size={16} /> Novo indicador</Button></div>
    {success && <FormFeedback success={success} />}{error && !form && <FormFeedback error={error} />}
    {form && <AdminPanel title={form.id ? 'Editar indicador' : 'Criar indicador'} action={<button type="button" className="admin-icon-button" aria-label="Fechar formulário" onClick={() => setForm(null)}><X size={17} /></button>}>
      <form className="admin-stat-form" onSubmit={submit}>
        <label className="admin-field"><span>Chave</span><input value={form.key} onChange={(event) => update('key', event.target.value)} placeholder="total-cooperatives" /></label>
        <label className="admin-field"><span>Valor</span><input type="number" min="0" step="any" value={form.value} onChange={(event) => update('value', Number(event.target.value))} /></label>
        <label className="admin-field"><span>Unidade</span><input value={form.unit ?? ''} onChange={(event) => update('unit', event.target.value)} /></label>
        <label className="admin-field"><span>Período</span><input value={form.period ?? ''} onChange={(event) => update('period', event.target.value)} placeholder="2026 / 2026-Q1" /></label>
        <label className="admin-field"><span>Província opcional</span><select value={form.provinceId ?? ''} onChange={(event) => update('provinceId', event.target.value || null)}><option value="">Nacional</option>{provinces.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <label className="admin-field"><span>Actividade opcional</span><select value={form.activityId ?? ''} onChange={(event) => update('activityId', event.target.value || null)}><option value="">Todas</option>{activities.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <div className="translation-grid admin-stat-translations">{(['pt', 'en'] as const).map((locale) => <div className="translation-card" key={locale}><header><strong>{locale === 'pt' ? 'Português' : 'English'}</strong></header><label className="admin-field"><span>{locale === 'pt' ? 'Nome do indicador' : 'Indicator label'}</span><input value={form.translations[locale].label} onChange={(event) => updateTranslation(locale, 'label', event.target.value)} /></label><label className="admin-field"><span>{locale === 'pt' ? 'Descrição' : 'Description'}</span><textarea value={form.translations[locale].description ?? ''} onChange={(event) => updateTranslation(locale, 'description', event.target.value)} /></label></div>)}</div>
        <label className="admin-checkbox"><input type="checkbox" checked={form.published} onChange={(event) => update('published', event.target.checked)} /> Publicar como indicador público</label>
        <FormFeedback error={error} />
        <div className="admin-stat-actions"><button className="admin-button-secondary" type="button" onClick={() => setForm(null)}>Cancelar</button><Button type="submit" disabled={busy}>{busy ? 'A guardar…' : 'Guardar indicador'}</Button></div>
      </form>
    </AdminPanel>}
    <AdminPanel title="Indicadores geridos" description="Cada valor é mantido individualmente">
      {items.length === 0 ? <div className="admin-empty"><div className="admin-empty__icon">—</div><h2>Sem indicadores</h2><p>Adicione um indicador quando existirem dados aprovados para publicação.</p></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Indicador (PT / EN)</th><th>Valor</th><th>Período / território</th><th>Estado</th><th className="text-end">Acções</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{item.translations.pt.label}</strong><small className="admin-table-subline">{item.translations.en.label}</small></td><td><strong>{new Intl.NumberFormat('pt-AO').format(item.value)} {item.unit ?? ''}</strong></td><td>{item.period ?? '—'}{item.province?.name ? ` · ${item.province.name}` : ''}</td><td><span className={`admin-tag ${item.published ? 'admin-tag--green' : 'admin-tag--gold'}`}>{item.published ? 'Publicado' : 'Rascunho'}</span></td><td><div className="admin-table-actions"><button type="button" aria-label={`Editar ${item.translations.pt.label}`} onClick={() => edit(item)}><Pencil size={15} /></button><button type="button" className="danger" aria-label={`Eliminar ${item.translations.pt.label}`} onClick={() => void remove(item)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>}
    </AdminPanel>
  </>;
}
