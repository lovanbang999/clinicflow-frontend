'use client';

import { useCallback, useEffect, useState } from 'react';
import { useBilling } from '@/lib/hooks/billing/useBilling';
import { InvoiceStatus } from '@/lib/api/billing/billing';
import { useLabOrderSocket } from '@/lib/hooks/clinical/useLabOrderSocket';
import { Card } from '@/components/ui/card';
import { 
  ReceiptIcon, 
  ListIcon, 
  LayoutIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@phosphor-icons/react';
import { BillingTable } from '@/components/dashboard/billing/BillingTable';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BillingWorkspace } from '@/components/dashboard/billing/workspace';
import { useSearchParams } from 'next/navigation';

export default function BillingPage() {
  const t = useTranslations('receptionistBilling');
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { invoices, loading, fetchInvoices } = useBilling();
  
  const [activeTab, setActiveTab] = useState('workspace');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | string>('ALL_STATUS');
  const [searchQuery, setSearchQuery] = useState('');
  
  const refreshInvoices = useCallback(() => {
    void fetchInvoices({ 
      status: statusFilter === 'ALL_STATUS' ? undefined : statusFilter as InvoiceStatus,
      search: searchQuery || undefined,
    });
  }, [fetchInvoices, statusFilter, searchQuery]);

  // Initial fetch and tab-switch fetch
  useEffect(() => {
    if (activeTab === 'history') {
      const timer = setTimeout(() => {
        refreshInvoices();
      }, 800); // Debounce search
      return () => clearTimeout(timer);
    }
  }, [activeTab, searchQuery, statusFilter, refreshInvoices]);

  // Real-time refresh
  const { onBillingRefresh } = useLabOrderSocket();
  useEffect(() => {
    if (!onBillingRefresh) return;
    return onBillingRefresh(() => {
      if (activeTab === 'history') {
        refreshInvoices();
      }
    });
  }, [activeTab, onBillingRefresh, refreshInvoices]);

  return (
    <div className="mx-auto p-6 space-y-6 flex flex-col h-full bg-slate-50/50">
      {/* Header with Tab Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 text-slate-800 tracking-tight">
            <div className="p-2 bg-[#1392ec] rounded-2xl shadow-lg shadow-[#1392ec]/20">
              <ReceiptIcon size={32} weight="duotone" className="text-white" />
            </div>
            {t('title')}
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-lg">
            {activeTab === 'workspace' 
              ? 'Quản lý thu ngân theo hành trình bệnh nhân.'
              : 'Tra cứu lịch sử hoá đơn và quản lý trạng thái thanh toán chi tiết.'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-stretch lg:self-auto">
          <TabsList className="bg-transparent h-11">
            <TabsTrigger 
              value="workspace" 
              className="px-6 rounded-xl data-[state=active]:bg-[#1392ec] data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm transition-all data-[state=inactive]:cursor-pointer"
            >
              <LayoutIcon size={18} className="mr-2" /> Workspace
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="px-6 rounded-xl data-[state=active]:bg-[#1392ec] data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm transition-all data-[state=inactive]:cursor-pointer"
            >
              <ListIcon size={18} className="mr-2" /> Lịch sử hoá đơn
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="workspace" className="h-full m-0 outline-none">
            <BillingWorkspace preSelectedBookingId={bookingId} />
          </TabsContent>

          <TabsContent value="history" className="h-full m-0 outline-none space-y-4">
            {/* Table Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-4">
              <div className="relative flex-1 w-full group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1392ec] transition-colors" size={20} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo số hoá đơn, tên bệnh nhân..."
                  className="pl-12 h-11 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#1392ec] focus:ring-4 focus:ring-[#1392ec]/10 transition-all border-0 shadow-none"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest pl-2">
                  <FunnelIcon size={14} /> Lọc trạng thái
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-full sm:w-48 h-11 rounded-2xl border-0 bg-slate-50/50 hover:bg-slate-100 focus:ring-[#1392ec]/20 transition-all shadow-none font-semibold text-slate-700">
                    <SelectValue placeholder={t('filter.all')} />
                  </SelectTrigger>
                  <SelectContent position="popper" align="end" className="rounded-2xl border-slate-100 shadow-xl">
                    <SelectItem value="ALL_STATUS" className="rounded-xl focus:bg-slate-50 font-medium capitalize prose-sm">Tất cả trạng thái</SelectItem>
                    <SelectItem value={InvoiceStatus.DRAFT} className="rounded-xl focus:bg-slate-50 font-medium capitalize prose-sm">Bản nháp</SelectItem>
                    <SelectItem value={InvoiceStatus.OPEN} className="rounded-xl focus:bg-slate-50 font-medium capitalize prose-sm">Chờ thanh toán</SelectItem>
                    <SelectItem value={InvoiceStatus.PAID} className="rounded-xl focus:bg-slate-50 font-medium capitalize prose-sm text-emerald-600">Đã thanh toán</SelectItem>
                    <SelectItem value={InvoiceStatus.CANCELLED} className="rounded-xl focus:bg-slate-50 font-medium capitalize prose-sm text-red-600">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="rounded-[32px] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
              <BillingTable invoices={invoices} loading={loading} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
