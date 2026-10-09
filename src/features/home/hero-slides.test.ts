import { describe, expect, it } from 'vitest';
import type { HeroSlide } from '@/types/domain';
import { prepareHeroSlides } from './hero-slides';

const slide = (id: string, kind: HeroSlide['kind'], order: number, active = true): HeroSlide => ({
  id, kind, title: id, order, active, locale: 'pt',
});
const fallback = slide('cnc-fallback', 'institutional', 0);

describe('Hero slider ordering', () => {
  it('pins the active institutional slide first and sorts the remaining slides', () => {
    const result = prepareHeroSlides([
      slide('co-op-2', 'cooperative', 3),
      slide('campaign', 'campaign', 2),
      slide('institutional', 'institutional', 9),
      slide('inactive', 'cooperative', 1, false),
    ], fallback);
    expect(result.map((item) => item.id)).toEqual(['institutional', 'campaign', 'co-op-2']);
  });

  it('uses the CNC brand fallback when no institutional slide is returned', () => {
    const result = prepareHeroSlides([slide('co-op', 'cooperative', 2)], fallback);
    expect(result.map((item) => item.id)).toEqual(['cnc-fallback', 'co-op']);
  });

  it('supports a single slide without duplicating it', () => {
    const only = slide('institutional', 'institutional', 1);
    expect(prepareHeroSlides([only], fallback)).toEqual([only]);
  });
});
