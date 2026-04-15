import {
  Database,
  FileText,
  FolderOpen,
  GitBranch,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Network,
  Package,
  ScrollText,
  Settings,
  Settings2,
  Terminal,
  TerminalSquare,
  Users,
  Users2,
} from "lucide-react";
import type {
  AdminDashboardInstanceInnerTab,
  AdminDashboardNavTab,
  AdminDashboardSettings,
  Doc,
  GlobalRegion,
  Instance,
  NodeGame,
  Plan,
  RegionsMap,
  Ticket,
  Transaction,
} from "./adminDashboardTypes";

export const ADMIN_DASHBOARD_NAV_TABS: readonly AdminDashboardNavTab[] = [
  { id: "overview", label: "面板总览", icon: LayoutDashboard },
  { id: "users", label: "用户管理", icon: Users },
  { id: "instances", label: "实例监控", icon: Terminal },
  { id: "products", label: "产品与价格", icon: Package },
  { id: "nodes", label: "节点与机房配置", icon: MapPin },
  { id: "tickets", label: "客服工单", icon: MessageSquare },
  { id: "docs", label: "文档与资源", icon: FileText },
  { id: "settings", label: "系统设置", icon: Settings },
];

export const ADMIN_DASHBOARD_INSTANCE_TABS: readonly AdminDashboardInstanceInnerTab[] = [
  { id: "console", label: "主页与终端", icon: TerminalSquare },
  { id: "files", label: "文件管理", icon: FolderOpen },
  { id: "logs", label: "活动日志", icon: ScrollText },
  { id: "players", label: "玩家管理", icon: Users2 },
  { id: "versions", label: "版本控制", icon: GitBranch },
  { id: "network", label: "网络与端口", icon: Network },
  { id: "backups", label: "备份中心", icon: Database },
  { id: "startup", label: "启动设置", icon: Settings },
  { id: "management", label: "管理设置", icon: Settings2 },
];

export const ADMIN_TRAFFIC_DATA = [
  { time: "00:00", activeIPs: 1420, bandwidth: 450 },
  { time: "04:00", activeIPs: 980, bandwidth: 230 },
  { time: "08:00", activeIPs: 2150, bandwidth: 850 },
  { time: "12:00", activeIPs: 3450, bandwidth: 1200 },
  { time: "16:00", activeIPs: 4180, bandwidth: 1580 },
  { time: "20:00", activeIPs: 5720, bandwidth: 2240 },
  { time: "24:00", activeIPs: 2300, bandwidth: 920 },
] as const;

export const INITIAL_PLANS: Plan[] = [
  { id: "c2m4", name: "C2M4 标准型", cpu: 2, memory: 4, storage: 80, price: 12 },
  { id: "c4m8", name: "C4M8 性能型", cpu: 4, memory: 8, storage: 160, price: 24 },
  { id: "c8m16", name: "C8M16 企业型", cpu: 8, memory: 16, storage: 320, price: 48 },
  { id: "c16m32", name: "C16M32 旗舰型", cpu: 16, memory: 32, storage: 640, price: 96 },
  { id: "g1-rtx4090", name: "G1 算力型 (RTX 4090)", cpu: 16, memory: 64, storage: 1000, price: 299 },
  { id: "g2-a100", name: "G2 算力型 (A100 80G)", cpu: 32, memory: 128, storage: 2000, price: 899 },
  { id: "m-baremetal-1", name: "物理机 - 基础版", cpu: 32, memory: 128, storage: 2000, price: 150 },
  { id: "m-baremetal-2", name: "物理机 - 高阶版", cpu: 64, memory: 256, storage: 4000, price: 280 },
];

export const GAMES_FOR_NODES: readonly NodeGame[] = [
  { id: "minecraft", name: "Minecraft", icon: "⛏️" },
  { id: "palworld", name: "Palworld", icon: "🐾" },
  { id: "rust", name: "Rust", icon: "⚙️" },
  { id: "cs2", name: "CS2", icon: "🔫" },
];

export const INITIAL_GLOBAL_REGIONS: GlobalRegion[] = [
  {
    id: "asia",
    label: "Asia Pacific",
    nodes: [
      {
        id: "node-tky-01",
        city: "Tokyo",
        latency: "45ms",
        publicIp: "103.45.12.88",
        bandwidth: "10 Gbps",
        cpuSpec: "Dual EPYC 7763 (128C)",
        ramSpec: "512GB DDR4",
        status: "online",
        supportedGames: ["minecraft", "palworld", "cs2"],
      },
      {
        id: "node-hkg-01",
        city: "Hong Kong",
        latency: "15ms",
        publicIp: "45.12.88.103",
        bandwidth: "5 Gbps",
        cpuSpec: "Xeon Platinum 8380 (80C)",
        ramSpec: "256GB DDR4",
        status: "online",
        supportedGames: ["minecraft", "cs2"],
      },
      {
        id: "node-sgp-01",
        city: "Singapore",
        latency: "35ms",
        publicIp: "128.14.55.99",
        bandwidth: "10 Gbps",
        cpuSpec: "EPYC 7713 (64C)",
        ramSpec: "512GB DDR4",
        status: "online",
        supportedGames: ["rust"],
      },
    ],
  },
  {
    id: "americas",
    label: "Americas",
    nodes: [
      {
        id: "node-lax-01",
        city: "Los Angeles",
        latency: "135ms",
        publicIp: "192.168.4.5",
        bandwidth: "20 Gbps",
        cpuSpec: "Dual EPYC 9654 (192C)",
        ramSpec: "1TB DDR5",
        status: "online",
        supportedGames: ["minecraft", "palworld", "rust"],
      },
      {
        id: "node-sea-01",
        city: "Seattle",
        latency: "140ms",
        publicIp: "198.51.100.14",
        bandwidth: "10 Gbps",
        cpuSpec: "Xeon Gold 6348 (56C)",
        ramSpec: "256GB DDR4",
        status: "online",
        supportedGames: ["rust", "cs2"],
      },
    ],
  },
  {
    id: "europe",
    label: "Europe",
    nodes: [
      {
        id: "node-fra-01",
        city: "Frankfurt",
        latency: "165ms",
        publicIp: "46.4.22.11",
        bandwidth: "10 Gbps",
        cpuSpec: "Dual EPYC 7763 (128C)",
        ramSpec: "512GB DDR4",
        status: "online",
        supportedGames: ["minecraft", "rust"],
      },
    ],
  },
];

export const INITIAL_NODES_BY_GAME: RegionsMap = {
  minecraft: [
    {
      id: "mc-china",
      label: "中国大陆",
      nodes: [
        { city: "上海 (BGP 高防)", latency: "预计延迟 8-18ms" },
        { city: "广州 (直连)", latency: "预计延迟 10-22ms" },
        { city: "北京 (CN2)", latency: "预计延迟 15-25ms" },
      ],
    },
    {
      id: "mc-asia",
      label: "亚洲",
      nodes: [
        { city: "香港 (CN2 GIA)", latency: "预计延迟 15-28ms" },
        { city: "新加坡 (国际线路)", latency: "预计延迟 35-50ms" },
        { city: "东京 (软银)", latency: "预计延迟 40-55ms" },
        { city: "首尔 (混合 BGP)", latency: "预计延迟 30-45ms" },
      ],
    },
    {
      id: "mc-americas",
      label: "美洲",
      nodes: [
        { city: "洛杉矶 (CN2 GIA)", latency: "预计延迟 130-155ms" },
        { city: "西雅图 (高防)", latency: "预计延迟 140-160ms" },
        { city: "圣何塞", latency: "预计延迟 135-155ms" },
      ],
    },
    {
      id: "mc-europe",
      label: "欧洲",
      nodes: [
        { city: "法兰克福 (CN2)", latency: "预计延迟 160-180ms" },
        { city: "阿姆斯特丹 (普通)", latency: "预计延迟 180-200ms" },
        { city: "伦敦 (普通)", latency: "预计延迟 170-190ms" },
      ],
    },
  ],
  palworld: [
    {
      id: "pal-asia",
      label: "亚洲优化区",
      nodes: [
        { city: "东京 (大带宽)", latency: "预计延迟 35-50ms" },
        { city: "香港 (直连)", latency: "预计延迟 15-25ms" },
      ],
    },
    {
      id: "pal-americas",
      label: "美洲优化区",
      nodes: [{ city: "洛杉矶 (高防)", latency: "预计延迟 135-160ms" }],
    },
  ],
  rust: [
    {
      id: "rust-global",
      label: "全球高防专区",
      nodes: [
        { city: "西雅图 (200G 高防)", latency: "预计延迟 140ms" },
        { city: "法兰克福 (100G 高防)", latency: "预计延迟 165ms" },
        { city: "新加坡 (50G 高防)", latency: "预计延迟 45ms" },
      ],
    },
  ],
  cs2: [
    {
      id: "cs2-china",
      label: "中国大陆 (128 Tick)",
      nodes: [
        { city: "上海 (BGP)", latency: "预计延迟 10-15ms" },
        { city: "北京 (BGP)", latency: "预计延迟 12-20ms" },
        { city: "成都 (BGP)", latency: "预计延迟 18-25ms" },
      ],
    },
    {
      id: "cs2-asia",
      label: "亚洲区 (128 Tick)",
      nodes: [
        { city: "香港 (专线)", latency: "预计延迟 20-30ms" },
        { city: "东京 (专线)", latency: "预计延迟 40-50ms" },
      ],
    },
  ],
};

export const INITIAL_DOCS: Doc[] = [
  { id: 1, title: "如何部署你的第一个 Minecraft 服务器", category: "Minecraft", date: "2026-03-12", status: "published" },
  { id: 2, title: "Linux 防火墙配置与端口放行指南", category: "安全", date: "2026-03-20", status: "draft" },
  { id: 3, title: "Rust 开荒与建服基础教程", category: "Rust", date: "2026-04-01", status: "published" },
  { id: 4, title: "CS2 社区服插件安装全解析", category: "CS2", date: "2026-04-05", status: "published" },
  { id: 5, title: "Palworld 幻兽帕鲁 伺服器优化与内存泄漏解决方案", category: "Palworld", date: "2026-04-08", status: "published" },
  { id: 6, title: "云服务器 (ECS) 自动备份策略设置", category: "云端运算", date: "2026-04-08", status: "draft" },
  { id: 7, title: "DDOS 防护机制与 IP 封禁规则说明", category: "安全", date: "2026-04-09", status: "published" },
];

export const INITIAL_INSTANCES: Instance[] = [
  { id: "SRV-9A8B", userId: "USR-0829", game: "Minecraft", node: "上海 (BGP 高防)", status: "running", cpuUsage: 45, memUsage: 82, planName: "C4M8 性能型", price: 24 },
  { id: "SRV-2C4F", userId: "USR-2944", game: "Rust", node: "法兰克福 (100G 高防)", status: "running", cpuUsage: 88, memUsage: 95, planName: "C8M16 企业型", price: 48 },
  { id: "SRV-7D1E", userId: "USR-3312", game: "CS2", node: "香港 (专线)", status: "stopped", cpuUsage: 0, memUsage: 0, planName: "C2M4 标准型", price: 12 },
  { id: "SRV-5F9A", userId: "USR-0829", game: "Palworld", node: "东京 (大带宽)", status: "installing", cpuUsage: 100, memUsage: 10, planName: "C16M32 旗舰型", price: 96 },
];

/** 與後台 admin@gmail.com 的 `admin_display_id`（內建規則：USR- + user id 四位）對齊，供「事件與交易紀錄」示範。 */
const ADMIN_DEMO_USER_DISPLAY_ID = "USR-0004";

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "TXN-9091", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-04-08 14:22", amount: 50, type: "deposit", status: "completed", description: "Stripe 充值 (Visa)", method: "Credit Card (**** 4242)" },
  { id: "TXN-9088", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-04-01 00:00", amount: -24, type: "payment", status: "completed", description: "包月扣费 - SRV-9A8B", method: "Account Balance" },
  { id: "TXN-9080", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-03-30 11:15", amount: -96, type: "payment", status: "completed", description: "新购实例 - SRV-5F9A", method: "Account Balance" },
  { id: "TXN-9012", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-03-15 09:11", amount: 100, type: "deposit", status: "completed", description: "USDT-TRC20 充值", method: "Crypto Wallet (0x...A1b2)" },
  { id: "TXN-9005", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-03-10 10:00", amount: 15, type: "bonus", status: "completed", description: "邀请奖励 (邀请: USR-3312)", method: "Referral Bonus" },
  { id: "TXN-78001", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-04-10 09:40", amount: 200, type: "deposit", status: "pending", description: "USDT-TRC20 充值（鏈上確認中）", method: "Crypto Wallet (TX...pending)" },
  { id: "TXN-78003", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-04-06 02:10", amount: -48, type: "payment", status: "pending", description: "自動續費 - SRV-2C4F", method: "Account Balance" },
  { id: "TXN-78002", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-04-07 16:05", amount: 12, type: "refund", status: "completed", description: "方案降級差額退款", method: "退回帳戶餘額" },
  { id: "TXN-78004", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-03-28 19:22", amount: -12, type: "payment", status: "completed", description: "CS2 節點流量加購（50GB）", method: "Account Balance" },
  { id: "TXN-78005", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-03-22 11:03", amount: 500, type: "deposit", status: "failed", description: "銀行轉帳（憑證與帳號不符）", method: "Bank Transfer (尾號 7781)" },
  { id: "TXN-78017", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-03-05 12:00", amount: 20, type: "bonus", status: "completed", description: "春季活動贈金", method: "Promo Campaign" },
  { id: "TXN-78018", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-02-14 21:18", amount: 25, type: "deposit", status: "completed", description: "Apple Pay 快速充值", method: "Apple Pay" },
  { id: "TXN-78019", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-02-01 08:55", amount: -299, type: "payment", status: "completed", description: "G1 算力型按量計費結算", method: "Account Balance" },
  { id: "TXN-78006", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-04-09 13:30", amount: 80, type: "deposit", status: "completed", description: "PayPal 充值", method: "PayPal" },
  { id: "TXN-78007", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-04-05 00:00", amount: -12, type: "payment", status: "completed", description: "包月扣費 - SRV-7D1E", method: "Account Balance" },
  { id: "TXN-78008", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-03-20 10:00", amount: 10, type: "bonus", status: "completed", description: "邀請獎勵（新用戶註冊）", method: "Referral Bonus" },
  { id: "TXN-78009", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-03-12 15:44", amount: -24, type: "payment", status: "failed", description: "自動扣款失敗（餘額不足）", method: "Account Balance" },
  { id: "TXN-78020", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-01-15 18:20", amount: 30, type: "deposit", status: "completed", description: "支付寶充值", method: "Alipay" },
  { id: "TXN-78010", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-04-11 07:05", amount: 200, type: "deposit", status: "completed", description: "信用卡充值（Visa）", method: "Credit Card (**** 9921)" },
  { id: "TXN-78011", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-04-02 00:00", amount: -48, type: "payment", status: "completed", description: "Rust 專線實例月費", method: "Account Balance" },
  { id: "TXN-78012", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-03-08 14:11", amount: 15, type: "refund", status: "completed", description: "工單 TK-8821 服務補償", method: "Account Balance" },
  { id: "TXN-78013", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-02-19 09:00", amount: 300, type: "deposit", status: "pending", description: "電匯入帳審核中", method: "Wire Transfer" },
  { id: "TXN-8099", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-01-06 18:45", amount: 20, type: "deposit", status: "failed", description: "Stripe 充值 (Mastercard)", method: "Credit Card (**** 5511)" },
  { id: "TXN-78014", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-03-28 22:01", amount: -5.25, type: "payment", status: "completed", description: "試用方案到期結算", method: "Account Balance" },
  { id: "TXN-78015", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-03-01 11:40", amount: 5.25, type: "refund", status: "completed", description: "帳戶凍結後餘額退回", method: "原支付方式" },
  { id: "TXN-78016", userId: ADMIN_DEMO_USER_DISPLAY_ID, date: "2026-01-20 20:05", amount: 10, type: "deposit", status: "failed", description: "3D Secure 驗證逾時", method: "Credit Card (**** 5511)" },
];

export const INITIAL_TICKETS: Ticket[] = [
  { id: "TK-8821", subject: "服务器被 DDOS 攻击，IP 无法访问", user: "USR-2944", priority: "urgent", status: "open", updatedAt: "10 分钟前" },
  { id: "TK-8820", subject: "请问如何为 Rust 伺服器安装特定 Oxide 插件？", user: "USR-0829", priority: "normal", status: "open", updatedAt: "1 小时前" },
  { id: "TK-8815", subject: "季付套餐升降级退款申请", user: "USR-3312", priority: "low", status: "answered", updatedAt: "3 小时前" },
];

export const DEFAULT_SETTINGS: AdminDashboardSettings = {
  maintenanceMode: false,
  autoProvision: true,
  newRegistrations: true,
  smtpHost: "smtp.mailgun.org",
  stripeKey: "sk_live_51M...",
};
