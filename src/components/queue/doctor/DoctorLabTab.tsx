'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLabOrders } from '@/lib/hooks/clinical/useLabOrders';
import { servicesApi } from '@/lib/api/clinic/services';
import { Service } from '@/types';
import { SpinnerIcon, TrashIcon, FlaskIcon, CheckCircleIcon, WarningCircleIcon, FilePdfIcon, PrinterIcon } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { PrintableLabOrder } from './PrintableLabOrder';
import type { LabOrder, LabResult } from '@/lib/api/clinical/lab-orders';

interface DoctorLabTabProps {
  bookingId: string;
  patientProfile?: {
    fullName: string;
    patientCode?: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
  };
  doctorName?: string;
  bookingCode?: string;
}

export function DoctorLabTab({ bookingId, patientProfile, doctorName, bookingCode }: DoctorLabTabProps) {
  const locale = useLocale();
  const t = useTranslations('emr.lab');
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

  const isFormValid = !!(selectedServiceId && (selectedServiceId !== 'CUSTOM' || customTestName.trim()));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <LabOrderForm 
        t={t}
        services={services}
        selectedServiceId={selectedServiceId}
        setSelectedServiceId={setSelectedServiceId}
        customTestName={customTestName}
        setCustomTestName={setCustomTestName}
        testDescription={testDescription}
        setTestDescription={setTestDescription}
        onAdd={handleAddOrder}
        isSubmitting={isSubmitting}
        loadingServices={loadingServices}
        isFormValid={isFormValid}
        locale={locale}
      />

      <LabOrderList 
        t={t}
        orders={orders}
        isLoading={isLoading}
        onRemove={removeOrder}
      />

      <PrintableLabOrder
        patientProfile={patientProfile}
        doctorName={doctorName}
        bookingCode={bookingCode}
        labOrders={orders.filter(o => o.status === 'PENDING')}
      />
    </div>
  );
}

interface LabOrderFormProps {
  t: ReturnType<typeof useTranslations<'emr.lab'>>;
  services: Service[];
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  customTestName: string;
  setCustomTestName: (name: string) => void;
  testDescription: string;
  setTestDescription: (desc: string) => void;
  onAdd: () => Promise<void>;
  isSubmitting: boolean;
  loadingServices: boolean;
  isFormValid: boolean;
  locale: string;
}

function LabOrderForm({ t, services, selectedServiceId, setSelectedServiceId, customTestName, setCustomTestName, testDescription, setTestDescription, onAdd, isSubmitting, loadingServices, isFormValid, locale }: LabOrderFormProps) {
  return (
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
              disabled={!isFormValid || isSubmitting || loadingServices}
              onClick={onAdd}
            >
              {isSubmitting ? <SpinnerIcon className="animate-spin" /> : t('submitBtn')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LabOrderListProps {
  t: ReturnType<typeof useTranslations<'emr.lab'>>;
  orders: LabOrder[];
  isLoading: boolean;
  onRemove: (id: string) => Promise<boolean>;
}

function LabOrderList({ t, orders, isLoading, onRemove }: LabOrderListProps) {
  const handlePrint = () => {
    window.print();
    setTimeout(() => {
      toast.success(t('printSuccess') || 'Đã in Phiếu Chỉ Định', {
        description: t('paymentReminder') || 'Vui lòng dặn bệnh nhân mang phiếu ra quầy lễ tân thanh toán.',
        duration: 5000,
      });
    }, 500);
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-gray-900">
          {t('listTitle', { count: orders.length })}
        </h3>
        {orders.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 gap-1.5 font-bold text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 cursor-pointer"
          >
            <PrinterIcon size={16} weight="bold" />
            {t('printOrderBtn') || 'In Phiếu Chỉ Định'}
          </Button>
        )}
      </div>
      
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
            <LabOrderCard key={order.id} order={order} t={t} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}

interface LabOrderCardProps {
  order: LabOrder;
  t: ReturnType<typeof useTranslations<'emr.lab'>>;
  onRemove: (id: string) => Promise<boolean>;
}

function LabOrderCard({ order, t, onRemove }: LabOrderCardProps) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/30 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-[15px] text-gray-900">{order.testName}</h4>
          <StatusBadge status={order.status} t={t} />
        </div>
        
        {order.testDescription && (
          <p className="text-sm text-gray-600">{t('noteLabel')} {order.testDescription}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {t('orderedAt')} {format(new Date(order.orderedAt), 'HH:mm - dd/MM/yyyy')}
        </p>

        {order.status === 'COMPLETED' && order.result && (
          <LabResultBox result={order.result} t={t} />
        )}
      </div>
      
      {order.status === 'PENDING' && (
        <button
          type="button"
          onClick={() => onRemove(order.id)}
          className="shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title={t('deleteAction')}
        >
          <TrashIcon size={20} />
        </button>
      )}
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  t: ReturnType<typeof useTranslations<'emr.lab'>>;
}

function StatusBadge({ status, t }: StatusBadgeProps) {
  const configs: Record<string, { bg: string; text: string; border: string; label: React.ReactNode; icon?: React.ReactNode }> = {
    PENDING: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: t('status.pending') },
    PAID: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', label: t('status.paid'), icon: <CheckCircleIcon size={10} weight="fill" /> },
    IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: t('status.inProgress') },
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: t('status.completed') },
  };

  const config = configs[status] || configs.PENDING;

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${config.bg} ${config.text} ${config.border} flex items-center gap-1`}>
      {config.icon && config.icon}
      {config.label}
    </span>
  );
}

interface LabResultBoxProps {
  result: LabResult;
  t: ReturnType<typeof useTranslations<'emr.lab'>>;
}

function LabResultBox({ result, t }: LabResultBoxProps) {
  const isAbnormal = result.isAbnormal;
  return (
    <div className={`mt-3 p-3 rounded-lg border ${isAbnormal ? 'bg-red-50 border-red-200 text-red-900' : 'bg-green-50 border-green-200 text-green-900'}`}>
      <div className="flex items-start gap-2">
        {isAbnormal ? (
          <WarningCircleIcon size={20} weight="fill" className="text-red-500 shrink-0 mt-0.5" />
        ) : (
          <CheckCircleIcon size={20} weight="fill" className="text-green-500 shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1">{isAbnormal ? t('abnormal') : t('normal')}</p>
          <p className="text-[13px]">{result.resultText || t('noDetailDesc')}</p>
          {result.abnormalNote && isAbnormal && (
            <p className="text-[13px] font-bold mt-1 text-red-700">{t('noteLabel')} {result.abnormalNote}</p>
          )}
          {result.resultFileUrl && (
            <a 
              href={result.resultFileUrl} 
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
  );
}
