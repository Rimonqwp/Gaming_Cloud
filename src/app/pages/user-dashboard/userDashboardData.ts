import type {
  DashboardInstance,
  DashboardNavPlacementOption,
  DashboardTeamMember,
  DashboardTicket,
  DashboardTransaction,
  DashboardUsageDataPoint,
  DashboardUser,
} from "./userDashboardTypes";

export const mockUser: DashboardUser = {
  id: "586342232960",
  name: "CyberCommander",
  email: "commander@neon-net.local",
  balance: 145.5,
  credit: 20,
  rank: "Diamond",
  status: "active",
  registeredAt: "2024-01-12",
};

export const instances: DashboardInstance[] = [
  {
    id: "SRV-mc-1",
    name: "Survival Server",
    game: "Minecraft",
    node: "Asia Pacific (SG)",
    status: "running",
    cpu: 45,
    mem: 68,
    disk: 30,
    ip: "192.168.1.100:25565",
  },
  {
    id: "SRV-pw-2",
    name: "Palworld Guild",
    game: "Palworld",
    node: "North America (US-W)",
    status: "stopped",
    cpu: 0,
    mem: 0,
    disk: 15,
    ip: "192.168.1.101:8211",
  },
  {
    id: "SRV-cs-3",
    name: "CS2 Matchmaking",
    game: "CS2",
    node: "Europe (DE)",
    status: "running",
    cpu: 82,
    mem: 45,
    disk: 25,
    ip: "192.168.1.102:27015",
  },
];

export const transactions: DashboardTransaction[] = [
  { id: "TX-9901", date: "2026-04-01", amount: 50, type: "deposit", status: "completed", method: "Crypto (USDT)" },
  { id: "TX-9892", date: "2026-03-28", amount: -15, type: "payment", status: "completed", method: "Balance" },
  { id: "TX-9880", date: "2026-03-15", amount: 100, type: "deposit", status: "completed", method: "Credit Card" },
];

export const usageData: DashboardUsageDataPoint[] = [
  { time: "00:00", cpu: 20, memory: 40 },
  { time: "04:00", cpu: 35, memory: 45 },
  { time: "08:00", cpu: 85, memory: 70 },
  { time: "12:00", cpu: 60, memory: 65 },
  { time: "16:00", cpu: 90, memory: 85 },
  { time: "20:00", cpu: 45, memory: 55 },
  { time: "24:00", cpu: 30, memory: 40 },
];

export const teamMembers: DashboardTeamMember[] = [
  { id: 1, name: "CyberCommander", email: "commander@neon-net.local", role: "Owner", twoFA: true },
  { id: 2, name: "NetRunner_99", email: "runner@neon-net.local", role: "Admin", twoFA: true },
  { id: 3, name: "DataGhost", email: "ghost@neon-net.local", role: "Developer", twoFA: false },
];

export const ticketsData: DashboardTicket[] = [
  { id: "T-8991", subject: "BGP Route Announcement Issue", status: "open", priority: "high", updated: "10 分钟前" },
  { id: "T-8980", subject: "Requesting more IPv4 addresses", status: "pending", priority: "medium", updated: "2 小时前" },
  { id: "T-8852", subject: "Palworld server lagging on startup", status: "closed", priority: "low", updated: "3 天前" },
];

export const navPlacementOptions: DashboardNavPlacementOption[] = [
  {
    value: "navbar_embed",
    title: "嵌入主導覽列",
    description: "分頁顯示在頂部主導覽列中央（預設），與 Logo、帳戶區同一橫列。",
  },
  {
    value: "below_navbar",
    title: "主導覽列下方",
    description: "分頁固定在主導覽列正下方，不佔用導覽列內部空間。",
  },
  {
    value: "bottom_float",
    title: "底部浮動",
    description: "分頁固定在瀏覽器視窗底部中央，長頁面時便於快速切換。",
  },
];
