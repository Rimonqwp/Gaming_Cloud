import { Loader2 } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router";
import { useUserAuth } from "../context/UserAuthContext";
import { isDashboardAdminUser } from "../lib/userAuth";

type RequireAdminUserProps = {
  children: ReactNode;
};

export function RequireAdminUser({ children }: RequireAdminUserProps) {
  const { user, ready, openLoginModal } = useUserAuth();

  useEffect(() => {
    if (ready && !user) {
      openLoginModal();
    }
  }, [ready, user, openLoginModal]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060912] px-6 text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-300" />
          <span className="text-sm font-medium text-zinc-200">Checking admin access...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!isDashboardAdminUser(user)) {
    return (
      <Navigate
        to="/dashboard?tab=overview"
        replace
        state={{ adminAccessDenied: true }}
      />
    );
  }

  return <>{children}</>;
}
