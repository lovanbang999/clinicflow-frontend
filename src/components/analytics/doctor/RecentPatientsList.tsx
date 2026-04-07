import { Skeleton } from '@/components/ui/skeleton';
import { useDoctorRecentPatients } from '@/lib/hooks/clinical/useDoctorAnalytics';
import { CardShell, CardTitle, Avatar, StatusBadge } from './SharedComponents';

export function RecentPatientsList() {
  const { data, isLoading } = useDoctorRecentPatients();

  return (
    <CardShell>
      <CardTitle title="Bệnh nhân gần đây" sub="10 lượt khám mới nhất" />
      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}</div>
      ) : data.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-sm text-[#64748b]">Chưa có dữ liệu</div>
      ) : (
        <div className="divide-y divide-[#f1f5f9]">
          {data.map((p) => {
            const name = p.patientProfile?.fullName ?? 'Bệnh nhân';
            const time = p.startTime ? p.startTime.slice(0, 5) : '';
            const diag = p.medicalRecord?.diagnosisName;
            const svc = p.service?.name;
            const meta = [p.patientProfile?.patientCode, diag ?? svc, time].filter(Boolean).join(' · ');
            return (
              <div key={p.id} className="flex items-center gap-3 py-2.5 cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar name={name} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[#111518] truncate">{name}</div>
                  <div className="text-[11px] text-[#64748b] truncate">{meta}</div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            );
          })}
        </div>
      )}
    </CardShell>
  );
}
