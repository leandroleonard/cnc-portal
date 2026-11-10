import { laravelFetch, toResponse } from '@/lib/api-client';

export async function GET() {
  return toResponse(await laravelFetch('/api/admin/me'));
}