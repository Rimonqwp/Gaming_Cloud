import { consoleInstances } from "./cloudDashboardData";

// Account summary fixtures, using the same server configurations as the instance list.
// Replace with account purchases and pool reservations when those APIs are available.
export const flexiblePool = {
  name: "随心配套餐",
  cores: 16,
  ram: 16,
  instanceIds: ["srv-mc-01", "srv-dst-01"],
};

const poolColors = ["#1683ff", "#13c6ad", "#8b7cf8", "#f5a623", "#ed729a"];
export const poolInstances = consoleInstances
  .filter(server => flexiblePool.instanceIds.includes(server.id))
  .map(server => ({ ...server, color: poolColors[flexiblePool.instanceIds.indexOf(server.id) % poolColors.length] }));
export const poolAllocated = poolInstances.reduce(
  (total, server) => ({ cores: total.cores + server.cores, ram: total.ram + server.ram }),
  { cores: 0, ram: 0 },
);

export const monthlyPurchases = [
  { id: "flexible", name: flexiblePool.name, specification: "16 核 / 16 GB", amount: 64 },
  { id: "palworld", name: "幻兽帕鲁套餐", specification: "8 核 / 16 GB", amount: 48 },
  { id: "rust", name: "Rust 套餐", specification: "4 核 / 8 GB", amount: 24 },
  { id: "terraria", name: "泰拉瑞亚套餐", specification: "2 核 / 4 GB", amount: 12 },
];

export const monthlySpend = monthlyPurchases.reduce((total, purchase) => total + purchase.amount, 0);
export const formatSummaryMoney = (amount: number) => new Intl.NumberFormat("zh-CN", {
  style: "currency", currency: "USD", currencyDisplay: "narrowSymbol",
}).format(amount);
