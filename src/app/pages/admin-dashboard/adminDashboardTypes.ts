import type { LucideIcon } from "lucide-react";
import type { AdminReferral } from "../../lib/adminReferrals";
import type {
  AdminDashboardGlobalNode,
  AdminDashboardGlobalNodeStatus,
  AdminDashboardGlobalRegion,
  AdminDashboardInstance,
  AdminDashboardPaymentMethod,
  AdminDashboardTicket,
  AdminDashboardTransaction,
} from "../../lib/adminDashboardData";
import type { AdminDashboardUser } from "../../lib/adminUsers";

export type AdminDashboardTabId =
  | "overview"
  | "products"
  | "nodes"
  | "docs"
  | "users"
  | "instances"
  | "tickets"
  | "settings";

export type AdminDashboardInstanceTabId =
  | "console"
  | "files"
  | "logs"
  | "startup"
  | "players"
  | "versions"
  | "network"
  | "management"
  | "backups";

export type Plan = {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  storage: number;
  price: number;
};

export type NodeInfo = {
  city: string;
  latency: string;
};

export type Region = {
  id: string;
  label: string;
  nodes: NodeInfo[];
};

export type RegionsMap = Record<string, Region[]>;

export type GlobalNodeStatus = AdminDashboardGlobalNodeStatus;
export type GlobalNode = AdminDashboardGlobalNode;
export type GlobalRegion = AdminDashboardGlobalRegion;

export type DatacenterRegionFormInput = {
  label: string;
  city: string;
};

export type NodePowerAction = "power_on" | "shutdown" | "force_off" | "restart";

export type NodeGame = {
  id: string;
  name: string;
  icon: string;
};

export type Doc = {
  id: number;
  title: string;
  category: string;
  date: string;
  status: "published" | "draft";
};

export type User = AdminDashboardUser;
export type Instance = AdminDashboardInstance;
export type Ticket = AdminDashboardTicket;
export type Transaction = AdminDashboardTransaction;
export type PaymentMethod = AdminDashboardPaymentMethod;
export type Referral = AdminReferral;

export type AdminDashboardSettings = {
  maintenanceMode: boolean;
  autoProvision: boolean;
  newRegistrations: boolean;
  smtpHost: string;
  stripeKey: string;
};

export type AdminDashboardNavTab = {
  id: AdminDashboardTabId;
  label: string;
  icon: LucideIcon;
};

export type AdminDashboardInstanceInnerTab = {
  id: AdminDashboardInstanceTabId;
  label: string;
  icon: LucideIcon;
};
