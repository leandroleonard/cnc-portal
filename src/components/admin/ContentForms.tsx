'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Save, Trash2 } from 'lucide-react';
import type {
  Activity, AdminCooperativeRecord, AdminDocumentCategory, AdminDocumentRecord, AdminHeroSlideRecord, AdminNewsCategory, AdminNewsRecord,
  CooperativeInput, DocumentInput, HeroSlideInput, HeroSlideTranslationInput, InstitutionalSectionInput,
  Localized, Media, NewsInput, RichTextBlock,
} from '@/types/domain';
import { createCooperative, createDocument, createHeroSlide, createNews, updateCooperative, updateDocument, updateHeroSlide, updateNews } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { slugify } from '@/lib/utils/format';
import { Button } from '@/components/ui/primitives';
import { FormFeedback } from './AdminUI';
import { UploadField } from './UploadField';
import { StructuredContentEditor } from './StructuredContentEditor';

function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="admin-form-section"><header><div><h2>{title}</h2>{description && <p>{description}</p>}</div></header>{children}</section>;
}

function Field({ label, children, full = false }: { label: string; children: ReactNode; full?: boolean }) {
  return <label className={`admin-field ${full ? 'admin-field--full' : ''}`}><span>{label}</span>{children}</label>;
}

function TranslationCard({ locale, children }: { locale: 'pt' | 'en'; children: ReactNode }) {
  return <div className="translation-card"><header><strong>{locale === 'pt' ? 'Português' : 'English'}</strong><span>{locale.toUpperCase()}</span></header>{children}</div>;
}

function SaveActions({ busy, onCancel, submitLabel = 'Guardar alterações' }: { busy: boolean; onCancel: () => void; submitLabel?: string }) {
  return <div className="admin-form-actions"><button className="admin-button-secondary" type="button" onClick={onCancel}>Cancelar</button><Button type="submit" disabled={busy}><Save size={16} />{busy ? 'A guardar…' : submitLabel}</Button></div>;
}

function blankHeroTranslations(): Localized<HeroSlideTranslationInput> {
  return { pt: { title: '', subtitle: '', description: '', primaryAction: { label: '', href: '' }, secondaryAction: { label: '', href: '' } }, en: { title: '', subtitle: '', description: '', primaryAction: { label: '', href: '' }, secondaryAction: { label: '', href: '' } } };
}

export function HeroSlideEditor({ initial }: { initial: AdminHeroSlideRecord | null }) {
  const router = useRouter();
  const [translations, setTranslations] = useState<Localized<HeroSlideTranslationInput>>(initial?.translations ?? blankHeroTranslations());
  const [kind, setKind] = useState<HeroSlideInput['kind']>(initial?.kind ?? 'institutional');
  const [order, setOrder] = useState(initial?.order ?? 1);
  const [active, setActive] = useState(initial?.active ?? true);
  const [image, setImage] = useState<Media | null>(initial?.image ?? null);
  const [logo, setLogo] = useState<Media | null>(initial?.logo ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function setText(locale: 'pt' | 'en', key: 'title' | 'subtitle' | 'description', value: string) {
    setTranslations((current) => ({ ...current, [locale]: { ...current[locale], [key]: value } }));
  }
  function setAction(locale: 'pt' | 'en', action: 'primaryAction' | 'secondaryAction', key: 'label' | 'href', value: string) {
    setTranslations((current) => ({ ...current, [locale]: { ...current[locale], [action]: { ...(current[locale][action] ?? { label: '', href: '' }), [key]: value } } }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess('');
    if (!translations.pt.title.trim() || !translations.en.title.trim()) { setError('O título é obrigatório em Português e English.'); return; }
    if (!image) { setError('Seleccione ou carregue uma imagem de fundo para o slide.'); return; }
    const payload: HeroSlideInput = { kind, translations, imageId: image.id, logoId: logo?.id ?? null, order: Number(order), active };
    setBusy(true);
    try {
      if (initial) await updateHeroSlide(initial.id, payload); else await createHeroSlide(payload);
      setSuccess('Slide guardado com sucesso.');
      router.replace('/admin/hero'); router.refresh();
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Não foi possível guardar o slide.'); }
    finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="admin-form-layout">
    <div className="admin-form-main">
      <FormSection title="Conteúdo do slide" description="Cada idioma é editado num campo separado e servido conforme o idioma do website.">
        <div className="translation-grid">{(['pt', 'en'] as const).map((locale) => <TranslationCard locale={locale} key={locale}>
          <Field label={locale === 'pt' ? 'Título' : 'Title'}><input required value={translations[locale].title} onChange={(event) => setText(locale, 'title', event.target.value)} /></Field>
          <Field label={locale === 'pt' ? 'Subtítulo' : 'Subtitle'}><input value={translations[locale].subtitle ?? ''} onChange={(event) => setText(locale, 'subtitle', event.target.value)} /></Field>
          <Field label={locale === 'pt' ? 'Descrição' : 'Description'}><textarea value={translations[locale].description ?? ''} onChange={(event) => setText(locale, 'description', event.target.value)} /></Field>
          <div className="admin-form-subgroup"><strong>CTA primário</strong><div className="admin-form-grid"><Field label={locale === 'pt' ? 'Texto' : 'Label'}><input value={translations[locale].primaryAction?.label ?? ''} onChange={(event) => setAction(locale, 'primaryAction', 'label', event.target.value)} /></Field><Field label="Link"><input value={translations[locale].primaryAction?.href ?? ''} onChange={(event) => setAction(locale, 'primaryAction', 'href', event.target.value)} placeholder="/institucional" /></Field></div></div>
          <div className="admin-form-subgroup"><strong>CTA secundário</strong><div className="admin-form-grid"><Field label={locale === 'pt' ? 'Texto' : 'Label'}><input value={translations[locale].secondaryAction?.label ?? ''} onChange={(event) => setAction(locale, 'secondaryAction', 'label', event.target.value)} /></Field><Field label="Link"><input value={translations[locale].secondaryAction?.href ?? ''} onChange={(event) => setAction(locale, 'secondaryAction', 'href', event.target.value)} placeholder="/cooperativas" /></Field></div></div>
        </TranslationCard>)}</div>
      </FormSection>
    </div>
    <aside className="admin-form-aside">
      <FormSection title="Imagem e logótipo"><UploadField label="Imagem de fundo" value={image} onChange={setImage} imageOnly accept="image/jpeg,image/png,image/webp" maxSizeMb={12} /><UploadField label="Logótipo opcional" value={logo} onChange={setLogo} imageOnly accept="image/jpeg,image/png,image/webp, image/svg+xml" maxSizeMb={5} /></FormSection>
      <FormSection title="Publicação"><Field label="Tipo de slide"><select value={kind} onChange={(event) => setKind(event.target.value as HeroSlideInput['kind'])}><option value="institutional">Institucional CNC</option><option value="cooperative">Cooperativa</option><option value="campaign">Campanha</option></select></Field><Field label="Ordem"><input type="number" min={1} value={order} onChange={(event) => setOrder(Number(event.target.value))} /></Field><label className="admin-checkbox"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Activo no website</label></FormSection>
    </aside>
    <div className="admin-form-main admin-form-submit-area"><FormFeedback error={error} success={success} /><SaveActions busy={busy} onCancel={() => router.back()} submitLabel={initial ? 'Guardar alterações' : 'Criar slide'} /></div>
  </form>;
}

function blankCooperativeInput(): CooperativeInput {
  return { slug: '', translations: { pt: { name: '', summary: '', description: '' }, en: { name: '', summary: '', description: '' } }, provinceId: '', municipalityId: null, commune: '', address: '', activityIds: [], type: 'production', status: 'active', registrationNumber: '', foundedYear: null, memberCount: null, logoId: null, coverImageId: null, galleryIds: [], contacts: { email: '', phone: '', website: '' }, location: null };
}

export function CooperativeEditor({ initial, provinces, activities }: { initial: AdminCooperativeRecord | null; provinces: Array<{ id: string; code: string; name: string; municipalities: Array<{ id: string; name: string }> }>; activities: Activity[] }) {
  const router = useRouter();
  const [form, setForm] = useState<CooperativeInput>(() => initial ? { slug: initial.slug, translations: initial.translations, provinceId: initial.provinceId, municipalityId: initial.municipalityId, commune: initial.commune, address: initial.address, activityIds: initial.activityIds, type: initial.type, status: initial.status, registrationNumber: initial.registrationNumber, foundedYear: initial.foundedYear, memberCount: initial.memberCount, logoId: initial.logo?.id ?? initial.logoId, coverImageId: initial.coverImage?.id ?? initial.coverImageId, galleryIds: initial.gallery?.map((item) => item.id) ?? initial.galleryIds, contacts: initial.contacts, location: initial.location } : blankCooperativeInput());
  const [logo, setLogo] = useState<Media | null>(initial?.logo ?? null);
  const [cover, setCover] = useState<Media | null>(initial?.coverImage ?? null);
  const [gallery, setGallery] = useState<Array<Media | null>>((initial?.gallery ?? []).slice(0, 4));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const selectedProvince = provinces.find((item) => item.id === form.provinceId);

  function updateTop<K extends keyof CooperativeInput>(key: K, value: CooperativeInput[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function updateTranslation(locale: 'pt' | 'en', key: 'name' | 'summary' | 'description', value: string) { setForm((current) => ({ ...current, translations: { ...current.translations, [locale]: { ...current.translations[locale], [key]: value } } })); }
  function updateContact(key: 'email' | 'phone' | 'website', value: string) { setForm((current) => ({ ...current, contacts: { ...current.contacts, [key]: value } })); }
  function updateLocation(key: 'latitude' | 'longitude', value: string) { const numeric = value === '' ? null : Number(value); setForm((current) => ({ ...current, location: numeric === null ? null : { latitude: key === 'latitude' ? numeric : current.location?.latitude ?? 0, longitude: key === 'longitude' ? numeric : current.location?.longitude ?? 0 } })); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess('');
    if (!form.translations.pt.name.trim() || !form.translations.en.name.trim()) { setError('O nome é obrigatório em Português e English.'); return; }
    if (!form.provinceId) { setError('Seleccione a província da cooperativa.'); return; }
    const payload: CooperativeInput = { ...form, slug: form.slug.trim() || slugify(form.translations.pt.name), logoId: logo?.id ?? null, coverImageId: cover?.id ?? null, galleryIds: gallery.filter((item): item is Media => item !== null).map((item) => item.id) };
    setBusy(true);
    try { if (initial) await updateCooperative(initial.id, payload); else await createCooperative(payload); setSuccess('Cooperativa guardada com sucesso.'); router.replace('/admin/cooperativas'); router.refresh(); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Não foi possível guardar a cooperativa.'); }
    finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="admin-form-layout">
    <div className="admin-form-main">
      <FormSection title="Conteúdo bilingue" description="Os textos são guardados separadamente para Português e English."><div className="translation-grid">{(['pt', 'en'] as const).map((locale) => <TranslationCard key={locale} locale={locale}><Field label={locale === 'pt' ? 'Nome' : 'Name'}><input required value={form.translations[locale].name} onChange={(event) => updateTranslation(locale, 'name', event.target.value)} /></Field><Field label={locale === 'pt' ? 'Resumo' : 'Summary'}><textarea value={form.translations[locale].summary ?? ''} onChange={(event) => updateTranslation(locale, 'summary', event.target.value)} /></Field><Field label={locale === 'pt' ? 'Descrição' : 'Description'}><textarea value={form.translations[locale].description ?? ''} onChange={(event) => updateTranslation(locale, 'description', event.target.value)} /></Field></TranslationCard>)}</div></FormSection>
      <FormSection title="Localização e actividade"><div className="admin-form-grid"><Field label="Slug"><input value={form.slug} onChange={(event) => updateTop('slug', event.target.value)} placeholder="gerado-a-partir-do-nome" /></Field><Field label="Província"><select value={form.provinceId} onChange={(event) => { updateTop('provinceId', event.target.value); updateTop('municipalityId', null); }} required><option value="">Seleccione</option>{provinces.map((province) => <option key={province.id} value={province.id}>{province.name}</option>)}</select></Field><Field label="Município"><select value={form.municipalityId ?? ''} onChange={(event) => updateTop('municipalityId', event.target.value || null)}><option value="">Seleccione</option>{selectedProvince?.municipalities.map((municipality) => <option key={municipality.id} value={municipality.id}>{municipality.name}</option>)}</select></Field><Field label="Comuna"><input value={form.commune ?? ''} onChange={(event) => updateTop('commune', event.target.value)} /></Field><Field label="Endereço" full><input value={form.address ?? ''} onChange={(event) => updateTop('address', event.target.value)} /></Field></div><div className="admin-activity-picker"><span className="admin-field-label">Actividades</span><div>{activities.map((activity) => <label className="admin-checkbox" key={activity.id}><input type="checkbox" checked={form.activityIds.includes(activity.id)} onChange={(event) => updateTop('activityIds', event.target.checked ? [...form.activityIds, activity.id] : form.activityIds.filter((id) => id !== activity.id))} />{activity.name}</label>)}</div></div></FormSection>
      <FormSection title="Dados administrativos"><div className="admin-form-grid"><Field label="Tipo"><select value={form.type ?? 'other'} onChange={(event) => updateTop('type', event.target.value as CooperativeInput['type'])}><option value="production">Produção</option><option value="services">Serviços</option><option value="consumption">Consumo</option><option value="credit">Crédito</option><option value="mixed">Mista</option><option value="other">Outro</option></select></Field><Field label="Estado"><select value={form.status} onChange={(event) => updateTop('status', event.target.value as CooperativeInput['status'])}><option value="active">Activa</option><option value="pending_review">Em validação</option><option value="inactive">Inactiva</option></select></Field><Field label="Número de registo"><input value={form.registrationNumber ?? ''} onChange={(event) => updateTop('registrationNumber', event.target.value)} /></Field><Field label="Ano de constituição"><input type="number" min="1900" max="2100" value={form.foundedYear ?? ''} onChange={(event) => updateTop('foundedYear', event.target.value ? Number(event.target.value) : null)} /></Field><Field label="Número de membros"><input type="number" min="0" value={form.memberCount ?? ''} onChange={(event) => updateTop('memberCount', event.target.value ? Number(event.target.value) : null)} /></Field></div></FormSection>
      <FormSection title="Contactos e localização geográfica"><div className="admin-form-grid"><Field label="Email"><input type="email" value={form.contacts?.email ?? ''} onChange={(event) => updateContact('email', event.target.value)} /></Field><Field label="Telefone"><input type="tel" value={form.contacts?.phone ?? ''} onChange={(event) => updateContact('phone', event.target.value)} /></Field><Field label="Website"><input type="url" value={form.contacts?.website ?? ''} onChange={(event) => updateContact('website', event.target.value)} /></Field><Field label="Latitude"><input type="number" step="any" value={form.location?.latitude ?? ''} onChange={(event) => updateLocation('latitude', event.target.value)} /></Field><Field label="Longitude"><input type="number" step="any" value={form.location?.longitude ?? ''} onChange={(event) => updateLocation('longitude', event.target.value)} /></Field></div></FormSection>
    </div>
    <aside className="admin-form-aside"><FormSection title="Identidade visual"><UploadField label="Logótipo" value={logo} onChange={(media) => setLogo(media)} imageOnly accept="image/jpeg,image/png,image/webp,image/svg+xml" maxSizeMb={8} /><UploadField label="Imagem de capa" value={cover} onChange={(media) => setCover(media)} imageOnly accept="image/jpeg,image/png,image/webp" maxSizeMb={12} /></FormSection><FormSection title="Galeria de imagens" description="Até quatro imagens. Os ficheiros são guardados na Media Library.">{Array.from({ length: Math.max(2, gallery.length + 1) }).slice(0, 4).map((_, index) => <UploadField key={index} label={`Imagem ${index + 1}`} value={gallery[index] ?? null} onChange={(media) => setGallery((current) => { const next = [...current]; next[index] = media; return next; })} imageOnly accept="image/jpeg,image/png,image/webp" maxSizeMb={12} />)}</FormSection><FormSection title="Estado"><label className="admin-checkbox"><input type="checkbox" checked={form.status === 'active'} onChange={(event) => updateTop('status', event.target.checked ? 'active' : 'inactive')} /> Publicada e visível no directório</label><p className="admin-form-hint">A validação definitiva de registos é responsabilidade do CNC.</p></FormSection></aside>
    <div className="admin-form-main admin-form-submit-area"><FormFeedback error={error} success={success} /><SaveActions busy={busy} onCancel={() => router.back()} submitLabel={initial ? 'Guardar cooperativa' : 'Criar cooperativa'} /></div>
  </form>;
}

function blankNewsInput(): NewsInput {
  return { slug: '', categoryId: '', translations: { pt: { title: '', summary: '', content: [] }, en: { title: '', summary: '', content: [] } }, imageId: null, galleryIds: [], documentIds: [], relatedArticleIds: [], author: '', status: 'draft', featured: false, publishedAt: null, scheduledAt: null };
}

export function NewsEditor({ initial, categories }: { initial: AdminNewsRecord | null; categories: AdminNewsCategory[] }) {
  const router = useRouter();
  const [form, setForm] = useState<NewsInput>(() => initial ? { slug: initial.slug, categoryId: initial.categoryId, translations: initial.translations, imageId: initial.image?.id ?? initial.imageId ?? null, galleryIds: initial.galleryIds ?? [], documentIds: initial.documentIds ?? [], relatedArticleIds: initial.relatedArticleIds ?? [], author: initial.author, status: initial.status, featured: initial.featured, publishedAt: initial.publishedAt, scheduledAt: initial.scheduledAt } : blankNewsInput());
  const [image, setImage] = useState<Media | null>(initial?.image ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  function update<K extends keyof NewsInput>(key: K, value: NewsInput[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function updateTranslation(locale: 'pt' | 'en', key: 'title' | 'summary', value: string) { setForm((current) => ({ ...current, translations: { ...current.translations, [locale]: { ...current.translations[locale], [key]: value } } })); }
  function updateContent(locale: 'pt' | 'en', content: RichTextBlock[]) { setForm((current) => ({ ...current, translations: { ...current.translations, [locale]: { ...current.translations[locale], content } } })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess('');
    if (!form.translations.pt.title.trim() || !form.translations.en.title.trim()) { setError('O título é obrigatório em Português e English.'); return; }
    if (!form.categoryId) { setError('Seleccione uma categoria.'); return; }
    const payload: NewsInput = { ...form, slug: form.slug.trim() || slugify(form.translations.pt.title), imageId: image?.id ?? null };
    setBusy(true);
    try { if (initial) await updateNews(initial.id, payload); else await createNews(payload); setSuccess('Publicação guardada com sucesso.'); router.replace('/admin/noticias'); router.refresh(); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Não foi possível guardar a publicação.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="admin-form-layout"><div className="admin-form-main"><FormSection title="Título, resumo e conteúdo" description="Estruture o artigo com blocos de texto. Não é aceite HTML arbitrário."><div className="translation-grid">{(['pt', 'en'] as const).map((locale) => <TranslationCard key={locale} locale={locale}><Field label={locale === 'pt' ? 'Título' : 'Title'}><input required value={form.translations[locale].title} onChange={(event) => updateTranslation(locale, 'title', event.target.value)} /></Field><Field label={locale === 'pt' ? 'Resumo' : 'Summary'}><textarea value={form.translations[locale].summary ?? ''} onChange={(event) => updateTranslation(locale, 'summary', event.target.value)} /></Field><Field label={locale === 'pt' ? 'Conteúdo' : 'Content'} full><StructuredContentEditor label={locale === 'pt' ? 'Conteúdo PT' : 'Content EN'} value={form.translations[locale].content} onChange={(blocks) => updateContent(locale, blocks)} /></Field></TranslationCard>)}</div></FormSection><FormSection title="Metadados"><div className="admin-form-grid"><Field label="Slug"><input value={form.slug} onChange={(event) => update('slug', event.target.value)} placeholder="gerado-a-partir-do-titulo" /></Field><Field label="Categoria"><select required value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)}><option value="">Seleccione uma categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.translations.pt.name} / {category.translations.en.name}</option>)}</select></Field><Field label="Autor / entidade"><input value={form.author ?? ''} onChange={(event) => update('author', event.target.value)} /></Field><Field label="Data de publicação"><input type="datetime-local" value={form.publishedAt ? form.publishedAt.slice(0, 16) : ''} onChange={(event) => update('publishedAt', event.target.value ? new Date(event.target.value).toISOString() : null)} /></Field></div></FormSection></div><aside className="admin-form-aside"><FormSection title="Imagem principal"><UploadField label="Imagem de destaque" value={image} onChange={setImage} imageOnly accept="image/jpeg,image/png,image/webp" maxSizeMb={12} /></FormSection><FormSection title="Publicação"><Field label="Estado"><select value={form.status} onChange={(event) => update('status', event.target.value as NewsInput['status'])}><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="scheduled">Agendado</option></select></Field>{form.status === 'scheduled' && <Field label="Agendar para"><input type="datetime-local" value={form.scheduledAt ? form.scheduledAt.slice(0, 16) : ''} onChange={(event) => update('scheduledAt', event.target.value ? new Date(event.target.value).toISOString() : null)} /></Field>}<label className="admin-checkbox"><input type="checkbox" checked={form.featured} onChange={(event) => update('featured', event.target.checked)} /> Destacar na página de actualidade</label></FormSection><FormSection title="Relacionamentos"><p className="admin-form-hint">Galeria, vídeos, documentos relacionados e links são associados pela biblioteca de media e pelo API. Os campos estruturados estão incluídos no contrato de integração.</p></FormSection></aside><div className="admin-form-main admin-form-submit-area"><FormFeedback error={error} success={success} /><SaveActions busy={busy} onCancel={() => router.back()} submitLabel={initial ? 'Guardar publicação' : 'Criar publicação'} /></div></form>;
}

export function DocumentEditor({ initial, categories }: { initial: AdminDocumentRecord | null; categories: AdminDocumentCategory[] }) {
  const router = useRouter();
  const [form, setForm] = useState<DocumentInput>(() => initial ? { slug: initial.slug, categoryId: initial.categoryId, translations: initial.translations, language: initial.language, year: initial.year, mediaId: initial.mediaId, status: initial.status, publishedAt: initial.publishedAt } : { slug: '', categoryId: '', translations: { pt: { title: '', description: '' }, en: { title: '', description: '' } }, language: 'pt', year: new Date().getFullYear(), mediaId: '', status: 'draft', publishedAt: null });
  const [file, setFile] = useState<Media | null>(initial?.media ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  function update<K extends keyof DocumentInput>(key: K, value: DocumentInput[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function updateTranslation(locale: 'pt' | 'en', key: 'title' | 'description', value: string) { setForm((current) => ({ ...current, translations: { ...current.translations, [locale]: { ...current.translations[locale], [key]: value } } })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess('');
    if (!form.translations.pt.title.trim() || !form.translations.en.title.trim()) { setError('O título é obrigatório em Português e English.'); return; }
    if (!file) { setError('Carregue ou seleccione o ficheiro do documento.'); return; }
    if (!form.categoryId) { setError('Seleccione uma categoria.'); return; }
    const payload: DocumentInput = { ...form, slug: form.slug.trim() || slugify(form.translations.pt.title), mediaId: file.id };
    setBusy(true);
    try { if (initial) await updateDocument(initial.id, payload); else await createDocument(payload); setSuccess('Documento guardado com sucesso.'); router.replace('/admin/documentos'); router.refresh(); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Não foi possível guardar o documento.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="admin-form-layout"><div className="admin-form-main"><FormSection title="Informação bilingue"><div className="translation-grid">{(['pt', 'en'] as const).map((locale) => <TranslationCard key={locale} locale={locale}><Field label={locale === 'pt' ? 'Título' : 'Title'}><input required value={form.translations[locale].title} onChange={(event) => updateTranslation(locale, 'title', event.target.value)} /></Field><Field label={locale === 'pt' ? 'Descrição' : 'Description'}><textarea value={form.translations[locale].description ?? ''} onChange={(event) => updateTranslation(locale, 'description', event.target.value)} /></Field></TranslationCard>)}</div></FormSection><FormSection title="Classificação"><div className="admin-form-grid"><Field label="Slug"><input value={form.slug} onChange={(event) => update('slug', event.target.value)} /></Field><Field label="Categoria"><select required value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)}><option value="">Seleccione</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.translations.pt.name} / {category.translations.en.name}</option>)}</select></Field><Field label="Ano"><input type="number" min="1900" max="2100" value={form.year ?? ''} onChange={(event) => update('year', event.target.value ? Number(event.target.value) : null)} /></Field><Field label="Idioma principal"><select value={form.language} onChange={(event) => update('language', event.target.value as 'pt' | 'en')}><option value="pt">Português</option><option value="en">English</option></select></Field></div></FormSection></div><aside className="admin-form-aside"><FormSection title="Ficheiro"><UploadField label="Documento digital" value={file} onChange={setFile} accept=".pdf,.doc,.docx,.xls,.xlsx,.odt,.ods" imageOnly={false} maxSizeMb={50} /></FormSection><FormSection title="Publicação"><Field label="Estado"><select value={form.status} onChange={(event) => update('status', event.target.value as DocumentInput['status'])}><option value="draft">Rascunho</option><option value="published">Publicado</option></select></Field><Field label="Data de publicação"><input type="datetime-local" value={form.publishedAt ? form.publishedAt.slice(0, 16) : ''} onChange={(event) => update('publishedAt', event.target.value ? new Date(event.target.value).toISOString() : null)} /></Field><p className="admin-form-hint">O tamanho e o formato do ficheiro são validados pelo frontend e verificados novamente pela API.</p></FormSection></aside><div className="admin-form-main admin-form-submit-area"><FormFeedback error={error} success={success} /><SaveActions busy={busy} onCancel={() => router.back()} submitLabel={initial ? 'Guardar documento' : 'Adicionar documento'} /></div></form>;
}

export function InstitutionalEditor({ initial }: { initial: InstitutionalSectionInput[] }) {
  const router = useRouter();
  const [sections, setSections] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  function addSection() {
    const order = sections.length + 1;
    setSections((current) => [...current, { key: `section-${order}`, translations: { pt: { title: '', body: '', content: [] }, en: { title: '', body: '', content: [] } }, imageId: null, order, active: true }]);
  }
  function updateSection(index: number, patch: Partial<InstitutionalSectionInput>) { setSections((current) => current.map((section, position) => position === index ? { ...section, ...patch } : section)); }
  function updateSectionText(index: number, locale: 'pt' | 'en', key: 'title' | 'body', value: string) { setSections((current) => current.map((section, position) => position === index ? { ...section, translations: { ...section.translations, [locale]: { ...section.translations[locale], [key]: value } } } : section)); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try { const { updateInstitutional } = await import('@/lib/api/admin'); await updateInstitutional(sections); setSuccess('Conteúdo institucional guardado.'); router.refresh(); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Não foi possível guardar o conteúdo institucional.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="admin-institutional-editor"><div className="admin-form-add-row"><p>As secções públicas são fornecidas pela API e traduzidas separadamente.</p><button type="button" className="admin-button-secondary" onClick={addSection}><Plus size={15} /> Adicionar secção</button></div>{sections.length === 0 ? <div className="admin-inline-state">Ainda não existem secções institucionais. Adicione uma secção para começar.</div> : sections.map((section, index) => <FormSection key={`${section.key}-${index}`} title={`${index + 1}. ${section.key}`} description="Edite o conteúdo PT e EN e ajuste a ordem de publicação."><div className="admin-form-grid"><Field label="Identificador da secção"><input value={section.key} onChange={(event) => updateSection(index, { key: event.target.value })} /></Field><Field label="Ordem"><input type="number" min={1} value={section.order} onChange={(event) => updateSection(index, { order: Number(event.target.value) })} /></Field><div className="translation-grid admin-field--full">{(['pt', 'en'] as const).map((locale) => <TranslationCard key={locale} locale={locale}><Field label={locale === 'pt' ? 'Título' : 'Title'}><input value={section.translations[locale].title} onChange={(event) => updateSectionText(index, locale, 'title', event.target.value)} /></Field><Field label={locale === 'pt' ? 'Texto' : 'Body'}><textarea value={section.translations[locale].body ?? ''} onChange={(event) => updateSectionText(index, locale, 'body', event.target.value)} /></Field></TranslationCard>)}</div><label className="admin-checkbox"><input type="checkbox" checked={section.active} onChange={(event) => updateSection(index, { active: event.target.checked })} /> Publicada no website</label><button className="admin-danger-text" type="button" onClick={() => setSections((current) => current.filter((_, position) => position !== index))}><Trash2 size={14} /> Remover secção</button></div></FormSection>)}<FormFeedback error={error} success={success} /><SaveActions busy={busy} onCancel={() => router.back()} submitLabel="Guardar conteúdo institucional" /></form>;
}
