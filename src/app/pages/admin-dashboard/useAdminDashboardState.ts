import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useUserAuth } from "../../context/UserAuthContext";
import { getAdminReferrals } from "../../lib/adminReferrals";
import {
  createAdminNode,
  createAdminNodeRegion,
  deleteAdminNode,
  getAdminInstances,
  getAdminNodes,
  getAdminTickets,
  toggleAdminNodeGame,
  updateAdminNodeRegion,
} from "../../lib/adminDashboardData";
import { adjustAdminUsersWallet, getAdminUsers } from "../../lib/adminUsers";
import {
  DEFAULT_SETTINGS,
  INITIAL_DOCS,
  INITIAL_GLOBAL_REGIONS,
  INITIAL_INSTANCES,
  INITIAL_PLANS,
  INITIAL_TICKETS,
  INITIAL_TRANSACTIONS,
} from "./adminDashboardConfig";
import { buildUserEventLogs, createUserEventLogEntry, type UserEventLogEntry } from "./userEventLogUtils";
import type {
  AdminDashboardInstanceTabId,
  AdminDashboardSettings,
  AdminDashboardTabId,
  Doc,
  DatacenterRegionFormInput,
  GlobalNode,
  GlobalRegion,
  Instance,
  NodePowerAction,
  Plan,
  Referral,
  Ticket,
  Transaction,
  User,
} from "./adminDashboardTypes";

function getUserUid(user: Pick<User, "id" | "uid">) {
  return user.uid?.trim() || user.id;
}

function getStatusLabel(status: User["status"]) {
  if (status === "active") {
    return "正常";
  }
  if (status === "suspended") {
    return "暫停";
  }
  return "封禁";
}

function formatWalletEventUsd(value: number) {
  const absolute = Math.abs(value);
  if (absolute > 0 && absolute < 0.01) {
    return value.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  }
  return value.toFixed(2);
}

function roundWalletEventUsd(value: number) {
  return Number(value.toFixed(6));
}

export function useAdminDashboardState(
  initialActiveTab: AdminDashboardTabId = "overview",
  initialSelectedUserKey: string | null = null,
) {
  const { token, user: authUser, updateUser } = useUserAuth();

  const [activeTab, setActiveTab] = useState<AdminDashboardTabId>(initialActiveTab);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isEditingRank, setIsEditingRank] = useState(false);
  const [userListSearchQuery, setUserListSearchQuery] = useState("");

  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [instanceActiveTab, setInstanceActiveTab] =
    useState<AdminDashboardInstanceTabId>("console");

  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanDraft, setEditPlanDraft] = useState<Plan | null>(null);

  const [globalRegions, setGlobalRegions] = useState<GlobalRegion[]>(INITIAL_GLOBAL_REGIONS);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedPhysicalNode, setSelectedPhysicalNode] = useState<GlobalNode | null>(null);
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);
  const [newNodeCity, setNewNodeCity] = useState("");

  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS);

  const [users, setUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersLoadError, setUsersLoadError] = useState<string | null>(null);

  const [instances, setInstances] = useState<Instance[]>(INITIAL_INSTANCES);
  const [isInstancesLoading, setIsInstancesLoading] = useState(true);
  const [instancesLoadError, setInstancesLoadError] = useState<string | null>(null);

  const [transactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [runtimeUserEventLogs, setRuntimeUserEventLogs] = useState<UserEventLogEntry[]>([]);

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralsLoadError, setReferralsLoadError] = useState<string | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [ticketsLoadError, setTicketsLoadError] = useState<string | null>(null);

  const [settings, setSettings] = useState<AdminDashboardSettings>(DEFAULT_SETTINGS);

  const userEventLogs = useMemo(
    () => buildUserEventLogs(transactions, referrals, runtimeUserEventLogs),
    [referrals, runtimeUserEventLogs, transactions],
  );

  const appendUserEvent = (entry: UserEventLogEntry) => {
    setRuntimeUserEventLogs((current) => [entry, ...current]);
  };

  const appendUserEvents = (entries: UserEventLogEntry[]) => {
    if (entries.length === 0) {
      return;
    }
    setRuntimeUserEventLogs((current) => [...entries, ...current]);
  };

  const usersListFiltered = useMemo(() => {
    const query = userListSearchQuery.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter(
      (user) =>
        user.id.toLowerCase().includes(query) ||
        getUserUid(user).toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [userListSearchQuery, users]);

  useEffect(() => {
    if (!token) {
      setGlobalRegions(INITIAL_GLOBAL_REGIONS);
      return;
    }

    const authToken = token;
    let cancelled = false;

    async function loadAdminNodes() {
      try {
        const payload = await getAdminNodes(authToken);
        if (cancelled) {
          return;
        }
        setGlobalRegions(payload.regions);
      } catch {
        if (cancelled) {
          return;
        }
        setGlobalRegions(INITIAL_GLOBAL_REGIONS);
      }
    }

    void loadAdminNodes();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      setUsers([]);
      setUsersLoadError(null);
      setIsUsersLoading(false);
      return;
    }

    const authToken = token;
    let cancelled = false;

    async function loadAdminUsers() {
      setIsUsersLoading(true);

      try {
        const payload = await getAdminUsers(authToken);
        if (cancelled) {
          return;
        }
        setUsers(payload.users);
        setUsersLoadError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setUsersLoadError(error instanceof Error ? error.message : "Failed to load admin users.");
      } finally {
        if (!cancelled) {
          setIsUsersLoading(false);
        }
      }
    }

    void loadAdminUsers();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      setReferrals([]);
      setReferralsLoadError(null);
      return;
    }

    const authToken = token;
    let cancelled = false;

    async function loadAdminReferrals() {
      try {
        const payload = await getAdminReferrals(authToken);
        if (cancelled) {
          return;
        }
        setReferrals(payload.referrals);
        setReferralsLoadError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setReferralsLoadError(
          error instanceof Error ? error.message : "Failed to load admin referrals.",
        );
      }
    }

    void loadAdminReferrals();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      setInstances([]);
      setInstancesLoadError(null);
      setIsInstancesLoading(false);
      return;
    }

    const authToken = token;
    let cancelled = false;

    async function loadAdminInstances() {
      setIsInstancesLoading(true);

      try {
        const payload = await getAdminInstances(authToken);
        if (cancelled) {
          return;
        }
        setInstances(payload.instances);
        setInstancesLoadError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setInstancesLoadError(
          error instanceof Error ? error.message : "Failed to load admin instances.",
        );
      } finally {
        if (!cancelled) {
          setIsInstancesLoading(false);
        }
      }
    }

    void loadAdminInstances();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      setTickets([]);
      setTicketsLoadError(null);
      return;
    }

    const authToken = token;
    let cancelled = false;

    async function loadAdminTickets() {
      try {
        const payload = await getAdminTickets(authToken);
        if (cancelled) {
          return;
        }
        setTickets(payload.tickets);
        setTicketsLoadError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setTicketsLoadError(
          error instanceof Error ? error.message : "Failed to load admin tickets.",
        );
      }
    }

    void loadAdminTickets();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (selectedUserId && !users.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(null);
      setIsEditingRank(false);
    }
  }, [selectedUserId, users]);

  useEffect(() => {
    if (!initialSelectedUserKey) {
      setSelectedUserId(null);
      setIsEditingRank(false);
      return;
    }

    const matchedUser = users.find(
      (user) => user.id === initialSelectedUserKey || getUserUid(user) === initialSelectedUserKey,
    );

    setSelectedUserId(matchedUser?.id ?? null);
    setIsEditingRank(false);
  }, [initialSelectedUserKey, users]);

  useEffect(() => {
    if (selectedInstanceId && !instances.some((instance) => instance.id === selectedInstanceId)) {
      setSelectedInstanceId(null);
      setInstanceActiveTab("console");
    }
  }, [instances, selectedInstanceId]);

  useEffect(() => {
    if (!selectedPhysicalNode) {
      return;
    }

    const nextSelectedNode = globalRegions
      .flatMap((region) => region.nodes)
      .find((node) => node.id === selectedPhysicalNode.id);

    if (!nextSelectedNode) {
      setSelectedPhysicalNode(null);
      return;
    }

    if (nextSelectedNode !== selectedPhysicalNode) {
      setSelectedPhysicalNode(nextSelectedNode);
    }
  }, [globalRegions, selectedPhysicalNode]);

  useEffect(() => {
    if (activeTab !== "nodes") {
      setSelectedRegionId(null);
      setSelectedPhysicalNode(null);
      setEditingRegionId(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!selectedRegionId) {
      return;
    }
    if (!globalRegions.some((r) => r.id === selectedRegionId)) {
      setSelectedRegionId(null);
    }
  }, [globalRegions, selectedRegionId]);

  const startEditingPlan = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setEditPlanDraft({ ...plan });
  };

  const cancelEditingPlan = () => {
    setEditingPlanId(null);
    setEditPlanDraft(null);
  };

  const saveEditingPlan = () => {
    if (!editPlanDraft) {
      return;
    }

    setPlans((currentPlans) =>
      currentPlans.map((plan) => (plan.id === editPlanDraft.id ? editPlanDraft : plan)),
    );
    cancelEditingPlan();
  };

  const deletePlan = (id: string) => {
    setPlans((currentPlans) => currentPlans.filter((plan) => plan.id !== id));
  };

  const addNewPlan = () => {
    const newPlan: Plan = {
      id: `new-${Date.now()}`,
      name: "新配置套餐",
      cpu: 1,
      memory: 1,
      storage: 20,
      price: 5,
    };
    setPlans((currentPlans) => [...currentPlans, newPlan]);
    setEditingPlanId(newPlan.id);
    setEditPlanDraft(newPlan);
  };

  const addNodeToRegion = (regionId: string) => {
    if (!newNodeCity) {
      return;
    }

    const city = newNodeCity;

    if (!token) {
      return;
    }

    void (async () => {
      try {
        const payload = await createAdminNode(token, regionId, { city });
        setGlobalRegions(payload.regions);
        setNewNodeCity("");
        setEditingRegionId(null);
      } catch (error) {
        console.error("Failed to persist admin node creation", error);
      }
    })();
  };

  const deleteNode = (regionId: string, nodeId: string) => {
    if (!token) {
      return;
    }

    void (async () => {
      try {
        const payload = await deleteAdminNode(token, regionId, nodeId);
        setGlobalRegions(payload.regions);

        if (selectedPhysicalNode?.id === nodeId) {
          setSelectedPhysicalNode(null);
        }
      } catch (error) {
        console.error("Failed to persist admin node deletion", error);
      }
    })();
  };

  const addNewRegion = async (input: DatacenterRegionFormInput) => {
    if (!token) {
      return false;
    }

    try {
      const payload = await createAdminNodeRegion(token, input);
      setGlobalRegions(payload.regions);
      return true;
    } catch (error) {
      console.error("Failed to persist admin region creation", error);
      return false;
    }
  };

  const updateRegion = async (regionId: string, input: DatacenterRegionFormInput) => {
    if (!token) {
      return false;
    }

    try {
      const payload = await updateAdminNodeRegion(token, regionId, input);
      setGlobalRegions(payload.regions);
      return true;
    } catch (error) {
      console.error("Failed to persist admin region update", error);
      return false;
    }
  };

  const toggleNodeGame = (nodeId: string, gameId: string) => {
    if (!token) {
      return;
    }

    void (async () => {
      try {
        const payload = await toggleAdminNodeGame(token, nodeId, gameId);
        setGlobalRegions(payload.regions);
      } catch (error) {
        console.error("Failed to persist admin node game toggle", error);
      }
    })();
  };

  const runNodePowerAction = (nodeId: string, action: NodePowerAction) => {
    const resolveNextStatus = () => {
      if (action === "power_on") {
        return "online" as const;
      }
      if (action === "shutdown" || action === "force_off") {
        return "offline" as const;
      }
      return "maintenance" as const;
    };

    const nextStatus = resolveNextStatus();

    setGlobalRegions((currentRegions) =>
      currentRegions.map((region) => ({
        ...region,
        nodes: region.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                status: nextStatus,
              }
            : node,
        ),
      })),
    );

    if (action === "restart") {
      setTimeout(() => {
        setGlobalRegions((currentRegions) =>
          currentRegions.map((region) => ({
            ...region,
            nodes: region.nodes.map((node) =>
              node.id === nodeId
                ? {
                    ...node,
                    status: "online",
                  }
                : node,
            ),
          })),
        );
      }, 1500);
    }
  };

  const deleteDoc = (id: number) => {
    setDocs((currentDocs) => currentDocs.filter((doc) => doc.id !== id));
  };

  const toggleDocStatus = (id: number) => {
    setDocs((currentDocs) =>
      currentDocs.map((doc) =>
        doc.id === id
          ? { ...doc, status: doc.status === "published" ? "draft" : "published" }
          : doc,
      ),
    );
  };

  const addNewDoc = () => {
    const newDoc: Doc = {
      id: Date.now(),
      title: "新文章标题",
      category: "未分类",
      date: new Date().toISOString().split("T")[0],
      status: "draft",
    };
    setDocs((currentDocs) => [newDoc, ...currentDocs]);
  };

  const selectUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsEditingRank(false);
  };

  const closeUserDetail = () => {
    setSelectedUserId(null);
    setIsEditingRank(false);
  };

  const setUserStatus = (userId: string, nextStatus: User["status"]) => {
    const targetUser = users.find((user) => user.id === userId);
    if (!targetUser || targetUser.status === nextStatus) {
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId
          ? { ...user, status: nextStatus }
          : user,
      ),
    );

    const eventType =
      nextStatus === "active"
        ? targetUser.status === "banned"
          ? "user.status.unbanned"
          : "user.status.unsuspended"
        : nextStatus === "suspended"
          ? "user.status.suspended"
          : "user.status.banned";
    const title =
      nextStatus === "active"
        ? "管理員恢復使用者狀態"
        : nextStatus === "suspended"
          ? "管理員掛起使用者"
          : "管理員封鎖使用者";

    appendUserEvent(
      createUserEventLogEntry({
        userId,
        category: "account",
        eventType,
        title,
        description: `帳戶狀態由 ${getStatusLabel(targetUser.status)} 變更為 ${getStatusLabel(nextStatus)}。`,
        status: "completed",
        operator: "admin",
        referenceId: userId,
        referenceType: "user",
        method: "Admin Dashboard",
      }),
    );
  };

  const toggleUserStatus = (userId: string) => {
    const targetUser = users.find((user) => user.id === userId);
    if (!targetUser) {
      return;
    }

    const nextStatus = targetUser.status === "active" ? "banned" : "active";
    setUserStatus(userId, nextStatus);
    return;

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId
          ? { ...user, status: nextStatus }
          : user,
      ),
    );

    appendUserEvent(
      createUserEventLogEntry({
        userId,
        category: "account",
        eventType: nextStatus === "active" ? "user.status.unbanned" : "user.status.banned",
        title: nextStatus === "active" ? "管理員解除封鎖" : "管理員封鎖使用者",
        description: `帳戶狀態由 ${getStatusLabel(targetUser.status)} 變更為 ${getStatusLabel(nextStatus)}。`,
        status: "completed",
        operator: "admin",
        referenceId: userId,
        referenceType: "user",
        method: "Admin Dashboard",
      }),
    );
  };

  const mergeUsers = (updatedUsers: User[]) => {
    if (updatedUsers.length === 0) {
      return;
    }

    const nextUsersById = new Map(updatedUsers.map((user) => [user.id, user]));
    setUsers((currentUsers) =>
      currentUsers.map((user) => nextUsersById.get(user.id) ?? user),
    );

    const currentAuthUid = authUser?.uid?.trim();
    if (!currentAuthUid) {
      return;
    }

    const updatedAuthUser = updatedUsers.find((user) => user.uid?.trim() === currentAuthUid);
    if (!updatedAuthUser) {
      return;
    }

    updateUser({
      balance: updatedAuthUser.balance,
      bonusCredit: updatedAuthUser.bonusCredit,
      rank: updatedAuthUser.rank,
      status: updatedAuthUser.status,
      registeredAt: updatedAuthUser.registeredAt,
    });
  };

  const applyWalletAdjustment = async (
    userIds: string[],
    wallet: "balance" | "bonus",
    operation: "add" | "deduct" | "set" | "zero",
    amount?: number,
  ) => {
    if (userIds.length === 0) {
      return;
    }

    if (!token) {
      throw new Error("Admin session is missing.");
    }

    const payload = await adjustAdminUsersWallet(token, {
      userIds,
      wallet,
      operation,
      amount,
    });

    mergeUsers(payload.users);
  };

  const applyBatchUserStatus = (userIds: string[], status: User["status"]) => {
    if (userIds.length === 0) {
      return;
    }

    const affectedUsers = users.filter((user) => userIds.includes(user.id) && user.status !== status);

    setUsers((currentUsers) =>
      currentUsers.map((user) => (userIds.includes(user.id) ? { ...user, status } : user)),
    );

    appendUserEvents(
      affectedUsers.map((user) =>
        createUserEventLogEntry({
          userId: user.id,
          category: "account",
          eventType:
            status === "active"
              ? "user.status.unbanned"
              : status === "banned"
                ? "user.status.banned"
                : "user.status.suspended",
          title: "批次更新帳戶狀態",
          description: `管理員將帳戶狀態由 ${getStatusLabel(user.status)} 變更為 ${getStatusLabel(status)}。`,
          status: "completed",
          operator: "admin",
          referenceId: user.id,
          referenceType: "user",
          method: "Admin Dashboard Batch",
        }),
      ),
    );
  };

  const applyBatchBalanceAdjust = async (userIds: string[], delta: number) => {
    await applyWalletAdjustment(userIds, "balance", delta >= 0 ? "add" : "deduct", Math.abs(delta));

    appendUserEvents(
      userIds.map((userId) =>
        createUserEventLogEntry({
          userId,
          category: "funding",
          eventType: "wallet.balance.adjusted",
          title: delta >= 0 ? "管理員增加真實餘額" : "管理員扣除真實餘額",
          description: `真實餘額${delta >= 0 ? "增加" : "扣除"} $${Math.abs(delta).toFixed(2)}。`,
          amount: roundWalletEventUsd(delta),
          currency: "USD",
          status: "completed",
          operator: "admin",
          referenceId: userId,
          referenceType: "user",
          method: "Admin Dashboard",
        }),
      ),
    );
  };

  const applyBatchBalanceSet = async (userIds: string[], value: number) => {
    await applyWalletAdjustment(userIds, "balance", "set", value);

    appendUserEvents(
      userIds.map((userId) =>
        createUserEventLogEntry({
          userId,
          category: "funding",
          eventType: "wallet.balance.set",
          title: "管理員設定真實餘額",
          description: `真實餘額已設為 $${value.toFixed(2)}。`,
          amount: roundWalletEventUsd(value),
          currency: "USD",
          status: "completed",
          operator: "admin",
          referenceId: userId,
          referenceType: "user",
          method: "Admin Dashboard",
        }),
      ),
    );
  };

  const applyBatchBonusDelta = async (userIds: string[], delta: number) => {
    await applyWalletAdjustment(userIds, "bonus", delta >= 0 ? "add" : "deduct", Math.abs(delta));

    appendUserEvents(
      userIds.map((userId) =>
        createUserEventLogEntry({
          userId,
          category: "funding",
          eventType: "wallet.bonus.adjusted",
          title: delta >= 0 ? "管理員增加推廣贈金" : "管理員扣除推廣贈金",
          description: `推廣贈金${delta >= 0 ? "增加" : "扣除"} $${Math.abs(delta).toFixed(2)}。`,
          amount: roundWalletEventUsd(delta),
          currency: "USD",
          status: "completed",
          operator: "admin",
          referenceId: userId,
          referenceType: "user",
          method: "Admin Dashboard",
        }),
      ),
    );
  };

  const applyBatchBonusSet = async (userIds: string[], value: number) => {
    await applyWalletAdjustment(userIds, "bonus", "set", value);

    appendUserEvents(
      userIds.map((userId) =>
        createUserEventLogEntry({
          userId,
          category: "funding",
          eventType: "wallet.bonus.set",
          title: "管理員設定推廣贈金",
          description: `推廣贈金已設為 $${value.toFixed(2)}。`,
          amount: roundWalletEventUsd(value),
          currency: "USD",
          status: "completed",
          operator: "admin",
          referenceId: userId,
          referenceType: "user",
          method: "Admin Dashboard",
        }),
      ),
    );
  };

  const applyBatchBonusZero = async (userIds: string[]) => {
    await applyWalletAdjustment(userIds, "bonus", "zero");

    appendUserEvents(
      userIds.map((userId) =>
        createUserEventLogEntry({
          userId,
          category: "funding",
          eventType: "wallet.bonus.zeroed",
          title: "管理員清零推廣贈金",
          description: "推廣贈金已清零。",
          amount: 0,
          currency: "USD",
          status: "completed",
          operator: "admin",
          referenceId: userId,
          referenceType: "user",
          method: "Admin Dashboard",
        }),
      ),
    );
  };

  const removeUsersBatch = (userIds: string[]) => {
    if (userIds.length === 0) {
      return;
    }
    setUsers((currentUsers) => currentUsers.filter((user) => !userIds.includes(user.id)));
    setSelectedUserId((currentId) =>
      currentId && userIds.includes(currentId) ? null : currentId,
    );
    setIsEditingRank(false);
  };

  const batchStopInstancesForUsers = (userIds: string[]) => {
    if (userIds.length === 0) {
      return;
    }

    const affectedInstances = instances.filter(
      (instance) => userIds.includes(instance.userId) && instance.status === "running",
    );

    setInstances((current) =>
      current.map((instance) =>
        userIds.includes(instance.userId) && instance.status === "running"
          ? { ...instance, status: "stopped" as const }
          : instance,
      ),
    );

    appendUserEvents(
      affectedInstances.map((instance) =>
        createUserEventLogEntry({
          userId: instance.userId,
          category: "instance",
          eventType: "instance.stopped",
          title: "管理員停止實例",
          description: `${instance.game} / ${instance.id} 已被停止。`,
          status: "completed",
          operator: "admin",
          referenceId: instance.id,
          referenceType: "instance",
          method: "Admin Dashboard Batch",
        }),
      ),
    );
  };

  const batchDeleteInstancesForUsers = (userIds: string[]) => {
    if (userIds.length === 0) {
      return;
    }

    const deletedInstances = instances.filter((instance) => userIds.includes(instance.userId));
    setInstances((current) => current.filter((instance) => !userIds.includes(instance.userId)));

    appendUserEvents(
      deletedInstances.map((instance) =>
        createUserEventLogEntry({
          userId: instance.userId,
          category: "instance",
          eventType: "instance.deleted",
          title: "管理員刪除實例",
          description: `${instance.game} / ${instance.id} 已被刪除。`,
          status: "completed",
          operator: "admin",
          referenceId: instance.id,
          referenceType: "instance",
          method: "Admin Dashboard Batch",
        }),
      ),
    );
  };

  const changeUserRank = (userId: string, rank: User["rank"]) => {
    const targetUser = users.find((user) => user.id === userId);
    if (!targetUser) {
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === userId ? { ...user, rank } : user)),
    );
    setIsEditingRank(false);

    if (targetUser.rank !== rank) {
      appendUserEvent(
        createUserEventLogEntry({
          userId,
          category: "account",
          eventType: "user.rank.changed",
          title: "會員等級變更",
          description: `會員等級由 ${targetUser.rank} 調整為 ${rank}。`,
          status: "completed",
          operator: "admin",
          referenceId: userId,
          referenceType: "user",
          method: "Admin Dashboard",
        }),
      );
    }
  };

  const selectInstance = (instanceId: string) => {
    setSelectedInstanceId(instanceId);
    setInstanceActiveTab("console");
  };

  const closeInstanceDetail = () => {
    setSelectedInstanceId(null);
    setInstanceActiveTab("console");
  };

  const handleToolbarBackClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (activeTab === "users" && selectedUserId) {
      event.preventDefault();
      closeUserDetail();
      return;
    }

    if (activeTab === "nodes" && selectedPhysicalNode) {
      event.preventDefault();
      setSelectedPhysicalNode(null);
      return;
    }

    if (activeTab === "nodes" && selectedRegionId) {
      event.preventDefault();
      setSelectedRegionId(null);
      return;
    }

    if (activeTab === "instances" && selectedInstanceId) {
      event.preventDefault();
      closeInstanceDetail();
    }
  };

  return {
    activeTab,
    addNewDoc,
    addNewPlan,
    addNewRegion,
    addNodeToRegion,
    applyBatchBalanceAdjust,
    applyBatchBalanceSet,
    applyBatchBonusDelta,
    applyBatchBonusSet,
    applyBatchBonusZero,
    applyBatchUserStatus,
    batchDeleteInstancesForUsers,
    batchStopInstancesForUsers,
    cancelEditingPlan,
    changeUserRank,
    closeInstanceDetail,
    closeUserDetail,
    deleteDoc,
    deleteNode,
    deletePlan,
    docs,
    editingPlanId,
    editingRegionId,
    editPlanDraft,
    globalRegions,
    handleToolbarBackClick,
    instanceActiveTab,
    instances,
    instancesLoadError,
    isEditingRank,
    isInstancesLoading,
    isUsersLoading,
    newNodeCity,
    plans,
    referrals,
    referralsLoadError,
    removeUsersBatch,
    saveEditingPlan,
    selectInstance,
    selectedPhysicalNode,
    selectedRegionId,
    selectedInstanceId,
    selectUser,
    selectedUserId,
    setUserStatus,
    setActiveTab,
    setEditPlanDraft,
    setEditingRegionId,
    setInstanceActiveTab,
    setIsEditingRank,
    setNewNodeCity,
    setSelectedPhysicalNode,
    setSelectedRegionId,
    setSettings,
    setUserListSearchQuery,
    settings,
    startEditingPlan,
    tickets,
    ticketsLoadError,
    runNodePowerAction,
    updateRegion,
    toggleNodeGame,
    toggleDocStatus,
    toggleUserStatus,
    transactions,
    userEventLogs,
    userListSearchQuery,
    users,
    usersListFiltered,
    usersLoadError,
  };
}
