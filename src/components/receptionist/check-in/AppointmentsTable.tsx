'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import {
  CalendarBlankIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  UserCircleIcon,
  XIcon,
  MagnifyingGlassIcon,
  StethoscopeIcon,
} from '@phosphor-icons/react';
import { Booking, BookingStatus } from '@/types';
import { BookingTableBody } from './BookingTableBody';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface Doctor {
  id: string;
  fullName: string;
}

interface AppointmentsTableProps {
  bookings: Booking[];
  totalBookings: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onStatusFilter: (status: BookingStatus | string) => void;
  activeStatusTab: BookingStatus | string;
  onCancelBookingClick: (booking: Booking) => void;
  onConfirmBookingClick: (booking: Booking) => void;
  onCheckInClick: (booking: Booking) => void;
  // Filter props
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedDoctorId: string;
  onDoctorChange: (doctorId: string) => void;
  doctors: Doctor[];
  selectedServiceId: string;
  onServiceChange: (serviceId: string) => void;
  services: { id: string; name: string }[];
}

export function AppointmentsTable({
  bookings,
  totalBookings,
  currentPage,
  onPageChange,
  onStatusFilter,
  activeStatusTab,
  onCancelBookingClick,
  onConfirmBookingClick,
  onCheckInClick,
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
  selectedDoctorId,
  onDoctorChange,
  doctors,
  selectedServiceId,
  onServiceChange,
  services,
}: AppointmentsTableProps) {
  const t = useTranslations('dashboard.receptionist.checkInManagement');

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const doctorDropdownRef = useRef<HTMLDivElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  const tabs: { labelKey: string; value: BookingStatus | string }[] = [
    { labelKey: 'stats.pending', value: BookingStatus.PENDING },
    { labelKey: 'stats.confirmed', value: BookingStatus.CONFIRMED },
    { labelKey: 'stats.completed', value: BookingStatus.COMPLETED },
    { labelKey: 'stats.cancelled', value: BookingStatus.CANCELLED },
  ];

  const pageLimit = 10;
  const totalPages = Math.ceil(totalBookings / pageLimit);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const selectedDateObj = selectedDate ? parseISO(selectedDate) : undefined;
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) ?? null;
  const selectedService = services.find((s) => s.id === selectedServiceId) ?? null;
  const isDateFiltered = Boolean(selectedDate);
  const isTodaySelected = selectedDate === todayStr;
  const isDoctorFiltered = Boolean(selectedDoctorId);
  const isServiceFiltered = Boolean(selectedServiceId);

  // Close doctor dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(e.target as Node)) {
        setIsDoctorDropdownOpen(false);
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(e.target as Node)) {
        setIsServiceDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTodayClick = () => {
    if (isTodaySelected) {
      onDateChange('');
    } else {
      onDateChange(todayStr);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(format(date, 'yyyy-MM-dd'));
    } else {
      onDateChange('');
    }
    setIsCalendarOpen(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">

      {/* Tab Filters + Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-col gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <MagnifyingGlassIcon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1570EF]/20 focus:border-[#1570EF] transition-all"
          />
        </div>

        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">

          {/* Status Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-full xl:w-auto overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeStatusTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => onStatusFilter(tab.value)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 font-medium'
                  }`}
                >
                  {t(tab.labelKey)}
                </button>
              );
            })}
          </div>

          {/* Date & Doctor Filters */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Today shortcut button */}
            <button
              onClick={handleTodayClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isTodaySelected
                  ? 'border-[#1570EF] bg-[#1570EF]/5 text-[#1570EF]'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CalendarBlankIcon size={16} />
              <span>{t('filters.today')}</span>
            </button>

            {/* shadcn Date Picker */}
            <div className="flex items-center gap-1">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isDateFiltered && !isTodaySelected
                        ? 'border-[#1570EF] bg-[#1570EF]/5 text-[#1570EF]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CalendarBlankIcon size={16} />
                    <span>
                      {isDateFiltered && !isTodaySelected
                        ? format(parseISO(selectedDate), 'MMM dd, yyyy')
                        : t('filters.pickDate')}
                    </span>
                    <CaretDownIcon size={14} />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 shadow-lg border border-slate-200 rounded-xl overflow-hidden"
                  align="end"
                  sideOffset={6}
                >
                  <Calendar
                    mode="single"
                    selected={selectedDateObj}
                    onSelect={handleCalendarSelect}
                    initialFocus
                    footer={
                      <div className="flex justify-between px-3 pb-3 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => { onDateChange(''); setIsCalendarOpen(false); }}
                          className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          {t('filters.clearDate')}
                        </button>
                        <button
                          onClick={() => { onDateChange(todayStr); setIsCalendarOpen(false); }}
                          className="text-xs font-medium text-[#1570EF] hover:text-[#0F5ED4] transition-colors cursor-pointer"
                        >
                          {t('filters.today')}
                        </button>
                      </div>
                    }
                  />
                </PopoverContent>
              </Popover>

              {/* Clear date X button */}
              {isDateFiltered && (
                <button
                  onClick={() => onDateChange('')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  title={t('filters.clearDate')}
                >
                  <XIcon size={14} />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="h-5 w-px bg-slate-200" />

            {/* Service dropdown */}
            <div className="relative" ref={serviceDropdownRef}>
              <button
                onClick={() => setIsServiceDropdownOpen((v) => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors cursor-pointer min-w-[140px] ${
                  isServiceFiltered
                    ? 'border-[#1570EF] bg-[#1570EF]/5 text-[#1570EF]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <StethoscopeIcon size={16} />
                <span className="truncate max-w-[130px]">
                  {selectedService ? selectedService.name : 'Tất cả dịch vụ'}
                </span>
                <CaretDownIcon size={14} className="ml-auto shrink-0" />
              </button>

              {isServiceDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    <button
                      onClick={() => { onServiceChange(''); setIsServiceDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                        !selectedServiceId
                          ? 'bg-[#1570EF]/5 text-[#1570EF] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <StethoscopeIcon size={16} />
                      Tất cả dịch vụ
                    </button>
                    <div className="border-t border-slate-100" />
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => { onServiceChange(service.id); setIsServiceDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                          selectedServiceId === service.id
                            ? 'bg-[#1570EF]/5 text-[#1570EF] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {service.name}
                      </button>
                    ))}
                    {services.length === 0 && (
                      <p className="px-4 py-3 text-sm text-slate-400 text-center">Chưa có dịch vụ</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Doctor dropdown */}
            <div className="relative" ref={doctorDropdownRef}>
              <button
                onClick={() => setIsDoctorDropdownOpen((v) => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors cursor-pointer min-w-[140px] ${
                  isDoctorFiltered
                    ? 'border-[#1570EF] bg-[#1570EF]/5 text-[#1570EF]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserCircleIcon size={16} />
                <span className="truncate max-w-[130px]">
                  {selectedDoctor ? selectedDoctor.fullName : t('filters.allDoctors')}
                </span>
                <CaretDownIcon size={14} className="ml-auto shrink-0" />
              </button>

              {isDoctorDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    <button
                      onClick={() => { onDoctorChange(''); setIsDoctorDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                        !selectedDoctorId
                          ? 'bg-[#1570EF]/5 text-[#1570EF] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <UserCircleIcon size={16} />
                      {t('filters.allDoctors')}
                    </button>
                    <div className="border-t border-slate-100" />
                    {doctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => { onDoctorChange(doctor.id); setIsDoctorDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                          selectedDoctorId === doctor.id
                            ? 'bg-[#1570EF]/5 text-[#1570EF] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {doctor.fullName}
                      </button>
                    ))}
                    {doctors.length === 0 && (
                      <p className="px-4 py-3 text-sm text-slate-400 text-center">{t('filters.noDoctors')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Clear all */}
            {(isDateFiltered || isDoctorFiltered || isServiceFiltered) && (
              <button
                onClick={() => { onDateChange(''); onDoctorChange(''); onServiceChange(''); }}
                className="text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors cursor-pointer px-1"
              >
                {t('filters.clearAll')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[12px] uppercase tracking-wider font-semibold border-b border-slate-100">
              <th className="px-6 py-4">{t('table.bookingId')}</th>
              <th className="px-6 py-4">{t('table.patient')}</th>
              <th className="px-6 py-4">{t('table.doctor')}</th>
              <th className="px-6 py-4">{t('table.service')}</th>
              <th className="px-6 py-4">{t('table.time')}</th>
              <th className="px-6 py-4">{t('table.status')}</th>
              <th className="px-6 py-4 text-center">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <BookingTableBody
              bookings={bookings}
              onConfirm={onConfirmBookingClick}
              onCancel={onCancelBookingClick}
              onCheckIn={onCheckInClick}
            />
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500 font-medium">
          {t('pagination', {
            start: totalBookings === 0 ? 0 : (currentPage - 1) * pageLimit + 1,
            end: Math.min(currentPage * pageLimit, totalBookings),
            total: totalBookings,
            status: t(`stats.${activeStatusTab.toLowerCase()}`).toLowerCase(),
          })}
        </p>
        <div className="flex gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1 border border-slate-200 rounded text-slate-400 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CaretLeftIcon size={18} />
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1 border border-slate-200 rounded text-slate-400 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CaretRightIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
