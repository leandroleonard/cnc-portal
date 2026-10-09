import type { HeroSlide } from '@/types/domain';

export function prepareHeroSlides(slides: HeroSlide[], fallback: HeroSlide): HeroSlide[] {
  const active = slides.filter((slide) => slide.active).sort((left, right) => left.order - right.order);
  const institutional = active.find((slide) => slide.kind === 'institutional');
  if (!institutional) return [fallback, ...active];
  return [institutional, ...active.filter((slide) => slide.id !== institutional.id)];
}
