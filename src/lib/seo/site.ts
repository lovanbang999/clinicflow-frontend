import { routing } from '@/i18n/routing';

export const SITE_NAME = 'Smart Clinic';
export const SITE_BRAND_NAME = 'SmartClinic';
export const SITE_THEME_COLOR = '#1392ec';

export const PUBLIC_ROUTES = ['/', '/about', '/services', '/doctors'] as const;

export const PRIVATE_ROUTE_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/change-password',
  '/admin',
  '/doctor',
  '/receptionist',
  '/patient',
  '/technician',
] as const;

export type AppLocale = (typeof routing.locales)[number];

function normalizeSiteUrl(value?: string): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return undefined;
  }
}

export function getSiteUrl(): string | undefined {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)
    ?? normalizeSiteUrl(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
}

export function getLocalizedPath(locale: string, path: string): string {
  const normalizedPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalizedPath}`;
}

export function getAbsoluteUrl(locale: string, path: string): string | undefined {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return undefined;

  return `${siteUrl}${getLocalizedPath(locale, path)}`;
}

export function getPrivateRobotsPaths(): string[] {
  return routing.locales.flatMap((locale) =>
    PRIVATE_ROUTE_PREFIXES.map((prefix) => getLocalizedPath(locale, prefix)),
  );
}
