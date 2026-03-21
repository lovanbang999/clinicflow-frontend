'use client';

import { useRouter, useParams } from 'next/navigation';
import { DoctorQueueView } from './DoctorQueueView';
import { useQueue } from '@/lib/hooks/useQueue';
import { BookingStatus } from '@/types';

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
  const { queueItems, isLoading, callPatient } = useQueue(doctorId);

  const items = Array.isArray(queueItems) ? queueItems : [];

  const handleCallPatient = async (bookingId: string) => {
    await callPatient(bookingId);
    router.push(`/${locale}/doctor/${bookingId}`);
  };

  const handleEnterExam = (bookingId: string) => {
    router.push(`/${locale}/doctor/${bookingId}`);
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
        isConnected={true}
        onCallPatient={handleCallPatient}
        onEnterExam={handleEnterExam}
        roomLabel={roomLabel}
        avgWaitMins={avgWaitMins}
      />
    </div>
  );
}
