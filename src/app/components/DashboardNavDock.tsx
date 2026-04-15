import { useLocation } from "react-router";
import { useUserAuth } from "../context/UserAuthContext";
import { useDashboardNav } from "../context/DashboardNavContext";
import { DashboardConsolePills } from "./DashboardConsolePills";
import { DashboardConsoleToolbar } from "./DashboardConsoleToolbar";

/** 主導覽列高度：py-3 + h-[68px] + py-3 ≈ 5.75rem */
const DASHBOARD_MAIN_NAV_OFFSET = "5.75rem";

export function DashboardNavDock() {
  const location = useLocation();
  const { user } = useUserAuth();
  const { dashboardNavbarMode, dashboardNavPlacement, activeTab, setActiveTab, mainNavbarHidden } =
    useDashboardNav();

  if (location.pathname !== "/dashboard") {
    return null;
  }
  if (dashboardNavbarMode !== "console") {
    return null;
  }

  const showMergedToolbar = Boolean(
    user && mainNavbarHidden && dashboardNavbarMode === "console",
  );

  if (showMergedToolbar) {
    if (dashboardNavPlacement === "bottom_float") {
      return (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-40 w-full max-w-[min(100vw,920px)] -translate-x-1/2 px-4 sm:bottom-8">
          <div className="pointer-events-auto flex justify-center">
            <DashboardConsoleToolbar />
          </div>
        </div>
      );
    }
    return (
      <div className="pointer-events-none fixed left-0 right-0 top-4 z-40 flex justify-center px-3 sm:top-5 sm:px-4">
        <div className="pointer-events-auto w-full max-w-[min(100vw-1.5rem,920px)]">
          <DashboardConsoleToolbar />
        </div>
      </div>
    );
  }

  if (dashboardNavPlacement === "navbar_embed") {
    return null;
  }

  if (dashboardNavPlacement === "below_navbar") {
    return (
      <div
        className="pointer-events-none fixed left-0 right-0 z-40 flex justify-center px-3 sm:px-4"
        style={{ top: DASHBOARD_MAIN_NAV_OFFSET }}
      >
        <div className="pointer-events-auto pt-2">
          <DashboardConsolePills activeTab={activeTab} onSelect={setActiveTab} density="floating" />
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-40 w-full max-w-[min(100vw,780px)] -translate-x-1/2 px-4 sm:bottom-8">
      <div className="pointer-events-auto flex justify-center">
        <DashboardConsolePills activeTab={activeTab} onSelect={setActiveTab} density="floating" />
      </div>
    </div>
  );
}
