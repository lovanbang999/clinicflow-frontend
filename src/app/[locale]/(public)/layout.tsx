import { LandingNavbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <main className="flex-grow">{children}</main>
      <LandingFooter />
    </div>
  );
}
