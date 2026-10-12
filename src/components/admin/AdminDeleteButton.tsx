'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteCooperative, deleteDocument, deleteNews } from '@/lib/api/admin';
import { hasPermission } from '@/lib/utils/permissions';
import { useAdminUser } from '@/components/admin/AdminShell';

type DeleteResource = 'cooperatives' | 'news' | 'documents';
const removeResource: Record<DeleteResource, (id: string) => Promise<void>> = {
  cooperatives: deleteCooperative,
  news: deleteNews,
  documents: deleteDocument,
};

export function AdminDeleteButton({ resource, id, label }: { resource: DeleteResource; id: string; label: string }) {
  const user = useAdminUser();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!user || !hasPermission(user, resource, 'delete')) return null;

  async function remove() {
    if (!window.confirm(`Eliminar “${label}”? Esta acção não pode ser anulada.`)) return;
    setBusy(true);
    setError('');
    try {
      await removeResource[resource](id);
      window.dispatchEvent(new Event('cnc:admin-data-changed'));
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível eliminar este registo.');
    } finally {
      setBusy(false);
    }
  }

  return <span className="admin-delete-action"><button type="button" aria-label={`Eliminar ${label}`} title={`Eliminar ${label}`} disabled={busy} onClick={() => void remove()}><Trash2 size={15} /></button>{error && <small className="field-error" role="alert">{error}</small>}</span>;
}
