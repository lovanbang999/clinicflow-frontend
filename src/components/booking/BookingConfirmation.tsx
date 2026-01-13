'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/lib/store/bookingStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useBookings } from '@/lib/hooks/useBookings';
import { Calendar, Clock, FileText, Stethoscope, DollarSign, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { formatDate } from '@/lib/utils/formatters';

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
    previousStep,
  } = useBookingStore();

  const handleSubmit = async () => {
    if (!selectedService || !selectedDoctor || !selectedDate || !selectedTimeSlot) {
      toast.error('Vui lòng hoàn thành tất cả các bước');
      return;
    }

    if (!user?.id) {
      toast.error('Vui lòng đăng nhập để đặt lịch');
      return;
    }

    const bookingDate = formatDate(selectedDate, 'yyyy-MM-dd');

    const booking = await createBooking({
      patientId: user.id,
      doctorId: selectedDoctor.id,
      serviceId: selectedService.id,
      bookingDate,
      startTime: selectedTimeSlot,
      patientNotes: notes || undefined,
    });

    if (booking) {
      setIsSuccess(true);
      toast.success('Đặt lịch thành công!');

      // Redirect after 2 seconds
      setTimeout(() => {
        resetBooking();
        router.push('/patient/bookings');
      }, 2000);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt lịch thành công!</h2>
        <p className="text-gray-600 text-center max-w-md">
          Bạn sẽ được chuyển hướng đến trang quản lý lịch hẹn...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Service Info */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Dịch vụ</h3>
            <p className="text-lg font-medium">{selectedService?.name}</p>
            {selectedService?.description && (
              <p className="text-sm text-gray-600 mt-1">{selectedService.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <span className="text-sm text-gray-600">
                <Clock className="w-4 h-4 inline mr-1" />
                {selectedService?.durationMinutes} phút
              </span>
              <span className="text-lg font-semibold text-primary">
                <DollarSign className="w-4 h-4 inline mr-1" />
                {selectedService?.price.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Doctor Info */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar
            src={selectedDoctor?.avatar}
            alt={selectedDoctor?.fullName}
            size="lg"
            className="shrink-0"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Bác sĩ</h3>
            <p className="text-lg font-medium">{selectedDoctor?.fullName}</p>
            {selectedDoctor?.specialties && selectedDoctor.specialties.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">{selectedDoctor.specialties[0]}</p>
            )}
            {selectedDoctor && selectedDoctor.rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                ⭐ {selectedDoctor.rating.toFixed(1)}/5 ({selectedDoctor.reviewCount} đánh giá)
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Date & Time Info */}
      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Ngày khám
            </h3>
            <p className="text-lg">{selectedDate && formatDate(selectedDate)}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Giờ khám
            </h3>
            <p className="text-lg font-medium">{selectedTimeSlot}</p>
          </div>
        </div>
      </Card>

      {/* Patient Notes */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Ghi chú (không bắt buộc)
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Mô tả triệu chứng hoặc lý do khám bệnh..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-2">{notes.length}/500 ký tự</p>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          size="lg"
          onClick={previousStep}
          className="px-8 py-6 text-lg cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="px-8 py-6 text-lg cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Đang xử lý...
            </>
          ) : (
            'Xác nhận đặt lịch'
          )}
        </Button>
      </div>
    </div>
  );
}
