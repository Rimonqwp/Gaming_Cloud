export type AdminReferral = {
  id: string;
  codeOwnerId: string;
  referredUserId: string;
  referredUserEmail: string;
  date: string;
  bonusEarned: number;
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

export async function getAdminReferrals(token: string) {
  const response = await fetch("/api/admin/referrals", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await parseResponse<{
    referrals?: AdminReferral[];
  }>(response);

  if (!payload || typeof payload !== "object" || !Array.isArray(payload.referrals)) {
    throw new Error(
      "管理端邀请返利接口返回格式不正确。请重启后端服务以加载最新的 /api/admin/referrals 接口。",
    );
  }

  return { referrals: payload.referrals };
}
