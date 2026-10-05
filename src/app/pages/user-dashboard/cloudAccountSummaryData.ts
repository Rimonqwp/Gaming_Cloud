import { consoleInstances } from "./cloudDashboardData";

// Account summary fixtures, using the same server configurations as the instance list.
// Replace with account purchases and pool reservations when those APIs are available.
export const flexiblePool = {
  name: "随心配套餐",
  cores: 16,
  ram: 16,
  storageGB: 200,
  monthlyTrafficGB: 1024,
  trafficResetDay: 1,
  instanceIds: ["srv-mc-01", "srv-dst-01"],
};

const poolColors = ["#1683ff", "#13c6ad", "#8b7cf8", "#f5a623", "#ed729a"];
// Disk reservations and monthly traffic are separate from saved game size and lifetime traffic.
const poolServerResources: Record<string, { storageGB: number; monthlyTrafficGB: number }> = {
  "srv-mc-01": { storageGB: 128, monthlyTrafficGB: 211 },
  "srv-dst-01": { storageGB: 32, monthlyTrafficGB: 65 },
};
export const poolInstances = consoleInstances
  .filter(server => flexiblePool.instanceIds.includes(server.id))
  .map(server => ({ ...server, ...poolServerResources[server.id], color: poolColors[flexiblePool.instanceIds.indexOf(server.id) % poolColors.length] }));
export const poolAllocated = poolInstances.reduce(
  (total, server) => ({ cores: total.cores + server.cores, ram: total.ram + server.ram, storageGB: total.storageGB + server.storageGB }),
  { cores: 0, ram: 0, storageGB: 0 },
);
export const poolMonthlyTraffic = poolInstances.reduce((total, server) => total + server.monthlyTrafficGB, 0);
export const poolResources = [
  { key: "cores", title: "CPU", unit: "核", total: flexiblePool.cores, used: poolAllocated.cores, usedLabel: "已分配", remainingLabel: "可分配" },
  { key: "ram", title: "内存", unit: "GB", total: flexiblePool.ram, used: poolAllocated.ram, usedLabel: "已分配", remainingLabel: "可分配" },
  { key: "storageGB", title: "存储空间", unit: "GB", total: flexiblePool.storageGB, used: poolAllocated.storageGB, usedLabel: "已分配", remainingLabel: "可分配" },
  { key: "monthlyTrafficGB", title: "本月流量", unit: "GB", total: flexiblePool.monthlyTrafficGB, used: poolMonthlyTraffic, usedLabel: "已消耗", remainingLabel: "本月剩余" },
] as const;

export const monthlyPurchases = [
  { id: "flexible", name: flexiblePool.name, specification: "16 核 / 16 GB 内存 / 200 GB 存储 / 1,024 GB 月流量", amount: 64 },
  { id: "palworld", name: "幻兽帕鲁套餐", specification: "8 核 / 16 GB", amount: 48 },
  { id: "rust", name: "Rust 套餐", specification: "4 核 / 8 GB", amount: 24 },
  { id: "terraria", name: "泰拉瑞亚套餐", specification: "2 核 / 4 GB", amount: 12 },
];

export const monthlySpend = monthlyPurchases.reduce((total, purchase) => total + purchase.amount, 0);
export const formatSummaryMoney = (amount: number) => new Intl.NumberFormat("zh-CN", {
  style: "currency", currency: "USD", currencyDisplay: "narrowSymbol",
}).format(amount);
