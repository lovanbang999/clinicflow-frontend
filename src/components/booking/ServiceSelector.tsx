'use client';

import { useState, useEffect } from 'react';
import { Service } from '@/types';
import { servicesApi } from '@/lib/api/services';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { useBookingStore } from '@/lib/store/bookingStore';

interface ServiceSelectorProps {
  onSelect?: (service: Service) => void;
}

export function ServiceSelector({ onSelect }: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedService, setSelectedService } = useBookingStore();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await servicesApi.getAll({ isActive: true });
        setServices(data);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    onSelect?.(service);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không có dịch vụ nào khả dụng</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => {
        const isSelected = selectedService?.id === service.id;

        return (
          <Card
            key={service.id}
            className={cn(
              'p-6 cursor-pointer transition-all duration-200 hover:shadow-md relative',
              isSelected
                ? 'border-2 border-primary shadow-lg bg-primary/5'
                : 'border border-gray-200 hover:border-primary/50'
            )}
            onClick={() => handleServiceClick(service)}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            <div className="flex flex-col gap-3">
              {service.iconUrl && (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">{service.iconUrl}</span>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {service.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-2 pt-3 border-t">
                <span className="text-sm text-gray-500">
                  {service.durationMinutes} phút
                </span>
                <span className="font-semibold text-primary">
                  {service.price.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
