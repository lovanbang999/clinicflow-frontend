'use client';

import { useTranslations } from 'next-intl';
import { MonitorPlay as MonitorPlayIcon } from '@phosphor-icons/react';

const IN_QUEUE_USERS = [
  { id: 1, name: 'Trần Văn Phước', dept: 'Cardiology', time: '10:00', active: true },
  { id: 2, name: 'Nguyễn Thị Oanh', dept: 'General Checkup', time: '10:15', active: false },
  { id: 3, name: 'Phạm Minh Hảo', dept: 'Dermatology', time: '10:30', active: false },
];

export function LiveQueue() {
  const t = useTranslations('dashboard.receptionist.liveQueue');

  return (
    <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6 cursor-pointer hover:text-blue-600 transition-colors">
        <div className="flex items-center gap-2">
          <MonitorPlayIcon className="text-red-500 h-5 w-5" weight="fill" />
          <h3 className="font-bold text-slate-900">{t('title', { count: IN_QUEUE_USERS.length })}</h3>
        </div>
      </div>

      <div className="space-y-4">
        {IN_QUEUE_USERS.map((user, index) => (
          <div 
            key={user.id} 
            className="flex items-center gap-4 p-4 border border-slate-50 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
          >
            <div 
              className={`w-10 h-10 rounded-full font-bold flex items-center justify-center shrink-0 ${user.active ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
            >
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 font-medium truncate">{user.dept} • {user.time}</p>
            </div>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm">
              {t('promoteBtn')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
