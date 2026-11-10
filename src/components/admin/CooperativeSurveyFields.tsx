'use client';

/**
 * Campos da Ficha Nacional CNC no editor unificado de cooperativas do admin.
 * Componente controlado, sem dependência de next-intl (o painel admin é PT).
 * Espelha as colunas de cooperative_survey_data e as opções de SurveyOptions.php.
 */
import { useEffect, useState } from 'react';
import type { CooperativeSurveyData, Municipality } from '@/types/cnc';
import { ENUMS, MULTI, type MultiField, type Option } from '@/lib/survey-options';
import { listRegistrationMunicipalities } from '@/lib/api/registrations';

type Survey = Partial<CooperativeSurveyData>;
type ProvinceOption = { id: string; name: string; municipalities?: Array<{ id: string; name: string }> };

const inputCls = '';

function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={`admin-field ${full ? 'admin-field--full' : ''}`}><span>{label}</span>{children}</label>;
}

function enumSelect(key: keyof typeof ENUMS, value: string | null | undefined, onChange: (v: string | null) => void, label: string) {
  return <Field label={label}><select className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
    <option value="">— Seleccione —</option>
    {ENUMS[key].map((o: Option) => <option key={o.value} value={o.value}>{o.pt}</option>)}
  </select></Field>;
}

export function CooperativeSurveyFields({ value, onChange, provinces }: { value: Survey; onChange: (next: Survey) => void; provinces: ProvinceOption[] }) {
  const set = <K extends keyof CooperativeSurveyData>(key: K, v: CooperativeSurveyData[K] | null) => onChange({ ...value, [key]: v });
  const txt = (key: keyof CooperativeSurveyData) => (value[key] as string | null) ?? '';
  const num = (key: keyof CooperativeSurveyData) => (value[key] as number | null) ?? '';

  // Municípios de residência: usa os já carregados com as província; só consulta a API quando faltam.
  const resProvinceId = value.residence_province_id ?? '';
  const localRes = provinces.find((p) => p.id === resProvinceId)?.municipalities;
  const [fetchedRes, setFetchedRes] = useState<{ provinceId: string; items: Municipality[] } | null>(null);
  useEffect(() => {
    if (!resProvinceId || localRes?.length) return;
    let active = true;
    listRegistrationMunicipalities(resProvinceId)
      .then((items) => { if (active) setFetchedRes({ provinceId: resProvinceId, items }); })
      .catch(() => { if (active) setFetchedRes({ provinceId: resProvinceId, items: [] }); });
    return () => { active = false; };
  }, [resProvinceId, localRes?.length]);
  const resMunicipalities: Municipality[] = localRes?.length
    ? localRes.map((m) => ({ id: m.id, provinceId: resProvinceId, slug: '', name: m.name }))
    : (fetchedRes?.provinceId === resProvinceId ? fetchedRes.items : []);

  const multi = (key: MultiField, legend: string, exclusive?: string) => {
    const selected = (value[key] as string[] | null) ?? [];
    const toggle = (v: string) => {
      let next: string[];
      if (selected.includes(v)) next = selected.filter((x) => x !== v);
      else if (exclusive && v === exclusive) next = [v];
      else next = [...selected.filter((x) => x !== exclusive), v];
      set(key, next as CooperativeSurveyData[typeof key]);
    };
    const hasOther = selected.some((v) => v === 'outro' || v === 'outra');
    const other = value.other_specifications?.[key] ?? '';
    return <div className="admin-field admin-field--full">
      <span className="admin-field-label">{legend}</span>
      <div className="admin-activity-picker"><div>
        {MULTI[key].map((o) => <label className="admin-checkbox" key={o.value}>
          <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />{o.pt}
        </label>)}
      </div></div>
      {hasOther && <input className="admin-field" placeholder='Especifique "outro"' value={other} maxLength={150}
        onChange={(e) => onChange({ ...value, other_specifications: { ...(value.other_specifications ?? {}), [key]: e.target.value } })} />}
    </div>;
  };

  const sectors = (value.sectors as string[] | null) ?? [];

  return <>
    <div className="admin-form-section"><header><div><h2>Ficha Nacional — dados do operador</h2><p>Campos do cadastro nacional, sincronizados com a ficha do cadastrador.</p></div></header>
      <div className="admin-form-grid">
        <Field label="Data da recolha"><input type="date" value={txt('collection_date')} onChange={(e) => set('collection_date', e.target.value || null)} /></Field>
        <Field label="Subsector / especialidade"><input value={txt('subsector_specialty')} onChange={(e) => set('subsector_specialty', e.target.value || null)} /></Field>
        {multi('sectors', 'Sector(es) de actividade')}
        <Field label="Sector principal"><select value={value.main_sector ?? ''} onChange={(e) => set('main_sector', e.target.value || null)}>
          <option value="">— Seleccione entre os assinalados —</option>
          {MULTI.sectors.filter((o) => sectors.includes(o.value)).map((o) => <option key={o.value} value={o.value}>{o.pt}</option>)}
        </select></Field>
        <Field label="Nome completo do operador" full><input value={txt('operator_full_name')} onChange={(e) => set('operator_full_name', e.target.value || null)} /></Field>
        <Field label="Nome pelo qual é conhecido(a)"><input value={txt('operator_known_name')} onChange={(e) => set('operator_known_name', e.target.value || null)} /></Field>
        <Field label="Telefone"><input inputMode="tel" value={txt('phone')} onChange={(e) => set('phone', e.target.value || null)} /></Field>
        {enumSelect('operator_gender', value.operator_gender, (v) => set('operator_gender', v as CooperativeSurveyData['operator_gender']), 'Sexo')}
        {enumSelect('marital_status', value.marital_status, (v) => set('marital_status', v as CooperativeSurveyData['marital_status']), 'Estado civil')}
        <Field label="Data de nascimento"><input type="date" value={txt('operator_birth_date')} onChange={(e) => set('operator_birth_date', e.target.value || null)} /></Field>
        <Field label="Idade"><input type="number" min={10} max={120} value={num('operator_age')} onChange={(e) => set('operator_age', e.target.value === '' ? null : Number(e.target.value))} /></Field>
        {enumSelect('bi_status', value.bi_status, (v) => set('bi_status', v as CooperativeSurveyData['bi_status']), 'Possui Bilhete de Identidade?')}
        {value.bi_status === 'sim' && <Field label="N.º do BI"><input value={txt('bi_number')} onChange={(e) => set('bi_number', e.target.value || null)} /></Field>}
      </div>
    </div>

    <div className="admin-form-section"><header><div><h2>Residência e agregado familiar</h2></div></header>
      <div className="admin-form-grid">
        <Field label="Província de residência"><select value={value.residence_province_id ?? ''} onChange={(e) => onChange({ ...value, residence_province_id: e.target.value || null, residence_municipality_id: null })}>
          <option value="">— Seleccione —</option>
          {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select></Field>
        <Field label="Município de residência"><select value={value.residence_municipality_id ?? ''} disabled={!value.residence_province_id} onChange={(e) => set('residence_municipality_id', e.target.value || null)}>
          <option value="">— Seleccione —</option>
          {resMunicipalities.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select></Field>
        <Field label="Comuna de residência"><input value={txt('residence_commune')} onChange={(e) => set('residence_commune', e.target.value || null)} /></Field>
        <Field label="Bairro de residência"><input value={txt('residence_neighborhood')} onChange={(e) => set('residence_neighborhood', e.target.value || null)} /></Field>
        <Field label="N.º de membros do agregado"><input type="number" min={0} value={num('household_members_count')} onChange={(e) => set('household_members_count', e.target.value === '' ? null : Number(e.target.value))} /></Field>
        <Field label="N.º de dependentes"><input type="number" min={0} value={num('dependents_count')} onChange={(e) => set('dependents_count', e.target.value === '' ? null : Number(e.target.value))} /></Field>
        {enumSelect('is_main_provider', value.is_main_provider, (v) => set('is_main_provider', v as CooperativeSurveyData['is_main_provider']), 'É o principal sustento da família?')}
      </div>
    </div>

    <div className="admin-form-section"><header><div><h2>Actividade e localização</h2></div></header>
      <div className="admin-form-grid">
        {enumSelect('activity_experience_years', value.activity_experience_years, (v) => set('activity_experience_years', v as CooperativeSurveyData['activity_experience_years']), 'Tempo de experiência')}
        {enumSelect('activity_frequency', value.activity_frequency, (v) => set('activity_frequency', v as CooperativeSurveyData['activity_frequency']), 'Frequência da actividade')}
        <Field label="Horas de trabalho por dia"><input type="number" min={0} max={24} value={num('daily_hours')} onChange={(e) => set('daily_hours', e.target.value === '' ? null : Number(e.target.value))} /></Field>
        <Field label="Ponto principal de actividade"><input value={txt('main_activity_point')} onChange={(e) => set('main_activity_point', e.target.value || null)} /></Field>
        {multi('location_types', 'Locais onde exerce a actividade')}
        <Field label="Latitude"><input type="number" step="any" value={num('latitude')} onChange={(e) => set('latitude', e.target.value === '' ? null : Number(e.target.value))} /></Field>
        <Field label="Longitude"><input type="number" step="any" value={num('longitude')} onChange={(e) => set('longitude', e.target.value === '' ? null : Number(e.target.value))} /></Field>
      </div>
    </div>

    <div className="admin-form-section"><header><div><h2>Produtos e comercialização</h2></div></header>
      <div className="admin-form-grid">
        <Field label="Descrição dos produtos / serviços" full><textarea rows={3} value={txt('products_services_description')} onChange={(e) => set('products_services_description', e.target.value || null)} /></Field>
        <Field label="Produto / serviço principal"><input value={txt('main_product_service')} onChange={(e) => set('main_product_service', e.target.value || null)} /></Field>
        <Field label="Quantidade produzida / recolhida"><input value={txt('production_quantity')} onChange={(e) => set('production_quantity', e.target.value || null)} /></Field>
        <Field label="Unidade de medida"><input value={txt('measurement_unit')} onChange={(e) => set('measurement_unit', e.target.value || null)} /></Field>
        {enumSelect('production_period', value.production_period, (v) => set('production_period', v as CooperativeSurveyData['production_period']), 'Período de produção')}
        {multi('recycling_materials', 'Materiais recolhidos / reciclados')}
        {multi('sales_channels', 'Canais de venda')}
        {multi('transport_means', 'Meios de transporte')}
      </div>
    </div>

    <div className="admin-form-section"><header><div><h2>Organização e rendimento</h2></div></header>
      <div className="admin-form-grid">
        {enumSelect('monthly_income_range', value.monthly_income_range, (v) => set('monthly_income_range', v as CooperativeSurveyData['monthly_income_range']), 'Rendimento mensal')}
        <Field label="É a principal fonte de rendimento?"><select value={value.is_primary_income_source === null || value.is_primary_income_source === undefined ? '' : String(value.is_primary_income_source)} onChange={(e) => set('is_primary_income_source', e.target.value === '' ? null : e.target.value === 'true')}>
          <option value="">— Seleccione —</option><option value="true">Sim</option><option value="false">Não</option>
        </select></Field>
        {enumSelect('organization_type', value.organization_type, (v) => set('organization_type', v as CooperativeSurveyData['organization_type']), 'Forma de organização')}
        <Field label="Nome da organização"><input value={txt('organization_name')} onChange={(e) => set('organization_name', e.target.value || null)} /></Field>
        <Field label="N.º de membros"><input type="number" min={1} value={num('members_count')} onChange={(e) => set('members_count', e.target.value === '' ? null : Number(e.target.value))} /></Field>
      </div>
    </div>

    <div className="admin-form-section"><header><div><h2>Segurança e necessidades</h2></div></header>
      <div className="admin-form-grid">
        {multi('safety_equipment', 'Equipamento de protecção (EPI) utilizado', 'nenhum')}
        {multi('work_risks', 'Riscos no trabalho')}
        {multi('priority_needs', 'Necessidades prioritárias')}
      </div>
    </div>

    <div className="admin-form-section"><header><div><h2>Declaração e validação</h2></div></header>
      <div className="admin-form-grid">
        <label className="admin-checkbox admin-field--full"><input type="checkbox" checked={Boolean(value.data_treatment_consent)} onChange={(e) => set('data_treatment_consent', e.target.checked)} /> Declaro que as informações são verdadeiras e autorizo o tratamento de dados pessoais (Lei n.º 22/11).</label>
        {enumSelect('operator_signature_type', value.operator_signature_type, (v) => set('operator_signature_type', v as CooperativeSurveyData['operator_signature_type']), 'Forma de assinatura do operador')}
        <Field label="Nome do cadastrador / supervisor"><input value={txt('supervisor_name')} onChange={(e) => set('supervisor_name', e.target.value || null)} /></Field>
        <Field label="Estado de validação"><select value={value.validation_status ?? 'pendente'} onChange={(e) => set('validation_status', e.target.value as CooperativeSurveyData['validation_status'])}>
          <option value="pendente">Pendente</option><option value="validado">Validado</option><option value="actualizado">Actualizado</option>
        </select></Field>
        <Field label="Código QR / registo"><input value={txt('qr_code_identifier')} disabled placeholder="Gerado na submissão" /></Field>
      </div>
    </div>
  </>;
}

export default CooperativeSurveyFields;
