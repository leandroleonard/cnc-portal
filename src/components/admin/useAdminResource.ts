'use client';

import { useEffect, useState } from 'react';

type Snapshot<T> = { key: string; data: T | null; error: Error | null };

export function useAdminResource<T>(key: string, load: () => Promise<T>) {
  const [snapshot, setSnapshot] = useState<Snapshot<T>>({ key: '', data: null, error: null });
  const [refreshCount, setRefreshCount] = useState(0);
  const current = snapshot.key === key;

  useEffect(() => {
    const refresh = () => setRefreshCount((count) => count + 1);
    window.addEventListener('cnc:admin-data-changed', refresh);
    return () => window.removeEventListener('cnc:admin-data-changed', refresh);
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve()
      .then(load)
      .then((data) => { if (active) setSnapshot({ key, data, error: null }); })
      .catch((cause: unknown) => {
        if (active) setSnapshot({ key, data: null, error: cause instanceof Error ? cause : new Error('Could not load admin data.') });
      });
    return () => { active = false; };
  }, [key, load, refreshCount]);

  return {
    loading: !current,
    data: current ? snapshot.data : null,
    error: current ? snapshot.error : null,
  };
}
