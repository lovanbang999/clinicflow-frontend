'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminServices } from '@/lib/hooks/useAdminServices';
import { type AdminService, type ServiceFiltersQuery } from '@/lib/api/admin-services';
import { ServiceStatCards } from '@/components/dashboard/services/ServiceStatCards';
import { ServiceTable } from '@/components/dashboard/services/ServiceTable';
import { ServiceFormDialog } from '@/components/dashboard/services/ServiceFormDialog';
import { DeleteServiceDialog } from '@/components/dashboard/services/DeleteServiceDialog';
import type { Service } from '@/components/dashboard/services/types';

type FilterActive = 'all' | 'active' | 'inactive';

// Map hook's AdminService → local Service shape (they are structurally identical)
const toService = (s: AdminService): Service => s as Service;

export default function AdminServicesPage() {
  const {
    services: rawServices,
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
  const [page, setPage] = useState(1);
  const [filterActive, setFilterActive] = useState<FilterActive>('all');

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Build query params from state
  const buildFilters = useCallback((): ServiceFiltersQuery => {
    const f: ServiceFiltersQuery = {};
    if (search) f.search = search;
    if (filterActive === 'active') f.isActive = true;
    if (filterActive === 'inactive') f.isActive = false;
    return f;
  }, [search, filterActive]);

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
    <div className="p-8 space-y-8">
      {/* Stat Cards */}
      <ServiceStatCards stats={stats} isLoading={loadingStats} />

      {/* Table */}
      <ServiceTable
        services={services}
        isLoading={loadingList}
        page={page}
        onPageChange={setPage}
        filterActive={filterActive}
        onFilterChange={handleFilterChange}
        search={search}
        onSearchChange={handleSearchChange}
        onAddService={() => setAddOpen(true)}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onRestore={handleRestore}
      />

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
