import { routing } from './routing';

export { routing } from './routing';
export { Link, redirect, usePathname, useRouter, getPathname } from './navigation';

// Export locales and types
export const locales = routing.locales;
export type Locale = (typeof locales)[number];
