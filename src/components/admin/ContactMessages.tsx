'use client';

import { useState } from 'react';
import { Mail, Phone, ChevronDown } from 'lucide-react';
import type { ContactMessage, PaginationMeta } from '@/types/domain';
import { updateContactMessageStatus } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { formatDate } from '@/lib/utils/format';
import { AdminPagination } from './AdminUI';

const statuses: Array<{ value: ContactMessage['status']; label: string }> = [
  { value: 'new', label: 'Nova' }, { value: 'read', label: 'Lida' }, { value: 'responded', label: 'Respondida' }, { value: 'archived', label: 'Arquivada' },
];

export function ContactMessages({ initial, meta, query }: { initial: ContactMessage[]; meta: PaginationMeta; query: { search?: string; status?: string } }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  async function changeStatus(id: string, status: ContactMessage['status']) {
    setBusy(id); setError('');
    try { const updated = await updateContactMessageStatus(id, status); setItems((current) => current.map((item) => item.id === id ? updated : item)); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Não foi possível actualizar o estado da mensagem.'); }
    finally { setBusy(null); }
  }
  return <><div className="admin-contact-list">{error && <p className="admin-form-error" role="alert">{error}</p>}{items.length === 0 ? <div className="admin-empty"><div className="admin-empty__icon">—</div><h2>Sem mensagens</h2><p>As mensagens enviadas pelo formulário público aparecerão nesta lista.</p></div> : items.map((item) => <article className="admin-contact-message" key={item.id}><div><div className="admin-contact-heading"><h3>{item.subject}</h3><span className={`admin-tag ${item.status === 'new' ? 'admin-tag--gold' : item.status === 'responded' ? 'admin-tag--green' : ''}`}>{statuses.find((status) => status.value === item.status)?.label}</span></div><p className="admin-contact-meta"><strong>{item.name}</strong><a href={`mailto:${item.email}`}><Mail size={13} />{item.email}</a>{item.phone && <a href={`tel:${item.phone}`}><Phone size={13} />{item.phone}</a>}<span>{formatDate(item.receivedAt, 'pt')}</span></p><p className="admin-contact-body">{item.message}</p></div><div className="admin-contact-message__actions"><label className="admin-status-select"><span className="sr-only">Estado da mensagem de {item.name}</span><select value={item.status} disabled={busy === item.id} onChange={(event) => void changeStatus(item.id, event.target.value as ContactMessage['status'])}>{statuses.map((status) => <option value={status.value} key={status.value}>{status.label}</option>)}</select><ChevronDown size={14} /></label></div></article>)}</div><AdminPagination meta={meta} basePath="/admin/contactos" query={query} /></>;
}
