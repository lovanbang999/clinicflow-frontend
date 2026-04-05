export function DoctorCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-8 flex flex-col relative border border-slate-100 h-full shadow-sm">
      {/* Heart Icon Skeleton */}
      <div className="absolute top-6 right-6">
        <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
      </div>

      <div className="flex flex-col items-center mb-6 mt-2">
        {/* Avatar Skeleton */}
        <div className="w-28 h-28 rounded-full p-1 bg-white ring-1 ring-slate-100 shadow-sm mb-4">
          <div className="w-full h-full rounded-full bg-slate-100 animate-pulse" />
        </div>

        {/* Name Skeleton */}
        <div className="h-6 w-40 bg-slate-100 rounded animate-pulse mb-3" />
        
        {/* Specialty Badge Skeleton */}
        <div className="h-6 w-28 bg-slate-100 rounded-lg animate-pulse" />
      </div>

      {/* Stats Board Skeleton */}
      <div className="flex items-center justify-center gap-4 mb-6 pb-6 border-b border-slate-50 w-full animate-pulse">
        <div className="text-center px-4 border-r border-slate-50 w-1/2">
          <div className="h-5 w-16 bg-slate-100 rounded mx-auto mb-1" />
          <div className="h-3 w-16 bg-slate-100 rounded mx-auto" />
        </div>
        <div className="text-center px-4 w-1/2">
          <div className="h-5 w-16 bg-slate-100 rounded mx-auto mb-1" />
          <div className="h-3 w-16 bg-slate-100 rounded mx-auto" />
        </div>
      </div>

      {/* Checkmarks Skeleton */}
      <div className="space-y-3 mb-8 px-2 w-full">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 w-full animate-pulse">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex-shrink-0" />
            <div className="h-4 w-3/4 bg-slate-100 rounded mt-0.5" />
          </div>
        ))}
      </div>

      {/* Action Buttons Skeleton */}
      <div className="mt-auto grid grid-cols-2 gap-3 w-full">
        <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
