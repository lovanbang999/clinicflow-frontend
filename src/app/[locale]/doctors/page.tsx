import { LandingNavbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { DoctorsPageContent } from '@/components/doctors/DoctorsPageContent';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function DoctorsPage() {
  return (
    <RouteGuard>
      <div className="min-h-screen bg-white">
        <LandingNavbar />
        <DoctorsPageContent />
        <LandingFooter />
      </div>
    </RouteGuard>
  );
}
