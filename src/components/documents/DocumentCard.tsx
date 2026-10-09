import { Download, FileText } from 'lucide-react';
import type { DocumentItem, Locale } from '@/types/domain';
import { formatDate, formatFileSize } from '@/lib/utils/format';

export function DocumentCard({ item, locale, downloadLabel = 'Descarregar' }: { item: DocumentItem; locale: Locale; downloadLabel?: string }) {
  return (
    <article className="document-card">
      <div className="document-icon" aria-hidden="true"><FileText size={23} /><span>{item.fileType.toUpperCase()}</span></div>
      <div>
        <span className="card-kicker">{item.category.name}</span>
        <h3>{item.title}</h3>
        <p>{item.publishedAt ? formatDate(item.publishedAt, locale) : item.year ?? '—'} · {item.fileType.toUpperCase()} · {formatFileSize(item.fileSizeBytes, locale)}</p>
        {item.description && <p>{item.description}</p>}
      </div>
      <a href={item.fileUrl} target="_blank" rel="noreferrer" className="document-download" aria-label={`${downloadLabel}: ${item.title}`}>
        <Download size={19} aria-hidden="true" /><span>{downloadLabel}</span>
      </a>
    </article>
  );
}
