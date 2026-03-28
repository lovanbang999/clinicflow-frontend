'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { useLabOrder, useLabOrderActions } from '@/lib/hooks/useLabOrders';
import type { LabOrder } from '@/lib/api/lab-orders';
import { toast } from 'sonner';
import { 
  ArrowLeftIcon,
  UploadSimpleIcon,
  WarningCircleIcon,
  SpinnerIcon,
  FileTextIcon,
  CheckCircleIcon
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function LabResultWorkspacePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { order, isLoading } = useLabOrder(resolvedParams.id);

  if (isLoading || !order) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f0f3f4]">
        <SpinnerIcon size={40} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <LabResultForm 
      key={order.id} 
      order={order} 
      locale={resolvedParams.locale} 
    />
  );
}

function LabResultForm({ order, locale }: { order: LabOrder; locale: string }) {
  const router = useRouter();
  const t = useTranslations('dashboard.technician.workspace');
  const { submitResult, uploadFile, isSubmitting, isUploading } = useLabOrderActions();

  // Initialize state directly from order (no useEffect needed thanks to key={order.id})
  const [resultText, setResultText] = useState(order.result?.resultText || '');
  const [fileUrl, setFileUrl] = useState(order.result?.resultFileUrl || '');
  const [isAbnormal, setIsAbnormal] = useState(order.result?.isAbnormal || false);
  const [abnormalNote, setAbnormalNote] = useState(order.result?.abnormalNote || '');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) {
      setFileUrl(url);
      toast.success(t('fileUploadSuccess'));
    } else {
      toast.error(t('fileUploadError'));
    }
  };

  const handleSaveResult = async () => {
    try {
      await submitResult(order.id, {
        resultText,
        resultFileUrl: fileUrl,
        isAbnormal,
        abnormalNote: isAbnormal ? abnormalNote : undefined,
      });
      toast.success(t('success'));
      router.push(`/${locale}/technician/lab-worklist`);
    } catch (error) {
      console.error('Error saving lab result:', error);
      toast.error(t('saveError'));
    }
  };

  const p = order.patientProfile;
  const b = order.booking;

  const calculateAge = (dob?: string) => {
    if (!dob) return 'N/A';
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  const genderLabels: Record<string, string> = {
    MALE: t('gender.male'),
    FEMALE: t('gender.female'),
    OTHER: t('gender.other'),
  };

  return (
    <div className="min-h-full bg-[#f0f3f4] pb-10">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e7eb] px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-slate-100 cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeftIcon size={20} className="text-slate-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#111518]">{t('title')}</h1>
            <p className="text-sm text-[#64748b] flex items-center gap-2 mt-0.5">
              <span>{order.testName}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{format(new Date(order.orderedAt), 'dd/MM/yyyy HH:mm')}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="rounded-xl border-slate-200 cursor-pointer"
          >
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleSaveResult} 
            disabled={isSubmitting || isUploading}
            className="rounded-xl bg-[#1392ec] hover:bg-[#107ac7] text-white gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <SpinnerIcon size={18} className="animate-spin" />
            ) : (
              <CheckCircleIcon size={18} weight="bold" />
            )}
            {t('submit')}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Context Information */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileTextIcon className="text-[#1392ec]" size={20} />
                {t('patientInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">{t('patient')}</p>
                <div className="font-bold text-slate-900 text-lg">{p?.fullName || 'N/A'}</div>
                <div className="text-sm font-medium text-slate-600 bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">{p?.patientCode}</div>
              </div>
              <hr className="border-slate-100" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{t('age')}</p>
                  <div className="font-medium text-slate-900">{calculateAge(p?.dateOfBirth)}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">{t('gender.label')}</p>
                  <div className="font-medium text-slate-900">{p?.gender ? (genderLabels[p.gender] || p.gender) : 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileTextIcon className="text-emerald-600" size={20} />
                {t('orderInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">{t('doctor')}</p>
                <div className="font-medium text-slate-900">BS. {b?.doctor?.fullName}</div>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">{t('doctorNotes')}</p>
                <div className="bg-amber-50 text-amber-900 border border-amber-100 p-3 rounded-lg text-sm italic shadow-sm">
                  {order.testDescription || t('noNotes')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Result Entry Form */}
        <div className="lg:col-span-8">
          <Card className="rounded-2xl border-slate-200 shadow-sm h-full bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileTextIcon className="text-[#111518]" size={24} />
                {t('resultEntry')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Text Result */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  {t('textResult')}
                </label>
                <textarea
                  className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:border-[#1392ec] focus:ring-2 focus:ring-[#1392ec]/20 outline-none transition-all resize-none shadow-sm text-slate-900"
                  placeholder={t('textPlaceholder')}
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  {t('uploadFile')}
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl cursor-pointer transition-colors text-slate-700 font-medium">
                    {isUploading ? <SpinnerIcon size={18} className="animate-spin" /> : <UploadSimpleIcon size={18} />}
                    {t('uploadBtn')}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                  {fileUrl && (
                    <a href={fileUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline px-3 py-2 bg-blue-50 rounded-lg">
                      {t('fileAttached')}
                    </a>
                  )}
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Abnormal Flag Section */}
              <div className={`p-5 rounded-xl space-y-4 border transition-colors ${isAbnormal ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <WarningCircleIcon size={24} weight="fill" className={isAbnormal ? "text-red-500" : "text-slate-400"} />
                    <div>
                      <p className={`font-semibold ${isAbnormal ? 'text-red-900' : 'text-slate-700'}`}>{t('abnormalFlag')}</p>
                      <p className={`text-sm mt-0.5 ${isAbnormal ? 'text-red-700' : 'text-slate-500'}`}>{t('abnormalHint')}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={isAbnormal}
                      onChange={(e) => setIsAbnormal(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-red-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
                
                {isAbnormal && (
                  <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="block text-sm font-semibold text-red-900 mb-2">
                      {t('abnormalNote')}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl border border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all shadow-sm text-red-900 placeholder:text-red-300 bg-white"
                      placeholder={t('abnormalNotePlaceholder')}
                      value={abnormalNote}
                      onChange={(e) => setAbnormalNote(e.target.value)}
                    />
                  </div>
                )}
              </div>
              
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
