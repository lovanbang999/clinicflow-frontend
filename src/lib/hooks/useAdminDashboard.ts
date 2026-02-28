import { useState, useEffect } from 'react';
import { dashboardApi } from '@/lib/api/dashboard';
import { AdminDashboardData } from '@/types/dashboard';
import { toast } from 'sonner';

export const useAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await dashboardApi.getAdminStats();
      setData(dashboardData);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to fetch admin dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Set mock data for development/fallback
      setData({
        stats: {
          totalUsers: 1234,
          totalDoctors: 12,
          totalBookings: 3456,
          totalRevenue: 420000000,
        },
        monthlyStats: {
          bookingCount: 328,
          newPatients: 89,
          successRate: 92,
          revenue: 85600000,
        },
        topDoctors: [
          {
            id: '1',
            fullName: 'Nguyễn Văn A',
            visitCount: 156,
            avatar: undefined,
          },
          {
            id: '2',
            fullName: 'Lê Thị C',
            visitCount: 142,
            avatar: undefined,
          },
          {
            id: '3',
            fullName: 'Phạm Minh D',
            visitCount: 98,
            avatar: undefined,
          },
        ],
        revenueChart: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(2024, 11, i + 1).toISOString(),
          revenue: Math.floor(Math.random() * 5000000) + 2000000,
        })),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};
