import { RouteGuard } from '@/components/auth/RouteGuard';

export default function ReceptionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard allowedRoles={['RECEPTIONIST']}>{children}</RouteGuard>;
}
