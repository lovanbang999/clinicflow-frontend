'use client';

import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/shared/Avatar';
import { TopDoctor } from '@/types/dashboard';

interface TopDoctorsCardProps {
  title: string;
  doctors: TopDoctor[];
  visitsLabel: string;
}

export function TopDoctorsCard({
  title,
  doctors,
  visitsLabel,
}: TopDoctorsCardProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const getRankBadge = (index: number) => {
    const badges = ['🥇', '🥈', '🥉'];
    return badges[index] || '⭐';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        👨‍⚕️ {title}
      </h3>
      <div className="space-y-3">
        {doctors.map((doctor, index) => (
          <div
            key={doctor.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group border border-transparent hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl transform group-hover:scale-125 transition-transform duration-300">
                {getRankBadge(index)}
              </span>
              <Avatar
                src={doctor.avatar ?? undefined}
                alt={doctor.fullName}
                size="sm"
                className="ring-2 ring-white group-hover:ring-blue-200 transition-all duration-300"
              />
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                BS. {doctor.fullName}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition-all duration-300">
              {formatNumber(doctor.visitCount)} {visitsLabel}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
