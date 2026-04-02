import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DoctorPatientSummary } from '@/types';
import { PatientHistoryResponse, VisitHistoryItem, medicalRecordsApi } from '@/lib/api/medical-records';
import { Loader2, Activity, CalendarDays, Pill, Clock, AlertCircle, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DoctorPatientDrawerProps {
  patient: DoctorPatientSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DoctorPatientDrawer({ patient, open, onOpenChange }: DoctorPatientDrawerProps) {
  const t = useTranslations('doctorPatients');
  const params = useParams();
  const locale = params.locale === 'vi' ? vi : enUS;
  
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState<PatientHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !patient?.id) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await medicalRecordsApi.getPatientHistory(patient.id);
        setHistoryData(data);
      } catch (err: unknown) {
        const errorMsg = 
          (err as { response?: { data?: { message?: string } } }).response?.data?.message || 
          'Không thể tải hồ sơ y tế';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [patient?.id, open]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '--';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale });
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return '--';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale });
  };

  const renderTimelineItem = (visit: VisitHistoryItem) => {
    const hasPrescription = visit.prescription?.items && visit.prescription.items.length > 0;
    
    return (
      <div key={visit.bookingId} className="relative pl-6 pb-6">
        {/* Timeline line */}
        <div className="absolute top-2 left-[11px] bottom-[-8px] w-0.5 bg-slate-200 dark:bg-slate-800" />
        
        {/* Timeline dot */}
        <div className="absolute top-1 left-0 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
          <CalendarDays className="h-3 w-3 text-primary" />
        </div>

        <Card className="ml-4 border-slate-200/60 dark:border-slate-800">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-sm">{formatDateTime(visit.bookingDate)}</div>
                <div className="text-sm text-slate-500">{visit.serviceName}</div>
              </div>
              <Badge variant="outline" className="text-xs font-normal">
                {t('drawer.dr')} {visit.doctorName}
              </Badge>
            </div>

            {visit.medicalRecord?.diagnosisName && (
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-md">
                <div className="flex items-center text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                  <Activity className="h-3.5 w-3.5 mr-1" />
                  {t('drawer.diagnosis')}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {visit.medicalRecord.diagnosisName}
                </p>
              </div>
            )}

            {hasPrescription && (
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-md">
                <div className="flex items-center text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                  <Pill className="h-3.5 w-3.5 mr-1" />
                  {t('drawer.prescription', { count: visit.prescription?.items.length || 0 })}
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                  {visit.prescription?.items.map((item: { medicineName: string }) => item.medicineName).join(', ')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col p-0 max-h-[90vh]">
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl">{t('drawer.title')}</DialogTitle>
            <DialogDescription>
              {t('drawer.desc')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            ) : historyData ? (
              <>
                {/* Patient Profile Synopsis */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    {t('drawer.basicInfo')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <div>
                      <div className="text-xs text-slate-500">{t('drawer.nameId')}</div>
                      <div className="font-medium">{historyData.patientProfile.fullName}</div>
                      <div className="text-sm text-slate-600">{historyData.patientProfile.patientCode}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">{t('drawer.dobAge')}</div>
                      <div className="font-medium">{formatDate(historyData.patientProfile.dateOfBirth)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">{t('drawer.genderBlood')}</div>
                      <div className="font-medium">
                        {historyData.patientProfile.gender === 'MALE' ? t('table.male') : historyData.patientProfile.gender === 'FEMALE' ? t('table.female') : t('table.other')}
                        {historyData.patientProfile.bloodType ? ` - ${historyData.patientProfile.bloodType}` : ''}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">{t('drawer.contact')}</div>
                      <div className="font-medium">{historyData.patientProfile.phone || '--'}</div>
                    </div>
                  </div>
                  
                  {/* Important Health Flags */}
                  {(historyData.patientProfile.allergies || historyData.patientProfile.chronicConditions) && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                      {historyData.patientProfile.allergies && (
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-amber-800 dark:text-amber-500 uppercase">{t('drawer.allergies')}</span>
                          <p className="text-sm text-amber-900 dark:text-amber-100">{historyData.patientProfile.allergies}</p>
                        </div>
                      )}
                      {historyData.patientProfile.chronicConditions && (
                        <div>
                          <span className="text-xs font-semibold text-amber-800 dark:text-amber-500 uppercase">{t('drawer.chronic')}</span>
                          <p className="text-sm text-amber-900 dark:text-amber-100">{historyData.patientProfile.chronicConditions}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Patient History Timeline */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    {t('drawer.historyTitle', { count: historyData.recentVisits?.length || 0 })}
                  </h3>
                  
                  <div className="pt-2">
                    {!historyData.recentVisits || historyData.recentVisits.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        {t('drawer.noHistory')}
                      </div>
                    ) : (
                      historyData.recentVisits.map(renderTimelineItem)
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
