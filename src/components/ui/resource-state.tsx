import { AlertCircle, CheckCircle2, PackageOpen, RefreshCw } from 'lucide-react';
import { Button } from './primitives';

type ResourceStateProps = {
  variant: 'loading' | 'error' | 'empty' | 'success';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

export function ResourceState({ variant, title, description, actionLabel, onAction, compact = false }: ResourceStateProps) {
  const Icon = variant === 'error' ? AlertCircle : variant === 'success' ? CheckCircle2 : variant === 'empty' ? PackageOpen : RefreshCw;
  return (
    <div className={`resource-state ${compact ? 'resource-state--compact' : ''}`} role={variant === 'error' ? 'alert' : 'status'}>
      <span className={`resource-state__icon resource-state__icon--${variant}`}>
        <Icon size={compact ? 23 : 34} aria-hidden="true" />
      </span>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actionLabel && onAction && <Button variant="secondary" onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
