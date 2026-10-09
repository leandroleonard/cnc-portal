import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/cooperativas': { pt: '/cooperativas', en: '/cooperatives' },
    '/cooperativas/[slug]': { pt: '/cooperativas/[slug]', en: '/cooperatives/[slug]' },
    '/actualidade': { pt: '/actualidade', en: '/news' },
    '/actualidade/[slug]': { pt: '/actualidade/[slug]', en: '/news/[slug]' },
    '/institucional': { pt: '/institucional', en: '/about' },
    '/documentos': { pt: '/documentos', en: '/documents' },
    '/estatisticas': { pt: '/estatisticas', en: '/statistics' },
    '/contactos': { pt: '/contactos', en: '/contact' },
    '/pesquisa': { pt: '/pesquisa', en: '/search' },
  },
});
