import { RouteGuard } from '@/components/auth/RouteGuard';
import { TechnicianDashboardLayout } from '@/components/layout/technician/TechnicianDashboardLayout';

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={['TECHNICIAN']}>
      <TechnicianDashboardLayout>{children}</TechnicianDashboardLayout>
    </RouteGuard>
  );
}
