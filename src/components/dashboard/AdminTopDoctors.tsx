'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { TopDoctorItem } from '@/lib/api/dashboard';

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600',
];

function EmptyTopDoctors({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8 gap-3">
      {/* Inline SVG illustration */}
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle cx="48" cy="48" r="44" fill="#f0f9ff" />

        {/* Stethoscope body */}
        <path
          d="M34 28c0-3.314 2.686-6 6-6h16c3.314 0 6 2.686 6 6v10c0 8.837-7.163 16-16 16s-16-7.163-16-16V28z"
          fill="#bfdbfe"
          stroke="#93c5fd"
          strokeWidth="1.5"
        />
        {/* Stethoscope tube */}
        <path
          d="M46 54v6c0 6.627 5.373 12 12 12s12-5.373 12-12v-4"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Stethoscope earpiece */}
        <circle cx="70" cy="56" r="4" fill="#3b82f6" />

        {/* Medal / trophy base */}
        <path
          d="M36 74h24l-3 6H39l-3-6z"
          fill="#fde68a"
          stroke="#fbbf24"
          strokeWidth="1"
        />
        <rect x="42" y="68" width="12" height="8" rx="1" fill="#fcd34d" />

        {/* Stars */}
        <text x="20" y="34" fontSize="10" fill="#fbbf24">★</text>
        <text x="68" y="30" fontSize="8"  fill="#fbbf24">★</text>
        <text x="14" y="58" fontSize="7"  fill="#c7d2fe">★</text>

        {/* Small cross / plus icon on coat */}
        <path
          d="M46 35h4M48 33v4"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <p className="text-sm font-semibold text-[#64748b] text-center">
        {t('emptyTitle')}
      </p>
      <p className="text-xs text-[#94a3b8] text-center max-w-[160px] leading-relaxed">
        {t('emptySubtitle')}
      </p>
    </div>
  );
}

export function AdminTopDoctors({ doctors }: { doctors: TopDoctorItem[] }) {
  const t = useTranslations('dashboard.admin.topDoctors');
  const docList = Array.isArray(doctors) ? doctors : [];
  const max = Math.max(...docList.map((d) => d.patientsCount), 1);
  const isEmpty = docList.length === 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#e5e7eb] shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-base font-bold text-[#111518]">{t('title')}</h3>
          <p className="text-[#94a3b8] text-xs font-medium mt-0.5">{t('subtitle')}</p>
        </div>
        <Link href="/admin/doctors" className="text-[#1392ec] text-xs font-bold hover:underline">
          {t('viewAll')}
        </Link>
      </div>

      {isEmpty ? (
        <EmptyTopDoctors t={t} />
      ) : (
        <div className="space-y-4">
          {docList.map((doc, i) => {
            const initials = doc.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);
            const barPct = Math.round((doc.patientsCount / max) * 100);
            return (
              <div key={doc.id}>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs font-bold text-[#cbd5e1] w-4 text-center shrink-0">
                    {i + 1}
                  </span>
                  <div
                    className={`size-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <p className="text-sm font-semibold text-[#111518] truncate pr-2">
                        {doc.name}
                      </p>
                      <span className="text-xs font-bold text-[#64748b] shrink-0 whitespace-nowrap">
                        {t('visits', { count: doc.patientsCount })}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1392ec]/70 rounded-full transition-all duration-500"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
