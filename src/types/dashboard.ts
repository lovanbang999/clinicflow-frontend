export interface DashboardStats {
  upcomingBookings: number;
  completedBookings: number;
  waitingBookings: number;
  totalBookings: number;
}

export interface NextBooking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  service: {
    id: string;
    name: string;
  };
  doctor: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  nextBooking: NextBooking | null;
}

// Admin Dashboard Types
export interface AdminDashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalBookings: number;
  totalRevenue: number;
}

export interface MonthlyStats {
  bookingCount: number;
  newPatients: number;
  successRate: number;
  revenue: number;
}

export interface TopDoctor {
  id: string;
  fullName: string;
  avatar?: string;
  visitCount: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  monthlyStats: MonthlyStats;
  topDoctors: TopDoctor[];
  revenueChart: RevenueDataPoint[];
}
