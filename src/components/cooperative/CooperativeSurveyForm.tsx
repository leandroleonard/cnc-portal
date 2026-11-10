'use client';
/**
 * Ficha Nacional CNC — wizard de cabeçalho + 8 secções.
 * react-hook-form + zod: schema de rascunho (tipos/limites) e schema de submissão (obrigatórios + regras cruzadas,
 * espelho de StoreCooperativeRegistrationRequest). A API continua a ser a autoridade final (422 mapeado nos campos).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight, Crosshair, ImagePlus, Loader2, Save, Send, X } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { createRegistration, listRegistrationMunicipalities, submitRegistration, updateRegistration, uploadRegistrationMedia } from '@/lib/api/registrations';
import { ENUMS, MULTI, type Option } from '@/lib/survey-options';
import { SurveyFieldRenderer } from '@/components/shared/SurveyFieldRenderer';
import { EditingWindowTimer } from './EditingWindowTimer';
import { ProvinceIndicator } from './ProvinceIndicator';
import type { Cooperative, Municipality, Province, RegistrationMedia, RegistrationPayload, User } from '@/types/cnc';

// ---------- Schemas ----------
const str = z.string().trim().max(255).nullable().optional();
const num = (min: number, max: number) => z.number().int().min(min).max(max).nullable().optional();
const arr = z.array(z.string()).default([]);
const en = (k: keyof typeof ENUMS) => z.enum(ENUMS[k].map((o) => o.value) as [string, ...string[]]).nullable().optional();

const draftSchema = z.object({
  name: str,
  municipality_id: z.string().nullable().optional(),
  commune: str,
  neighborhood: str,
  // Campos públicos da cooperativa (Fase 9): Introdução, Endereço, Contactos, Galeria.
  description: z.string().max(5000).nullable().optional(),
  founded_year: num(1800, new Date().getFullYear()),
  member_count: num(0, 10000000),
  address: z.string().max(500).nullable().optional(),
  contact_email: z.string().trim().max(191).nullable().optional(),
  contact_phone: z.string().trim().regex(/^[+0-9 ()-]{0,50}$/, 'Telefone inválido').nullable().optional(),
  contact_website: z.string().trim().max(255).nullable().optional(),
  gallery_media_ids: z.array(z.string()).default([]),
  collection_date: z.string().nullable().optional(),
  sectors: arr,
  main_sector: z.string().nullable().optional(),
  subsector_specialty: str,
  operator_full_name: str,
  operator_known_name: str,
  operator_gender: en('operator_gender'),
  operator_birth_date: z.string().nullable().optional(),
  operator_age: num(10, 120),
  bi_status: en('bi_status'),
  bi_number: z.string().trim().max(20).nullable().optional(),
  phone: z.string().trim().regex(/^[+\d\s-]{0,20}$/, 'Telefone inválido').nullable().optional(),
  marital_status: en('marital_status'),
  residence_province_id: z.string().nullable().optional(),
  residence_municipality_id: z.string().nullable().optional(),
  residence_commune: str,
  residence_neighborhood: str,
  household_members_count: num(1, 50),
  dependents_count: num(0, 50),
  is_main_provider: en('is_main_provider'),
  activity_experience_years: en('activity_experience_years'),
  activity_frequency: en('activity_frequency'),
  daily_hours: num(0, 24),
  location_types: arr,
  main_activity_point: str,
  latitude: z.number().min(-18.1, 'Fora de Angola').max(-4.3, 'Fora de Angola').nullable().optional(),
  longitude: z.number().min(11.6, 'Fora de Angola').max(24.1, 'Fora de Angola').nullable().optional(),
  products_services_description: z.string().max(2000).nullable().optional(),
  main_product_service: str,
  recycling_materials: arr,
  production_quantity: str,
  production_period: en('production_period'),
  measurement_unit: str,
  sales_channels: arr,
  transport_means: arr,
  monthly_income_range: en('monthly_income_range'),
  is_primary_income_source: z.boolean().nullable().optional(),
  organization_type: en('organization_type'),
  organization_name: str,
  members_count: num(1, 100000),
  safety_equipment: arr,
  work_risks: arr,
  priority_needs: arr,
  other_specifications: z.record(z.string(), z.string()).default({}),
  data_treatment_consent: z.boolean().default(false),
  operator_signature_type: en('operator_signature_type'),
  supervisor_name: str,
});
type FormValues = z.input<typeof draftSchema>;
type Key = FieldPath<FormValues>;

const REQUIRED_ON_SUBMIT: Key[] = [
  'collection_date', 'main_sector', 'operator_full_name', 'operator_gender', 'bi_status', 'is_main_provider',
  'activity_experience_years', 'activity_frequency', 'monthly_income_range', 'is_primary_income_source',
  'organization_type', 'operator_signature_type', 'municipality_id',
];

/** Regras de submissão; devolve erros por campo. */
function submitIssues(v: FormValues): Partial<Record<Key, string>> {
  const e: Partial<Record<Key, string>> = {};
  const empty = (x: unknown) => x === null || x === undefined || x === '';
  REQUIRED_ON_SUBMIT.forEach((k) => { if (empty(v[k as keyof FormValues])) e[k] = 'Campo obrigatório.'; });
  if (!v.sectors?.length) e.sectors = 'Assinale pelo menos um sector.';
  if (!v.location_types?.length) e.location_types = 'Assinale pelo menos um local.';
  if (v.main_sector && !v.sectors?.includes(v.main_sector)) e.main_sector = 'O sector principal tem de estar entre os assinalados.';
  if (v.bi_status === 'sim' && empty(v.bi_number)) e.bi_number = 'Indique o número do BI.';
  if (v.organization_type && v.organization_type !== 'individual' && empty(v.organization_name)) e.organization_name = 'Indique o nome da organização.';
  if (v.dependents_count != null && v.household_members_count != null && v.dependents_count > v.household_members_count)
    e.dependents_count = 'Não pode exceder o número de membros do agregado.';
  if ((v.latitude == null) !== (v.longitude == null)) e.latitude = 'Indique latitude e longitude.';
  if (!v.data_treatment_consent) e.data_treatment_consent = 'O consentimento é obrigatório para submeter.';
  return e;
}

// ---------- Secções ----------
const STEPS: { title: string; fields: Key[] }[] = [
  { title: '1. Cabeçalho', fields: ['collection_date', 'municipality_id', 'sectors', 'main_sector', 'subsector_specialty', 'name'] },
  { title: '2. Introdução', fields: ['description', 'founded_year', 'member_count'] },
  { title: '3. Endereço', fields: ['commune', 'neighborhood', 'address'] },
  { title: '4. Contactos', fields: ['contact_email', 'contact_phone', 'contact_website'] },
  { title: '5. Galeria', fields: ['gallery_media_ids'] },
  { title: '6. Identificação', fields: ['operator_full_name', 'operator_known_name', 'operator_gender', 'operator_birth_date', 'operator_age', 'bi_status', 'bi_number', 'phone', 'marital_status'] },
  { title: '7. Residência', fields: ['residence_province_id', 'residence_municipality_id', 'residence_commune', 'residence_neighborhood'] },
  { title: '8. Agregado familiar', fields: ['household_members_count', 'dependents_count', 'is_main_provider'] },
  { title: '9. Actividade', fields: ['activity_experience_years', 'activity_frequency', 'daily_hours', 'location_types', 'main_activity_point', 'latitude', 'longitude'] },
  { title: '10. Produtos e comercialização', fields: ['products_services_description', 'main_product_service', 'recycling_materials', 'production_quantity', 'production_period', 'measurement_unit', 'sales_channels', 'transport_means'] },
  { title: '11. Organização e rendimento', fields: ['monthly_income_range', 'is_primary_income_source', 'organization_type', 'organization_name', 'members_count'] },
  { title: '12. Segurança e necessidades', fields: ['safety_equipment', 'work_risks', 'priority_needs'] },
  { title: '13. Declaração e validação', fields: ['data_treatment_consent', 'operator_signature_type', 'supervisor_name'] },
];

const TOP_LEVEL_KEYS = ['name', 'municipality_id', 'commune', 'neighborhood', 'description', 'founded_year', 'member_count', 'address', 'contact_email', 'contact_phone', 'contact_website', 'gallery_media_ids'];
const SURVEY_KEYS = Object.keys(draftSchema.shape).filter((k) => !TOP_LEVEL_KEYS.includes(k));

function toValues(c?: Cooperative | null): FormValues {
  const s = (c?.survey ?? {}) as Record<string, unknown>;
  const v: Record<string, unknown> = {
    name: c?.name ?? null, municipality_id: c?.municipalityId ?? null, commune: c?.commune ?? null, neighborhood: c?.neighborhood ?? null,
    description: c?.translations?.pt?.description ?? c?.description ?? null,
    founded_year: c?.foundedYear ?? null,
    member_count: c?.memberCount ?? null,
    address: c?.address ?? null,
    contact_email: c?.contacts?.email ?? null,
    contact_phone: c?.contacts?.phone ?? null,
    contact_website: c?.contacts?.website ?? null,
    gallery_media_ids: c?.galleryMediaIds ?? [],
  };
  SURVEY_KEYS.forEach((k) => { v[k] = s[k] ?? null; });
  Object.keys(MULTI).forEach((k) => { v[k] = (s[k] as string[] | undefined) ?? []; });
  v.other_specifications = (s.other_specifications as Record<string, string>) ?? {};
  v.data_treatment_consent = Boolean(s.data_treatment_consent);
  if (!v.collection_date) v.collection_date = new Date().toISOString().slice(0, 10);
  ['latitude', 'longitude'].forEach((k) => { if (v[k] != null) v[k] = Number(v[k]); });
  return v as FormValues;
}

function toPayload(v: FormValues, provinceId: string, submit: boolean): RegistrationPayload {
  const survey: Record<string, unknown> = {};
  SURVEY_KEYS.forEach((k) => { survey[k] = (v as Record<string, unknown>)[k] ?? null; });
  return {
    submit, name: v.name || null, province_id: provinceId, municipality_id: v.municipality_id || null,
    commune: v.commune || null, neighborhood: v.neighborhood || null,
    description: v.description || null,
    founded_year: v.founded_year ?? null,
    member_count: v.member_count ?? null,
    address: v.address || null,
    contact_email: v.contact_email || null,
    contact_phone: v.contact_phone || null,
    contact_website: v.contact_website || null,
    gallery_media_ids: v.gallery_media_ids ?? [],
    survey,
  };
}

// ---------- UI helpers ----------
const inputCls = 'w-full rounded-lg border border-[#d9e1e8] bg-white px-3 py-2 text-sm text-[#0a2942] focus:border-[#2d825c] focus:outline-none focus:ring-2 focus:ring-[#2d825c]/20 disabled:bg-[#f4f7fa]';
function Field({ label, error, required, children, wide }: { label: string; error?: string; required?: boolean; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`admin-field flex flex-col gap-1 ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="text-sm font-semibold text-[#0a2942]">{label}{required && <span className="text-[#b54747]"> *</span>}</span>
      {children}
      {error && <span className="admin-form-error text-xs text-[#b54747]">{error}</span>}
    </label>
  );
}

type Props = {
  user: User;
  provinces: Province[];
  initial?: Cooperative | null;
  onSaved?: (c: Cooperative, submitted: boolean) => void;
  /** Chamado quando o perfil expira (403 profile_expired) — normalmente redirecciona para o login. */
  onSessionEnded?: (code: string) => void;
};

export function CooperativeSurveyForm({ user, provinces, initial, onSaved, onSessionEnded }: Props) {
  const locale = useLocale();
  const L = (o: Option) => (locale === 'en' ? o.en : o.pt);
  const [record, setRecord] = useState<Cooperative | null>(initial ?? null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState<'draft' | 'submit' | null>(null);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [windowExpired, setWindowExpired] = useState(false);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [resMunicipalities, setResMunicipalities] = useState<Municipality[]>([]);
  const [galleryItems, setGalleryItems] = useState<RegistrationMedia[]>(initial?.gallery ?? []);
  const [galleryBusy, setGalleryBusy] = useState(false);

  const isCadastrador = user.role === 'cadastrador';
  const provinceId = isCadastrador ? user.provinceId ?? '' : record?.provinceId ?? user.provinceId ?? provinces[0]?.id ?? '';
  const [adminProvinceId, setAdminProvinceId] = useState(provinceId);
  const effectiveProvinceId = isCadastrador ? provinceId : adminProvinceId;
  const provinceName = provinces.find((p) => p.id === effectiveProvinceId)?.name ?? user.province?.name ?? null;

  const submitted = !!record?.submittedAt;
  const locked = submitted && isCadastrador && (windowExpired || !record?.editingWindow?.isOpen);

  const form = useForm<FormValues>({ resolver: zodResolver(draftSchema), defaultValues: toValues(initial), mode: 'onBlur' });
  const { register, control, watch, setValue, setError, clearErrors, handleSubmit, formState: { errors } } = form;
  const err = (k: Key) => (errors as Record<string, { message?: string }>)[k]?.message;

  const numReg = (k: Key) => register(k, { setValueAs: (x) => (x === '' || x === null ? null : Number(x)) });
  const txtReg = (k: Key) => register(k, { setValueAs: (x) => (x === '' ? null : x) });

  // Municípios dependentes
  useEffect(() => {
    if (!effectiveProvinceId) return;
    listRegistrationMunicipalities(effectiveProvinceId).then(setMunicipalities).catch(() => setMunicipalities([]));
  }, [effectiveProvinceId]);
  const resProvince = watch('residence_province_id');
  useEffect(() => {
    if (!resProvince) { setResMunicipalities([]); return; }
    listRegistrationMunicipalities(resProvince).then(setResMunicipalities).catch(() => setResMunicipalities([]));
  }, [resProvince]);

  const onExpire = useCallback(() => setWindowExpired(true), []);

  const handleApiError = (e: unknown) => {
    if (!(e instanceof ApiError)) return setNotice({ kind: 'error', text: 'Erro inesperado.' });
    const code = e.code ?? '';
    if (['profile_expired', 'account_inactive', 'unauthenticated'].includes(code)) onSessionEnded?.(code);
    if (code === 'editing_window_expired' || code === 'editing_locked') setWindowExpired(true);
    Object.entries(e.fieldErrors ?? {}).forEach(([k, msgs]) => setError(k.replace(/^survey\./, '') as Key, { message: msgs[0] }));
    setNotice({ kind: 'error', text: e.message });
  };

  const goToFirstError = (keys: string[]) => {
    const idx = STEPS.findIndex((s) => s.fields.some((f) => keys.includes(f)));
    if (idx >= 0) setStep(idx);
  };

  const persist = async (values: FormValues, submit: boolean) => {
    setNotice(null);
    if (!effectiveProvinceId) return setNotice({ kind: 'error', text: 'O seu perfil não tem província atribuída. Contacte o administrador.' });
    if (submit) {
      const issues = submitIssues(values);
      const keys = Object.keys(issues);
      if (keys.length) {
        clearErrors();
        keys.forEach((k) => setError(k as Key, { message: issues[k as Key] }));
        goToFirstError(keys);
        return setNotice({ kind: 'error', text: `Existem ${keys.length} campo(s) por corrigir antes de submeter.` });
      }
    }
    setBusy(submit ? 'submit' : 'draft');
    try {
      const payload = toPayload(values, effectiveProvinceId, submit);
      let saved: Cooperative;
      if (!record) saved = await createRegistration(payload);
      else if (submit && !record.submittedAt) {
        await updateRegistration(record.id, { ...payload, submit: false });
        saved = await submitRegistration(record.id);
      } else saved = await updateRegistration(record.id, payload);
      setRecord(saved);
      setWindowExpired(false);
      const wasSubmit = submit || !!saved.submittedAt;
      setNotice({ kind: 'ok', text: submit
        ? `Ficha submetida para revisão (${saved.registrationCode ?? ''}). Pode corrigi-la durante 1 hora.`
        : record?.submittedAt ? 'Alterações guardadas.' : 'Rascunho guardado. Pode submeter mais tarde.' });
      onSaved?.(saved, wasSubmit);
    } catch (e) {
      handleApiError(e);
      if (e instanceof ApiError) goToFirstError(Object.keys(e.fieldErrors ?? {}).map((k) => k.replace(/^survey\./, '')));
    } finally { setBusy(null); }
  };

  const captureGps = () => {
    if (!navigator.geolocation) return setNotice({ kind: 'error', text: 'Geolocalização indisponível neste dispositivo.' });
    navigator.geolocation.getCurrentPosition(
      (p) => { setValue('latitude', Number(p.coords.latitude.toFixed(7)), { shouldValidate: true }); setValue('longitude', Number(p.coords.longitude.toFixed(7)), { shouldValidate: true }); },
      () => setNotice({ kind: 'error', text: 'Não foi possível obter a localização. Autorize o acesso ao GPS.' }),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const addGalleryFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setGalleryBusy(true);
    setNotice(null);
    try {
      for (const file of Array.from(files)) {
        if ((form.getValues('gallery_media_ids') ?? []).length >= 20) {
          setNotice({ kind: 'error', text: 'A galeria permite no máximo 20 imagens.' });
          break;
        }
        const media = await uploadRegistrationMedia(file);
        setGalleryItems((prev) => [...prev, media]);
        setValue('gallery_media_ids', [...(form.getValues('gallery_media_ids') ?? []), media.id]);
      }
    } catch (e) {
      handleApiError(e);
    } finally {
      setGalleryBusy(false);
    }
  };

  const removeGalleryItem = (id: string) => {
    setGalleryItems((prev) => prev.filter((m) => m.id !== id));
    setValue('gallery_media_ids', (form.getValues('gallery_media_ids') ?? []).filter((x) => x !== id));
  };

  const select = (k: keyof typeof ENUMS, labelText: string, required = false) => (
    <Field label={labelText} error={err(k as Key)} required={required}>
      <select className={inputCls} {...txtReg(k as Key)}>
        <option value="">— Seleccione —</option>
        {ENUMS[k].map((o) => <option key={o.value} value={o.value}>{L(o)}</option>)}
      </select>
    </Field>
  );
  const radios = (k: keyof typeof ENUMS, labelText: string, required = false) => {
    const selected = watch(k as Key);
    return (
      <Field label={labelText} error={err(k as Key)} required={required} wide>
        <div className="survey-option-grid">
          {ENUMS[k].map((o) => (
            <label key={o.value} className={`survey-option survey-radio-option ${selected === o.value ? 'survey-option--checked' : ''}`}>
              <input type="radio" value={o.value} checked={selected === o.value} {...register(k as Key)} /> {L(o)}
            </label>
          ))}
        </div>
      </Field>
    );
  };
  const multi = (k: keyof typeof MULTI, legend: string, exclusive?: string) => (
    <div className="sm:col-span-2">
      <Controller control={control} name={k as Key} render={({ field }) => (
        <SurveyFieldRenderer name={k} legend={legend} options={MULTI[k]} value={field.value as string[]} onChange={field.onChange}
          exclusive={exclusive} error={err(k as Key)}
          otherValue={watch('other_specifications')?.[k] ?? ''}
          onOtherChange={(txt) => setValue('other_specifications', { ...(watch('other_specifications') ?? {}), [k]: txt })} />
      )} />
    </div>
  );

  const sectors = watch('sectors') ?? [];
  const biStatus = watch('bi_status');
  const orgType = watch('organization_type');
  const lat = watch('latitude'), lng = watch('longitude');

  const sections = useMemo(() => [
    // Cabeçalho
    <>
      <Field label="Código" wide><input className={inputCls} disabled value={record?.registrationCode ?? 'Gerado automaticamente na submissão'} /></Field>
      <Field label="Data da recolha" error={err('collection_date')} required><input type="date" className={inputCls} {...txtReg('collection_date')} /></Field>
      <Field label="Província" required>
        {isCadastrador ? <ProvinceIndicator name={provinceName} locked /> : (
          <select className={inputCls} value={adminProvinceId} onChange={(e) => { setAdminProvinceId(e.target.value); setValue('municipality_id', null); }} disabled={!!record}>
            {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </Field>
      <Field label="Município" error={err('municipality_id')} required>
        <select className={inputCls} {...txtReg('municipality_id')}>
          <option value="">— Seleccione —</option>
          {municipalities.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </Field>
      {multi('sectors', 'Sector(es) de actividade *')}
      <Field label="Sector principal" error={err('main_sector')} required>
        <select className={inputCls} {...txtReg('main_sector')}>
          <option value="">— Seleccione entre os assinalados —</option>
          {MULTI.sectors.filter((o) => sectors.includes(o.value)).map((o) => <option key={o.value} value={o.value}>{L(o)}</option>)}
        </select>
      </Field>
      <Field label="Subsector / especialidade" error={err('subsector_specialty')}><input className={inputCls} {...txtReg('subsector_specialty')} /></Field>
      <Field label="Designação do registo (opcional)" error={err('name')} wide><input className={inputCls} placeholder="Por omissão: nome da organização ou do operador" {...txtReg('name')} /></Field>
    </>,
    // Introdução (campos públicos da cooperativa)
    <>
      <Field label="Descrição" error={err('description')} wide>
        <textarea rows={5} className={inputCls} placeholder="Descreva a actividade, os objectivos e os principais produtos ou serviços da cooperativa…" {...txtReg('description')} />
      </Field>
      <Field label="Ano de constituição" error={err('founded_year')}><input type="number" min={1800} max={new Date().getFullYear()} className={inputCls} placeholder="Ex.: 2015" {...numReg('founded_year')} /></Field>
      <Field label="Número de membros" error={err('member_count')}><input type="number" min={0} className={inputCls} placeholder="Ex.: 27" {...numReg('member_count')} /></Field>
    </>,
    // Endereço da cooperativa
    <>
      <Field label="Comuna" error={err('commune')}><input className={inputCls} {...txtReg('commune')} /></Field>
      <Field label="Bairro" error={err('neighborhood')}><input className={inputCls} {...txtReg('neighborhood')} /></Field>
      <Field label="Endereço completo" error={err('address')} wide><textarea rows={2} className={inputCls} placeholder="Rua, número, ponto de referência…" {...txtReg('address')} /></Field>
    </>,
    // Contactos da cooperativa
    <>
      <Field label="Email de contacto" error={err('contact_email')}><input type="email" className={inputCls} placeholder="geral@cooperativa.co.ao" {...txtReg('contact_email')} /></Field>
      <Field label="Telefone de contacto" error={err('contact_phone')}><input className={inputCls} inputMode="tel" placeholder="+244 9XX XXX XXX" {...txtReg('contact_phone')} /></Field>
      <Field label="Website (opcional)" error={err('contact_website')} wide><input className={inputCls} placeholder="https://…" {...txtReg('contact_website')} /></Field>
    </>,
    // Galeria (opcional)
    <>
      <div className="sm:col-span-2">
        <span className="mb-1 block text-sm font-semibold text-[#0a2942]">Imagens da galeria (opcional)</span>
        <p className="mb-3 text-xs text-[#657480]">Fotografias da cooperativa, dos membros ou da actividade. Máximo de 20 imagens (JPG, PNG, WebP, GIF ou SVG).</p>
        <div className="flex flex-wrap gap-3">
          {galleryItems.map((m) => (
            <div key={m.id} className="relative h-24 w-24 overflow-hidden rounded-lg border border-[#d9e1e8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.thumbnailUrl ?? m.url} alt={m.altText ?? m.filename} className="h-full w-full object-cover" />
              <button type="button" aria-label={`Remover ${m.filename}`} onClick={() => removeGalleryItem(m.id)}
                className="absolute right-1 top-1 rounded-full bg-[#0a2942]/80 p-1 text-white hover:bg-[#b54747]"><X size={12} /></button>
            </div>
          ))}
          <label className={`gallery-upload ${galleryBusy ? 'gallery-upload--busy' : ''}`}>
            {galleryBusy ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            {galleryBusy ? 'A carregar…' : 'Adicionar'}
            <input type="file" accept="image/*" multiple className="hidden" disabled={galleryBusy || locked} onChange={(e) => { void addGalleryFiles(e.target.files); e.target.value = ''; }} style={{display: 'none'}} />
          </label>
        </div>
        {err('gallery_media_ids') && <span className="admin-form-error text-xs text-[#b54747]">{err('gallery_media_ids')}</span>}
      </div>
    </>,
    // 1
    <>
      <Field label="Nome completo" error={err('operator_full_name')} required wide><input className={inputCls} {...txtReg('operator_full_name')} /></Field>
      <Field label="Nome pelo qual é conhecido(a)" error={err('operator_known_name')}><input className={inputCls} {...txtReg('operator_known_name')} /></Field>
      <Field label="Telefone" error={err('phone')}><input className={inputCls} inputMode="tel" placeholder="+244 9XX XXX XXX" {...txtReg('phone')} /></Field>
      {radios('operator_gender', 'Sexo', true)}
      <Field label="Data de nascimento" error={err('operator_birth_date')}><input type="date" className={inputCls} {...txtReg('operator_birth_date')} /></Field>
      <Field label="Idade" error={err('operator_age')}><input type="number" min={10} max={120} className={inputCls} {...numReg('operator_age')} /></Field>
      {radios('bi_status', 'Possui Bilhete de Identidade?', true)}
      {biStatus === 'sim' && <Field label="N.º do BI" error={err('bi_number')} required><input className={inputCls} {...txtReg('bi_number')} /></Field>}
      {select('marital_status', 'Estado civil')}
    </>,
    // 2
    <>
      <Field label="Província de residência" error={err('residence_province_id')}>
        <select className={inputCls} {...register('residence_province_id', { setValueAs: (x) => x || null, onChange: () => setValue('residence_municipality_id', null) })}>
          <option value="">— Seleccione —</option>
          {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>
      <Field label="Município de residência" error={err('residence_municipality_id')}>
        <select className={inputCls} {...txtReg('residence_municipality_id')} disabled={!resProvince}>
          <option value="">— Seleccione —</option>
          {resMunicipalities.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </Field>
      <Field label="Comuna" error={err('residence_commune')}><input className={inputCls} {...txtReg('residence_commune')} /></Field>
      <Field label="Bairro" error={err('residence_neighborhood')}><input className={inputCls} {...txtReg('residence_neighborhood')} /></Field>
    </>,
    // 3
    <>
      <Field label="N.º de membros do agregado" error={err('household_members_count')}><input type="number" min={1} className={inputCls} {...numReg('household_members_count')} /></Field>
      <Field label="N.º de dependentes" error={err('dependents_count')}><input type="number" min={0} className={inputCls} {...numReg('dependents_count')} /></Field>
      {radios('is_main_provider', 'É o principal sustento da família?', true)}
    </>,
    // 4
    <>
      {select('activity_experience_years', 'Tempo de experiência na actividade', true)}
      {select('activity_frequency', 'Frequência da actividade', true)}
      <Field label="Horas de trabalho por dia" error={err('daily_hours')}><input type="number" min={0} max={24} className={inputCls} {...numReg('daily_hours')} /></Field>
      <Field label="Ponto principal de actividade" error={err('main_activity_point')}><input className={inputCls} {...txtReg('main_activity_point')} /></Field>
      {multi('location_types', 'Locais onde exerce a actividade *')}
      <Field label="Latitude" error={err('latitude')}><input type="number" step="0.0000001" className={inputCls} {...numReg('latitude')} /></Field>
      <Field label="Longitude" error={err('longitude')}><input type="number" step="0.0000001" className={inputCls} {...numReg('longitude')} /></Field>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="button" className="admin-button-secondary inline-flex items-center gap-2" onClick={captureGps}><Crosshair size={16} /> Capturar GPS</button>
        {lat != null && lng != null && <a className="text-sm font-semibold text-[#236b4b] underline" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}>Ver no mapa</a>}
      </div>
    </>,
    // 5
    <>
      <Field label="Descrição dos produtos / serviços" error={err('products_services_description')} wide><textarea rows={3} className={inputCls} {...txtReg('products_services_description')} /></Field>
      <Field label="Produto / serviço principal" error={err('main_product_service')}><input className={inputCls} {...txtReg('main_product_service')} /></Field>
      {multi('recycling_materials', 'Materiais recolhidos / reciclados')}
      <Field label="Quantidade produzida / recolhida" error={err('production_quantity')}><input className={inputCls} {...txtReg('production_quantity')} /></Field>
      <Field label="Unidade de medida" error={err('measurement_unit')}><input className={inputCls} placeholder="kg, sacos, caixas…" {...txtReg('measurement_unit')} /></Field>
      {radios('production_period', 'Período')}
      {multi('sales_channels', 'Canais de venda')}
      {multi('transport_means', 'Meios de transporte')}
    </>,
    // 6
    <>
      {select('monthly_income_range', 'Rendimento mensal', true)}
      <Field label="É a principal fonte de rendimento?" error={err('is_primary_income_source')} required>
        <Controller control={control} name="is_primary_income_source" render={({ field }) => (
          <div className="survey-option-grid">
            {[{ v: true, t: 'Sim' }, { v: false, t: 'Não' }].map((o) => (
              <label key={String(o.v)} className={`survey-option survey-radio-option ${field.value === o.v ? 'survey-option--checked' : ''}`}>
                <input type="radio" checked={field.value === o.v} onChange={() => field.onChange(o.v)} /> {o.t}
              </label>
            ))}
          </div>
        )} />
      </Field>
      {radios('organization_type', 'Forma de organização', true)}
      {orgType && orgType !== 'individual' && (
        <>
          <Field label="Nome da organização" error={err('organization_name')} required><input className={inputCls} {...txtReg('organization_name')} /></Field>
          <Field label="N.º de membros" error={err('members_count')}><input type="number" min={1} className={inputCls} {...numReg('members_count')} /></Field>
        </>
      )}
    </>,
    // 7
    <>
      {multi('safety_equipment', 'Equipamento de protecção (EPI) utilizado', 'nenhum')}
      {multi('work_risks', 'Riscos no trabalho')}
      {multi('priority_needs', 'Necessidades prioritárias')}
    </>,
    // 8
    <>
      <div className="sm:col-span-2 rounded-lg border border-[#c99a40] bg-[#f6ecd8] p-4 text-sm text-[#0a2942]">
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 accent-[#236b4b]" {...register('data_treatment_consent')} />
          <span>Declaro que as informações prestadas são verdadeiras e autorizo o CNC a tratar os meus dados pessoais para fins de cadastro, estatística e apoio às cooperativas, nos termos da Lei n.º 22/11 de Protecção de Dados Pessoais.</span>
        </label>
        {err('data_treatment_consent') && <p className="mt-2 text-xs text-[#b54747]">{err('data_treatment_consent')}</p>}
      </div>
      {radios('operator_signature_type', 'Forma de assinatura do operador', true)}
      <Field label="Nome do cadastrador / supervisor" error={err('supervisor_name')}><input className={inputCls} placeholder={user.name} {...txtReg('supervisor_name')} /></Field>
    </>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [errors, municipalities, resMunicipalities, sectors.join(), biStatus, orgType, lat, lng, adminProvinceId, provinces, record, locale, resProvince, galleryItems, galleryBusy, locked]);

  const stepHasError = (i: number) => STEPS[i].fields.some((f) => err(f));
  const last = STEPS.length - 1;

  return (
    <form className="admin-panel flex flex-col gap-6" onSubmit={handleSubmit((v) => persist(v, true))} noValidate>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="admin-eyebrow">Ficha Nacional CNC</p>
          <h2 className="text-xl font-bold text-[#0a2942]">{record?.registrationCode ?? (record ? 'Rascunho' : 'Novo cadastro')}</h2>
          {record?.status === 'rejected' && record.rejectionReason && <p className="mt-1 text-sm text-[#b54747]">Rejeitado: {record.rejectionReason}</p>}
          {record?.correctionRequest && <p className="mt-1 text-sm text-[#8a6420]">Pedido de correcção: {record.correctionRequest}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <ProvinceIndicator name={provinceName} locked={isCadastrador} />
          {submitted && <EditingWindowTimer window={record?.editingWindow} onExpire={onExpire} />}
        </div>
      </header>

      <nav aria-label="Secções" className="survey-step-nav">
        {STEPS.map((s, i) => (
          <button key={s.title} type="button" onClick={() => setStep(i)}
            className={`step-button ${i === step ? 'step-button-active' : ''} ${stepHasError(i) ? 'step-button-error' : ''}`}>
            {s.title}
          </button>
        ))}
      </nav>
      <div className="h-1 w-full overflow-hidden rounded bg-[#e7edf2]"><div className="h-full bg-[#2d825c] transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>

      {locked && (
        <div role="alert" className="rounded-lg border border-[#b54747] bg-[#fbeaea] p-3 text-sm text-[#b54747]">
          A janela de 1 hora para edição terminou. A ficha está em leitura; peça ao administrador para reabrir a edição se precisar de corrigir.
        </div>
      )}

      <fieldset disabled={locked || !!busy} className="admin-form-section">
        <h3 className="mb-4 text-lg font-bold text-[#0a2942]">{STEPS[step].title}</h3>
        <div className="admin-form-grid grid grid-cols-1 gap-4 sm:grid-cols-2">{sections[step]}</div>
      </fieldset>

      {notice && <p role="status" className={notice.kind === 'ok' ? 'admin-form-success text-sm text-[#236b4b]' : 'admin-form-error text-sm text-[#b54747]'}>{notice.text}</p>}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e7edf2] pt-4">
        <div style={{marginBottom: '.75rem', gap: 10, display: 'flex'}}>
          <button type="button" className="admin-button-secondary" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ChevronLeft size={16} /> Anterior</button>
          <button type="button" className="admin-button-secondary" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} disabled={step === last} onClick={() => setStep((s) => s + 1)}>Seguinte <ChevronRight size={16} /></button>
        </div>
        {!locked && (
          <div style={{marginBottom: '.75rem', gap: 10, display: 'flex'}}>
            {!submitted && (
              <button type="button" className="admin-button-secondary inline-flex items-center gap-2" disabled={!!busy}
                onClick={handleSubmit((v) => persist(v, false), () => setNotice({ kind: 'error', text: 'Corrija os campos assinalados para guardar.' }))}>
                <Save size={16} /> {busy === 'draft' ? 'A guardar…' : 'Guardar rascunho'}
              </button>
            )}
            <button type="submit" className="button button--primary inline-flex items-center gap-2" disabled={!!busy}>
              <Send size={16} /> {busy === 'submit' ? 'A submeter…' : submitted ? 'Guardar correcções' : 'Submeter para revisão'}
            </button>
          </div>
        )}
      </footer>
    </form>
  );
}

export default CooperativeSurveyForm;