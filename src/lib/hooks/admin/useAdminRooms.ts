import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { adminRoomsApi, AdminRoom, AdminRoomFilters, CreateRoomDto, UpdateRoomDto, AdminRoomPagination } from '@/lib/api/admin/admin-rooms';

export function useAdminRooms() {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [pagination, setPagination] = useState<AdminRoomPagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRooms = useCallback(async (filters?: AdminRoomFilters) => {
    setIsLoading(true);
    try {
      const res = await adminRoomsApi.getRooms(filters);
      setRooms(res.rooms);
      setPagination(res.pagination);
    } catch {
      toast.error('Không thể tải danh sách phòng');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRoom = useCallback(async (dto: CreateRoomDto): Promise<AdminRoom | null> => {
    try {
      const room = await adminRoomsApi.createRoom(dto);
      return room;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tạo phòng thất bại';
      toast.error(message);
      return null;
    }
  }, []);

  const updateRoom = useCallback(async (id: string, dto: UpdateRoomDto): Promise<AdminRoom | null> => {
    try {
      const room = await adminRoomsApi.updateRoom(id, dto);
      return room;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cập nhật phòng thất bại';
      toast.error(message);
      return null;
    }
  }, []);

  const deleteRoom = useCallback(async (id: string): Promise<boolean> => {
    try {
      await adminRoomsApi.deleteRoom(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ngừng hoạt động phòng thất bại';
      toast.error(message);
      return false;
    }
  }, []);

  return {
    rooms,
    pagination,
    isLoading,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
  };
}
