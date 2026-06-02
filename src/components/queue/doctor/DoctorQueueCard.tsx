'use client';

import { BookingStatus } from '@/types';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { getTaskStyles } from './DoctorQueueCardStyles';
import { BookingCode, BookingTypeBadge, UrgentBadge, TaskBadge } from './DoctorQueueCardBadges';
import { Avatar, PatientDetails, ClinicalTags, WaitTime } from './DoctorQueueCardDetails';
import { CardActions } from './DoctorQueueCardActions';

interface DoctorQueueCardProps {
  item: QueueRecord;
  onCall: (id: string) => void;
  onEnterExam: (id: string) => void;
  onPrint?: (id: string) => void;
  isCallDisabled?: boolean;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();
}

export function DoctorQueueCard({
  item,
  onCall,
  onEnterExam,
  onPrint,
  isCallDisabled,
}: DoctorQueueCardProps) {
  const status = item.booking.status;
  const patient = item.booking.patientProfile;
  const name = patient?.fullName ?? 'N/A';

  // Task Type Detection
  const isSpecialistExam = item.isVisitServiceOrder;
  const visitStep = item.booking.medicalRecord?.visitStep;
  const isResultsReady = visitStep === 'RESULTS_READY';

  const taskType: 'CONSULTATION' | 'EXAMINATION' | 'RESULTS_READY' = isSpecialistExam
    ? 'EXAMINATION'
    : isResultsReady
      ? 'RESULTS_READY'
      : 'CONSULTATION';

  const style = getTaskStyles(taskType);
  const isUrgent = (item.estimatedWaitMinutes || 0) > 40;
  const isNoShow = status === BookingStatus.NO_SHOW;

  return (
    <div
      className={`group bg-white rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-[#1275e2]/5 border border-[#c4c6cf]/20 relative overflow-hidden flex flex-col ${isNoShow ? 'opacity-50 pointer-events-none' : ''
        } ${isUrgent && status === BookingStatus.CHECKED_IN
          ? 'border-[#F7C1C1] bg-gradient-to-b from-white to-[#fffafa]'
          : ''
        } ${isResultsReady ? 'border-[#9FE1CB] bg-gradient-to-b from-white to-[#f8fffc]' : ''}`}
    >
      <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5 flex-1 min-w-0">
          <Avatar initials={getInitials(name)} style={style} isNoShow={isNoShow} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-1.5">
              <h4 className={`font-bold text-lg text-[#191c20] ${isNoShow ? 'line-through' : ''}`}>
                {name}
              </h4>
              <BookingCode code={item.booking.bookingCode} />
              <TaskBadge type={taskType} style={style} />
              <BookingTypeBadge isPreBooked={item.isPreBooked} />
              {isUrgent && status === BookingStatus.CHECKED_IN && (
                <UrgentBadge minutes={item.estimatedWaitMinutes} />
              )}
            </div>

            <PatientDetails
              serviceName={item.booking.service?.name}
              dateOfBirth={patient?.dateOfBirth}
              gender={patient?.gender}
              isPreBooked={item.isPreBooked}
              scheduledTime={item.scheduledTime}
              createdAt={item.booking.createdAt}
            />

            <ClinicalTags allergies={patient?.allergies} chronicConditions={patient?.chronicConditions} />
          </div>
        </div>

        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 shrink-0">
          <WaitTime minutes={item.estimatedWaitMinutes} isUrgent={isUrgent} />
          <CardActions
            status={status}
            taskType={taskType}
            onCall={() => onCall(item.booking.id)}
            onEnterExam={() => onEnterExam(item.booking.id)}
            onPrint={() => onPrint?.(item.booking.id)}
            isCallDisabled={isCallDisabled}
            style={style}
          />
        </div>
      </div>
    </div>
  );
}
