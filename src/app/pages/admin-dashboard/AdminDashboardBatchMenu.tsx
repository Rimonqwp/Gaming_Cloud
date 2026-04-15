import type { Dispatch, Ref, SetStateAction } from "react";
import { forwardRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Edit2,
  Gift,
  ListChecks,
  LogOut,
  Mail,
  Pause,
  Plus,
  Server,
  Settings,
  ShieldBan,
  ShieldCheck,
  Trash2,
  UserX,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { User } from "./adminDashboardTypes";

export type BatchMenuCategory = "balance" | "bonus" | "account" | "instances" | "other";

export function parseUsdInput(raw: string): number | null {
  const trimmed = raw
    .trim()
    .replaceAll(",", "")
    .replaceAll("，", "")
    .replace(/^[\$＄\s]+/, "");
  if (trimmed === "") {
    return null;
  }
  const value = Number.parseFloat(trimmed);
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
}

const BATCH_MENU_SECTIONS: {
  id: BatchMenuCategory;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  { id: "balance", label: "帳號資產", hint: "真實餘額", icon: DollarSign },
  { id: "bonus", label: "推廣贈金", hint: "額度調整", icon: Gift },
  { id: "account", label: "帳號狀態", hint: "封禁與移除", icon: ShieldCheck },
  { id: "instances", label: "實例／機器", hint: "生命週期", icon: Server },
  { id: "other", label: "其他", hint: "安全與通知", icon: Settings },
];

export type AdminDashboardBatchMenuProps = {
  batchMenuOpen: boolean;
  onBatchMenuOpenChange: Dispatch<SetStateAction<boolean>>;
  isUsersLoading: boolean;
  selectedCount: number;
  requireSelection: () => string[] | null;
  setBanner: Dispatch<SetStateAction<{ type: "ok" | "err"; text: string } | null>>;
  runBatchNotice: (message: string) => void;
  setSelectedIds: Dispatch<SetStateAction<Set<string>>>;
  applyBatchUserStatus: (userIds: string[], status: User["status"]) => void;
  applyBatchBalanceAdjust: (userIds: string[], delta: number) => Promise<void>;
  applyBatchBalanceSet: (userIds: string[], value: number) => Promise<void>;
  applyBatchBonusDelta: (userIds: string[], delta: number) => Promise<void>;
  applyBatchBonusSet: (userIds: string[], value: number) => Promise<void>;
  applyBatchBonusZero: (userIds: string[]) => Promise<void>;
  removeUsersBatch: (userIds: string[]) => void;
  batchStopInstancesForUsers: (userIds: string[]) => void;
  batchDeleteInstancesForUsers: (userIds: string[]) => void;
};

export const AdminDashboardBatchMenu = forwardRef<HTMLDivElement, AdminDashboardBatchMenuProps>(
  function AdminDashboardBatchMenu(
    {
      batchMenuOpen,
      onBatchMenuOpenChange,
      isUsersLoading,
      selectedCount,
      requireSelection,
      setBanner,
      runBatchNotice,
      setSelectedIds,
      applyBatchUserStatus,
      applyBatchBalanceAdjust,
      applyBatchBalanceSet,
      applyBatchBonusDelta,
      applyBatchBonusSet,
      applyBatchBonusZero,
      removeUsersBatch,
      batchStopInstancesForUsers,
      batchDeleteInstancesForUsers,
    },
    ref: Ref<HTMLDivElement>,
  ) {
    const [activeCategory, setActiveCategory] = useState<BatchMenuCategory | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      if (batchMenuOpen) {
        setActiveCategory(null);
      }
    }, [batchMenuOpen]);

    const menuItemClass =
      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-zinc-200 transition-colors hover:bg-white/10";

    const categoryNavClass = (id: BatchMenuCategory) =>
      `group flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-xs font-bold transition-colors ${
        activeCategory === id
          ? "bg-cyan-500/15 text-white ring-1 ring-cyan-500/35"
          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
      }`;

    const activeLabel = activeCategory
      ? (BATCH_MENU_SECTIONS.find((section) => section.id === activeCategory)?.label ?? "")
      : "";

    const runWalletAction = async (action: () => Promise<void>, successText: string) => {
      setIsSubmitting(true);

      try {
        await action();
        onBatchMenuOpenChange(false);
        setBanner({ type: "ok", text: successText });
      } catch (error) {
        setBanner({
          type: "err",
          text: error instanceof Error ? error.message : "批量資產調整失敗。",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          disabled={isUsersLoading || isSubmitting}
          onClick={() => onBatchMenuOpenChange((open) => !open)}
          aria-expanded={batchMenuOpen}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ListChecks className="h-4 w-4 shrink-0 text-cyan-400" />
          批量操作
          {selectedCount > 0 ? (
            <span className="rounded-md bg-cyan-500/20 px-1.5 py-0.5 font-mono text-[11px] text-cyan-300">
              {selectedCount}
            </span>
          ) : null}
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${batchMenuOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {batchMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="absolute left-0 top-[calc(100%+8px)] z-50 flex max-h-[min(72vh,560px)] w-[min(calc(100vw-1.25rem),22rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c]/95 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:w-[min(calc(100vw-1.25rem),30rem)] sm:max-w-[30rem] sm:flex-row"
              role="menu"
            >
              <div
                role="tablist"
                aria-label="批量操作類別"
                className="flex max-h-[40vh] shrink-0 gap-0.5 overflow-x-auto overflow-y-auto border-b border-white/10 bg-black/30 p-2 sm:max-h-none sm:w-[152px] sm:flex-col sm:border-b-0 sm:border-r"
              >
                {BATCH_MENU_SECTIONS.map(({ id, label, hint, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === id}
                    onClick={() => setActiveCategory(id)}
                    className={categoryNavClass(id)}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${activeCategory === id ? "text-cyan-400" : "text-zinc-500 group-hover:text-zinc-400"}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{label}</span>
                      <span className="mt-0.5 block truncate text-[10px] font-normal text-zinc-500">{hint}</span>
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 ${activeCategory === id ? "text-cyan-400" : "text-zinc-600 opacity-60 group-hover:opacity-100"}`}
                    />
                  </button>
                ))}
              </div>

                {activeCategory ? (
                  <div
                    key={activeCategory}
                    className="flex min-h-[min(40vh,220px)] min-w-0 flex-1 flex-col overflow-hidden border-t border-white/10 sm:min-h-[260px] sm:border-l sm:border-t-0"
                  >
                    <div className="shrink-0 border-b border-white/5 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">子操作</p>
                      <p className="mt-0.5 truncate text-xs font-bold text-white">{activeLabel}</p>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                  {activeCategory === "balance" ? (
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          const ids = requireSelection();
                          if (!ids) {
                            return;
                          }
                          const raw = window.prompt("每位使用者要增加的 USD 餘額（同額加總）：", "10");
                          if (raw === null) {
                            return;
                          }
                          const amount = parseUsdInput(raw);
                          if (amount === null) {
                            setBanner({ type: "err", text: "金額格式不正確。" });
                            return;
                          }
                          void runWalletAction(
                            () => applyBatchBalanceAdjust(ids, amount),
                            `已為 ${ids.length} 位使用者各調增 $${amount.toFixed(2)}。`,
                          );
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 text-emerald-400" /> 批量調增餘額
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          const ids = requireSelection();
                          if (!ids) {
                            return;
                          }
                          const raw = window.prompt("每位使用者要減少的 USD 餘額（同額扣除，最低 0）：", "5");
                          if (raw === null) {
                            return;
                          }
                          const amount = parseUsdInput(raw);
                          if (amount === null) {
                            setBanner({ type: "err", text: "金額格式不正確。" });
                            return;
                          }
                          void runWalletAction(
                            () => applyBatchBalanceAdjust(ids, -amount),
                            `已為 ${ids.length} 位使用者各調減 $${amount.toFixed(2)}。`,
                          );
                        }}
                      >
                        <ArrowUpRight className="h-3.5 w-3.5 rotate-90 text-orange-400" /> 批量調減餘額
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          const ids = requireSelection();
                          if (!ids) {
                            return;
                          }
                          const raw = window.prompt("將所選使用者的餘額統一設為（USD）：", "0");
                          if (raw === null) {
                            return;
                          }
                          const amount = parseUsdInput(raw);
                          if (amount === null) {
                            setBanner({ type: "err", text: "金額格式不正確。" });
                            return;
                          }
                          void runWalletAction(
                            () => applyBatchBalanceSet(ids, amount),
                            `已將 ${ids.length} 位使用者餘額設為 $${amount.toFixed(2)}。`,
                          );
                        }}
                      >
                        <DollarSign className="h-3.5 w-3.5 text-blue-400" /> 批量設定餘額
                      </button>
                    </div>
                  ) : null}

                  {activeCategory === "bonus" ? (
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          const ids = requireSelection();
                          if (!ids) {
                            return;
                          }
                          const raw = window.prompt("每位使用者要增加的推廣贈金（USD）：", "5");
                          if (raw === null) {
                            return;
                          }
                          const amount = parseUsdInput(raw);
                          if (amount === null) {
                            setBanner({ type: "err", text: "金額格式不正確。" });
                            return;
                          }
                          void runWalletAction(
                            () => applyBatchBonusDelta(ids, amount),
                            `已為 ${ids.length} 位使用者各增加 $${amount.toFixed(2)} 贈金。`,
                          );
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 text-purple-400" /> 批量調增贈金
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          const ids = requireSelection();
                          if (!ids) {
                            return;
                          }
                          const raw = window.prompt("每位使用者要減少的推廣贈金（USD）：", "2");
                          if (raw === null) {
                            return;
                          }
                          const amount = parseUsdInput(raw);
                          if (amount === null) {
                            setBanner({ type: "err", text: "金額格式不正確。" });
                            return;
                          }
                          void runWalletAction(
                            () => applyBatchBonusDelta(ids, -amount),
                            `已為 ${ids.length} 位使用者各減少 $${amount.toFixed(2)} 贈金。`,
                          );
                        }}
                      >
                        <ArrowUpRight className="h-3.5 w-3.5 rotate-90 text-purple-300" /> 批量調減贈金
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          const ids = requireSelection();
                          if (!ids) {
                            return;
                          }
                          const raw = window.prompt("將所選使用者的推廣贈金統一設為（USD）：", "0");
                          if (raw === null) {
                            return;
                          }
                          const amount = parseUsdInput(raw);
                          if (amount === null) {
                            setBanner({ type: "err", text: "金額格式不正確。" });
                            return;
                          }
                          void runWalletAction(
                            () => applyBatchBonusSet(ids, amount),
                            `已將 ${ids.length} 位使用者贈金設為 $${amount.toFixed(2)}。`,
                          );
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5 text-purple-400" /> 批量設定贈金額度
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          const ids = requireSelection();
                          if (!ids) {
                            return;
                          }
                          if (!window.confirm(`將 ${ids.length} 位使用者的推廣贈金全部清零？`)) {
                            return;
                          }
                          void runWalletAction(
                            () => applyBatchBonusZero(ids),
                            `已將 ${ids.length} 位使用者的贈金清零。`,
                          );
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" /> 批量移除贈金（清零）
                      </button>
                    </div>
                  ) : null}

                  {activeCategory === "account" ? (
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          const ids = requireSelection();
                          if (!ids) {
                            return;
                          }
                          applyBatchUserStatus(ids, "active");
                          onBatchMenuOpenChange(false);
                          setBanner({ type: "ok", text: `已將 ${ids.length} 位使用者設為「正常」（前端示範）。` });
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 設為正常
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          const ids = requireSelection();
                          if (!ids) {
                            return;
                          }
                          applyBatchUserStatus(ids, "banned");
                          onBatchMenuOpenChange(false);
                          setBanner({ type: "ok", text: `已批量封禁 ${ids.length} 位使用者（前端示範）。` });
                        }}
                      >
                        <ShieldBan className="h-3.5 w-3.5 text-red-400" /> 批量封禁
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          const ids = requireSelection();
                          if (!ids) {
                            return;
                          }
                          applyBatchUserStatus(ids, "suspended");
                          onBatchMenuOpenChange(false);
                          setBanner({ type: "ok", text: `已將 ${ids.length} 位使用者設為「掛起」（前端示範）。` });
                        }}
                      >
                        <Pause className="h-3.5 w-3.5 text-amber-400" /> 批量掛起
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          const ids = requireSelection();
                          if (!ids) {
                            return;
                          }
                          if (
                            !window.confirm(
                              `確定從管理清單移除 ${ids.length} 位使用者？此為前端示範，會直接從列表刪除，並非正式後端刪除。`,
                            )
                          ) {
                            return;
                          }
                          removeUsersBatch(ids);
                          setSelectedIds(new Set());
                          onBatchMenuOpenChange(false);
                          setBanner({ type: "ok", text: "已從清單移除所選使用者。" });
                        }}
                      >
                        <UserX className="h-3.5 w-3.5 text-red-400" /> 從清單永久移除
                      </button>
                    </div>
                  ) : null}

                  {activeCategory === "instances" ? (
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          const ids = requireSelection();
                          if (!ids) {
                            return;
                          }
                          batchStopInstancesForUsers(ids);
                          onBatchMenuOpenChange(false);
                          setBanner({
                            type: "ok",
                            text: `已嘗試停止所選帳號底下「運行中」的實例（${ids.length} 位使用者範圍，前端示範）。`,
                          });
                        }}
                      >
                        <Pause className="h-3.5 w-3.5 text-orange-400" /> 停止所選帳號之實例
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          const ids = requireSelection();
                          if (!ids) {
                            return;
                          }
                          if (
                            !window.confirm(
                              `將刪除這 ${ids.length} 位使用者在系統內的所有實例列資料（前端示範），確定？`,
                            )
                          ) {
                            return;
                          }
                          batchDeleteInstancesForUsers(ids);
                          onBatchMenuOpenChange(false);
                          setBanner({ type: "ok", text: "已刪除所選帳號關聯的實例（前端示範）。" });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" /> 刪除所選帳號之實例
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          if (!requireSelection()) {
                            return;
                          }
                          runBatchNotice("已將「批量佈建新實例」加入背景佇列（示範，尚未連接後端）。");
                        }}
                      >
                        <Server className="h-3.5 w-3.5 text-cyan-400" /> 批量佈建新實例（佇列）
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          if (!requireSelection()) {
                            return;
                          }
                          runBatchNotice("請至「實例」分頁選擇目標帳號後再執行轉移（示範提示）。");
                        }}
                      >
                        <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-zinc-400" /> 轉移實例至其他帳號
                      </button>
                    </div>
                  ) : null}

                  {activeCategory === "other" ? (
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          if (!requireSelection()) {
                            return;
                          }
                          runBatchNotice("已排程寄送重設密碼連結（示範，尚未連接郵件／後端）。");
                        }}
                      >
                        <Mail className="h-3.5 w-3.5 text-blue-400" /> 重設密碼（寄送連結）
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          if (!requireSelection()) {
                            return;
                          }
                          runBatchNotice("已加入「重發驗證郵件」佇列（示範）。");
                        }}
                      >
                        <Mail className="h-3.5 w-3.5 text-zinc-400" /> 重發驗證郵件
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          if (!requireSelection()) {
                            return;
                          }
                          runBatchNotice("已強制登出所選帳號的所有工作階段（示範）。");
                        }}
                      >
                        <LogOut className="h-3.5 w-3.5 text-amber-400" /> 強制登出所有裝置
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={menuItemClass}
                        onClick={() => {
                          if (!requireSelection()) {
                            return;
                          }
                          runBatchNotice("已觸發與身分供應商同步 KYC／2FA 狀態（示範）。");
                        }}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 同步 KYC／2FA 狀態
                      </button>
                    </div>
                  ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[min(40vh,220px)] min-w-0 flex-1 flex-col overflow-hidden border-t border-white/10 bg-black/10 sm:min-h-[260px] sm:border-l sm:border-t-0">
                    <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">子操作</p>
                      <p className="mt-2 max-w-[12rem] text-xs leading-relaxed text-zinc-500">請先點選左側一個類別，操作項目會顯示於此。</p>
                    </div>
                  </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);
