import { Card, CardContent } from '@/components/ui/card';

export function ServiceCardSkeleton() {
  return (
    <Card className="h-full border-slate-200 overflow-hidden">
      <CardContent className="flex h-full flex-col p-6">
        {/* Top */}
        <div>
          {/* Icon Skeleton */}
          <div className="mb-4 h-14 w-14 animate-pulse rounded-xl bg-slate-200" />

          {/* Title Skeleton */}
          <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-slate-200" />

          {/* Description Skeleton */}
          <div className="mb-1 h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="mb-4 h-4 w-5/6 animate-pulse rounded bg-slate-200" />

          {/* Info Section */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            {/* Duration */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
              <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </div>

        {/* CTA Skeleton */}
        <div className="mt-auto pt-6">
          <div className="h-11 w-full animate-pulse rounded-lg bg-slate-200" />
        </div>
      </CardContent>
    </Card>
  );
}
