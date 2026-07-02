import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LandingContent } from '@/components/landing/LandingContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { createPageMetadata } from '@/lib/seo/metadata';
import { createWebSiteJsonLd } from '@/lib/seo/json-ld';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common.metadata' });

  return createPageMetadata({
    locale,
    path: '/',
    title: t('title'),
    description: t('description'),
  });
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;

  return (
    <>
      <JsonLd data={createWebSiteJsonLd(locale)} />
      <LandingContent />
    </>
  );
}
