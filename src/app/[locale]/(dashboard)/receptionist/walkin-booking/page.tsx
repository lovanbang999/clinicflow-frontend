import { useTranslations } from 'next-intl';
import { WalkinBookingForm } from '@/components/receptionist/walkin-booking/WalkinBookingForm';

export default function WalkinBookingPage() {
  const t = useTranslations('dashboard.receptionist.walkinBookingForm');

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50/50">
      <div className="flex flex-col gap-1.5 mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t('pageTitle')}
        </h1>
        <p className="text-[13px] text-slate-500 font-medium">
          {t('pageDescription')}
        </p>
      </div>

      <WalkinBookingForm />
    </div>
  );
}
