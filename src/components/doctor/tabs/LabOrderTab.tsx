'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { type VisitResultsResponse } from '@/lib/api/medical-records';
import { servicesApi } from '@/lib/api/services';
import { labOrdersApi, type LabOrder } from '@/lib/api/lab-orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MagnifyingGlassIcon, PlusIcon, TrashIcon, FileImageIcon, PaperclipIcon } from '@phosphor-icons/react';
import { ImageLightbox } from '@/components/shared/ImageLightbox';

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
  record: VisitResultsResponse | null;
  onSaved: (updated: VisitResultsResponse) => void;
}

export function LabOrderTab({ bookingId, record, onSaved }: LabOrderTabProps) {
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
      console.error(err);
    }
  }, [bookingId]);

  useEffect(() => {
    servicesApi.getAll({ categoryType: 'LAB' }).then(setAllServices).catch(console.error);
    fetchOrders();
  }, [fetchOrders]);

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
        if (record) onSaved(record);
        toast.success(t('successAdd'));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('errorAdd'));
      } finally {
        setIsOrdering(false);
      }
    },
    [bookingId, fetchOrders, onSaved, record, t],
  );

  const handleRemove = useCallback(
    async (orderId: string) => {
      try {
        setIsRemoving(orderId);
        await labOrdersApi.deleteOrder(orderId);
        await fetchOrders();
        toast.success(t('successRemove'));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('errorRemove'));
      } finally {
        setIsRemoving(null);
      }
    },
    [fetchOrders, t],
  );

  return (
    <div className="space-y-5">
      {/* Ordered services */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
        <h3 className="text-[15px] font-bold text-gray-800">
          Chỉ định Cận lâm sàng (Lab)
          <span className="ml-2 text-xs text-gray-400 font-normal">({orders.length} {t('count')})</span>
        </h3>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center italic">{t('empty')}</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-col p-3 rounded-lg border border-blue-100 bg-blue-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{order.testName}</p>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">Trạng thái: {order.status}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(order.id)}
                    disabled={isRemoving === order.id || order.status !== 'PENDING'}
                    className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    title="Xoá chỉ định"
                  >
                    <TrashIcon size={16} />
                  </Button>
                </div>
                {order.result && (
                  <div className="mt-3 pt-3 border-t border-blue-200/50 space-y-2">
                    <div className="text-sm text-gray-700 bg-white p-3 rounded shadow-sm border border-gray-100">
                      <p className="font-semibold text-gray-900 mb-1">Kết quả KTV ghi nhận:</p>
                      <p className="whitespace-pre-wrap">{order.result.resultText || '(Không có nội dung)'}</p>
                      
                      {order.result.isAbnormal && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-red-700">
                          <span className="font-semibold">⚠️ Cảnh báo bất thường:</span> {order.result.abnormalNote}
                        </div>
                      )}
                    </div>
                    {order.result.resultFileUrl && (
                      <div>
                        {isImage(order.result.resultFileUrl) ? (
                          <button
                            onClick={() => setActiveImage(order.result!.resultFileUrl!)}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline px-3 py-1.5 bg-blue-100/50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/50"
                          >
                            <FileImageIcon size={18} weight="duotone" />
                            Xem Ảnh Đính Kèm
                          </button>
                        ) : (
                          <a
                            href={order.result.resultFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline px-3 py-1.5 bg-blue-100/50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/50"
                          >
                            <PaperclipIcon size={18} weight="duotone" />
                            Xem File Đính Kèm
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service catalog */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
        <h3 className="text-[15px] font-bold text-gray-800">{t('catalog')}</h3>
        <div className="relative">
          <MagnifyingGlassIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9 text-[13px]"
          />
        </div>

        {filteredServices.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center italic">
            {search ? t('emptySearch') : t('emptyCatalog')}
          </p>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {filteredServices.map((svc) => (
              <div
                key={svc.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{svc.name}</p>
                  <p className="text-xs text-gray-400">
                    {svc.category?.name ?? t('fallbackCategory')}{svc.serviceCode ? ` · ${svc.serviceCode}` : ''} ·{' '}
                    {Number(svc.price).toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOrder(svc)}
                  disabled={isOrdering}
                  className="shrink-0 ml-3 gap-1 border-blue-300 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <PlusIcon size={14} />
                  {isOrdering ? t('ordering') : t('add')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ImageLightbox
        url={activeImage || ''}
        isOpen={!!activeImage}
        onClose={() => setActiveImage(null)}
      />
    </div>
  );
}
