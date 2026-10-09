'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { BarChart3, Menu, Search, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import type { Locale } from '@/types/domain';
import { Button, Container } from '@/components/ui/primitives';
import { staticMedia } from '@/lib/media';

const navigation = [
  { key: 'home', href: '/' as const },
  { key: 'cooperatives', href: '/cooperativas' as const },
  { key: 'news', href: '/actualidade' as const },
  { key: 'institutional', href: '/institucional' as const },
  { key: 'documents', href: '/documentos' as const },
  { key: 'statistics', href: '/estatisticas' as const },
  { key: 'contacts', href: '/contactos' as const },
];

function Brand({ inverse = false }: { inverse?: boolean }) {
  const t = useTranslations('brand');
  return (
    <Link href="/" className={`brand ${inverse ? 'brand--inverse' : ''}`} aria-label={`CNC — ${t('name')}`}>
      <span className="brand__mark"><Image src={staticMedia.cncLogo} alt="" width={56} height={56} sizes="56px" /></span>
      <span className="brand__words"><strong>CNC</strong><small>{t('name')}</small></span>
    </Link>
  );
}

export function PublicHeader() {
  const t = useTranslations('nav');
  const brandT = useTranslations('brand');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams<{ slug?: string }>();
  const router = useRouter();
  const [menuState, setMenuState] = useState({ pathname: '', open: false });
  const [searchState, setSearchState] = useState({ pathname: '', open: false });
  const menuOpen = menuState.pathname === pathname && menuState.open;
  const searchOpen = searchState.pathname === pathname && searchState.open;
  const setMenuOpen = (next: boolean | ((current: boolean) => boolean)) => setMenuState({ pathname, open: typeof next === 'function' ? next(menuOpen) : next });
  const setSearchOpen = (next: boolean | ((current: boolean) => boolean)) => setSearchState({ pathname, open: typeof next === 'function' ? next(searchOpen) : next });
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    inputRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSearchState({ pathname, open: false });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [searchOpen, pathname]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setSearchOpen(false);
    router.push({ pathname: '/pesquisa', query: { q: value } });
  }

  function changeLanguage() {
    const nextLocale: Locale = locale === 'pt' ? 'en' : 'pt';
    if (pathname === '/cooperativas/[slug]' && params.slug) {
      router.replace({ pathname: '/cooperativas/[slug]', params: { slug: params.slug } }, { locale: nextLocale });
      return;
    }
    if (pathname === '/actualidade/[slug]' && params.slug) {
      router.replace({ pathname: '/actualidade/[slug]', params: { slug: params.slug } }, { locale: nextLocale });
      return;
    }
    const staticPathnames = ['/', '/cooperativas', '/actualidade', '/institucional', '/documentos', '/estatisticas', '/contactos', '/pesquisa'] as const;
    const staticPath = staticPathnames.find((item) => item === pathname) ?? '/';
    router.replace(staticPath, { locale: nextLocale });
  }

  return (
    <>
      <div className="utility-bar">
        <Container className="utility-bar__inner">
          <span>{brandT('portal')}</span>
          <Link href="/estatisticas"><BarChart3 size={14} aria-hidden="true" /> {t('statistics')}</Link>
        </Container>
      </div>
      <header className="site-header">
        <Container className="site-header__inner">
          <Brand />
          <nav className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`} aria-label={t('home')}>
            {navigation.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={pathname === item.href ? 'active' : ''}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {t(item.key)}
              </Link>
            ))}
            <Link href="/cooperativas" className="nav-feature">{t('findCooperative')}</Link>
          </nav>
          <div className="header-actions">
            <Button variant="ghost" className="icon-button" aria-label={t('search')} onClick={() => setSearchOpen(true)}>
              <Search size={21} aria-hidden="true" />
            </Button>
            <button className="language-toggle" aria-label={t('language')} onClick={changeLanguage}>{locale.toUpperCase()}</button>
            <Button variant="ghost" className="icon-button menu-toggle" aria-label={menuOpen ? t('closeMenu') : t('openMenu')} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </Button>
          </div>
        </Container>
      </header>
      {searchOpen && (
        <div className="search-panel" role="dialog" aria-modal="true" aria-label={t('searchLabel')} onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
          <Container>
            <div className="search-panel__top">
              <p className="eyebrow eyebrow--gold">{t('search')}</p>
              <Button variant="ghost" className="icon-button" aria-label={t('closeMenu')} onClick={() => setSearchOpen(false)}><X /></Button>
            </div>
            <form className="global-search" onSubmit={submitSearch}>
              <Search size={28} aria-hidden="true" />
              <input ref={inputRef} className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchLabel')} aria-label={t('searchLabel')} />
              <button className="button button--light" type="submit">{t('search')}</button>
            </form>
            <p className="search-panel__hint">{locale === 'pt' ? 'Os resultados são pesquisados nos conteúdos publicados pelo CNC.' : 'Results are searched across content published by CNC.'}</p>
          </Container>
        </div>
      )}
    </>
  );
}
