import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getAbsoluteUrl, PUBLIC_ROUTES } from '@/lib/seo/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    PUBLIC_ROUTES.flatMap((path) => {
      const url = getAbsoluteUrl(locale, path);
      if (!url) return [];

      return {
        url,
        lastModified: new Date(),
        changeFrequency: path === '/' ? 'weekly' : 'monthly',
        priority: path === '/' ? 1 : 0.7,
      } satisfies MetadataRoute.Sitemap[number];
    }),
  );
}
