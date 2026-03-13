export const getInitials = (name: string) => {
  const words = name.split(' ').filter(Boolean);
  if (words.length >= 3) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }
  return words.map((n) => n[0]).join('').substring(0, 2).toUpperCase();
};
