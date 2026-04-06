'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  CalendarBlankIcon,
  TrashIcon,
  WarningCircleIcon,
  XCircleIcon,
  XIcon,
  SpinnerIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isBefore,
  startOfDay,
  isValid,
} from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useDoctorSchedule } from '@/lib/hooks/appointment/useDoctorSchedule';
import { AffectedAppointment } from '@/lib/api/appointment/schedules';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Props {
  doctorId: string;
}

interface PendingCreation {
  date: string;
  reason: string;
  affectedAppointments: AffectedAppointment[];
}

export function DoctorOffDayCalendar({ doctorId }: Props) {
  const {
    offDays,
    loadingOffDays,
    savingOffDay,
    fetchOffDays,
    previewOffDay,
    requestOffDay,
    deleteOffDay,
  } = useDoctorSchedule();

  const t = useTranslations('doctorSchedule.offDays');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reasonInput, setReasonInput] = useState('');

  // 2-step flow state
  const [previewing, setPreviewing] = useState(false);
  const [pendingCreation, setPendingCreation] = useState<PendingCreation | null>(null);

  const today = startOfDay(new Date());

  useEffect(() => {
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
    fetchOffDays(doctorId, start, end);
  }, [doctorId, currentMonth, fetchOffDays]);

  const isOffDay = useCallback(
    (date: Date) => offDays.some((od) => od.date === format(date, 'yyyy-MM-dd')),
    [offDays],
  );

  const handleDayClick = useCallback(
    (date: Date) => {
      if (isBefore(date, today)) return;
      setSelectedDate((prev) => (prev && isSameDay(prev, date) ? null : date));
    },
    [today],
  );

  /**
   * Step 1: Preview — check affected appointments without creating off day.
   * If none → create immediately. If some → show confirmation modal.
   */
  const handleRegisterOffDay = useCallback(async () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const reason = reasonInput.trim() || (locale === 'vi' ? 'Nghỉ phép' : 'Day off');

    setPreviewing(true);
    try {
      const preview = await previewOffDay(doctorId, dateStr);

      if (!preview || preview.affectedAppointments.length === 0) {
        // No conflicts → create immediately, no modal needed
        await requestOffDay(doctorId, dateStr, reason, false);
        setSelectedDate(null);
        setReasonInput('');
      } else {
        // Has conflicts → show confirmation modal
        setPendingCreation({ date: dateStr, reason, affectedAppointments: preview.affectedAppointments });
      }
    } catch {
      /* handled inside hook */
    } finally {
      setPreviewing(false);
    }
  }, [selectedDate, doctorId, reasonInput, locale, previewOffDay, requestOffDay]);

  /**
   * Step 2: Doctor confirmed → create off day AND cancel affected appointments.
   */
  const handleConfirmWithCancel = useCallback(async () => {
    if (!pendingCreation) return;
    try {
      await requestOffDay(doctorId, pendingCreation.date, pendingCreation.reason, true);
      setPendingCreation(null);
      setSelectedDate(null);
      setReasonInput('');
    } catch {
      /* handled inside hook */
    }
  }, [pendingCreation, doctorId, requestOffDay]);

  const handleDeleteOffDay = useCallback(
    async (date: string) => {
      await deleteOffDay(doctorId, date);
    },
    [doctorId, deleteOffDay],
  );

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const leadingBlanks = (getDay(monthStart) + 6) % 7;

  const DAY_NAMES =
    locale === 'vi'
      ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const isBusy = previewing || savingOffDay;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <CalendarBlankIcon size={20} weight="duotone" className="text-[#1392ec]" />
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t('title')}</h2>
          <p className="text-xs text-slate-500">{t('description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* Calendar */}
        <Card className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              className="h-8 w-8 p-0 rounded-lg cursor-pointer hover:bg-slate-100"
            >
              ‹
            </Button>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="h-8 w-8 p-0 rounded-lg cursor-pointer hover:bg-slate-100"
            >
              ›
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-xs font-bold text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {days.map((date) => {
              const isPast = isBefore(date, today);
              const isOff = isOffDay(date);
              const isToday = isSameDay(date, today);
              const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDayClick(date)}
                  disabled={isPast || isOff}
                  className={cn(
                    'relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all cursor-pointer',
                    isPast && 'text-slate-300 cursor-not-allowed',
                    isOff && 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-300 cursor-not-allowed',
                    !isPast && !isOff && !isSelected && 'hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
                    isToday && !isOff && !isSelected && 'ring-2 ring-[#1392ec] text-[#1392ec] font-bold',
                    isSelected && !isOff && 'bg-[#1392ec] text-white ring-2 ring-[#1392ec] ring-offset-1',
                  )}
                >
                  {date.getDate()}
                  {isOff && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 border border-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-3 w-3 rounded-full bg-red-200 border border-red-400" />
              {t('legend.offDay')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-3 w-3 rounded-full bg-[#1392ec]" />
              {t('legend.selected')}
            </div>
          </div>
        </Card>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Register form */}
          {selectedDate && !isOffDay(selectedDate) && (
            <Card className="p-4 rounded-2xl border border-[#1392ec]/30 bg-blue-50/40 dark:bg-blue-950/20">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
                {t.rich('form.title', {
                  date: format(selectedDate, 'dd/MM/yyyy', { locale: dateLocale }),
                  span: (chunks) => <span className="text-[#1392ec]">{chunks}</span>,
                })}
              </p>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder={t('form.reasonPlaceholder')}
                rows={2}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm px-3 py-2 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/30 resize-none"
              />
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleRegisterOffDay}
                  disabled={isBusy}
                  size="sm"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  {isBusy ? (
                    <SpinnerIcon size={14} className="mr-1 animate-spin" />
                  ) : (
                    <XCircleIcon size={14} className="mr-1" />
                  )}
                  {t('form.confirmBtn')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSelectedDate(null); setReasonInput(''); }}
                  className="px-3 text-xs rounded-lg cursor-pointer border-slate-200"
                >
                  <XIcon size={13} />
                </Button>
              </div>
            </Card>
          )}

          {/* Off days list */}
          <Card className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              {t('list.title')}
            </h3>
            {loadingOffDays ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
              </div>
            ) : offDays.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">{t('list.empty')}</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {offDays.map((od) => (
                  <div
                    key={od.id}
                    className="flex items-center justify-between rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-800/30 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        {(() => {
                          const d = new Date(od.date);
                          return isValid(d) ? format(d, 'EEE, dd/MM/yyyy', { locale: dateLocale }) : od.date;
                        })()}
                      </p>
                      {od.reason && (
                        <p className="text-xs text-red-500/80 truncate max-w-[160px]">{od.reason}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOffDay(od.date)}
                      disabled={savingOffDay}
                      className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg cursor-pointer"
                      title={t('list.cancelBtn')}
                    >
                      <TrashIcon size={13} weight="bold" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Step 2 Confirmation Modal ── */}
      <Dialog open={!!pendingCreation} onOpenChange={() => setPendingCreation(null)}>
        <DialogContent className="max-w-lg rounded-2xl p-4 space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <WarningCircleIcon size={22} weight="duotone" />
              {t('affectedModal.title')}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 pt-1">
              {t.rich('affectedModal.description', {
                date: pendingCreation?.date || '',
                count: pendingCreation?.affectedAppointments?.length || 0,
                strong1: (chunks) => <strong>{chunks}</strong>,
                strong2: (chunks) => <strong className="text-red-600">{chunks}</strong>,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Appointment list */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {pendingCreation?.affectedAppointments?.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 dark:bg-red-950/20 dark:border-red-800/30 px-3 py-2"
                >
                  <WarningCircleIcon size={16} weight="fill" className="text-red-400 shrink-0" />
                  <div className="text-xs flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{appt.patientName}</p>
                    <p className="text-slate-500 truncate">{appt.serviceName} · {appt.startTime}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-red-200 text-red-500 shrink-0">
                    {appt.status}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Warning note */}
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 p-3">
              <WarningCircleIcon size={16} weight="fill" className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                {t('affectedModal.footerNote')}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setPendingCreation(null)}
              className="rounded-xl cursor-pointer border-slate-200 text-slate-600"
            >
              {locale === 'vi' ? 'Hủy bỏ' : 'Cancel'}
            </Button>
            <Button
              onClick={handleConfirmWithCancel}
              disabled={savingOffDay}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer font-semibold gap-2"
            >
              {savingOffDay ? (
                <SpinnerIcon size={14} className="animate-spin" />
              ) : (
                <CheckCircleIcon size={16} weight="fill" />
              )}
              {t('affectedModal.understandBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
