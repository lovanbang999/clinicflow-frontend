import { apiClient } from '@/lib/api/core/client';
import { ApiResponse } from '@/types';

export interface AdminRoom {
  id: string;
  name: string;
  type: string;
  floor?: string | null;
  capacity: number;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { scheduleSlots: number };
}

export interface AdminRoomPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminRoomFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateRoomDto {
  name: string;
  type?: string;
  floor?: string;
  capacity?: number;
  notes?: string;
  isActive?: boolean;
}

export type UpdateRoomDto = Partial<CreateRoomDto>;

export const adminRoomsApi = {
  /**
   * Fetch paginated list of rooms
   */
  getRooms: async (filters?: AdminRoomFilters): Promise<{ rooms: AdminRoom[]; pagination: AdminRoomPagination }> => {
    const res = await apiClient.get<ApiResponse<{ rooms: AdminRoom[]; pagination: AdminRoomPagination }>>('/admin/rooms', {
      params: filters,
    });
    if (!res.data.data) throw new Error('Failed to fetch rooms');
    return res.data.data;
  },

  /**
   * Fetch all active rooms (used in schedule dropdowns)
   */
  getActiveRooms: async (): Promise<AdminRoom[]> => {
    const res = await adminRoomsApi.getRooms({ isActive: true, limit: 100 });
    return res.rooms;
  },

  /**
   * Create a new room
   */
  createRoom: async (dto: CreateRoomDto): Promise<AdminRoom> => {
    const res = await apiClient.post<ApiResponse<AdminRoom>>('/admin/rooms', dto);
    if (!res.data.data) throw new Error('Failed to create room');
    return res.data.data;
  },

  /**
   * Update a room
   */
  updateRoom: async (id: string, dto: UpdateRoomDto): Promise<AdminRoom> => {
    const res = await apiClient.patch<ApiResponse<AdminRoom>>(`/admin/rooms/${id}`, dto);
    if (!res.data.data) throw new Error('Failed to update room');
    return res.data.data;
  },

  /**
   * Deactivate (soft-delete) a room
   */
  deleteRoom: async (id: string): Promise<AdminRoom> => {
    const res = await apiClient.delete<ApiResponse<AdminRoom>>(`/admin/rooms/${id}`);
    if (!res.data.data) throw new Error('Failed to delete room');
    return res.data.data;
  },
};
