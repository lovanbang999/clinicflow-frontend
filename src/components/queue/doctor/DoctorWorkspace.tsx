'use client';

import { useRouter, useParams } from 'next/navigation';
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
  const params = useParams();
  const locale = params.locale as string;
  const { queueItems, isLoading, callPatient, isConnected } = useQueue(doctorId);

  const items = Array.isArray(queueItems) ? queueItems : [];

  const handleCallPatient = async (bookingId: string) => {
    const item = items.find(q => q.booking.id === bookingId);

    if (item?.isVisitServiceOrder && item.visitServiceOrderId) {
      // VSO (specialist) flow — the booking may still be CONFIRMED (direct-service walk-in)
      // so we must NOT call bookingsApi.startExamination() which requires CHECKED_IN.
      // Instead, directly start the VisitServiceOrder and navigate to the examination page.
      try {
        await medicalRecordsApi.startSpecialistExamination(item.visitServiceOrderId);
      } catch (err) {
        console.error('[VSO] Failed to start specialist examination:', err);
        // Navigate anyway — ExaminationCenterForm will retry the start on mount
      }
      router.push(`/${locale}/doctor/examination/${item.visitServiceOrderId}`);
    } else {
      // Normal consultation flow — transitions CHECKED_IN → IN_PROGRESS via booking start
      await callPatient(bookingId);
      router.push(`/${locale}/doctor/consultation/${bookingId}`);
    }
  };

  const handleEnterExam = async (bookingId: string) => {
    const item = items.find(q => q.booking.id === bookingId);
    
    if (item?.isVisitServiceOrder && item.visitServiceOrderId) {
      router.push(`/${locale}/doctor/examination/${item.visitServiceOrderId}`);
      return;
    }

    // Patient returning from labs with results ready.
    // Transition AWAITING_RESULTS → IN_PROGRESS ("Gọi BN vào lần 2") before entering
    // the consultation page so the doctor can review results and write prescriptions.
    if (item?.booking.status === BookingStatus.AWAITING_RESULTS) {
      try {
        await bookingsApi.startExamination(bookingId);
      } catch (err) {
        // Log but don't block navigation — consultation page handles results display
        console.error('[B7] Failed to transition AWAITING_RESULTS → IN_PROGRESS:', err);
      }
    }

    router.push(`/${locale}/doctor/consultation/${bookingId}`);
  };

  const validWaitMins = items.filter(q => q.estimatedWaitMinutes && q.booking.status === BookingStatus.CHECKED_IN);
  const avgWaitMins = validWaitMins.length > 0 
    ? Math.round(validWaitMins.reduce((acc, curr) => acc + (curr.estimatedWaitMinutes || 0), 0) / validWaitMins.length)
    : 0;

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
