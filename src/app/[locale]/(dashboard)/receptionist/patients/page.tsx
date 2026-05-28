'use client';

import {
  MagnifyingGlassIcon,
  PlusIcon,
  UserPlusIcon,
  CircleNotchIcon
} from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/lib/hooks/core/useDebounce';
import { useReceptionistPatients } from '@/lib/hooks/receptionist/useReceptionistPatients';
import { PatientStatsCards } from '@/components/receptionist/patients/PatientStatsCards';
import { PatientTable } from '@/components/receptionist/patients/PatientTable';
import { PatientPagination } from '@/components/receptionist/patients/PatientPagination';
import { PatientRegistrationModal } from '@/components/receptionist/patients/PatientRegistrationModal';
import { PatientEditModal } from '@/components/receptionist/patients/PatientEditModal';
import { PatientDetailDrawer } from '@/components/receptionist/patients/PatientDetailDrawer';
import { TempPasswordDisplayModal } from '@/components/receptionist/patients/TempPasswordDisplayModal';
import { RegisterPatientDto, CreateGuestPatientDto } from '@/lib/api/auth/users';
import { User } from '@/types';
import { toast } from 'sonner';

const LIMIT = 10;

export default function ReceptionistPatientsPage() {
  const t = useTranslations('receptionistPatients');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regMode, setRegMode] = useState<'standard' | 'guest'>('standard');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [tempPasswordData, setTempPasswordData] = useState<{ password?: string; fullName?: string; email?: string } | null>(null);

  const {
    patients,
    pagination,
    loadingList,
    stats,
    loadingStats,
    fetchPatients,
    fetchStats,
    registerPatient,
    createGuestPatient,
    updatePatient,
  } = useReceptionistPatients();

  // Load stats and patients on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchPatients({
      search: debouncedSearch || undefined,
      page,
      limit: LIMIT,
    });
  }, [fetchPatients, debouncedSearch, page]);

  // Handlers
  const handleView = (patient: User) => {
    setSelectedPatient(patient);
    setIsDetailOpen(true);
  };

  const handleEdit = (patient: User) => {
    setSelectedPatient(patient);
    setIsEditOpen(true);
  };

  const handleRegisterStandard = async (data: RegisterPatientDto) => {
    try {
      const created = await registerPatient(data);
      if (created && created.tempPassword) {
        setTempPasswordData({
          password: created.tempPassword,
          fullName: created.fullName,
          email: created.email || data.email,
        });
      } else {
        toast.success(t('messages.registerSuccess'));
      }
      fetchPatients({ search: debouncedSearch, page, limit: LIMIT });
      fetchStats();
    } catch {
      toast.error(t('messages.registerError'));
    }
  };

  const handleRegisterGuest = async (data: CreateGuestPatientDto) => {
    try {
      await createGuestPatient(data);
      toast.success(t('messages.guestSuccess'));
      fetchPatients({ search: debouncedSearch, page, limit: LIMIT });
      fetchStats();
    } catch {
      toast.error(t('messages.guestError'));
    }
  };

  const handleUpdate = async (id: string, data: Partial<RegisterPatientDto>) => {
    try {
      await updatePatient(id, data);
      toast.success(t('messages.updateSuccess'));
      fetchPatients({ search: debouncedSearch, page, limit: LIMIT });
    } catch {
      toast.error(t('messages.updateError'));
    }
  };

  const handleBook = (patient: User) => {
    toast.info(t('messages.bookDev', { name: patient.fullName }));
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111518]">{t('title')}</h1>
          <p className="text-sm text-[#64748b] mt-1">{t('description')}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={loadingStats}
            onClick={() => {
              setRegMode('guest');
              setIsRegisterOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e5e7eb] text-[#111518] text-sm font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <UserPlusIcon size={20} weight="bold" className="text-[#1392ec]" />
            {t('actions.guest')}
          </button>

          <button
            disabled={loadingStats}
            onClick={() => {
              setRegMode('standard');
              setIsRegisterOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1392ec] text-white text-sm font-bold rounded-xl hover:bg-[#1180d0] transition-all shadow-lg shadow-[#1392ec]/20 disabled:opacity-50 cursor-pointer"
          >
            <PlusIcon size={20} weight="bold" />
            {t('actions.register')}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <PatientStatsCards stats={stats} loading={loadingStats} />

      {/* Main Table Layer */}
      <div className="bg-white border border-[#f0f3f4] rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-[#f0f3f4] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              size={18}
            />
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all"
            />
            {loadingList && (
              <CircleNotchIcon
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#1392ec]"
                size={16}
              />
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1">
          <PatientTable
            patients={patients}
            loading={loadingList}
            onView={handleView}
            onEdit={handleEdit}
          />
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#f0f3f4] bg-[#f8fafc]/50">
          <PatientPagination
            page={page}
            limit={LIMIT}
            totalItems={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Modals & Drawers */}
      <PatientRegistrationModal
        open={isRegisterOpen}
        initialTab={regMode}
        onClose={() => setIsRegisterOpen(false)}
        onSubmitStandard={handleRegisterStandard}
        onSubmitGuest={handleRegisterGuest}
      />

      <PatientEditModal
        open={isEditOpen}
        patient={selectedPatient}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedPatient(null);
        }}
        onSubmit={handleUpdate}
      />

      <PatientDetailDrawer
        open={isDetailOpen}
        patient={selectedPatient}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedPatient(null);
        }}
        onEdit={() => {
          setIsDetailOpen(false);
          setIsEditOpen(true);
        }}
        onBook={() => {
          if (selectedPatient) handleBook(selectedPatient);
        }}
      />

      <TempPasswordDisplayModal
        isOpen={!!tempPasswordData}
        onClose={() => setTempPasswordData(null)}
        tempPasswordData={tempPasswordData}
      />
    </div>
  );
}
