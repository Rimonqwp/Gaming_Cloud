export type AdminSession = {
  admin: {
    id: number;
    email: string;
    displayName: string;
  };
  expiresAt: string;
};

export type AdminLoginResponse = AdminSession & {
  token: string;
};

const JSON_HEADERS = {
  "Content-Type": "application/json",
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

export async function loginAdmin(email: string, password: string) {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password }),
  });

  return parseResponse<AdminLoginResponse>(response);
}

export async function getAdminSession(token: string) {
  const response = await fetch("/api/admin/session", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse<AdminSession>(response);
}

export async function logoutAdmin(token: string) {
  const response = await fetch("/api/admin/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse<{ ok: boolean }>(response);
}

