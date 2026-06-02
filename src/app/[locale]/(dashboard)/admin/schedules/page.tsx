'use client';

import { ScheduleStats } from '@/components/dashboard/schedules/ScheduleStats';
import { MasterSchedule } from '@/components/dashboard/schedules/MasterSchedule';
import { AdminLeaveRequests } from '@/components/dashboard/schedules/AdminLeaveRequests';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminSchedulesPage() {
  return (
    <div className="p-8 space-y-8">
      <ScheduleStats />
      
      <Tabs defaultValue="schedules" className="w-full space-y-6">
        <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl h-11 border border-slate-200/50 dark:border-slate-700/50">
          <TabsTrigger value="schedules" className="rounded-lg px-6 text-xs font-bold cursor-pointer">
            Lịch làm việc bác sĩ
          </TabsTrigger>
          <TabsTrigger value="leaves" className="rounded-lg px-6 text-xs font-bold cursor-pointer">
            Yêu cầu nghỉ phép
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedules" className="mt-0 outline-none border-none">
          <MasterSchedule />
        </TabsContent>
        
        <TabsContent value="leaves" className="mt-0 outline-none border-none">
          <AdminLeaveRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
}
