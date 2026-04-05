import { LandingNavbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { DoctorProfilePageContent } from '@/components/patient/doctors/DoctorProfilePageContent';
import { PublicRoute } from '@/components/auth/PublicRoute';

export default function DoctorProfilePage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-white">
        <LandingNavbar />
        <DoctorProfilePageContent />
        <LandingFooter />
      </div>
    </PublicRoute>
  );
}
