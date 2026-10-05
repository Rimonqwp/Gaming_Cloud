// Game hosting demo data; replace with account-scoped API data when available.
export type ConsoleInstance = {
  id: string; name: string; game: string; region: string; cpu: number; memory: number;
  uptime: string; running: boolean; ip: string; port: number; cores: number; ram: number;
  players: number; slots: number; saveGB: number; backups: number;
};

export const consoleInstances: ConsoleInstance[] = [
  { id: "srv-mc-01", name: "Minecraft 生存服", game: "Minecraft", region: "华东（上海）", cpu: 50, memory: 75, uptime: "12 天 6 小时", running: true, ip: "203.0.113.10", port: 25565, cores: 4, ram: 8, players: 28, slots: 40, saveGB: 32, backups: 7 },
  { id: "srv-pal-01", name: "幻兽帕鲁公会服", game: "Palworld / 幻兽帕鲁", region: "华北（北京）", cpu: 75, memory: 75, uptime: "8 天 3 小时", running: true, ip: "203.0.113.11", port: 8211, cores: 8, ram: 16, players: 32, slots: 32, saveGB: 48, backups: 7 },
  { id: "srv-terraria-01", name: "泰拉瑞亚冒险服", game: "Terraria / 泰拉瑞亚", region: "华南（广州）", cpu: 0, memory: 0, uptime: "—", running: false, ip: "203.0.113.12", port: 7777, cores: 2, ram: 4, players: 0, slots: 16, saveGB: 8, backups: 3 },
  { id: "srv-rust-01", name: "Rust 社区服", game: "Rust", region: "华东（上海）", cpu: 40, memory: 50, uptime: "5 天 8 小时", running: true, ip: "203.0.113.13", port: 28015, cores: 4, ram: 8, players: 20, slots: 50, saveGB: 36, backups: 5 },
  { id: "srv-dst-01", name: "饥荒联机好友服", game: "Don't Starve Together / 饥荒联机版", region: "新加坡", cpu: 20, memory: 50, uptime: "6 天 0 小时", running: true, ip: "203.0.113.14", port: 10999, cores: 2, ram: 4, players: 6, slots: 10, saveGB: 4, backups: 2 },
];

const sum = (key: "players" | "slots" | "saveGB" | "backups" | "cores" | "ram") => consoleInstances.reduce((total, server) => total + server[key], 0);
const runningCount = consoleInstances.filter(server => server.running).length;
export const resourceMetrics = [
  { title: "游戏服务器", value: String(consoleInstances.length), unit: "台", summary: `${runningCount} 台运行中 · ${consoleInstances.length - runningCount} 台已停止`, description: "已部署的游戏服务器，包含运行中与已停止的服务器。", tone: "blue", points: [2, 2, 3, 3, 4, 4, 5, 5] },
  { title: "存档备份", value: String(sum("backups")), unit: "份", summary: "全部服务器存档备份", description: "保留的游戏存档备份副本合计，可按服务器查看备份数量。", tone: "green", points: [24, 38, 32, 50, 44, 68, 72, 86] },
  { title: "累计流量消耗", value: "1,280", unit: "GB", summary: "全部服务器累计流量", description: "所有服务器累计消耗的网络流量，当前为演示数据。", tone: "purple", points: [80, 88, 90, 101, 108, 116, 122, 128] },
  { title: "账户余额", value: "", unit: "美元", summary: "账户当前可用余额", description: "账户当前可用余额，可在财务页面查看充值与消费记录。", tone: "teal", points: [8, 10, 12, 16, 18, 20, 22, 24] },
];

export const metricColors: Record<string, string> = { blue: "#1683ff", green: "#00c78e", purple: "#7660ff", teal: "#08c9cb" };
export const resourceUsage = [
  { key: "cpu", title: "CPU 使用率", color: "#1683ff", total: sum("cores"), used: consoleInstances.reduce((total, server) => total + (server.running ? server.cores * server.cpu / 100 : 0), 0), unit: "核" },
  { key: "memory", title: "内存使用率", color: "#20d3be", total: sum("ram"), used: consoleInstances.reduce((total, server) => total + (server.running ? server.ram * server.memory / 100 : 0), 0), unit: "GB" },
].map(metric => ({ ...metric, value: Math.round(metric.used / metric.total * 100), rest: metric.total - metric.used }));

export const gameRegions = [
  { name: "北美", city: "硅谷", status: "正常", tone: "green", x: 19.4, y: 29.9, label: "left", description: "游戏托管节点网络正常，可用于部署游戏服务器。" },
  { name: "欧洲", city: "法兰克福", status: "正常", tone: "green", x: 52, y: 20.9, label: "right", description: "游戏托管节点网络正常，可用于部署游戏服务器。" },
  { name: "华北", city: "北京", status: "正常", tone: "green", x: 78.8, y: 28.1, label: "right", description: "幻兽帕鲁公会服运行正常，当前在线 32 人。" },
  { name: "华东", city: "上海", status: "正常", tone: "green", x: 81.2, y: 45, label: "right", description: "Minecraft 生存服与 Rust 社区服运行正常，当前在线共 48 人。" },
  { name: "华南", city: "广州", status: "正常", tone: "green", x: 77, y: 49, label: "left", description: "游戏托管节点正常；泰拉瑞亚冒险服已停止，存档和备份已保留。" },
  { name: "亚太", city: "新加坡", status: "待维护", tone: "orange", x: 77.9, y: 69, label: "right", description: "饥荒联机好友服当前在线 6 人。10 月 9 日 02:00–02:15（HKT，香港时间）计划维护，期间可能短暂断线，请提前保存世界存档。" },
];

const inbound = [8, 10, 9, 8, 7, 6, 5, 5, 6, 8, 12, 14, 16, 18, 20, 19, 21, 24, 26, 28, 30, 32, 29, 27, 26];
const outbound = [16, 20, 18, 16, 14, 12, 10, 10, 12, 16, 24, 28, 32, 36, 40, 38, 42, 48, 52, 56, 60, 64, 58, 54, 52];
export const networkData = inbound.map((value, hour) => ({ hour, inbound: value, outbound: outbound[hour] }));
export const weeklyNetworkData = [
  { hour: 0, inbound: 18, outbound: 36 }, { hour: 4, inbound: 22, outbound: 44 },
  { hour: 8, inbound: 20, outbound: 40 }, { hour: 12, inbound: 24, outbound: 48 },
  { hour: 16, inbound: 26, outbound: 52 }, { hour: 20, inbound: 32, outbound: 64 },
  { hour: 24, inbound: 26, outbound: 52 },
];
export const costData = [
  { month: "4月", server: 360, backup: 20, protection: 30, bandwidth: 40 },
  { month: "5月", server: 420, backup: 25, protection: 30, bandwidth: 50 },
  { month: "6月", server: 540, backup: 30, protection: 40, bandwidth: 60 },
  { month: "7月", server: 620, backup: 35, protection: 40, bandwidth: 70 },
  { month: "8月", server: 680, backup: 40, protection: 50, bandwidth: 80 },
  { month: "9月", server: 680, backup: 40, protection: 50, bandwidth: 85 },
];
export const costCategories = [
  { key: "server", name: "租用", color: "#1683ff" },
  { key: "backup", name: "备份", color: "#21ceb4" },
  { key: "protection", name: "防护", color: "#ffc534" },
  { key: "bandwidth", name: "带宽", color: "#8a9aff" },
];
