'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { FileText, ImagePlus, LoaderCircle, Search, Trash2, Upload, X, Save } from 'lucide-react';
import type { MediaAsset, PaginationMeta } from '@/types/domain';
import { deleteMedia, listMedia, updateMediaMetadata } from '@/lib/api/admin';
import { uploadMedia } from '@/lib/api/media';
import { ApiError } from '@/lib/api/client';
import { formatDate, formatFileSize } from '@/lib/utils/format';
import { AdminPagination, FormFeedback } from './AdminUI';
import { Button } from '@/components/ui/primitives';

const emptyMeta: PaginationMeta = { currentPage: 1, perPage: 24, total: 0, lastPage: 1, from: null, to: null };

export function MediaLibrary({ initial, initialMeta, initialSearch = '', initialType = '' }: { initial: MediaAsset[]; initialMeta: PaginationMeta; initialSearch?: string; initialType?: string }) {
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState(initialType);
  const [page, setPage] = useState(initialMeta.currentPage);
  const [refresh, setRefresh] = useState(0);
  const queryKey = JSON.stringify([search, page, type, refresh]);
  const [collection, setCollection] = useState(() => ({
    key: JSON.stringify([initialSearch, initialMeta.currentPage, initialType, 0]),
    items: initial,
    meta: initialMeta ?? emptyMeta,
    error: '',
  }));
  const loading = collection.key !== queryKey;
  const items = loading ? [] : collection.items;
  const meta = loading ? { ...emptyMeta, currentPage: page } : collection.meta;
  const collectionError = loading ? '' : collection.error;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void listMedia({ search, page, perPage: 24, sort: 'createdAt', direction: 'desc', mimeType: type || undefined })
      .then((result) => { if (active) setCollection({ key: queryKey, items: result.data, meta: result.meta, error: '' }); })
      .catch((cause: unknown) => {
        if (active) setCollection({ key: queryKey, items: [], meta: { ...emptyMeta, currentPage: page }, error: cause instanceof Error ? cause.message : 'Não foi possível carregar a Media Library.' });
      });
    return () => { active = false; };
  }, [search, page, type, refresh, queryKey]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(''); setSuccess(''); setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 30 * 1024 * 1024) throw new Error(`${file.name}: ficheiro superior a 30 MB.`);
        await uploadMedia(file, {}, new AbortController().signal, setProgress);
      }
      setSuccess('Ficheiro(s) carregado(s) para a biblioteca.');
      setPage(1);
      setRefresh((value) => value + 1);
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : cause instanceof Error ? cause.message : 'O carregamento falhou.'); }
    finally { setUploading(false); setProgress(0); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function remove(item: MediaAsset) {
    if (!window.confirm(`Eliminar ${item.filename ?? 'este ficheiro'}? Se estiver associado a conteúdo, a API poderá impedir a remoção.`)) return;
    try { setError(''); await deleteMedia(item.id); setCollection((current) => ({ ...current, items: current.items.filter((entry) => entry.id !== item.id), meta: { ...current.meta, total: Math.max(0, current.meta.total - 1) } })); setSuccess('Ficheiro eliminado.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível eliminar o ficheiro.'); }
  }

  function startEdit(item: MediaAsset) { setEditing(item); setAltText(item.altText ?? ''); setCaption(item.caption ?? ''); }
  async function saveMetadata() {
    if (!editing) return;
    try { const updated = await updateMediaMetadata(editing.id, { altText, caption }); setCollection((current) => ({ ...current, items: current.items.map((item) => item.id === updated.id ? updated : item) })); setEditing(null); setSuccess('Metadados actualizados.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível guardar os metadados.'); }
  }

  return <>
    <div className="admin-media-toolbar"><div className="admin-search"><Search size={17} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Pesquisar por nome ou descrição…" /><select value={type} onChange={(event) => { setType(event.target.value); setPage(1); }} aria-label="Filtrar tipo de ficheiro"><option value="">Todos os ficheiros</option><option value="image">Imagens</option><option value="application">Documentos</option></select></div><label className="button button--primary admin-upload-button"><Upload size={16} />{uploading ? `A carregar ${progress}%` : 'Carregar ficheiros'}<input ref={fileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.odt,.ods" disabled={uploading} onChange={(event) => void upload(event.target.files)} /></label></div>
    {uploading && <div className="upload-progress admin-media-progress"><LoaderCircle size={16} className="spin" /><span>A carregar ficheiros… {progress}%</span><progress value={progress} max={100} /> </div>}
    {success && <FormFeedback success={success} />}{error && <FormFeedback error={error} />}{collectionError && <FormFeedback error={collectionError} />}
    {loading ? <div className="admin-inline-state">A carregar conteúdos da biblioteca…</div> : collectionError ? null : items.length === 0 ? <div className="admin-empty"><div className="admin-empty__icon"><ImagePlus size={21} /></div><h2>Media Library vazia</h2><p>Carregue imagens e documentos aprovados pelo CNC. Todos os ficheiros são armazenados pelo serviço de media.</p></div> : <div className="admin-media-grid">{items.map((item) => <article className="admin-media-card" key={item.id}>{item.mimeType?.startsWith('image/') ? <Image src={item.thumbnailUrl ?? item.url} alt={item.altText ?? item.filename ?? ''} width={420} height={300} /> : <div className="admin-media-file-preview"><FileText size={42} /><span>{item.mimeType?.split('/').at(-1)?.toUpperCase() ?? 'FILE'}</span></div>}<div className="admin-media-card__body"><strong title={item.filename}>{item.filename ?? item.id}</strong><small>{formatFileSize(item.sizeBytes, 'pt')} · {formatDate(item.createdAt, 'pt')}</small>{item.altText && <small className="admin-media-alt">ALT: {item.altText}</small>}<div className="admin-media-card__actions"><button type="button" onClick={() => startEdit(item)}>Metadados</button><button type="button" onClick={() => void remove(item)}><Trash2 size={14} /> Eliminar</button></div></div></article>)}</div>}
    <AdminPagination meta={meta} basePath="/admin/media" query={{ search, type }} />
    {editing && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><section className="admin-modal admin-modal--small" role="dialog" aria-modal="true" aria-labelledby="media-metadata-title"><header><div><p className="admin-eyebrow">MEDIA · METADADOS</p><h2 id="media-metadata-title">Editar descrição do ficheiro</h2></div><button type="button" className="admin-icon-button" aria-label="Fechar" onClick={() => setEditing(null)}><X size={18} /></button></header><label className="admin-field"><span>Texto alternativo (PT / EN)</span><input value={altText} onChange={(event) => setAltText(event.target.value)} /></label><label className="admin-field admin-field--full"><span>Legenda (PT / EN)</span><textarea value={caption} onChange={(event) => setCaption(event.target.value)} /></label><div className="admin-form-actions"><button type="button" className="admin-button-secondary" onClick={() => setEditing(null)}>Cancelar</button><Button onClick={() => void saveMetadata()}><Save size={15} />Guardar metadados</Button></div></section></div>}
  </>;
}
