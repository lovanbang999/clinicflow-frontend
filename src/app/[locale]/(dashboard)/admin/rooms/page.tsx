'use client';

import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  PlusIcon, PencilSimpleIcon, TrashIcon, CheckCircleIcon, XCircleIcon,
  MagnifyingGlassIcon, CaretLeftIcon, CaretRightIcon, DoorIcon,
} from '@phosphor-icons/react';
import { useAdminRooms } from '@/lib/hooks/admin/useAdminRooms';
import { useDebounce } from '@/lib/hooks/core/useDebounce';
import { useTranslations } from 'next-intl';
import { AdminRoom, CreateRoomDto } from '@/lib/api/admin/admin-rooms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';

const ROOM_TYPES = [
  'CONSULTATION', 'ULTRASOUND', 'PROCEDURE', 'LAB', 'WAITING'
] as const;

type FormData = {
  name: string;
  type: string;
  floor: string;
  capacity: string;
  notes: string;
  isActive: boolean;
};

const DEFAULT_FORM: FormData = {
  name: '', type: 'CONSULTATION', floor: '', capacity: '1', notes: '', isActive: true,
};

const LIMIT = 10;

export default function AdminRoomsPage() {
  const t = useTranslations('adminRooms');

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<AdminRoom | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<AdminRoom | null>(null);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { rooms, pagination, isLoading, fetchRooms, createRoom, updateRoom, deleteRoom } = useAdminRooms();
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchRooms({ page, limit: LIMIT, search: debouncedSearch || undefined, isActive: activeFilter });
  }, [fetchRooms, page, activeFilter, debouncedSearch]);

  const refresh = () => fetchRooms({ page, limit: LIMIT, search: search || undefined, isActive: activeFilter });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRooms({ page: 1, limit: LIMIT, search: search || undefined, isActive: activeFilter });
  };

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData(DEFAULT_FORM);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (room: AdminRoom) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      type: room.type ?? 'CONSULTATION',
      floor: room.floor ?? '',
      capacity: String(room.capacity ?? 1),
      notes: room.notes ?? '',
      isActive: room.isActive,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const dto: CreateRoomDto = {
      name: formData.name,
      type: formData.type || undefined,
      floor: formData.floor || undefined,
      capacity: parseInt(formData.capacity, 10) || 1,
      notes: formData.notes || undefined,
      isActive: formData.isActive,
    };

    let success = false;
    if (editingRoom) {
      const result = await updateRoom(editingRoom.id, dto);
      if (result) { toast.success(t('toast.updateSuccess')); success = true; }
    } else {
      const result = await createRoom(dto);
      if (result) { toast.success(t('toast.createSuccess')); success = true; }
    }

    if (success) { setIsFormOpen(false); refresh(); }
    setIsSubmitting(false);
  };

  const handleOpenDelete = (room: AdminRoom) => {
    setDeletingRoom(room);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRoom) return;
    const success = await deleteRoom(deletingRoom.id);
    setIsDeleteOpen(false);
    if (success) { toast.success(t('toast.deleteSuccess')); refresh(); }
  };

  const from = rooms.length > 0 ? (page - 1) * LIMIT + 1 : 0;
  const to = pagination ? Math.min(page * LIMIT, pagination.total) : 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111518] flex items-center gap-2">
            <DoorIcon className="w-7 h-7 text-[#1392ec]" weight="fill" />
            {t('title')}
          </h1>
          <p className="text-[#64748b] text-sm mt-1">{t('description')}</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-[#1392ec] hover:bg-[#1392ec]/90 text-white rounded-xl">
          <PlusIcon className="w-5 h-5 mr-2" />
          {t('addRoom')}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-[#e5e7eb]">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </form>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: t('filterAll'), value: undefined },
            { label: t('filterActive'), value: true },
            { label: t('filterInactive'), value: false },
          ].map((f) => (
            <button
              key={String(f.value)}
              onClick={() => { setActiveFilter(f.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeFilter === f.value
                  ? 'bg-[#1392ec] text-white'
                  : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#64748b] bg-[#f8fafc] uppercase border-b border-[#e5e7eb]">
              <tr>
                <th className="px-6 py-4 font-semibold">{t('table.name')}</th>
                <th className="px-6 py-4 font-semibold">{t('table.type')}</th>
                <th className="px-6 py-4 font-semibold">{t('table.relatedService')}</th>
                <th className="px-6 py-4 font-semibold">{t('table.floor')}</th>
                <th className="px-6 py-4 font-semibold">{t('table.capacity')}</th>
                <th className="px-6 py-4 font-semibold">{t('table.scheduleCount')}</th>
                <th className="px-6 py-4 font-semibold">{t('table.isActive')}</th>
                <th className="px-6 py-4 font-semibold text-right">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {isLoading && rooms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    <Spinner className="w-6 h-6 mx-auto mb-2" />
                    {t('tableState.loading')}
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    <DoorIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    {t('tableState.empty')}
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#111518]">{room.name}</td>
                    <td className="px-6 py-4 text-[#64748b]">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#f1f5f9] text-xs font-medium">
                        {t(`roomType.${room.type}` as Parameters<typeof t>[0])}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#64748b] text-xs max-w-[200px] truncate" title={t(`relatedServices.${room.type}` as Parameters<typeof t>[0])}>
                      {t(`relatedServices.${room.type}` as Parameters<typeof t>[0])}
                    </td>
                    <td className="px-6 py-4 text-[#64748b]">{room.floor || '—'}</td>
                    <td className="px-6 py-4 text-[#64748b]">{room.capacity}</td>
                    <td className="px-6 py-4 text-[#64748b]">
                      <div className="flex flex-col gap-1.5 text-xs font-semibold">
                        <div className="flex items-center gap-1">
                          <span className="text-[#94a3b8] font-normal">{t('table.scheduleLabel')}</span>
                          <Link href="/admin/schedules" className="text-[#1392ec] hover:underline">
                            {room._count?.scheduleSlots ?? 0}
                          </Link>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[#94a3b8] font-normal">{t('table.doctorLabel')}</span>
                          <Link href="/admin/doctors" className="text-emerald-600 hover:underline">
                            {room._count?.doctorProfiles ?? 0}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {room.isActive ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-[#1392ec]/10 text-[#1392ec]">
                          <CheckCircleIcon weight="fill" className="w-3.5 h-3.5" />
                          {t('status.active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                          <XCircleIcon weight="fill" className="w-3.5 h-3.5" />
                          {t('status.inactive')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => handleOpenEdit(room)}
                        className="text-[#1392ec] hover:text-[#1392ec] hover:bg-[#1392ec]/10 rounded-lg px-2"
                      >
                        <PencilSimpleIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => handleOpenDelete(room)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-2"
                        disabled={!room.isActive}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#e5e7eb] flex items-center justify-between">
          <span className="text-xs text-[#64748b] font-medium">
            {t('pagination.showing')}{' '}
            <span className="text-[#111518] font-bold">{rooms.length > 0 ? `${from}–${to}` : '0'}</span>{' '}
            {t('pagination.of')}{' '}
            <span className="text-[#111518] font-bold">{pagination?.total || 0}</span>{' '}
            {t('pagination.results')}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-3 py-1.5 border border-[#e5e7eb] rounded-lg text-xs font-medium text-[#64748b] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <CaretLeftIcon size={12} weight="bold" />
              {t('pagination.prev')}
            </button>
            <button
              disabled={!pagination || page >= pagination.totalPages}
              onClick={() => setPage(p => Math.min(pagination?.totalPages || 1, p + 1))}
              className="flex items-center gap-1 px-3 py-1.5 border border-[#e5e7eb] rounded-lg text-xs font-medium text-[#111518] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {t('pagination.next')}
              <CaretRightIcon size={12} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-full sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingRoom ? t('form.editTitle') : t('form.addTitle')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="room-name" className="text-sm font-semibold text-[#111518]">{t('form.name')}</Label>
              <Input
                id="room-name"
                placeholder={t('form.namePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="rounded-xl border-[#e5e7eb] focus:border-[#1392ec] h-11"
              />
            </div>

            {/* Type + Floor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="room-type" className="text-sm font-semibold text-[#111518]">{t('form.type')}</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger id="room-type" className="h-11 rounded-xl border-[#e5e7eb] w-full">
                    <SelectValue placeholder={t('form.typePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {ROOM_TYPES.map((rt) => (
                      <SelectItem key={rt} value={rt}>
                        {t(`roomType.${rt}` as Parameters<typeof t>[0])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-[#64748b] mt-1 italic">
                  {t('table.relatedService')}: {t(`relatedServices.${formData.type}` as Parameters<typeof t>[0])}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="room-floor" className="text-sm font-semibold text-[#111518]">{t('form.floor')}</Label>
                <Input
                  id="room-floor"
                  placeholder={t('form.floorPlaceholder')}
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="rounded-xl border-[#e5e7eb] focus:border-[#1392ec] h-11"
                />
              </div>
            </div>

            {/* Capacity */}
            <div className="space-y-1.5">
              <Label htmlFor="room-capacity" className="text-sm font-semibold text-[#111518]">{t('form.capacity')}</Label>
              <Input
                id="room-capacity"
                type="number"
                min={1}
                placeholder={t('form.capacityPlaceholder')}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="rounded-xl border-[#e5e7eb] focus:border-[#1392ec] h-11"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="room-notes" className="text-sm font-semibold text-[#111518]">{t('form.notes')}</Label>
              <Textarea
                id="room-notes"
                placeholder={t('form.notesPlaceholder')}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="rounded-xl border-[#e5e7eb] focus:border-[#1392ec] min-h-[80px] resize-none"
              />
            </div>

            {/* isActive toggle */}
            <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-xl border border-[#e5e7eb]">
              <div>
                <Label htmlFor="room-active" className="text-sm font-semibold text-[#111518] cursor-pointer block">
                  {t('form.isActive')}
                </Label>
                <p className="text-[11px] text-[#64748b] mt-0.5">{t('form.isActiveHint')}</p>
              </div>
              <Switch
                id="room-active"
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e5e7eb] pt-5">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-xl px-6 h-11">
                {t('form.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#1392ec] hover:bg-[#1392ec]/90 text-white rounded-xl px-8 h-11 font-semibold"
              >
                {isSubmitting ? <Spinner className="w-4 h-4 mr-2" /> : null}
                {t('form.save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteModal.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteModal.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t('deleteModal.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              {t('deleteModal.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
