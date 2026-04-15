'use client';

import { useState } from 'react';
import { WorkspaceQueueItem } from '@/lib/api/billing/billing';
import { BillingQueueItem } from './BillingQueueItem';
import { Input } from '@/components/ui/input';
import { MagnifyingGlassIcon, FunnelIcon } from '@phosphor-icons/react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BillingQueuePanelProps {
  items: WorkspaceQueueItem[];
  isLoading: boolean;
  selectedBookingId: string | null;
  onSelect: (bookingId: string) => void;
  onSearchChange: (val: string) => void;
}

export function BillingQueuePanel({
  items,
  isLoading,
  selectedBookingId,
  onSelect,
  onSearchChange,
}: BillingQueuePanelProps) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredItems = items.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return item.pendingAmount > 0;
    if (activeTab === 'paid') return item.pendingAmount === 0 && item.totalAmount > 0;
    if (activeTab === 'urgent') return item.isUrgent;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
      {/* Search Header */}
      <div className="p-4 bg-white border-b border-slate-100">
        <div className="relative group">
          <MagnifyingGlassIcon 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1392ec] transition-colors" 
            size={18} 
          />
          <Input 
            placeholder="Tìm theo tên, SĐT, mã BN..." 
            className="pl-10 h-10 bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-[#1392ec] focus:ring-4 focus:ring-[#1392ec]/10 rounded-xl transition-all"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="w-full mt-4" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full bg-slate-100 p-1 rounded-xl h-9">
            <TabsTrigger value="all" className="text-[10px] uppercase font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer">Tất cả</TabsTrigger>
            <TabsTrigger value="pending" className="text-[10px] uppercase font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer">Chờ thu</TabsTrigger>
            <TabsTrigger value="paid" className="text-[10px] uppercase font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer">Đã thu</TabsTrigger>
            <TabsTrigger value="urgent" className="text-[10px] uppercase font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-red-500 cursor-pointer">Gấp</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Queue List */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <FunnelIcon size={12} /> {filteredItems.length} Bệnh nhân
              </span>
            </div>
            {filteredItems.map((item) => (
              <BillingQueueItem
                key={item.bookingId}
                item={item}
                isSelected={selectedBookingId === item.bookingId}
                onClick={() => onSelect(item.bookingId)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
            <MagnifyingGlassIcon size={32} weight="light" className="mb-2 opacity-50" />
            <p className="text-sm font-medium">Không tìm thấy bệnh nhân</p>
            <p className="text-xs">Thử tìm với từ khóa khác</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
