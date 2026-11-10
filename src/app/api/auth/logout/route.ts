import { NextResponse } from 'next/server';
import { laravelFetch, SESSION_COOKIE } from '@/lib/api-client';

export async function POST() {
  await laravelFetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
  const response = NextResponse.json({ data: { revoked: true } });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}