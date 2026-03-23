'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLabOrder, useLabOrderActions } from '@/lib/hooks/useLabOrders';
import { 
  SpinnerIcon, 
  ArrowLeftIcon 
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { LabPatientInfo } from '@/components/technician/LabPatientInfo';
import { LabOrderInfo } from '@/components/technician/LabOrderInfo';
import { LabResultForm } from '@/components/technician/LabResultForm';

export default function TechnicianResultPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = use(params);
  const t = useTranslations('dashboard.technician.result');
  const router = useRouter();

  const { order, isLoading } = useLabOrder(id);
  const { uploadFile, submitResult, isUploading, isSubmitting } = useLabOrderActions();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <SpinnerIcon size={32} weight="bold" className="animate-spin text-[#1392ec]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-slate-500 font-medium">Order not found.</p>
        <button 
          className="mt-4 flex items-center text-[#1392ec] hover:underline cursor-pointer font-medium" 
          onClick={() => router.back()}
        >
          <ArrowLeftIcon size={18} weight="bold" className="mr-1.5" />
          {t('back')}
        </button>
      </div>
    );
  }

  const handleSaveResult = async (resultText: string, file: File | null) => {
    try {
      let resultFileUrl;
      if (file) {
        const url = await uploadFile(file);
        if (url) resultFileUrl = url;
      }

      await submitResult(order.id, {
        resultText,
        resultFileUrl,
      });

      toast.success(t('messages.success'));
      router.push(`/${locale}/technician/lab-worklist`);
    } catch (error) {
      toast.error(t('messages.error'));
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f3f4] overflow-y-auto">
      <div className="p-8 shrink-0 max-w-5xl mx-auto w-full">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm font-medium text-[#64748b] hover:text-[#1392ec] mb-6 transition-colors cursor-pointer group"
        >
          <ArrowLeftIcon size={18} weight="bold" className="mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
          {t('back')}
        </button>

        <h1 className="text-2xl font-bold text-[#111518] tracking-tight mb-8">
          {t('title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pb-12">
          {/* Left Column: Info */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <LabPatientInfo 
              patientProfile={order.patientProfile} 
              bookingCode={order.booking?.bookingCode} 
            />
            <LabOrderInfo order={order} />
          </div>

          {/* Right Column: Result Form */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <LabResultForm 
              isUploading={isUploading}
              isSubmitting={isSubmitting}
              onSubmit={handleSaveResult}
              onCancel={() => router.back()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
