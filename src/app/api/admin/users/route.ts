import type { NextRequest } from 'next/server';
import { proxy } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  return proxy(request, '/api/admin/users');
}

export async function POST(request: NextRequest) {
  return proxy(request, '/api/admin/users');
}