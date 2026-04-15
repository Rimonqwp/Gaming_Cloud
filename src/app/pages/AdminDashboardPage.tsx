import React, { useCallback, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { useSearchParams } from "react-router";
import { AdminDashboardToolbar } from "../components/AdminDashboardToolbar";
import { AdminDashboardInstancesTab } from "./admin-dashboard/AdminDashboardInstancesTab";
import { AdminDashboardOverviewTab } from "./admin-dashboard/AdminDashboardOverviewTab";
import { AdminDashboardProductsBillingTab } from "./admin-dashboard/AdminDashboardProductsBillingTab";
import {
  AdminDashboardDocsTab,
  AdminDashboardNodesTab,
  AdminDashboardSettingsTab,
  AdminDashboardTicketsTab,
} from "./admin-dashboard/AdminDashboardSupportTabs";
import { AdminDashboardUsersTab } from "./admin-dashboard/AdminDashboardUsersTab";
import { ADMIN_DASHBOARD_NAV_TABS } from "./admin-dashboard/adminDashboardConfig";
import type { AdminDashboardTabId, User } from "./admin-dashboard/adminDashboardTypes";
import { useAdminDashboardState } from "./admin-dashboard/useAdminDashboardState";

type AdminDashboardState = ReturnType<typeof useAdminDashboardState>;

function resolveAdminDashboardTab(tabParam: string | null): AdminDashboardTabId | null {
  if (!tabParam) {
    return null;
  }

  const match = ADMIN_DASHBOARD_NAV_TABS.find((tab) => tab.id === tabParam);
  return match?.id ?? null;
}

function getUserUid(user: Pick<User, "id" | "uid">) {
  return user.uid?.trim() || user.id;
}

function renderActiveTabContent(
  activeTab: AdminDashboardTabId,
  dashboard: AdminDashboardState,
  userActions: {
    onSelectUser: (userId: string) => void;
    onCloseUserDetail: () => void;
  },
) {
  switch (activeTab) {
    case "overview":
      return <AdminDashboardOverviewTab />;
    case "products":
      return <AdminDashboardProductsBillingTab key="products" />;
    case "nodes":
      return (
        <AdminDashboardNodesTab
          globalRegions={dashboard.globalRegions}
          selectedRegionId={dashboard.selectedRegionId}
          setSelectedRegionId={dashboard.setSelectedRegionId}
          selectedPhysicalNode={dashboard.selectedPhysicalNode}
          setSelectedPhysicalNode={dashboard.setSelectedPhysicalNode}
          editingRegionId={dashboard.editingRegionId}
          newNodeCity={dashboard.newNodeCity}
          setEditingRegionId={dashboard.setEditingRegionId}
          setNewNodeCity={dashboard.setNewNodeCity}
          onAddNodeToRegion={dashboard.addNodeToRegion}
          onDeleteNode={dashboard.deleteNode}
          onAddNewRegion={dashboard.addNewRegion}
          onRunNodePowerAction={dashboard.runNodePowerAction}
          onUpdateRegion={dashboard.updateRegion}
          onToggleNodeGame={dashboard.toggleNodeGame}
        />
      );
    case "docs":
      return (
        <AdminDashboardDocsTab
          docs={dashboard.docs}
          onAddNewDoc={dashboard.addNewDoc}
          onToggleDocStatus={dashboard.toggleDocStatus}
          onDeleteDoc={dashboard.deleteDoc}
        />
      );
    case "users":
      return (
        <AdminDashboardUsersTab
          users={dashboard.users}
          filteredUsers={dashboard.usersListFiltered}
          usersLoadError={dashboard.usersLoadError}
          isUsersLoading={dashboard.isUsersLoading}
          userListSearchQuery={dashboard.userListSearchQuery}
          setUserListSearchQuery={dashboard.setUserListSearchQuery}
          selectedUserId={dashboard.selectedUserId}
          isEditingRank={dashboard.isEditingRank}
          setIsEditingRank={dashboard.setIsEditingRank}
          onSelectUser={userActions.onSelectUser}
          onCloseUserDetail={userActions.onCloseUserDetail}
          onSetUserStatus={dashboard.setUserStatus}
          onChangeUserRank={dashboard.changeUserRank}
          applyBatchUserStatus={dashboard.applyBatchUserStatus}
          applyBatchBalanceAdjust={dashboard.applyBatchBalanceAdjust}
          applyBatchBalanceSet={dashboard.applyBatchBalanceSet}
          applyBatchBonusDelta={dashboard.applyBatchBonusDelta}
          applyBatchBonusSet={dashboard.applyBatchBonusSet}
          applyBatchBonusZero={dashboard.applyBatchBonusZero}
          removeUsersBatch={dashboard.removeUsersBatch}
          batchStopInstancesForUsers={dashboard.batchStopInstancesForUsers}
          batchDeleteInstancesForUsers={dashboard.batchDeleteInstancesForUsers}
          instances={dashboard.instances}
          referrals={dashboard.referrals}
          referralsLoadError={dashboard.referralsLoadError}
          userEventLogs={dashboard.userEventLogs}
        />
      );
    case "instances":
      return (
        <AdminDashboardInstancesTab
          instances={dashboard.instances}
          isInstancesLoading={dashboard.isInstancesLoading}
          instancesLoadError={dashboard.instancesLoadError}
          selectedInstanceId={dashboard.selectedInstanceId}
          instanceActiveTab={dashboard.instanceActiveTab}
          onSelectInstance={dashboard.selectInstance}
          onCloseInstanceDetail={dashboard.closeInstanceDetail}
          onSetInstanceActiveTab={dashboard.setInstanceActiveTab}
        />
      );
    case "tickets":
      return (
        <AdminDashboardTicketsTab
          tickets={dashboard.tickets}
          ticketsLoadError={dashboard.ticketsLoadError}
        />
      );
    case "settings":
      return (
        <AdminDashboardSettingsTab
          settings={dashboard.settings}
          setSettings={dashboard.setSettings}
        />
      );
    default:
      return null;
  }
}

export function AdminDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = resolveAdminDashboardTab(searchParams.get("tab")) ?? "overview";
  const requestedUserKey =
    requestedTab === "users"
      ? searchParams.get("uid")?.trim() || searchParams.get("userId")?.trim() || null
      : null;
  const dashboard = useAdminDashboardState(requestedTab, requestedUserKey);
  const { activeTab, handleToolbarBackClick, setActiveTab } = dashboard;

  useEffect(() => {
    if (requestedTab !== activeTab) {
      setActiveTab(requestedTab);
    }
  }, [activeTab, requestedTab, setActiveTab]);

  const handleSelectTab = useCallback(
    (tab: AdminDashboardTabId) => {
      setActiveTab(tab);

      const next = new URLSearchParams(searchParams);
      if (tab === "overview") {
        next.delete("tab");
      } else {
        next.set("tab", tab);
      }
      if (tab !== "users") {
        next.delete("uid");
        next.delete("userId");
      }

      setSearchParams(next, { replace: true });
    },
    [searchParams, setActiveTab, setSearchParams],
  );

  const handleSelectUser = useCallback(
    (userId: string) => {
      dashboard.selectUser(userId);
      const selectedUser = dashboard.users.find((user) => user.id === userId);
      const userUid = selectedUser ? getUserUid(selectedUser) : userId;

      const next = new URLSearchParams(searchParams);
      next.set("tab", "users");
      next.set("uid", userUid);
      next.delete("userId");
      setSearchParams(next, { replace: true });
    },
    [dashboard, searchParams, setSearchParams],
  );

  const handleCloseUserDetail = useCallback(() => {
    dashboard.closeUserDetail();

    const next = new URLSearchParams(searchParams);
    next.delete("uid");
    next.delete("userId");
    setSearchParams(next, { replace: true });
  }, [dashboard, searchParams, setSearchParams]);

  const handleDashboardBackClick = useCallback(
    (event: Parameters<typeof handleToolbarBackClick>[0]) => {
      if (activeTab === "users" && dashboard.selectedUserId) {
        event.preventDefault();
        handleCloseUserDetail();
        return;
      }

      handleToolbarBackClick(event);
    },
    [activeTab, dashboard.selectedUserId, handleCloseUserDetail, handleToolbarBackClick],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020202] pb-32 pt-6 font-sans text-slate-200 sm:pt-8">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30">
        <div className="absolute right-[-10%] top-[-20%] h-[60vw] w-[60vw] rounded-full bg-cyan-900/10 blur-[180px] mix-blend-screen" />
        <div className="absolute left-[-10%] top-[40%] h-[40vw] w-[40vw] rounded-full bg-emerald-900/10 blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-center sm:mb-8">
          <AdminDashboardToolbar
            tabs={ADMIN_DASHBOARD_NAV_TABS}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            onBackClick={handleDashboardBackClick}
          />
        </div>

        <main className="min-h-[60vh] min-w-0">
          <AnimatePresence mode="wait">
            {renderActiveTabContent(activeTab, dashboard, {
              onSelectUser: handleSelectUser,
              onCloseUserDetail: handleCloseUserDetail,
            })}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
