import { CalendarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoctorTodaySchedule } from '@/lib/hooks/clinical/useDoctorAnalytics';
import { STATUS_META, COLORS } from './constants';
import { CardShell, StatusBadge } from './SharedComponents';

export function TodayTimeline() {
  const { data, isLoading } = useDoctorTodaySchedule();
  const today = new Date();
  const todayStr = today.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const pending = data.filter((d) => ['PENDING','CHECKED_IN'].includes(d.status)).length;

  return (
    <CardShell>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-[#111518]">Lịch hôm nay</p>
          <p className="text-[11px] text-[#64748b] mt-0.5 capitalize">{todayStr}</p>
        </div>
        {pending > 0 && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: COLORS.AMBER + '1A', color: COLORS.AMBER }}>
            {pending} ca chờ
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-xl" />)}</div>
      ) : data.length === 0 ? (
        <div className="h-32 flex flex-col items-center justify-center text-sm text-[#64748b] gap-2">
          <CalendarIcon size={24} className="text-[#e5e7eb]" />
          Không có lịch hôm nay
        </div>
      ) : (
        <>
          <div className="divide-y divide-[#f1f5f9]">
            {data.map((appt) => {
              const isActive = appt.status === 'IN_PROGRESS';
              return (
                <div
                  key={appt.id}
                  className={`flex items-center gap-2.5 py-2 text-[12px] rounded-lg transition-colors ${isActive ? 'bg-[#E6F1FB] px-2 -mx-2' : ''}`}
                >
                  <div className={`text-[11px] w-11 shrink-0 ${isActive ? 'text-[#0C447C] font-semibold' : 'text-[#64748b]'}`}>
                    {appt.startTime?.slice(0, 5)}
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: STATUS_META[appt.status]?.color ?? COLORS.GRAY }} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${isActive ? 'text-[#0C447C]' : 'text-[#111518]'}`}>
                      {appt.patientProfile?.fullName ?? 'Bệnh nhân'}
                    </div>
                  </div>
                  <div className={`text-[10px] shrink-0 ${isActive ? 'text-[#185FA5]' : 'text-[#64748b]'}`}>
                    {appt.service?.name ?? ''}
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              );
            })}
          </div>
          <div className="pt-3 mt-2 border-t border-[#e5e7eb] flex gap-4 text-[11px] text-[#64748b]">
            <span>Còn lại hôm nay: <strong className="text-[#111518]">{pending} ca</strong></span>
          </div>
        </>
      )}
    </CardShell>
  );
}
