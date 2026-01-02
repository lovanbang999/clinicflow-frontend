import { Card, CardContent } from '@/components/ui/card';

export function DoctorCardSkeleton() {
  return (
    <Card className="overflow-hidden border-slate-200">
      <CardContent className="p-6">
        {/* Avatar Skeleton */}
        <div className="mb-4 flex justify-center">
          <div className="h-24 w-24 animate-pulse rounded-full bg-slate-200" />
        </div>

        {/* Name Skeleton */}
        <div className="mb-2 mx-auto h-6 w-3/4 animate-pulse rounded bg-slate-200" />

        {/* Specialty Skeleton */}
        <div className="mb-4 mx-auto h-4 w-1/2 animate-pulse rounded bg-slate-200" />

        {/* Rating Skeleton */}
        <div className="mb-4 mx-auto flex justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 w-4 animate-pulse rounded bg-slate-200" />
          ))}
        </div>

        <div className="mb-6 mx-auto h-4 w-24 animate-pulse rounded bg-slate-200" />

        {/* Info List Skeleton */}
        <div className="mb-6 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 flex-1 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>

        {/* Button Skeleton */}
        <div className="h-11 w-full animate-pulse rounded-lg bg-slate-200" />
      </CardContent>
    </Card>
  );
}
