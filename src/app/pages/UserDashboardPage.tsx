import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "react-router";
import type { UserDashboardTabId } from "../config/userDashboardNavTabs";
import { USER_DASHBOARD_NAV_TABS } from "../config/userDashboardNavTabs";
import { useDashboardNav } from "../context/DashboardNavContext";
import { useUserAuth } from "../context/UserAuthContext";
import { instances, mockUser, teamMembers, ticketsData, usageData } from "./user-dashboard/userDashboardData";
import { UserDashboardBillingTab } from "./user-dashboard/UserDashboardBillingTab";
import { UserDashboardInstancesTab } from "./user-dashboard/UserDashboardInstancesTab";
import { UserDashboardOverviewTab } from "./user-dashboard/UserDashboardOverviewTab";
import { UserDashboardReferralTab } from "./user-dashboard/UserDashboardReferralTab";
import { UserDashboardSettingsTab } from "./user-dashboard/UserDashboardSettingsTab";
import { UserDashboardTeamTab } from "./user-dashboard/UserDashboardTeamTab";
import { UserDashboardTicketsTab } from "./user-dashboard/UserDashboardTicketsTab";
import type { SettingsMenuId } from "./user-dashboard/userDashboardTypes";

type DashboardNavValue = ReturnType<typeof useDashboardNav>;

function renderActiveTabContent(
  activeTab: UserDashboardTabId,
  options: {
    dashboardUser: typeof mockUser;
    setActiveTab: (tab: UserDashboardTabId) => void;
    settingsMenu: SettingsMenuId;
    setSettingsMenu: (menu: SettingsMenuId) => void;
    dashboardNavPlacement: DashboardNavValue["dashboardNavPlacement"];
    setDashboardNavPlacement: DashboardNavValue["setDashboardNavPlacement"];
    mainNavbarHidden: boolean;
    setMainNavbarHidden: DashboardNavValue["setMainNavbarHidden"];
    preferredCurrency: DashboardNavValue["preferredCurrency"];
    setPreferredCurrency: DashboardNavValue["setPreferredCurrency"];
    previewBaseCurrency: DashboardNavValue["previewBaseCurrency"];
    setPreviewBaseCurrency: DashboardNavValue["setPreviewBaseCurrency"];
  },
) {
  switch (activeTab) {
    case "overview":
      return (
        <UserDashboardOverviewTab
          dashboardUser={options.dashboardUser}
          instances={instances}
          usageData={usageData}
          onSelectTab={options.setActiveTab}
        />
      );
    case "instances":
      return <UserDashboardInstancesTab />;
    case "billing":
      return <UserDashboardBillingTab />;
    case "team":
      return <UserDashboardTeamTab teamMembers={teamMembers} />;
    case "tickets":
      return <UserDashboardTicketsTab tickets={ticketsData} />;
    case "referral":
      return <UserDashboardReferralTab />;
    case "settings":
      return (
        <UserDashboardSettingsTab
          settingsMenu={options.settingsMenu}
          setSettingsMenu={options.setSettingsMenu}
          dashboardUser={options.dashboardUser}
          dashboardNavPlacement={options.dashboardNavPlacement}
          setDashboardNavPlacement={options.setDashboardNavPlacement}
          mainNavbarHidden={options.mainNavbarHidden}
          setMainNavbarHidden={options.setMainNavbarHidden}
          preferredCurrency={options.preferredCurrency}
          setPreferredCurrency={options.setPreferredCurrency}
          previewBaseCurrency={options.previewBaseCurrency}
          setPreviewBaseCurrency={options.setPreviewBaseCurrency}
        />
      );
    default:
      return null;
  }
}

export function UserDashboardPage() {
  const { user: authUser } = useUserAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    activeTab,
    setActiveTab,
    dashboardNavbarMode,
    dashboardNavPlacement,
    setDashboardNavPlacement,
    mainNavbarHidden,
    setMainNavbarHidden,
    preferredCurrency,
    setPreferredCurrency,
    previewBaseCurrency,
    setPreviewBaseCurrency,
  } = useDashboardNav();
  const [settingsMenu, setSettingsMenu] = useState<SettingsMenuId>("account");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (!tabParam) {
      return;
    }
    const match = USER_DASHBOARD_NAV_TABS.find((t) => t.id === tabParam);
    if (!match) {
      return;
    }
    setActiveTab(match.id);
    const next = new URLSearchParams(searchParams);
    next.delete("tab");
    setSearchParams(next, { replace: true });
  }, [searchParams, setActiveTab, setSearchParams]);

  const dashboardUser = {
    ...mockUser,
    id: authUser?.uid ?? mockUser.id,
    name: authUser?.displayName ?? authUser?.username ?? mockUser.name,
    email: authUser?.email ?? mockUser.email,
    balance: authUser?.balance ?? mockUser.balance,
    credit: authUser?.bonusCredit ?? mockUser.credit,
    rank: authUser?.rank ?? mockUser.rank,
    status: authUser?.status ?? mockUser.status,
    registeredAt: authUser?.registeredAt ?? mockUser.registeredAt,
  };

  useEffect(() => {
    if (mainNavbarHidden && dashboardNavPlacement === "navbar_embed") {
      setDashboardNavPlacement("below_navbar");
    }
  }, [mainNavbarHidden, dashboardNavPlacement, setDashboardNavPlacement]);

  const mergedToolbarAtTop =
    mainNavbarHidden && dashboardNavbarMode === "console" && dashboardNavPlacement !== "bottom_float";

  const pageShellClass =
    dashboardNavbarMode === "console" && dashboardNavPlacement === "below_navbar"
      ? mergedToolbarAtTop
        ? "min-h-screen bg-[#020202] text-slate-200 pt-[7.25rem] pb-32 relative overflow-hidden font-sans"
        : "min-h-screen bg-[#020202] text-slate-200 pt-[9rem] pb-32 relative overflow-hidden font-sans"
      : dashboardNavbarMode === "console" && dashboardNavPlacement === "bottom_float"
        ? mainNavbarHidden
          ? "min-h-screen bg-[#020202] text-slate-200 pt-16 pb-40 relative overflow-hidden font-sans"
          : "min-h-screen bg-[#020202] text-slate-200 pt-24 pb-40 relative overflow-hidden font-sans"
        : mergedToolbarAtTop
          ? "min-h-screen bg-[#020202] text-slate-200 pt-[7.25rem] pb-32 relative overflow-hidden font-sans"
          : "min-h-screen bg-[#020202] text-slate-200 pt-24 pb-32 relative overflow-hidden font-sans";

  return (
    <div className={pageShellClass}>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute right-[-10%] top-[-20%] h-[60vw] w-[60vw] rounded-full bg-cyan-900/10 blur-[180px] mix-blend-screen" />
        <div className="absolute left-[-10%] top-[40%] h-[40vw] w-[40vw] rounded-full bg-emerald-900/10 blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {dashboardNavbarMode === "site" ? (
          <div className="mb-10 flex justify-center">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/5 bg-[#0a0a0c]/80 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-2xl no-scrollbar">
              {USER_DASHBOARD_NAV_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all sm:px-6 ${
                      isActive ? "text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {isActive ? (
                      <motion.div
                        layoutId="activePillNav"
                        className="absolute inset-0 rounded-full border border-white/10 bg-white/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    ) : null}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "group-hover:text-zinc-300"}`} />
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-6 sm:mb-8" aria-hidden />
        )}

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {renderActiveTabContent(activeTab, {
              dashboardUser,
              setActiveTab,
              settingsMenu,
              setSettingsMenu,
              dashboardNavPlacement,
              setDashboardNavPlacement,
              mainNavbarHidden,
              setMainNavbarHidden,
              preferredCurrency,
              setPreferredCurrency,
              previewBaseCurrency,
              setPreviewBaseCurrency,
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
