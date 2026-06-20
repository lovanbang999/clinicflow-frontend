import { useState } from 'react';
import { useForm, DefaultValues } from 'react-hook-form';
import { useLabOrderActions } from '@/lib/hooks/clinical/useLabOrders';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface UseResultFormProps<T extends object> {
  initialData: T;
  initialFileUrl?: string;
  initialIsAbnormal?: boolean;
  initialAbnormalNote?: string;
  onSave: (data: { 
    resultText: string; 
    isAbnormal: boolean; 
    abnormalNote?: string; 
    fileUrl?: string 
  }) => Promise<void>;
}

export function useResultForm<T extends { abnormalNote?: string }>({
  initialData,
  initialFileUrl = '',
  initialIsAbnormal = false,
  onSave,
}: UseResultFormProps<T>) {
  const t = useTranslations('technicianWorklist.messages');
  const { uploadFile, isUploading } = useLabOrderActions();
  
  const [fileUrl, setFileUrl] = useState(initialFileUrl);
  const [isAbnormal, setIsAbnormal] = useState(initialIsAbnormal);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    defaultValues: initialData as DefaultValues<T>,
  });

  const handleFileUpload = async (file: File) => {
    try {
      const url = await uploadFile(file);
      if (url) {
        setFileUrl((prev) => {
          const urls = prev ? prev.split(',').filter(Boolean) : [];
          urls.push(url);
          return urls.join(',');
        });
        toast.success(t('fileUploaded'));
        return url;
      }
    } catch {
      // Note: original catch block toasted fileUploadError, but translator has fileUploadError
      toast.error(t('fileUploadError'));
    }
    return null;
  };

  const handleFileDelete = (urlToDelete: string) => {
    setFileUrl((prev) => {
      const urls = prev ? prev.split(',').filter(Boolean) : [];
      const filtered = urls.filter((u) => u !== urlToDelete);
      return filtered.join(',');
    });
  };

  const onSubmit = async (values: T) => {
    setIsSubmitting(true);
    try {
      await onSave({
        resultText: JSON.stringify(values),
        isAbnormal,
        abnormalNote: values.abnormalNote || '',
        fileUrl,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    fileUrl,
    setFileUrl,
    isAbnormal,
    setIsAbnormal,
    isUploading,
    isSubmitting,
    handleFileUpload,
    handleFileDelete,
    handleSubmit: form.handleSubmit(onSubmit),
  };
}
