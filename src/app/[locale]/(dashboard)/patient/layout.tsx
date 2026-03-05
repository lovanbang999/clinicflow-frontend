import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={['PATIENT']}>
      <DashboardLayout>{children}</DashboardLayout>
    </RouteGuard>
  );
}
