'use client';

import { useTranslations } from 'next-intl';
import { useWalkinBooking } from '../../WalkinBookingContext';

export function Pagination() {
  const t = useTranslations('dashboard.receptionist.walkinBookingForm.patient');
  const { pagination, isSearching, setPage } = useWalkinBooking();

  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-2 px-1">
      <div className="text-xs text-slate-500 font-medium italic">
        {t('showing', { 
          start: (pagination.page - 1) * pagination.limit + 1, 
          end: Math.min(pagination.page * pagination.limit, pagination.total),
          total: pagination.total 
        })}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          disabled={pagination.page <= 1 || isSearching}
          onClick={() => setPage(pagination.page - 1)}
          className="p-1.5 h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        {[...Array(pagination.totalPages)].map((_, i) => {
          const pageNum = i + 1;
          if (
            pagination.totalPages > 6 && 
            pageNum !== 1 && 
            pageNum !== pagination.totalPages && 
            Math.abs(pageNum - pagination.page) > 1
          ) {
            if (pageNum === 2 || pageNum === pagination.totalPages - 1) return <span key={pageNum} className="text-slate-400 px-0.5 tracking-tighter">...</span>;
            return null;
          }
          return (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              disabled={isSearching}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                pagination.page === pageNum
                  ? 'bg-[#1570EF] text-white shadow-sm ring-2 ring-[#1570EF]/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          disabled={pagination.page >= pagination.totalPages || isSearching}
          onClick={() => setPage(pagination.page + 1)}
          className="p-1.5 h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}
