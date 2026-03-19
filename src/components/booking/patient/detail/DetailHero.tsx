'use client';

import React from 'react';
import { BookingStatusBadge } from '../BookingStatusBadge';
import { BookingStatus } from '@/types';
import { QueueIcon } from '@phosphor-icons/react';

interface DetailHeroProps {
  doctorName: string;
  serviceName: string;
  status: BookingStatus;
  queuePosition?: number;
}

export function DoctorAvatarLarge({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(-2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
  
  return (
    <div className="w-14 h-14 rounded-2xl bg-[#1570EF]/10 text-[#1570EF] flex items-center justify-center font-bold text-lg shrink-0 select-none">
      {initials}
    </div>
  );
}

export function DetailHero({ doctorName, serviceName, status, queuePosition }: DetailHeroProps) {
  
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start gap-4">
        <DoctorAvatarLarge name={doctorName} />
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            {serviceName}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{doctorName}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={status} />
            {queuePosition != null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[11px] font-bold">
                <QueueIcon size={11} weight="bold" />
                #{queuePosition}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
