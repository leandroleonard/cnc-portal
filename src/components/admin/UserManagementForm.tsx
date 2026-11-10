'use client';
import { createContext, useContext, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { createUser, updateUser } from '@/lib/api/users';
import type { Province, Role, User, UserInput } from '@/types/cnc';

const ErrorsCtx = createContext<Record<string, string>>({});
function F({ k, label, children }: { k: string; label: string; children: React.ReactNode }) {
  const errors = useContext(ErrorsCtx);
  return (
    <label className="admin-field flex flex-col gap-1">
      <span className="text-sm font-semibold text-[#0a2942]">{label}</span>{children}
      {errors[k] && <span className="admin-form-error text-xs text-[#b54747]">{errors[k]}</span>}
    </label>
  );
}

/** Criar / editar utilizador. Cadastrador exige província e data de validade (valid_until). */
function toLocalInput(date: Date): string {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export function UserManagementForm({ provinces, user, onSaved, onCancel }: {
  provinces: Province[]; user?: User | null; onSaved?: (u: User) => void; onCancel?: () => void;
}) {
  const editing = !!user;
  const [v, setV] = useState({
    name: user?.name ?? '', email: user?.email ?? '', password: '', role: (user?.role ?? 'cadastrador') as Role,
    province_id: user?.provinceId ?? '', valid_until: user?.validUntil ? toLocalInput(new Date(user.validUntil)) : '', is_active: user?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV((s) => ({ ...s, [k]: val }));

  const now = new Date();
  const today = toLocalInput(now);
  const expired = v.role === 'cadastrador' && !!v.valid_until && new Date(v.valid_until).getTime() < now.getTime();
  const statusLabel = !v.is_active ? 'Inactivo' : expired ? 'Expirado' : 'Activo';

  const validate = () => {
    const e: Record<string, string> = {};
    if (v.name.trim().length < 3) e.name = 'Indique o nome completo.';
    if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'E-mail inválido.';
    const passwordRule = (value: string) => value.length >= 10 && /[A-Za-z]/.test(value) && /\d/.test(value);
    if (!editing && !passwordRule(v.password)) e.password = 'Mínimo de 10 caracteres, com letras e números.';
    if (editing && v.password && !passwordRule(v.password)) e.password = 'Mínimo de 10 caracteres, com letras e números.';
    if (v.role === 'cadastrador') {
      if (!v.province_id) e.province_id = 'Obrigatório para cadastradores.';
      if (!v.valid_until) e.valid_until = 'Obrigatório para cadastradores.';
      else if (!editing && new Date(v.valid_until).getTime() <= now.getTime()) e.valid_until = 'A data/hora tem de ser futura.';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault(); setMsg(null);
    if (!validate()) return;
    const body: UserInput = {
      name: v.name.trim(), email: v.email.trim(), role: v.role, is_active: v.is_active,
      province_id: v.role === 'cadastrador' ? v.province_id : null,
      valid_until: v.role === 'cadastrador' ? new Date(v.valid_until).toISOString() : null,
      ...(v.password ? { password: v.password } : {}),
    };
    setBusy(true);
    try {
      const saved = editing ? await updateUser(user!.id, body) : await createUser(body);
      setMsg({ ok: true, text: editing ? 'Utilizador actualizado.' : 'Utilizador criado.' });
      onSaved?.(saved);
    } catch (e) {
      if (e instanceof ApiError) {
        setErrors(Object.fromEntries(Object.entries(e.fieldErrors ?? {}).map(([k, m]) => [k, m[0]])));
        setMsg({ ok: false, text: e.message });
      } else setMsg({ ok: false, text: 'Erro inesperado.' });
    } finally { setBusy(false); }
  };

  const input = 'rounded-lg border border-[#d9e1e8] px-3 py-2 text-sm focus:border-[#2d825c] focus:outline-none';
  return (
    <ErrorsCtx.Provider value={errors}>
    <form onSubmit={submit} className="admin-panel flex flex-col gap-4" noValidate>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0a2942]">{editing ? 'Editar utilizador' : 'Novo utilizador'}</h2>
        <span className={`admin-tag ${statusLabel === 'Activo' ? 'admin-tag--green' : statusLabel === 'Expirado' ? 'admin-tag--gold' : ''}`}>{statusLabel}</span>
      </div>
      <div className="admin-form-grid grid grid-cols-1 gap-4 sm:grid-cols-2">
        <F k="name" label="Nome"><input className={input} value={v.name} onChange={(e) => set('name', e.target.value)} /></F>
        <F k="email" label="E-mail"><input type="email" className={input} value={v.email} onChange={(e) => set('email', e.target.value)} /></F>
        <F k="password" label={editing ? 'Nova palavra-passe (opcional)' : 'Palavra-passe'}>
          <input type="password" autoComplete="new-password" className={input} value={v.password} onChange={(e) => set('password', e.target.value)} />
        </F>
        <F k="role" label="Perfil">
          <select className={input} value={v.role} onChange={(e) => set('role', e.target.value as Role)}>
            <option value="cadastrador">Cadastrador</option><option value="admin">Administrador</option>
          </select>
        </F>
        {v.role === 'cadastrador' && (
          <>
            <F k="province_id" label="Província atribuída">
              <select className={input} value={v.province_id} onChange={(e) => set('province_id', e.target.value)}>
                <option value="">— Seleccione —</option>
                {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </F>
            <F k="valid_until" label="Perfil válido até (data/hora)">
              <input type="datetime-local" className={input} min={editing ? undefined : today} value={v.valid_until} onChange={(e) => set('valid_until', e.target.value)} />
            </F>
          </>
        )}
        <label className="admin-checkbox flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-[#236b4b]" checked={v.is_active} onChange={(e) => set('is_active', e.target.checked)} /> Conta activa
        </label>
      </div>
      {msg && <p className={msg.ok ? 'admin-form-success text-sm text-[#236b4b]' : 'admin-form-error text-sm text-[#b54747]'}>{msg.text}</p>}
      <div className="flex justify-end gap-2">
        {onCancel && <button type="button" className="admin-button-secondary" onClick={onCancel}>Cancelar</button>}
        <button type="submit" className="button button--primary" disabled={busy}>{busy ? 'A guardar…' : 'Guardar'}</button>
      </div>
    </form>
    </ErrorsCtx.Provider>
  );
}

export default UserManagementForm;