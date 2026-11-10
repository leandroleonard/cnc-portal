import type { NextRequest } from 'next/server';
import { proxy } from '@/lib/api-client';

/** GET — fila de moderação (status, province, cadastrador, submittedFrom, submittedTo, search, sort, direction, page, perPage). */
export async function GET(request: NextRequest) {
  return proxy(request, '/api/admin/cooperatives');
}