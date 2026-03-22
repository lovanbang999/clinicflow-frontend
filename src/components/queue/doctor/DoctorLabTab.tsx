'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLabOrders } from '@/lib/hooks/useLabOrders';
import { servicesApi } from '@/lib/api/services';
import { Service } from '@/types';
import { SpinnerIcon, TrashIcon, FlaskIcon, CheckCircleIcon, WarningCircleIcon, FilePdfIcon } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useTranslations, useLocale } from 'next-intl';

interface DoctorLabTabProps {
  bookingId: string;
}

export function DoctorLabTab({ bookingId }: DoctorLabTabProps) {
  const locale = useLocale();
  const t = useTranslations('dashboard.doctor.workspace.labTab');
  const { orders, isLoading, isSubmitting, addOrder, removeOrder } = useLabOrders(bookingId);
  
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [customTestName, setCustomTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoadingServices(true);
        const data = await servicesApi.getAll({ isActive: true });
        // Optionally filter by category if needed, but for now we list all active services
        // since the old requirements stated they want to select generic services
        setServices(data || []);
      } catch (error) {
        console.error('Failed to fetch services', error);
      } finally {
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, []);

  const handleAddOrder = async () => {
    let finalTestName = '';
    let serviceId: string | undefined = undefined;

    if (selectedServiceId && selectedServiceId !== 'CUSTOM') {
      const selectedSvc = services.find(s => s.id === selectedServiceId);
      if (selectedSvc) {
        finalTestName = selectedSvc.name;
        serviceId = selectedSvc.id;
      }
    } else {
      finalTestName = customTestName;
    }

    if (!finalTestName.trim()) return;

    const success = await addOrder({ 
      testName: finalTestName, 
      testDescription,
      serviceId
    });
    
    if (success) {
      setSelectedServiceId('');
      setCustomTestName('');
      setTestDescription('');
    }
  };

  const isFormValid = () => {
    if (selectedServiceId && selectedServiceId !== 'CUSTOM') return true;
    if (selectedServiceId === 'CUSTOM' && customTestName.trim()) return true;
    return false;
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Form Section */}
      <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden p-6">
        <h3 className="text-[16px] font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FlaskIcon size={20} className="text-blue-600" weight="fill" />
          {t('createOrder')}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('testName')}</label>
              <div className="space-y-2">
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full h-10 text-sm shadow-sm border border-gray-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="">{t('selectService')}</option>
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} - {new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD' }).format(svc.price)}
                    </option>
                  ))}
                  <option value="CUSTOM">{t('customService')}</option>
                </select>

                {selectedServiceId === 'CUSTOM' && (
                  <Input
                    value={customTestName}
                    onChange={(e) => setCustomTestName(e.target.value)}
                    placeholder={t('testNamePlaceholder')}
                    className="h-10 text-sm shadow-sm"
                  />
                )}
              </div>
            </div>
            
            <div className="md:col-span-5">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('description')}</label>
              <Input
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                className="h-10 text-sm shadow-sm"
              />
            </div>
            
            <div className="md:col-span-2 flex items-end">
              <Button
                type="button"
                className="w-full h-10 font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                disabled={!isFormValid() || isSubmitting || loadingServices}
                onClick={handleAddOrder}
              >
                {isSubmitting ? <SpinnerIcon className="animate-spin" /> : t('submitBtn')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden p-6">
        <h3 className="text-[16px] font-bold text-gray-900 mb-4">
          {t('listTitle', { count: orders.length })}
        </h3>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <SpinnerIcon size={32} className="animate-spin text-gray-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
            <p className="text-sm font-medium text-gray-500">{t('emptyList')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <div key={order.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/30 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[15px] text-gray-900">{order.testName}</h4>
                    {order.status === 'PENDING' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
                        {t('status.pending')}
                      </span>
                    )}
                    {order.status === 'IN_PROGRESS' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                        {t('status.inProgress')}
                      </span>
                    )}
                    {order.status === 'COMPLETED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                        {t('status.completed')}
                      </span>
                    )}
                  </div>
                  
                  {order.testDescription && (
                    <p className="text-sm text-gray-600">{t('noteLabel')} {order.testDescription}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {t('orderedAt')} {format(new Date(order.orderedAt), 'HH:mm - dd/MM/yyyy')}
                  </p>

                  {/* Result Box if COMPLETED */}
                  {order.status === 'COMPLETED' && order.result && (
                    <div className={`mt-3 p-3 rounded-lg border ${order.result.isAbnormal ? 'bg-red-50 border-red-200 text-red-900' : 'bg-green-50 border-green-200 text-green-900'}`}>
                      <div className="flex items-start gap-2">
                        {order.result.isAbnormal ? (
                          <WarningCircleIcon size={20} weight="fill" className="text-red-500 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircleIcon size={20} weight="fill" className="text-green-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold mb-1">
                            {order.result.isAbnormal ? t('abnormal') : t('normal')}
                          </p>
                          <p className="text-[13px]">{order.result.resultText || t('noDetailDesc')}</p>
                          {order.result.abnormalNote && order.result.isAbnormal && (
                            <p className="text-[13px] font-bold mt-1 text-red-700">{t('noteLabel')} {order.result.abnormalNote}</p>
                          )}
                          {order.result.resultFileUrl && (
                            <a 
                              href={order.result.resultFileUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <FilePdfIcon size={16} className="text-red-500" />
                              {t('viewFile')}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
                
                {/* Delete action only allowed when PENDING */}
                {order.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => removeOrder(order.id)}
                    className="shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title={t('deleteAction')}
                  >
                    <TrashIcon size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
