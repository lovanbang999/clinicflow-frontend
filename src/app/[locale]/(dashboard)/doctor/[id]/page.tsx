'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { queueApi } from '@/lib/api/appointment/queue';
import { SpinnerIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';

/**
 * Backward compatibility redirect for /doctor/[id]
 * This route is now split into /doctor/consultation/[id] and /doctor/examination/[id]
 */
export default function DoctorRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const locale = params.locale as string;
  const t = useTranslations('doctorWorkspace.examView');

  const determineRoute = useCallback(async () => {
    if (!id) return;
    try {
      const res = await queueApi.getByBookingId(id);
      
      // If no service assigned, redirect to consultation
      if (!res.booking.serviceId) {
        router.replace(`/${locale}/doctor/consultation/${id}`);
      } else {
        router.replace(`/${locale}/doctor/examination/${id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(t('fetchError'));
      router.push(`/${locale}/doctor`);
    } finally {
      // Done fetching
    }
  }, [id, locale, router, t]);

  useEffect(() => {
    void determineRoute();
  }, [determineRoute]);

  return (
    <div className="flex h-full items-center justify-center bg-[#f8f9ff]">
      <div className="flex flex-col items-center gap-4">
        <SpinnerIcon size={40} className="animate-spin text-[#1275e2]" />
        <p className="text-sm text-slate-500 font-medium">Đang chuyển hướng đến phòng khám...</p>
      </div>
    </div>
  );
}
