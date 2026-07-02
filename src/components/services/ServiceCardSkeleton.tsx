export function ServiceCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col h-full animate-pulse overflow-hidden">
      {/* Skeleton Banner */}
      <div className="w-full aspect-[16/10] bg-slate-200 dark:bg-slate-800" />

      {/* Skeleton Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-3 h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mb-5 h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-700" />
        
        <div className="mb-2 h-3.5 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mb-6 h-3.5 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />

        {/* Skeleton Info Row */}
        <div className="h-12 w-full rounded-2xl bg-slate-200 dark:bg-slate-700 mb-6 mt-auto" />

        {/* Skeleton Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}
