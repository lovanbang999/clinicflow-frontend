import { ReceptionistDashboardLayout } from '@/components/layout/receptionist/ReceptionistDashboardLayout';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function ReceptionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={['RECEPTIONIST']}>
      <ReceptionistDashboardLayout>{children}</ReceptionistDashboardLayout>
    </RouteGuard>
  );
}
