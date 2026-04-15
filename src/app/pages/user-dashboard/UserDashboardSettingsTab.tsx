import { motion } from "motion/react";
import { SlidersHorizontal } from "lucide-react";
import type { DashboardNavPlacement } from "../../context/DashboardNavContext";
import type { SupportedCurrency } from "../../lib/currency";
import type { DashboardUser, SettingsMenuId } from "./userDashboardTypes";
import { UserDashboardAccountSettingsSection } from "./settings/UserDashboardAccountSettingsSection";
import { UserDashboardLinkedSettingsSection } from "./settings/UserDashboardLinkedSettingsSection";
import { UserDashboardPaymentSettingsSection } from "./settings/UserDashboardPaymentSettingsSection";
import { UserDashboardPreferencesSettingsSection } from "./settings/UserDashboardPreferencesSettingsSection";
import { UserDashboardSecuritySettingsSection } from "./settings/UserDashboardSecuritySettingsSection";

type UserDashboardSettingsTabProps = {
  settingsMenu: SettingsMenuId;
  setSettingsMenu: (menu: SettingsMenuId) => void;
  dashboardUser: DashboardUser;
  dashboardNavPlacement: DashboardNavPlacement;
  setDashboardNavPlacement: (placement: DashboardNavPlacement) => void;
  mainNavbarHidden: boolean;
  setMainNavbarHidden: (hidden: boolean) => void;
  preferredCurrency: SupportedCurrency;
  setPreferredCurrency: (currency: SupportedCurrency) => void;
  previewBaseCurrency: SupportedCurrency;
  setPreviewBaseCurrency: (currency: SupportedCurrency) => void;
};

const settingsMenuItems = [
  { id: "account" as const, label: "账号信息" },
  { id: "linked" as const, label: "关联账号" },
  { id: "payment" as const, label: "付款资讯" },
  { id: "security" as const, label: "安全设置" },
  { id: "preferences" as const, label: "偏好设置", icon: SlidersHorizontal },
] as const;

export function UserDashboardSettingsTab({
  settingsMenu,
  setSettingsMenu,
  dashboardUser,
  dashboardNavPlacement,
  setDashboardNavPlacement,
  mainNavbarHidden,
  setMainNavbarHidden,
  preferredCurrency,
  setPreferredCurrency,
  previewBaseCurrency,
  setPreviewBaseCurrency,
}: UserDashboardSettingsTabProps) {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-auto max-w-5xl"
    >
      <div className="grid gap-10 md:grid-cols-[240px_1fr]">
        <div className="space-y-1">
          <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">设定菜单</div>
          {settingsMenuItems.map((item) => {
            const Icon = "icon" in item ? item.icon : null;
            const active = settingsMenu === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSettingsMenu(item.id)}
                className={`flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-70" /> : null}
                {item.label}
              </button>
            );
          })}
        </div>

        <div>
          {settingsMenu === "account" ? <UserDashboardAccountSettingsSection dashboardUser={dashboardUser} /> : null}
          {settingsMenu === "linked" ? <UserDashboardLinkedSettingsSection /> : null}
          {settingsMenu === "payment" ? <UserDashboardPaymentSettingsSection /> : null}
          {settingsMenu === "security" ? <UserDashboardSecuritySettingsSection /> : null}
          {settingsMenu === "preferences" ? (
            <UserDashboardPreferencesSettingsSection
              dashboardNavPlacement={dashboardNavPlacement}
              setDashboardNavPlacement={setDashboardNavPlacement}
              mainNavbarHidden={mainNavbarHidden}
              setMainNavbarHidden={setMainNavbarHidden}
              preferredCurrency={preferredCurrency}
              setPreferredCurrency={setPreferredCurrency}
              previewBaseCurrency={previewBaseCurrency}
              setPreviewBaseCurrency={setPreviewBaseCurrency}
            />
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
