import { PublicRoute } from '@/components/auth/PublicRoute';
import { noIndexMetadata } from '@/lib/seo/metadata';

export const metadata = noIndexMetadata;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicRoute>{children}</PublicRoute>;
}
