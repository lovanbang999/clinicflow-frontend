import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={['DOCTOR']}>
      <DashboardLayout>{children}</DashboardLayout>
    </RouteGuard>
  );
}
