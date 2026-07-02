import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ServicesPageContent } from '@/components/services/ServicesPageContent';
import { createPageMetadata } from '@/lib/seo/metadata';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services.page' });

  return createPageMetadata({
    locale,
    path: '/services',
    title: t('title'),
    description: t('subtitle'),
  });
}

export default function ServicesPage() {
  return <ServicesPageContent />;
}
