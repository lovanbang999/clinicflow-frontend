'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  CloudArrowUpIcon, 
  CircleNotchIcon,
  FloppyDiskIcon
} from '@phosphor-icons/react';

interface LabResultFormProps {
  isUploading: boolean;
  isSubmitting: boolean;
  onSubmit: (resultText: string, file: File | null) => Promise<void>;
  onCancel: () => void;
}

export function LabResultForm({ 
  isUploading, 
  isSubmitting, 
  onSubmit, 
  onCancel 
}: LabResultFormProps) {
  const t = useTranslations('technicianWorklist.result');
  const [resultText, setResultText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const isPending = isUploading || isSubmitting;
  const isDisabled = isPending || (!resultText.trim() && !file);

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
      <h3 className="font-semibold text-slate-800 mb-4">{t('form.resultText')}</h3>
      
      <Textarea
        className="min-h-[300px] resize-y mb-6 font-medium text-slate-900 border-[#e5e7eb] focus-visible:ring-1 focus-visible:ring-[#1392ec]"
        placeholder={t('form.resultTextPlaceholder')}
        value={resultText}
        onChange={(e) => setResultText(e.target.value)}
      />

      <div className="mb-8">
        <h3 className="font-semibold text-slate-800 mb-2">{t('form.attachment')}</h3>
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors group">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center justify-center gap-2"
          >
            <CloudArrowUpIcon size={32} weight="regular" className="text-slate-400 group-hover:text-[#1392ec] transition-colors" />
            <span className="text-sm font-medium text-[#1392ec]">
              {file ? file.name : t('form.clickToUpload')}
            </span>
            <span className="text-xs text-slate-500">
              {t('form.attachmentHint')}
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="cursor-pointer border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          {t('form.cancel')}
        </Button>
        <Button 
          onClick={() => onSubmit(resultText, file)} 
          disabled={isDisabled}
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] cursor-pointer"
        >
          {isPending ? (
            <><CircleNotchIcon size={18} weight="bold" className="mr-2 animate-spin" /> {t('form.saving')}</>
          ) : (
            <>
              <FloppyDiskIcon size={18} weight="bold" className="mr-2" />
              {t('form.save')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
