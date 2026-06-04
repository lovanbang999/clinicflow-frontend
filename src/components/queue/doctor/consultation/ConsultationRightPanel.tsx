'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import {
  CheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  FlaskIcon,
  StethoscopeIcon,
} from '@phosphor-icons/react';
import { useConsultation, type DraftServiceOrder, type DraftLabOrder } from './ConsultationContext';

export function ConsultationRightPanel({ 
  isSaving, 
  onFinalize, 
  onExitRequest 
}: { 
  isSaving: boolean; 
  onFinalize: () => void; 
  onExitRequest: () => void; 
}) {
  const { 
    item, 
    medicalRecord, 
    draftServices, 
    draftLabs, 
    isPhase2,
    isVitalsLocked
  } = useConsultation();
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const orders = medicalRecord?.visitServiceOrders || [];
  const labs = medicalRecord?.labOrders || [];

  const ordCount = orders.length + draftServices.length;
  const labCount = labs.length + draftLabs.length;
  const totalOrders = ordCount + labCount;

  const dbOrdTotal = orders.reduce((s, o) => s + Number(o.service?.price ?? 0), 0);
  const draftOrdTotal = draftServices.reduce((s, d) => s + Number(d.service.price ?? 0), 0);
  const ordTotal = dbOrdTotal + draftOrdTotal;

  const dbLabTotal = labs.reduce((s, l) => s + Number(l.service?.price ?? 0), 0);
  const draftLabTotal = draftLabs.reduce((s, l) => s + Number(l.service.price ?? 0), 0);
  const labTotal = dbLabTotal + draftLabTotal;
  const expectedTotal = draftOrdTotal + draftLabTotal;

  const hasDrafts = draftServices.length > 0 || draftLabs.length > 0;
  const isFinalized = medicalRecord?.visitStep === 'PRESCRIBED' || medicalRecord?.visitStep === 'COMPLETED';

  const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;
  const completedLabs = labs.filter((l) => l.status === 'COMPLETED').length;
  const allResultsIn = completedOrders === ordCount && completedLabs === labCount && totalOrders > 0;

  return (
    <div className="bg-white border-l border-gray-200 overflow-y-auto p-4 flex flex-col gap-5" style={{ scrollbarWidth: 'thin' }}>
      <WorkflowStatus isPhase2={isPhase2} isFinalized={isFinalized} doctorName={item.booking.doctor?.fullName} />

      <div className="h-[1px] bg-gray-100" />

      <OrderSummary 
        ordCount={ordCount} 
        ordTotal={ordTotal} 
        labCount={labCount} 
        labTotal={labTotal} 
        isPhase2={isPhase2}
        totalOrders={totalOrders}
        completedCount={completedOrders + completedLabs}
        allResultsIn={allResultsIn}
      />

      <div className="h-[1px] bg-gray-100" />

      <ContextNotice 
        isFinalized={isFinalized} 
        isPhase2={isPhase2} 
        isLocked={isVitalsLocked}
        hasOrders={totalOrders > 0} 
        totalOrders={totalOrders} 
      />

      <ActionSection 
        isFinalized={isFinalized}
        isPhase2={isPhase2}
        isLocked={isVitalsLocked}
        hasOrders={totalOrders > 0}
        hasDrafts={hasDrafts}
        isSaving={isSaving}
        onFinalize={onFinalize}
        onExitRequest={onExitRequest}
        onOpenConfirm={() => setIsConfirmOpen(true)}
      />

      <DraftConfirmationDialog 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          onFinalize();
        }}
        draftServices={draftServices}
        draftLabs={draftLabs}
        expectedTotal={expectedTotal}
        isSaving={isSaving}
      />
    </div>
  );
}

function WorkflowStatus({ isPhase2, isFinalized, doctorName }: { isPhase2: boolean; isFinalized: boolean; doctorName?: string }) {
  const t = useTranslations('emr.visit');
  
  return (
    <div>
      <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-3">
        {t('rightPanel.statusTitle')}
      </div>
      <div className="flex flex-col relative">
        <StatusItem 
          label={t('rightPanel.workflow.reception')} 
          desc={t('rightPanel.workflow.receptionDesc')}
          isDone={true}
          isLast={false}
        />
        <StatusItem 
          label={t('rightPanel.workflow.consulting')} 
          desc={`${t('rightPanel.dr') || 'BS.'} ${doctorName}`}
          isDone={isPhase2}
          isActive={!isPhase2}
          isLast={false}
        />
        <StatusItem 
          label={t('rightPanel.workflow.labPayment')} 
          isDone={isPhase2}
          isLast={false}
        />
        <StatusItem 
          label={t('rightPanel.workflow.conclusion')} 
          isDone={isFinalized}
          isLast={true}
        />
      </div>
    </div>
  );
}

function StatusItem({ label, desc, isDone, isActive, isLast }: { label: string; desc?: string; isDone: boolean; isActive?: boolean; isLast: boolean }) {
  return (
    <div className={`flex gap-2.5 relative z-10 ${isLast ? 'pt-2' : 'pb-2 pt-2'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isDone ? 'bg-green-50 text-green-600 border border-[#C0DD97]' : isActive ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-slate-300 border border-slate-200'}`}>
        {isDone ? <CheckIcon size={12} weight="bold" /> : isActive ? <div className="w-2 h-2 rounded-full bg-blue-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
      </div>
      <div>
        <div className={`text-[12px] font-medium ${isDone ? 'text-slate-800' : isActive ? 'text-blue-700' : 'text-slate-500'}`}>
          {label}
        </div>
        {desc && <div className={`text-[11px] ${isActive ? 'text-blue-500' : 'text-slate-500'}`}>{desc}</div>}
      </div>
      {!isLast && <div className="absolute left-[9.5px] top-[22px] w-[1px] h-4 bg-gray-200" />}
    </div>
  );
}

interface OrderSummaryProps {
  ordCount: number;
  ordTotal: number;
  labCount: number;
  labTotal: number;
  isPhase2: boolean;
  totalOrders: number;
  completedCount: number;
  allResultsIn: boolean;
}

function OrderSummary({ ordCount, ordTotal, labCount, labTotal, isPhase2, totalOrders, completedCount, allResultsIn }: OrderSummaryProps) {
  const t = useTranslations('emr.visit');
  return (
    <div>
      <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-3">
        {t('rightPanel.summaryTitle')}
      </div>
      <div className="flex flex-col gap-1.5 mb-2">
        <SummaryItem icon={<StethoscopeIcon size={11} className="text-blue-500" />} label={t('rightPanel.services')} count={ordCount} total={ordTotal} />
        <SummaryItem icon={<FlaskIcon size={11} className="text-amber-500" />} label={t('rightPanel.labs')} count={labCount} total={labTotal} />
      </div>

      {isPhase2 && totalOrders > 0 && (
        <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 rounded-md p-2 border border-slate-100">
          <div className="flex justify-between">
            <span>{t('rightPanel.vsoStatus')}</span>
            <span className={`font-medium ${allResultsIn ? 'text-green-600' : 'text-amber-600'}`}>
              {completedCount}/{totalOrders}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface SummaryItemProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  total: number;
}

function SummaryItem({ icon, label, count, total }: SummaryItemProps) {
  return (
    <div className="flex justify-between items-center text-[12px]">
      <span className="text-slate-500 flex items-center gap-1">
        {icon}
        {label} ({count})
      </span>
      <span className="font-medium text-slate-800">
        {total > 0 ? `${total.toLocaleString('vi-VN')} đ` : '—'}
      </span>
    </div>
  );
}

interface ContextNoticeProps {
  isFinalized: boolean;
  isPhase2: boolean;
  isLocked: boolean;
  hasOrders: boolean;
  totalOrders: number;
}

function ContextNotice({ isFinalized, isPhase2, isLocked, hasOrders, totalOrders }: ContextNoticeProps) {
  const t = useTranslations('emr.visit');
  if (isFinalized) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-[12px] text-green-700">
        <div className="font-bold mb-1 flex items-center gap-1">
          <CheckCircleIcon size={13} />
          {t('rightPanel.finalizedTitle')}
        </div>
        {t('rightPanel.finalizedDesc')}
      </div>
    );
  }
  if (isPhase2) {
    return (
      <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 text-[12px] text-teal-700">
        <div className="font-bold mb-1">{t('rightPanel.readyB7')}</div>
        {t('rightPanel.readyB7Desc')}
      </div>
    );
  }
  if (isLocked) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[12px] text-amber-700 shadow-sm">
        <div className="font-bold mb-1 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
          <ClockIcon size={14} className="animate-pulse" />
          {t('rightPanel.waitingResultsTitle')}
        </div>
        <div className="text-[11px] opacity-90 leading-relaxed">
          {t('rightPanel.waitingResultsDesc')}
        </div>
      </div>
    );
  }
  if (hasOrders) {
    return (
      <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 text-[12px] text-teal-700">
        <div className="font-bold mb-1">{t('rightPanel.readyB3')}</div>
        <div className="flex items-center gap-1.5 mt-1">
          <ClockIcon size={11} />
          <span>{t('rightPanel.readyB3Desc', { count: totalOrders })}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-[12px] text-amber-700">
      <div className="font-bold mb-1">{t('rightPanel.noticeTitle')}</div>
      {t('rightPanel.noticeDesc')}
    </div>
  );
}

interface ActionSectionProps {
  isFinalized: boolean;
  isPhase2: boolean;
  isLocked: boolean;
  hasOrders: boolean;
  hasDrafts: boolean;
  isSaving: boolean;
  onFinalize: () => void;
  onExitRequest: () => void;
  onOpenConfirm: () => void;
}

function ActionSection({ 
  isFinalized, 
  isPhase2, 
  isLocked, 
  hasOrders, 
  hasDrafts, 
  isSaving, 
  onFinalize, 
  onExitRequest, 
  onOpenConfirm 
}: ActionSectionProps) {
  const t = useTranslations('emr.visit');
  
  if (isFinalized) {
    return (
      <div className="flex flex-col gap-2 mt-auto pb-2">
        <Button onClick={onFinalize} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium h-[44px]">
          <CheckCircleIcon size={18} className="mr-2" />
          {t('rightPanel.btnFinish')}
        </Button>
      </div>
    );
  }

  if (isPhase2) {
    return (
      <div className="text-center text-[11px] text-slate-400 italic px-2 mt-auto pb-2">
        {t('rightPanel.useTabPrefix')} <span className="font-medium text-slate-600">{t('tabLabels.prescription')}</span> {t('rightPanel.useTabSuffix')}
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="flex flex-col gap-2 mt-auto pb-2 animate-in slide-in-from-bottom-2 duration-300">
         <Button
          variant="outline"
          onClick={onExitRequest}
          className="w-full h-[44px] text-[13px] text-slate-600 border-slate-200 hover:bg-slate-50 font-medium"
        >
          <ArrowRightIcon size={16} className="mr-2" />
          {t('rightPanel.btnExit', { defaultMessage: 'Thoát phiên khám' })}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-auto pb-2">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-[11px] text-blue-700 text-center">
        <ArrowRightIcon size={11} className="inline mr-1" />
        {hasOrders ? t('rightPanel.guideToReception') : hasDrafts ? t('rightPanel.guideSaveDraft') : t('rightPanel.noticeDesc')}
      </div>
      <Button
        variant={hasDrafts ? "default" : "outline"}
        onClick={() => hasDrafts ? onOpenConfirm() : onExitRequest()}
        disabled={isSaving}
        className={`w-full h-[38px] text-[12px] ${hasDrafts ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' : 'text-slate-600 border-slate-200'}`}
      >
        {isSaving ? t('messages.saving') : hasDrafts ? t('rightPanel.btnSaveAndFinish') : t('rightPanel.btnBackToList')}
      </Button>
    </div>
  );
}

interface DraftConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  draftServices: DraftServiceOrder[];
  draftLabs: DraftLabOrder[];
  expectedTotal: number;
  isSaving: boolean;
}

function DraftConfirmationDialog({ isOpen, onClose, onConfirm, draftServices, draftLabs, expectedTotal, isSaving }: DraftConfirmationDialogProps) {
  const t = useTranslations('emr.visit');
  const tl = useTranslations('emr.lab');
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('rightPanel.confirmDialog.title')}</DialogTitle>
          <DialogDescription>{t('rightPanel.confirmDialog.desc')}</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {draftServices.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[13px] font-semibold text-slate-800 mb-1.5 flex justify-between">
                <span>{t('leftPanel.specialistOrders')} ({draftServices.length})</span>
              </h4>
              <ul className="text-[12px] space-y-1.5 text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                {draftServices.map((d, i) => (
                  <li key={`${d.service.id}-${i}`} className="flex flex-col gap-0.5">
                    <div className="flex justify-between gap-4">
                      <span className="truncate flex-1 text-slate-700">· {d.service.name}</span>
                      <span className="font-medium">{(d.service.price ?? 0).toLocaleString('vi-VN')} đ</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {draftLabs.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[13px] font-semibold text-slate-800 mb-1.5 flex justify-between">
                <span>{tl('listTitleShort')} ({draftLabs.length})</span>
              </h4>
              <ul className="text-[12px] space-y-1.5 text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                {draftLabs.map((s, i) => (
                  <li key={`${s.service.id}-${i}`} className="flex justify-between gap-4">
                    <span className="truncate flex-1 text-slate-700">· {s.service.name}</span>
                    <span className="font-medium">{(s.service.price ?? 0).toLocaleString('vi-VN')} đ</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 flex justify-between items-center bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            <span className="font-bold text-[13px] text-slate-700">{t('rightPanel.confirmDialog.totalExpected')}</span>
            <span className="font-bold text-[16px] text-blue-700">
              {expectedTotal.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>
        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={onClose} className="h-[38px] text-[13px]">
            {t('rightPanel.confirmDialog.btnCancel')}
          </Button>
          <Button onClick={onConfirm} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white h-[38px] text-[13px]">
            {isSaving ? t('messages.saving') : t('rightPanel.confirmDialog.btnConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
