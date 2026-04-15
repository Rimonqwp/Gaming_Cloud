import type { AdminReferral } from "./adminReferrals";
import type { AdminDashboardUser } from "./adminUsers";

export type AdminDashboardInstance = {
  id: string;
  userId: string;
  game: string;
  node: string;
  status: "running" | "stopped" | "installing";
  cpuUsage: number;
  memUsage: number;
  planName?: string;
  price: number;
};

export type AdminDashboardGlobalNodeStatus = "online" | "offline" | "maintenance";

export type AdminDashboardGlobalNode = {
  id: string;
  city: string;
  latency: string;
  publicIp: string;
  bandwidth: string;
  cpuSpec: string;
  ramSpec: string;
  status: AdminDashboardGlobalNodeStatus;
  supportedGames: string[];
};

export type AdminDashboardGlobalRegion = {
  id: string;
  label: string;
  nodes: AdminDashboardGlobalNode[];
};

export type AdminDashboardRegionInput = {
  label: string;
  city?: string;
};

export type AdminDashboardTransaction = {
  id: string;
  userId: string;
  date: string;
  amount: number;
  type: "deposit" | "payment" | "refund" | "bonus";
  status: "completed" | "pending" | "failed";
  description: string;
  method: string;
};

export type AdminDashboardPaymentMethod = {
  id: string;
  userId: string;
  type: "card" | "crypto" | "bank";
  brand: string;
  label: string;
  last4?: string;
  expiry?: string;
  displayValue?: string;
  isDefault: boolean;
};

export type AdminDashboardTicket = {
  id: string;
  subject: string;
  user: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "answered" | "closed";
  updatedAt: string;
};

export type AdminDashboardUserDetail = {
  user: AdminDashboardUser;
  instances: AdminDashboardInstance[];
  transactions: AdminDashboardTransaction[];
  paymentMethods: AdminDashboardPaymentMethod[];
  tickets: AdminDashboardTicket[];
  referrals?: AdminReferral[];
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === "object" && "error" in payload
        ? String(payload.error)
        : "Request failed.";
    throw new Error(errorMessage);
  }

  return payload as T;
}

export async function getAdminInstances(token: string) {
  const response = await fetch("/api/admin/instances", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await parseResponse<{
    instances?: AdminDashboardInstance[];
  }>(response);

  if (!payload || typeof payload !== "object" || !Array.isArray(payload.instances)) {
    throw new Error("Admin instances payload is invalid.");
  }

  return { instances: payload.instances };
}

export async function getAdminNodes(token: string) {
  const response = await fetch("/api/admin/nodes", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await parseResponse<{
    regions?: AdminDashboardGlobalRegion[];
  }>(response);

  if (!payload || typeof payload !== "object" || !Array.isArray(payload.regions)) {
    throw new Error("Admin nodes payload is invalid.");
  }

  return { regions: payload.regions };
}

export async function createAdminNodeRegion(token: string, input: AdminDashboardRegionInput) {
  const response = await fetch("/api/admin/nodes/regions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const payload = await parseResponse<{
    regions?: AdminDashboardGlobalRegion[];
  }>(response);

  if (!payload || typeof payload !== "object" || !Array.isArray(payload.regions)) {
    throw new Error("Admin create region payload is invalid.");
  }

  return { regions: payload.regions };
}

export async function updateAdminNodeRegion(
  token: string,
  regionId: string,
  input: AdminDashboardRegionInput,
) {
  const response = await fetch(`/api/admin/nodes/regions/${encodeURIComponent(regionId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const payload = await parseResponse<{
    regions?: AdminDashboardGlobalRegion[];
  }>(response);

  if (!payload || typeof payload !== "object" || !Array.isArray(payload.regions)) {
    throw new Error("Admin update region payload is invalid.");
  }

  return { regions: payload.regions };
}

export async function createAdminNode(
  token: string,
  regionId: string,
  input: { city: string },
) {
  const response = await fetch(`/api/admin/nodes/regions/${encodeURIComponent(regionId)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const payload = await parseResponse<{
    regions?: AdminDashboardGlobalRegion[];
  }>(response);

  if (!payload || typeof payload !== "object" || !Array.isArray(payload.regions)) {
    throw new Error("Admin create node payload is invalid.");
  }

  return { regions: payload.regions };
}

export async function deleteAdminNode(token: string, regionId: string, nodeId: string) {
  const response = await fetch(
    `/api/admin/nodes/regions/${encodeURIComponent(regionId)}/nodes/${encodeURIComponent(nodeId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const payload = await parseResponse<{
    regions?: AdminDashboardGlobalRegion[];
  }>(response);

  if (!payload || typeof payload !== "object" || !Array.isArray(payload.regions)) {
    throw new Error("Admin delete node payload is invalid.");
  }

  return { regions: payload.regions };
}

export async function toggleAdminNodeGame(token: string, nodeId: string, gameId: string) {
  const response = await fetch(`/api/admin/nodes/${encodeURIComponent(nodeId)}/games`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ gameId }),
  });

  const payload = await parseResponse<{
    regions?: AdminDashboardGlobalRegion[];
  }>(response);

  if (!payload || typeof payload !== "object" || !Array.isArray(payload.regions)) {
    throw new Error("Admin toggle node game payload is invalid.");
  }

  return { regions: payload.regions };
}

export async function getAdminTickets(token: string) {
  const response = await fetch("/api/admin/tickets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await parseResponse<{
    tickets?: AdminDashboardTicket[];
  }>(response);

  if (!payload || typeof payload !== "object" || !Array.isArray(payload.tickets)) {
    throw new Error("Admin tickets payload is invalid.");
  }

  return { tickets: payload.tickets };
}

export async function getAdminUserDetail(token: string, userId: string) {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/detail`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await parseResponse<AdminDashboardUserDetail>(response);

  if (!payload || typeof payload !== "object" || !payload.user) {
    throw new Error("Admin user detail payload is invalid.");
  }

  return payload;
}
