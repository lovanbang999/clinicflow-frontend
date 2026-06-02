'use client';

import { useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { DoctorQueueView } from './DoctorQueueView';
import { useQueue } from '@/lib/hooks/appointment/useQueue';
import { BookingStatus } from '@/types';
import { medicalRecordsApi } from '@/lib/api/clinical/medical-records';
import { bookingsApi } from '@/lib/api/appointment/bookings';

interface DoctorWorkspaceProps {
  doctorId: string;
  doctorName?: string;
  doctorSpecialty?: string;
  roomLabel?: string;
}

export function DoctorWorkspace({
  doctorId,
  roomLabel,
}: DoctorWorkspaceProps) {
  const router = useRouter();
  const { queueItems, isLoading, callPatient, isConnected } = useQueue(doctorId);

  const items = useMemo(() => (Array.isArray(queueItems) ? queueItems : []), [queueItems]);

  const handleCallPatient = async (bookingId: string) => {
    const item = items.find((q) => q.booking.id === bookingId);

    if (item?.isVisitServiceOrder && item.visitServiceOrderId) {
      // VSO (specialist) flow: directly start the VisitServiceOrder and navigate.
      // Booking might still be CONFIRMED, so avoid bookingsApi.startExamination().
      try {
        await medicalRecordsApi.startSpecialistExamination(item.visitServiceOrderId);
      } catch (err) {
        void err;
        // Navigate anyway; ExaminationCenterForm retries on mount
      }
      router.push(`/doctor/examination/${item.visitServiceOrderId}`);
    } else {
      // Normal consultation: transitions CHECKED_IN to IN_PROGRESS via booking start.
      await callPatient(bookingId);
      router.push(`/doctor/consultation/${bookingId}`);
    }
  };

  const handleEnterExam = async (bookingId: string) => {
    const item = items.find((q) => q.booking.id === bookingId);

    if (item?.isVisitServiceOrder && item.visitServiceOrderId) {
      router.push(`/doctor/examination/${item.visitServiceOrderId}`);
      return;
    }

    // Re-entering consultation (e.g., patient returning with lab results):
    // Transition AWAITING_RESULTS to IN_PROGRESS before opening the page.
    if (item?.booking.status === BookingStatus.AWAITING_RESULTS) {
      try {
        await bookingsApi.startExamination(bookingId);
      } catch (err) {
        void err;
        // Do not block navigation; consultation page handles result display
      }
    }

    router.push(`/doctor/consultation/${bookingId}`);
  };

  const avgWaitMins = useMemo(() => {
    const validWaitMins = items.filter(
      (q) => q.estimatedWaitMinutes && q.booking.status === BookingStatus.CHECKED_IN
    );
    return validWaitMins.length > 0
      ? Math.round(
          validWaitMins.reduce((acc, curr) => acc + (curr.estimatedWaitMinutes || 0), 0) /
            validWaitMins.length
        )
      : 0;
  }, [items]);

  return (
    <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden bg-[#edf1f8] shadow-inner relative z-10">
      <DoctorQueueView
        queueItems={items}
        isLoading={isLoading}
        isConnected={isConnected}
        onCallPatient={handleCallPatient}
        onEnterExam={handleEnterExam}
        roomLabel={roomLabel}
        avgWaitMins={avgWaitMins}
      />
    </div>
  );
}
