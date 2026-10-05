import { Navbar } from "./Navbar";
import { DashboardNavDock } from "./DashboardNavDock";
import { Footer } from "./Footer";
import { Outlet, useLocation } from "react-router";
import { ScrollToTop } from "./ScrollToTop";
import { DashboardNavProvider } from "../context/DashboardNavContext";

export function RootLayout() {
  const isConsole = useLocation().pathname === "/dashboard";
  return (
    <DashboardNavProvider>
      <div className="min-h-screen overflow-x-clip bg-[#f4f7fb] text-slate-900 selection:bg-blue-500/20 font-sans transition-colors duration-300 dark:bg-[#060912] dark:text-slate-100 dark:selection:bg-cyan-500/30">
        <ScrollToTop />
        {!isConsole && <Navbar />}
        {!isConsole && <DashboardNavDock />}
        <main className="overflow-x-clip">
          <Outlet />
        </main>
        {!isConsole && <Footer />}
      </div>
    </DashboardNavProvider>
  );
}
