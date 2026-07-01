export function resolveAvatarUrl(avatar?: string | null): string | null {
  if (!avatar) return null;

  if (
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('data:') ||
    avatar.startsWith('blob:')
  ) {
    return avatar;
  }

  if (avatar.startsWith('/images/') || avatar.startsWith('/_next/')) {
    return avatar;
  }

  if (avatar.startsWith('/')) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    return apiBaseUrl ? `${apiBaseUrl}${avatar}` : avatar;
  }

  return avatar;
}
