'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { queueApi } from '@/lib/api/appointment/queue';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { SpinnerIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { DoctorConsultationView } from '@/components/queue/doctor/DoctorConsultationView';

export default function DoctorConsultationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('doctorWorkspace.examView');
  const [record, setRecord] = useState<QueueRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecord = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await queueApi.getByBookingId(id);
      setRecord(res);
    } catch (err) {
      void err;
      toast.error(t('fetchError'));
      router.push('/doctor');
    } finally {
      setIsLoading(false);
    }
  }, [id, router, t]);

  useEffect(() => {
    void fetchRecord();
  }, [fetchRecord]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f8f9ff]">
        <div className="flex flex-col items-center gap-4">
          <SpinnerIcon size={40} className="animate-spin text-[#1275e2]" />
          <p className="text-sm text-slate-500 font-medium">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!record) return null;

  return (
    <div className="flex flex-col h-full bg-[#edf1f8] relative z-10 w-full overflow-hidden shadow-inner hidden-scrollbar">
      <DoctorConsultationView
        item={record}
        onExit={() => router.push('/doctor')}
        onSuccess={() => router.push('/doctor')}
      />
    </div>
  );
}
