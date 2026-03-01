export function ServiceCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-[16px] border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col h-full animate-pulse">
      <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-full mb-6" />

      <div className="mb-3 h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
      
      <div className="mb-2 h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mb-8 h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />

      <div className="space-y-4 mb-8 border-t border-slate-50 dark:border-slate-700/50 pt-6 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      <div className="w-full h-[56px] rounded-xl bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}
