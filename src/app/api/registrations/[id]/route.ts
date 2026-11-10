import type { NextRequest } from 'next/server';
import { badRequest, proxy, safeId } from '@/lib/api-client';

type Ctx = { params: Promise<{ id: string }> };
const handle = (method: string) => async (request: NextRequest, { params }: Ctx) => {
  const id = safeId((await params).id);
  return id ? proxy(request, `/api/registrations/${id}`, method) : badRequest('Identificador inválido.');
};

export const GET = handle('GET');
export const PATCH = handle('PATCH');
export const PUT = handle('PATCH');