import { useState } from 'react';
import { UploadSimpleIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { ImageLightbox } from '@/components/shared/ImageLightbox';

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  fileUrl?: string;
  label: string;
  hint: string;
  accentColor?: string;
  disabled?: boolean;
}

export function UploadCard({
  onFileSelect,
  isUploading,
  fileUrl,
  label,
  hint,
  accentColor = "teal",
  disabled = false
}: UploadCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const isImage = fileUrl ? /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileUrl) || fileUrl.startsWith('data:image/') : false;

  const getAccentStyles = () => {
    switch (accentColor) {
      case 'rose': return 'group-hover/upload:border-rose-400 group-hover/upload:bg-rose-50/30 text-rose-500 bg-rose-50 border-rose-100 text-rose-700';
      case 'sky': return 'group-hover/upload:border-sky-400 group-hover/upload:bg-sky-50/30 text-sky-500 bg-sky-50 border-sky-100 text-sky-700';
      case 'blue': return 'group-hover/upload:border-blue-400 group-hover/upload:bg-blue-50/30 text-blue-500 bg-blue-50 border-blue-100 text-blue-700';
      default: return 'group-hover/upload:border-teal-400 group-hover/upload:bg-teal-50/30 text-teal-500 bg-teal-50 border-teal-100 text-teal-700';
    }
  };

  const accentStyles = getAccentStyles();

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
            <p className="text-sm font-bold text-slate-700">Tải lên tài liệu / Hình ảnh</p>
            <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tight">{hint}</p>
          </div>
        </div>
      </div>
      {fileUrl && (
        <div className={cn(
          "flex items-center gap-3 p-4 border rounded-2xl animate-in fade-in slide-in-from-top-2",
          accentStyles.split(' ').slice(3).join(' ')
        )}>
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
            <MagnifyingGlassIcon weight="bold" size={20} />
          </div>
          <span className="text-xs font-bold truncate flex-1">Đã đính kèm tệp</span>
          {isImage ? (
            <button 
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="text-[10px] font-black hover:underline uppercase transition-all"
            >
              Xem
            </button>
          ) : (
            <a href={fileUrl} target="_blank" className="text-[10px] font-black hover:underline uppercase">Xem</a>
          )}
        </div>
      )}
      {fileUrl && isImage && (
        <ImageLightbox 
          url={fileUrl} 
          isOpen={isLightboxOpen} 
          onClose={() => setIsLightboxOpen(false)} 
        />
      )}
    </div>
  );
}
