import type { SupportedCurrency } from "./currency";

export type UserPublic = {
  id: number;
  username: string;
  displayName: string;
  uid?: string;
  email?: string;
  balance?: number;
  bonusCredit?: number;
  rank?: "Bronze" | "Silver" | "Gold" | "Diamond" | "Partner";
  status?: "active" | "banned" | "suspended";
  registeredAt?: string;
};

/** 具此 UID 的帳號在帳戶選單中顯示「管理控制台」入口（對應預設管理員）。 */
export const DEFAULT_DASHBOARD_ADMIN_UID = "586342232960";

export function isDashboardAdminUser(user: UserPublic): boolean {
  const key = user.uid?.trim() || String(user.id);
  return key === DEFAULT_DASHBOARD_ADMIN_UID;
}

export type UserSession = {
  user: UserPublic;
  expiresAt: string;
};

export type UserLoginResponse = UserSession & {
  token: string;
};

export type UserAccountPreferences = {
  dashboardNavbarMode?: "site" | "console";
  dashboardNavPlacement?: "navbar_embed" | "below_navbar" | "bottom_float";
  dashboardActiveTab?: string;
  mainNavbarHidden?: boolean;
  preferredCurrency?: SupportedCurrency;
  previewBaseCurrency?: SupportedCurrency;
};

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

const AUTH_ERROR_MESSAGE_MAP: Record<string, string> = {
  "Username already taken.": "这个用户名已经被使用了。",
  "Email already taken.": "这个邮箱已经被注册了。",
  "Username or email already exists.": "用户名或邮箱已存在。",
  "Registration failed.": "注册失败，请稍后重试。",
  "Request failed.": "请求失败，请稍后重试。",
  "Malformed request.": "请求格式不正确。",
  "User registration is disabled.": "当前已关闭用户注册。",
  "Email and password are required.": "邮箱和密码不能为空。",
  "Invalid admin credentials.": "管理员账号或密码错误。",
  "Session expired or missing.": "登录状态已过期，请重新登录。",
};

function normalizeAuthErrorMessage(message: string) {
  return AUTH_ERROR_MESSAGE_MAP[message] ?? message;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === "object" && "error" in payload
        ? String(payload.error)
        : "Request failed.";
    throw new Error(normalizeAuthErrorMessage(errorMessage));
  }

  return payload as T;
}

export async function loginUser(identifier: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ identifier, password }),
  });

  return parseResponse<UserLoginResponse>(response);
}

export async function registerUser(username: string, email: string, password: string) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ username, email, password }),
  });

  return parseResponse<UserLoginResponse>(response);
}

export async function getUserSession(token: string) {
  const response = await fetch("/api/auth/session", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse<UserSession>(response);
}

export async function logoutUser(token: string) {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse<{ ok: boolean }>(response);
}

export async function getUserPreferences(token: string) {
  const response = await fetch("/api/auth/preferences", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse<{ preferences: UserAccountPreferences }>(response);
}

export async function patchUserPreferences(
  token: string,
  patch: Partial<UserAccountPreferences>,
) {
  const response = await fetch("/api/auth/preferences", {
    method: "PATCH",
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patch),
  });

  return parseResponse<{ preferences: UserAccountPreferences }>(response);
}
