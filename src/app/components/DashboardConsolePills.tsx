import { motion } from "motion/react";
import { USER_DASHBOARD_NAV_TABS } from "../config/userDashboardNavTabs";
import type { UserDashboardTabId } from "../config/userDashboardNavTabs";

type DashboardConsolePillsProps = {
  activeTab: UserDashboardTabId;
  onSelect: (tab: UserDashboardTabId) => void;
  /** 頂欄內較緊湊；浮動條略寬 */
  density?: "navbar" | "floating";
  className?: string;
  /** 嵌入控制台工具列時不帶外層圓角邊框，由外層工具列承載 */
  embedded?: boolean;
};

export function DashboardConsolePills({
  activeTab,
  onSelect,
  density = "navbar",
  className = "",
  embedded = false,
}: DashboardConsolePillsProps) {
  const isNavbar = density === "navbar";
  const tabs = USER_DASHBOARD_NAV_TABS.map((tab) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => onSelect(tab.id)}
        className={`relative shrink-0 rounded-full px-2.5 py-2 text-xs font-medium transition-all sm:px-3.5 sm:text-sm ${
          isActive ? "text-white" : "text-zinc-400 hover:text-white"
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="activePillNav"
            className="absolute inset-0 rounded-full border border-white/10 bg-white/10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
          <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? "text-cyan-400" : ""}`} />
          <span className={isNavbar ? "hidden sm:inline" : ""}>{tab.label}</span>
        </span>
      </button>
    );
  });

  if (embedded) {
    return (
      <div
        className={`flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto overflow-y-hidden no-scrollbar sm:gap-1 ${className}`}
      >
        {tabs}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-0.5 overflow-x-auto overflow-y-hidden rounded-full border border-white/10 bg-[#0a0a0c]/85 p-1 shadow-[0_6px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl no-scrollbar sm:gap-1 ${
        isNavbar ? "min-w-0 max-w-[min(100%,640px)]" : "max-w-[min(100vw-2rem,760px)]"
      } ${className}`}
    >
      {tabs}
    </div>
  );
}
