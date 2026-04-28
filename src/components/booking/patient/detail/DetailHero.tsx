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
    <div className="w-14 h-14 rounded-2xl bg-[#1570EF]/10 dark:bg-blue-500/20 text-[#1570EF] dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0 select-none">
      {initials}
    </div>
  );
}

export function DetailHero({ doctorName, serviceName, status, queuePosition }: DetailHeroProps) {
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
      <div className="flex items-start gap-4">
        <DoctorAvatarLarge name={doctorName} />
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {serviceName}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{doctorName}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={status} />
            {queuePosition != null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 rounded-full text-[11px] font-bold">
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
