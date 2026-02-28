'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  valueColor?: string;
}

export function AdminStatCard({
  title,
  value,
  icon,
  iconBgColor = 'bg-blue-100',
  valueColor = 'text-gray-900',
}: AdminStatCardProps) {
  return (
    <Card className="p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500 bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className={cn('text-3xl font-bold animate-fade-in', valueColor)}>
            {value}
          </p>
        </div>
        <div
          className={cn(
            'p-4 rounded-xl shadow-sm transform transition-transform hover:scale-110 duration-300',
            iconBgColor
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
