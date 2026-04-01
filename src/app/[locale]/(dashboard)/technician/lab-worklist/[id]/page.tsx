'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { labOrdersApi, type LabOrder } from '@/lib/api/lab-orders';
import { useApiData } from '@/lib/hooks/useApiData';
import { useLabOrderActions } from '@/lib/hooks/useLabOrders';
import { toast } from 'sonner';
import {
  ArrowLeftIcon,
  UploadSimpleIcon,
  WarningCircleIcon,
  SpinnerIcon,
  FileTextIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function LabResultWorkspacePage({ params }: PageProps) {
  const { id, locale } = use(params);
  const { data: order, isLoading } = useApiData(() => labOrdersApi.getOrderById(id), null);

  if (isLoading || !order) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f0f3f4]">
        <SpinnerIcon size={40} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return <LabResultForm key={order.id} orderId={order.id} order={order} locale={locale} />;
}

// Form component
function LabResultForm({
  orderId,
  order,
  locale,
}: {
  orderId: string;
  order: LabOrder;
  locale: string;
}) {
  const router = useRouter();
  const [resultText, setResultText] = useState<string>(order.result?.resultText ?? '');
  const [fileUrl, setFileUrl] = useState<string>(order.result?.resultFileUrl ?? '');
  const [isAbnormal, setIsAbnormal] = useState<boolean>(order.result?.isAbnormal ?? false);
  const [abnormalNote, setAbnormalNote] = useState<string>(order.result?.abnormalNote ?? '');

  const { uploadFile, submitResult, updateStatus, isUploading, isSubmitting } = useLabOrderActions();

  const isCompleted = order.status === 'COMPLETED';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = await uploadFile(file);
    if (url) {
      setFileUrl(url);
      toast.success('File đã được tải lên');
    }
  };

  const handleSave = async () => {
    const success = await submitResult(orderId, {
      resultText: resultText.trim() || undefined,
      resultFileUrl: fileUrl || undefined,
      isAbnormal,
      abnormalNote: isAbnormal ? abnormalNote : undefined,
    });
    
    if (success) {
      // Must also mark it completed depending on workflow, or submitResult already does it?
      // Assume we update status to COMPLETED as well or it's handled by backend. We'll explicit update status just in case.
      await updateStatus(orderId, 'COMPLETED');
      toast.success('Đã hoàn tất kết quả — bác sĩ sẽ được thông báo');
      router.push(`/${locale}/technician/lab-worklist`);
    }
  };

  const p = order.patientProfile;
  const b = order.booking;

  const calcAge = (dob?: string) =>
    dob ? new Date().getFullYear() - new Date(dob).getFullYear() : 'N/A';

  return (
    <div className="min-h-full bg-[#f0f3f4] pb-10">
      {/* Sticky header */}
      <div className="bg-white border-b border-[#e5e7eb] px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100" onClick={() => router.back()}>
            <ArrowLeftIcon size={20} className="text-slate-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#111518]">Nhập kết quả dịch vụ</h1>
            <p className="text-sm text-[#64748b] mt-0.5">
              {order.testName} · {order.orderedAt && format(new Date(order.orderedAt), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()} className="rounded-xl">
            Huỷ
          </Button>
          {!isCompleted && (
            <Button
              onClick={handleSave}
              disabled={isSubmitting || isUploading || (!resultText.trim() && !fileUrl)}
              className="rounded-xl bg-[#1392ec] hover:bg-[#107ac7] text-white gap-2"
            >
              {isSubmitting ? <SpinnerIcon size={18} className="animate-spin" /> : <CheckCircleIcon size={18} weight="bold" />}
              Hoàn tất kết quả
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Patient info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileTextIcon className="text-[#1392ec]" size={20} />
                Thông tin bệnh nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Họ tên</p>
                <div className="font-bold text-slate-900 text-lg">{p?.fullName ?? 'N/A'}</div>
                {p?.patientCode && (
                  <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">{p.patientCode}</span>
                )}
              </div>
              <hr className="border-slate-100" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Tuổi</p>
                  <div className="font-medium text-slate-900">{calcAge(p?.dateOfBirth)}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Giới tính</p>
                  <div className="font-medium text-slate-900">
                    {p?.gender === 'MALE' ? 'Nam' : p?.gender === 'FEMALE' ? 'Nữ' : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileTextIcon className="text-emerald-600" size={20} />
                Thông tin chỉ định
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-slate-500 mb-1">Dịch vụ</p>
                <div className="font-semibold text-slate-900">{order.testName}</div>
              </div>
              {b?.doctor && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Bác sĩ chỉ định</p>
                  <div className="font-medium text-slate-900">BS. {b.doctor.fullName}</div>
                </div>
              )}
              {isCompleted && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-700 text-sm font-semibold flex items-center gap-2">
                  <CheckCircleIcon size={16} weight="fill" /> Đã hoàn thành
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Result entry */}
        <div className="lg:col-span-8">
          <Card className="rounded-2xl border-slate-200 shadow-sm h-full">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-800">Nhập kết quả</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Text Result */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Kết quả văn bản</label>
                <textarea
                  readOnly={isCompleted}
                  className="w-full h-56 p-4 rounded-xl border border-slate-200 focus:border-[#1392ec] focus:ring-2 focus:ring-[#1392ec]/20 outline-none transition-all resize-none text-slate-900 disabled:bg-slate-50"
                  placeholder="Mô tả kết quả xét nghiệm / thực hiện dịch vụ..."
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Đính kèm file kết quả</label>
                <div className="flex items-center gap-4">
                  {!isCompleted && (
                    <label className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl cursor-pointer transition-colors text-slate-700 font-medium">
                      {isUploading ? <SpinnerIcon size={18} className="animate-spin" /> : <UploadSimpleIcon size={18} />}
                      Tải file lên
                      <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                  )}
                  {fileUrl && (
                    <a href={fileUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline px-3 py-2 bg-blue-50 rounded-lg">
                      📎 Xem file kết quả
                    </a>
                  )}
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Abnormal flag */}
              <div className={`p-5 rounded-xl space-y-4 border transition-colors ${isAbnormal ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <WarningCircleIcon size={24} weight="fill" className={isAbnormal ? 'text-red-500' : 'text-slate-400'} />
                    <div>
                      <p className={`font-semibold ${isAbnormal ? 'text-red-900' : 'text-slate-700'}`}>Kết quả bất thường</p>
                      <p className={`text-sm mt-0.5 ${isAbnormal ? 'text-red-700' : 'text-slate-500'}`}>
                        Đánh dấu nếu kết quả có giá trị nằm ngoài khoảng bình thường
                      </p>
                    </div>
                  </div>
                  {!isCompleted && (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={isAbnormal} onChange={(e) => setIsAbnormal(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-red-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                    </label>
                  )}
                </div>
                {isAbnormal && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-semibold text-red-900 mb-2">Mô tả bất thường</label>
                    <input
                      type="text"
                      readOnly={isCompleted}
                      className="w-full px-4 py-2.5 rounded-xl border border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none text-red-900 placeholder:text-red-300 bg-white"
                      placeholder="VD: Glucose 12.5 mmol/L (bình thường < 6.1)..."
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
