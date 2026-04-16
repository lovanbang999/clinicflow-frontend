import { useTranslations } from 'next-intl';
import {
  ArrowLeftIcon,
  FlaskIcon,
  CameraIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  WindIcon,
  FilesIcon,
} from '@phosphor-icons/react';
import { LabOrder } from '@/lib/api/clinical/lab-orders';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkbenchHeaderProps {
  order: LabOrder;
  isCompleted: boolean;
  onBack: () => void;
}

export function WorkbenchHeader({
  order,
  isCompleted,
  onBack
}: WorkbenchHeaderProps) {
  
  const getIcon = () => {
    const type = order.service?.labFormType;
    switch (type) {
      case 'BLOOD_LAB': return <FlaskIcon className="text-purple-600" size={24} weight="duotone" />;
      case 'IMAGING': return <CameraIcon className="text-emerald-600" size={24} weight="duotone" />;
      case 'ECG': return <HeartIcon className="text-rose-600" size={24} weight="duotone" />;
      case 'ENDOSCOPY': return <MagnifyingGlassIcon className="text-amber-600" size={24} weight="duotone" />;
      case 'SPIROMETRY': return <WindIcon className="text-sky-600" size={24} weight="duotone" />;
      default: return <FilesIcon className="text-slate-600" size={24} weight="duotone" />;
    }
  };

  const getBadgeColor = () => {
    const type = order.service?.labFormType;
    switch (type) {
      case 'BLOOD_LAB': return "bg-purple-100 text-purple-700 border-purple-200";
      case 'IMAGING': return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case 'ECG': return "bg-rose-100 text-rose-700 border-rose-200";
      case 'ENDOSCOPY': return "bg-amber-100 text-amber-700 border-amber-200";
      case 'SPIROMETRY': return "bg-sky-100 text-sky-700 border-sky-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const typeName = () => {
    const type = order.service?.labFormType;
    return t(`workspace.types.${type || 'GENERAL'}`);
  };

  const t = useTranslations('technicianWorklist');

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl hover:bg-slate-100 border border-slate-200 w-10 h-10 transition-all active:scale-95" 
          onClick={onBack}
        >
          <ArrowLeftIcon size={18} weight="bold" className="text-slate-600" />
        </Button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight font-space-grotesk">{order.testName}</h1>
              <span className={cn(
                "text-[10px] font-bold px-2.5 py-0.5 rounded-full border tracking-wide uppercase",
                getBadgeColor()
              )}>
                {typeName()}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              ID: <span className="text-slate-600 font-mono">#{order.id.split('-')[0].toUpperCase()}</span> · {t('workspace.doctor')}: <span className="text-slate-600 font-bold">{order.booking?.doctor.fullName}</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end mr-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            {t('worklist.columns.status')}
          </span>
          <span className={cn(
            "text-xs font-black mt-1 uppercase",
            isCompleted ? "text-emerald-500" : "text-orange-500"
          )}>
            {isCompleted ? t('workspace.status.completed') : t('workspace.status.processing')}
          </span>
        </div>
      </div>
    </div>
  );
}
