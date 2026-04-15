import type { DashboardNavPlacement } from "../../context/DashboardNavContext";

export type SettingsMenuId = "account" | "linked" | "payment" | "security" | "preferences";

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  balance: number;
  credit: number;
  rank: string;
  status: string;
  registeredAt: string;
};

export type DashboardInstance = {
  id: string;
  name: string;
  game: string;
  node: string;
  status: "running" | "stopped";
  cpu: number;
  mem: number;
  disk: number;
  ip: string;
};

export type DashboardTransaction = {
  id: string;
  date: string;
  amount: number;
  type: "deposit" | "payment";
  status: "completed";
  method: string;
};

export type DashboardUsageDataPoint = {
  time: string;
  cpu: number;
  memory: number;
};

export type DashboardTeamMember = {
  id: number;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Developer";
  twoFA: boolean;
};

export type DashboardTicket = {
  id: string;
  subject: string;
  status: "open" | "pending" | "closed";
  priority: "high" | "medium" | "low";
  updated: string;
};

export type DashboardNavPlacementOption = {
  value: DashboardNavPlacement;
  title: string;
  description: string;
};
