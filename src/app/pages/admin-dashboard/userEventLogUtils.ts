import type { Referral, Transaction } from "./adminDashboardTypes";

export type UserEventLogCategory = "funding" | "account" | "instance" | "referral" | "system";
export type UserEventLogStatus = "completed" | "pending" | "failed" | "info";
export type UserEventLogReferenceType = "transaction" | "instance" | "referral" | "user" | "system";

export type UserEventLogEntry = {
  id: string;
  userId: string;
  timestamp: string;
  category: UserEventLogCategory;
  eventType: string;
  title: string;
  description: string;
  amount?: number | null;
  currency?: string | null;
  status: UserEventLogStatus;
  referenceId?: string | null;
  referenceType?: UserEventLogReferenceType | null;
  operator?: "system" | "admin" | "user" | null;
  method?: string | null;
  meta?: Record<string, unknown>;
};

const TRAILING_PARENTHETICAL_SUFFIX_REGEX = /\s*[（(][^（）()]*[）)]\s*$/u;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatUserEventTimestamp(input: Date) {
  return `${input.getFullYear()}-${pad(input.getMonth() + 1)}-${pad(input.getDate())} ${pad(input.getHours())}:${pad(input.getMinutes())}`;
}

export function getUserEventLogDisplayDescription(entry: Pick<UserEventLogEntry, "description" | "status" | "eventType">) {
  const description = entry.description.trim();
  const emailMatch = description.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  if (entry.eventType === "referral.converted" && emailMatch) {
    return emailMatch[0];
  }

  if (entry.status !== "pending") {
    return description;
  }

  const simplified = description.replace(TRAILING_PARENTHETICAL_SUFFIX_REGEX, "").trim();
  return simplified || description;
}

function parseEventTimestamp(timestamp: string) {
  const normalized = timestamp.includes("T") ? timestamp : timestamp.replace(" ", "T");
  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function createRuntimeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createUserEventLogEntry(
  input: Omit<UserEventLogEntry, "id" | "timestamp" | "status"> &
    Partial<Pick<UserEventLogEntry, "id" | "timestamp" | "status">>,
): UserEventLogEntry {
  return {
    id: input.id ?? createRuntimeId("EVT"),
    timestamp: input.timestamp ?? formatUserEventTimestamp(new Date()),
    status: input.status ?? "info",
    ...input,
  };
}

export function mapTransactionToUserEventLog(transaction: Transaction): UserEventLogEntry {
  const category: UserEventLogCategory = transaction.type === "bonus" ? "referral" : "funding";

  const eventType =
    transaction.type === "deposit"
      ? `transaction.deposit.${transaction.status}`
      : transaction.type === "payment"
        ? `transaction.payment.${transaction.status}`
        : transaction.type === "refund"
          ? `transaction.refund.${transaction.status}`
          : "referral.bonus.granted";

  const title = (() => {
    const { type, status } = transaction;
    if (type === "deposit") {
      if (status === "failed") return "充值失敗";
      if (status === "pending") return "充值處理中";
      return "充值成功";
    }
    if (type === "payment") {
      if (status === "failed") return "扣費失敗";
      if (status === "pending") return "扣費處理中";
      return "扣費完成";
    }
    if (type === "refund") {
      if (status === "failed") return "退款失敗";
      if (status === "pending") return "退款處理中";
      return "退款完成";
    }
    if (status === "failed") return "獎勵發放失敗";
    if (status === "pending") return "獎勵處理中";
    return "邀請獎勵發放";
  })();

  return {
    id: `TX-${transaction.id}`,
    userId: transaction.userId,
    timestamp: transaction.date,
    category,
    eventType,
    title,
    description: transaction.description,
    amount: transaction.amount,
    currency: "USD",
    status: transaction.status,
    referenceId: transaction.id,
    referenceType: "transaction",
    operator: transaction.type === "payment" ? "system" : "user",
    method: transaction.method,
  };
}

export function mapReferralToUserEventLog(referral: Referral): UserEventLogEntry {
  return {
    id: `REF-${referral.id}`,
    userId: referral.codeOwnerId,
    timestamp: referral.date,
    category: "referral",
    eventType: "referral.converted",
    title: "邀請轉化成功",
    description: `${referral.referredUserEmail} 已透過邀請註冊並產生獎勵。`,
    amount: referral.bonusEarned,
    currency: "USD",
    status: "completed",
    referenceId: referral.referredUserId,
    referenceType: "referral",
    operator: "system",
    method: "Referral Program",
  };
}

export function buildUserEventLogs(
  transactions: Transaction[],
  referrals: Referral[],
  runtimeLogs: UserEventLogEntry[] = [],
) {
  const merged = [...runtimeLogs, ...transactions.map(mapTransactionToUserEventLog), ...referrals.map(mapReferralToUserEventLog)];
  const deduped = new Map<string, UserEventLogEntry>();

  for (const entry of merged) {
    if (!deduped.has(entry.id)) {
      deduped.set(entry.id, entry);
    }
  }

  return [...deduped.values()].sort((left, right) => {
    const diff = parseEventTimestamp(right.timestamp) - parseEventTimestamp(left.timestamp);
    if (diff !== 0) {
      return diff;
    }
    return right.id.localeCompare(left.id);
  });
}
