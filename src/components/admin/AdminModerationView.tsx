'use client';
import { useCallback, useEffect, useState } from 'react';
import { Eye, MapPin, RefreshCw } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { getModerationCooperative, listModerationCooperatives, reopenCooperative, reviewCooperative } from '@/lib/api/moderation';
import { listUsers } from '@/lib/api/users';
import { ModerationDrawer, StatusTag } from './ModerationDrawer';
import { ReviewModal, type ReviewAction } from './ReviewModal';
import type { Cooperative, PaginationMeta, Province, User } from '@/types/cnc';

type Filters = { status: string; province: string; cadastrador: string; submittedFrom: string; submittedTo: string; search: string; page: number };
const INITIAL: Filters = { status: 'pending_review', province: '', cadastrador: '', submittedFrom: '', submittedTo: '', search: '', page: 1 };
const dt = (v?: string | null) => (v ? new Date(v).toLocaleString('pt-AO', { dateStyle: 'short', timeStyle: 'short' }) : '—');

/** Fila de moderação: tabela paginada + filtros + drawer da ficha + aprovar / rejeitar / reabrir. */
export function AdminModerationView({ provinces, perPage = 20, onSessionEnded }: { provinces: Province[]; perPage?: number; onSessionEnded?: (code: string) => void }) {
  const [filters, setFilters] = useState<Filters>(INITIAL);
  const [rows, setRows] = useState<Cooperative[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [cadastradores, setCadastradores] = useState<User[]>([]);
  const [selected, setSelected] = useState<Cooperative | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [action, setAction] = useState<ReviewAction | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fail = useCallback((e: unknown, set: (m: string) => void) => {
    if (e instanceof ApiError) {
      if (['profile_expired', 'account_inactive', 'unauthenticated'].includes(e.code ?? '')) onSessionEnded?.(e.code ?? '');
      const fieldErrors = e.fieldErrors ?? {};
      set(fieldErrors.rejection_reason?.[0] ?? fieldErrors.note?.[0] ?? e.message);
    } else set('Erro inesperado.');
  }, [onSessionEnded]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { page, ...f } = filters;
      const res = await listModerationCooperatives({ ...f, page, perPage, sort: 'submitted_at', direction: 'asc' });
      setRows(res.data); setMeta(res.meta);
    } catch (e) { fail(e, setError); } finally { setLoading(false); }
  }, [filters, perPage, fail]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  useEffect(() => {
    listUsers({ role: 'cadastrador', perPage: 100, province: filters.province || undefined })
      .then((r) => setCadastradores(r.data)).catch(() => setCadastradores([]));
  }, [filters.province]);

  const set = (k: keyof Filters, v: string) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  const open = async (row: Cooperative) => {
    setSelected(row); setDrawerLoading(true);
    try { setSelected(await getModerationCooperative(row.id)); }
    catch (e) { fail(e, setError); setSelected(null); } finally { setDrawerLoading(false); }
  };

  const confirm = async (text: string) => {
    if (!selected || !action) return;
    setActionBusy(true); setActionError(null);
    try {
      const res = action === 'reopen'
        ? await reopenCooperative(selected.id, text)
        : await reviewCooperative(selected.id, action === 'approve' ? { status: 'active' } : { status: 'rejected', rejection_reason: text });
      setFlash(action === 'approve' ? `${res.registrationCode} aprovado.` : action === 'reject' ? `${res.registrationCode} rejeitado.` : `Edição de ${res.registrationCode} reaberta por 1 hora.`);
      setAction(null);
      if (action === 'reopen') setSelected(res); else setSelected(null);
      load();
    } catch (e) { fail(e, setActionError); } finally { setActionBusy(false); }
  };

  const select = 'admin-filter-select rounded-lg border border-[#d9e1e8] bg-white px-3 py-2 text-sm';

  return (
    <div className="flex flex-col gap-4">
      <div className="admin-page-header flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="admin-eyebrow">Moderação</p>
          <h1 className="text-2xl font-bold text-[#0a2942]">Fila de revisão de cadastros</h1>
          {meta?.pendingTotal != null && <p className="text-sm text-[#5b6b7a]">{meta.pendingTotal} ficha(s) pendente(s) no total</p>}
        </div>
        <button type="button" className="admin-button-secondary inline-flex items-center gap-2" onClick={load}><RefreshCw size={16} /> Actualizar</button>
      </div>

      <div className="admin-list-toolbar admin-panel grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <input className={`${select} lg:col-span-2`} placeholder="Pesquisar código, nome, BI…" value={filters.search} onChange={(e) => set('search', e.target.value)} aria-label="Pesquisar" />
        <select className={select} value={filters.status} onChange={(e) => set('status', e.target.value)} aria-label="Estado">
          <option value="pending_review">Pendentes</option><option value="active">Aprovados</option><option value="rejected">Rejeitados</option><option value="all">Todos</option>
        </select>
        <select className={select} value={filters.province} onChange={(e) => setFilters((f) => ({ ...f, province: e.target.value, cadastrador: '', page: 1 }))} aria-label="Província">
          <option value="">Todas as províncias</option>
          {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className={select} value={filters.cadastrador} onChange={(e) => set('cadastrador', e.target.value)} aria-label="Cadastrador">
          <option value="">Todos os cadastradores</option>
          {cadastradores.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <div className="flex gap-2">
          <input type="date" className={`${select} w-full`} value={filters.submittedFrom} onChange={(e) => set('submittedFrom', e.target.value)} aria-label="Submetido desde" />
          <input type="date" className={`${select} w-full`} value={filters.submittedTo} onChange={(e) => set('submittedTo', e.target.value)} aria-label="Submetido até" />
        </div>
      </div>

      {flash && <p className="admin-form-success text-sm text-[#236b4b]" role="status">{flash}</p>}
      {error && <p className="admin-form-error text-sm text-[#b54747]" role="alert">{error}</p>}

      <div className="admin-panel overflow-x-auto">
        <table className="admin-table w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-[#5b6b7a]">
              <th className="p-3">Código</th><th className="p-3">Operador / organização</th><th className="p-3">Província · Município</th>
              <th className="p-3">Cadastrador</th><th className="p-3">Submetido</th><th className="p-3">Estado</th><th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-6 text-center text-[#5b6b7a]">A carregar…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-[#5b6b7a]">Nenhuma ficha corresponde aos filtros.</td></tr>}
            {!loading && rows.map((r) => (
              <tr key={r.id} className="cursor-pointer border-t border-[#e7edf2] hover:bg-[#f4f7fa]" onClick={() => open(r)}>
                <td className="p-3 font-semibold text-[#0a2942]">{r.registrationCode ?? '—'}</td>
                <td className="p-3">{r.operatorName ?? r.name}{r.hasLocation && <MapPin size={14} className="ml-1 inline text-[#236b4b]" aria-label="Com GPS" />}</td>
                <td className="p-3">{r.province?.name} · {r.municipality?.name ?? '—'}</td>
                <td className="p-3">{r.createdBy?.name ?? '—'}</td>
                <td className="p-3">{dt(r.submittedAt)}</td>
                <td className="p-3"><StatusTag status={r.status} /></td>
                <td className="p-3"><button type="button" className="admin-button-secondary inline-flex items-center gap-1" onClick={(e) => { e.stopPropagation(); open(r); }}><Eye size={14} /> Ver</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.lastPage > 1 && (
        <div className="admin-pagination flex items-center justify-between text-sm">
          <span>{meta.from}–{meta.to} de {meta.total}</span>
          <div className="flex gap-2">
            <button type="button" className="admin-button-secondary" disabled={meta.currentPage <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>Anterior</button>
            <span className="self-center">Página {meta.currentPage} / {meta.lastPage}</span>
            <button type="button" className="admin-button-secondary" disabled={meta.currentPage >= meta.lastPage} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Seguinte</button>
          </div>
        </div>
      )}

      <ModerationDrawer record={selected} loading={drawerLoading} onClose={() => setSelected(null)} onAction={(a) => { setActionError(null); setAction(a); }} />
      <ReviewModal action={action} recordLabel={selected?.registrationCode ?? undefined} busy={actionBusy} error={actionError} onCancel={() => setAction(null)} onConfirm={confirm} />
    </div>
  );
}

export default AdminModerationView;