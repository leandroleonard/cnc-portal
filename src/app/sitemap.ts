import type { MetadataRoute } from 'next';
import { getCooperatives, getNews } from '@/lib/api/public';
import { loadApi } from '@/lib/api/loader';
import { siteUrl } from '@/lib/utils/site';
import type { Paginated } from '@/types/domain';

// Content changes independently from frontend deploys, so query the API at request time.
export const dynamic = 'force-dynamic';

const staticPaths = {
  pt: ['', 'cooperativas', 'actualidade', 'institucional', 'documentos', 'estatisticas', 'contactos', 'pesquisa'],
  en: ['', 'cooperatives', 'news', 'about', 'documents', 'statistics', 'contact', 'search'],
} as const;
const maxDynamicEntries = 49_000;
const sitemapPageSize = 100;
const maxPagesPerCollection = 125;
const pageBatchSize = 5;

type SitemapRecord = { slug: string; publishedAt?: string; updatedAt?: string | null };

async function allPublishedPages<T extends SitemapRecord>(
  fetchPage: (page: number) => Promise<Paginated<T>>,
): Promise<T[]> {
  const first = await loadApi(() => fetchPage(1));
  if (first.error) return [];
  const { data, meta } = first.data;
  const results = [...data];
  const pageLimit = Math.min(meta.lastPage, maxPagesPerCollection);
  for (let start = 2; start <= pageLimit; start += pageBatchSize) {
    const pages = Array.from({ length: Math.min(pageBatchSize, pageLimit - start + 1) }, (_, index) => start + index);
    const batch = await Promise.all(pages.map((page) => loadApi(() => fetchPage(page))));
    for (const result of batch) if (result.data) results.push(...result.data.data);
  }
  return results;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const routes = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const locale of ['pt', 'en'] as const) {
    for (const path of staticPaths[locale]) {
      const url = `${base}/${locale}${path ? `/${path}` : ''}`;
      routes.set(url, { url, changeFrequency: 'weekly', priority: path ? 0.7 : 1 });
    }
  }

  for (const locale of ['pt', 'en'] as const) {
    if (routes.size >= maxDynamicEntries) break;
    const [news, cooperatives] = await Promise.all([
      allPublishedPages((page) => getNews({ locale, page, perPage: sitemapPageSize, sort: 'publishedAt', direction: 'desc' })),
      allPublishedPages((page) => getCooperatives({ locale, page, perPage: sitemapPageSize, sort: 'name', direction: 'asc' })),
    ]);
    const prefix = locale === 'pt' ? { news: 'actualidade', coops: 'cooperativas' } : { news: 'news', coops: 'cooperatives' };
    for (const article of news) {
      if (routes.size >= maxDynamicEntries) break;
      const url = `${base}/${locale}/${prefix.news}/${encodeURIComponent(article.slug)}`;
      routes.set(url, { url, lastModified: article.publishedAt, changeFrequency: 'monthly', priority: 0.6 });
    }
    for (const cooperative of cooperatives) {
      if (routes.size >= maxDynamicEntries) break;
      const url = `${base}/${locale}/${prefix.coops}/${encodeURIComponent(cooperative.slug)}`;
      routes.set(url, { url, lastModified: cooperative.updatedAt ?? undefined, changeFrequency: 'monthly', priority: 0.5 });
    }
  }

  return [...routes.values()];
}
