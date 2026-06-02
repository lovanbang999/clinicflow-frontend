'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useBookingStore } from '@/lib/store/bookingStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useBookings } from '@/lib/hooks/appointment/useBookings';
import { usersApi } from '@/lib/api/auth/users';
import { schedulesApi } from '@/lib/api/appointment/schedules';
import { Calendar, Clock, FileText, Stethoscope, DollarSign, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
    bookingType,
    selectedService,
    selectedDoctor,
    selectedDate,
    selectedTimeSlot,
    resetBooking,
  } = useBookingStore();
  const t = useTranslations('booking');

  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const reservationAttempted = useRef(false);

  // Reserve slot on mount
  useEffect(() => {
    const profileId = user?.patientProfile?.id;
    if (!selectedDoctor || !selectedDate || !selectedTimeSlot || !profileId || reservationAttempted.current) return;

    const reserve = async () => {
      try {
        reservationAttempted.current = true;
        await schedulesApi.reserveSlot({
          doctorId: selectedDoctor.id,
          date: formatDate(selectedDate, 'yyyy-MM-dd'),
          startTime: selectedTimeSlot,
          patientProfileId: profileId,
        });
        toast.info(t('slotReserved') || 'Chỗ đã được giữ trong 5 phút');
      } catch (error: unknown) {
        void error;
        const err = error as { response?: { status: number } };
        if (err.response?.status === 409) {
          toast.error(
            t('slotLocked') || 'Chỗ này hiện đang được giữ bởi người khác',
          );
          router.push('/patient/book');
        }
      }
    };

    reserve();

    // Release on unmount
    return () => {
      if (!isSuccess && profileId) {
        schedulesApi.releaseSlot({
          doctorId: selectedDoctor.id,
          date: formatDate(selectedDate, 'yyyy-MM-dd'),
          startTime: selectedTimeSlot,
          patientProfileId: profileId,
        }).catch(() => {});
      }
    };
  }, [selectedDoctor, selectedDate, selectedTimeSlot, user, isSuccess, t, router]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      toast.warning(
        t('reservationExpired') || 'Hết thời gian giữ chỗ. Vui lòng thử lại.',
      );
      router.push('/patient/book');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, router, t]);

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTimeSlot) {
      toast.error(t('completeAllSteps'));
      return;
    }

    if (bookingType === 'SPECIALIST' && !selectedService) {
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
        void error;
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
      serviceId: selectedService?.id,
      bookingDate,
      startTime: selectedTimeSlot,
      patientNotes: notes || undefined,
      source: 'ONLINE', // Explicitly set source
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
      {/* Reservation Timer Banner */}
      <div className="bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-100 dark:border-amber-500/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
              {t('reservationTimer') || 'Thời gian giữ chỗ'}
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/80 font-medium">
              {t('reservationNote') ||
                'Vui lòng hoàn tất đặt lịch trong thời gian này'}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-500/30">
          <span className="text-xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
            {formatTimeLeft(timeLeft)}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Service Info */}
        <div className="bg-white dark:bg-slate-900/50 rounded-[24px] md:rounded-[32px] border-2 border-slate-100/80 dark:border-slate-800 p-4 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-blue-200 dark:hover:border-blue-500/50 transition-colors">
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
                    <span className="truncate">{selectedService && Number(selectedService.price) > 0 ? Number(selectedService.price).toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="bg-white dark:bg-slate-900/50 rounded-[24px] md:rounded-[32px] border-2 border-slate-100/80 dark:border-slate-800 p-4 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-blue-200 dark:hover:border-blue-500/50 transition-colors">
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
              
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold shrink-0">
                  ⭐ {Number(selectedDoctor?.rating || 0).toFixed(1)}
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border",
                  !selectedDoctor?.consultationFee || selectedDoctor.consultationFee === 0
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400"
                )}>
                  {!selectedDoctor?.consultationFee ||
                  selectedDoctor.consultationFee === 0
                    ? t('selection.free') || 'Miễn phí'
                    : `${Number(selectedDoctor.consultationFee).toLocaleString('vi-VN')} ₫`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white dark:bg-slate-900/50 rounded-[24px] md:rounded-[32px] border-2 border-slate-100/80 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
          </div>
          <span className="text-sm sm:text-base leading-tight">Chi phí dự kiến</span>
        </h3>

        <div className="space-y-4">
          {/* Consultation Fee */}
          <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Phí khám tư vấn</p>
              <p className="text-[11px] text-slate-400 font-medium">Bác sĩ {selectedDoctor?.fullName}</p>
            </div>
            <p className="font-bold text-slate-900 dark:text-white">
              {!selectedDoctor?.consultationFee || Number(selectedDoctor.consultationFee) === 0 
                ? '0 ₫' 
                : `${Number(selectedDoctor.consultationFee).toLocaleString('vi-VN')} ₫`}
            </p>
          </div>

          {/* Service Fee (if applicable) */}
          {selectedService && (
            <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Phí dịch vụ chuyên khoa</p>
                <p className="text-[11px] text-slate-400 font-medium">{selectedService.name}</p>
              </div>
              <p className="font-bold text-slate-900 dark:text-white">
                {Number(selectedService.price).toLocaleString('vi-VN')} ₫
              </p>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Tổng dự kiến</p>
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-black text-blue-600">
                {(Number(selectedDoctor?.consultationFee || 0) + Number(selectedService?.price || 0)).toLocaleString('vi-VN')} ₫
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-1">Thu tại quầy lễ tân</p>
            </div>
          </div>

          {/* Note */}
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
             <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
               <span className="text-blue-500 font-bold mr-1">Lưu ý:</span>
               Tổng phí thực tế có thể thay đổi tùy thuộc vào các chỉ định cận lâm sàng hoặc thuốc phát sinh trong quá trình thăm khám của bác sĩ.
             </p>
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
