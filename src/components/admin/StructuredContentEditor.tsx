'use client';

import { useState } from 'react';
import { List, Plus, Quote, Trash2, Type } from 'lucide-react';
import type { RichTextBlock } from '@/types/domain';

export function StructuredContentEditor({ value, onChange, label }: { value: RichTextBlock[]; onChange: (blocks: RichTextBlock[]) => void; label: string }) {
  const [newType, setNewType] = useState<'paragraph' | 'heading' | 'quote' | 'list'>('paragraph');
  function addBlock() {
    const next: RichTextBlock = newType === 'heading' ? { type: 'heading', level: 2, text: '' } : newType === 'quote' ? { type: 'quote', text: '' } : newType === 'list' ? { type: 'list', ordered: false, items: [''] } : { type: 'paragraph', text: '' };
    onChange([...value, next]);
  }
  function updateText(index: number, text: string) {
    onChange(value.map((block, position) => {
      if (position !== index) return block;
      if (block.type === 'list') return { ...block, items: text.split('\n') };
      if (block.type === 'image') return block;
      return { ...block, text };
    }));
  }
  function remove(index: number) { onChange(value.filter((_, position) => position !== index)); }
  return <div className="admin-content-editor"><div className="admin-rich-blocks">{value.map((block, index) => <article className="admin-rich-block" key={`${block.type}-${index}`}><header><strong>{block.type === 'heading' ? 'Título' : block.type === 'quote' ? 'Citação' : block.type === 'list' ? 'Lista' : block.type === 'image' ? 'Imagem' : 'Parágrafo'} · {index + 1}</strong><button type="button" aria-label="Remover bloco" onClick={() => remove(index)}><Trash2 size={15} /></button></header>{block.type === 'image' ? <p className="admin-inline-state">Imagem: {block.media.altText ?? block.media.filename ?? block.media.id}. A imagem permanece associada; a edição de galerias é feita pela biblioteca de media.</p> : <textarea aria-label={`${label}, bloco ${index + 1}`} value={block.type === 'list' ? block.items.join('\n') : block.text} onChange={(event) => updateText(index, event.target.value)} placeholder={block.type === 'list' ? 'Um item por linha' : 'Escreva o conteúdo deste bloco…'} />}</article>)}</div><div className="admin-rich-tools"><label className="sr-only" htmlFor={`block-type-${label.replace(/\s+/g, '-')}`}>Tipo de bloco</label><select id={`block-type-${label.replace(/\s+/g, '-')}`} value={newType} onChange={(event) => setNewType(event.target.value as typeof newType)}><option value="paragraph">Parágrafo</option><option value="heading">Título de secção</option><option value="quote">Citação</option><option value="list">Lista</option></select><button type="button" onClick={addBlock}><Plus size={15} /> Adicionar bloco</button><span className="admin-rich-help"><Type size={13} /><List size={13} /><Quote size={13} /> Conteúdo estruturado, sem HTML livre.</span></div></div>;
}
