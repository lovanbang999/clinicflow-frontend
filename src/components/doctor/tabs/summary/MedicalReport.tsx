'use client';

import { useTranslations } from 'next-intl';
import { type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { format } from 'date-fns';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface MedicalReportProps {
  record: VisitResultsResponse;
}

export function MedicalReport({ record }: MedicalReportProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  const t = useTranslations('emr.visit.summary');
  const commonT = useTranslations('emr.visit');

  if (!mounted) return null;

  const labOrders = record.labOrders ?? [];
  const prescriptionItems = record.prescription?.items ?? [];
  const patient = record.booking?.patientProfile;
  const doctor = record.booking?.doctor;

  return createPortal(
    <div id="printable-exam-result" className="hidden print:block print:p-10 print:bg-white bg-white font-serif">
      {/* 
          PREMIUM CLINICAL HEADER
          Strictly for printing
      */}
      <div className="mb-8 border-b border-slate-900 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 overflow-hidden p-2 relative">
              <Image src="/logo.svg" alt="SmartClinic" fill className="object-contain p-2" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight">{t('printHeader.clinicName')}</h1>
              <p className="text-[11px] text-slate-500 font-bold">{t('printHeader.clinicAddress')}</p>
              <p className="text-[11px] text-slate-800 font-black">{t('printHeader.clinicPhone')}</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
             <div className="px-3 py-1 border border-slate-300 rounded-lg bg-slate-50">
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">{t('patientLabels.code')}</p>
                <p className="text-sm font-mono font-black text-slate-900 tracking-wider leading-none">{patient?.patientCode || '---'}</p>
             </div>
          </div>
        </div>
        
        <div className="mt-12 text-center relative">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-[0.15em] relative z-10">{t('printHeader.title')}</h2>
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 -z-0"></div>
        </div>

        {/* Patient Biography Grid */}
        <div className="mt-10 grid grid-cols-3 gap-y-4 gap-x-6 text-[13px] border-t border-b border-slate-300 py-6 px-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{t('patientLabels.fullName')}</span>
            <span className="font-black text-slate-900 uppercase text-[15px]">{patient?.fullName}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{t('patientLabels.dob')}</span>
            <span className="font-black text-slate-800">{patient?.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd/MM/yyyy') : '---'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{t('patientLabels.gender')}</span>
            <span className="font-black text-slate-800 uppercase">{patient?.gender || '---'}</span>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{t('patientLabels.address')}</span>
            <span className="font-bold text-slate-700 italic">{patient?.address || '---'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{t('patientLabels.phone')}</span>
            <span className="font-black text-slate-800">{patient?.phone || '---'}</span>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{t('patientLabels.doctor')}</span>
            <span className="font-black text-slate-900 uppercase">{doctor?.fullName || '---'}</span>
          </div>
        </div>
      </div>

      {/* Clinical Content */}
      <div className="space-y-10 mt-10">
        {/* Vitals Strip */}
        <section className="space-y-4">
          <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-slate-900 pl-3">
            {t('sections.symptoms')}
          </h3>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-[14px] font-bold text-slate-800 pb-4 border-b border-dashed border-slate-200">
            <div className="flex gap-2">
              <span className="text-slate-400 font-bold uppercase text-[10px] self-center">{commonT('symptoms.bp')}:</span>
              <span>{record.bloodPressure || '--/--'} mmHg</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 font-bold uppercase text-[10px] self-center">{commonT('symptoms.heartRate')}:</span>
              <span>{record.heartRate || '--'} bpm</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 font-bold uppercase text-[10px] self-center">{commonT('symptoms.temperature')}:</span>
              <span>{record.temperature ? Number(record.temperature).toFixed(1) : '--'} °C</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 font-bold uppercase text-[10px] self-center">{commonT('symptoms.spO2')}:</span>
              <span>{record.spO2 || '--'} %</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-2">
            <div className="space-y-2">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{commonT('symptoms.chiefComplaint')}</h4>
              <p className="text-[14px] text-slate-900 font-bold leading-relaxed">
                {record.chiefComplaint || t('empty')}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{commonT('symptoms.clinicalFindings')}</h4>
              <p className="text-[14px] text-slate-800 leading-relaxed font-medium">
                {record.clinicalFindings || t('empty')}
              </p>
            </div>
          </div>
        </section>

        {/* Lab Results Table */}
        {labOrders.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-slate-900 pl-3">
              {t('sections.labResults')}
            </h3>
            <div className="border border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-800">
                    <th className="px-4 py-4 text-[12px] font-black text-slate-900 uppercase tracking-wider w-[40%] border-r border-slate-300">{t('table.testName')}</th>
                    <th className="px-4 py-4 text-[12px] font-black text-slate-900 uppercase tracking-wider">{t('table.result')}</th>
                  </tr>
                </thead>
                <tbody>
                  {labOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-4 text-[14px] font-black text-slate-900 border-r border-slate-200">{order.testName}</td>
                      <td className="px-4 py-4">
                        {order.result ? (
                          <div className="space-y-1">
                            <p className="text-[14px] text-slate-900 font-medium leading-relaxed">{order.result.resultText}</p>
                            {order.result.isAbnormal && (
                              <p className="text-[12px] text-red-700 font-black">
                                 {order.result.abnormalNote || commonT('services.results.abnormal')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[12px] text-slate-400 italic">{commonT('services.status.pending')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Diagnosis & Treatment */}
        <section className="space-y-4">
          <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-slate-900 pl-3">
            {t('sections.diagnosis')}
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">[ICD-10: {record.diagnosisCode || '---'}]</span>
              <h4 className="text-[18px] font-black text-slate-900 uppercase underline decoration-slate-300 underline-offset-8">{record.diagnosisName || t('noDiagnosis')}</h4>
            </div>
            <div className="mt-4">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">{commonT('diagnosis.treatment')}</p>
              <p className="text-[15px] font-bold text-slate-900 leading-relaxed italic">{record.treatmentPlan}</p>
            </div>
            
            {record.followUpDate && (
              <div className="flex items-center gap-2 pt-4 text-[13px] text-slate-900 border-t border-slate-800">
                <span className="font-black text-slate-500 uppercase text-[10px] tracking-[0.1em]">{t('followUpAt')}:</span>
                <span className="font-black">Đã lưu đơn thuốc — lần khám hoàn tất{format(new Date(record.followUpDate), 'dd/MM/yyyy')}</span> 
                {record.followUpNote && <span className="ml-2 underline underline-offset-4 decoration-slate-200">— {record.followUpNote}</span>}
              </div>
            )}
          </div>
        </section>

        {/* Prescription Table */}
        {(prescriptionItems.length > 0 || record.prescription?.notes) && (
          <section className="space-y-4 break-before-auto">
            <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-slate-900 pl-3">
              {t('sections.prescription')}
            </h3>
            
            {prescriptionItems.length > 0 ? (
              <div className="space-y-4">
                {(() => {
                  const serviceMap = new Map<string, string>();
                  record.labOrders?.forEach(o => serviceMap.set(o.id, o.testName));
                  record.visitServiceOrders?.forEach(o => serviceMap.set(o.id, o.service?.name || t('unknownService')));

                  const serviceLinked = prescriptionItems.filter(i => i.labOrderId || i.visitServiceOrderId);
                  const general = prescriptionItems.filter(i => !i.labOrderId && !i.visitServiceOrderId);
                  const groupedMap = new Map<string, typeof prescriptionItems>();
                  
                  serviceLinked.forEach(item => {
                    const sId = (item.labOrderId || item.visitServiceOrderId)!;
                    if (!groupedMap.has(sId)) groupedMap.set(sId, []);
                    groupedMap.get(sId)!.push(item);
                  });

                  return (
                    <>
                      {[...groupedMap.entries()].map(([sId, items]) => (
                        <div key={sId} className="border border-slate-800 rounded-lg overflow-hidden">
                          <div className="bg-slate-100 px-4 py-2 border-b border-slate-800">
                            <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest">
                              [ {serviceMap.get(sId) || t('unknownService')} ]
                            </span>
                          </div>
                          <table className="w-full text-left border-collapse">
                            <tbody>
                              {items.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-200 last:border-0 hover:bg-slate-50/50 transition-colors">
                                  <td className="px-4 py-4 border-r border-slate-200 w-1/3">
                                    <div className="font-black text-slate-900 text-[15px]">{idx + 1}. {item.medicineName}</div>
                                  </td>
                                  <td className="px-4 py-4 text-center font-black text-slate-900 text-[13px] border-r border-slate-200 leading-none">
                                    {item.quantity} {item.unit}
                                  </td>
                                  <td className="px-4 py-4 space-y-1">
                                    <p className="text-[14px] text-slate-900 font-bold">{item.dosage} — {item.frequency}</p>
                                    {item.instructions && <p className="text-[12px] text-slate-500 italic">“{item.instructions}”</p>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}

                      {general.length > 0 && (
                        <div className="border border-slate-800 rounded-lg overflow-hidden">
                          <div className="bg-slate-50 px-4 py-2 border-b border-slate-800">
                            <span className="text-[12px] font-black text-slate-400 font-black uppercase tracking-widest leading-none">
                              {t('generalPrescription') || 'Đơn thuốc chung'}
                            </span>
                          </div>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-white border-b border-slate-300">
                                <th className="px-4 py-3 text-[11px] font-black text-slate-900 uppercase tracking-wider border-r border-slate-300">{t('table.medName')}</th>
                                <th className="px-4 py-3 text-[11px] font-black text-slate-900 uppercase tracking-wider text-center border-r border-slate-300 w-24">{t('table.qty')}</th>
                                <th className="px-4 py-3 text-[11px] font-black text-slate-900 uppercase tracking-wider">{t('table.usage')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {general.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-200 last:border-0 hover:bg-slate-50/50">
                                  <td className="px-4 py-4 border-r border-slate-200">
                                    <div className="font-black text-slate-900 text-[15px]">{idx + 1}. {item.medicineName}</div>
                                  </td>
                                  <td className="px-4 py-4 text-center font-black text-slate-900 text-[13px] border-r border-slate-200 leading-none">
                                    {item.quantity} {item.unit}
                                  </td>
                                  <td className="px-4 py-4 space-y-1">
                                    <p className="text-[14px] text-slate-900 font-bold">{item.dosage} — {item.frequency}</p>
                                    {item.instructions && <p className="text-[12px] text-slate-500 italic">“{item.instructions}”</p>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="text-[14px] text-slate-500 italic pl-4">{t('noMeds')}</p>
            )}

            {record.prescription?.notes && (
              <div className="p-4 border border-slate-200 rounded-lg mt-6 bg-slate-50/20">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{commonT('prescription.notesLabel')}</p>
                <p className="text-[14px] text-slate-800 font-medium italic">{record.prescription.notes}</p>
              </div>
            )}
          </section>
        )}

        {/* Signature Section */}
        <div className="grid grid-cols-2 mt-24 pt-12 items-end">
          <div />
          <div className="text-center space-y-24">
            <div className="space-y-1">
              <p className="text-[14px] text-slate-700 font-black italic">Hà Nội, {format(new Date(), 'dd/MM/yyyy')}</p>
              <div className="flex flex-col items-center">
                 <p className="text-[15px] font-black text-slate-900 uppercase tracking-[0.1em]">{t('doctorSignature')}</p>
                 <div className="w-16 h-px bg-slate-900 mt-2"></div>
              </div>
            </div>
            <div className="space-y-1 translate-y-4">
              <p className="text-[18px] font-black text-slate-900 uppercase leading-none">{doctor?.fullName}</p>
              <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{doctor?.title || 'Bác sĩ chuyên khoa'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
