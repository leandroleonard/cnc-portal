import type { NextRequest } from 'next/server';
import { badRequest, laravelFetch, safeId, toResponse } from '@/lib/api-client';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = safeId((await params).id);
  if (!id) return badRequest('Identificador inválido.');
  return toResponse(await laravelFetch(`/api/registrations/${id}/submit`, { method: 'POST' }));
}