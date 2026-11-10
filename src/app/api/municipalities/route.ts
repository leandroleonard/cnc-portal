import type { NextRequest } from 'next/server';
import { proxy } from '@/lib/api-client';

/** ?provinceId=<uuid> */
export async function GET(request: NextRequest) {
  return proxy(request, '/api/municipalities');
}