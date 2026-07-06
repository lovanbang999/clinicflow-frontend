'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminServices } from '@/lib/hooks/admin/useAdminServices';
import { useDebounce } from '@/lib/hooks/core/useDebounce';
import { type AdminService, type ServiceFiltersQuery } from '@/lib/api/admin/admin-services';
import { ServiceStatCards } from '@/components/dashboard/services/ServiceStatCards';
import { ServiceTable } from '@/components/dashboard/services/ServiceTable';
import { ServiceFormDialog } from '@/components/dashboard/services/ServiceFormDialog';
import { DeleteServiceDialog } from '@/components/dashboard/services/DeleteServiceDialog';
import { CategoriesTab } from '@/components/dashboard/services/CategoriesTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import type { Service } from '@/components/dashboard/services/types';

type FilterActive = 'all' | 'active' | 'inactive';

// Map hook's AdminService → local Service shape (they are structurally identical)
const toService = (s: AdminService): Service => s as Service;

export default function AdminServicesPage() {
  const t = useTranslations('adminServices');

  const {
    services: rawServices,
    pagination,
    loadingList,
    stats,
    loadingStats,
    fetchServices,
    fetchStats,
    createService,
    updateService,
    deleteService,
    restoreService,
  } = useAdminServices();

  // Map to local type
  const services: Service[] = rawServices.map(toService);

  // Filters / pagination
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [filterActive, setFilterActive] = useState<FilterActive>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Build query params from state
  const buildFilters = useCallback((): ServiceFiltersQuery => {
    const f: ServiceFiltersQuery = {
      page,
      limit: 10,
    };
    if (debouncedSearch) f.search = debouncedSearch;
    if (filterActive === 'active') f.isActive = true;
    if (filterActive === 'inactive') f.isActive = false;
    if (filterCategory !== 'all') f.category = filterCategory;
    return f;
  }, [debouncedSearch, filterActive, filterCategory, page]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchServices(buildFilters());
  }, [fetchServices, buildFilters]);

  // Handlers
  const handleEdit = (svc: Service) => setEditService(svc);

  const handleDeleteClick = (svc: Service) => {
    setDeleteTarget(svc);
    setDeleteOpen(true);
  };

  const handleRestore = async (svc: Service) => {
    await restoreService(svc.id);
    refresh();
  };

  const handleFilterChange = (f: FilterActive) => {
    setFilterActive(f);
    setPage(1);
  };

  const handleCategoryChange = (c: string) => {
    setFilterCategory(c);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // Refresh both list and stat cards after mutations
  const refresh = useCallback(() => {
    fetchServices(buildFilters());
    fetchStats();
  }, [fetchServices, buildFilters, fetchStats]);

  // Form dialog callbacks
  const handleCreate = async (dto: Parameters<typeof createService>[0]) => {
    await createService(dto);
    refresh();
  };

  const handleUpdate = async (id: string, dto: Parameters<typeof updateService>[1]) => {
    await updateService(id, dto);
    refresh();
  };

  // Delete dialog callback
  const handleDeleteConfirm = async (id: string) => {
    await deleteService(id);
    refresh();
  };

  return (
    <div className="p-8 space-y-6">
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-[320px] grid-cols-2 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 cursor-pointer">{t('tabs.services')}</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 cursor-pointer">{t('tabs.categories')}</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6 mt-6 focus-visible:outline-none">
          {/* Stat Cards */}
          <ServiceStatCards stats={stats} isLoading={loadingStats} />

          {/* Table */}
          <ServiceTable
            services={services}
            isLoading={loadingList}
            page={page}
            onPageChange={setPage}
            totalPages={pagination.totalPages}
            total={pagination.total}
            filterActive={filterActive}
            onFilterChange={handleFilterChange}
            filterCategory={filterCategory}
            onCategoryChange={handleCategoryChange}
            search={search}
            onSearchChange={handleSearchChange}
            onAddService={() => setAddOpen(true)}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onRestore={handleRestore}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-6 focus-visible:outline-none">
          <CategoriesTab />
        </TabsContent>
      </Tabs>

      {/* Add / Edit dialog */}
      <ServiceFormDialog
        open={addOpen || editService !== null}
        onOpenChange={(v) => {
          if (!v) {
            setAddOpen(false);
            setEditService(null);
          }
        }}
        service={editService}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* Delete confirmation */}
      <DeleteServiceDialog
        service={deleteTarget}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
