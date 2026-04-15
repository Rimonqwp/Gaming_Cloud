import React, {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Bitcoin,
  CheckCircle2,
  CreditCard,
  Crown,
  DollarSign,
  Edit2,
  Gift,
  History,
  Link as LinkIcon,
  MapPin,
  MessageSquare,
  Minus,
  Monitor,
  Package,
  Pause,
  Plus,
  Search,
  Server,
  Settings,
  ShieldBan,
  ShieldCheck,
  Smartphone,
  Star,
  Trophy,
  Trash2,
  UserX,
  UserRound,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { AdminDashboardBatchMenu, parseUsdInput } from "./AdminDashboardBatchMenu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  formatCurrencyAmount,
  formatCurrencyWithCode,
  getCurrencySymbol,
  normalizeSupportedCurrency,
} from "../../lib/currency";
import { getUserEventLogDisplayDescription, type UserEventLogEntry } from "./userEventLogUtils";

import type { Instance, Referral, User } from "./adminDashboardTypes";

const ACTIVITY_LOG_PAGE_SIZE = 10;

function getUserUid(user: Pick<User, "id" | "uid">) {
  return user.uid?.trim() || user.id;
}

function getDisplayReferralCode(referralCode?: string | null) {
  const trimmed = referralCode?.trim();
  return trimmed ? trimmed : "-";
}

function renderSystemAvatar(size: "detail" | "list", status: User["status"]) {
  const detailShellClass =
    status === "active"
      ? "h-24 w-24 border-4 border-[#0a0a0c] bg-emerald-950/80 text-emerald-400/95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
      : status === "suspended"
        ? "h-24 w-24 border-4 border-[#0a0a0c] bg-amber-950/80 text-amber-400/95 shadow-[0_0_20px_rgba(251,191,36,0.28)]"
        : "h-24 w-24 border-4 border-[#0a0a0c] bg-red-950/80 text-red-400/95 shadow-[0_0_20px_rgba(239,68,68,0.3)]";
  const listShellClass =
    status === "active"
      ? "h-6 w-6 bg-emerald-950/80 text-emerald-400/95"
      : status === "suspended"
        ? "h-6 w-6 bg-amber-950/80 text-amber-400/95"
        : "h-6 w-6 bg-red-950/80 text-red-400/95";
  const shellClass = size === "detail" ? detailShellClass : listShellClass;

  const iconClass = size === "detail" ? "h-10 w-10" : "h-3.5 w-3.5";

  return (
    <div
      role="img"
      aria-label="avatar"
      className={`relative z-10 flex items-center justify-center rounded-full ${shellClass}`}
    >
      <UserRound className={iconClass} aria-hidden />
    </div>
  );
}

function renderRankBadge(rank: User["rank"], variant: "list" | "detail") {
  const paddingClass = variant === "detail" ? "px-2" : "px-1.5";

  if (rank === "Bronze") {
    return (
      <span className={`flex items-center gap-1 rounded border border-[#cd7f32]/20 bg-[#cd7f32]/10 ${paddingClass} py-0.5 text-[10px] font-bold text-[#cd7f32]`}>
        <Star className="h-3 w-3" /> 青銅會員
      </span>
    );
  }

  if (rank === "Silver") {
    return (
      <span className={`flex items-center gap-1 rounded border border-white/20 bg-white/10 ${paddingClass} py-0.5 text-[10px] font-bold text-zinc-300`}>
        <Star className="h-3 w-3" /> 白銀會員
      </span>
    );
  }

  if (rank === "Gold") {
    return (
      <span className={`flex items-center gap-1 rounded border border-yellow-500/20 bg-yellow-500/10 ${paddingClass} py-0.5 text-[10px] font-bold text-yellow-400`}>
        <Crown className="h-3 w-3" /> 黃金會員
      </span>
    );
  }

  if (rank === "Diamond") {
    return (
      <span className={`flex items-center gap-1 rounded border border-cyan-500/20 bg-cyan-500/10 ${paddingClass} py-0.5 text-[10px] font-bold text-cyan-400`}>
        <Trophy className="h-3 w-3" /> 鑽石會員
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-1 rounded border border-purple-500/20 bg-purple-500/10 ${paddingClass} py-0.5 text-[10px] font-bold text-purple-400`}>
      <LinkIcon className="h-3 w-3" /> 商業夥伴
    </span>
  );
}

function getEventTypeLabel(entry: UserEventLogEntry) {
  if (entry.category === "funding") {
    return "資金";
  }
  if (entry.category === "account") {
    return "帳號";
  }
  if (entry.category === "instance") {
    return "實例";
  }
  if (entry.category === "referral") {
    return "邀請";
  }
  return "系統";
}

function getEventTypeTextClass(entry: UserEventLogEntry) {
  if (entry.status === "failed") {
    return "text-zinc-500";
  }
  if (entry.status === "pending") {
    return "text-amber-400";
  }
  if (entry.category === "funding") {
    return "text-emerald-400";
  }
  if (entry.category === "account") {
    return "text-sky-400";
  }
  if (entry.category === "instance") {
    return "text-orange-400";
  }
  if (entry.category === "referral") {
    return "text-purple-400";
  }
  return "text-zinc-400";
}

function getEventAmountClass(entry: UserEventLogEntry) {
  const amountMissing = entry.amount === null || entry.amount === undefined;
  if (entry.status === "failed") {
    return amountMissing ? "text-zinc-600" : "text-zinc-500";
  }
  if (entry.status === "pending") {
    return amountMissing ? "text-amber-500/75" : "text-amber-300";
  }
  if (amountMissing) {
    return "text-zinc-600";
  }
  if (entry.amount > 0) {
    return entry.category === "referral" || entry.eventType.startsWith("wallet.bonus")
      ? "text-purple-400"
      : "text-emerald-400";
  }
  if (entry.amount < 0) {
    return "text-red-400";
  }
  return "text-zinc-300";
}

function formatEventAmountValue(amount: number) {
  const absolute = Math.abs(amount);
  if (absolute > 0 && absolute < 0.01) {
    return amount.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  }
  return amount.toFixed(2);
}

function renderEventStatus(entry: UserEventLogEntry) {
  if (entry.status === "completed") {
    return <span className="text-xs font-medium text-emerald-400">成功</span>;
  }

  if (entry.status === "pending") {
    return <span className="text-xs font-medium text-amber-400">處理中</span>;
  }

  if (entry.status === "failed") {
    return <span className="text-xs font-medium text-red-400">失敗</span>;
  }

  return <span className="text-xs font-medium text-zinc-400">資訊</span>;
}

type AutoShrinkTextProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  minScale?: number;
  title?: string;
  align?: "center" | "start";
};

function AutoShrinkText({
  children,
  className = "",
  contentClassName = "",
  minScale = 0.58,
  title,
  align = "center",
}: AutoShrinkTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const container = containerRef.current;
      const content = contentRef.current;

      if (!container || !content) {
        return;
      }

      const availableWidth = container.clientWidth;
      const contentWidth = content.scrollWidth;

      if (!availableWidth || !contentWidth) {
        setScale(1);
        return;
      }

      const nextScale = Math.max(minScale, Math.min(1, availableWidth / contentWidth));
      setScale((previous) => (Math.abs(previous - nextScale) < 0.01 ? previous : nextScale));
    };

    updateScale();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateScale);
      return () => window.removeEventListener("resize", updateScale);
    }

    const observer = new ResizeObserver(() => updateScale());

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [children, minScale]);

  return (
    <span ref={containerRef} className={`block w-full overflow-hidden ${className}`} title={title}>
      <span
        ref={contentRef}
        className={`block w-max max-w-none whitespace-nowrap ${contentClassName}`}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: align === "start" ? "left center" : "center center",
          marginInline: align === "start" ? "0" : "auto",
        }}
      >
        {children}
      </span>
    </span>
  );
}

type UsersTabProps = {
  users: User[];
  filteredUsers: User[];
  usersLoadError: string | null;
  isUsersLoading: boolean;
  userListSearchQuery: string;
  setUserListSearchQuery: (value: string) => void;
  selectedUserId: string | null;
  isEditingRank: boolean;
  setIsEditingRank: Dispatch<SetStateAction<boolean>>;
  onSelectUser: (userId: string) => void;
  onCloseUserDetail: () => void;
  onSetUserStatus: (userId: string, status: User["status"]) => void;
  onChangeUserRank: (userId: string, rank: User["rank"]) => void;
  applyBatchUserStatus: (userIds: string[], status: User["status"]) => void;
  applyBatchBalanceAdjust: (userIds: string[], delta: number) => Promise<void>;
  applyBatchBalanceSet: (userIds: string[], value: number) => Promise<void>;
  applyBatchBonusDelta: (userIds: string[], delta: number) => Promise<void>;
  applyBatchBonusSet: (userIds: string[], value: number) => Promise<void>;
  applyBatchBonusZero: (userIds: string[]) => Promise<void>;
  removeUsersBatch: (userIds: string[]) => void;
  batchStopInstancesForUsers: (userIds: string[]) => void;
  batchDeleteInstancesForUsers: (userIds: string[]) => void;
  instances: Instance[];
  referrals: Referral[];
  referralsLoadError: string | null;
  userEventLogs: UserEventLogEntry[];
};

export function AdminDashboardUsersTab({
  users,
  filteredUsers,
  usersLoadError,
  isUsersLoading,
  userListSearchQuery,
  setUserListSearchQuery,
  selectedUserId,
  isEditingRank,
  setIsEditingRank,
  onSelectUser,
  onCloseUserDetail,
  onSetUserStatus,
  onChangeUserRank,
  applyBatchUserStatus,
  applyBatchBalanceAdjust,
  applyBatchBalanceSet,
  applyBatchBonusDelta,
  applyBatchBonusSet,
  applyBatchBonusZero,
  removeUsersBatch,
  batchStopInstancesForUsers,
  batchDeleteInstancesForUsers,
  instances,
  referrals,
  referralsLoadError,
  userEventLogs,
}: UsersTabProps) {
  const selectedUser = selectedUserId ? users.find((user) => user.id === selectedUserId) ?? null : null;

  const userDetailActivityLogs = useMemo(
    () => (selectedUser ? userEventLogs.filter((entry) => entry.userId === selectedUser.id) : []),
    [selectedUser, userEventLogs],
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [batchMenuOpen, setBatchMenuOpen] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const batchMenuRef = useRef<HTMLDivElement>(null);

  type WalletModalKind = "balance" | "bonus";
  type WalletOp = "add" | "deduct" | "set" | "zero";
  const [walletModalKind, setWalletModalKind] = useState<WalletModalKind | null>(null);
  const [walletOp, setWalletOp] = useState<WalletOp>("add");
  const [walletAmount, setWalletAmount] = useState("");
  const [isWalletSubmitting, setIsWalletSubmitting] = useState(false);
  const [activityLogPage, setActivityLogPage] = useState(1);
  const [activityLogQuery, setActivityLogQuery] = useState("");

  useEffect(() => {
    setActivityLogPage(1);
    setActivityLogQuery("");
  }, [selectedUserId]);

  useEffect(() => {
    setActivityLogPage(1);
  }, [activityLogQuery]);

  useEffect(() => {
    const allowed = new Set(filteredUsers.map((user) => user.id));
    setSelectedIds((previous) => {
      const next = new Set([...previous].filter((id) => allowed.has(id)));
      if (next.size !== previous.size) {
        return next;
      }
      for (const id of previous) {
        if (!next.has(id)) {
          return next;
        }
      }
      return previous;
    });
  }, [filteredUsers]);

  useEffect(() => {
    if (!batchMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const root = batchMenuRef.current;
      if (root && !root.contains(event.target as Node)) {
        setBatchMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [batchMenuOpen]);

  useEffect(() => {
    if (!banner) {
      return;
    }
    const timer = window.setTimeout(() => setBanner(null), 5200);
    return () => window.clearTimeout(timer);
  }, [banner]);

  useEffect(() => {
    if (!selectedUserId) {
      setWalletModalKind(null);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (!walletModalKind) {
      return;
    }
    setWalletOp("add");
    setWalletAmount("");
  }, [walletModalKind]);

  const selectedCount = selectedIds.size;
  const allVisibleSelected =
    filteredUsers.length > 0 && filteredUsers.every((user) => selectedIds.has(user.id));

  const requireSelection = (): string[] | null => {
    if (selectedIds.size === 0) {
      setBanner({ type: "err", text: "請先勾選至少一位使用者（目前篩選結果）。" });
      return null;
    }
    return [...selectedIds];
  };

  const runBatchNotice = (message: string) => {
    setBatchMenuOpen(false);
    setBanner({ type: "ok", text: message });
  };

  const walletUserPreferredCurrency = normalizeSupportedCurrency(selectedUser?.preferredCurrency, "CNY");
  const walletInputCurrency = walletUserPreferredCurrency;
  const walletInputSymbol = getCurrencySymbol(walletInputCurrency);
  const walletDisplayCurrency = walletUserPreferredCurrency;
  const roundWalletAmount = (value: number) => Number(value.toFixed(2));

  const filteredUserActivityLogs = useMemo(() => {
    const query = activityLogQuery.trim().toLowerCase();
    if (!query) {
      return userDetailActivityLogs;
    }

    return userDetailActivityLogs.filter((entry) => {
      const searchFields = [
        entry.timestamp,
        getEventTypeLabel(entry),
        entry.title,
        getUserEventLogDisplayDescription(entry),
        entry.referenceId ?? "",
        entry.eventType,
        entry.amount === null || entry.amount === undefined ? "" : formatEventAmountValue(entry.amount),
      ];

      return searchFields.some((field) => field.toLowerCase().includes(query));
    });
  }, [activityLogQuery, userDetailActivityLogs]);

  const walletPreviewAfter = (() => {
    if (!selectedUser || !walletModalKind || walletOp === "zero") {
      return null;
    }
    const parsed = parseUsdInput(walletAmount);
    if (parsed === null) {
      return null;
    }
    const base = walletModalKind === "balance" ? selectedUser.balance : selectedUser.bonusCredit;
    if (walletOp === "add") {
      return Math.max(0, roundWalletAmount(base + parsed));
    }
    if (walletOp === "deduct") {
      return Math.max(0, roundWalletAmount(base - parsed));
    }
    return Math.max(0, roundWalletAmount(parsed));
  })();

  const walletPreviewCurrentAmount =
    selectedUser && walletModalKind
      ? walletModalKind === "balance"
        ? selectedUser.balance
        : selectedUser.bonusCredit
      : null;

  const walletPreviewCurrentDisplay =
    walletPreviewCurrentAmount === null
      ? "—"
      : formatCurrencyWithCode(walletPreviewCurrentAmount, walletDisplayCurrency);

  const walletPreviewAfterDisplay =
    walletPreviewAfter === null
      ? "—"
      : formatCurrencyWithCode(walletPreviewAfter, walletDisplayCurrency);

  const commitWalletChange = () => {
    if (!selectedUser || !walletModalKind) {
      return;
    }
    const ids = [selectedUser.id];
    if (walletModalKind === "bonus" && walletOp === "zero") {
      applyBatchBonusZero(ids);
      setBanner({ type: "ok", text: "已將此使用者的推廣贈金清零（前端示意）。" });
      setWalletModalKind(null);
      return;
    }
    const amount = parseUsdInput(walletAmount);
    if (amount === null) {
      setBanner({ type: "err", text: "金額格式不正確。" });
      return;
    }
    if (walletModalKind === "balance") {
      if (walletOp === "add") {
        applyBatchBalanceAdjust(ids, amount);
        setBanner({ type: "ok", text: `已為此使用者增加 $${amount.toFixed(2)} 真實餘額（前端示意）。` });
      } else if (walletOp === "deduct") {
        applyBatchBalanceAdjust(ids, -amount);
        setBanner({ type: "ok", text: `已為此使用者減少 $${amount.toFixed(2)} 真實餘額（前端示意）。` });
      } else {
        applyBatchBalanceSet(ids, amount);
        setBanner({ type: "ok", text: `已將此使用者的真實餘額設為 $${amount.toFixed(2)}（前端示意）。` });
      }
    } else {
      if (walletOp === "add") {
        applyBatchBonusDelta(ids, amount);
        setBanner({ type: "ok", text: `已為此使用者增加 $${amount.toFixed(2)} 推廣贈金（前端示意）。` });
      } else if (walletOp === "deduct") {
        applyBatchBonusDelta(ids, -amount);
        setBanner({ type: "ok", text: `已為此使用者減少 $${amount.toFixed(2)} 推廣贈金（前端示意）。` });
      } else {
        applyBatchBonusSet(ids, amount);
        setBanner({ type: "ok", text: `已將此使用者的推廣贈金設為 $${amount.toFixed(2)}（前端示意）。` });
      }
    }
    setWalletModalKind(null);
  };

  const commitWalletChangeApi = async () => {
    if (!selectedUser || !walletModalKind) {
      return;
    }

    const ids = [selectedUser.id];
    const amount = parseUsdInput(walletAmount);
    const formattedInputAmount =
      amount === null ? null : formatCurrencyWithCode(amount, walletInputCurrency);

    if (walletOp !== "zero" && amount === null) {
      setBanner({ type: "err", text: "金額格式不正確。" });
      return;
    }

    setIsWalletSubmitting(true);

    try {
      if (walletModalKind === "bonus" && walletOp === "zero") {
        await applyBatchBonusZero(ids);
        setBanner({ type: "ok", text: "已將此使用者的推廣贈金清零。" });
      } else if (walletModalKind === "balance") {
        if (walletOp === "add") {
          await applyBatchBalanceAdjust(ids, amount ?? 0);
          setBanner({ type: "ok", text: `已為此使用者增加 ${formattedInputAmount ?? "—"} 真實餘額。` });
        } else if (walletOp === "deduct") {
          await applyBatchBalanceAdjust(ids, -(amount ?? 0));
          setBanner({ type: "ok", text: `已為此使用者扣除 ${formattedInputAmount ?? "—"} 真實餘額。` });
        } else {
          await applyBatchBalanceSet(ids, amount ?? 0);
          setBanner({ type: "ok", text: `已將此使用者的真實餘額設為 ${formattedInputAmount ?? "—"}。` });
        }
      } else if (walletOp === "add") {
        await applyBatchBonusDelta(ids, amount ?? 0);
        setBanner({ type: "ok", text: `已為此使用者增加 ${formattedInputAmount ?? "—"} 推廣贈金。` });
      } else if (walletOp === "deduct") {
        await applyBatchBonusDelta(ids, -(amount ?? 0));
        setBanner({ type: "ok", text: `已為此使用者扣除 ${formattedInputAmount ?? "—"} 推廣贈金。` });
      } else {
        await applyBatchBonusSet(ids, amount ?? 0);
        setBanner({ type: "ok", text: `已將此使用者的推廣贈金設為 ${formattedInputAmount ?? "—"}。` });
      }

      setWalletModalKind(null);
    } catch (error) {
      setBanner({
        type: "err",
        text: error instanceof Error ? error.message : "無法套用調整。",
      });
    } finally {
      setIsWalletSubmitting(false);
    }
  };

  if (selectedUser) {
    const userInstances = instances.filter((instance) => instance.userId === selectedUser.id);
    const userActivityLogs = filteredUserActivityLogs;
    const activityLogTotalPages = Math.max(1, Math.ceil(userActivityLogs.length / ACTIVITY_LOG_PAGE_SIZE));
    const activityLogSafePage = Math.min(activityLogPage, activityLogTotalPages);
    const paginatedUserActivityLogs = userActivityLogs.slice(
      (activityLogSafePage - 1) * ACTIVITY_LOG_PAGE_SIZE,
      activityLogSafePage * ACTIVITY_LOG_PAGE_SIZE,
    );

    const userReferrals = referrals.filter((referral) => referral.codeOwnerId === selectedUser.id);
    const totalReferralBonus = userReferrals.reduce((sum, referral) => sum + referral.bonusEarned, 0);
    const displayReferralCode = getDisplayReferralCode(selectedUser.referralCode);
    const hasReferralCode = displayReferralCode !== "-";
    const displayPreferredCurrency = normalizeSupportedCurrency(selectedUser.preferredCurrency);
    const balanceDisplayAmount = formatCurrencyAmount(selectedUser.balance, displayPreferredCurrency);
    const bonusDisplayAmount = formatCurrencyAmount(selectedUser.bonusCredit, displayPreferredCurrency);

    return (
      <motion.div
        key={`user-detail-${selectedUser.id}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <button
            onClick={onCloseUserDetail}
            className="flex w-fit items-center gap-2 text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" /> 返回使用者列表
          </button>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10">
              重設密碼
            </button>
            <button
              className={`rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                selectedUser.status === "suspended"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-400 hover:text-black"
              }`}
              onClick={() =>
                onSetUserStatus(
                  selectedUser.id,
                  selectedUser.status === "suspended" ? "active" : "suspended",
                )
              }
            >
              {selectedUser.status === "suspended" ? "解除掛起" : "掛起此使用者"}
            </button>
            <button
              className={`rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                selectedUser.status === "banned"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black"
                  : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
              }`}
              onClick={() =>
                onSetUserStatus(
                  selectedUser.id,
                  selectedUser.status === "banned" ? "active" : "banned",
                )
              }
            >
              {selectedUser.status === "banned" ? "解除封鎖" : "封鎖此使用者"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2.5fr]">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0c]/80 p-6 shadow-2xl backdrop-blur-xl">
              <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  {renderSystemAvatar("detail", selectedUser.status)}
                  {selectedUser.status === "active" ? (
                    <div className="absolute bottom-1 right-1 z-20 h-5 w-5 rounded-full border-4 border-[#0a0a0c] bg-emerald-500" />
                  ) : selectedUser.status === "suspended" ? (
                    <div className="absolute bottom-1 right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full border-4 border-[#0a0a0c] bg-amber-400">
                      <Pause className="h-2 w-2 text-black" />
                    </div>
                  ) : (
                    <div className="absolute bottom-1 right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full border-4 border-[#0a0a0c] bg-red-500">
                      <X className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="mt-4 flex items-center gap-2 text-xl font-black text-white">{selectedUser.email}</h3>
                <div className="relative mt-2 flex flex-col items-center">
                  <button
                    onClick={() => setIsEditingRank((current) => !current)}
                    className="group flex items-center gap-1.5 transition-transform hover:scale-105"
                    title="點擊變更等級"
                  >
                    {renderRankBadge(selectedUser.rank, "detail")}
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 opacity-0 transition-opacity group-hover:opacity-100">
                      <Edit2 className="h-3 w-3 text-zinc-400" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isEditingRank && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        className="absolute top-full z-50 mt-2 flex w-32 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0c]/95 p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
                      >
                        {(["Bronze", "Silver", "Gold", "Diamond", "Partner"] as User["rank"][]).map((rank) => (
                          <button
                            key={rank}
                            onClick={() => onChangeUserRank(selectedUser.id, rank)}
                            className={`rounded-lg px-3 py-2 text-left text-xs font-bold transition-colors hover:bg-white/10 ${
                              selectedUser.rank === rank ? "bg-white/5 text-white" : "text-zinc-400"
                            }`}
                          >
                            {renderRankBadge(rank, "list")}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const uid = getUserUid(selectedUser);
                    try {
                      await navigator.clipboard.writeText(uid);
                      setBanner({ type: "ok", text: "已複製 UID" });
                    } catch {
                      setBanner({ type: "err", text: "複製失敗，請改用手動複製" });
                    }
                  }}
                  className="mt-2 cursor-pointer select-none rounded px-1.5 py-0.5 font-mono text-xs text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-400"
                  title="點擊複製 UID"
                  aria-label="複製使用者 UID"
                >
                  UID {getUserUid(selectedUser)}
                </button>
                <span className="mt-1 text-xs text-zinc-400">註冊於 {selectedUser.registeredAt}</span>
              </div>

              <div className="my-6 h-px w-full bg-white/10" />

              <div
                className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-amber-500/35 bg-amber-500/[0.08] px-3 py-2 text-center"
                role="note"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
                <p className="text-[11px] font-medium leading-snug text-amber-100">
                  此使用者在個人設定中的貨幣系統為{" "}
                  <span className="font-mono font-bold text-amber-200">{displayPreferredCurrency}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-blue-500/20 bg-black/40 p-4">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="mb-1 flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                    <DollarSign className="h-3.5 w-3.5" /> 真實餘額
                  </span>
                  <AutoShrinkText
                    className="relative z-10 self-stretch"
                    contentClassName="text-center text-2xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    minScale={0.52}
                    title={balanceDisplayAmount}
                  >
                    {balanceDisplayAmount}
                  </AutoShrinkText>
                  <AutoShrinkText
                    className="relative z-10 mt-1 self-stretch"
                    contentClassName="text-[10px] font-mono text-zinc-500"
                    minScale={0.72}
                    title={`帳戶幣種 ${displayPreferredCurrency}`}
                  >
                    {`帳戶幣種 ${displayPreferredCurrency}`}
                  </AutoShrinkText>
                  <button
                    type="button"
                    onClick={() => setWalletModalKind("balance")}
                    className="relative z-10 mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 py-1.5 text-[10px] font-bold text-blue-400 transition-colors hover:bg-blue-500/20"
                  >
                    <Edit2 className="h-3 w-3" /> 修改額度
                  </button>
                </div>

                <div className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-purple-500/20 bg-black/40 p-4">
                  <div className="absolute inset-0 bg-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="mb-1 flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                    <Gift className="h-3.5 w-3.5 text-purple-400" /> 推廣贈金
                  </span>
                  <AutoShrinkText
                    className="relative z-10 self-stretch"
                    contentClassName="text-center text-2xl font-black text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    minScale={0.52}
                    title={bonusDisplayAmount}
                  >
                    {bonusDisplayAmount}
                  </AutoShrinkText>
                  <AutoShrinkText
                    className="relative z-10 mt-1 self-stretch"
                    contentClassName="text-[10px] font-mono text-zinc-500"
                    minScale={0.72}
                    title={`帳戶幣種 ${displayPreferredCurrency}`}
                  >
                    {`帳戶幣種 ${displayPreferredCurrency}`}
                  </AutoShrinkText>
                  <button
                    type="button"
                    onClick={() => setWalletModalKind("bonus")}
                    className="relative z-10 mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 py-1.5 text-[10px] font-bold text-purple-400 transition-colors hover:bg-purple-500/20"
                  >
                    <Edit2 className="h-3 w-3" /> 修改額度
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0a0a0c]/80 p-6 shadow-2xl backdrop-blur-xl">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-purple-400" /> 身份與安全綁定
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 text-sm">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <LinkIcon className="h-4 w-4 text-purple-400" /> 邀請碼
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${
                      hasReferralCode
                        ? "border border-purple-500/20 bg-purple-500/10 text-purple-400"
                        : "border border-dashed border-white/10 bg-white/5 text-zinc-500"
                    }`}
                  >
                    {displayReferralCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Smartphone className="h-4 w-4" /> 手機號碼
                  </div>
                  <div className="font-mono text-white">{selectedUser.phone || <span className="italic text-zinc-600">未綁定</span>}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <MessageSquare className="h-4 w-4" /> Discord
                  </div>
                  <div className="font-mono text-white">{selectedUser.discordId || <span className="italic text-zinc-600">未綁定</span>}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <CheckCircle2 className="h-4 w-4" /> 身份驗證 (KYC)
                  </div>
                  <div>
                    {selectedUser.kycVerified ? (
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400">已驗證</span>
                    ) : (
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-bold text-zinc-500">未驗證</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <ShieldCheck className="h-4 w-4" /> 兩步驟驗證 (2FA)
                  </div>
                  <div>
                    {selectedUser.twoFactorEnabled ? (
                      <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-400">已啟用</span>
                    ) : (
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-bold text-zinc-500">未啟用</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0a0a0c]/80 p-6 shadow-2xl backdrop-blur-xl">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                <CreditCard className="h-4 w-4 text-emerald-400" /> 已儲存付款方式
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex h-6 w-10 items-center justify-center rounded bg-gradient-to-br from-blue-600 to-indigo-800 text-[8px] font-black italic text-white">
                    VISA
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">•••• 4242</div>
                    <div className="text-xs text-zinc-500">Exp: 12/28</div>
                  </div>
                  <button className="text-zinc-500 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {selectedUser.id === "USR-0829" && (
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex h-6 w-10 items-center justify-center rounded border border-[#F7931A]/30 bg-[#F7931A]/20 text-[#F7931A]">
                      <Bitcoin className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">Crypto Wallet</div>
                      <div className="text-xs text-zinc-500">0x...A1b2</div>
                    </div>
                    <button className="text-zinc-500 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#0a0a0c]/80 p-6 shadow-2xl backdrop-blur-xl">
              <h4 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <Monitor className="h-5 w-5 text-orange-400" /> 名下運行實例 ({userInstances.length})
              </h4>

              {userInstances.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 py-8 text-center text-sm text-zinc-500">
                  此使用者目前沒有任何實例
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {userInstances.map((instance) => (
                    <div
                      key={instance.id}
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-black/40 p-4 transition-colors hover:border-orange-500/30 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-white/5 p-3">
                          <Server className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-bold text-white">{instance.game}</span>
                            <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-xs text-zinc-500">{instance.id}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {instance.node}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" /> {instance.planName}
                            </span>
                          </div>
                        </div>
                        {/*
                          <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs text-zinc-400">
                          <div className="font-mono">
                            玩家貨幣:{" "}
                            {walletPreviewCurrentUsd === null
                              ? "—"
                              : `${formatCurrencyWithCode(
                                  convertUsdToCurrency(walletPreviewCurrentUsd, walletInputCurrency),
                                  walletInputCurrency,
                                )} → ${
                                  walletPreviewAfter === null
                                    ? "—"
                                    : formatCurrencyWithCode(
                                        convertUsdToCurrency(walletPreviewAfter, walletInputCurrency),
                                        walletInputCurrency,
                                      )
                                }`}
                          </div>
                          <div className="font-mono">
                            系統預覽:{" "}
                            {walletPreviewCurrentUsd === null
                              ? "—"
                              : `${formatCurrencyWithCode(
                                  convertUsdToCurrency(walletPreviewCurrentUsd, previewBaseCurrency),
                                  previewBaseCurrency,
                                )} → ${
                                  walletPreviewAfter === null
                                    ? "—"
                                    : formatCurrencyWithCode(
                                        convertUsdToCurrency(walletPreviewAfter, previewBaseCurrency),
                                        previewBaseCurrency,
                                      )
                                }`}
                          </div>
                          </div>
                        */}
                      </div>
                      <div className="flex w-full items-center justify-between gap-6 sm:w-auto sm:justify-end">
                        <div className="flex-1 text-right sm:flex-none">
                          <div className="text-sm font-bold text-emerald-400">${instance.price}/月</div>
                          <div className="mt-1 flex justify-end text-xs text-zinc-500">
                            {instance.status === "running" && (
                              <span className="flex items-center gap-1 text-emerald-400">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> 運行中
                              </span>
                            )}
                            {instance.status === "stopped" && (
                              <span className="flex items-center gap-1 text-zinc-500">
                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" /> 已停止
                              </span>
                            )}
                            {instance.status === "installing" && (
                              <span className="flex items-center gap-1 text-orange-400">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" /> 部署中
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="rounded-lg bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/20 hover:text-white">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0c] p-6">
              <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <h4 className="flex items-center gap-2 text-lg font-bold text-white">
                  <History className="h-5 w-5 text-cyan-400" /> 事件與交易紀錄
                </h4>
                <label className="relative w-full lg:max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="search"
                    value={activityLogQuery}
                    onChange={(event) => setActivityLogQuery(event.target.value)}
                    placeholder="搜尋時間、關聯號、金額、類型或描述"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-500/40 focus:bg-white/[0.06]"
                    aria-label="搜尋事件與交易紀錄"
                  />
                </label>
              </div>

              <div className="overflow-x-auto">
                {userActivityLogs.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-zinc-500">
                    {activityLogQuery.trim() ? "沒有符合篩選條件的紀錄" : "無事件紀錄"}
                  </div>
                ) : (
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="whitespace-nowrap px-4 py-2.5 text-xs font-medium text-zinc-500">時間</th>
                        <th className="whitespace-nowrap px-4 py-2.5 text-xs font-medium text-zinc-500">類型</th>
                        <th className="min-w-[200px] px-4 py-2.5 text-xs font-medium text-zinc-500">描述</th>
                        <th className="whitespace-nowrap px-4 py-2.5 text-xs font-medium text-zinc-500">金額</th>
                        <th className="whitespace-nowrap px-4 py-2.5 text-xs font-medium text-zinc-500">關聯編號</th>
                        <th className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-medium text-zinc-500">狀態</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {paginatedUserActivityLogs.map((entry) => {
                        const isFailed = entry.status === "failed";
                        const isPending = entry.status === "pending";
                        return (
                          <tr key={entry.id} className="transition-colors hover:bg-white/[0.02]">
                            <td
                              className={`whitespace-nowrap px-4 py-2.5 align-top font-mono text-xs ${
                                isFailed ? "text-zinc-500" : isPending ? "text-amber-400/90" : "text-zinc-400"
                              }`}
                            >
                              {entry.timestamp}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5 align-top">
                              <span className={`text-xs font-medium ${getEventTypeTextClass(entry)}`}>
                                {getEventTypeLabel(entry)}
                              </span>
                            </td>
                            <td className="max-w-0 px-4 py-2.5 align-top">
                              <div
                                className={`truncate font-medium ${
                                  isFailed ? "text-zinc-500" : isPending ? "text-amber-200" : "text-zinc-100"
                                }`}
                              >
                                {entry.title}
                              </div>
                              <AutoShrinkText
                                className="mt-0.5"
                                contentClassName={`text-xs leading-relaxed ${
                                  isFailed ? "text-zinc-600" : isPending ? "text-amber-400/85" : "text-zinc-500"
                                }`}
                                minScale={0.42}
                                title={getUserEventLogDisplayDescription(entry)}
                                align="start"
                              >
                                {getUserEventLogDisplayDescription(entry)}
                              </AutoShrinkText>
                            </td>
                            <td
                              className={`whitespace-nowrap px-4 py-2.5 align-top font-mono text-xs font-medium ${getEventAmountClass(entry)}`}
                            >
                              {entry.amount === null || entry.amount === undefined ? (
                                "—"
                              ) : (
                                <>
                                  {entry.amount > 0 ? "+" : ""}
                                  {formatEventAmountValue(entry.amount)}
                                </>
                              )}
                            </td>
                            <td
                              className={`whitespace-nowrap px-4 py-2.5 align-top font-mono text-xs ${
                                isFailed ? "text-zinc-600" : isPending ? "text-amber-500/90" : "text-zinc-500"
                              }`}
                            >
                              {entry.referenceId || "—"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5 align-top text-right">
                              {renderEventStatus(entry)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {userActivityLogs.length > ACTIVITY_LOG_PAGE_SIZE ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-zinc-500">
                  <span>
                    顯示 {(activityLogSafePage - 1) * ACTIVITY_LOG_PAGE_SIZE + 1}–
                    {Math.min(activityLogSafePage * ACTIVITY_LOG_PAGE_SIZE, userActivityLogs.length)}，共{" "}
                    {userActivityLogs.length} 筆
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={activityLogSafePage <= 1}
                      onClick={() =>
                        setActivityLogPage((previous) =>
                          Math.max(1, Math.min(previous, activityLogTotalPages) - 1),
                        )
                      }
                      className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                      上一頁
                    </button>
                    <span className="min-w-[4.5rem] text-center font-mono text-zinc-400">
                      {activityLogSafePage} / {activityLogTotalPages}
                    </span>
                    <button
                      type="button"
                      disabled={activityLogSafePage >= activityLogTotalPages}
                      onClick={() =>
                        setActivityLogPage((previous) =>
                          Math.min(Math.min(previous, activityLogTotalPages) + 1, activityLogTotalPages),
                        )
                      }
                      className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-40"
                    >
                      下一頁
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0c]/80 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-lg font-bold text-white">
                  <UsersIcon className="h-5 w-5 text-purple-400" /> 邀請返傭網絡
                </h4>
                <div className="text-xs font-bold text-zinc-400">
                  總計收益: <span className="font-mono text-purple-400">${totalReferralBonus.toFixed(2)}</span>
                </div>
              </div>

              {referralsLoadError && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {referralsLoadError}
                </div>
              )}

              <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                  <div className="mb-2 grid grid-cols-[100px_1fr_120px_100px] gap-4 border-b border-white/10 p-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    <div>註冊時間</div>
                    <div>受薦用戶</div>
                    <div>用戶 ID</div>
                    <div className="text-right">產生獎金</div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {userReferrals.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 bg-white/5 py-6 text-center text-sm text-zinc-500">
                        尚無邀請記錄
                      </div>
                    ) : (
                      userReferrals.map((referral) => {
                        const referredUser =
                          users.find((user) => user.id === referral.referredUserId) ||
                          users.find((user) => user.email === referral.referredUserEmail);
                        const referredUserUid = referredUser ? getUserUid(referredUser) : referral.referredUserId;

                        return (
                          <div
                            key={referral.id}
                            className="grid grid-cols-[100px_1fr_120px_100px] items-center gap-4 rounded-xl border border-purple-500/10 bg-purple-500/5 p-3 transition-colors hover:border-purple-500/30"
                          >
                            <div className="text-xs text-zinc-400">{referral.date}</div>
                            <button
                              type="button"
                              disabled={!referredUser}
                              onClick={() => {
                                if (referredUser) {
                                  onSelectUser(referredUser.id);
                                }
                              }}
                              className="group flex min-w-0 items-center gap-2 text-left text-white transition-colors hover:text-purple-300 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:text-zinc-400"
                            >
                              <div className="truncate text-sm font-bold">
                                {referral.referredUserEmail}
                              </div>
                              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" />
                            </button>
                            <div className="font-mono text-xs text-zinc-500">{referredUserUid}</div>
                            <div className="flex items-center justify-end gap-1 font-mono text-sm font-bold text-purple-400">
                              <Gift className="h-3 w-3" /> +{referral.bonusEarned.toFixed(2)}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Dialog
          open={walletModalKind !== null}
          onOpenChange={(open) => {
            if (!open) {
              setWalletModalKind(null);
            }
          }}
        >
          <DialogContent
            className={`max-w-[calc(100%-2rem)] gap-0 overflow-hidden border border-white/10 bg-[#060608] p-0 text-slate-200 shadow-2xl sm:max-w-md [&_button.absolute]:text-zinc-500 [&_button.absolute]:hover:text-white ${
              walletModalKind === "balance"
                ? "ring-1 ring-blue-500/20"
                : walletModalKind === "bonus"
                  ? "ring-1 ring-purple-500/20"
                  : ""
            }`}
          >
            {walletModalKind && (
              <>
                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl ${
                    walletModalKind === "balance" ? "bg-blue-600/25" : "bg-purple-600/25"
                  }`}
                />
                <div
                  className={`pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full blur-3xl ${
                    walletModalKind === "balance" ? "bg-emerald-600/15" : "bg-fuchsia-600/15"
                  }`}
                />

                <DialogHeader className="relative space-y-1 border-b border-white/10 px-6 pb-4 pt-6 text-left">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                        walletModalKind === "balance"
                          ? "border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_24px_rgba(59,130,246,0.2)]"
                          : "border-purple-500/30 bg-purple-500/10 text-purple-400 shadow-[0_0_24px_rgba(168,85,247,0.2)]"
                      }`}
                    >
                      {walletModalKind === "balance" ? (
                        <DollarSign className="h-5 w-5" aria-hidden />
                      ) : (
                        <Gift className="h-5 w-5" aria-hidden />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1 pr-6">
                      <DialogTitle className="text-lg font-black tracking-tight text-white">
                        {walletModalKind === "balance" ? "調整真實餘額" : "調整推廣贈金額度"}
                      </DialogTitle>
                      <DialogDescription className="text-xs leading-relaxed text-zinc-500">
                        {walletModalKind === "balance"
                          ? (
                              <>
                                此使用者在個人設定中的貨幣系統為{" "}
                                <span className="font-mono font-bold text-amber-200">{walletUserPreferredCurrency}</span>
                              </>
                            )
                          : "可為此使用者增加、扣除、指定贈金，或將贈金歸零。"}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="relative space-y-5 px-6 py-5">
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">操作類型</p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { op: "add" as const, label: "增加", Icon: Plus },
                          { op: "deduct" as const, label: "扣除", Icon: Minus },
                          { op: "set" as const, label: "設定金額", Icon: Edit2 },
                        ] as const
                      ).map(({ op, label, Icon }) => (
                        <button
                          key={op}
                          type="button"
                          disabled={isWalletSubmitting}
                          onClick={() => setWalletOp(op)}
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                            walletOp === op
                              ? walletModalKind === "balance"
                                ? "border-blue-500/50 bg-blue-500/15 text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                                : "border-purple-500/50 bg-purple-500/15 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                              : "border-white/10 bg-black/30 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden />
                          {label}
                        </button>
                      ))}
                      {walletModalKind === "bonus" ? (
                        <button
                          type="button"
                          disabled={isWalletSubmitting}
                          onClick={() => setWalletOp("zero")}
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                            walletOp === "zero"
                              ? "border-red-500/50 bg-red-500/15 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.12)]"
                              : "border-red-500/20 bg-red-500/5 text-red-400/90 hover:border-red-500/40 hover:bg-red-500/10"
                          }`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          贈金清零
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {walletOp === "zero" ? (
                    <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-100/95">
                      <p className="font-bold">確定要清零？</p>
                      <p className="mt-1 text-xs leading-relaxed text-red-200/80">
                        目前贈金為{" "}
                        <span className="font-mono font-bold text-purple-200">${selectedUser.bonusCredit.toFixed(2)}</span>
                        ，確認後將變動為 <span className="font-mono font-bold">$0.00</span>。
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label
                          htmlFor="wallet-amount-input"
                          className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500"
                        >
                          金額（{walletInputCurrency}）
                        </label>
                        <div
                          className={`flex h-10 items-stretch overflow-hidden rounded-2xl border bg-black/40 ${
                            walletModalKind === "balance"
                              ? "border-blue-500/25 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/30"
                              : "border-purple-500/25 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/30"
                          }`}
                        >
                          <span
                            className={`flex shrink-0 items-center border-r border-white/10 px-3 text-sm font-bold ${
                              walletModalKind === "balance" ? "text-blue-400/90" : "text-purple-400/90"
                            }`}
                          >
                            {walletInputSymbol}
                          </span>
                          <input
                            id="wallet-amount-input"
                            type="text"
                            inputMode="decimal"
                            placeholder="例如 10 或 12.50"
                            value={walletAmount}
                            disabled={isWalletSubmitting}
                            onChange={(event) => setWalletAmount(event.target.value)}
                            className="min-h-0 min-w-0 flex-1 bg-transparent px-3 py-0 text-sm font-mono leading-10 text-white placeholder:text-zinc-600 focus:outline-none"
                            autoComplete="off"
                          />
                          <div className="flex min-w-[88px] shrink-0 items-center border-l border-white/10 px-3 text-xs font-semibold tracking-wider text-zinc-300">
                            {walletInputCurrency}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">預覽</p>
                        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                          <span className="text-zinc-500">目前</span>
                          <span
                            className={`font-mono text-lg font-black ${
                              walletModalKind === "balance" ? "text-emerald-400" : "text-purple-400"
                            }`}
                          >
                            {walletPreviewCurrentDisplay}
                          </span>
                          <span className="text-zinc-600">→</span>
                          <span className="text-zinc-500">套用後</span>
                          <span
                            className={`font-mono text-lg font-black ${
                              walletPreviewAfter === null ? "text-zinc-600" : "text-white"
                            }`}
                          >
                            {walletPreviewAfterDisplay}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter className="relative gap-2 border-t border-white/10 bg-black/20 px-6 py-4 sm:justify-end">
                  <button
                    type="button"
                    disabled={isWalletSubmitting}
                    onClick={() => setWalletModalKind(null)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    disabled={isWalletSubmitting}
                    onClick={() => void commitWalletChangeApi()}
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] ${
                      walletModalKind === "balance"
                        ? "bg-gradient-to-r from-blue-600 to-emerald-600 shadow-blue-500/25"
                        : walletOp === "zero"
                          ? "bg-gradient-to-r from-red-600 to-red-500 shadow-red-500/25"
                          : "bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-purple-500/25"
                    }`}
                  >
                    {isWalletSubmitting ? "套用中…" : "確認套用"}
                  </button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  return (
    <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {banner && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            banner.type === "ok"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
              : "border-red-500/25 bg-red-500/10 text-red-200"
          }`}
        >
          {banner.text}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="relative min-w-0 max-w-full flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={userListSearchQuery}
            onChange={(event) => setUserListSearchQuery(event.target.value)}
            placeholder="搜尋信箱、UID 或用戶 ID..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white transition-colors focus:border-blue-500/50 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AdminDashboardBatchMenu
            ref={batchMenuRef}
            batchMenuOpen={batchMenuOpen}
            onBatchMenuOpenChange={setBatchMenuOpen}
            isUsersLoading={isUsersLoading}
            selectedCount={selectedCount}
            requireSelection={requireSelection}
            setBanner={setBanner}
            runBatchNotice={runBatchNotice}
            setSelectedIds={setSelectedIds}
            applyBatchUserStatus={applyBatchUserStatus}
            applyBatchBalanceAdjust={applyBatchBalanceAdjust}
            applyBatchBalanceSet={applyBatchBalanceSet}
            applyBatchBonusDelta={applyBatchBonusDelta}
            applyBatchBonusSet={applyBatchBonusSet}
            applyBatchBonusZero={applyBatchBonusZero}
            removeUsersBatch={removeUsersBatch}
            batchStopInstancesForUsers={batchStopInstancesForUsers}
            batchDeleteInstancesForUsers={batchDeleteInstancesForUsers}
          />

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all hover:bg-blue-400"
          >
            <Plus className="h-4 w-4" /> 邀請用戶
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0c]/80 shadow-2xl backdrop-blur-xl">
        {usersLoadError && (
          <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {usersLoadError}
          </div>
        )}

        <div className="grid grid-cols-[40px_100px_minmax(0,1fr)_120px_110px_120px] gap-3 border-b border-white/5 bg-black/20 p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 sm:gap-6">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              disabled={isUsersLoading || filteredUsers.length === 0}
              checked={allVisibleSelected}
              ref={(element) => {
                if (element) {
                  element.indeterminate =
                    !allVisibleSelected && filteredUsers.some((user) => selectedIds.has(user.id));
                }
              }}
              onChange={() => {
                if (allVisibleSelected) {
                  setSelectedIds(new Set());
                } else {
                  setSelectedIds(new Set(filteredUsers.map((user) => user.id)));
                }
              }}
              className="h-4 w-4 cursor-pointer rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-40"
              title="全選目前篩選"
              aria-label="全選目前篩選"
            />
          </div>
          <div>用戶 ID</div>
          <div>註冊信箱 / 等級</div>
          <div>帳戶資產</div>
          <div>帳戶狀態</div>
          <div className="text-right">操作</div>
        </div>

        <div className="flex flex-col">
          {isUsersLoading ? (
            <div className="p-8 text-center text-sm text-zinc-500">正在載入用戶列表…</div>
          ) : (
            filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectUser(user.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectUser(user.id);
                  }
                }}
                className="grid cursor-pointer grid-cols-[40px_100px_minmax(0,1fr)_120px_110px_120px] items-center gap-3 border-b border-white/5 p-4 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-inset sm:gap-6"
                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(user.id)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => {
                      setSelectedIds((previous) => {
                        const next = new Set(previous);
                        if (next.has(user.id)) {
                          next.delete(user.id);
                        } else {
                          next.add(user.id);
                        }
                        return next;
                      });
                    }}
                    className="h-4 w-4 cursor-pointer rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-cyan-500/40"
                    aria-label={`選取 ${user.email}`}
                  />
                </div>
                <div className="font-mono text-xs text-zinc-500">{getUserUid(user)}</div>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-white">
                    {renderSystemAvatar("list", user.status)}
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="shrink-0">{renderRankBadge(user.rank, "list")}</div>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="font-mono text-sm font-bold text-emerald-400">
                    {formatCurrencyAmount(user.balance, normalizeSupportedCurrency(user.preferredCurrency, "CNY"))}
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-purple-400" title="推廣贈金額度">
                    <Gift className="h-2.5 w-2.5" />{" "}
                    {formatCurrencyAmount(user.bonusCredit, normalizeSupportedCurrency(user.preferredCurrency, "CNY"))}
                  </div>
                </div>
                <div>
                  {user.status === "active" ? (
                    <span className="flex w-fit items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> 正常
                    </span>
                  ) : user.status === "suspended" ? (
                    <span className="flex w-fit items-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                      <Pause className="h-3 w-3" /> 暫停
                    </span>
                  ) : (
                    <span className="flex w-fit items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                      <ShieldBan className="h-3 w-3" /> 封禁
                    </span>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectUser(user.id);
                    }}
                    className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)] transition-colors hover:bg-blue-500 hover:text-black"
                  >
                    查看詳情
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}








