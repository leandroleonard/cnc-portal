import type { NewsletterSubscription } from '@/types/domain';

export function SubscriberStatus({ status }: { status: NewsletterSubscription['status'] }) {
  const label = status === 'active' ? 'Activa' : status === 'pending' ? 'Pendente' : 'Removida';
  return <span className={`admin-tag ${status === 'active' ? 'admin-tag--green' : 'admin-tag--gold'}`}>{label}</span>;
}
