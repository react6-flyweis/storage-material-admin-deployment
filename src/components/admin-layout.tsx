import { Outlet, useLocation, useNavigate } from "react-router";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { PageActivityTracker } from "@/components/PageActivityTracker";
import { WelcomeTourDialog } from "@/modules/tour/components/welcome-tour-dialog";
import { tourCoordinator } from "@/modules/tour/tour.service";

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMainCollapsed, setIsMainCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    tourCoordinator.init(navigate);
  }, [navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      try {
        scrollRef.current.scrollTo({ top: 0, left: 0 });
      } catch {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <PageActivityTracker />
      <WelcomeTourDialog />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isMainCollapsed={isMainCollapsed}
        setIsMainCollapsed={setIsMainCollapsed}
      />
      <div
        className={cn(
          "flex-1 flex flex-col ml-0 overflow-hidden transition-all duration-300",
          isMainCollapsed ? "lg:ml-18" : "lg:ml-74",
        )}
      >
        <Header onMenuClick={toggleSidebar} />
        <main
          ref={scrollRef}
          data-tour="page-content"
          className="flex-1 bg-[#E8EFF9] pb-5 overflow-auto"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
