import { Lock, MapPin } from 'lucide-react';

/** Mostra a província de cadastro; bloqueada (cadeado) para o cadastrador. */
export function ProvinceIndicator({ name, locked }: { name: string | null | undefined; locked: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#d9e1e8] bg-[#f4f7fa] px-3 py-2 text-sm text-[#0a2942]" title={locked ? 'Província atribuída ao seu perfil — não editável' : undefined}>
      <MapPin size={16} className="text-[#236b4b]" />
      <span className="font-semibold">{name ?? 'Sem província atribuída'}</span>
      {locked && <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold uppercase text-[#8a6420]"><Lock size={12} /> Bloqueada</span>}
    </div>
  );
}

export default ProvinceIndicator;