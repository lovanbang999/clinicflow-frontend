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

// GET /admin/dashboard/overview
export interface AdminOverviewTrends {
  newPatientsThisMonth: number;
  newPatientsLastMonth: number;
  newBookingsThisMonth: number;
  newBookingsLastMonth: number;
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowthPct: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalBookings: number;
  totalRevenue: number;
  trends?: AdminOverviewTrends;
}

// GET /admin/dashboard/monthly-stats
export interface MonthlyStats {
  month?: string;
  bookingCount: number;
  newPatients: number;
  successRate: number;
  revenue: number;
}

// GET /admin/dashboard/top-doctors
export interface TopDoctor {
  id: string;
  fullName: string;
  avatar?: string | null;
  visitCount: number;
}

// GET /admin/dashboard/revenue-chart
export interface RevenueDataPoint {
  date: string;  // "YYYY-MM-01"
  revenue: number;
}

export interface RevenueChartData {
  months: number;
  chart: RevenueDataPoint[];
}

// GET /admin/dashboard/booking-overview
export interface BookingOverviewData {
  total: number;
  completed: number;
  upcoming: number;
  cancelled: number;
  inProgress: number;
  completedPct: number;
  upcomingPct: number;
  cancelledPct: number;
}

// Legacy combined type (kept for backwards-compat)
export interface AdminDashboardData {
  stats: AdminDashboardStats;
  monthlyStats: MonthlyStats;
  topDoctors: TopDoctor[];
  revenueChart: RevenueDataPoint[];
}
