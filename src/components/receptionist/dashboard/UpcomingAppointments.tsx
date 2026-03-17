'use client';

import { useTranslations } from 'next-intl';
import { CalendarPlus as CalendarPlusIcon } from '@phosphor-icons/react';

const APPOINTMENTS = [
  { time: '09:00', patient: 'Trần Thị B', service: 'General Checkup', doctor: 'Dr. Nguyễn Văn A', status: 'Checked-in', color: 'emerald' },
  { time: '09:30', patient: 'Nguyễn Văn C', service: 'Cardiology', doctor: 'Dr. Lê Văn B', status: 'Confirmed', color: 'blue' },
  { time: '10:00', patient: 'Hoàng Văn D', service: 'Dermatology', doctor: 'Dr. Trần Thị C', status: 'Scheduled', color: 'slate' },
];

export function UpcomingAppointments() {
  const t = useTranslations('dashboard.receptionist.upcomingAppointments');

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors">
        <CalendarPlusIcon className="text-slate-400 h-5 w-5" weight="bold" />
        <h3 className="font-bold text-slate-900">{t('title')}</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('table.time')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('table.patient')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('table.service')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('table.doctor')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('table.status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {APPOINTMENTS.map((app, index) => {
              const bgClass = app.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                              app.color === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                              'bg-slate-50 text-slate-500 border-slate-100';
              return (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{app.time}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-900">{app.patient}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500">{app.service}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500 font-medium">{app.doctor}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${bgClass}`}>
                      {app.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
