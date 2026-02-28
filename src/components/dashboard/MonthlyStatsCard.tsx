'use client';

import { Card } from '@/components/ui/card';
import { MonthlyStats } from '@/types/dashboard';

interface MonthlyStatsCardProps {
  title: string;
  stats: MonthlyStats;
  translations: {
    bookingCount: string;
    newPatients: string;
    successRate: string;
    revenue: string;
  };
}

export function MonthlyStatsCard({
  title,
  stats,
  translations,
}: MonthlyStatsCardProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const statsItems = [
    {
      label: translations.bookingCount,
      value: formatNumber(stats.bookingCount),
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      label: translations.newPatients,
      value: formatNumber(stats.newPatients),
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
    },
    {
      label: translations.successRate,
      value: `${stats.successRate}%`,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      label: translations.revenue,
      value: `${formatNumber(stats.revenue)}đ`,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        {title}
      </h3>
      <div className="space-y-4">
        {statsItems.map((item, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-3 rounded-lg hover:shadow-md transition-all duration-200 ${item.bgColor}`}
          >
            <span className="text-sm font-medium text-gray-700">
              {item.label}
            </span>
            <span className={`text-lg font-bold ${item.color}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
