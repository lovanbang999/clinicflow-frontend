'use client';

import {
  CaretRightIcon,
  LightbulbIcon,
} from '@phosphor-icons/react';

export function RecommendedSpecialists() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Recommended Specialists</h3>
        <button className="text-blue-500 text-sm font-semibold hover:underline cursor-pointer">Explore All</button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer group">
          <div className="flex items-center gap-4">
            {/* <Image src="https://ui-avatars.com/api/?name=Sarah+Johnson&background=random" alt="Doctor" width={48} height={48} className="w-12 h-12 rounded-full object-cover" /> */}
            <div>
              <p className="font-bold">Dr. Sarah Johnson</p>
              <p className="text-sm text-slate-500">Dermatology • 4.9 ★</p>
            </div>
          </div>
          <CaretRightIcon weight="bold" className="text-slate-300 group-hover:text-blue-500 transition-colors" />
        </div>
        
        <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer group">
          <div className="flex items-center gap-4">
            {/* <Image src="https://ui-avatars.com/api/?name=Michael+Chen&background=random" alt="Doctor" width={48} height={48} className="w-12 h-12 rounded-full object-cover" /> */}
            <div>
              <p className="font-bold">Dr. Michael Chen</p>
              <p className="text-sm text-slate-500">Ophthalmology • 4.8 ★</p>
            </div>
          </div>
          <CaretRightIcon weight="bold" className="text-slate-300 group-hover:text-blue-500 transition-colors" />
        </div>
        
        <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-500/10 rounded-xl border border-teal-100 dark:border-teal-500/20">
          <div className="flex items-start gap-3">
            <LightbulbIcon weight="fill" className="text-teal-600 mt-0.5 text-xl" />
            <div>
              <p className="font-bold text-teal-900 dark:text-teal-400 text-sm">Health Tip of the Day</p>
              <p className="text-sm text-teal-800 dark:text-teal-500 leading-relaxed">Stay hydrated! Drinking 8 glasses of water daily helps maintain kidney function and energy levels.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
