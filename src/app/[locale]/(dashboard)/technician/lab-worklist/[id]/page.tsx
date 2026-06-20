'use client';

import { use, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { visitServiceOrdersApi } from '@/lib/api/clinical/visit-service-orders';
import { labOrdersApi } from '@/lib/api/clinical/lab-orders';
import { toast } from 'sonner';
import { SpinnerIcon, CheckIcon } from '@phosphor-icons/react';
import { TableLabForm, ImagingForm, EndoscopyForm, FunctionalForm, EchoForm, GeneralForm } from '@/components/technician/forms';
import { WorkbenchHeader } from '@/components/technician/forms/layouts/WorkbenchHeader';
import { WorkbenchSidebar } from '@/components/technician/forms/layouts/WorkbenchSidebar';
import { SpecialistFindings } from '@/lib/types/specialist-findings.types';
import { useLabWorkspaceOrder } from '@/components/technician/hooks/useLabWorkspaceOrder';
import { BaseFormProps } from '@/components/technician/forms';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

const FORM_COMPONENTS: Record<string, React.ComponentType<BaseFormProps>> = {
  BLOOD_LAB: TableLabForm,
  IMAGING: ImagingForm,
  ECHO: EchoForm,
  ULTRASOUND: EchoForm,
  ENDOSCOPY: EndoscopyForm,
  ECG: FunctionalForm,
  SPIROMETRY: FunctionalForm,
};

export default function LabResultWorkspacePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source') || 'lab';

  const { order, siblings, isLoading, labFormType, isVso } = useLabWorkspaceOrder(id, source);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmStart, setShowConfirmStart] = useState(false);
  const t = useTranslations('technicianWorklist');

  const handleSave = async (data: {
    resultText?: string;
    findings?: SpecialistFindings;
    fileUrl?: string;
    isAbnormal: boolean;
    abnormalNote?: string
  }) => {
    setIsSubmitting(true);
    try {
      if (isVso) {
        await visitServiceOrdersApi.completeOrder(id, {
          resultText: data.resultText,
          findings: data.findings,
          resultFileUrl: data.fileUrl,
          isAbnormal: data.isAbnormal,
          abnormalNote: data.abnormalNote,
        });
      } else {
        await labOrdersApi.addResult(id, {
          resultText: data.resultText,
          resultFileUrl: data.fileUrl,
          isAbnormal: data.isAbnormal,
          abnormalNote: data.abnormalNote,
        });
      }

      toast.success(t('messages.saveSuccess'));
      router.push('/technician/lab-worklist');
    } catch (err) {
      void err;
      toast.error(t('messages.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !order) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <SpinnerIcon size={48} className="animate-spin text-blue-500" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('messages.fetchSingleError')}...</p>
        </div>
      </div>
    );
  }

  const isCompleted = order.status === 'COMPLETED';
  const isPaid = order.status === 'PAID';
  const isReadOnly = isCompleted || isPaid;
  const FormComponent = FORM_COMPONENTS[labFormType] || GeneralForm;

  return (
    <div className="min-h-full bg-[#F8FAFC] flex flex-col font-vietnam transition-all duration-500">
      <WorkbenchHeader
        order={order}
        isCompleted={isCompleted}
        onBack={() => router.push('/technician/lab-worklist')}
      />

      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1600px] mx-auto w-full">
        {/* Sidebar */}
        <aside className="lg:col-span-2">
          <WorkbenchSidebar
            order={order}
            allOrders={siblings}
            activeId={id}
            onSelectOrder={(sid: string) => {
              const selectedSource = siblings.find(s => s.id === sid)?._source || source;
              router.push(`/technician/lab-worklist/${sid}?source=${selectedSource}`);
            }}
          />
        </aside>

        {/* Form Area */}
        <section className="lg:col-span-10 relative flex flex-col">
          <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[600px] flex flex-col relative">
            <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-blue-500 rounded-full" />
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">{t('workspace.resultEntry')}</h2>
              </div>
              {isReadOnly && (
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {isCompleted ? t('workspace.status.readOnly') : t('worklist.status.paid')}
                </div>
              )}
            </div>
            <div className="p-8 flex-1">
              <FormComponent
                orderId={id}
                order={order}
                isCompleted={isReadOnly}
                initialResultText={isVso ? (order.result?.resultText || '') : (order.result?.resultText || '')}
                initialFileUrl={order.result?.resultFileUrl || ''}
                initialIsAbnormal={order.result?.isAbnormal || false}
                initialAbnormalNote={order.result?.abnormalNote || ''}
                onSave={handleSave}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Global Action Bar - Sticky within the content area to avoid sidebar overlap */}
      <div className="sticky bottom-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="max-w-[1600px] mx-auto w-full px-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-start-3 lg:col-span-10 flex items-center justify-end gap-3">
            <button
              onClick={() => router.push('/technician/lab-worklist')}
              className="px-8 h-12 rounded-[16px] text-[13px] font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
            >
              {t('workspace.cancel')}
            </button>

            {isPaid && (
              <button
                onClick={() => setShowConfirmStart(true)}
                className="px-10 h-12 bg-[#1392ec] hover:bg-[#1392ec]/90 text-white rounded-[16px] shadow-lg shadow-[#1392ec]/20 font-bold text-[13px] transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              >
                {t('worklist.actions.start')}
              </button>
            )}

            {order.status === 'IN_PROGRESS' && (
              <button
                form="clinical-result-form"
                type="submit"
                disabled={isSubmitting}
                className="px-10 h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-[16px] shadow-lg shadow-emerald-100 font-bold text-[13px] gap-2 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? (
                  <SpinnerIcon size={18} className="animate-spin" />
                ) : (
                  <CheckIcon size={18} weight="bold" />
                )}
                {t('workspace.finishBtn')}
              </button>
            )}

            {isCompleted && (
              <div className="px-10 flex items-center justify-center gap-2 text-[13px] font-bold text-emerald-600 bg-emerald-50 h-12 rounded-[16px] border border-emerald-100">
                <CheckIcon size={20} weight="bold" />
                {t('workspace.status.completed')}
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showConfirmStart} onOpenChange={setShowConfirmStart}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('worklist.confirmStartTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('worklist.confirmStartDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('workspace.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await labOrdersApi.updateOrderStatus(id, 'IN_PROGRESS');
                  toast.success(t('messages.statusUpdated'));
                  window.location.reload();
                } catch (err) {
                  void err;
                  toast.error(t('messages.statusUpdateError'));
                } finally {
                  setShowConfirmStart(false);
                }
              }}
              className="bg-[#1392ec] hover:bg-[#1392ec]/90 text-white"
            >
              {t('worklist.actions.start')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
