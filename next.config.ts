import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const getApiUploadPattern = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return undefined;

  try {
    const url = new URL(apiUrl);
    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port,
      pathname: '/uploads/**',
    };
  } catch {
    return undefined;
  }
};

const apiUploadPattern = getApiUploadPattern();

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  images: {
    unoptimized: process.env.PLAYWRIGHT_TEST === 'true',
    remotePatterns: [
      // Development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/**',
      },
      { protocol: 'http', hostname: '127.0.0.1', port: '8080', pathname: '/uploads/**' },
      // google
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      // cloudinary
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      ...(apiUploadPattern ? [apiUploadPattern] : []),
    ],
  }
};

export default withNextIntl(nextConfig);
