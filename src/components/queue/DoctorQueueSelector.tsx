'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useDoctors } from '@/lib/hooks/clinical/useDoctors';
import { cn } from '@/lib/utils';
import { MagnifyingGlassIcon, CheckCircleIcon, UserIcon, FunnelIcon } from '@phosphor-icons/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { queueApi } from '@/lib/api/appointment/queue';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

interface DoctorQueueSelectorProps {
  onSelect: (doctorId: string, doctorName: string) => void;
  selectedDoctorId?: string;
}

// Strip medical title prefixes before computing initials
function getInitials(fullName: string): string {
  const cleaned = fullName.replace(/^(GS\.|PGS\.|TS\.|ThS\.|BS\.|BSCK[12]?\.)\s*/i, '').trim();
  const parts = cleaned.split(' ').filter(Boolean);
  return parts.slice(-2).map(w => w[0]).join('').toUpperCase();
}

export function DoctorQueueSelector({ onSelect, selectedDoctorId }: DoctorQueueSelectorProps) {
  const t = useTranslations('receptionistQueue.selector');
  const { doctors, isLoading } = useDoctors();
  const [search, setSearch] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState('');
  const [queueCounts, setQueueCounts] = useState<Record<string, number>>({});

  const fetchQueueCounts = useCallback(async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const res = await queueApi.getAll({ date: today, limit: 100 });
      const counts: Record<string, number> = {};

      // Initialize all doctors to 0
      doctors.forEach(d => {
        counts[d.id] = 0;
      });

      // Count active (CHECKED_IN) queue records
      res.queueRecords?.forEach(record => {
        if (record.booking?.status === 'CHECKED_IN') {
          counts[record.doctorId] = (counts[record.doctorId] || 0) + 1;
        }
      });

      setQueueCounts(counts);
    } catch (err) {
      console.error('Error fetching queue counts:', err);
    }
  }, [doctors]);

  useEffect(() => {
    if (doctors.length === 0) return;

    const timer = setTimeout(() => {
      void fetchQueueCounts();
    }, 0);

    const interval = setInterval(() => {
      void fetchQueueCounts();
    }, 10000); // Poll every 10 seconds

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [doctors, fetchQueueCounts]);

  const specialties = useMemo(() => {
    const all = new Set<string>();
    doctors.forEach(d => d.specialties?.forEach(s => all.add(s)));
    return Array.from(all).sort();
  }, [doctors]);

  const filtered = useMemo(() => {
    return doctors.filter(d => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        d.fullName.toLowerCase().includes(q) ||
        d.specialties?.some(s => s.toLowerCase().includes(q));
      const matchSpec = !activeSpecialty || d.specialties?.includes(activeSpecialty);
      return matchSearch && matchSpec;
    });
  }, [doctors, search, activeSpecialty]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Search */}
      <div className="p-3 space-y-2 border-b border-slate-100">
        <div className="relative">
          <MagnifyingGlassIcon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Specialty dropdown */}
        <Select value={activeSpecialty || '__all__'} onValueChange={v => setActiveSpecialty(v === '__all__' ? '' : v)}>
          <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-blue-500/30 focus:border-blue-400 cursor-pointer">
            <div className="flex items-center gap-2 min-w-0">
              <FunnelIcon size={13} className="text-slate-400 shrink-0" />
              <SelectValue placeholder={t('allSpecialties')} />
            </div>
          </SelectTrigger>
          <SelectContent position='popper' side='bottom' >
            <SelectItem value="__all__">{t('allSpecialties')}</SelectItem>
            {specialties.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Count row */}
      <div className="px-4 py-2 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {t('doctorCount', { count: filtered.length })}
        </span>
        {activeSpecialty && (
          <button
            onClick={() => setActiveSpecialty('')}
            className="text-[11px] text-blue-500 hover:text-blue-700 font-semibold cursor-pointer"
          >
            {t('clearFilter')}
          </button>
        )}
      </div>

      {/* Doctor list */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-4/5" />
                <div className="h-2.5 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <UserIcon size={28} className="mb-2 opacity-40" />
            <p className="text-xs font-medium">{t('noDoctorFound')}</p>
          </div>
        ) : (
          filtered.map(doctor => {
            const isSelected = selectedDoctorId === doctor.id;
            const initials = getInitials(doctor.fullName);
            const specialty = doctor.specialties?.[0] ?? '';

            return (
              <button
                key={doctor.id}
                onClick={() => onSelect(doctor.id, doctor.fullName)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-all cursor-pointer group',
                  isSelected
                    ? 'bg-blue-50 border-l-[3px] border-l-blue-600'
                    : 'border-l-[3px] border-l-transparent hover:bg-slate-50'
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-black shrink-0 transition-all',
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                )}>
                  {initials || <UserIcon size={16} />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-semibold truncate leading-snug',
                    isSelected ? 'text-blue-700' : 'text-slate-800'
                  )}>
                    {doctor.fullName}
                  </p>
                  {specialty && (
                    <p className={cn(
                      'text-xs truncate mt-0.5 font-medium',
                      isSelected ? 'text-blue-400' : 'text-slate-400'
                    )}>
                      {specialty}
                    </p>
                  )}
                </div>

                {/* Indicators: Queue Count & Selected status */}
                <div className="flex items-center gap-2 shrink-0">
                  {queueCounts[doctor.id] > 0 && (
                    <span className={cn(
                      'inline-flex items-center justify-center min-w-5 h-5 rounded-full px-1.5 text-[10px] font-black tracking-tight animate-in zoom-in duration-200 shadow-sm border border-white',
                      queueCounts[doctor.id] >= 5
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-white'
                    )}>
                      {queueCounts[doctor.id]}
                    </span>
                  )}
                  {isSelected && (
                    <CheckCircleIcon
                      size={18}
                      weight="fill"
                      className="text-blue-600 animate-in zoom-in duration-200"
                    />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
