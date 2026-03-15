import { LandingNavbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { LandingContent } from '@/components/landing/LandingContent';
import { PublicRoute } from '@/components/auth/PublicRoute';

export default function LandingPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-white">
        <LandingNavbar />
        <LandingContent />
        <LandingFooter />
      </div>
    </PublicRoute>
  );
}
