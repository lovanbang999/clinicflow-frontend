import { LandingNavbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Services } from '@/components/landing/Services';
import { CTA } from '@/components/landing/CTA';
import { LandingFooter } from '@/components/landing/Footer';
import { PublicRoute } from '@/components/auth/PublicRoute';

export default function LandingPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-white">
        <LandingNavbar />
        <Hero />
        <Features />
        <Services />
        <CTA />
        <LandingFooter />
      </div>
    </PublicRoute>
  );
}
