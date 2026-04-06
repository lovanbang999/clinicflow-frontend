'use client';

import { useTranslations } from 'next-intl';
import { type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { format } from 'date-fns';
import Image from 'next/image';

interface SummaryDashboardProps {
  record: VisitResultsResponse;
}

export function SummaryDashboard({ record }: SummaryDashboardProps) {
  const t = useTranslations('emr.visit.summary');
  const commonT = useTranslations('emr.visit');

  const labOrders = record.labOrders ?? [];
  const prescriptionItems = record.prescription?.items ?? [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Web UI Header */}
      <div className="p-6 border-b border-gray-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-indigo-100 border border-indigo-50 relative overflow-hidden p-1.5">
            <Image src="/logo.svg" alt="SmartClinic" fill className="object-contain p-1.5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{t('header')}</h2>
            <p className="text-[13px] text-slate-500">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-10">
        {/* Section 1: Vitals & Symptoms */}
        <section className="space-y-4">
          <h3 className="text-[14px] font-bold text-indigo-600 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
            {t('sections.symptoms')}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="space-y-1">
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">{commonT('symptoms.bp')}</p>
              <p className="text-[15px] font-semibold text-slate-700">{record.bloodPressure || '--/--'} <span className="text-[12px] font-normal text-slate-400">mmHg</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">{commonT('symptoms.heartRate')}</p>
              <p className="text-[15px] font-semibold text-slate-700">{record.heartRate || '--'} <span className="text-[12px] font-normal text-slate-400">bpm</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">{commonT('symptoms.temperature')}</p>
              <p className="text-[15px] font-semibold text-slate-700">{record.temperature ? Number(record.temperature).toFixed(1) : '--'} <span className="text-[12px] font-normal text-slate-400">°C</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">{commonT('symptoms.spO2')}</p>
              <p className="text-[15px] font-semibold text-slate-700">{record.spO2 || '--'} <span className="text-[12px] font-normal text-slate-400">%</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1.5">
              <h4 className="text-[13px] font-bold text-slate-700">{commonT('symptoms.chiefComplaint')}</h4>
              <p className="text-[13.5px] text-slate-600 leading-relaxed bg-white border border-slate-100 p-3 rounded-lg min-h-[3.5rem] italic">
                {record.chiefComplaint || t('empty')}
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-[13px] font-bold text-slate-700">{commonT('symptoms.clinicalFindings')}</h4>
              <p className="text-[13.5px] text-slate-600 leading-relaxed bg-white border border-slate-100 p-3 rounded-lg min-h-[3.5rem] italic">
                {record.clinicalFindings || t('empty')}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Lab Results */}
        {labOrders.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-[14px] font-bold text-indigo-600 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
              {t('sections.labResults')}
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-[12px] font-bold text-slate-600 uppercase tracking-wider w-1/3">{t('table.testName')}</th>
                    <th className="px-4 py-3 text-[12px] font-bold text-slate-600 uppercase tracking-wider">{t('table.result')}</th>
                    <th className="px-4 py-3 text-[12px] font-bold text-slate-600 uppercase tracking-wider text-center">{t('table.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {labOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 text-[13.5px] font-semibold text-slate-700">{order.testName}</td>
                      <td className="px-4 py-4">
                        {order.result ? (
                          <div className="space-y-1">
                            <p className="text-[13px] text-slate-600 leading-relaxed">{order.result.resultText}</p>
                            {order.result.isAbnormal && (
                              <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                                ⚠️ {order.result.abnormalNote || commonT('services.results.abnormal')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[12px] text-slate-400 italic">{commonT('services.status.pending')}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {order.status === 'COMPLETED' ? t('completed') : t('pending')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section 3: Diagnosis & Treatment */}
        <section className="space-y-4">
          <h3 className="text-[14px] font-bold text-indigo-600 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
            {t('sections.diagnosis')}
          </h3>
          <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[13px] font-mono font-bold shadow-sm shadow-indigo-100 shrink-0">
                {record.diagnosisCode || '---'}
              </div>
              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-slate-800">{record.diagnosisName || t('noDiagnosis')}</h4>
                <p className="text-[13.5px] text-slate-600 leading-relaxed">{record.treatmentPlan}</p>
              </div>
            </div>
            
            {record.followUpDate && (
              <div className="flex items-center gap-2 pt-2 text-[12.5px] text-slate-500 border-t border-indigo-100/30">
                <span className="font-bold text-indigo-600">📅 {t('followUpAt')}:</span>
                <span>{format(new Date(record.followUpDate), 'dd/MM/yyyy')}</span>
                {record.followUpNote && <span className="ml-2">— {record.followUpNote}</span>}
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Prescription */}
        {(prescriptionItems.length > 0 || record.prescription?.notes) && (
          <section className="space-y-4">
            <h3 className="text-[14px] font-bold text-indigo-600 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
              {t('sections.prescription')}
            </h3>

            {prescriptionItems.length > 0 ? (
              <div className="space-y-6">
                {/* 4.1. Grouped by Service */}
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
                      {[...groupedMap.entries()].map(([sId, items], gIdx) => (
                        <div key={sId} className="border border-indigo-100 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${gIdx * 100}ms` }}>
                          <div className="bg-indigo-50/50 px-4 py-2 border-b border-indigo-100 flex items-center justify-between">
                            <span className="text-[12px] font-bold text-indigo-700 uppercase tracking-wide">
                              📦 {serviceMap.get(sId) || t('unknownService')}
                            </span>
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-indigo-400 font-bold border border-indigo-50">
                              {items.length} {t('table.qty')}
                            </span>
                          </div>
                          <table className="w-full text-left border-collapse">
                            <tbody>
                              {items.map((item, idx) => (
                                <tr key={idx} className="border-b border-indigo-50 last:border-0 hover:bg-indigo-50/20 transition-colors">
                                  <td className="px-4 py-3 text-[13.5px] font-bold text-slate-700 w-1/3">
                                    {idx + 1}. {item.medicineName}
                                  </td>
                                  <td className="px-4 py-3 text-[13px] font-semibold text-slate-500 text-center w-24">
                                    {item.quantity} {item.unit}
                                  </td>
                                  <td className="px-4 py-3 space-y-0.5">
                                    <p className="text-[13px] text-slate-600 font-medium">{item.dosage} — {item.frequency}</p>
                                    {item.instructions && <p className="text-[11px] text-slate-400 italic leading-tight">{item.instructions}</p>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}

                      {/* 4.2. General Prescription */}
                      {general.length > 0 && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                            <span className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">
                              💊 {t('generalPrescription') || 'Đơn thuốc chung'}
                            </span>
                          </div>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-white border-b border-slate-100">
                                <th className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('table.medName')}</th>
                                <th className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-24">{t('table.qty')}</th>
                                <th className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('table.usage')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {general.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                  <td className="px-4 py-3.5 text-[13.5px] font-bold text-slate-700">
                                    {idx + 1}. {item.medicineName}
                                  </td>
                                  <td className="px-4 py-3.5 text-center font-bold text-slate-600 text-[13px]">
                                    {item.quantity} {item.unit}
                                  </td>
                                  <td className="px-4 py-3.5 space-y-1">
                                    <p className="text-[13px] text-slate-600 font-medium">{item.dosage} — {item.frequency}</p>
                                    {item.instructions && <p className="text-[11.5px] text-slate-400 italic">“{item.instructions}”</p>}
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
              <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-[14px] text-slate-400 font-medium italic">{t('noMeds')}</p>
              </div>
            )}

            {record.prescription?.notes && (
              <div className="p-4 bg-indigo-50/20 border border-indigo-100/30 rounded-xl">
                <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1">📝 {commonT('prescription.notesLabel')}</p>
                <p className="text-[13px] text-slate-600 leading-relaxed italic">{record.prescription.notes}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
