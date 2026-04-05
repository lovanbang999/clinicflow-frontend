'use client';

import { ScheduleStats } from '@/components/admin/schedules/ScheduleStats';
import { MasterSchedule } from '@/components/admin/schedules/MasterSchedule';

export default function AdminSchedulesPage() {
  return (
    <div className="p-8 space-y-8">
      <ScheduleStats />
      <MasterSchedule />
    </div>
  );
}
