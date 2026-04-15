import type { SupportedCurrency } from "./currency";

export type AdminDashboardUser = {
  id: string;
  uid?: string;
  email: string;
  balance: number;
  bonusCredit: number;
  rank: "Bronze" | "Silver" | "Gold" | "Diamond" | "Partner";
  status: "active" | "banned" | "suspended";
  registeredAt: string;
  phone?: string;
  discordId?: string;
  kycVerified?: boolean;
  twoFactorEnabled?: boolean;
  referralCode?: string | null;
  preferredCurrency?: SupportedCurrency;
};

export type AdminWalletKind = "balance" | "bonus";
export type AdminWalletOperation = "add" | "deduct" | "set" | "zero";

export type AdminWalletAdjustmentInput = {
  userIds: string[];
  wallet: AdminWalletKind;
  operation: AdminWalletOperation;
  amount?: number;
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

export async function getAdminUsers(token: string) {
  const response = await fetch("/api/admin/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await parseResponse<{
    users?: AdminDashboardUser[];
    error?: string;
  }>(response);

  if (!payload || typeof payload !== "object" || !Array.isArray(payload.users)) {
    throw new Error("Admin users payload is invalid.");
  }

  return { users: payload.users };
}

export async function adjustAdminUsersWallet(token: string, input: AdminWalletAdjustmentInput) {
  const response = await fetch("/api/admin/users/wallet", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const payload = await parseResponse<{
    users?: AdminDashboardUser[];
    error?: string;
  }>(response);

  if (!payload || typeof payload !== "object" || !Array.isArray(payload.users)) {
    throw new Error("Admin wallet adjustment payload is invalid.");
  }

  return { users: payload.users };
}
