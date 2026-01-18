import { LandingNavbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { ServicesPageContent } from '@/components/services/ServicesPageContent';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function ServicesPage() {
  return (
    <RouteGuard>
      <div className="min-h-screen bg-white">
        <LandingNavbar />
        <ServicesPageContent />
        <LandingFooter />
      </div>
    </RouteGuard>
  );
}
