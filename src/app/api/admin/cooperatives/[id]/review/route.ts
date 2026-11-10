import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { badRequest, laravelFetch, safeId, toResponse } from '@/lib/api-client';

const schema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('active') }),
  z.object({ status: z.enum(['rejected', 'inactive']), rejection_reason: z.string().trim().min(10, 'O parecer técnico deve ter pelo menos 10 caracteres.').max(5000) }),
]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = safeId((await params).id);
  if (!id) return badRequest('Identificador inválido.');
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return badRequest('O parecer técnico é obrigatório para rejeitar uma candidatura.', { rejection_reason: parsed.error.issues.map((i) => i.message) });
  }
  return toResponse(await laravelFetch(`/api/admin/cooperatives/${id}/review`, { method: 'POST', body: JSON.stringify(parsed.data) }));
}

export function GET() {
  return NextResponse.json({ error: { status: 405, code: 'method_not_allowed', message: 'Método não suportado.' } }, { status: 405 });
}