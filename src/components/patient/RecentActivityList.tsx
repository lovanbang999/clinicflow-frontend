'use client';

import {
  FileTextIcon,
  CreditCardIcon,
  PillIcon,
} from '@phosphor-icons/react';

export function RecentActivityList() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Recent Activity</h3>
        <button className="text-blue-500 text-sm font-semibold hover:underline cursor-pointer">See All</button>
      </div>
      
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex-shrink-0 flex items-center justify-center text-blue-500">
            <FileTextIcon weight="fill" className="text-2xl" />
          </div>
          <div>
            <p className="font-semibold">Lab results are ready</p>
            <p className="text-sm text-slate-500">Your blood test results from Dec 15 are now available.</p>
            <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex-shrink-0 flex items-center justify-center text-green-600">
            <CreditCardIcon weight="fill" className="text-2xl" />
          </div>
          <div>
            <p className="font-semibold">Payment successful</p>
            <p className="text-sm text-slate-500">Invoice #INV-4921 has been paid via Credit Card.</p>
            <p className="text-xs text-slate-400 mt-1">Yesterday</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex-shrink-0 flex items-center justify-center text-purple-600">
            <PillIcon weight="fill" className="text-2xl" />
          </div>
          <div>
            <p className="font-semibold">Prescription renewed</p>
            <p className="text-sm text-slate-500">Dr. Nguyen renewed your Vitamin D prescription.</p>
            <p className="text-xs text-slate-400 mt-1">Dec 24, 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}
