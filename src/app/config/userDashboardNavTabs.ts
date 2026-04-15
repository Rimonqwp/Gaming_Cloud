import {
  LayoutDashboard,
  Server,
  Wallet,
  Users,
  Ticket,
  Share2,
  Settings,
} from "lucide-react";

export const USER_DASHBOARD_NAV_TABS = [
  { id: "overview", label: "总览", icon: LayoutDashboard },
  { id: "instances", label: "实例", icon: Server },
  { id: "billing", label: "财务", icon: Wallet },
  { id: "team", label: "团队管理", icon: Users },
  { id: "tickets", label: "工单", icon: Ticket },
  { id: "referral", label: "推介计划", icon: Share2 },
  { id: "settings", label: "个人设定", icon: Settings },
] as const;

export type UserDashboardTabId = (typeof USER_DASHBOARD_NAV_TABS)[number]["id"];
