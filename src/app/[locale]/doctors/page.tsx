import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LandingNavbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { DoctorsPageContent } from '@/components/patient/doctors/DoctorsPageContent';
import { createPageMetadata } from '@/lib/seo/metadata';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'doctors.page' });

  return createPageMetadata({
    locale,
    path: '/doctors',
    title: `${t('meetOur')}${t('specialists')}`,
    description: t('subtitle'),
  });
}

type DoctorsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    serviceId?: string;
    query?: string;
    date?: string;
  }>;
};

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <DoctorsPageContent initialSearchParams={resolvedSearchParams} />
      <LandingFooter />
    </div>
  );
}
