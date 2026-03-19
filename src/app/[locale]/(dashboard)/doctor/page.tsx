'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { QueueBoard } from '@/components/queue/QueueBoard';
import { useTranslations } from 'next-intl';

export default function DoctorDashboardPage() {
  const { user } = useAuthStore();
  const t = useTranslations('dashboard.doctor');

  if (!user) return null;

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t('dashboard')}
        </h1>
        <p className="text-slate-500 font-medium">{t('greeting', { name: user.fullName })}</p>
      </div>

      {/* Stats and Live Queue Board */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <QueueBoard 
          doctorId={user.id} 
          doctorName={user.fullName} 
          isDoctorView={true} // Doctor HAS administrative actions like calling patients
        />
      </div>
    </div>
  );
}
