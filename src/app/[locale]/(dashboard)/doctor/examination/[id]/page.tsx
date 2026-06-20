'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { visitServiceOrdersApi } from '@/lib/api/clinical/visit-service-orders';
import type { VisitServiceOrder } from '@/lib/api/clinical/medical-records';
import { SpecialistExaminationView } from '@/components/queue/doctor/examination/SpecialistExaminationView';
import { SpinnerIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';

/** Map a VisitServiceOrder (with its nested booking) into a QueueRecord shape. */
function mapVsoToQueueRecord(vso: VisitServiceOrder): QueueRecord | null {
  const booking = vso.medicalRecord?.booking;
  if (!booking) return null;

  return {
    id: `vso-${vso.id}`,
    bookingId: (booking as { id?: string }).id ?? '',
    doctorId: vso.performedBy ?? '',
    queueDate: new Date().toISOString(),
    queuePosition: vso.queueNumber ?? 1,
    estimatedWaitMinutes: 0,
    isPreBooked: false,
    scheduledTime: null,
    isVisitServiceOrder: true,
    visitServiceOrderId: vso.id,
    booking: {
      ...booking,
      medicalRecord: vso.medicalRecord,
    } as unknown as QueueRecord['booking'],
  };
}

export default function DoctorExamPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('emr.visit.specialist');
  const [record, setRecord] = useState<QueueRecord | null>(null);
  const [vso, setVso] = useState<VisitServiceOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecord = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const order = await visitServiceOrdersApi.getDetail(id);
      setVso(order);
      const mapped = mapVsoToQueueRecord(order);
      if (!mapped) {
        toast.error(t('toasts.fetchError'));
        router.push('/doctor');
        return;
      }
      setRecord(mapped);
    } catch (err) {
      void err;
      toast.error(t('toasts.fetchError'));
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
        <SpinnerIcon size={40} className="animate-spin text-[#1275e2]" />
      </div>
    );
  }

  if (!record || !vso) return null;

  return (
    <div className="flex flex-col h-full bg-[#edf1f8] relative z-10 w-full overflow-hidden shadow-inner hidden-scrollbar">
      <SpecialistExaminationView
        item={record}
        vso={vso}
        onExit={() => router.push('/doctor')}
        onSuccess={() => {
          toast.success(t('toasts.saveSuccess'));
          router.push('/doctor');
        }}
      />
    </div>
  );
}
