import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LandingNavbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { DoctorProfilePageContent } from '@/components/patient/doctors/DoctorProfilePageContent';
import { createPageMetadata } from '@/lib/seo/metadata';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'doctors.profile' });

  return createPageMetadata({
    locale,
    path: `/doctors/${id}`,
    title: t('aboutDoctor'),
    description: t('notFoundDesc'),
    noIndex: true,
  });
}

export default function DoctorProfilePage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <DoctorProfilePageContent />
      <LandingFooter />
    </div>
  );
}
