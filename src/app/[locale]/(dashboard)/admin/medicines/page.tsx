'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminMedicines } from '@/lib/hooks/admin/useAdminMedicines';
import { useDebounce } from '@/lib/hooks/core/useDebounce';
import { type AdminMedicine, type MedicineFiltersQuery } from '@/lib/api/admin/admin-medicines';
import { MedicineStatCards } from '@/components/dashboard/medicines/MedicineStatCards';
import { MedicineTable } from '@/components/dashboard/medicines/MedicineTable';
import { MedicineFormDialog } from '@/components/dashboard/medicines/MedicineFormDialog';
import { DeleteMedicineDialog } from '@/components/dashboard/medicines/DeleteMedicineDialog';
import { MedicineDetailDialog } from '@/components/dashboard/medicines/MedicineDetailDialog';

type FilterActive = 'all' | 'active' | 'inactive';

export default function AdminMedicinesPage() {

  const {
    medicines,
    pagination,
    loadingList,
    stats,
    loadingStats,
    fetchMedicines,
    fetchStats,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    restoreMedicine,
  } = useAdminMedicines();

  // Filters / pagination
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [filterActive, setFilterActive] = useState<FilterActive>('all');

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editMedicine, setEditMedicine] = useState<AdminMedicine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminMedicine | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailMedicine, setDetailMedicine] = useState<AdminMedicine | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Build query params from state
  const buildFilters = useCallback((): MedicineFiltersQuery => {
    const f: MedicineFiltersQuery = {
      page,
      limit: 10,
    };
    if (debouncedSearch) f.search = debouncedSearch;
    if (filterActive === 'active') f.isActive = true;
    if (filterActive === 'inactive') f.isActive = false;
    return f;
  }, [debouncedSearch, filterActive, page]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchMedicines(buildFilters());
  }, [fetchMedicines, buildFilters]);

  // Handlers
  const handleEdit = (med: AdminMedicine) => setEditMedicine(med);

  const handleDeleteClick = (med: AdminMedicine) => {
    setDeleteTarget(med);
    setDeleteOpen(true);
  };

  const handleViewDetail = (med: AdminMedicine) => {
    setDetailMedicine(med);
    setDetailOpen(true);
  };

  const handleRestore = async (med: AdminMedicine) => {
    await restoreMedicine(med.id);
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
    fetchMedicines(buildFilters());
    fetchStats();
  }, [fetchMedicines, buildFilters, fetchStats]);

  // Form dialog callbacks
  const handleCreate = async (dto: Parameters<typeof createMedicine>[0]) => {
    await createMedicine(dto);
    refresh();
  };

  const handleUpdate = async (id: string, dto: Parameters<typeof updateMedicine>[1]) => {
    await updateMedicine(id, dto);
    refresh();
  };

  // Delete dialog callback
  const handleDeleteConfirm = async (id: string) => {
    await deleteMedicine(id);
    refresh();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-6 focus-visible:outline-none">
        {/* Stat Cards */}
        <MedicineStatCards stats={stats} isLoading={loadingStats} />

        {/* Table */}
        <MedicineTable
          medicines={medicines}
          isLoading={loadingList}
          page={page}
          onPageChange={setPage}
          totalPages={pagination.totalPages}
          total={pagination.total}
          filterActive={filterActive}
          onFilterChange={handleFilterChange}
          search={search}
          onSearchChange={handleSearchChange}
          onAddMedicine={() => setAddOpen(true)}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onRestore={handleRestore}
          onViewDetail={handleViewDetail}
        />
      </div>

      {/* Add / Edit dialog */}
      <MedicineFormDialog
        open={addOpen || editMedicine !== null}
        onOpenChange={(v) => {
          if (!v) {
            setAddOpen(false);
            setEditMedicine(null);
          }
        }}
        medicine={editMedicine}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* Delete confirmation */}
      <DeleteMedicineDialog
        medicine={deleteTarget}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
      />

      {/* Detail dialog */}
      <MedicineDetailDialog
        medicine={detailMedicine}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
