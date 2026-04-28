import { TechnicianDashboardHeader } from "./TechnicianDashboardHeader";
import { TechnicianDashboardSidebar } from "./TechnicianDashboardSidebar";

interface TechnicianDashboardLayoutProps {
  children: React.ReactNode;
}

export function TechnicianDashboardLayout({ children }: TechnicianDashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-[#f0f3f4] overflow-hidden">
      {/* Sidebar - fixed and full height */}
      <TechnicianDashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header - inside main content area */}
        <TechnicianDashboardHeader />

        {/* Page Content - scrollable */}
        <main className="flex-1 h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
