"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DoctorPatientSummary } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, FileText, User } from 'lucide-react';
import { useDoctorPatients } from '@/lib/hooks/useDoctorPatients';
import { DoctorPatientDrawer } from '@/components/dashboard/doctors/DoctorPatientDrawer';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useParams } from 'next/navigation';
// import { DoctorPatientDrawer } from '@/components/dashboard/doctors/DoctorPatientDrawer'; // We will create this next

export default function DoctorPatientsPage() {
  const t = useTranslations('dashboard');
  const params = useParams();
  const locale = params.locale === 'vi' ? vi : enUS;
  
  const { patients, loading, total, searchQuery, handleSearch } = useDoctorPatients();
  const [selectedPatient, setSelectedPatient] = useState<DoctorPatientSummary | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '--';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('doctor.patientsPage.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('doctor.patientsPage.description')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-medium">{t('doctor.patientsPage.listTitle')}</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t('doctor.patientsPage.searchPlaceholder')}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && patients.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <User className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">{t('doctor.patientsPage.empty')}</h3>
              <p className="mt-1">{t('doctor.patientsPage.emptyDesc')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t('doctor.patientsPage.table.patient')}</th>
                    <th className="px-4 py-3 font-medium">{t('doctor.patientsPage.table.contact')}</th>
                    <th className="px-4 py-3 font-medium">{t('doctor.patientsPage.table.visits')}</th>
                    <th className="px-4 py-3 font-medium">{t('doctor.patientsPage.table.lastVisit')}</th>
                    <th className="px-4 py-3 font-medium text-right">{t('doctor.patientsPage.table.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{patient.fullName}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{patient.patientCode}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{patient.phone || '--'}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {patient.gender === 'MALE' ? t('doctor.patientsPage.table.male') : patient.gender === 'FEMALE' ? t('doctor.patientsPage.table.female') : t('doctor.patientsPage.table.other')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="font-normal">
                          {patient.totalVisits} {t('doctor.patientsPage.times')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div>{formatDate(patient.lastVisitDate)}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[150px] mt-0.5" title={patient.lastServiceName || ''}>
                          {patient.lastServiceName || '--'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                          {t('doctor.patientsPage.viewProfile')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination could go here */}
          {!loading && total > 0 && (
            <div className="mt-4 text-sm text-slate-500 text-center">
              {t('doctor.patientsPage.showingCount', { count: patients.length, total: total })}
            </div>
          )}
        </CardContent>
      </Card>
      
      <DoctorPatientDrawer 
        patient={selectedPatient}
        open={!!selectedPatient}
        onOpenChange={(isOpen) => !isOpen && setSelectedPatient(null)}
      />
    </div>
  );
}
