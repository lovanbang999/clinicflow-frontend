import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { UploadSimpleIcon, MagnifyingGlassIcon, EyeIcon, TrashIcon } from '@phosphor-icons/react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { ImageLightbox } from '@/components/shared/ImageLightbox';

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  onFileDelete?: (url: string) => void;
  isUploading: boolean;
  fileUrl?: string;
  label: string;
  hint: string;
  accentColor?: string;
  disabled?: boolean;
}

export function UploadCard({
  onFileSelect,
  onFileDelete,
  isUploading,
  fileUrl = '',
  label,
  hint,
  accentColor = "teal",
  disabled = false
}: UploadCardProps) {
  const t = useTranslations('technicianWorklist');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const getAccentStyles = () => {
    switch (accentColor) {
      case 'rose': return 'group-hover/upload:border-rose-400 group-hover/upload:bg-rose-50/30 text-rose-500 bg-rose-50 border-rose-100 text-rose-700';
      case 'sky': return 'group-hover/upload:border-sky-400 group-hover/upload:bg-sky-50/30 text-sky-500 bg-sky-50 border-sky-100 text-sky-700';
      case 'blue': return 'group-hover/upload:border-blue-400 group-hover/upload:bg-blue-50/30 text-blue-500 bg-blue-50 border-blue-100 text-blue-700';
      default: return 'group-hover/upload:border-teal-400 group-hover/upload:bg-teal-50/30 text-teal-500 bg-teal-50 border-teal-100 text-teal-700';
    }
  };

  const accentStyles = getAccentStyles();
  const urls = fileUrl ? fileUrl.split(',').filter(Boolean) : [];

  return (
    <div className="space-y-4">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      <div className="relative group/upload">
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
        <div className={cn(
          "border-2 border-dashed border-slate-200 bg-slate-50 rounded-[28px] p-10 transition-all duration-300 flex flex-col items-center text-center gap-3",
          !disabled && accentStyles.split(' ').slice(0, 2).join(' ')
        )}>
          <div className={cn(
            "w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/upload:scale-110 transition-all",
            !disabled && accentStyles.split(' ')[2]
          )}>
            {isUploading ? <Spinner className="w-6 h-6" /> : <UploadSimpleIcon weight="bold" size={28} />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">{t('forms.shared.uploadCardTitle')}</p>
            <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tight">{hint}</p>
          </div>
        </div>
      </div>

      {urls.length > 0 && (
        <div className="space-y-2.5">
          {urls.map((url, index) => {
            const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url) || url.startsWith('data:image/');
            return (
              <div
                key={url + '-' + index}
                className={cn(
                  "flex items-center gap-3 p-3 border rounded-2xl animate-in fade-in slide-in-from-top-2 group/item",
                  accentStyles.split(' ').slice(3).join(' ')
                )}
              >
                {/* Thumbnail / Icon */}
                <div className="relative w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 shadow-sm group/preview">
                  {isImage ? (
                    <>
                      <Image 
                        src={url} 
                        alt="Preview" 
                        width={48}
                        height={48}
                        unoptimized
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/preview:scale-110" 
                      />
                      <div 
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        onClick={() => setLightboxUrl(url)}
                      >
                        <EyeIcon weight="bold" size={18} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <MagnifyingGlassIcon weight="bold" size={20} className="text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                    {t('forms.shared.uploadCardAttached')}{urls.length > 1 ? ` #${index + 1}` : ''}
                  </p>
                  <p className="text-xs font-bold truncate">
                    {isImage ? t('forms.shared.uploadCardImage') : t('forms.shared.uploadCardDoc')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isImage ? (
                    <button 
                      type="button"
                      onClick={() => setLightboxUrl(url)}
                      className="px-3 py-1.5 bg-white/80 hover:bg-white text-[10px] font-black uppercase rounded-lg shadow-sm border border-slate-200 transition-all active:scale-95 text-slate-600 hover:text-slate-800"
                    >
                      {t('forms.shared.uploadCardViewImg')}
                    </button>
                  ) : (
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white/80 hover:bg-white text-[10px] font-black uppercase rounded-lg shadow-sm border border-slate-200 transition-all active:scale-95 text-slate-600 hover:text-slate-800"
                    >
                      {t('forms.shared.uploadCardViewFile')}
                    </a>
                  )}

                  {!disabled && onFileDelete && (
                    <button
                      type="button"
                      onClick={() => onFileDelete(url)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg shadow-xs border border-red-100 transition-all active:scale-95 flex items-center justify-center"
                    >
                      <TrashIcon size={14} weight="bold" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lightboxUrl && (
        <ImageLightbox 
          url={lightboxUrl} 
          isOpen={true} 
          onClose={() => setLightboxUrl(null)} 
        />
      )}
    </div>
  );
}
