import { RouteGuard } from '@/components/auth/RouteGuard';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard allowedRoles={['DOCTOR']}>{children}</RouteGuard>;
}
