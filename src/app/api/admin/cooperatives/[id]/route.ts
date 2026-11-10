import type { NextRequest } from 'next/server';
import { badRequest, proxy, safeId } from '@/lib/api-client';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  const id = safeId((await params).id);
  return id ? proxy(request, `/api/admin/cooperatives/${id}`) : badRequest('Identificador inválido.');
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const id = safeId((await params).id);
  return id ? proxy(request, `/api/admin/cooperatives/${id}`, 'PATCH') : badRequest('Identificador inválido.');
}