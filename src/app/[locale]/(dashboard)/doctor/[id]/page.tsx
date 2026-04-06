'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { queueApi } from '@/lib/api/appointment/queue';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { DoctorExamView } from '@/components/queue/doctor/DoctorExamView';
import { SpinnerIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function DoctorExamPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const locale = params.locale as string;
  const t = useTranslations('doctorWorkspace.examView');
  const [record, setRecord] = useState<QueueRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    async function fetchRecord() {
      try {
        setIsLoading(true);
        const res = await queueApi.getByBookingId(id);
        setRecord(res);
      } catch (err) {
        console.error(err);
        toast.error(t('fetchError'));
        router.push(`/${locale}/doctor`);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchRecord();
  }, [id, locale, router, t]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f8f9ff]">
        <SpinnerIcon size={40} className="animate-spin text-[#1275e2]" />
      </div>
    );
  }

  if (!record) {
    return null; // Redirect handles empty state
  }

  return (
    <div className="flex flex-col h-full bg-[#edf1f8] relative z-10 w-full overflow-hidden shadow-inner hidden-scrollbar">
      <DoctorExamView
        item={record}
        onExit={() => router.push(`/${locale}/doctor`)}
        onRefreshQueue={() => {}}
      />
    </div>
  );
}
