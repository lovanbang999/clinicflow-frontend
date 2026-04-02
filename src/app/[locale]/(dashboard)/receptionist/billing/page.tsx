'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBilling } from '@/lib/hooks/useBilling';
import { InvoiceStatus } from '@/lib/api/billing';
import { bookingsApi } from '@/lib/api/bookings';
import { Card } from '@/components/ui/card';
import { ReceiptIcon, MagnifyingGlassIcon, SpinnerIcon } from '@phosphor-icons/react';
import { BillingTable } from '@/components/dashboard/billing/BillingTable';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BillingPage() {
  const t = useTranslations('receptionistBilling');
  const router = useRouter();
  const { invoices, loading, fetchInvoices } = useBilling();
  
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | string>('ALL_STATUS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    fetchInvoices({ status: statusFilter === 'ALL_STATUS' ? undefined : statusFilter as InvoiceStatus });
  }, [fetchInvoices, statusFilter]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { bookings } = await bookingsApi.getAll({ search: searchQuery.trim() });
      if (bookings && bookings.length > 0) {
        // Sort to prioritize active bookings (IN_PROGRESS > CONFIRMED > PENDING > others)
        const sortedBookings = [...bookings].sort((a, b) => {
          const statusOrder: Record<string, number> = {
            'IN_PROGRESS': 0,
            'CONFIRMED': 1,
            'PENDING': 2,
            'COMPLETED': 3,
            'CANCELLED': 4,
          };
          const orderA = statusOrder[a.status] ?? 99;
          const orderB = statusOrder[b.status] ?? 99;
          
          if (orderA !== orderB) return orderA - orderB;
          
          // If same priority, latest created first
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // Redirect to the most relevant booking
        router.push(`/receptionist/billing/booking/${sortedBookings[0].id}`);
      } else {
        toast.error(t('searchNotFound'));
      }
    } catch {
      toast.error(t('searchError'));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <ReceiptIcon size={28} weight="duotone" className="text-[#1392ec]" />
            {t('title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('subtitle')}</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-9 h-9 rounded-lg border-slate-200 bg-white shadow-none focus-visible:ring-1 focus-visible:ring-[#1392ec]"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {isSearching ? <SpinnerIcon className="animate-spin" /> : <MagnifyingGlassIcon />}
            </div>
          </form>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as InvoiceStatus | '')}
          >
            <SelectTrigger className="w-full sm:w-48 h-9 rounded-lg border-slate-200 bg-white cursor-pointer shadow-none focus:ring-[#1392ec]/20">
              <SelectValue placeholder={t('filter.all')} />
            </SelectTrigger>
            <SelectContent position="popper" align="end" className="rounded-xl border-slate-200">
              <SelectItem value="ALL_STATUS" className="cursor-pointer">{t('filter.all')}</SelectItem>
              <SelectItem value={InvoiceStatus.DRAFT} className="cursor-pointer">{t('filter.draft')}</SelectItem>
              <SelectItem value={InvoiceStatus.OPEN} className="cursor-pointer">{t('filter.open')}</SelectItem>
              <SelectItem value={InvoiceStatus.ISSUED} className="cursor-pointer">{t('filter.issued')}</SelectItem>
              <SelectItem value={InvoiceStatus.PAID} className="cursor-pointer">{t('filter.paid')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <BillingTable invoices={invoices} loading={loading} />
      </Card>
    </div>
  );
}
