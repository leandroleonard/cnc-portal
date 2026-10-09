import type { Media } from '@/types/domain';

export const staticMedia = {
  cncLogo: '/images/cnc-logo.jpeg',
  heroFallback: '/images/cnc-hero-angola.jpg',
  angolaProvinces: '/images/angola-provinces-21.webp',
} as const;

export function mediaUrl(media: Media | string | null | undefined, fallback?: string): string | undefined {
  if (typeof media === 'string' && media.trim()) return media;
  if (media && typeof media === 'object' && media.url) return media.url;
  return fallback;
}
