import { Skeleton } from '@/components/ui/skeleton';
import { useDoctorTopServices } from '@/lib/hooks/clinical/useDoctorAnalytics';
import { DIAG_COLORS } from './constants';
import { CardShell, CardTitle } from './SharedComponents';
import { useTranslations } from 'next-intl';

export function TopServicesCard() {
  const { data, isLoading } = useDoctorTopServices();
  const t = useTranslations('doctorWorkspace');
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <CardShell>
      <CardTitle title={t('analytics.topServices.title') || 'Top dịch vụ thực hiện'} sub={t('analytics.topServices.sub') || 'Theo số ca đã hoàn thành'} />
      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : data.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-sm text-[#64748b]">
          {t('noData') || 'Chưa có dữ liệu'}
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="text-[11px] font-bold text-[#64748b] w-5 shrink-0">#{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-[#111518] truncate">{d.name}</div>
                <div className="mt-1 h-[5px] bg-[#f1f5f9] rounded-full">
                  <div className="h-full rounded-full" style={{ width: `${(d.count / maxCount) * 100}%`, background: DIAG_COLORS[i] }} />
                </div>
              </div>
              <div className="text-[12px] font-semibold text-[#111518] shrink-0 w-6 text-right">{d.count}</div>
            </div>
          ))}
        </div>
      )}
    </CardShell>
  );
}
