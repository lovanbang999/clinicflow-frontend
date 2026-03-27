'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  MagnifyingGlassIcon, 
  UserCircleIcon, 
  UserCheckIcon,
  PlusIcon
} from '@phosphor-icons/react';
import { useReceptionistDashboard } from '@/lib/hooks/useReceptionistDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { useDebounce } from '@/lib/hooks/useDebounce';

export function SearchCheckIn() {
  const t = useTranslations('dashboard.receptionist.searchCheckIn');
  const tCommon = useTranslations('common');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  const { 
    searchResults, 
    loadingSearch, 
    searchBookings, 
    checkIn, 
    isCheckingIn 
  } = useReceptionistDashboard();

  useEffect(() => {
    searchBookings(debouncedQuery);
  }, [debouncedQuery, searchBookings]);

  return (
    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MagnifyingGlassIcon className="text-slate-400 h-5 w-5" weight="bold" />
          <h3 className="font-bold text-slate-900">{t('title')}</h3>
        </div>
        <Link 
          href="/receptionist/bookings/walkin"
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <PlusIcon weight="bold" size={14} />
          {tCommon?.('walkIn') ?? 'Khám vãng lai'}
        </Link>
      </div>
      
      <div className="relative mb-6">
        <MagnifyingGlassIcon className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${loadingSearch ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
        <input 
          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400 transition-shadow outline-none cursor-text" 
          placeholder={t('placeholder')} 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[300px]">
        {loadingSearch ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-3">
            {searchResults.map((booking) => (
              <div 
                key={booking.id} 
                className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shrink-0">
                    <UserCircleIcon className="text-slate-200 h-6 w-6" weight="fill" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{booking.patientProfile?.fullName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">{booking.bookingCode}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{booking.patientProfile?.phone}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => checkIn(booking.id)}
                  disabled={isCheckingIn}
                  className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  <UserCheckIcon weight="fill" size={16} />
                  Check-in
                </button>
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="h-full flex flex-col items-center justify-center py-8 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <MagnifyingGlassIcon className="text-slate-200 h-10 w-10" />
             </div>
             <p className="text-slate-400 text-sm font-medium">Không tìm thấy lịch hẹn trùng khớp</p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-8 text-center">
            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <UserCircleIcon className="text-slate-200 h-16 w-16" weight="duotone" />
            </div>
            <p className="text-slate-500 font-medium max-w-[240px] leading-relaxed">{t('emptyState')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
