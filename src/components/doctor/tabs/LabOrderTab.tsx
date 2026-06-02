'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { medicalRecordsApi, type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { servicesApi } from '@/lib/api/clinic/services';
import { labOrdersApi, type LabOrder } from '@/lib/api/clinical/lab-orders';
import { useLabOrderSocket } from '@/lib/hooks/clinical/useLabOrderSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MagnifyingGlassIcon, TrashIcon, FileImageIcon, PaperclipIcon, ArrowRightIcon, ArrowLeftIcon } from '@phosphor-icons/react';
import { ImageLightbox } from '@/components/shared/ImageLightbox';
import { StickyBottomBar } from '@/components/doctor/shared/StickyBottomBar';

interface Service {
  id: string;
  name: string;
  serviceCode?: string;
  category?: {
    id: string;
    code: string;
    name: string;
  } | null;
  categoryId?: string | null;
  price: number | string;
}

interface LabOrderTabProps {
  bookingId: string;
  onSaved: (updated: VisitResultsResponse) => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export function LabOrderTab({ bookingId, onSaved, onSkip, onBack }: LabOrderTabProps) {
  const t = useTranslations('emr.visit.services');
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const isImage = (url: string) => /\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i.test(url);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await labOrdersApi.getOrdersByBooking(bookingId);
      setOrders(data);
    } catch (err) {
      void err;
    }
  }, [bookingId]);

  useEffect(() => {
    servicesApi.getAll({ categoryType: 'LAB' }).then(setAllServices).catch(() => {});
    fetchOrders();
  }, [fetchOrders]);

  // Subscribe to WebSocket: auto-refresh when a lab result is completed by technician
  const { joinBookingLabRoom, leaveBookingLabRoom, onLabResultCompleted } = useLabOrderSocket();
  useEffect(() => {
    joinBookingLabRoom(bookingId);
    const unsubscribe = onLabResultCompleted(async (payload) => {
      toast.success(`🧪 ${payload.testName} — kết quả đã sẵn sàng`);
      void fetchOrders();
      try {
        const updatedRecord = await medicalRecordsApi.getVisitResults(bookingId);
        onSaved(updatedRecord);
      } catch (err) {
        void err;
      }
    });
    return () => {
      leaveBookingLabRoom(bookingId);
      unsubscribe?.();
    };
  }, [bookingId, joinBookingLabRoom, leaveBookingLabRoom, onLabResultCompleted, fetchOrders, onSaved]);

  const handleNext = async () => {
    try {
      const updatedRecord = await medicalRecordsApi.getVisitResults(bookingId);
      onSaved(updatedRecord);
    } catch (err) {
      void err;
    } finally {
      if (onSkip) onSkip();
    }
  };

  const orderedNames = new Set(orders.map((o) => o.testName));

  const filteredServices = allServices.filter(
    (s) =>
      !orderedNames.has(s.name) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.serviceCode ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (s.category?.name ?? '').toLowerCase().includes(search.toLowerCase())),
  );

  const handleOrder = useCallback(
    async (svc: Service) => {
      try {
        setIsOrdering(true);
        await labOrdersApi.createOrder({ bookingId, testName: svc.name, serviceId: svc.id });
        await fetchOrders();
        // Refresh the whole record to sync other tabs (e.g. Prescription)
        const updatedRecord = await medicalRecordsApi.getVisitResults(bookingId);
        onSaved(updatedRecord);
        toast.success(t('successAdd'));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('errorAdd'));
      } finally {
        setIsOrdering(false);
      }
    },
    [bookingId, fetchOrders, onSaved, t],
  );

  const handleRemove = useCallback(
    async (orderId: string) => {
      try {
        setIsRemoving(orderId);
        await labOrdersApi.deleteOrder(orderId);
        await fetchOrders();
        const updatedRecord = await medicalRecordsApi.getVisitResults(bookingId);
        onSaved(updatedRecord);
        toast.success(t('successRemove'));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('errorRemove'));
      } finally {
        setIsRemoving(null);
      }
    },
    [bookingId, fetchOrders, onSaved, t],
  );

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-[13.5px] leading-relaxed bg-[#faf5ff] border border-[#c4b5fd] text-[#5b21b6]">
        <span className="text-[18px] shrink-0">💡</span>
        <div>{t('tooltip')}</div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-[13px] font-semibold">
          <span className="text-slate-400">{t('stats.total')}:</span> <strong className="text-slate-900">{orders.length}</strong>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-[13px] font-semibold">
          <span className="text-slate-400">{t('stats.pending')}:</span> <strong className="text-slate-900">{orders.filter(o => o.status !== 'COMPLETED').length}</strong>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-[13px] font-semibold">
          <span className="text-slate-400">{t('stats.ready')}:</span> <strong className="text-slate-900">{orders.filter(o => o.status === 'COMPLETED').length}</strong>
        </div>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px_120px_60px] px-3.5 py-2 bg-gray-50 rounded-t-xl border border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wide gap-3">
          <div>{t('table.service')}</div>
          <div className="hidden md:block">{t('table.type')}</div>
          <div className="hidden md:block">{t('table.price')}</div>
          <div className="hidden md:block">{t('table.status')}</div>
          <div className="text-right hidden md:block">{t('table.action')}</div>
        </div>
        <div className="border border-t-0 border-gray-200 rounded-b-xl empty:hidden">
          {orders.map((order) => {
            // Safe fallback finding matched service
            const matchedSvc = allServices.find(s => s.name === order.testName);
            const svcCategory = matchedSvc?.category?.name || t('fallbackCategory');
            const priceStr = Number(matchedSvc?.price || 0).toLocaleString('vi-VN');

            return (
              <div key={order.id} className="flex flex-col border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px_120px_60px] items-center px-3.5 py-3 gap-3">
                  <div>
                    <div className="font-semibold text-[13px] text-gray-800">{order.testName}</div>
                    <div className="text-[11px] text-gray-400 md:hidden mt-0.5">{svcCategory} · {priceStr}đ</div>
                  </div>
                  <div className="text-[11px] text-gray-400 hidden md:block">{svcCategory}</div>
                  <div className="font-mono text-[12.5px] text-gray-700 hidden md:block">{priceStr}đ</div>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${order.status === 'COMPLETED' ? 'bg-[#ecfdf5] text-[#065f46]' : 'bg-[#fff8eb] text-[#92400e]'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${order.status === 'COMPLETED' ? 'bg-[#10b981]' : 'bg-[#f59e0b]'}`} />
                      {order.status === 'COMPLETED' ? t('status.ready') : t('status.pending')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 md:justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(order.id)}
                      disabled={isRemoving === order.id || order.status !== 'PENDING'}
                      className="w-7 h-7 p-0 rounded-md bg-[#fef2f2] text-[#ef4444] hover:bg-[#fee2e2] disabled:opacity-50 transition-colors"
                      title={t('removeTooltip')}
                    >
                      <TrashIcon size={14} weight="bold" />
                    </Button>
                  </div>
                </div>

                {order.result && (
                  <div className="px-3.5 pb-3">
                    <div className="text-[13px] text-gray-700 bg-white p-3 rounded-xl border border-gray-200">
                      <p className="whitespace-pre-wrap">{order.result.resultText || t('results.empty')}</p>
                      {order.result.isAbnormal && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
                          <span className="font-semibold">{t('results.abnormal')}</span> {order.result.abnormalNote}
                        </div>
                      )}
                      {order.result.resultFileUrl && (
                        <div className="mt-3 border-t border-gray-100 pt-3">
                          {isImage(order.result.resultFileUrl) ? (
                            <button
                               type="button"
                              onClick={() => setActiveImage(order.result!.resultFileUrl!)}
                              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 cursor-pointer"
                            >
                              <FileImageIcon size={18} weight="duotone" />
                              {t('results.viewImage')}
                            </button>
                          ) : (
                            <a
                              href={order.result.resultFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 cursor-pointer"
                            >
                              <PaperclipIcon size={18} weight="duotone" />
                              {t('results.viewFile')}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {orders.length === 0 && (
          <div className="border border-t-0 border-gray-200 rounded-b-xl text-center py-6 text-[13px] text-gray-400 italic">
            {t('emptySelection')}
          </div>
        )}
      </div>

      <hr className="border-t border-gray-200 my-5" />
      <div className="text-[13px] font-bold text-gray-700 mb-3.5 flex items-center gap-2 pb-2.5 border-b border-gray-100">
        <span className="text-[16px]">➕</span> {t('catalogHeader')}
      </div>

      <div className="flex gap-2.5 mb-3.5">
        <div className="relative flex-1">
          <MagnifyingGlassIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9 w-full rounded-xl border-gray-200 h-[42px] text-[13px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3.5 max-h-[300px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
        {filteredServices.length === 0 ? (
          <div className="col-span-3 text-center py-4 text-[13px] text-gray-400 italic">
            {search ? t('emptySearch') : t('emptyCatalog')}
          </div>
        ) : (
          filteredServices.map(svc => (
            <div
              key={svc.id}
              onClick={() => handleOrder(svc)}
              className={`border border-gray-200 rounded-xl p-2.5 cursor-pointer transition-all hover:border-indigo-600 hover:bg-indigo-50/50 flex items-center justify-between group ${isOrdering ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="min-w-0 pr-2">
                <div className="text-[12.5px] font-semibold text-gray-800 truncate">{svc.name}</div>
                <div className="text-[11px] text-gray-400">{svc.category?.name || t('fallbackCategory')}</div>
              </div>
              <div className="text-[12px] font-mono text-indigo-600 font-bold shrink-0">{Number(svc.price).toLocaleString('vi-VN')}đ</div>
            </div>
          ))
        )}
      </div>

      {orders.length === 0 && (
        <div className="border-[1.5px] border-dashed border-gray-300 rounded-xl p-4 text-center mt-6 text-gray-500 text-[13px]">
          <p className="mb-2.5">{t('skipPrompt')}</p>
          <button type="button" onClick={onSkip} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#faf5ff] text-[#7c3aed] border border-dashed border-[#7c3aed] font-semibold text-[13px] hover:bg-[#f3e8ff] transition-colors cursor-pointer">
            {t('skipButton')}
          </button>
        </div>
      )}

      <ImageLightbox
        url={activeImage || ''}
        isOpen={!!activeImage}
        onClose={() => setActiveImage(null)}
      />

      <StickyBottomBar title={t('stickyTitle')}>
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-[42px] rounded-xl text-gray-600 border-gray-200 hover:bg-gray-50 flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {t('back')}
            </Button>
          )}
          {(onSkip && orders.length === 0) && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              className="h-[42px] rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 font-semibold"
            >
              ⏭ {t('skip')}
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 h-[42px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[14px] shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition-all flex items-center gap-2"
          >
            <span className="text-sm">{t('saveAndNext')}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </StickyBottomBar>
    </div>
  );
}
