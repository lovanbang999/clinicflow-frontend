import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { 
  CalendarBlankIcon, 
  CaretDownIcon, 
  FadersIcon, 
  XCircleIcon, 
  CaretLeftIcon,
  CaretRightIcon} from '@phosphor-icons/react';
import { Booking, BookingStatus } from '@/types';

interface AppointmentsTableProps {
  bookings: Booking[];
  totalBookings: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onStatusFilter: (status: BookingStatus | string) => void;
  activeStatusTab: BookingStatus | string;
  onCancelBookingClick: (booking: Booking) => void;
  onConfirmBooking: (bookingId: string) => Promise<void>;
}

export function AppointmentsTable({
  bookings,
  totalBookings,
  currentPage,
  onPageChange,
  onStatusFilter,
  activeStatusTab,
  onCancelBookingClick,
  onConfirmBooking,
}: AppointmentsTableProps) {
  const t = useTranslations('dashboard.receptionist.checkInManagement');

  const tabs: { labelKey: string; value: BookingStatus | string }[] = [
    { labelKey: 'stats.pending', value: BookingStatus.PENDING },
    { labelKey: 'stats.confirmed', value: BookingStatus.CONFIRMED },
    { labelKey: 'stats.completed', value: BookingStatus.COMPLETED },
    { labelKey: 'stats.cancelled', value: BookingStatus.CANCELLED },
  ];

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">{t('stats.pending')}</span>;
      case BookingStatus.CONFIRMED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">{t('stats.confirmed')}</span>;
      case BookingStatus.CHECKED_IN:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">Checked In</span>;
      case BookingStatus.COMPLETED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">{t('stats.completed')}</span>;
      case BookingStatus.CANCELLED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">{t('stats.cancelled')}</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
      {/* Filters Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-full xl:w-auto overflow-x-auto">
             {tabs.map((tab) => {
                 const isActive = activeStatusTab === tab.value;
                 return (
                     <button
                         key={tab.value}
                         onClick={() => onStatusFilter(tab.value)}
                         className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                             isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                         }`}
                     >
                         {t(tab.labelKey)}
                     </button>
                 )
             })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
             <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                <CalendarBlankIcon size={18} />
                <span>{t('filters.today')}</span>
                <CaretDownIcon size={16} />
             </button>
             <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                <FadersIcon size={18} />
                <span>{t('filters.allDoctors')}</span>
                <CaretDownIcon size={16} />
             </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[12px] uppercase tracking-wider font-semibold border-b border-slate-100">
              <th className="px-6 py-4">{t('table.time')}</th>
              <th className="px-6 py-4">{t('table.patient')}</th>
              <th className="px-6 py-4">{t('table.doctor')}</th>
              <th className="px-6 py-4">{t('table.service')}</th>
              <th className="px-6 py-4">{t('table.status')}</th>
              <th className="px-6 py-4 text-right mb-4">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {bookings.length > 0 ? bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-slate-900">{booking.startTime}</p>
                    <p className="text-[11px] text-slate-500">{format(new Date(booking.bookingDate), 'MMM dd, yyyy')}</p>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-[#1570EF]/10 text-[#1570EF] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                             {booking.patientProfile?.fullName?.substring(0,2) || '??'}
                         </div>
                         <div className="flex flex-col">
                             <p className="text-sm font-semibold text-slate-900">{booking.patientProfile?.fullName}</p>
                             <p className="text-xs text-slate-500">ID: {booking.patientProfile?.id?.slice(0,6).toUpperCase()}</p>
                         </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col">
                        <p className="text-sm font-medium text-slate-700">{booking.doctor?.fullName}</p>
                        <p className="text-xs text-slate-400">Doctor ID: {booking.doctor?.id?.slice(0,6).toUpperCase()}</p>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{booking.service?.name}</p>
                  </td>
                  <td className="px-6 py-4">
                     {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                     <div className="flex items-center justify-end gap-2">
                        {booking.status === BookingStatus.PENDING && (
                           <button onClick={(e) => { e.stopPropagation(); onConfirmBooking(booking.id); }} className="bg-[#1570EF] text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-[#0F5ED4] transition-colors cursor-pointer">
                              {t('table.confirmBtn')}
                           </button>
                        )}
                        {(booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED) && (
                           <button onClick={(e) => { e.stopPropagation(); onCancelBookingClick(booking); }} className="text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-lg transition-colors cursor-pointer" title="Cancel Booking">
                              <XCircleIcon size={20} weight="bold" />
                           </button>
                        )}
                        {booking.status === BookingStatus.CANCELLED && (
                          <span className="text-slate-300 text-sm font-medium">-</span>
                        )}
                     </div>
                  </td>
                </tr>
             )) : (
                <tr>
                   <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                          <CalendarBlankIcon size={32} className="text-slate-300" />
                          <p>{t('table.noData')}</p>
                      </div>
                   </td>
                </tr>
             )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between">
         <p className="text-xs text-slate-500 font-medium">
             {t('pagination', { 
               start: totalBookings === 0 ? 0 : (currentPage - 1) * 10 + 1, 
               end: Math.min(currentPage * 10, totalBookings), 
               total: totalBookings,
               status: t(`stats.${activeStatusTab.toLowerCase()}`).toLowerCase()
             })}
         </p>
         <div className="flex gap-2">
             <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="p-1 border border-slate-200 rounded text-slate-400 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <CaretLeftIcon size={18} />
             </button>
             <button disabled={currentPage * 10 >= totalBookings} onClick={() => onPageChange(currentPage + 1)} className="p-1 border border-slate-200 rounded text-slate-400 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <CaretRightIcon size={18} />
             </button>
         </div>
      </div>
    </div>
  );
}
