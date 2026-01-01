import { LandingNavbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { ServicesPageContent } from '@/components/services/ServicesPageContent';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <ServicesPageContent />
      <LandingFooter />
    </div>
  );
}
