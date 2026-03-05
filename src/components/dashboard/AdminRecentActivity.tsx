'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

const ACTIVITY_KEYS = [
  { icon: 'person_add',       color: 'bg-blue-50 text-[#1392ec]',      textKey: 'newPatientRegistered',  sub: 'Nguyễn Văn A • Just now' },
  { icon: 'event_available',  color: 'bg-emerald-50 text-emerald-600', textKey: 'appointmentConfirmed',  sub: 'Dr. Lê Thị B – 10:30 AM • 5m ago' },
  { icon: 'payments',         color: 'bg-amber-50 text-amber-600',     textKey: 'paymentReceived',       sub: '850,000 VND • 12m ago' },
  { icon: 'cancel',           color: 'bg-rose-50 text-rose-500',       textKey: 'appointmentCancelled',  sub: 'Patient #4821 • 28m ago' },
  { icon: 'medical_services', color: 'bg-purple-50 text-purple-600',   textKey: 'newServiceAdded',       sub: 'Dental Consultation • 1h ago' },
  { icon: 'person',           color: 'bg-slate-50 text-slate-500',     textKey: 'doctorProfileUpdated',  sub: 'Dr. Phạm Minh D • 2h ago' },
  { icon: 'edit_calendar',    color: 'bg-teal-50 text-teal-600',       textKey: 'scheduleUpdated',       sub: 'Dr. Trần Thu E – Monday slots • 3h ago' },
  { icon: 'account_circle',   color: 'bg-indigo-50 text-indigo-600',   textKey: 'newUserAccountCreated', sub: 'Lê Văn F (Receptionist) • 4h ago' },
] as const;

export function AdminRecentActivity() {
  const t = useTranslations('dashboard.admin.recentActivity');

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#e5e7eb] shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-base font-bold text-[#111518]">{t('title')}</h3>
          <p className="text-[#94a3b8] text-xs font-medium mt-0.5">{t('subtitle')}</p>
        </div>
        <Link href="/admin/activities" className="text-[#1392ec] text-xs font-bold hover:underline">
          {t('viewAll')}
        </Link>
      </div>

      {/* 2-column grid for full-width layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
        {ACTIVITY_KEYS.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${a.color}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{a.icon}</span>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-[#111518]">{t(a.textKey)}</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">{a.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
