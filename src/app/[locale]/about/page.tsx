import { LandingNavbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { AboutPageContent } from '@/components/about/AboutPageContent';
import { PublicRoute } from '@/components/auth/PublicRoute';

export default function AboutPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-white">
        <LandingNavbar />
        <AboutPageContent />
        <LandingFooter />
      </div>
    </PublicRoute>
  );
}
