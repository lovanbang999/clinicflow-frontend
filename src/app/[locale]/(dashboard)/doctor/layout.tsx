
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DoctorDashboardLayout } from '@/components/layout/doctor/DoctorDashboardLayout';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={['DOCTOR']}>
      <DoctorDashboardLayout>{children}</DoctorDashboardLayout>
    </RouteGuard>
  );
}
