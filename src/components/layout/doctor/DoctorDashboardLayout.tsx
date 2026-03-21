import { DoctorDashboardHeader } from "./DoctorDashboardHeader";
import { DoctorDashboardSidebar } from "./DoctorDashboardSidebar";


interface DoctorDashboardLayoutProps {
  children: React.ReactNode;
}

export function DoctorDashboardLayout({ children }: DoctorDashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-[#f0f3f4] overflow-hidden">
      {/* Sidebar - fixed and full height */}
      <DoctorDashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header - inside main content area */}
        <DoctorDashboardHeader />

        {/* Page Content - scrollable (overflow-hidden lets child workspaces manage their own scroll) */}
        <main className="flex-1 h-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
