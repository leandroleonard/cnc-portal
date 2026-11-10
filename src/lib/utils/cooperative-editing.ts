import type { Cooperative } from '@/types/cnc';

export function isEditingLocked(record: Cooperative | null | undefined, isCadastrador: boolean, windowExpired: boolean): boolean {
  if (!record || !isCadastrador || !record.submittedAt) return false;
  if (windowExpired) return true;
  if (!record.editingWindow) return false;
  return record.editingWindow.isOpen === false;
}
