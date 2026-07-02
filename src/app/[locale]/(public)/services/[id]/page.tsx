import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ServiceDetailPageContent } from '@/components/services/ServiceDetailPageContent';
import { createPageMetadata } from '@/lib/seo/metadata';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'services.detail' });

  return createPageMetadata({
    locale,
    path: `/services/${id}`,
    title: t('overview'),
    description: t('notFoundDesc'),
    noIndex: true,
  });
}

export default function ServiceDetailPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300 flex flex-col">
      <ServiceDetailPageContent />
    </div>
  );
}
