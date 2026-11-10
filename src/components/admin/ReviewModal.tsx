'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export type ReviewAction = 'approve' | 'reject' | 'reopen';
const COPY: Record<ReviewAction, { title: string; label: string; confirm: string; required: boolean; danger?: boolean }> = {
  approve: { title: 'Aprovar cadastro', label: 'Parecer (opcional)', confirm: 'Aprovar', required: false },
  reject: { title: 'Rejeitar cadastro', label: 'Motivo da rejeição (obrigatório)', confirm: 'Rejeitar', required: true, danger: true },
  reopen: { title: 'Reabrir edição', label: 'Pedido de correcção ao cadastrador (obrigatório)', confirm: 'Reabrir por 1 hora', required: true },
};
const MIN = 10;

/** Modal de parecer: rejeição e reabertura exigem texto com pelo menos 10 caracteres. */
export function ReviewModal({ action, recordLabel, busy, error, onCancel, onConfirm }: {
  action: ReviewAction | null; recordLabel?: string; busy?: boolean; error?: string | null;
  onCancel: () => void; onConfirm: (text: string) => void;
}) {
  const [text, setText] = useState('');
  useEffect(() => { void Promise.resolve().then(() => setText('')); }, [action]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onCancel]);
  if (!action) return null;
  const c = COPY[action];
  const invalid = c.required && text.trim().length < MIN;

  return (
    <div className="admin-modal-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-[#071b2d]/60 p-4" role="dialog" aria-modal="true" aria-labelledby="review-title">
      <div className="admin-modal w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 id="review-title" className="text-lg font-bold text-[#0a2942]">{c.title}</h3>
            {recordLabel && <p className="text-sm text-[#5b6b7a]">{recordLabel}</p>}
          </div>
          <button type="button" aria-label="Fechar" onClick={onCancel} disabled={busy}><X size={20} /></button>
        </div>
        <label className="admin-field flex flex-col gap-1">
          <span className="text-sm font-semibold">{c.label}</span>
          <textarea autoFocus rows={5} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)}
            className="rounded-lg border border-[#d9e1e8] px-3 py-2 text-sm focus:border-[#2d825c] focus:outline-none" />
          {c.required && <span className={`text-xs ${invalid ? 'text-[#b54747]' : 'text-[#5b6b7a]'}`}>{text.trim().length}/{MIN} caracteres mínimos</span>}
        </label>
        {error && <p className="admin-form-error mt-2 text-sm text-[#b54747]">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="admin-button-secondary" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button type="button" disabled={busy || invalid} onClick={() => onConfirm(text.trim())}
            className={`button button--primary ${c.danger ? '!bg-[#b54747]' : ''}`}>{busy ? 'A processar…' : c.confirm}</button>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;