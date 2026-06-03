"use client";

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { DoctorPatientSummary } from '@/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, User, Users, ChevronRight, ChevronLeft, Phone, Calendar } from 'lucide-react';
import { useDoctorPatients } from '@/lib/hooks/clinical/useDoctorPatients';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { DoctorPatientDrawer } from '@/components/dashboard/doctors/DoctorPatientDrawer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function DoctorPatientsPage() {
  const t = useTranslations('doctorPatients');
  const currentLocale = useLocale();
  const locale = currentLocale === 'vi' ? vi : enUS;

  const { patients, loading, total, searchQuery, handleSearch, page, totalPages, setPage } = useDoctorPatients();
  const [selectedPatient, setSelectedPatient] = useState<DoctorPatientSummary | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '--';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale });
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                {t('title')}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 border-none font-bold">
                  {total} {t('listTitle')}
                </Badge>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('description')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-0 bg-brand-500/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-500 transition-colors pointer-events-none" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-11 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus-visible:ring-brand-500/20 focus-visible:border-brand-500 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading && patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading patients data...</p>
          </div>
        ) : patients.length === 0 ? (
          <Card className="border-none shadow-none bg-slate-50/50 dark:bg-slate-900/40 rounded-[32px] py-24 border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center mb-6">
                <User className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{t('empty')}</h3>
              <p className="mt-2 text-slate-500 font-medium max-w-xs">{t('emptyDesc')}</p>
            </div>
          </Card>
        ) : (
          <div className="bg-white dark:bg-slate-900/40 rounded-[32px] border border-slate-100 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full text-left border-collapse">
                <TableHeader>
                  <TableRow className="border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('table.patient')}</TableHead>
                    <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('table.contact')}</TableHead>
                    <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">{t('table.visits')}</TableHead>
                    <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('table.lastVisit')}</TableHead>
                    <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">{t('table.action')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50 dark:divide-slate-800/50 font-bold border-none">
                  {patients.map((patient) => (
                    <TableRow
                      key={patient.id}
                      className="group border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-brand-500/5 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-brand-500/10 group-hover:scale-110 transition-transform duration-500">
                            {patient.fullName.substring(0, 1)}
                          </div>
                          <div>
                            <div className="text-[15px] font-black text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors">{patient.fullName}</div>
                            <div className="text-[11px] text-brand-600/70 dark:text-brand-400/70 font-black uppercase tracking-wider mt-0.5">{patient.patientCode}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[13px]">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {patient.phone || '--'}
                          </div>
                          <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800/50 text-[10px] h-5 border-none font-black uppercase tracking-tight px-2">
                            {patient.gender === 'MALE' ? t('table.male') : patient.gender === 'FEMALE' ? t('table.female') : t('table.other')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xl font-black text-slate-900 dark:text-slate-100">{patient.totalVisits}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{t('times')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 text-[13px]">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {formatDate(patient.lastVisitDate)}
                          </div>
                          <div className="text-[11px] text-slate-500 font-bold truncate max-w-[200px] italic opacity-80" title={patient.lastServiceName || ''}>
                            {patient.lastServiceName || '--'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 rounded-xl hover:bg-brand-500 hover:text-white transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(patient);
                          }}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {!loading && total > 0 && (
              <div className="px-8 py-5 bg-slate-50/30 dark:bg-slate-900/20 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center flex-wrap gap-4">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  {t('showingCount', { count: patients.length, total: total })}
                </span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t('pagination.previous')}
                    </Button>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {t('pagination.next')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <DoctorPatientDrawer
        patient={selectedPatient}
        open={!!selectedPatient}
        onOpenChange={(isOpen) => !isOpen && setSelectedPatient(null)}
      />
    </div>
  );
}
