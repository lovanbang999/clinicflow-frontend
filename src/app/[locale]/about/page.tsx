import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LandingNavbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { AboutPageContent } from '@/components/about/AboutPageContent';
import { createPageMetadata } from '@/lib/seo/metadata';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing.about' });

  return createPageMetadata({
    locale,
    path: '/about',
    title: t('title'),
    description: t('subtitle'),
  });
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <AboutPageContent />
      <LandingFooter />
    </div>
  );
}
