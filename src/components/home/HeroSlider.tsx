'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Map, Pause, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { HeroSlide, Locale } from '@/types/domain';
import { mediaUrl, staticMedia } from '@/lib/media';
import { prepareHeroSlides } from '@/features/home/hero-slides';

const fallbackSlideId = 'cnc-institutional-fallback';

export function HeroSlider({ slides, locale }: { slides: HeroSlide[]; locale: Locale }) {
  const t = useTranslations('hero');
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pointerStart = useRef<number | null>(null);

  const fallbackSlide = useMemo<HeroSlide>(() => ({
    id: fallbackSlideId,
    kind: 'institutional',
    title: t('title'),
    subtitle: t('eyebrow'),
    description: t('description'),
    logo: { id: 'cnc-logo', url: staticMedia.cncLogo, altText: t('logoAlt') },
    image: { id: 'hero-fallback', url: staticMedia.heroFallback, altText: '' },
    primaryAction: { label: t('primary'), href: '/cooperativas' },
    secondaryAction: { label: t('secondary'), href: '/institucional' },
    order: 0,
    active: true,
    locale,
  }), [locale, t]);
  const normalizedSlides = useMemo(() => prepareHeroSlides(slides, fallbackSlide), [slides, fallbackSlide]);

  const activeSlide = normalizedSlides[Math.min(current, normalizedSlides.length - 1)];
  const slideCount = normalizedSlides.length;
  const imageSrc = mediaUrl(activeSlide.image, staticMedia.heroFallback) ?? staticMedia.heroFallback;
  const logoSrc = mediaUrl(activeSlide.logo, staticMedia.cncLogo);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (slideCount < 2 || paused || hovered || focused || reducedMotion) return;
    const timer = window.setInterval(() => setCurrent((index) => (index + 1) % slideCount), 6500);
    return () => window.clearInterval(timer);
  }, [slideCount, paused, hovered, focused, reducedMotion]);

  function goTo(index: number) {
    setCurrent((index + slideCount) % slideCount);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(current + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(current - 1); }
  }

  function actionLink(href: string, label: string, variant: 'light' | 'secondary') {
    const external = /^https?:\/\//i.test(href);
    return <a className={`button button--${variant}`} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{label} {variant == 'light' && (<ArrowRight size={18} />)}</a>;
  }

  return (
    <section
      className="hero hero-slider"
      aria-roledescription="carousel"
      aria-label={locale === 'pt' ? 'Apresentação institucional e cooperativas' : 'CNC and cooperative highlights'}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
      onPointerDown={(event) => { pointerStart.current = event.clientX; }}
      onPointerUp={(event) => {
        if (pointerStart.current === null) return;
        const delta = event.clientX - pointerStart.current;
        if (Math.abs(delta) > 48) goTo(current + (delta < 0 ? 1 : -1));
        pointerStart.current = null;
      }}
    >
      <Image key={activeSlide.id} className="hero-slider__image" src={imageSrc} alt={activeSlide.image?.altText ?? ''} fill priority={current === 0} sizes="100vw" />
      <div className="hero__overlay" />
      <div className="hero-slider__content container">
        <div className="hero__copy">
          {/* {logoSrc && <div className="hero-slider__logo"><Image src={logoSrc} alt={activeSlide.logo?.altText ?? t('logoAlt')} width={92} height={92} sizes="92px" /></div>} */}
          <p className="eyebrow eyebrow--gold">{activeSlide.subtitle || t('eyebrow')}</p>
          <h1>{activeSlide.title}</h1>
          {activeSlide.description && <p className="hero__lead">{activeSlide.description}</p>}
          <div className="button-row">
            {activeSlide.primaryAction && actionLink(activeSlide.primaryAction.href, activeSlide.primaryAction.label, 'light')}
            {activeSlide.secondaryAction && actionLink(activeSlide.secondaryAction.href, activeSlide.secondaryAction.label, 'secondary')}
          </div>
          <div className="hero__territory">
            <Map size={28} />
            <div>
              <strong>Abrangência nacional</strong>
              <span>Representação de todo o território angolano</span>
            </div>
          </div>
        </div>
        <div className="hero-slider__controls" aria-label={locale === 'pt' ? 'Controlos do carrossel' : 'Carousel controls'}>
          {slideCount > 1 && <>
            <button className="icon-button hero-slider__arrow" onClick={() => goTo(current - 1)} aria-label={t('previous')}><ArrowLeft size={20} /></button>
            <div className="hero-slider__dots" role="group" aria-label={locale === 'pt' ? 'Seleccionar slide' : 'Choose a slide'}>
              {normalizedSlides.map((slide, index) => <button key={slide.id} className={index === current ? 'active' : ''} aria-label={t('slide', { current: index + 1, total: slideCount })} aria-current={index === current ? 'true' : undefined} onClick={() => goTo(index)} />)}
            </div>
            <button className="icon-button hero-slider__arrow" onClick={() => goTo(current + 1)} aria-label={t('next')}><ArrowRight size={20} /></button>
            <button className="icon-button hero-slider__pause" onClick={() => setPaused((value) => !value)} aria-label={paused ? t('play') : t('pause')}>{paused ? <Play size={17} /> : <Pause size={17} />}</button>
          </>}
          <span className="sr-only" aria-live="polite">{t('slide', { current: current + 1, total: slideCount })}: {activeSlide.title}</span>
        </div>
      </div>
    </section>
  );
}
