import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { LabOrder } from '@/lib/api/lab-orders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  SpinnerIcon, 
  FileTextIcon,
  PlayIcon,
  PencilSimpleLineIcon
} from '@phosphor-icons/react';

interface WorklistTableProps {
  orders: LabOrder[];
  isLoading: boolean;
  onProcess: (order: LabOrder) => void;
  onResult: (order: LabOrder) => void;
}

export const WorklistTable = memo(function WorklistTable({
  orders,
  isLoading,
  onProcess,
  onResult,
}: WorklistTableProps) {
  const t = useTranslations('dashboard.technician.worklist');

  const getStatusBadge = (status: LabOrder['status']) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('status.paid')}</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">{t('status.inProgress')}</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{t('status.completed')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <SpinnerIcon size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <div className="mx-auto size-12 bg-slate-50 flex items-center justify-center rounded-full mb-3">
          <FileTextIcon className="text-slate-400" size={24} />
        </div>
        <p className="text-slate-500 font-medium">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-4">{t('columns.stt')}</th>
              <th className="px-5 py-4">{t('columns.patient')}</th>
              <th className="px-5 py-4">{t('columns.service')}</th>
              <th className="px-5 py-4">{t('columns.status')}</th>
              <th className="px-5 py-4">{t('columns.date')}</th>
              <th className="px-5 py-4 text-right">{t('columns.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order, index) => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4 font-medium text-slate-900">{index + 1}</td>
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-900">{order.patientProfile?.fullName || 'N/A'}</div>
                  <div className="text-xs text-slate-500">{order.patientProfile?.patientCode || order.booking?.bookingCode}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900">{order.testName}</div>
                  {order.booking?.doctor?.fullName && (
                    <div className="text-xs text-slate-500">BS. {order.booking.doctor.fullName}</div>
                  )}
                </td>
                <td className="px-5 py-4">{getStatusBadge(order.status)}</td>
                <td className="px-5 py-4 text-slate-600">
                  {format(new Date(order.orderedAt), 'dd/MM/yyyy HH:mm')}
                </td>
                <td className="px-5 py-4 text-right">
                  {order.status === 'PAID' && (
                    <Button 
                      size="sm" 
                      onClick={() => onProcess(order)}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-2 cursor-pointer transition-all"
                    >
                      <PlayIcon size={16} weight="fill" />
                      {t('actions.process')}
                    </Button>
                  )}
                  {order.status === 'IN_PROGRESS' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onResult(order)}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 gap-2 cursor-pointer transition-all"
                    >
                      <PencilSimpleLineIcon size={16} weight="bold" />
                      {t('actions.result')}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
