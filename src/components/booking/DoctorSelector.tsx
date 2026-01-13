'use client';

import { useState, useEffect } from 'react';
import { Doctor } from '@/types';
import { doctorsApi } from '@/lib/api/doctors';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/lib/utils';
import { Loader2, Star } from 'lucide-react';
import { useBookingStore } from '@/lib/store/bookingStore';
import Image from 'next/image';

interface DoctorSelectorProps {
  onSelect?: (doctor: Doctor) => void;
}

export function DoctorSelector({ onSelect }: DoctorSelectorProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedDoctor, setSelectedDoctor, selectedService } = useBookingStore();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        // Filter by specialty if service is selected
        const specialty = selectedService?.name;
        const data = await doctorsApi.getAll({
          isActive: true,
          ...(specialty && { specialty }),
        });
        setDoctors(data);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedService]);

  const handleDoctorClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    onSelect?.(doctor);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-12">
        <Image alt="No doctors available" src="/empty-state/doctors.svg" width={400} height={400} className="mx-auto mb-10" />
        <p className="text-gray-500">Không có bác sĩ nào khả dụng</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => {
        const isSelected = selectedDoctor?.id === doctor.id;

        return (
          <Card
            key={doctor.id}
            className={cn(
              'p-6 cursor-pointer transition-all duration-200 hover:shadow-lg relative',
              isSelected
                ? 'border-2 border-primary shadow-xl bg-primary/5 scale-[1.02]'
                : 'border border-gray-200 hover:border-primary/50'
            )}
            onClick={() => handleDoctorClick(doctor)}
          >
            <div className="flex flex-col items-center gap-4">
              {/* Doctor Avatar */}
              <div className={cn(
                'relative',
                isSelected && 'ring-4 ring-primary/20 rounded-full'
              )}>
                <Avatar
                  src={doctor.avatar}
                  alt={doctor.fullName}
                  size="xl"
                  className={cn(
                    'transition-all duration-200',
                    isSelected ? 'bg-primary' : 'bg-gray-600'
                  )}
                />
              </div>

              {/* Doctor Info */}
              <div className="text-center w-full">
                <h3 className="font-semibold text-lg text-gray-900">
                  {doctor.fullName}
                </h3>
                
                {doctor.specialties && doctor.specialties.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {doctor.specialties[0]}
                  </p>
                )}

                {/* Rating */}
                {doctor.rating > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-3 px-4 py-2 bg-green-50 rounded-lg">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">
                      {doctor.rating.toFixed(1)}/5
                    </span>
                    <span className="text-sm text-gray-600">
                      ({doctor.reviewCount} đánh giá)
                    </span>
                  </div>
                )}

                {/* Experience */}
                {doctor.yearsOfExperience > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {doctor.yearsOfExperience} năm kinh nghiệm
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
