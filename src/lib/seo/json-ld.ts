import { getAbsoluteUrl, SITE_NAME } from '@/lib/seo/site';

export type JsonLdObject = Record<string, unknown>;

export function createWebSiteJsonLd(locale: string): JsonLdObject | undefined {
  const url = getAbsoluteUrl(locale, '/');
  if (!url) return undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url,
    inLanguage: locale,
  };
}
