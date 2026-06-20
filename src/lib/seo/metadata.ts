import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import {
  getAbsoluteUrl,
  getLocalizedPath,
  getSiteUrl,
  SITE_BRAND_NAME,
  SITE_NAME,
} from '@/lib/seo/site';

type PageMetadataInput = {
  locale: string;
  path: string;
  title: string;
  description: string;
  noIndex?: boolean;
};

function createAlternates(locale: string, path: string): Metadata['alternates'] | undefined {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return undefined;

  return {
    canonical: getLocalizedPath(locale, path),
    languages: Object.fromEntries(
      routing.locales.map((supportedLocale) => [
        supportedLocale,
        getLocalizedPath(supportedLocale, path),
      ]),
    ),
  };
}

export function createPageMetadata({
  locale,
  path,
  title,
  description,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const absoluteUrl = getAbsoluteUrl(locale, path);

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    applicationName: SITE_NAME,
    title,
    description,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    referrer: 'origin-when-cross-origin',
    alternates: createAlternates(locale, path),
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: absoluteUrl,
      locale,
      alternateLocale: routing.locales.filter((supportedLocale) => supportedLocale !== locale),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export function createRootMetadata(locale: string, title: string, description: string): Metadata {
  return {
    ...createPageMetadata({ locale, path: '/', title, description }),
    title: {
      default: title,
      template: `%s | ${SITE_BRAND_NAME}`,
    },
  };
}

export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};
