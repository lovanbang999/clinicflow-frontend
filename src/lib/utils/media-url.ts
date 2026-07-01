export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  if (url.startsWith('/images/') || url.startsWith('/_next/')) {
    return url;
  }

  if (url.startsWith('/')) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    return apiBaseUrl ? `${apiBaseUrl}${url}` : url;
  }

  return url;
}
