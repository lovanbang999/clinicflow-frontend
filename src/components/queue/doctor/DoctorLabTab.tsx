'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface DoctorLabTabProps {
  bookingId: string;
}

export function DoctorLabTab({}: DoctorLabTabProps) {
  const [tests, setTests] = useState([
    { id: '1', label: 'Công thức máu toàn phần (CBC)', checked: false },
    { id: '2', label: 'Đường huyết lúc đói (FBG)', checked: true },
    { id: '3', label: 'HbA1c', checked: false },
    { id: '4', label: 'Chức năng thận (Creatinine, Urea)', checked: false },
  ]);

  const toggleTest = (id: string) => {
    setTests((prev) =>
      prev.map((test) =>
        test.id === id ? { ...test, checked: !test.checked } : test
      )
    );
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-[16px] font-bold text-gray-900">
          Chỉ định xét nghiệm
        </h3>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col gap-3">
          {tests.map((test) => (
            <label 
              key={test.id} 
              className="flex items-center gap-4 px-4 py-3.5 border border-gray-200/60 rounded-xl hover:bg-gray-50/50 cursor-pointer transition-colors shadow-sm bg-white"
            >
              <Checkbox 
                id={test.id} 
                checked={test.checked} 
                onCheckedChange={() => toggleTest(test.id)} 
                className="w-5 h-5 rounded-[4px] border-gray-300 text-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-sm"
              />
              <span className="text-[15px] text-gray-800 font-medium leading-none">
                {test.label}
              </span>
            </label>
          ))}
          
          <Input 
            placeholder="Xét nghiệm khác..." 
            className="h-12 text-[15px] mt-2 border-gray-200/80 shadow-sm rounded-xl px-4 focus-visible:ring-blue-600 focus-visible:border-blue-600 placeholder:text-gray-400 font-medium" 
          />
        </div>
      </div>
    </div>
  );
}
