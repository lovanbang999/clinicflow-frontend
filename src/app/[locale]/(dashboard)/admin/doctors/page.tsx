'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { DoctorStatCards } from '@/components/dashboard/doctors/DoctorStatCards';
import { DoctorTable } from '@/components/dashboard/doctors/DoctorTable';
import { AddDoctorDialog } from '@/components/dashboard/doctors/AddDoctorDialog';
import { EditDoctorDialog } from '@/components/dashboard/doctors/EditDoctorDialog';
import { DeleteDoctorDialog } from '@/components/dashboard/doctors/DeleteDoctorDialog';
import { DoctorMoreMenu } from '@/components/dashboard/doctors/DoctorMoreMenu';
import {
  MOCK_DOCTORS,
  type DoctorStatus,
  type Specialty,
  type Doctor,
} from '@/components/dashboard/doctors/types';
import { BackendUser } from '@/types';
import { useAdminDoctors } from '@/lib/hooks/useAdminDoctors';

const LIMIT = 10;

// Helper: map BackendUser → local Doctor shape for DoctorTable (mock-compatible)
function toLocalDoctor(u: BackendUser): Doctor {
  const p = u.doctorProfile;
  const specialty = (p?.specialties?.[0] ?? 'Cardiology') as Specialty;
  const status: DoctorStatus = u.isActive ? 'Active' : 'Inactive';
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    avatar: u.avatar,
    specialty,
    experience: p?.yearsOfExperience ?? 0,
    status,
  };
}

export default function AdminDoctorsPage() {
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<Specialty>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<DoctorStatus>>(new Set());
  const [page, setPage] = useState(1);

  // API hook
  const {
    doctors: apiBDoctors,
    pagination,
    loadingList,
    fetchDoctors,
    stats,
    loadingStats,
    fetchStats,
    toggleDoctorStatus,
  } = useAdminDoctors();

  // Whether we have real API data yet (true after first successful fetch)
  const [hasApiData, setHasApiData] = useState(false);

  const doFetch = useCallback(() => {
    fetchDoctors({ page, limit: LIMIT }).then(() => setHasApiData(true));
  }, [fetchDoctors, page]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  // Fetch stats once on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);

  const [editDoctor, setEditDoctor] = useState<BackendUser | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [deleteDoctor, setDeleteDoctorTarget] = useState<BackendUser | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // More menu
  const moreAnchor = useRef<HTMLButtonElement | null>(null);
  const [moreDoctor, setMoreDoctor] = useState<BackendUser | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  // Filter handlers
  const toggleSpecialty = (sp: Specialty) => {
    setPage(1);
    setSelectedSpecialties((prev) => {
      const next = new Set(prev);
      if (next.has(sp)) next.delete(sp); else next.add(sp);
      return next;
    });
  };

  const toggleStatus = (st: DoctorStatus) => {
    setPage(1);
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(st)) next.delete(st); else next.add(st);
      return next;
    });
  };

  const clearFilters = () => {
    setPage(1);
    setSelectedSpecialties(new Set());
    setSelectedStatuses(new Set());
  };

  // Determine what doctors to display
  // Use API data if available, fall back to mock data for initial load / dev
  const displayDoctors: Doctor[] = hasApiData
    ? (apiBDoctors ?? []).map(toLocalDoctor)
    : MOCK_DOCTORS;

  const filtered = displayDoctors.filter((d) => {
    const matchSpecialty = selectedSpecialties.size === 0 || selectedSpecialties.has(d.specialty);
    const matchStatus = selectedStatuses.size === 0 || selectedStatuses.has(d.status);
    return matchSpecialty && matchStatus;
  });

  const totalPages = hasApiData
    ? pagination.totalPages
    : Math.max(1, Math.ceil(filtered.length / LIMIT));

  const paged = hasApiData
    ? filtered  // API already paginates
    : filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const totalCount = hasApiData ? pagination.total : filtered.length;

  // Action handlers
  const handleAddDoctor = () => setAddOpen(true);

  // For edit and more, we need the BackendUser. Map via id.
  const findBackendUser = (doctor: Doctor): BackendUser | undefined =>
    apiBDoctors.find((u) => u.id === doctor.id);

  const handleEdit = (doctor: Doctor) => {
    const bu = findBackendUser(doctor);
    if (!bu) return;
    setEditDoctor(bu);
    setEditOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSchedule = (_doctor: Doctor) => {
    // TODO: navigate to schedule page for this doctor
  };

  const handleMore = (doctor: Doctor, buttonRef: React.RefObject<HTMLButtonElement | null>) => {
    const bu = findBackendUser(doctor);
    if (!bu) return;
    moreAnchor.current = buttonRef.current;
    setMoreDoctor(bu);
    setMoreOpen(true);
  };

  const handleToggleStatus = async (doctor: BackendUser) => {
    await toggleDoctorStatus(doctor.id, !doctor.isActive);
    doFetch();
  };

  const handleDelete = (doctor: BackendUser) => {
    setDeleteDoctorTarget(doctor);
    setDeleteOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleViewDetail = (_doctor: BackendUser) => {
    // TODO: open detail side panel / navigate to detail page
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleViewSchedule = (_doctor: BackendUser) => {
    // TODO: navigate to schedule page
  };

  return (
    <div className="p-8 space-y-8">
      {/* Stat Cards */}
      <DoctorStatCards stats={stats} isLoading={loadingStats} />

      {/* Doctor Directory Table */}
      <DoctorTable
        doctors={paged}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        isLoading={loadingList}
        selectedSpecialties={selectedSpecialties}
        selectedStatuses={selectedStatuses}
        onToggleSpecialty={toggleSpecialty}
        onToggleStatus={toggleStatus}
        onClearFilters={clearFilters}
        onPrevPage={() => setPage((p) => p - 1)}
        onNextPage={() => setPage((p) => p + 1)}
        onAddDoctor={handleAddDoctor}
        onSchedule={handleSchedule}
        onEdit={handleEdit}
        onMore={handleMore}
      />

      {/* Add Doctor Dialog */}
      <AddDoctorDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onDoctorAdded={() => {
          setAddOpen(false);
          doFetch();
        }}
      />

      {/* Edit Doctor Dialog */}
      <EditDoctorDialog
        doctor={editDoctor}
        open={editOpen}
        onOpenChange={setEditOpen}
        onDoctorUpdated={() => {
          setEditOpen(false);
          doFetch();
        }}
      />

      {/* Delete Doctor Dialog */}
      <DeleteDoctorDialog
        doctor={deleteDoctor}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          setDeleteOpen(false);
          doFetch();
        }}
      />

      {/* More Menu */}
      {moreDoctor && (
        <DoctorMoreMenu
          doctor={moreDoctor}
          anchorRef={moreAnchor as React.RefObject<HTMLButtonElement | null>}
          open={moreOpen}
          onClose={() => setMoreOpen(false)}
          onViewDetail={handleViewDetail}
          onViewSchedule={handleViewSchedule}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
