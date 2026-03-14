'use client';

import { useState, useEffect, useCallback } from 'react';
import { CircleNotchIcon } from '@phosphor-icons/react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useAdminPatients } from '@/lib/hooks/useAdminPatients';
import { PatientKpiCards } from '@/components/dashboard/patients/PatientKpiCards';
import { PatientFilters } from '@/components/dashboard/patients/PatientFilters';
import { PatientTable } from '@/components/dashboard/patients/PatientTable';
import { PatientPagination } from '@/components/dashboard/patients/PatientPagination';
import { PatientQuickViewDrawer } from '@/components/dashboard/patients/PatientQuickViewDrawer';
import { PatientAddModal } from '@/components/dashboard/patients/PatientAddModal';
import type {
  PatientGender,
  PatientStatus,
  BloodType,
} from '@/components/dashboard/patients/types';
import type { PatientRow } from '@/components/dashboard/patients/PatientTable';

const LIMIT = 10;

export default function AdminPatientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  // Quick view state
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Add Patient Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter state
  const [selectedGenders, setSelectedGenders] = useState<Set<PatientGender>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<PatientStatus>>(new Set());
  const [selectedBloodTypes, setSelectedBloodTypes] = useState<Set<BloodType>>(new Set());

  const {
    patients,
    pagination,
    loadingList,
    fetchPatients,
    kpiData,
    loadingKpi,
    fetchStats,
    createPatient,
  } = useAdminPatients();

  // Fetch KPI stats once on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Re-fetch list whenever search (debounced), page, or filters change
  useEffect(() => {
    fetchPatients({
      search: debouncedSearch || undefined,
      page,
      limit: LIMIT,
      gender:    selectedGenders.size    > 0 ? [...selectedGenders].join(',')    : undefined,
      status:    selectedStatuses.size   > 0 ? [...selectedStatuses].join(',')   : undefined,
      bloodType: selectedBloodTypes.size > 0 ? [...selectedBloodTypes].join(',') : undefined,
    });
  }, [fetchPatients, debouncedSearch, page, selectedGenders, selectedStatuses, selectedBloodTypes]);

  // Toggle helpers — also reset to page 1 so results are consistent
  const toggleGender = useCallback((g: PatientGender) => {
    setPage(1);
    setSelectedGenders((prev) => {
      const next = new Set(prev);
      if (next.has(g)) { next.delete(g); } else { next.add(g); }
      return next;
    });
  }, []);

  const toggleStatus = useCallback((s: PatientStatus) => {
    setPage(1);
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(s)) { next.delete(s); } else { next.add(s); }
      return next;
    });
  }, []);

  const toggleBloodType = useCallback((bt: BloodType) => {
    setPage(1);
    setSelectedBloodTypes((prev) => {
      const next = new Set(prev);
      if (next.has(bt)) { next.delete(bt); } else { next.add(bt); }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setPage(1);
    setSelectedGenders(new Set());
    setSelectedStatuses(new Set());
    setSelectedBloodTypes(new Set());
  }, []);

  return (
    <div className="p-8 space-y-8">
      {/* KPI Cards */}
      <PatientKpiCards data={kpiData} loading={loadingKpi} />

      {/* Patient Records Table */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden flex flex-col relative min-h-100">
        {loadingList && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <CircleNotchIcon size={32} className="text-[#1392ec] animate-spin" />
          </div>
        )}

        <PatientFilters
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          selectedGenders={selectedGenders}
          selectedStatuses={selectedStatuses}
          selectedBloodTypes={selectedBloodTypes}
          onToggleGender={toggleGender}
          onToggleStatus={toggleStatus}
          onToggleBloodType={toggleBloodType}
          onClearFilters={clearFilters}
          onAddPatient={() => {
            setIsAddModalOpen(true);
          }}
          onExport={() => {
            // TODO: trigger export
          }}
        />

        <PatientTable
          patients={patients}
          loading={loadingList}
          onViewProfile={(patient) => {
            setSelectedPatient(patient);
            setIsQuickViewOpen(true);
          }}
          onMedicalHistory={(patient) => {
            // TODO: open medical history drawer
            console.log('history', patient.id);
          }}
          onBookAppointment={(patient) => {
            // TODO: open booking dialog
            console.log('book', patient.id);
          }}
          onEdit={(patient) => {
            // TODO: open edit patient dialog
            console.log('edit', patient.id);
          }}
        />

        <PatientPagination
          page={page}
          limit={LIMIT}
          totalItems={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      </div>

      <PatientQuickViewDrawer
        open={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        patient={selectedPatient}
      />

      <PatientAddModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data) => {
          await createPatient(data);
          // Refresh list after successful creation
          fetchPatients({
            search: debouncedSearch || undefined,
            page: 1, // go back to page 1 to see the new patient
            limit: LIMIT,
            gender:    selectedGenders.size    > 0 ? [...selectedGenders].join(',')    : undefined,
            status:    selectedStatuses.size   > 0 ? [...selectedStatuses].join(',')   : undefined,
            bloodType: selectedBloodTypes.size > 0 ? [...selectedBloodTypes].join(',') : undefined,
          });
          setPage(1);
        }}
      />
    </div>
  );
}
