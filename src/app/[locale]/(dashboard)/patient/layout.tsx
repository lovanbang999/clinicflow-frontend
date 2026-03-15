import { PatientPortalLayout } from '@/components/layout/PatientPortalLayout';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={['PATIENT']}>
      <PatientPortalLayout>{children}</PatientPortalLayout>
    </RouteGuard>
  );
}
