import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import type { UserDashboardTabId } from "../config/userDashboardNavTabs";
import { USER_DASHBOARD_NAV_TABS } from "../config/userDashboardNavTabs";
import { useDashboardNav } from "../context/DashboardNavContext";
import { useUserAuth } from "../context/UserAuthContext";
import {
  mockUser,
  teamMembers,
  ticketsData,
} from "./user-dashboard/userDashboardData";
import { UserDashboardBillingTab } from "./user-dashboard/UserDashboardBillingTab";
import { UserDashboardReferralTab } from "./user-dashboard/UserDashboardReferralTab";
import { UserDashboardSettingsTab } from "./user-dashboard/UserDashboardSettingsTab";
import { UserDashboardTeamTab } from "./user-dashboard/UserDashboardTeamTab";
import { UserDashboardTicketsTab } from "./user-dashboard/UserDashboardTicketsTab";
import type { SettingsMenuId } from "./user-dashboard/userDashboardTypes";
import { CloudConsoleHeader } from "../components/CloudConsoleHeader";
import { CloudDashboardOverview } from "./user-dashboard/CloudDashboardOverview";
import "../../styles/cloud-console.css";

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
        <CloudDashboardOverview
          onSelectTab={options.setActiveTab}
          balance={options.dashboardUser.balance}
        />
      );
    case "instances":
      return (
        <CloudDashboardOverview
          onSelectTab={options.setActiveTab}
          balance={options.dashboardUser.balance}
          mode="instances"
        />
      );
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
    const serverParam = searchParams.get("server");
    if (serverParam && activeTab !== "instances") {
      // A server detail URL is a durable deep link. Keep it authoritative
      // even if account preferences finish loading after the first render.
      setActiveTab("instances");
    }
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
  }, [activeTab, searchParams, setActiveTab, setSearchParams]);

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

  return (
    <div className="cloud-shell">
      <div className="cloud-container">
        <CloudConsoleHeader />
        <div
          className={
            activeTab === "overview" || activeTab === "instances" || activeTab === "settings"
              ? ""
              : "cloud-legacy"
          }
        >
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
        </div>
      </div>
    </div>
  );
}
