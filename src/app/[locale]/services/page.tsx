import { LandingNavbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { ServicesPageContent } from '@/components/services/ServicesPageContent';
import { PublicRoute } from '@/components/auth/PublicRoute';

export default function ServicesPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-white">
        <LandingNavbar />
        <ServicesPageContent />
        <LandingFooter />
      </div>
    </PublicRoute>
  );
}
