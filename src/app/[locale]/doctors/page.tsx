import { LandingNavbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { DoctorsPageContent } from '@/components/doctors/DoctorsPageContent';

export default function DoctorsPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <DoctorsPageContent />
      <LandingFooter />
    </div>
  );
}
