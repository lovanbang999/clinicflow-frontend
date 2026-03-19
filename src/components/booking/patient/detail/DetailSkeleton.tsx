'use client';

import React from 'react';

export function DetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      {/* Back header skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-5 w-40 rounded bg-slate-100 animate-pulse" />
      </div>
      
      {/* Hero skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 bg-slate-100 rounded" />
            <div className="h-4 w-28 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
      
      {/* Sections skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3 animate-pulse">
          <div className="h-3 w-20 bg-slate-50 rounded mb-2" />
          {[1, 2].map((j) => (
            <div key={j} className="flex items-center gap-3 py-2 border-t border-slate-50 first:border-0">
              <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-20 bg-slate-100 rounded" />
                <div className="h-4 w-32 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
