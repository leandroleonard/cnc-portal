import type { ApiEnvelope, MediaAsset } from '@/types';
import { adminRequest } from './client';

type UploadMetadata = { altText?: string; caption?: string; locale?: 'pt' | 'en' };

export async function uploadMedia(
  file: File,
  metadata: UploadMetadata,
  signal: AbortSignal,
  onProgress: (percent: number) => void,
): Promise<MediaAsset> {
  const form = new FormData();
  form.append('file', file);
  if (metadata.altText) form.append('altText', metadata.altText);
  if (metadata.caption) form.append('caption', metadata.caption);
  if (metadata.locale) form.append('locale', metadata.locale);
  onProgress(0);
  const response = await adminRequest<ApiEnvelope<MediaAsset>>('/api/admin/media', {
    method: 'POST',
    body: form,
    signal,
  });
  onProgress(100);
  return response.data;
}
