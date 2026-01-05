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
