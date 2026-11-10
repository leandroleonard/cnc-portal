'use client';
import { useEffect, useRef, useState } from 'react';
import { Clock, Lock } from 'lucide-react';
import type { EditingWindow } from '@/types/cnc';

const fmt = (s: number) => {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

/** Temporizador regressivo da janela de edição (submitted_at + 1h). Compensa o desvio entre relógio local e servidor. */
export function EditingWindowTimer({ window: w, onExpire, compact }: { window: EditingWindow | null | undefined; onExpire?: () => void; compact?: boolean }) {
  const skew = useRef(0);
  const [left, setLeft] = useState(() => w?.secondsRemaining ?? 0);
  const fired = useRef(false);

  useEffect(() => {
    if (!w?.endsAt) return;
    skew.current = Date.parse(w.serverTime) - Date.now();
    fired.current = false;
    const tick = () => {
      const s = Math.max(0, Math.floor((Date.parse(w.endsAt!) - (Date.now() + skew.current)) / 1000));
      setLeft(s);
      if (s === 0 && !fired.current) { fired.current = true; onExpire?.(); }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [w?.endsAt, w?.serverTime, onExpire]);

  if (!w?.endsAt) return null;
  const expired = left <= 0;
  const warn = !expired && left <= 300;
  const cls = expired ? 'border-[#b54747] bg-[#fbeaea] text-[#b54747]' : warn ? 'border-[#c99a40] bg-[#f6ecd8] text-[#8a6420]' : 'border-[#2d825c] bg-[#e7f2ec] text-[#236b4b]';

  return (
    <div role="timer" aria-live="polite" className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${cls}`}>
      {expired ? <Lock size={16} /> : <Clock size={16} />}
      {expired ? 'Janela de edição encerrada' : <>{compact ? '' : 'Edição disponível por '}<span className="tabular-nums">{fmt(left)}</span></>}
    </div>
  );
}

export default EditingWindowTimer;