'use client';

import { useState, type FormEvent } from 'react';
import { ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Media, SiteSettingsInput, SocialLinkInput, SocialNetwork } from '@/types/domain';
import { deleteSocialLink, reorderSocialLinks, saveSocialLink, updateAdminSettings } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { AdminPanel, FormFeedback } from './AdminUI';
import { UploadField } from './UploadField';
import { Button } from '@/components/ui/primitives';

const platforms: Array<{ value: SocialNetwork['platform']; label: string }> = [
  { value: 'facebook', label: 'Facebook' }, { value: 'instagram', label: 'Instagram' }, { value: 'youtube', label: 'YouTube' }, { value: 'linkedin', label: 'LinkedIn' }, { value: 'x', label: 'X / Twitter' }, { value: 'whatsapp', label: 'WhatsApp' },
];

export function SocialLinksManager({ initial }: { initial: SocialNetwork[] }) {
  const [items, setItems] = useState([...initial].sort((a, b) => a.order - b.order));
  const [form, setForm] = useState<(SocialLinkInput & { id?: string }) | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  function begin(item?: SocialNetwork) { setError(''); setSuccess(''); setForm(item ? { id: item.id, platform: item.platform, url: item.url, active: item.active, order: item.order } : { platform: 'facebook', url: '', active: true, order: items.length + 1 }); }
  function update<K extends keyof SocialLinkInput>(key: K, value: SocialLinkInput[K]) { setForm((current) => current ? { ...current, [key]: value } : current); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!form) return; setError(''); setSuccess('');
    if (!form.url.trim()) { setError('Introduza o URL completo da rede social.'); return; }
    try { setBusy(true); const saved = await saveSocialLink(form); setItems((current) => current.some((item) => item.id === saved.id) ? current.map((item) => item.id === saved.id ? saved : item).sort((a, b) => a.order - b.order) : [...current, saved].sort((a, b) => a.order - b.order)); setForm(null); setSuccess('Rede social guardada.'); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Não foi possível guardar a rede social.'); }
    finally { setBusy(false); }
  }
  async function remove(item: SocialNetwork) {
    if (!window.confirm(`Eliminar o link ${item.platform}?`)) return;
    try { await deleteSocialLink(item.id); setItems((current) => current.filter((entry) => entry.id !== item.id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível eliminar o link.'); }
  }
  async function move(index: number, delta: -1 | 1) {
    const target = index + delta; if (target < 0 || target >= items.length) return;
    const next = [...items]; [next[index], next[target]] = [next[target], next[index]];
    try { setBusy(true); await reorderSocialLinks(next.map((item, position) => ({ id: item.id, order: position + 1 }))); setItems(next.map((item, position) => ({ ...item, order: position + 1 }))); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível reordenar as redes sociais.'); }
    finally { setBusy(false); }
  }
  return <>
    <div className="admin-list-toolbar"><p>O website público só apresenta redes que estejam activas e tenham um URL válido.</p><Button onClick={() => begin()}><Plus size={16} /> Adicionar rede</Button></div>
    {success && <FormFeedback success={success} />}{error && !form && <FormFeedback error={error} />}
    {form && <AdminPanel title={form.id ? 'Editar rede social' : 'Adicionar rede social'}><form className="admin-form-grid" onSubmit={submit}><label className="admin-field"><span>Plataforma</span><select value={form.platform} onChange={(event) => update('platform', event.target.value as SocialNetwork['platform'])}>{platforms.map((platform) => <option key={platform.value} value={platform.value}>{platform.label}</option>)}</select></label><label className="admin-field"><span>URL pública</span><input type="url" required value={form.url} onChange={(event) => update('url', event.target.value)} placeholder="https://…" /></label><label className="admin-field"><span>Ordem</span><input type="number" min={1} value={form.order} onChange={(event) => update('order', Number(event.target.value))} /></label><label className="admin-checkbox"><input type="checkbox" checked={form.active} onChange={(event) => update('active', event.target.checked)} /> Activa no website</label><div className="admin-form-actions admin-field--full"><button className="admin-button-secondary" type="button" onClick={() => setForm(null)}>Cancelar</button><Button type="submit" disabled={busy}>{busy ? 'A guardar…' : 'Guardar'}</Button></div><div className="admin-field--full"><FormFeedback error={error} /></div></form></AdminPanel>}
    <AdminPanel title="Redes sociais" description="Plataformas opcionais disponíveis no rodapé do website.">{items.length === 0 ? <div className="admin-empty"><div className="admin-empty__icon">—</div><h2>Nenhuma rede configurada</h2><p>Adicione uma plataforma apenas quando o CNC tiver um endereço oficial.</p></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Ordem</th><th>Plataforma</th><th>URL</th><th>Estado</th><th className="text-end">Acções</th></tr></thead><tbody>{items.map((item, index) => <tr key={item.id}><td><div className="admin-order-controls"><button type="button" aria-label="Mover para cima" disabled={busy || index === 0} onClick={() => void move(index, -1)}><ArrowUp size={15} /></button><strong>{item.order}</strong></div></td><td><strong>{platforms.find((entry) => entry.value === item.platform)?.label ?? item.platform}</strong></td><td><a href={item.url} target="_blank" rel="noreferrer">{item.url}</a></td><td><span className={`admin-tag ${item.active ? 'admin-tag--green' : 'admin-tag--gold'}`}>{item.active ? 'Activa' : 'Inactiva'}</span></td><td><div className="admin-table-actions"><button type="button" aria-label="Editar rede" onClick={() => begin(item)}><Pencil size={15} /></button><button type="button" className="danger" aria-label="Eliminar rede" onClick={() => void remove(item)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>}</AdminPanel>
  </>;
}

export function SettingsEditor({ initial }: { initial: SiteSettingsInput }) {
  const [form, setForm] = useState<SiteSettingsInput>(initial);
  const [logo, setLogo] = useState<Media | null>(initial.logo ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  function updateTranslation(locale: 'pt' | 'en', key: 'organizationName' | 'footerText' | 'address', value: string) { setForm((current) => ({ ...current, translations: { ...current.translations, [locale]: { ...current.translations[locale], [key]: value } } })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try { const saved = await updateAdminSettings({ ...form, logoId: logo?.id ?? null }); setForm(saved); setSuccess('Configurações guardadas.'); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Não foi possível guardar as configurações.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="admin-form-layout"><div className="admin-form-main"><AdminPanel title="Identidade e contactos" description="Os dados globais usados no cabeçalho, rodapé e metadados públicos."><div className="admin-form-grid"><label className="admin-field"><span>Email público</span><input type="email" value={form.email ?? ''} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label><label className="admin-field"><span>Telefone público</span><input type="tel" value={form.phone ?? ''} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label><label className="admin-field"><span>Favicon URL</span><input type="url" value={form.faviconUrl ?? ''} onChange={(event) => setForm((current) => ({ ...current, faviconUrl: event.target.value }))} /></label></div><div className="translation-grid admin-settings-translations">{(['pt', 'en'] as const).map((locale) => <div className="translation-card" key={locale}><header><strong>{locale === 'pt' ? 'Português' : 'English'}</strong><span>{locale.toUpperCase()}</span></header><label className="admin-field"><span>{locale === 'pt' ? 'Nome institucional' : 'Organisation name'}</span><input value={form.translations[locale].organizationName} onChange={(event) => updateTranslation(locale, 'organizationName', event.target.value)} /></label><label className="admin-field"><span>{locale === 'pt' ? 'Texto do rodapé' : 'Footer text'}</span><textarea value={form.translations[locale].footerText ?? ''} onChange={(event) => updateTranslation(locale, 'footerText', event.target.value)} /></label><label className="admin-field"><span>{locale === 'pt' ? 'Endereço institucional' : 'Institutional address'}</span><textarea value={form.translations[locale].address ?? ''} onChange={(event) => updateTranslation(locale, 'address', event.target.value)} /></label></div>)}</div></AdminPanel></div><aside className="admin-form-aside"><AdminPanel title="Logótipo do website"><UploadField label="Logótipo" value={logo} onChange={setLogo} imageOnly accept="image/jpeg,image/png,image/webp,image/svg+xml" maxSizeMb={5} /><p className="admin-form-hint">A imagem deve ter versão legível em fundos claros e escuros. O backend guarda o ficheiro e devolve um identificador de media.</p></AdminPanel></aside><div className="admin-form-main admin-form-submit-area"><FormFeedback error={error} success={success} /><div className="admin-form-actions"><Button type="submit" disabled={busy}>{busy ? 'A guardar…' : 'Guardar configurações'}</Button></div></div></form>;
}

export function markReadStatus(status: string): string {
  return status === 'new' ? 'Nova' : status === 'read' ? 'Lida' : status === 'responded' ? 'Respondida' : 'Arquivada';
}
