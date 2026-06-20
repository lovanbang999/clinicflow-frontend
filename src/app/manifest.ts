import type { MetadataRoute } from 'next';
import { SITE_NAME, SITE_THEME_COLOR } from '@/lib/seo/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'SmartClinic',
    description: 'Smart medical appointment and clinic queue management system.',
    start_url: '/vi',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: SITE_THEME_COLOR,
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
