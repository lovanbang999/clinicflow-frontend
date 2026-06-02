import { ActivityIcon, CheckCircleIcon, ClockIcon, StarIcon, XCircleIcon, CoinsIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoctorSummary } from '@/lib/hooks/clinical/useDoctorAnalytics';
import { Period, COLORS } from './constants';
import { Delta } from './SharedComponents';
import { useTranslations, useLocale } from 'next-intl';

export function SummaryCards({ period }: { period: Period }) {
  const { data, isLoading } = useDoctorSummary(period);
  const t = useTranslations('doctorWorkspace');
  const locale = useLocale();

  const formattedRevenue = data
    ? new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: locale === 'vi' ? 'VND' : 'USD',
        maximumFractionDigits: 0,
      }).format(locale === 'vi' ? data.revenue : Math.round(data.revenue / 25400))
    : '—';

  const cards = [
    {
      accent: COLORS.BLUE,
      icon: <ActivityIcon size={14} className="mr-1" />,
      val: data?.total ?? '—',
      label: t('analytics.summary.total') || 'Tổng lượt khám',
      delta: data?.deltaTotal ?? 0,
    },
    {
      accent: COLORS.TEAL,
      icon: <CheckCircleIcon size={14} className="mr-1" />,
      val: data?.completed ?? '—',
      label: t('analytics.summary.completed') || 'Hoàn thành',
      delta: data?.deltaCompleted ?? 0,
    },
    {
      accent: COLORS.AMBER,
      icon: <XCircleIcon size={14} className="mr-1" />,
      val: data?.absentCancel ?? '—',
      label: t('analytics.summary.absentCancel') || 'Vắng / Huỷ',
      delta: data?.deltaAbsentCancel ?? 0,
    },
    {
      accent: COLORS.GREEN,
      icon: <CoinsIcon size={14} className="mr-1" />,
      val: formattedRevenue,
      label: t('analytics.summary.revenue') || 'Doanh thu tư vấn',
      delta: data?.deltaRevenue ?? 0,
    },
    {
      accent: COLORS.PURPLE,
      icon: <ClockIcon size={14} className="mr-1" />,
      val: data ? `${data.avgMinutes}` : '—',
      label: t('analytics.summary.avgMinutes') || 'Phút TB/lượt',
      delta: 0,
    },
    {
      accent: COLORS.CORAL,
      icon: <StarIcon size={14} className="mr-1" />,
      val: data ? `${data.rating}` : '—',
      label: t('analytics.summary.rating') || 'Đánh giá (/ 5)',
      delta: 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#e5e7eb] p-4 relative overflow-hidden cursor-pointer hover:border-[#185FA5]/40 transition-colors">
          <div className="h-[3px] w-8 rounded-full mb-3" style={{ background: c.accent }} />
          <div className="absolute top-3 right-3"><Delta value={c.delta} /></div>
          {isLoading
            ? <Skeleton className="h-7 w-20 mb-1 rounded-lg" />
            : <div className="text-[17px] sm:text-[18px] lg:text-[19px] font-bold text-[#111518] leading-none truncate" title={String(c.val)}>{c.val}</div>
          }
          <div className="flex items-center text-[11px] text-[#64748b] mt-1.5" style={{ color: c.accent }}>
            {c.icon}<span className="text-[#64748b]">{c.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
