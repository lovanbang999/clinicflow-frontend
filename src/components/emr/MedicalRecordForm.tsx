import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { CreateMedicalRecordDto, ICD10Record } from '@/lib/api/clinical/medical-records';
import { useIcd10Search } from '@/lib/hooks/clinical/useMedicalRecords';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { NotePencilIcon, PillIcon, BookBookmarkIcon, ClockCounterClockwiseIcon, TextBolderIcon, TextItalicIcon, ListBulletsIcon, MagnifyingGlassIcon, InfoIcon, CalendarBlankIcon } from '@phosphor-icons/react';

interface MedicalRecordFormProps {
  bookingId: string;
  isLoading: boolean;
  initialData?: Partial<CreateMedicalRecordDto> | null;
  onFinished?: () => void;
  visible?: boolean;
}

export function MedicalRecordForm({ isLoading, visible = true }: MedicalRecordFormProps) {
  const t = useTranslations('emr.form');

  const { results: icdResults, search: searchIcd, setResults: setIcdResults } = useIcd10Search();

  const [icdSearchTerm, setIcdSearchTerm] = useState('');
  const [showIcdDropdown, setShowIcdDropdown] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { register, setValue, watch } = useFormContext<CreateMedicalRecordDto>();

  const watchDiagnosisName = watch('diagnosisName');
  const watchDiagnosisCode = watch('diagnosisCode');
  const watchFollowUpDate = watch('followUpDate');

  // Sync ICD search term with diagnosis during render if not already set
  // This avoids cascading renders from useEffect. It's safe because it's conditional.
  if (watchDiagnosisName && !icdSearchTerm) {
    setIcdSearchTerm(`${watchDiagnosisCode} - ${watchDiagnosisName}`);
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (icdSearchTerm.length > 0 && icdSearchTerm !== `${watchDiagnosisCode} - ${watchDiagnosisName}`) {
        void searchIcd(icdSearchTerm).then(() => setShowIcdDropdown(true));
      } else if (icdSearchTerm.length === 0) {
        setIcdResults([]);
        setShowIcdDropdown(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [icdSearchTerm, watchDiagnosisCode, watchDiagnosisName, searchIcd, setIcdResults]);

  const selectIcd = (record: ICD10Record) => {
    setValue('diagnosisCode', record.code);
    setValue('diagnosisName', record.name);
    setIcdSearchTerm(`${record.code} - ${record.name}`);
    setShowIcdDropdown(false);
  };

  const addDaysToFollowUp = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setValue('followUpDate', format(d, 'yyyy-MM-dd'), { shouldDirty: true, shouldValidate: true });
  };

  if (isLoading) {
    return (
      <div className={cn("animate-pulse space-y-4 pt-4", !visible && "hidden")}>
        <div className="h-64 w-full bg-slate-200 rounded-xl" />
        <div className="h-48 w-full bg-slate-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col relative", visible && "h-full")}>
      
      {/* Bento Layout Grid */}
      <div className={cn("grid grid-cols-12 gap-6 items-start pb-24", !visible && "hidden")}>
        
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <NotePencilIcon size={24} weight="fill" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t('sections.clinicalExam')}</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('fields.chiefComplaint')} <span className="text-red-500">*</span>
                </label>
                <Textarea
                  {...register('chiefComplaint', { required: true })}
                  className="w-full text-sm shadow-sm min-h-[80px]"
                  placeholder={t('placeholders.chiefComplaint')}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('fields.clinicalFindings')}</label>
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-2 shadow-sm">
                  <div className="flex gap-1 border-b border-gray-200 pb-2 mb-2">
                    <button type="button" className="cursor-pointer p-1.5 hover:bg-gray-200 rounded-md text-gray-600 transition-colors"><TextBolderIcon size={18} /></button>
                    <button type="button" className="cursor-pointer p-1.5 hover:bg-gray-200 rounded-md text-gray-600 transition-colors"><TextItalicIcon size={18} /></button>
                    <button type="button" className="cursor-pointer p-1.5 hover:bg-gray-200 rounded-md text-gray-600 transition-colors"><ListBulletsIcon size={18} /></button>
                  </div>
                  <Textarea
                    {...register('clinicalFindings')}
                    className="w-full border-none shadow-none focus-visible:ring-0 text-sm min-h-[140px] px-0"
                    placeholder={t('placeholders.clinicalFindings')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <PillIcon size={24} weight="fill" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t('sections.instructionsNotes')}</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('fields.treatmentPlan')}</label>
                <Textarea
                  {...register('treatmentPlan')}
                  className="w-full text-sm shadow-sm min-h-[80px]"
                  placeholder={t('placeholders.treatmentPlan')}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('fields.internalNotes')}</label>
                <Textarea
                  {...register('doctorNotes')}
                  className="w-full text-sm shadow-sm min-h-[60px]"
                  placeholder={t('placeholders.doctorNotes')}
                />
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <BookBookmarkIcon size={24} weight="fill" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('sections.diagnosis')}</h3>
              </div>
              <button type="button" className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                {t('labels.diagnosisTemplate')}
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {t('fields.icd10')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={icdSearchTerm}
                    onChange={(e) => {
                      setIcdSearchTerm(e.target.value);
                      if (e.target.value === '') {
                        setValue('diagnosisCode', '');
                        setValue('diagnosisName', '');
                      }
                    }}
                    onFocus={() => { if (icdResults.length > 0) setShowIcdDropdown(true); }}
                    className="w-full pl-10 text-sm shadow-sm h-10"
                    placeholder={t('placeholders.diagnosis')}
                  />
                  {showIcdDropdown && icdResults.length > 0 && (
                    <ul className="absolute left-0 w-full mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                      {icdResults.map((record) => (
                        <li 
                          key={record.code} 
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-start gap-2 text-sm border-b border-gray-50 last:border-0"
                          onClick={() => selectIcd(record)}
                        >
                          <span className="font-bold text-blue-600 whitespace-nowrap">{record.code}</span>
                          <span className="text-gray-700">{record.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <input type="hidden" {...register('diagnosisCode', { required: true })} />
                  <input type="hidden" {...register('diagnosisName', { required: true })} />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('fields.confirmedDiagnosis')}</label>
                <Textarea
                  className="w-full bg-gray-50 text-sm font-medium shadow-sm min-h-[80px] cursor-not-allowed"
                  value={watchDiagnosisName || ''}
                  readOnly
                />
              </div>

              {/* Informational Box (Hardcoded layout matching design) */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <InfoIcon size={20} className="text-blue-600 shrink-0" weight="fill" />
                <p className="text-xs text-blue-700 font-medium">{t('messages.noHistoryMsg')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <ClockCounterClockwiseIcon size={24} weight="fill" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t('sections.followUp')}</h3>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('fields.appointmentDate')}</label>
                <input type="hidden" {...register('followUpDate')} />
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-300 focus:ring-blue-600 shadow-sm h-10",
                        !watchFollowUpDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarBlankIcon size={20} className="mr-2 text-gray-400" />
                      {watchFollowUpDate ? format(new Date(watchFollowUpDate), "dd/MM/yyyy") : <span>{t('placeholders.selectDate')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watchFollowUpDate ? new Date(watchFollowUpDate) : undefined}
                      onSelect={(date) => {
                        setValue('followUpDate', date ? format(date, 'yyyy-MM-dd') : '', { shouldDirty: true, shouldValidate: true });
                        if (date) setIsCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-2 py-2">
                <Button variant="secondary" type="button" onClick={() => addDaysToFollowUp(7)} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 h-9">{t('labels.days7')}</Button>
                <Button variant="secondary" type="button" onClick={() => addDaysToFollowUp(14)} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 h-9">{t('labels.days14')}</Button>
                <Button variant="secondary" type="button" onClick={() => addDaysToFollowUp(30)} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 h-9">{t('labels.days30')}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
