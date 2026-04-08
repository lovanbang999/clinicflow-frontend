'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useServices } from '@/lib/hooks/clinic/useServices';
import { bookingsApi } from '@/lib/api/appointment/bookings';
import { toast } from 'sonner';
import { SpinnerIcon, CheckCircleIcon, InfoIcon } from '@phosphor-icons/react';

interface ServiceSelectionSectionProps {
  bookingId: string;
  onSuccess: () => void;
}

export function ServiceSelectionSection({
  bookingId,
  onSuccess,
}: ServiceSelectionSectionProps) {
  const t = useTranslations('emr.visit.serviceSelection');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { services, isLoading } = useServices({ isActive: true });

  const handleSubmit = async () => {
    if (!selectedServiceId) {
      toast.error(t('errorNoSelection'));
      return;
    }

    try {
      setIsSubmitting(true);
      await bookingsApi.updateService(bookingId, selectedServiceId);
      toast.success(t('success'));
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(t('errorSubmit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto my-8">
      <div className="bg-blue-600 p-6 text-white text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-3">
          <InfoIcon size={24} weight="bold" />
        </div>
        <h2 className="text-xl font-bold">{t('title')}</h2>
        <p className="text-blue-100 mt-1 text-sm">{t('description')}</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 ml-1">
            {t('label')}
          </Label>
          <Select
            value={selectedServiceId}
            onValueChange={setSelectedServiceId}
            disabled={isLoading || isSubmitting}
          >
            <SelectTrigger className="w-full h-12 text-base border-gray-200 focus:ring-blue-500 transition-all bg-gray-50/50">
              <SelectValue placeholder={t('placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
          <div className="text-amber-500 font-bold shrink-0">⚠️</div>
          <p className="text-xs text-amber-800 leading-relaxed">
            {t('warning')}
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selectedServiceId || isSubmitting}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
        >
          {isSubmitting ? (
            <SpinnerIcon className="animate-spin" size={20} />
          ) : (
            <>
              <span>{t('confirm')}</span>
              <CheckCircleIcon size={20} className="group-hover:scale-110 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
