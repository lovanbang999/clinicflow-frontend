'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { UploadLabResultDto, type LabOrder } from '@/lib/api/lab-orders';
import { useLabOrderActions } from '@/lib/hooks/useLabOrders';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { SpinnerIcon, CheckCircleIcon, UploadSimpleIcon } from '@phosphor-icons/react';

interface LabResultModalProps {
  isOpen: boolean;
  order: LabOrder;
  onClose: () => void;
  onSuccess: () => void;
}

export function LabResultModal({ isOpen, order, onClose, onSuccess }: LabResultModalProps) {
  const t = useTranslations('receptionistLabs.modal');
  const [resultText, setResultText] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [abnormalNote, setAbnormalNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { uploadFile: doUploadFile, submitResult, isUploading, isSubmitting } = useLabOrderActions();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    let fileUrl: string | undefined = undefined;
    
    if (selectedFile) {
      const url = await doUploadFile(selectedFile);
      if (!url) {
        toast.error(t('uploadError'));
        return; // failed upload
      }
      fileUrl = url;
    }

    const payload: UploadLabResultDto = {
      resultText: resultText.trim() === '' ? undefined : resultText,
      resultFileUrl: fileUrl,
      isAbnormal,
      abnormalNote: isAbnormal && abnormalNote.trim() !== '' ? abnormalNote : undefined,
    };

    try {
      await submitResult(order.id, payload);
      toast.success(t('success'));
      onSuccess();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || t('saveError'));
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting && !isUploading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white p-6">
        <DialogHeader>
          <DialogTitle className="text-xl pr-8">{t('title')}</DialogTitle>
          <DialogDescription className="text-gray-500 pt-2 border-b border-gray-100 pb-4">
            {t('patientInfo')} <strong className="text-gray-900">{order.patientProfile?.fullName}</strong> - {t('testInfo')} <strong className="text-gray-900">{order.testName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('fileAttachmentLabel')}</label>
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  accept=".pdf,image/*" 
                  onChange={handleFileChange}
                  className="cursor-pointer outline-none text-sm text-gray-500 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1"><UploadSimpleIcon/> {t('fileSizeHint')}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('textResultLabel')}</label>
              <Textarea 
                placeholder={t('textResultPlaceholder')} 
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                className="h-24 shadow-sm"
              />
            </div>
          </div>

          <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox 
                checked={isAbnormal}
                onCheckedChange={(c) => setIsAbnormal(c === true)}
                className="w-5 h-5 rounded-[4px] border-orange-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 text-white shadow-sm cursor-pointer"
              />
              <span className="font-bold text-orange-900 text-[15px] cursor-pointer">{t('abnormalFlag')}</span>
            </label>

            {isAbnormal && (
              <div className="pl-8">
                <label className="block text-xs font-semibold text-orange-800 mb-1.5">{t('abnormalNoteLabel')}</label>
                <Input 
                  value={abnormalNote}
                  onChange={(e) => setAbnormalNote(e.target.value)}
                  placeholder={t('abnormalNotePlaceholder')} 
                  className="border-orange-200 bg-white placeholder:text-orange-300 shadow-sm"
                />
              </div>
            )}
          </div>

        </div>

        <DialogFooter className="pt-4 border-t border-gray-100 sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || isUploading} className="cursor-pointer">{t('cancel')}</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isUploading || (!selectedFile && !resultText && !isAbnormal)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-sm cursor-pointer"
          >
            {isSubmitting || isUploading ? <SpinnerIcon className="animate-spin mr-2" /> : <CheckCircleIcon size={18} weight="bold" className="mr-2" />}
            {isUploading ? t('uploading') : isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
