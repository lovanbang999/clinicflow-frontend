import { Skeleton } from '@/components/ui/skeleton';
import { useDoctorSummary } from '@/lib/hooks/clinical/useDoctorAnalytics';
import { Period, COLORS } from './constants';
import { CardShell, CardTitle } from './SharedComponents';
import { useTranslations } from 'next-intl';

export function SourceBreakdown({ period }: { period: Period }) {
  const { data, isLoading } = useDoctorSummary(period);
  const t = useTranslations('doctorWorkspace');

  const src = data?.sourceBreakdown ?? { online: 0, walkIn: 0, phone: 0 };
  const total = src.online + src.walkIn + src.phone || 1;
  const rows = [
    { label: t('analytics.sourceBreakdown.online') || 'Đặt trước (Online)', value: src.online, color: COLORS.BLUE },
    { label: t('analytics.sourceBreakdown.walkIn') || 'Vãng lai (Walk-in)', value: src.walkIn, color: COLORS.TEAL },
    { label: t('analytics.sourceBreakdown.phone') || 'Qua điện thoại',    value: src.phone,  color: COLORS.AMBER },
  ];

  return (
    <CardShell>
      <CardTitle title={t('analytics.sourceBreakdown.title') || 'Nguồn bệnh nhân'} sub={t('analytics.sourceBreakdown.sub') || 'Kênh tiếp cận'} />
      {isLoading ? (
        <Skeleton className="h-28 w-full rounded-xl" />
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => {
            const pct = Math.round((r.value / total) * 100);
            return (
              <div key={i}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#64748b]">{r.label}</span>
                  <span className="font-semibold text-[#111518]">{pct}%</span>
                </div>
                <div className="h-1.5 bg-[#f1f5f9] rounded-full">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: r.color }} />
                </div>
              </div>
            );
          })}
          <div className="pt-2 border-t border-[#e5e7eb] flex gap-4">
            {[
              { l: t('analytics.sourceBreakdown.onlineShort') || 'Đặt trước', v: src.online },
              { l: t('analytics.sourceBreakdown.walkInShort') || 'Vãng lai', v: src.walkIn },
              { l: t('analytics.sourceBreakdown.phoneShort') || 'Điện thoại', v: src.phone }
            ].map((x, i) => (
              <div key={i}>
                <div className="text-base font-bold text-[#111518]">{x.v}</div>
                <div className="text-[10px] text-[#64748b]">{x.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </CardShell>
  );
}
