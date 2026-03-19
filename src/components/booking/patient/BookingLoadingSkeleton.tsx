'use client';

export function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
      <div className="px-4 pt-4 pb-3 space-y-3">
        {/* Status + date row */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 bg-slate-100 rounded" />
          <div className="h-4 w-28 bg-slate-100 rounded" />
        </div>
        {/* Service name */}
        <div className="h-5 w-40 bg-slate-100 rounded" />
        {/* Doctor row */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-32 bg-slate-100 rounded" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100" />
      <div className="px-4 py-3">
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

export function BookingLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => <BookingCardSkeleton key={i} />)}
    </div>
  );
}
