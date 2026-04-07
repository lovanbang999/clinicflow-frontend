'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useBookingStore } from '@/lib/store/bookingStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useBookings } from '@/lib/hooks/appointment/useBookings';
import { usersApi } from '@/lib/api/auth/users';
import { Calendar, Clock, FileText, Stethoscope, DollarSign, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { formatDate } from '@/lib/utils/formatters';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export function BookingConfirmation() {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { user } = useAuthStore();
  const { createBooking, isLoading: isSubmitting } = useBookings();
  const {
    selectedService,
    selectedDoctor,
    selectedDate,
    selectedTimeSlot,
    resetBooking,
  } = useBookingStore();
  const t = useTranslations('booking');

  const handleSubmit = async () => {
    if (!selectedService || !selectedDoctor || !selectedDate || !selectedTimeSlot) {
      toast.error(t('completeAllSteps'));
      return;
    }

    let profileId = user?.patientProfile?.id;

    if (!profileId && user) {
      try {
        const freshProfile = await usersApi.getMyProfile();
        useAuthStore.getState().setUser(freshProfile);
        profileId = freshProfile.patientProfile?.id;
      } catch (error) {
        console.error('Failed to auto-fetch profile', error);
      }
    }

    if (!profileId) {
      toast.error(t('loginToBook'));
      return;
    }

    const bookingDate = formatDate(selectedDate, 'yyyy-MM-dd');

    const booking = await createBooking({
      patientProfileId: profileId,
      doctorId: selectedDoctor.id,
      serviceId: selectedService.id,
      bookingDate,
      startTime: selectedTimeSlot,
      patientNotes: notes || undefined,
    });

    if (booking) {
      setIsSuccess(true);
      toast.success(t('bookingSuccess'));

      // Redirect after 2 seconds
      setTimeout(() => {
        resetBooking();
        router.push('/patient/my-bookings');
      }, 2000);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/50 rounded-[32px] border-2 border-slate-100/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none max-w-2xl mx-auto text-center px-6">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <CheckCircle className="w-12 h-12 text-emerald-500" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">{t('bookingSuccess')}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-md">
          {t('redirectMessage')}
        </p>
        <div className="flex items-center gap-2 text-blue-500 font-medium bg-blue-50 dark:bg-blue-500/10 px-6 py-3 rounded-full">
          <Loader2 className="w-5 h-5 animate-spin" />
          {t('redirecting')}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Service Info */}
        <div className="bg-white dark:bg-slate-900/50 rounded-[24px] md:rounded-[32px] border-2 border-slate-100/80 dark:border-slate-800 p-5 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-blue-200 dark:hover:border-blue-500/50 transition-colors">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center shrink-0">
              <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-500" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[11px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('serviceInfo')}</h3>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{selectedService?.name}</p>
              
              <div className="flex flex-wrap xs:flex-nowrap items-center gap-3 sm:gap-4 mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-100/80 dark:border-slate-800">
                <div className="space-y-1 overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('serviceSelector.duration')}</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap text-sm sm:text-base">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedService?.durationMinutes} {t('serviceSelector.min')}</span>
                  </p>
                </div>
                <div className="w-px h-8 bg-slate-100/80 dark:bg-slate-800 shrink-0 hidden xs:block"></div>
                <div className="space-y-1 overflow-hidden mt-2 xs:mt-0 w-full xs:w-auto">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('serviceSelector.price')}</p>
                  <p className="font-extrabold text-blue-600 flex items-center gap-1.5 whitespace-nowrap text-sm sm:text-base">
                    <DollarSign className="w-4 h-4 shrink-0" />
                    <span className="truncate">{selectedService && selectedService.price > 0 ? selectedService.price.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="bg-white dark:bg-slate-900/50 rounded-[24px] md:rounded-[32px] border-2 border-slate-100/80 dark:border-slate-800 p-5 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-blue-200 dark:hover:border-blue-500/50 transition-colors">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center shrink-0 overflow-hidden ring-4 ring-teal-50/50 dark:ring-teal-500/10 relative">
              {selectedDoctor?.avatar ? (
                <Image src={selectedDoctor.avatar} alt="Doctor" fill className="object-cover" sizes="(max-width: 56px) 100vw, 56px" />
              ) : (
                <Image src={selectedDoctor?.gender === 'FEMALE' ? '/images/avatars/doctor-female.png' : '/images/avatars/doctor-male.png'} alt="Doctor" fill className="object-cover" sizes="(max-width: 56px) 100vw, 56px" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[11px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('doctorSelector.specialist') || t('doctorInfo')}</h3>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{selectedDoctor?.fullName}</p>
              {selectedDoctor?.specialties && selectedDoctor.specialties.length > 0 && (
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{selectedDoctor.specialties[0]}</p>
              )}
              {selectedDoctor && selectedDoctor.rating > 0 && (
                <div className="flex items-center gap-1.5 mt-3 sm:mt-4 flex-wrap">
                   <div className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs sm:text-sm font-bold shrink-0">
                     ⭐ {Number(selectedDoctor.rating).toFixed(1)}
                   </div>
                   <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 truncate">({selectedDoctor.reviewCount} {t('reviews')})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Date & Time Info */}
      <div className="bg-blue-500 rounded-[24px] md:rounded-[32px] p-6 sm:p-8 shadow-xl shadow-blue-500/20 text-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Calendar className="w-48 h-48 rotate-12 translate-x-12 -translate-y-12" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 relative z-10">
          <div>
            <h3 className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-200" />
              {t('appointmentDate')}
            </h3>
            <p className="text-xl sm:text-2xl font-extrabold">{selectedDate && formatDate(selectedDate)}</p>
          </div>
          <div className="sm:border-l sm:border-blue-400/50 sm:pl-8 pt-5 border-t border-blue-400/50 sm:pt-0 sm:border-t-0">
            <h3 className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-200" />
              {t('appointmentTime')}
            </h3>
            <p className="text-xl sm:text-2xl font-extrabold">{selectedTimeSlot}</p>
          </div>
        </div>
      </div>

      {/* Patient Notes */}
      <div className="bg-white dark:bg-slate-900/50 rounded-[24px] md:rounded-[32px] border-2 border-slate-100/80 dark:border-slate-800 p-5 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
          </div>
          <span className="text-sm sm:text-base leading-tight">{t('patientNotes')}</span>
        </h3>
        <div className="relative">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('notesPlaceholder')}
            className="w-full px-5 py-4 sm:px-6 sm:py-5 bg-slate-50 dark:bg-slate-900/80 border-2 border-slate-100 dark:border-slate-700 rounded-[16px] sm:rounded-[20px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium placeholder:text-slate-400 placeholder:font-normal"
            rows={4}
            maxLength={500}
          />
          <span className="absolute bottom-3 right-4 sm:bottom-4 sm:right-5 text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500">
            {notes.length}/500
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6 pb-10 flex flex-col items-center">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={cn(
            "w-full max-w-sm flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold transition-all active:scale-95",
            isSubmitting
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white shadow-xl shadow-blue-500/20 cursor-pointer"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('settingUpAppointment')}
            </>
          ) : (
            t('confirmBooking')
          )}
        </button>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-4">
          {t('freeCancellationNote')}
        </p>
      </div>
    </div>
  );
}
