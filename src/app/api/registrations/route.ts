import type { NextRequest } from 'next/server';
import { proxy } from '@/lib/api-client';

/** Cadastro (cadastrador/admin). A província é imposta pelo Laravel (EnforceProvincialScope). */
export async function GET(request: NextRequest) {
  return proxy(request, '/api/registrations');
}

export async function POST(request: NextRequest) {
  return proxy(request, '/api/registrations');
}