import { LandingNavbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { DoctorsPageContent } from '@/components/patient/doctors/DoctorsPageContent';
import { PublicRoute } from '@/components/auth/PublicRoute';

export default function DoctorsPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-white">
        <LandingNavbar />
        <DoctorsPageContent />
        <LandingFooter />
      </div>
    </PublicRoute>
  );
}
