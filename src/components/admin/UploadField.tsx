'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Check, FileText, LoaderCircle, Search, Trash2, Upload, X } from 'lucide-react';
import type { Media, MediaAsset } from '@/types/domain';
import { listMedia } from '@/lib/api/admin';
import { uploadMedia } from '@/lib/api/media';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/primitives';

export function UploadField({
  label,
  value,
  onChange,
  accept,
  imageOnly = false,
  maxSizeMb = 20,
  locale = 'pt',
}: {
  label: string;
  value: Media | null;
  onChange: (value: Media | null) => void;
  accept: string;
  imageOnly?: boolean;
  maxSizeMb?: number;
  locale?: 'pt' | 'en';
}) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [controller, setController] = useState<AbortController | null>(null);

  async function upload(file: File) {
    setError('');
    const allowedImage = file.type.startsWith('image/');
    if (imageOnly && !allowedImage) { setError(locale === 'pt' ? 'Seleccione um ficheiro de imagem.' : 'Choose an image file.'); return; }
    if (file.size > maxSizeMb * 1024 * 1024) { setError(`${locale === 'pt' ? 'O ficheiro excede o limite de' : 'File exceeds the'} ${maxSizeMb} MB.`); return; }
    const abort = new AbortController();
    setController(abort);
    setBusy(true);
    setProgress(0);
    try {
      const asset = await uploadMedia(file, {}, abort.signal, setProgress);
      onChange(asset);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') return;
      setError(cause instanceof ApiError ? cause.message : locale === 'pt' ? 'Falha no carregamento do ficheiro.' : 'File upload failed.');
    } finally {
      setBusy(false);
      setController(null);
    }
  }

  return <div className="admin-upload-field">
    <span className="admin-field-label">{label}</span>
    {value ? <div className="admin-upload-preview">{imageOnly && value.url ? <Image src={value.url} alt={value.altText ?? value.filename ?? label} width={100} height={76} /> : <div className="admin-upload-file-icon"><FileText size={22} /></div>}<div><strong>{value.filename ?? label}</strong><small>{value.mimeType ?? ''}</small></div><button type="button" aria-label={locale === 'pt' ? 'Remover ficheiro' : 'Remove file'} onClick={() => onChange(null)}><Trash2 size={17} /></button></div> : <div className="admin-upload-actions"><label className="admin-upload-button"><Upload size={17} />{locale === 'pt' ? 'Carregar ficheiro' : 'Upload file'}<input type="file" accept={accept} disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ''; }} /></label><Button variant="secondary" onClick={() => setPickerOpen(true)} disabled={busy}><Search size={16} />{locale === 'pt' ? 'Escolher da biblioteca' : 'Choose from library'}</Button></div>}
    {busy && <div className="upload-progress"><LoaderCircle size={16} className="spin" /><span>{locale === 'pt' ? 'A carregar' : 'Uploading'} {progress}%</span><progress value={progress} max={100} /><button type="button" onClick={() => controller?.abort()}>{locale === 'pt' ? 'Cancelar' : 'Cancel'}</button></div>}
    {error && <p className="field-error" role="alert">{error}</p>}
    {pickerOpen && <MediaPicker imageOnly={imageOnly} onSelect={(asset) => { onChange(asset); setPickerOpen(false); }} onClose={() => setPickerOpen(false)} locale={locale} />}
  </div>;
}

function MediaPicker({ imageOnly, onSelect, onClose, locale }: { imageOnly: boolean; onSelect: (asset: MediaAsset) => void; onClose: () => void; locale: 'pt' | 'en' }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryKey = JSON.stringify([search, page, imageOnly]);
  const [result, setResult] = useState<{ key: string; items: MediaAsset[]; error: string }>({ key: '', items: [], error: '' });
  const loading = result.key !== queryKey;
  const items = loading ? [] : result.items;
  const error = loading ? '' : result.error;
  useEffect(() => {
    let active = true;
    void listMedia({ search, page, perPage: 20, sort: 'createdAt', direction: 'desc', mimeType: imageOnly ? 'image' : undefined })
      .then((response) => { if (active) setResult({ key: queryKey, items: response.data, error: '' }); })
      .catch((cause: unknown) => { if (active) setResult({ key: queryKey, items: [], error: cause instanceof Error ? cause.message : 'Media library unavailable.' }); });
    return () => { active = false; };
  }, [search, page, imageOnly, queryKey]);
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="media-picker-title"><header><div><p className="admin-eyebrow">CNC · MEDIA</p><h2 id="media-picker-title">{locale === 'pt' ? 'Seleccionar ficheiro' : 'Select a file'}</h2></div><button type="button" className="admin-icon-button" onClick={onClose} aria-label="Fechar"><X size={19} /></button></header><label className="admin-search"><Search size={17} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={locale === 'pt' ? 'Pesquisar media…' : 'Search media…'} /></label>{loading ? <p className="admin-inline-state">A carregar media…</p> : error ? <p className="admin-form-error" role="alert">{error}</p> : items.length === 0 ? <p className="admin-inline-state">{locale === 'pt' ? 'Não existem ficheiros disponíveis.' : 'No files available.'}</p> : <div className="media-picker-grid">{items.map((asset) => <button type="button" key={asset.id} onClick={() => onSelect(asset)}>{asset.mimeType?.startsWith('image/') ? <Image src={asset.thumbnailUrl ?? asset.url} alt={asset.altText ?? asset.filename ?? ''} width={150} height={110} /> : <span className="admin-upload-file-icon"><FileText size={28} /></span>}<span>{asset.filename ?? asset.id}</span><Check size={15} /></button>)}</div>}<footer><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1}>Anterior</button><span>{locale === 'pt' ? `Página ${page}` : `Page ${page}`}</span><button type="button" onClick={() => setPage((value) => value + 1)} disabled={items.length < 20}>Seguinte</button></footer></section></div>;
}
