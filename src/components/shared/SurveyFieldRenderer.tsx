'use client';
import { useLocale } from 'next-intl';
import type { Option } from '@/lib/survey-options';

type Props = {
  name: string;
  legend: string;
  options: Option[];
  value: string[] | null | undefined;
  onChange?: (next: string[]) => void;
  /** Valor exclusivo (ex.: "nenhum" em EPI) — limpa os restantes. */
  exclusive?: string;
  readOnly?: boolean;
  error?: string;
  otherValue?: string;
  onOtherChange?: (v: string) => void;
};

/** Renderiza um array JSON da ficha como grupo de checkboxes (ou etiquetas em modo leitura). */
export function SurveyFieldRenderer({ name, legend, options, value, onChange, exclusive, readOnly, error, otherValue, onOtherChange }: Props) {
  const locale = useLocale();
  const selected = value ?? [];
  const lbl = (opt: Option) => (locale === 'en' ? opt.en : opt.pt);

  if (readOnly) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-wide text-[#5b6b7a]">{legend}</span>
        <div className="flex flex-wrap gap-1.5">
          {selected.length === 0 && <span className="text-sm text-[#8a96a3]">—</span>}
          {selected.map((v) => (
            <span key={v} className="admin-tag admin-tag--green">{lbl(options.find((o) => o.value === v) ?? { value: v, pt: v, en: v })}</span>
          ))}
          {otherValue && <span className="admin-tag admin-tag--gold">{otherValue}</span>}
        </div>
      </div>
    );
  }

  const toggle = (v: string) => {
    if (!onChange) return;
    if (selected.includes(v)) return onChange(selected.filter((x) => x !== v));
    if (exclusive && v === exclusive) return onChange([v]);
    onChange([...selected.filter((x) => x !== exclusive), v]);
  };
  const hasOther = selected.some((v) => v === 'outro' || v === 'outra');

  return (
    <fieldset className="flex flex-col gap-2" aria-invalid={!!error}>
      <legend className="mb-1 text-sm font-semibold text-[#0a2942]">{legend}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((opt) => {
          const id = `${name}-${opt.value}`;
          const checked = selected.includes(opt.value);
          return (
            <label key={opt.value} htmlFor={id}
              className={`survey-option ${checked ? 'survey-option--checked' : ''}`}>
              <input id={id} type="checkbox" checked={checked} onChange={() => toggle(opt.value)} />
              {lbl(opt)}
            </label>
          );
        })}
      </div>
      {hasOther && onOtherChange && (
        <input className="admin-field mt-1 rounded-lg border border-[#d9e1e8] px-3 py-2 text-sm" placeholder={locale === 'en' ? 'Specify other' : 'Especifique "outro"'}
          value={otherValue ?? ''} onChange={(e) => onOtherChange(e.target.value)} maxLength={255} />
      )}
      {error && <p className="admin-form-error text-sm text-[#b54747]">{error}</p>}
    </fieldset>
  );
}

export default SurveyFieldRenderer;