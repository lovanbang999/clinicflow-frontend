import { LandingNavbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { ServiceDetailPageContent } from '@/components/services/ServiceDetailPageContent';
import { PublicRoute } from '@/components/auth/PublicRoute';

export default function ServiceDetailPage() {
  return (
    <PublicRoute>
      <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300 flex flex-col">
        <LandingNavbar />
        <ServiceDetailPageContent />
        <LandingFooter />
      </div>
    </PublicRoute>
  );
}
