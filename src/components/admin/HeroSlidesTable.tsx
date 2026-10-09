'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import type { AdminHeroSlideRecord } from '@/types/domain';
import { deleteHeroSlide, reorderHeroSlides, updateHeroSlide } from '@/lib/api/admin';

export function HeroSlidesTable({ initialItems }: { initialItems: AdminHeroSlideRecord[] }) {
  const [items, setItems] = useState([...initialItems].sort((a, b) => a.order - b.order));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function reorder(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    const ordered = next.map((item, position) => ({ ...item, order: position + 1 }));
    setBusyId(items[index]?.id ?? null);
    setError('');
    try {
      await reorderHeroSlides(ordered.map((item) => ({ id: item.id, order: item.order })));
      setItems(ordered);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível reordenar os slides.'); }
    finally { setBusyId(null); }
  }

  async function toggle(item: AdminHeroSlideRecord) {
    setBusyId(item.id); setError('');
    try {
      const updated = await updateHeroSlide(item.id, { active: !item.active });
      setItems((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível actualizar o slide.'); }
    finally { setBusyId(null); }
  }

  async function remove(item: AdminHeroSlideRecord) {
    if (!window.confirm('Eliminar este slide? Esta acção não pode ser anulada.')) return;
    setBusyId(item.id); setError('');
    try { await deleteHeroSlide(item.id); setItems((current) => current.filter((entry) => entry.id !== item.id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível eliminar o slide.'); }
    finally { setBusyId(null); }
  }

  if (items.length === 0) return <div className="admin-empty"><div className="admin-empty__icon">—</div><h2>Ainda não existem slides</h2><p>Crie o slide institucional CNC e adicione os banners publicados no site.</p><Link className="button button--primary" href="/admin/hero/novo">Criar primeiro slide</Link></div>;
  return <div className="admin-table-wrap">{error && <p className="admin-form-error" role="alert">{error}</p>}<table className="admin-table"><thead><tr><th>Ordem</th><th>Slide (PT / EN)</th><th>Tipo</th><th>Estado</th><th className="text-end">Acções</th></tr></thead><tbody>{items.map((item, index) => <tr key={item.id}><td><div className="admin-order-controls"><button type="button" aria-label="Mover para cima" onClick={() => void reorder(index, -1)} disabled={index === 0 || busyId !== null}><ArrowUp size={15} /></button><strong>{item.order}</strong><button type="button" aria-label="Mover para baixo" onClick={() => void reorder(index, 1)} disabled={index === items.length - 1 || busyId !== null}><ArrowDown size={15} /></button></div></td><td><strong>{item.translations.pt.title || 'Sem título em português'}</strong><small className="admin-table-subline">{item.translations.en.title || 'No English title'}</small></td><td><span className="admin-tag">{item.kind === 'institutional' ? 'Institucional' : item.kind === 'cooperative' ? 'Cooperativa' : 'Campanha'}</span></td><td><span className={`admin-tag ${item.active ? 'admin-tag--green' : 'admin-tag--gold'}`}>{item.active ? 'Activo' : 'Inactivo'}</span></td><td><div className="admin-table-actions"><button type="button" aria-label={item.active ? 'Desactivar slide' : 'Activar slide'} onClick={() => void toggle(item)} disabled={busyId !== null}>{item.active ? <EyeOff size={15} /> : <Eye size={15} />}</button><Link href={`/admin/hero/${item.id}`} aria-label="Editar slide"><Pencil size={15} /></Link><button className="danger" type="button" aria-label="Eliminar slide" onClick={() => void remove(item)} disabled={busyId !== null}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>;
}
