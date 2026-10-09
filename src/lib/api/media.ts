import type { ApiEnvelope, MediaAsset } from '@/types';
import { ApiConfigurationError, ApiError } from './client';

type UploadMetadata = { altText?: string; caption?: string; locale?: 'pt' | 'en' };

function getXsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const cookie = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='));
  if (!cookie) return undefined;
  try {
    return decodeURIComponent(cookie.slice('XSRF-TOKEN='.length));
  } catch {
    return cookie.slice('XSRF-TOKEN='.length);
  }
}

export function uploadMedia(
  file: File,
  metadata: UploadMetadata,
  signal: AbortSignal,
  onProgress: (percent: number) => void,
): Promise<MediaAsset> {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '');
  if (!base) return Promise.reject(new ApiConfigurationError());

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('file', file);
    if (metadata.altText) form.append('altText', metadata.altText);
    if (metadata.caption) form.append('caption', metadata.caption);
    if (metadata.locale) form.append('locale', metadata.locale);

    xhr.open('POST', `${base}/api/admin/media`);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Accept', 'application/json');
    const xsrf = getXsrfToken();
    if (xsrf) xhr.setRequestHeader('X-XSRF-TOKEN', xsrf);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let payload: unknown;
      try {
        payload = JSON.parse(xhr.responseText) as unknown;
      } catch {
        payload = null;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        const record = typeof payload === 'object' && payload !== null ? payload as Record<string, unknown> : {};
        const errorRecord = typeof record.error === 'object' && record.error !== null ? record.error as Record<string, unknown> : record;
        reject(new ApiError(xhr.status, {
          code: typeof errorRecord.code === 'string' ? errorRecord.code : 'upload_failed',
          message: typeof errorRecord.message === 'string' ? errorRecord.message : `Upload failed (${xhr.status}).`,
        }));
        return;
      }
      const response = payload as ApiEnvelope<MediaAsset> | null;
      if (!response?.data) {
        reject(new ApiError(xhr.status, { code: 'invalid_response', message: 'The upload response was not valid.' }));
        return;
      }
      onProgress(100);
      resolve(response.data);
    };
    xhr.onerror = () => reject(new ApiError(0, { code: 'network_error', message: 'The upload could not reach the media API.' }));
    xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'));
    signal.addEventListener('abort', () => xhr.abort(), { once: true });
    xhr.send(form);
  });
}
