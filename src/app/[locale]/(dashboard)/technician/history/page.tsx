'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { labOrdersApi, type LabOrder } from '@/lib/api/clinical/lab-orders';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { type DateRange } from 'react-day-picker';
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  FunnelIcon,
  EyeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@phosphor-icons/react';

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Tất cả danh mục' },
  { value: 'BLOOD_LAB', label: 'Huyết học / Sinh hóa' },
  { value: 'IMAGING', label: 'Chẩn đoán hình ảnh' },
  { value: 'ECG', label: 'Thăm dò chức năng (Điện tim)' },
  { value: 'ENDOSCOPY', label: 'Nội soi tiêu hóa' },
  { value: 'SPIROMETRY', label: 'Thăm dò chức năng phổi' },
  { value: 'GENERAL', label: 'Cận lâm sàng chung' },
];

export default function TechnicianHistoryPage() {
  const t = useTranslations('technicianWorklist');
  const router = useRouter();

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Data State
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await labOrdersApi.getTechnicianHistory({
        page,
        limit,
        search: search || undefined,
        labFormType: category && category !== 'ALL' ? category : undefined,
        startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      });

      setOrders(res.items);
      setTotal(res.total);
      setTotalPages(res.pages);
    } catch (err) {
      void err;
      toast.error(t('messages.fetchHistoryError'));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, dateRange]);

  // Refetch when filters or pagination change
  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('ALL');
    setDateRange(undefined);
    setPage(1);
  };

  const handleOpenWorkspace = (orderId: string) => {
    router.push(`/technician/lab-worklist/${orderId}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden font-vietnam">
      {/* Filters Area - Clean row inside the gray workspace under layout header */}
      <div className="bg-[#f8fafc] border-b border-slate-200/60 px-8 py-4 shrink-0 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <Input
            type="text"
            placeholder={t('historyPage.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 px-4 rounded-xl border-slate-200 bg-white text-xs focus-visible:ring-[#1392ec]/20"
          />
        </div>

        {/* Category */}
        <div className="min-w-[180px]">
          <Select
            value={category}
            onValueChange={(val) => {
              setCategory(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full h-10 rounded-xl border-slate-200 bg-white text-xs text-slate-600 font-semibold">
              <SelectValue placeholder={t('historyPage.allCategories')} />
            </SelectTrigger>
            <SelectContent position="popper">
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.value === 'ALL' ? t('historyPage.allCategories') : t(`workspace.types.${opt.value}` as Parameters<typeof t>[0])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date range filters */}
        <div className="flex items-center gap-2">
          <DateRangePicker
            date={dateRange}
            setDate={(range) => {
              setDateRange(range);
              setPage(1);
            }}
            align="end"
          />
        </div>

        {/* Reset */}
        {(search || (category && category !== 'ALL') || dateRange?.from || dateRange?.to) && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="h-10 px-4 text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            {t('historyPage.clearFilters')}
          </Button>
        )}
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="p-6 border-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-72" />
                  </div>
                  <Skeleton className="h-10 w-28 rounded-xl" />
                </div>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
              <FunnelIcon size={32} />
            </div>
            <h3 className="font-bold text-slate-700 text-lg">{t('historyPage.noResults')}</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-md">{t('historyPage.noResultsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-[1200px] mx-auto">
            {orders.map((order) => {
              const p = order.patientProfile;
              const dateText = order.result?.resultDate
                ? format(new Date(order.result.resultDate), 'dd/MM/yyyy HH:mm')
                : order.orderedAt
                ? format(new Date(order.orderedAt), 'dd/MM/yyyy HH:mm')
                : 'N/A';

              return (
                <Card
                  key={order.id}
                  className="group overflow-hidden border-slate-200 hover:border-[#1392ec]/40 hover:shadow-md transition-all duration-300 cursor-pointer p-6 bg-white"
                  onClick={() => handleOpenWorkspace(order.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      {/* Top Row: Category and Code */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="bg-[#1392ec]/10 text-[#1392ec] font-bold border-none px-2.5 py-0.5 rounded-lg text-[10px] uppercase tracking-wider">
                          {order.service?.labFormType || 'GENERAL'}
                        </Badge>
                        <span className="text-xs text-slate-400 font-bold font-mono bg-slate-100 px-2 py-0.5 rounded">
                          {p?.patientCode || 'N/A'}
                        </span>
                      </div>

                      {/* Patient Name & Service */}
                      <div>
                        <h3 className="text-base font-black text-slate-800 tracking-tight leading-tight group-hover:text-[#1392ec] transition-colors">
                          {p?.fullName || 'N/A'}
                        </h3>
                        <div className="text-sm font-bold text-slate-600 mt-1">
                          {order.testName}
                        </div>
                      </div>

                      {/* Doctor Notes / Result Preview */}
                      {order.result?.resultText && (
                        <div className="text-xs text-slate-500 line-clamp-2 bg-slate-50/50 border border-slate-100 p-3 rounded-xl font-medium max-w-3xl">
                          <span className="font-bold text-slate-600 block mb-0.5 uppercase tracking-wider text-[9px]">{t('forms.shared.conclusion')}</span>
                          {order.result.resultText}
                        </div>
                      )}

                      {/* Footer Vitals & Date */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1">
                          <UserIcon size={14} weight="bold" />
                          {p?.gender === 'MALE' ? t('workspace.gender.male') : p?.gender === 'FEMALE' ? t('workspace.gender.female') : 'N/A'}
                          {p?.dateOfBirth ? ` • ${new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()} ${t('workspace.sidebar.ageUnit')}` : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon size={14} weight="bold" />
                          {t('historyPage.completedAt', { date: dateText })}
                        </span>
                        {order.result?.isAbnormal && (
                          <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg font-bold border border-rose-100 uppercase text-[9px] tracking-wider">
                            {t('historyPage.abnormal')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Button */}
                    <div className="shrink-0 flex items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-200 hover:border-[#1392ec] hover:text-[#1392ec] font-bold px-4 h-10 rounded-xl flex items-center gap-1.5 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenWorkspace(order.id);
                        }}
                      >
                        <EyeIcon size={16} weight="bold" />
                        {t('historyPage.viewDetail')}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="bg-white border-t border-slate-200 px-8 py-4 shrink-0 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-400">
            {t('historyPage.showingResults', { count: orders.length, total })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 px-3 rounded-lg border-slate-200"
            >
              <ArrowLeftIcon size={16} weight="bold" />
            </Button>
            <span className="text-xs font-bold text-slate-600 px-2">
              {t('historyPage.pageInfo', { page, total: totalPages })}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 px-3 rounded-lg border-slate-200"
            >
              <ArrowRightIcon size={16} weight="bold" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
