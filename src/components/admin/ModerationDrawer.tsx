'use client';
import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';
import { CheckCircle2, RotateCcw, X, XCircle } from 'lucide-react';
import { ENUMS, MULTI, label } from '@/lib/survey-options';
import { SurveyFieldRenderer } from '@/components/shared/SurveyFieldRenderer';
import { EditingWindowTimer } from '@/components/cooperative/EditingWindowTimer';
import type { Cooperative, CooperativeSurveyData } from '@/types/cnc';
import type { ReviewAction } from './ReviewModal';

const LocationMap = dynamic(() => import('./LocationMap'), { ssr: false, loading: () => <div className="h-[260px] animate-pulse rounded-xl bg-[#e7edf2]" /> });

const STATUS: Record<string, { t: string; cls: string }> = {
  pending_review: { t: 'Pendente', cls: 'admin-tag admin-tag--gold' },
  active: { t: 'Aprovado', cls: 'admin-tag admin-tag--green' },
  rejected: { t: 'Rejeitado', cls: 'admin-tag bg-[#fbeaea] text-[#b54747]' },
  inactive: { t: 'Inactivo', cls: 'admin-tag' },
};
export const StatusTag = ({ status }: { status: string }) => <span className={STATUS[status]?.cls ?? 'admin-tag'}>{STATUS[status]?.t ?? status}</span>;
const dt = (v?: string | null) => (v ? new Date(v).toLocaleString('pt-AO', { dateStyle: 'short', timeStyle: 'short' }) : '—');

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex flex-col"><dt className="text-xs font-bold uppercase tracking-wide text-[#5b6b7a]">{k}</dt><dd className="text-sm text-[#0a2942]">{v ?? '—'}</dd></div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-t border-[#e7edf2] pt-4"><h4 className="mb-3 text-sm font-bold text-[#236b4b]">{title}</h4><dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</dl></section>;
}

/** Drawer lateral com a ficha completa, mapa GPS e acções de moderação. */
export function ModerationDrawer({ record, loading, onClose, onAction }: {
  record: Cooperative | null; loading?: boolean; onClose: () => void; onAction: (a: ReviewAction) => void;
}) {
  const locale = useLocale();
  if (!record && !loading) return null;
  const s = (record?.survey ?? {}) as Partial<CooperativeSurveyData>;
  const e = (k: keyof typeof ENUMS) => label(ENUMS[k], s[k as keyof CooperativeSurveyData], locale);
  const m = (k: keyof typeof MULTI, t: string) => (
    <div className="sm:col-span-2"><SurveyFieldRenderer readOnly name={k} legend={t} options={MULTI[k]} value={s[k] as string[]} otherValue={s.other_specifications?.[k]} /></div>
  );
  const lat = s.latitude != null ? Number(s.latitude) : null, lng = s.longitude != null ? Number(s.longitude) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#071b2d]/40" onClick={onClose}>
      <aside className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl" onClick={(ev) => ev.stopPropagation()} aria-label="Ficha do cadastro">
        <header className="flex items-start justify-between gap-3 bg-[#0a2942] p-5 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#c99a40]">Ficha Nacional CNC</p>
            <h3 className="text-lg font-bold">{record?.registrationCode ?? 'A carregar…'}</h3>
            {record && <p className="text-sm text-white/80">{record.name} · {record.province?.name}</p>}
          </div>
          <button type="button" aria-label="Fechar" onClick={onClose}><X /></button>
        </header>

        {loading || !record ? <div className="p-6 text-sm text-[#5b6b7a]">A carregar ficha…</div> : (
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusTag status={record.status} />
              <span className="text-xs text-[#5b6b7a]">Submetido {dt(record.submittedAt)} por {record.createdBy?.name ?? '—'}</span>
              {record.editingWindow?.isOpen && <EditingWindowTimer window={record.editingWindow} compact />}
            </div>
            {record.rejectionReason && <p className="rounded-lg bg-[#fbeaea] p-3 text-sm text-[#b54747]">Motivo da rejeição: {record.rejectionReason}</p>}

            <Section title="Cabeçalho">
              <Row k="Data da recolha" v={s.collection_date} /><Row k="Província" v={record.province?.name} />
              <Row k="Município" v={record.municipality?.name} /><Row k="Comuna / Bairro" v={[record.commune, record.neighborhood].filter(Boolean).join(' / ') || '—'} />
              <Row k="Sector principal" v={label(MULTI.sectors, s.main_sector, locale)} /><Row k="Subsector" v={s.subsector_specialty} />
              {m('sectors', 'Sectores')}
            </Section>
            <Section title="1. Identificação">
              <Row k="Nome completo" v={s.operator_full_name} /><Row k="Conhecido(a) por" v={s.operator_known_name} />
              <Row k="Sexo" v={e('operator_gender')} /><Row k="Nascimento / Idade" v={`${s.operator_birth_date ?? '—'} / ${s.operator_age ?? '—'}`} />
              <Row k="BI" v={`${e('bi_status')}${s.bi_number ? ` · ${s.bi_number}` : ''}`} /><Row k="Telefone" v={s.phone} />
              <Row k="Estado civil" v={e('marital_status')} />
            </Section>
            <Section title="2. Residência">
              <Row k="Comuna" v={s.residence_commune} /><Row k="Bairro" v={s.residence_neighborhood} />
            </Section>
            <Section title="3. Agregado familiar">
              <Row k="Membros" v={s.household_members_count} /><Row k="Dependentes" v={s.dependents_count} /><Row k="Principal sustento" v={e('is_main_provider')} />
            </Section>
            <Section title="4. Actividade">
              <Row k="Experiência" v={e('activity_experience_years')} /><Row k="Frequência" v={e('activity_frequency')} />
              <Row k="Horas/dia" v={s.daily_hours} /><Row k="Ponto principal" v={s.main_activity_point} />
              {m('location_types', 'Locais')}
              <div className="sm:col-span-2">
                {lat != null && lng != null ? (
                  <>
                    <LocationMap lat={lat} lng={lng} label={s.operator_full_name ?? record.name} />
                    <p className="mt-1 text-xs text-[#5b6b7a]">GPS: {lat}, {lng} · <a className="underline" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}>abrir no OpenStreetMap</a></p>
                  </>
                ) : <p className="text-sm text-[#8a96a3]">Sem coordenadas GPS registadas.</p>}
              </div>
            </Section>
            <Section title="5. Produtos e comercialização">
              <Row k="Descrição" v={s.products_services_description} /><Row k="Principal" v={s.main_product_service} />
              <Row k="Quantidade" v={[s.production_quantity, s.measurement_unit, s.production_period && e('production_period')].filter(Boolean).join(' ') || '—'} />
              {m('recycling_materials', 'Materiais')}{m('sales_channels', 'Canais de venda')}{m('transport_means', 'Transporte')}
            </Section>
            <Section title="6. Organização e rendimento">
              <Row k="Rendimento mensal" v={e('monthly_income_range')} /><Row k="Fonte principal" v={s.is_primary_income_source == null ? '—' : s.is_primary_income_source ? 'Sim' : 'Não'} />
              <Row k="Organização" v={e('organization_type')} /><Row k="Nome / membros" v={`${s.organization_name ?? '—'} / ${s.members_count ?? '—'}`} />
            </Section>
            <Section title="7. Segurança e necessidades">
              {m('safety_equipment', 'EPI')}{m('work_risks', 'Riscos')}{m('priority_needs', 'Necessidades prioritárias')}
            </Section>
            <Section title="8. Declaração e validação">
              <Row k="Consentimento" v={s.data_treatment_consent ? 'Aceite' : 'Não aceite'} /><Row k="Assinatura" v={e('operator_signature_type')} />
              <Row k="Supervisor" v={s.supervisor_name} /><Row k="Validação" v={s.validation_status} />
            </Section>
          </div>
        )}

        {record && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-[#e7edf2] p-4">
            {!record.isDraft && <button type="button" className="admin-button-secondary inline-flex items-center gap-1" onClick={() => onAction('reopen')}><RotateCcw size={16} /> Reabrir edição</button>}
            {record.status === 'pending_review' && <button type="button" className="button inline-flex items-center gap-1 !bg-[#b54747] text-white" onClick={() => onAction('reject')}><XCircle size={16} /> Rejeitar</button>}
            {record.status === 'pending_review' && <button type="button" className="button button--primary inline-flex items-center gap-1" onClick={() => onAction('approve')}><CheckCircle2 size={16} /> Aprovar</button>}
          </footer>
        )}
      </aside>
    </div>
  );
}

export default ModerationDrawer;