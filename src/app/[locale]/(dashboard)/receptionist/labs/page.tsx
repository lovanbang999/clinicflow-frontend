'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { type LabOrder } from '@/lib/api/lab-orders';
import { usePendingLabOrders } from '@/lib/hooks/useLabOrders';
import { LabResultModal } from '@/components/receptionist/labs/LabResultModal';
import { format } from 'date-fns';
import { SpinnerIcon, FlaskIcon, CheckCircleIcon, ClockIcon } from '@phosphor-icons/react';

export default function ReceptionistLabsPage() {
  const t = useTranslations('dashboard.receptionist.labManagement');
  const { orders, isLoading, refetch } = usePendingLabOrders(true);

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (order: LabOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const handleResultAdded = () => {
    handleCloseModal();
    refetch(); // reload
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50/50">
      <div className="flex-1 overflow-y-auto w-full p-8">
        
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <FlaskIcon size={28} weight="fill" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-500 text-sm">{t('subtitle')}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold text-gray-600">{t('columns.time')}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">{t('columns.patient')}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">{t('columns.testName')}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">{t('columns.doctor')}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">{t('columns.status')}</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-right">{t('columns.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading && orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <SpinnerIcon size={32} className="animate-spin text-blue-600 mx-auto mb-2" />
                      {t('loading')}
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {t('empty')}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const patient = order.patientProfile;
                    const b = order.booking;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-700">
                          {format(new Date(order.orderedAt), 'HH:mm - dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{patient?.fullName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{b?.bookingCode}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{order.testName}</p>
                          {order.testDescription && (
                            <p className="text-xs text-gray-500 mt-0.5">{order.testDescription}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {t('dr')} {b?.doctor?.fullName}
                        </td>
                        <td className="px-6 py-4">
                          {order.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                              <ClockIcon size={14} weight="bold" /> {t('status.pending')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <SpinnerIcon size={14} className="animate-spin" /> {t('status.inProgress')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenModal(order)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            <CheckCircleIcon size={18} weight="bold" />
                            {t('actions.enterResult')}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedOrder && (
          <LabResultModal
            isOpen={isModalOpen}
            order={selectedOrder}
            onClose={handleCloseModal}
            onSuccess={handleResultAdded}
          />
        )}
      </div>
    </div>
  );
}
