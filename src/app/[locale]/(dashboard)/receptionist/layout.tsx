import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function ReceptionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={['RECEPTIONIST']}>
      <DashboardLayout>{children}</DashboardLayout>
    </RouteGuard>
  );
}
