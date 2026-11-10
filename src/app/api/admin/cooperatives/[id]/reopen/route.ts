import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { badRequest, laravelFetch, safeId, toResponse } from '@/lib/api-client';

const schema = z.object({ note: z.string().trim().min(10).max(5000) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = safeId((await params).id);
  if (!id) return badRequest('Identificador inválido.');
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest('Indique as correcções solicitadas (mínimo 10 caracteres).', { note: ['Campo obrigatório.'] });
  return toResponse(await laravelFetch(`/api/admin/cooperatives/${id}/reopen`, { method: 'POST', body: JSON.stringify(parsed.data) }));
}