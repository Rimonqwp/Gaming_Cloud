import { RequireAdminUser } from "../components/RequireAdminUser";
import { DashboardNavProvider } from "../context/DashboardNavContext";
import { AdminDashboardPage } from "./AdminDashboardPage";

export function AdminRoutePage() {
  return (
    <DashboardNavProvider>
      <RequireAdminUser>
        <AdminDashboardPage />
      </RequireAdminUser>
    </DashboardNavProvider>
  );
}
