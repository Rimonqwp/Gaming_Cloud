import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createHash,
  pbkdf2Sync,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  statSync,
} from "node:fs";

import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "data");
const dbPath = path.join(dataDir, "admin-auth.sqlite");
const distDir = path.join(projectRoot, "dist");
const port = Number(process.env.ADMIN_AUTH_PORT || 8787);

mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash
  ON admin_sessions(token_hash);

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL COLLATE NOCASE UNIQUE,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    display_name TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    uid TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash
  ON user_sessions(token_hash);

  CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INTEGER PRIMARY KEY,
    prefs_json TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_admin_profiles (
    user_id INTEGER PRIMARY KEY,
    admin_display_id TEXT NOT NULL UNIQUE,
    balance REAL NOT NULL DEFAULT 0,
    bonus_credit REAL NOT NULL DEFAULT 0,
    rank TEXT NOT NULL DEFAULT 'Bronze',
    status TEXT NOT NULL DEFAULT 'active',
    registered_at TEXT,
    phone TEXT,
    discord_id TEXT,
    kyc_verified INTEGER NOT NULL DEFAULT 0,
    two_factor_enabled INTEGER NOT NULL DEFAULT 0,
    referral_code TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referral_id TEXT NOT NULL UNIQUE,
    code_owner_user_id INTEGER NOT NULL,
    referred_user_display_id TEXT NOT NULL,
    referred_user_email TEXT NOT NULL,
    awarded_at TEXT NOT NULL,
    bonus_earned REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code_owner_user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS admin_user_instances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instance_id TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    game TEXT NOT NULL,
    node TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'running',
    cpu_usage REAL NOT NULL DEFAULT 0,
    mem_usage REAL NOT NULL DEFAULT 0,
    plan_name TEXT,
    price REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_admin_user_instances_user_id
  ON admin_user_instances(user_id);

  CREATE TABLE IF NOT EXISTS admin_user_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    transaction_date TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    method TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_admin_user_transactions_user_id
  ON admin_user_transactions(user_id);

  CREATE TABLE IF NOT EXISTS admin_user_payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_method_id TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    payment_type TEXT NOT NULL,
    brand TEXT NOT NULL,
    label TEXT NOT NULL,
    last4 TEXT,
    expiry TEXT,
    display_value TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_admin_user_payment_methods_user_id
  ON admin_user_payment_methods(user_id);

  CREATE TABLE IF NOT EXISTS admin_user_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_admin_user_tickets_user_id
  ON admin_user_tickets(user_id);

  CREATE TABLE IF NOT EXISTS admin_datacenter_regions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_datacenter_nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id TEXT NOT NULL UNIQUE,
    region_id TEXT NOT NULL,
    city TEXT NOT NULL,
    latency TEXT NOT NULL,
    public_ip TEXT NOT NULL,
    bandwidth TEXT NOT NULL,
    cpu_spec TEXT NOT NULL,
    ram_spec TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'offline',
    supported_games TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES admin_datacenter_regions(region_id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_admin_datacenter_nodes_region_id
  ON admin_datacenter_nodes(region_id);
`);

function ensureUserEmailColumn() {
  const columns = db.prepare("PRAGMA table_info(users)").all();
  const hasEmailColumn = columns.some((column) => column.name === "email");

  if (!hasEmailColumn) {
    db.exec("ALTER TABLE users ADD COLUMN email TEXT");
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_nocase
    ON users(email COLLATE NOCASE)
  `);

  db.prepare(
    `
      UPDATE users
      SET email = lower(username) || '@local.user'
      WHERE email IS NULL OR trim(email) = ''
    `,
  ).run();
}

function generateRandomUserUid() {
  return String(randomInt(100000000000, 1000000000000));
}

function generateUniqueUserUid() {
  let uid = generateRandomUserUid();
  while (db.prepare("SELECT 1 FROM users WHERE uid = ? LIMIT 1").get(uid)) {
    uid = generateRandomUserUid();
  }
  return uid;
}

function ensureUserUidColumn() {
  const columns = db.prepare("PRAGMA table_info(users)").all();
  const hasUidColumn = columns.some((column) => column.name === "uid");

  if (!hasUidColumn) {
    db.exec("ALTER TABLE users ADD COLUMN uid TEXT");
  }

  const usersMissingUid = db
    .prepare(
      `
        SELECT id
        FROM users
        WHERE uid IS NULL OR trim(uid) = ''
      `,
    )
    .all();

  const updateUserUid = db.prepare("UPDATE users SET uid = ? WHERE id = ?");

  for (const user of usersMissingUid) {
    updateUserUid.run(generateUniqueUserUid(), user.id);
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_uid
    ON users(uid)
  `);
}

const VALID_ADMIN_USER_RANKS = new Set([
  "Bronze",
  "Silver",
  "Gold",
  "Diamond",
  "Partner",
]);

const VALID_ADMIN_USER_STATUSES = new Set([
  "active",
  "banned",
  "suspended",
]);

const VALID_ADMIN_WALLET_KINDS = new Set([
  "balance",
  "bonus",
]);

const VALID_ADMIN_WALLET_OPERATIONS = new Set([
  "add",
  "deduct",
  "set",
  "zero",
]);

const DASHBOARD_ADMIN_UID = "586342232960";

const LEGACY_ADMIN_USER_PROFILE_SEEDS = new Map([
  [
    DASHBOARD_ADMIN_UID,
    {
      adminDisplayId: "USR-0829",
      balance: 125.5,
      bonusCredit: 50,
      rank: "Diamond",
      status: "active",
      registeredAt: "2025-11-20",
      phone: "+1 (555) 019-2834",
      discordId: "Master#0001",
      kycVerified: true,
      twoFactorEnabled: true,
      referralCode: "GAMEMASTER99",
    },
  ],
  [
    "163421302551",
    {
      adminDisplayId: "USR-3312",
      balance: 42,
      bonusCredit: 15,
      rank: "Gold",
      status: "active",
      registeredAt: "2025-10-03",
      phone: "+852 6123 8841",
      discordId: "AuroraOps#2481",
      kycVerified: true,
      twoFactorEnabled: false,
      referralCode: "AURORA3312",
    },
  ],
  [
    "163421302552",
    {
      adminDisplayId: "USR-2944",
      balance: 210,
      bonusCredit: 0,
      rank: "Partner",
      status: "active",
      registeredAt: "2025-08-18",
      phone: "+81 90-4412-3388",
      discordId: "RustWarden#4200",
      kycVerified: true,
      twoFactorEnabled: true,
      referralCode: "RUSTMINT2944",
    },
  ],
  [
    "163421302553",
    {
      adminDisplayId: "USR-1102",
      balance: 5.25,
      bonusCredit: 0,
      rank: "Silver",
      status: "suspended",
      registeredAt: "2025-12-06",
      phone: null,
      discordId: null,
      kycVerified: false,
      twoFactorEnabled: false,
      referralCode: "PLAYER1102",
    },
  ],
]);

const LEGACY_ADMIN_REFERRAL_SEEDS = [
  {
    referralId: "REF-101",
    ownerUid: DASHBOARD_ADMIN_UID,
    referredUserDisplayId: "USR-3312",
    referredUserEmail: "mc_admin_team@mcserver.net",
    awardedAt: "2026-03-10",
    bonusEarned: 15,
  },
  {
    referralId: "REF-102",
    ownerUid: DASHBOARD_ADMIN_UID,
    referredUserDisplayId: "USR-1102",
    referredUserEmail: "player_one@gmail.com",
    awardedAt: "2026-04-02",
    bonusEarned: 5,
  },
  {
    referralId: "REF-103",
    ownerUid: "163421302552",
    referredUserDisplayId: "USR-2944",
    referredUserEmail: "new_studio@indie.co",
    awardedAt: "2026-03-25",
    bonusEarned: 50,
  },
];

const LEGACY_DEMO_USER_SEEDS = [
  {
    username: "aurora_ops",
    email: "mc_admin_team@mcserver.net",
    displayName: "Aurora Ops",
    password: "DemoPass123!",
    uid: "163421302551",
    createdAt: "2025-10-03 09:30:00",
  },
  {
    username: "rustwarden",
    email: "new_studio@indie.co",
    displayName: "Rust Warden",
    password: "DemoPass123!",
    uid: "163421302552",
    createdAt: "2025-08-18 14:10:00",
  },
  {
    username: "player_one",
    email: "player_one@gmail.com",
    displayName: "Player One",
    password: "DemoPass123!",
    uid: "163421302553",
    createdAt: "2025-12-06 18:45:00",
  },
];

const LEGACY_ADMIN_INSTANCE_SEEDS = [
  {
    instanceId: "SRV-9A8B",
    ownerUid: DASHBOARD_ADMIN_UID,
    game: "Minecraft",
    node: "Shanghai (BGP Shield)",
    status: "running",
    cpuUsage: 45,
    memUsage: 82,
    planName: "C4M8 Performance",
    price: 24,
  },
  {
    instanceId: "SRV-2C4F",
    ownerUid: "163421302552",
    game: "Rust",
    node: "Frankfurt (100G Protection)",
    status: "running",
    cpuUsage: 88,
    memUsage: 95,
    planName: "C8M16 Business",
    price: 48,
  },
  {
    instanceId: "SRV-7D1E",
    ownerUid: "163421302551",
    game: "CS2",
    node: "Hong Kong (Premium Line)",
    status: "stopped",
    cpuUsage: 0,
    memUsage: 0,
    planName: "C2M4 Standard",
    price: 12,
  },
  {
    instanceId: "SRV-5F9A",
    ownerUid: DASHBOARD_ADMIN_UID,
    game: "Palworld",
    node: "Tokyo (High Bandwidth)",
    status: "installing",
    cpuUsage: 100,
    memUsage: 10,
    planName: "C16M32 Flagship",
    price: 96,
  },
];

const LEGACY_ADMIN_TRANSACTION_SEEDS = [
  {
    transactionId: "TXN-9091",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-04-08 14:22",
    amount: 50,
    type: "deposit",
    status: "completed",
    description: "Stripe top up (Visa)",
    method: "Credit Card (**** 4242)",
  },
  {
    transactionId: "TXN-9088",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-04-01 00:00",
    amount: -24,
    type: "payment",
    status: "completed",
    description: "Monthly billing - SRV-9A8B",
    method: "Account Balance",
  },
  {
    transactionId: "TXN-9080",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-03-30 11:15",
    amount: -96,
    type: "payment",
    status: "completed",
    description: "New instance purchase - SRV-5F9A",
    method: "Account Balance",
  },
  {
    transactionId: "TXN-9012",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-03-15 09:11",
    amount: 100,
    type: "deposit",
    status: "completed",
    description: "USDT-TRC20 top up",
    method: "Crypto Wallet (0x...A1b2)",
  },
  {
    transactionId: "TXN-9005",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-03-10 10:00",
    amount: 15,
    type: "bonus",
    status: "completed",
    description: "Referral reward (USR-3312)",
    method: "Referral Bonus",
  },
  {
    transactionId: "TXN-8099",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-01-06 18:45",
    amount: 20,
    type: "deposit",
    status: "failed",
    description: "Stripe top up (Mastercard)",
    method: "Credit Card (**** 5511)",
  },
  {
    transactionId: "TXN-78001",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-04-10 09:40",
    amount: 200,
    type: "deposit",
    status: "pending",
    description: "USDT-TRC20 充值（鏈上確認中）",
    method: "Crypto Wallet (TX...pending)",
  },
  {
    transactionId: "TXN-78002",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-04-07 16:05",
    amount: 12,
    type: "refund",
    status: "completed",
    description: "方案降級差額退款",
    method: "退回帳戶餘額",
  },
  {
    transactionId: "TXN-78003",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-04-06 02:10",
    amount: -48,
    type: "payment",
    status: "pending",
    description: "自動續費 - SRV-2C4F",
    method: "Account Balance",
  },
  {
    transactionId: "TXN-78004",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-03-28 19:22",
    amount: -12,
    type: "payment",
    status: "completed",
    description: "CS2 節點流量加購（50GB）",
    method: "Account Balance",
  },
  {
    transactionId: "TXN-78005",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-03-22 11:03",
    amount: 500,
    type: "deposit",
    status: "failed",
    description: "銀行轉帳（憑證與帳號不符）",
    method: "Bank Transfer (尾號 7781)",
  },
  {
    transactionId: "TXN-78017",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-03-05 12:00",
    amount: 20,
    type: "bonus",
    status: "completed",
    description: "春季活動贈金",
    method: "Promo Campaign",
  },
  {
    transactionId: "TXN-78018",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-02-14 21:18",
    amount: 25,
    type: "deposit",
    status: "completed",
    description: "Apple Pay 快速充值",
    method: "Apple Pay",
  },
  {
    transactionId: "TXN-78019",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-02-01 08:55",
    amount: -299,
    type: "payment",
    status: "completed",
    description: "G1 算力型按量計費結算",
    method: "Account Balance",
  },
  {
    transactionId: "TXN-78006",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-04-09 13:30",
    amount: 80,
    type: "deposit",
    status: "completed",
    description: "PayPal 充值",
    method: "PayPal",
  },
  {
    transactionId: "TXN-78007",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-04-05 00:00",
    amount: -12,
    type: "payment",
    status: "completed",
    description: "包月扣費 - SRV-7D1E",
    method: "Account Balance",
  },
  {
    transactionId: "TXN-78008",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-03-20 10:00",
    amount: 10,
    type: "bonus",
    status: "completed",
    description: "邀請獎勵（新用戶註冊）",
    method: "Referral Bonus",
  },
  {
    transactionId: "TXN-78009",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-03-12 15:44",
    amount: -24,
    type: "payment",
    status: "failed",
    description: "自動扣款失敗（餘額不足）",
    method: "Account Balance",
  },
  {
    transactionId: "TXN-78020",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-01-15 18:20",
    amount: 30,
    type: "deposit",
    status: "completed",
    description: "支付寶充值",
    method: "Alipay",
  },
  {
    transactionId: "TXN-78010",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-04-11 07:05",
    amount: 200,
    type: "deposit",
    status: "completed",
    description: "信用卡充值（Visa）",
    method: "Credit Card (**** 9921)",
  },
  {
    transactionId: "TXN-78011",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-04-02 00:00",
    amount: -48,
    type: "payment",
    status: "completed",
    description: "Rust 專線實例月費",
    method: "Account Balance",
  },
  {
    transactionId: "TXN-78012",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-03-08 14:11",
    amount: 15,
    type: "refund",
    status: "completed",
    description: "工單 TK-8821 服務補償",
    method: "Account Balance",
  },
  {
    transactionId: "TXN-78013",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-02-19 09:00",
    amount: 300,
    type: "deposit",
    status: "pending",
    description: "電匯入帳審核中",
    method: "Wire Transfer",
  },
  {
    transactionId: "TXN-78014",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-03-28 22:01",
    amount: -5.25,
    type: "payment",
    status: "completed",
    description: "試用方案到期結算",
    method: "Account Balance",
  },
  {
    transactionId: "TXN-78015",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-03-01 11:40",
    amount: 5.25,
    type: "refund",
    status: "completed",
    description: "帳戶凍結後餘額退回",
    method: "原支付方式",
  },
  {
    transactionId: "TXN-78016",
    ownerUid: DASHBOARD_ADMIN_UID,
    date: "2026-01-20 20:05",
    amount: 10,
    type: "deposit",
    status: "failed",
    description: "3D Secure 驗證逾時",
    method: "Credit Card (**** 5511)",
  },
];

const LEGACY_ADMIN_PAYMENT_METHOD_SEEDS = [
  {
    paymentMethodId: "PM-4242",
    ownerUid: DASHBOARD_ADMIN_UID,
    paymentType: "card",
    brand: "VISA",
    label: "Visa ending in 4242",
    last4: "4242",
    expiry: "12/28",
    displayValue: null,
    isDefault: true,
  },
  {
    paymentMethodId: "PM-A1B2",
    ownerUid: DASHBOARD_ADMIN_UID,
    paymentType: "crypto",
    brand: "Crypto Wallet",
    label: "TRC20 wallet",
    last4: null,
    expiry: null,
    displayValue: "0x...A1b2",
    isDefault: false,
  },
  {
    paymentMethodId: "PM-5511",
    ownerUid: "163421302553",
    paymentType: "card",
    brand: "Mastercard",
    label: "Mastercard ending in 5511",
    last4: "5511",
    expiry: "09/27",
    displayValue: null,
    isDefault: true,
  },
];

const LEGACY_ADMIN_TICKET_SEEDS = [
  {
    ticketId: "TK-8821",
    ownerUid: "163421302552",
    subject: "Traffic spike made the Rust instance unreachable",
    priority: "urgent",
    status: "open",
    updatedAt: "10 minutes ago",
  },
  {
    ticketId: "TK-8820",
    ownerUid: DASHBOARD_ADMIN_UID,
    subject: "How do I install a custom Oxide plugin on Rust?",
    priority: "normal",
    status: "open",
    updatedAt: "1 hour ago",
  },
  {
    ticketId: "TK-8815",
    ownerUid: "163421302551",
    subject: "Need help changing quarterly plan billing",
    priority: "low",
    status: "answered",
    updatedAt: "3 hours ago",
  },
];

const LEGACY_ADMIN_REGION_SEEDS = [
  {
    regionId: "asia",
    label: "Asia Pacific",
  },
  {
    regionId: "americas",
    label: "Americas",
  },
  {
    regionId: "europe",
    label: "Europe",
  },
];

const LEGACY_ADMIN_NODE_SEEDS = [
  {
    nodeId: "node-tky-01",
    regionId: "asia",
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
    nodeId: "node-hkg-01",
    regionId: "asia",
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
    nodeId: "node-sgp-01",
    regionId: "asia",
    city: "Singapore",
    latency: "35ms",
    publicIp: "128.14.55.99",
    bandwidth: "10 Gbps",
    cpuSpec: "EPYC 7713 (64C)",
    ramSpec: "512GB DDR4",
    status: "online",
    supportedGames: ["rust"],
  },
  {
    nodeId: "node-lax-01",
    regionId: "americas",
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
    nodeId: "node-sea-01",
    regionId: "americas",
    city: "Seattle",
    latency: "140ms",
    publicIp: "198.51.100.14",
    bandwidth: "10 Gbps",
    cpuSpec: "Xeon Gold 6348 (56C)",
    ramSpec: "256GB DDR4",
    status: "online",
    supportedGames: ["rust", "cs2"],
  },
  {
    nodeId: "node-fra-01",
    regionId: "europe",
    city: "Frankfurt",
    latency: "165ms",
    publicIp: "46.4.22.11",
    bandwidth: "10 Gbps",
    cpuSpec: "Dual EPYC 7763 (128C)",
    ramSpec: "512GB DDR4",
    status: "online",
    supportedGames: ["minecraft", "rust"],
  },
];

function normalizeAdminUserRank(value) {
  return VALID_ADMIN_USER_RANKS.has(value) ? value : "Bronze";
}

function normalizeAdminUserStatus(value) {
  return VALID_ADMIN_USER_STATUSES.has(value) ? value : "active";
}

const VALID_ADMIN_INSTANCE_STATUSES = new Set([
  "running",
  "stopped",
  "installing",
]);

const VALID_ADMIN_TRANSACTION_TYPES = new Set([
  "deposit",
  "payment",
  "refund",
  "bonus",
]);

const VALID_ADMIN_TRANSACTION_STATUSES = new Set([
  "completed",
  "pending",
  "failed",
]);

const VALID_ADMIN_PAYMENT_METHOD_TYPES = new Set([
  "card",
  "crypto",
  "bank",
]);

const VALID_ADMIN_TICKET_PRIORITIES = new Set([
  "low",
  "normal",
  "high",
  "urgent",
]);

const VALID_ADMIN_TICKET_STATUSES = new Set([
  "open",
  "answered",
  "closed",
]);

const VALID_ADMIN_GLOBAL_NODE_STATUSES = new Set([
  "online",
  "offline",
  "maintenance",
]);

function normalizeAdminInstanceStatus(value) {
  return VALID_ADMIN_INSTANCE_STATUSES.has(value) ? value : "stopped";
}

function normalizeAdminTransactionType(value) {
  return VALID_ADMIN_TRANSACTION_TYPES.has(value) ? value : "payment";
}

function normalizeAdminTransactionStatus(value) {
  return VALID_ADMIN_TRANSACTION_STATUSES.has(value) ? value : "completed";
}

function normalizeAdminPaymentMethodType(value) {
  return VALID_ADMIN_PAYMENT_METHOD_TYPES.has(value) ? value : "card";
}

function normalizeAdminTicketPriority(value) {
  return VALID_ADMIN_TICKET_PRIORITIES.has(value) ? value : "normal";
}

function normalizeAdminTicketStatus(value) {
  return VALID_ADMIN_TICKET_STATUSES.has(value) ? value : "open";
}

function normalizeAdminGlobalNodeStatus(value) {
  return VALID_ADMIN_GLOBAL_NODE_STATUSES.has(value) ? value : "offline";
}

function normalizeAdminSupportedGames(value) {
  if (!Array.isArray(value)) {
    if (typeof value !== "string") {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      return normalizeAdminSupportedGames(parsed);
    } catch {
      return [];
    }
  }

  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
}

function sanitizeDateOnly(value, fallback = null) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toISOString().slice(0, 10);
}

function buildDefaultReferralCode(user) {
  const base = String(user.username || user.uid || user.id)
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 12);

  return base || `USER${user.id}`;
}

function getLegacySeedReferralCode(user) {
  if (!user || !user.uid) {
    return null;
  }

  return LEGACY_ADMIN_USER_PROFILE_SEEDS.get(user.uid)?.referralCode?.trim() || null;
}

function normalizeStoredReferralCode(user, referralCode) {
  const trimmed = typeof referralCode === "string" ? referralCode.trim() : "";
  if (!trimmed) {
    return null;
  }

  const legacySeedReferralCode = getLegacySeedReferralCode(user);
  if (legacySeedReferralCode && trimmed === legacySeedReferralCode) {
    return trimmed;
  }

  if (trimmed === buildDefaultReferralCode(user)) {
    return null;
  }

  return trimmed;
}

function buildFallbackAdminDisplayId(userId) {
  return `USR-${String(userId).padStart(4, "0")}`;
}

function generateUniqueAdminDisplayId(preferredId, userId) {
  const preferred = String(preferredId || "").trim() || buildFallbackAdminDisplayId(userId);
  let candidate = preferred;
  let counter = 1;

  while (
    db.prepare(
      "SELECT user_id FROM user_admin_profiles WHERE admin_display_id = ? LIMIT 1",
    ).get(candidate)
  ) {
    candidate = `${buildFallbackAdminDisplayId(userId)}-${counter}`;
    counter += 1;
  }

  return candidate;
}

function buildAdminProfileSeed(user) {
  const legacySeed = LEGACY_ADMIN_USER_PROFILE_SEEDS.get(user.uid);
  const registeredAt =
    sanitizeDateOnly(legacySeed?.registeredAt) ||
    sanitizeDateOnly(user.created_at) ||
    new Date().toISOString().slice(0, 10);

  return {
    adminDisplayId: generateUniqueAdminDisplayId(legacySeed?.adminDisplayId, user.id),
    balance: Number.isFinite(legacySeed?.balance) ? legacySeed.balance : 0,
    bonusCredit: Number.isFinite(legacySeed?.bonusCredit) ? legacySeed.bonusCredit : 0,
    rank: normalizeAdminUserRank(legacySeed?.rank),
    status: normalizeAdminUserStatus(legacySeed?.status),
    registeredAt,
    phone: legacySeed?.phone?.trim() || null,
    discordId: legacySeed?.discordId?.trim() || null,
    kycVerified: legacySeed?.kycVerified ? 1 : 0,
    twoFactorEnabled: legacySeed?.twoFactorEnabled ? 1 : 0,
    referralCode: legacySeed?.referralCode?.trim() || null,
  };
}

function ensureLegacyDemoUsers() {
  const findUserByUid = db.prepare("SELECT id FROM users WHERE uid = ? LIMIT 1");
  const insertUser = db.prepare(`
    INSERT INTO users (
      username,
      email,
      display_name,
      password_salt,
      password_hash,
      uid,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const seed of LEGACY_DEMO_USER_SEEDS) {
    if (findUserByUid.get(seed.uid)) {
      continue;
    }

    const salt = randomBytes(16).toString("hex");
    const passwordHash = hashPassword(seed.password, salt);

    try {
      insertUser.run(
        seed.username,
        seed.email,
        seed.displayName,
        salt,
        passwordHash,
        seed.uid,
        seed.createdAt,
      );
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "SQLITE_CONSTRAINT_UNIQUE"
      ) {
        continue;
      }

      throw error;
    }
  }
}

function ensureUserAdminProfiles() {
  const usersMissingProfiles = db
    .prepare(
      `
        SELECT users.id, users.username, users.uid, users.created_at
        FROM users
        LEFT JOIN user_admin_profiles ON user_admin_profiles.user_id = users.id
        WHERE user_admin_profiles.user_id IS NULL
        ORDER BY users.id ASC
      `,
    )
    .all();

  const insertProfile = db.prepare(`
    INSERT INTO user_admin_profiles (
      user_id,
      admin_display_id,
      balance,
      bonus_credit,
      rank,
      status,
      registered_at,
      phone,
      discord_id,
      kyc_verified,
      two_factor_enabled,
      referral_code,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const user of usersMissingProfiles) {
    const profile = buildAdminProfileSeed(user);
    insertProfile.run(
      user.id,
      profile.adminDisplayId,
      profile.balance,
      profile.bonusCredit,
      profile.rank,
      profile.status,
      profile.registeredAt,
      profile.phone,
      profile.discordId,
      profile.kycVerified,
      profile.twoFactorEnabled,
      profile.referralCode,
      new Date().toISOString(),
    );
  }
}

function ensureUserReferralRecords() {
  const hasReferralId = db.prepare("SELECT 1 FROM user_referrals WHERE referral_id = ? LIMIT 1");
  const findOwnerByUid = db.prepare("SELECT id FROM users WHERE uid = ? LIMIT 1");
  const insertReferral = db.prepare(`
    INSERT INTO user_referrals (
      referral_id,
      code_owner_user_id,
      referred_user_display_id,
      referred_user_email,
      awarded_at,
      bonus_earned
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const seed of LEGACY_ADMIN_REFERRAL_SEEDS) {
    if (hasReferralId.get(seed.referralId)) {
      continue;
    }

    const owner = findOwnerByUid.get(seed.ownerUid);
    if (!owner) {
      continue;
    }

    insertReferral.run(
      seed.referralId,
      owner.id,
      seed.referredUserDisplayId,
      seed.referredUserEmail,
      sanitizeDateOnly(seed.awardedAt) || new Date().toISOString().slice(0, 10),
      Number(seed.bonusEarned || 0),
    );
  }
}

function ensureAdminDashboardInstances() {
  const hasInstanceId = db.prepare(
    "SELECT 1 FROM admin_user_instances WHERE instance_id = ? LIMIT 1",
  );
  const findOwnerByUid = db.prepare("SELECT id FROM users WHERE uid = ? LIMIT 1");
  const insertInstance = db.prepare(`
    INSERT INTO admin_user_instances (
      instance_id,
      user_id,
      game,
      node,
      status,
      cpu_usage,
      mem_usage,
      plan_name,
      price
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const seed of LEGACY_ADMIN_INSTANCE_SEEDS) {
    if (hasInstanceId.get(seed.instanceId)) {
      continue;
    }

    const owner = findOwnerByUid.get(seed.ownerUid);
    if (!owner) {
      continue;
    }

    insertInstance.run(
      seed.instanceId,
      owner.id,
      seed.game,
      seed.node,
      normalizeAdminInstanceStatus(seed.status),
      Number(seed.cpuUsage || 0),
      Number(seed.memUsage || 0),
      seed.planName || null,
      Number(seed.price || 0),
    );
  }
}

function ensureAdminDashboardTransactions() {
  const hasTransactionId = db.prepare(
    "SELECT 1 FROM admin_user_transactions WHERE transaction_id = ? LIMIT 1",
  );
  const findOwnerByUid = db.prepare("SELECT id FROM users WHERE uid = ? LIMIT 1");
  const insertTransaction = db.prepare(`
    INSERT INTO admin_user_transactions (
      transaction_id,
      user_id,
      transaction_date,
      amount,
      type,
      status,
      description,
      method
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const seed of LEGACY_ADMIN_TRANSACTION_SEEDS) {
    if (hasTransactionId.get(seed.transactionId)) {
      continue;
    }

    const owner = findOwnerByUid.get(seed.ownerUid);
    if (!owner) {
      continue;
    }

    insertTransaction.run(
      seed.transactionId,
      owner.id,
      String(seed.date || new Date().toISOString()),
      Number(seed.amount || 0),
      normalizeAdminTransactionType(seed.type),
      normalizeAdminTransactionStatus(seed.status),
      String(seed.description || ""),
      String(seed.method || ""),
    );
  }
}

function ensureAdminDashboardPaymentMethods() {
  const hasPaymentMethodId = db.prepare(
    "SELECT 1 FROM admin_user_payment_methods WHERE payment_method_id = ? LIMIT 1",
  );
  const findOwnerByUid = db.prepare("SELECT id FROM users WHERE uid = ? LIMIT 1");
  const insertPaymentMethod = db.prepare(`
    INSERT INTO admin_user_payment_methods (
      payment_method_id,
      user_id,
      payment_type,
      brand,
      label,
      last4,
      expiry,
      display_value,
      is_default
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const seed of LEGACY_ADMIN_PAYMENT_METHOD_SEEDS) {
    if (hasPaymentMethodId.get(seed.paymentMethodId)) {
      continue;
    }

    const owner = findOwnerByUid.get(seed.ownerUid);
    if (!owner) {
      continue;
    }

    insertPaymentMethod.run(
      seed.paymentMethodId,
      owner.id,
      normalizeAdminPaymentMethodType(seed.paymentType),
      String(seed.brand || ""),
      String(seed.label || ""),
      seed.last4 || null,
      seed.expiry || null,
      seed.displayValue || null,
      seed.isDefault ? 1 : 0,
    );
  }
}

function ensureAdminDashboardTickets() {
  const hasTicketId = db.prepare(
    "SELECT 1 FROM admin_user_tickets WHERE ticket_id = ? LIMIT 1",
  );
  const findOwnerByUid = db.prepare("SELECT id FROM users WHERE uid = ? LIMIT 1");
  const insertTicket = db.prepare(`
    INSERT INTO admin_user_tickets (
      ticket_id,
      user_id,
      subject,
      priority,
      status,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const seed of LEGACY_ADMIN_TICKET_SEEDS) {
    if (hasTicketId.get(seed.ticketId)) {
      continue;
    }

    const owner = findOwnerByUid.get(seed.ownerUid);
    if (!owner) {
      continue;
    }

    insertTicket.run(
      seed.ticketId,
      owner.id,
      String(seed.subject || ""),
      normalizeAdminTicketPriority(seed.priority),
      normalizeAdminTicketStatus(seed.status),
      String(seed.updatedAt || ""),
    );
  }
}

function ensureAdminDatacenterData() {
  const hasRegionId = db.prepare(
    "SELECT 1 FROM admin_datacenter_regions WHERE region_id = ? LIMIT 1",
  );
  const insertRegion = db.prepare(`
    INSERT INTO admin_datacenter_regions (
      region_id,
      label
    )
    VALUES (?, ?)
  `);

  for (const seed of LEGACY_ADMIN_REGION_SEEDS) {
    if (hasRegionId.get(seed.regionId)) {
      continue;
    }

    insertRegion.run(seed.regionId, seed.label);
  }

  const hasNodeId = db.prepare(
    "SELECT 1 FROM admin_datacenter_nodes WHERE node_id = ? LIMIT 1",
  );
  const insertNode = db.prepare(`
    INSERT INTO admin_datacenter_nodes (
      node_id,
      region_id,
      city,
      latency,
      public_ip,
      bandwidth,
      cpu_spec,
      ram_spec,
      status,
      supported_games
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const seed of LEGACY_ADMIN_NODE_SEEDS) {
    if (hasNodeId.get(seed.nodeId)) {
      continue;
    }

    insertNode.run(
      seed.nodeId,
      seed.regionId,
      seed.city,
      seed.latency,
      seed.publicIp,
      seed.bandwidth,
      seed.cpuSpec,
      seed.ramSpec,
      normalizeAdminGlobalNodeStatus(seed.status),
      JSON.stringify(normalizeAdminSupportedGames(seed.supportedGames)),
    );
  }
}

function ensureAdminDashboardData() {
  ensureAdminDatacenterData();
  ensureAdminDashboardInstances();
  ensureAdminDashboardTransactions();
  ensureAdminDashboardPaymentMethods();
  ensureAdminDashboardTickets();
}

function mapAdminUserRow(row) {
  const preferences = getUserPrefsObject(row.user_id);

  return {
    id: row.admin_display_id,
    uid: row.uid,
    email: row.email,
    balance: Number(row.balance || 0),
    bonusCredit: Number(row.bonus_credit || 0),
    rank: normalizeAdminUserRank(row.rank),
    status: normalizeAdminUserStatus(row.status),
    registeredAt:
      sanitizeDateOnly(row.registered_at) || new Date().toISOString().slice(0, 10),
    phone: row.phone || undefined,
    discordId: row.discord_id || undefined,
    kycVerified: Boolean(row.kyc_verified),
    twoFactorEnabled: Boolean(row.two_factor_enabled),
    referralCode: normalizeStoredReferralCode(row, row.referral_code),
    preferredCurrency:
      pickDashboardPrefs(preferences).preferredCurrency || DEFAULT_SUPPORTED_CURRENCY,
  };
}

function mapAdminInstanceRow(row) {
  return {
    id: row.instance_id,
    userId: row.admin_display_id,
    game: row.game,
    node: row.node,
    status: normalizeAdminInstanceStatus(row.status),
    cpuUsage: Number(row.cpu_usage || 0),
    memUsage: Number(row.mem_usage || 0),
    planName: row.plan_name || undefined,
    price: Number(row.price || 0),
  };
}

function mapAdminTransactionRow(row) {
  return {
    id: row.transaction_id,
    userId: row.admin_display_id,
    date: row.transaction_date,
    amount: Number(row.amount || 0),
    type: normalizeAdminTransactionType(row.type),
    status: normalizeAdminTransactionStatus(row.status),
    description: row.description,
    method: row.method,
  };
}

function mapAdminPaymentMethodRow(row) {
  return {
    id: row.payment_method_id,
    userId: row.admin_display_id,
    type: normalizeAdminPaymentMethodType(row.payment_type),
    brand: row.brand,
    label: row.label,
    last4: row.last4 || undefined,
    expiry: row.expiry || undefined,
    displayValue: row.display_value || undefined,
    isDefault: Boolean(row.is_default),
  };
}

function mapAdminTicketRow(row) {
  return {
    id: row.ticket_id,
    subject: row.subject,
    user: row.admin_display_id,
    priority: normalizeAdminTicketPriority(row.priority),
    status: normalizeAdminTicketStatus(row.status),
    updatedAt: row.updated_at,
  };
}

function listAdminDatacenterRegions() {
  ensureAdminDatacenterData();

  const regionRows = db
    .prepare(
      `
        SELECT
          admin_datacenter_regions.region_id AS region_id,
          admin_datacenter_regions.label AS label
        FROM admin_datacenter_regions
        ORDER BY admin_datacenter_regions.created_at ASC, admin_datacenter_regions.id ASC
      `,
    )
    .all();

  const nodeRows = db
    .prepare(
      `
        SELECT
          admin_datacenter_nodes.node_id AS node_id,
          admin_datacenter_nodes.region_id AS region_id,
          admin_datacenter_nodes.city AS city,
          admin_datacenter_nodes.latency AS latency,
          admin_datacenter_nodes.public_ip AS public_ip,
          admin_datacenter_nodes.bandwidth AS bandwidth,
          admin_datacenter_nodes.cpu_spec AS cpu_spec,
          admin_datacenter_nodes.ram_spec AS ram_spec,
          admin_datacenter_nodes.status AS status,
          admin_datacenter_nodes.supported_games AS supported_games
        FROM admin_datacenter_nodes
        ORDER BY admin_datacenter_nodes.created_at ASC, admin_datacenter_nodes.id ASC
      `,
    )
    .all();

  const nodesByRegionId = new Map();

  for (const row of nodeRows) {
    const regionNodes = nodesByRegionId.get(row.region_id) ?? [];
    regionNodes.push({
      id: row.node_id,
      city: row.city,
      latency: row.latency,
      publicIp: row.public_ip,
      bandwidth: row.bandwidth,
      cpuSpec: row.cpu_spec,
      ramSpec: row.ram_spec,
      status: normalizeAdminGlobalNodeStatus(row.status),
      supportedGames: normalizeAdminSupportedGames(row.supported_games),
    });
    nodesByRegionId.set(row.region_id, regionNodes);
  }

  return regionRows.map((row) => ({
    id: row.region_id,
    label: row.label,
    nodes: nodesByRegionId.get(row.region_id) ?? [],
  }));
}

function createAdminRegionId() {
  let regionId = `region-${Date.now()}-${randomInt(100, 1000)}`;

  while (
    db.prepare(
      "SELECT 1 FROM admin_datacenter_regions WHERE region_id = ? LIMIT 1",
    ).get(regionId)
  ) {
    regionId = `region-${Date.now()}-${randomInt(100, 1000)}`;
  }

  return regionId;
}

function createAdminNodeId() {
  let nodeId = `node-${Date.now()}-${randomInt(100, 1000)}`;

  while (
    db.prepare(
      "SELECT 1 FROM admin_datacenter_nodes WHERE node_id = ? LIMIT 1",
    ).get(nodeId)
  ) {
    nodeId = `node-${Date.now()}-${randomInt(100, 1000)}`;
  }

  return nodeId;
}

function createAdminDatacenterRegion(body) {
  ensureAdminDatacenterData();

  const rawLabel = typeof body?.label === "string" ? body.label.trim() : "";
  const rawCity = typeof body?.city === "string" ? body.city.trim() : "";
  const label = rawLabel || "New Region";
  const regionId = createAdminRegionId();

  db.prepare(
    `
      INSERT INTO admin_datacenter_regions (
        region_id,
        label
      )
      VALUES (?, ?)
    `,
  ).run(regionId, label);

  if (rawCity) {
    db.prepare(
      `
        INSERT INTO admin_datacenter_nodes (
          node_id,
          region_id,
          city,
          latency,
          public_ip,
          bandwidth,
          cpu_spec,
          ram_spec,
          status,
          supported_games
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(
      createAdminNodeId(),
      regionId,
      rawCity,
      "Auto-detecting",
      "Pending...",
      "1 Gbps",
      "Standard 16C",
      "64GB DDR4",
      "offline",
      JSON.stringify([]),
    );
  }

  return listAdminDatacenterRegions();
}

function createAdminDatacenterNode(regionId, body) {
  ensureAdminDatacenterData();

  const normalizedRegionId = String(regionId || "").trim();
  const region = db.prepare(
    "SELECT region_id FROM admin_datacenter_regions WHERE region_id = ? LIMIT 1",
  ).get(normalizedRegionId);

  if (!region) {
    throw createHttpError(404, `Unknown datacenter region: ${normalizedRegionId}`);
  }

  const city = typeof body?.city === "string" ? body.city.trim() : "";
  if (!city) {
    throw createHttpError(400, "City is required.");
  }

  db.prepare(
    `
      INSERT INTO admin_datacenter_nodes (
        node_id,
        region_id,
        city,
        latency,
        public_ip,
        bandwidth,
        cpu_spec,
        ram_spec,
        status,
        supported_games
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    createAdminNodeId(),
    normalizedRegionId,
    city,
    "Auto-detecting",
    "Pending...",
    "1 Gbps",
    "Standard 16C",
    "64GB DDR4",
    "offline",
    JSON.stringify([]),
  );

  return listAdminDatacenterRegions();
}

function updateAdminDatacenterRegion(regionId, body) {
  ensureAdminDatacenterData();

  const normalizedRegionId = String(regionId || "").trim();
  const region = db.prepare(
    `
      SELECT region_id, label
      FROM admin_datacenter_regions
      WHERE region_id = ?
      LIMIT 1
    `,
  ).get(normalizedRegionId);

  if (!region) {
    throw createHttpError(404, `Unknown datacenter region: ${normalizedRegionId}`);
  }

  const rawLabel = typeof body?.label === "string" ? body.label.trim() : "";
  const rawCity = typeof body?.city === "string" ? body.city.trim() : "";
  const nextLabel = rawLabel || region.label;

  db.prepare(
    `
      UPDATE admin_datacenter_regions
      SET label = ?
      WHERE region_id = ?
    `,
  ).run(nextLabel, normalizedRegionId);

  const firstNode = db.prepare(
    `
      SELECT node_id, city, latency
      FROM admin_datacenter_nodes
      WHERE region_id = ?
      ORDER BY created_at ASC, id ASC
      LIMIT 1
    `,
  ).get(normalizedRegionId);

  if (firstNode) {
    db.prepare(
      `
        UPDATE admin_datacenter_nodes
        SET city = ?, latency = ?
        WHERE node_id = ?
      `,
    ).run(rawCity || firstNode.city, firstNode.latency, firstNode.node_id);
  } else if (rawCity) {
    db.prepare(
      `
        INSERT INTO admin_datacenter_nodes (
          node_id,
          region_id,
          city,
          latency,
          public_ip,
          bandwidth,
          cpu_spec,
          ram_spec,
          status,
          supported_games
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(
      createAdminNodeId(),
      normalizedRegionId,
      rawCity,
      "Auto-detecting",
      "Pending...",
      "1 Gbps",
      "Standard 16C",
      "64GB DDR4",
      "offline",
      JSON.stringify([]),
    );
  }

  return listAdminDatacenterRegions();
}

function deleteAdminDatacenterNode(regionId, nodeId) {
  ensureAdminDatacenterData();

  const normalizedRegionId = String(regionId || "").trim();
  const normalizedNodeId = String(nodeId || "").trim();

  const result = db.prepare(
    `
      DELETE FROM admin_datacenter_nodes
      WHERE region_id = ? AND node_id = ?
    `,
  ).run(normalizedRegionId, normalizedNodeId);

  if (!result.changes) {
    throw createHttpError(404, `Unknown node: ${normalizedNodeId}`);
  }

  return listAdminDatacenterRegions();
}

function toggleAdminDatacenterNodeGame(nodeId, body) {
  ensureAdminDatacenterData();

  const normalizedNodeId = String(nodeId || "").trim();
  const gameId = typeof body?.gameId === "string" ? body.gameId.trim() : "";

  if (!gameId) {
    throw createHttpError(400, "Game ID is required.");
  }

  const row = db.prepare(
    `
      SELECT supported_games
      FROM admin_datacenter_nodes
      WHERE node_id = ?
      LIMIT 1
    `,
  ).get(normalizedNodeId);

  if (!row) {
    throw createHttpError(404, `Unknown node: ${normalizedNodeId}`);
  }

  const currentGames = normalizeAdminSupportedGames(row.supported_games);
  const nextGames = currentGames.includes(gameId)
    ? currentGames.filter((entry) => entry !== gameId)
    : [...currentGames, gameId];

  db.prepare(
    `
      UPDATE admin_datacenter_nodes
      SET supported_games = ?
      WHERE node_id = ?
    `,
  ).run(JSON.stringify(nextGames), normalizedNodeId);

  return listAdminDatacenterRegions();
}

function listAdminInstances() {
  ensureUserAdminProfiles();
  ensureAdminDashboardData();

  const rows = db.prepare(
    `
      SELECT
        admin_user_instances.instance_id AS instance_id,
        admin_user_instances.game AS game,
        admin_user_instances.node AS node,
        admin_user_instances.status AS status,
        admin_user_instances.cpu_usage AS cpu_usage,
        admin_user_instances.mem_usage AS mem_usage,
        admin_user_instances.plan_name AS plan_name,
        admin_user_instances.price AS price,
        user_admin_profiles.admin_display_id AS admin_display_id
      FROM admin_user_instances
      INNER JOIN user_admin_profiles ON user_admin_profiles.user_id = admin_user_instances.user_id
      ORDER BY admin_user_instances.created_at DESC, admin_user_instances.id DESC
    `,
  ).all();

  return rows.map(mapAdminInstanceRow);
}

function listAdminTickets() {
  ensureUserAdminProfiles();
  ensureAdminDashboardData();

  const rows = db.prepare(
    `
      SELECT
        admin_user_tickets.ticket_id AS ticket_id,
        admin_user_tickets.subject AS subject,
        admin_user_tickets.priority AS priority,
        admin_user_tickets.status AS status,
        admin_user_tickets.updated_at AS updated_at,
        user_admin_profiles.admin_display_id AS admin_display_id
      FROM admin_user_tickets
      INNER JOIN user_admin_profiles ON user_admin_profiles.user_id = admin_user_tickets.user_id
      ORDER BY admin_user_tickets.id DESC
    `,
  ).all();

  return rows.map(mapAdminTicketRow);
}

function getAdminUserDetail(adminDisplayId) {
  ensureUserAdminProfiles();
  ensureAdminDashboardData();

  const userRow = db.prepare(
    `
      SELECT
        users.id AS user_id,
        user_admin_profiles.admin_display_id AS admin_display_id,
        users.uid AS uid,
        users.email AS email,
        user_admin_profiles.balance AS balance,
        user_admin_profiles.bonus_credit AS bonus_credit,
        user_admin_profiles.rank AS rank,
        user_admin_profiles.status AS status,
        user_admin_profiles.registered_at AS registered_at,
        user_admin_profiles.phone AS phone,
        user_admin_profiles.discord_id AS discord_id,
        user_admin_profiles.kyc_verified AS kyc_verified,
        user_admin_profiles.two_factor_enabled AS two_factor_enabled,
        user_admin_profiles.referral_code AS referral_code
      FROM users
      INNER JOIN user_admin_profiles ON user_admin_profiles.user_id = users.id
      WHERE user_admin_profiles.admin_display_id = ?
      LIMIT 1
    `,
  ).get(adminDisplayId);

  if (!userRow) {
    return null;
  }

  const instances = db.prepare(
    `
      SELECT
        admin_user_instances.instance_id AS instance_id,
        admin_user_instances.game AS game,
        admin_user_instances.node AS node,
        admin_user_instances.status AS status,
        admin_user_instances.cpu_usage AS cpu_usage,
        admin_user_instances.mem_usage AS mem_usage,
        admin_user_instances.plan_name AS plan_name,
        admin_user_instances.price AS price,
        user_admin_profiles.admin_display_id AS admin_display_id
      FROM admin_user_instances
      INNER JOIN user_admin_profiles ON user_admin_profiles.user_id = admin_user_instances.user_id
      WHERE admin_user_instances.user_id = ?
      ORDER BY admin_user_instances.created_at DESC, admin_user_instances.id DESC
    `,
  ).all(userRow.user_id);

  const transactions = db.prepare(
    `
      SELECT
        admin_user_transactions.transaction_id AS transaction_id,
        admin_user_transactions.transaction_date AS transaction_date,
        admin_user_transactions.amount AS amount,
        admin_user_transactions.type AS type,
        admin_user_transactions.status AS status,
        admin_user_transactions.description AS description,
        admin_user_transactions.method AS method,
        user_admin_profiles.admin_display_id AS admin_display_id
      FROM admin_user_transactions
      INNER JOIN user_admin_profiles ON user_admin_profiles.user_id = admin_user_transactions.user_id
      WHERE admin_user_transactions.user_id = ?
      ORDER BY admin_user_transactions.id DESC
    `,
  ).all(userRow.user_id);

  const paymentMethods = db.prepare(
    `
      SELECT
        admin_user_payment_methods.payment_method_id AS payment_method_id,
        admin_user_payment_methods.payment_type AS payment_type,
        admin_user_payment_methods.brand AS brand,
        admin_user_payment_methods.label AS label,
        admin_user_payment_methods.last4 AS last4,
        admin_user_payment_methods.expiry AS expiry,
        admin_user_payment_methods.display_value AS display_value,
        admin_user_payment_methods.is_default AS is_default,
        user_admin_profiles.admin_display_id AS admin_display_id
      FROM admin_user_payment_methods
      INNER JOIN user_admin_profiles ON user_admin_profiles.user_id = admin_user_payment_methods.user_id
      WHERE admin_user_payment_methods.user_id = ?
      ORDER BY admin_user_payment_methods.is_default DESC, admin_user_payment_methods.id ASC
    `,
  ).all(userRow.user_id);

  const tickets = db.prepare(
    `
      SELECT
        admin_user_tickets.ticket_id AS ticket_id,
        admin_user_tickets.subject AS subject,
        admin_user_tickets.priority AS priority,
        admin_user_tickets.status AS status,
        admin_user_tickets.updated_at AS updated_at,
        user_admin_profiles.admin_display_id AS admin_display_id
      FROM admin_user_tickets
      INNER JOIN user_admin_profiles ON user_admin_profiles.user_id = admin_user_tickets.user_id
      WHERE admin_user_tickets.user_id = ?
      ORDER BY admin_user_tickets.id DESC
    `,
  ).all(userRow.user_id);

  return {
    user: mapAdminUserRow(userRow),
    instances: instances.map(mapAdminInstanceRow),
    transactions: transactions.map(mapAdminTransactionRow),
    paymentMethods: paymentMethods.map(mapAdminPaymentMethodRow),
    tickets: tickets.map(mapAdminTicketRow),
  };
}

function listAdminUsers() {
  ensureUserAdminProfiles();

  const rows = db
    .prepare(
      `
        SELECT
          user_admin_profiles.admin_display_id AS admin_display_id,
          users.id AS user_id,
          users.uid AS uid,
          users.email AS email,
          user_admin_profiles.balance AS balance,
          user_admin_profiles.bonus_credit AS bonus_credit,
          user_admin_profiles.rank AS rank,
          user_admin_profiles.status AS status,
          user_admin_profiles.registered_at AS registered_at,
          user_admin_profiles.phone AS phone,
          user_admin_profiles.discord_id AS discord_id,
          user_admin_profiles.kyc_verified AS kyc_verified,
          user_admin_profiles.two_factor_enabled AS two_factor_enabled,
          user_admin_profiles.referral_code AS referral_code
        FROM users
        INNER JOIN user_admin_profiles ON user_admin_profiles.user_id = users.id
        ORDER BY users.created_at DESC, users.id DESC
      `,
    )
    .all();

  return rows.map(mapAdminUserRow);
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function createAdminTransactionId() {
  let transactionId = `TXN-${randomInt(1000, 10000)}${randomInt(1000, 10000)}`;

  while (
    db.prepare(
      "SELECT 1 FROM admin_user_transactions WHERE transaction_id = ? LIMIT 1",
    ).get(transactionId)
  ) {
    transactionId = `TXN-${randomInt(1000, 10000)}${randomInt(1000, 10000)}`;
  }

  return transactionId;
}

function getSupportedCurrencySymbol(currency) {
  if (currency === "USD") {
    return "$";
  }
  if (currency === "HKD") {
    return "HK$";
  }
  if (currency === "NTD") {
    return "NT$";
  }
  return "¥";
}

function formatAdminCurrency(value, currency = DEFAULT_SUPPORTED_CURRENCY) {
  const numeric = Number(value || 0);
  const absolute = Math.abs(numeric);
  const symbol = getSupportedCurrencySymbol(currency);

  if (absolute > 0 && absolute < 0.01) {
    return `${currency} ${symbol}${numeric.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}`;
  }

  return `${currency} ${symbol}${numeric.toFixed(2)}`;
}

function roundAdminWalletAmount(value) {
  return Number(Number(value || 0).toFixed(6));
}

function buildAdminWalletTransactionDescription(wallet, operation, delta, nextValue, currency) {
  const walletLabel = wallet === "balance" ? "balance" : "bonus credit";
  const sign = delta >= 0 ? "+" : "-";
  const changeText = `${sign}${formatAdminCurrency(Math.abs(delta), currency)}`;

  if (operation === "set") {
    return `Admin set ${walletLabel} to ${formatAdminCurrency(nextValue, currency)}`;
  }

  if (operation === "zero") {
    return `Admin cleared ${walletLabel}`;
  }

  return `Admin ${operation === "add" ? "added" : "deducted"} ${changeText} ${walletLabel}`;
}

function getAdminUserRowsByDisplayIds(adminDisplayIds) {
  if (adminDisplayIds.length === 0) {
    return [];
  }

  const placeholders = adminDisplayIds.map(() => "?").join(", ");

  return db.prepare(
    `
      SELECT
        users.id AS user_id,
        user_admin_profiles.admin_display_id AS admin_display_id,
        users.uid AS uid,
        users.email AS email,
        user_admin_profiles.balance AS balance,
        user_admin_profiles.bonus_credit AS bonus_credit,
        user_admin_profiles.rank AS rank,
        user_admin_profiles.status AS status,
        user_admin_profiles.registered_at AS registered_at,
        user_admin_profiles.phone AS phone,
        user_admin_profiles.discord_id AS discord_id,
        user_admin_profiles.kyc_verified AS kyc_verified,
        user_admin_profiles.two_factor_enabled AS two_factor_enabled,
        user_admin_profiles.referral_code AS referral_code
      FROM users
      INNER JOIN user_admin_profiles ON user_admin_profiles.user_id = users.id
      WHERE user_admin_profiles.admin_display_id IN (${placeholders})
    `,
  ).all(...adminDisplayIds);
}

function adjustAdminUsersWallet(body) {
  ensureUserAdminProfiles();
  ensureAdminDashboardData();

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createHttpError(400, "Invalid wallet adjustment payload.");
  }

  const rawUserIds = Array.isArray(body.userIds) ? body.userIds : [];
  const userIds = [...new Set(rawUserIds.map((value) => String(value || "").trim()).filter(Boolean))];
  const wallet = String(body.wallet || "").trim();
  const operation = String(body.operation || "").trim();

  if (userIds.length === 0) {
    throw createHttpError(400, "At least one user is required.");
  }

  if (!VALID_ADMIN_WALLET_KINDS.has(wallet)) {
    throw createHttpError(400, "Unknown wallet type.");
  }

  if (!VALID_ADMIN_WALLET_OPERATIONS.has(operation)) {
    throw createHttpError(400, "Unknown wallet operation.");
  }

  if (wallet === "balance" && operation === "zero") {
    throw createHttpError(400, "Balance zeroing is not supported by this action.");
  }

  const amountRequired = operation !== "zero";
  const amount = amountRequired ? roundAdminWalletAmount(body.amount) : 0;

  if (amountRequired && (!Number.isFinite(amount) || amount < 0)) {
    throw createHttpError(400, "Amount must be a non-negative number.");
  }

  const currentRows = getAdminUserRowsByDisplayIds(userIds);

  if (currentRows.length === 0) {
    throw createHttpError(404, "No matching users were found.");
  }

  const matchedIds = new Set(currentRows.map((row) => row.admin_display_id));
  const missingIds = userIds.filter((userId) => !matchedIds.has(userId));

  if (missingIds.length > 0) {
    throw createHttpError(404, `Unknown admin users: ${missingIds.join(", ")}`);
  }

  const updateProfile = db.prepare(
    wallet === "balance"
      ? `
          UPDATE user_admin_profiles
          SET balance = ?, updated_at = ?
          WHERE user_id = ?
        `
      : `
          UPDATE user_admin_profiles
          SET bonus_credit = ?, updated_at = ?
          WHERE user_id = ?
        `,
  );

  const insertTransaction = db.prepare(`
    INSERT INTO admin_user_transactions (
      transaction_id,
      user_id,
      transaction_date,
      amount,
      type,
      status,
      description,
      method
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const runAdjustment = db.transaction((rows) => {
    const now = new Date().toISOString();

    for (const row of rows) {
      const currentValue =
        wallet === "balance" ? Number(row.balance || 0) : Number(row.bonus_credit || 0);
      const preferredCurrency =
        pickDashboardPrefs(getUserPrefsObject(row.user_id)).preferredCurrency || DEFAULT_SUPPORTED_CURRENCY;

      let nextValue = currentValue;
      if (operation === "add") {
        nextValue = Math.max(0, roundAdminWalletAmount(currentValue + amount));
      } else if (operation === "deduct") {
        nextValue = Math.max(0, roundAdminWalletAmount(currentValue - amount));
      } else if (operation === "set") {
        nextValue = Math.max(0, roundAdminWalletAmount(amount));
      } else if (operation === "zero") {
        nextValue = 0;
      }

      const delta = roundAdminWalletAmount(nextValue - currentValue);

      updateProfile.run(nextValue, now, row.user_id);

      if (delta === 0) {
        continue;
      }

      insertTransaction.run(
        createAdminTransactionId(),
        row.user_id,
        now,
        delta,
        wallet === "bonus" ? "bonus" : delta >= 0 ? "deposit" : "payment",
        "completed",
        buildAdminWalletTransactionDescription(wallet, operation, delta, nextValue, preferredCurrency),
        "Admin Console",
      );
    }
  });

  runAdjustment(currentRows);

  return getAdminUserRowsByDisplayIds(userIds).map(mapAdminUserRow);
}

function mapUserRowToPublicUser(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    email: row.email,
    uid: row.uid,
    balance: Number(row.balance || 0),
    bonusCredit: Number(row.bonus_credit || 0),
    rank: normalizeAdminUserRank(row.rank),
    status: normalizeAdminUserStatus(row.status),
    registeredAt:
      sanitizeDateOnly(row.registered_at) || new Date().toISOString().slice(0, 10),
  };
}

function getUserPublicProfileById(userId) {
  ensureUserAdminProfiles();

  const row = db
    .prepare(
      `
        SELECT
          users.id AS id,
          users.username AS username,
          users.email AS email,
          users.display_name AS display_name,
          users.uid AS uid,
          user_admin_profiles.balance AS balance,
          user_admin_profiles.bonus_credit AS bonus_credit,
          user_admin_profiles.rank AS rank,
          user_admin_profiles.status AS status,
          user_admin_profiles.registered_at AS registered_at
        FROM users
        INNER JOIN user_admin_profiles ON user_admin_profiles.user_id = users.id
        WHERE users.id = ?
        LIMIT 1
      `,
    )
    .get(userId);

  return row ? mapUserRowToPublicUser(row) : null;
}

function listAdminReferrals() {
  ensureUserAdminProfiles();
  ensureUserReferralRecords();

  const rows = db
    .prepare(
      `
        SELECT
          user_referrals.referral_id AS referral_id,
          owner_profiles.admin_display_id AS code_owner_id,
          user_referrals.referred_user_display_id AS referred_user_id,
          user_referrals.referred_user_email AS referred_user_email,
          user_referrals.awarded_at AS awarded_at,
          user_referrals.bonus_earned AS bonus_earned
        FROM user_referrals
        INNER JOIN user_admin_profiles AS owner_profiles
          ON owner_profiles.user_id = user_referrals.code_owner_user_id
        ORDER BY user_referrals.awarded_at DESC, user_referrals.id DESC
      `,
    )
    .all();

  return rows.map((row) => ({
    id: row.referral_id,
    codeOwnerId: row.code_owner_id,
    referredUserId: row.referred_user_id,
    referredUserEmail: row.referred_user_email,
    date: sanitizeDateOnly(row.awarded_at) || new Date().toISOString().slice(0, 10),
    bonusEarned: Number(row.bonus_earned || 0),
  }));
}

function hashPassword(password, salt) {
  return pbkdf2Sync(password, salt, 310000, 32, "sha256").toString("hex");
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function verifyPassword(password, salt, expectedHash) {
  const actualHash = hashPassword(password, salt);
  return timingSafeEqual(
    Buffer.from(actualHash, "hex"),
    Buffer.from(expectedHash, "hex"),
  );
}

function bootstrapAdmin() {
  const existing = db.prepare("SELECT id FROM admins LIMIT 1").get();
  if (existing) {
    return;
  }

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL || "admin@system.local";
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || "ChangeMe123!";
  const displayName = process.env.ADMIN_BOOTSTRAP_NAME || "Primary Admin";
  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  db.prepare(
    `
      INSERT INTO admins (email, display_name, password_salt, password_hash)
      VALUES (?, ?, ?, ?)
    `,
  ).run(email, displayName, salt, passwordHash);

  console.log("");
  console.log("[admin-auth] Bootstrapped default admin account");
  console.log(`[admin-auth] Email: ${email}`);
  console.log(`[admin-auth] Password: ${password}`);
  console.log("[admin-auth] Change these defaults with ADMIN_BOOTSTRAP_* env vars.");
  console.log("");
}

function cleanupExpiredSessions() {
  db.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").run(
    new Date().toISOString(),
  );
}

function issueSession(adminId) {
  cleanupExpiredSessions();

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(
    `
      INSERT INTO admin_sessions (admin_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `,
  ).run(adminId, tokenHash, expiresAt);

  return {
    token: rawToken,
    expiresAt,
  };
}

function cleanupExpiredUserSessions() {
  db.prepare("DELETE FROM user_sessions WHERE expires_at <= ?").run(
    new Date().toISOString(),
  );
}

function issueUserSession(userId) {
  cleanupExpiredUserSessions();

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(
    `
      INSERT INTO user_sessions (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `,
  ).run(userId, tokenHash, expiresAt);

  return {
    token: rawToken,
    expiresAt,
  };
}

function getSessionFromRequest(req) {
  cleanupExpiredSessions();

  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const rawToken = authHeader.slice("Bearer ".length).trim();
  if (!rawToken) {
    return null;
  }

  return db.prepare(
    `
      SELECT
        admin_sessions.id AS session_id,
        admin_sessions.expires_at AS expires_at,
        admins.id AS admin_id,
        admins.email AS email,
        admins.display_name AS display_name
      FROM admin_sessions
      INNER JOIN admins ON admins.id = admin_sessions.admin_id
      WHERE admin_sessions.token_hash = ?
        AND admin_sessions.expires_at > ?
    `,
  ).get(hashToken(rawToken), new Date().toISOString());
}

function getUserSessionFromRequest(req) {
  cleanupExpiredUserSessions();

  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const rawToken = authHeader.slice("Bearer ".length).trim();
  if (!rawToken) {
    return null;
  }

  return db.prepare(
    `
      SELECT
        user_sessions.id AS session_id,
        user_sessions.expires_at AS expires_at,
        users.id AS user_id,
        users.username AS username,
        users.email AS email,
        users.display_name AS display_name,
        users.uid AS uid,
        user_admin_profiles.balance AS balance,
        user_admin_profiles.bonus_credit AS bonus_credit,
        user_admin_profiles.rank AS rank,
        user_admin_profiles.status AS status,
        user_admin_profiles.registered_at AS registered_at
      FROM user_sessions
      INNER JOIN users ON users.id = user_sessions.user_id
      LEFT JOIN user_admin_profiles ON user_admin_profiles.user_id = users.id
      WHERE user_sessions.token_hash = ?
        AND user_sessions.expires_at > ?
    `,
  ).get(hashToken(rawToken), new Date().toISOString());
}

function requireDashboardAdminUserSession(req, res) {
  const session = getUserSessionFromRequest(req);

  if (!session) {
    sendJson(res, 401, { error: "Session expired or missing." });
    return null;
  }

  if (String(session.uid || "").trim() !== DASHBOARD_ADMIN_UID) {
    sendJson(res, 403, { error: "Admin access required." });
    return null;
  }

  return session;
}

const VALID_DASHBOARD_MODES = new Set(["site", "console"]);
const VALID_DASHBOARD_PLACEMENTS = new Set([
  "navbar_embed",
  "below_navbar",
  "bottom_float",
]);
const VALID_SUPPORTED_CURRENCIES = new Set(["USD", "CNY", "HKD", "NTD"]);
const DEFAULT_SUPPORTED_CURRENCY = "CNY";
const VALID_DASHBOARD_TABS = new Set([
  "overview",
  "instances",
  "billing",
  "team",
  "tickets",
  "referral",
  "settings",
]);

function getUserPrefsObject(userId) {
  const row = db
    .prepare("SELECT prefs_json FROM user_preferences WHERE user_id = ?")
    .get(userId);
  if (!row) {
    return {};
  }
  try {
    const parsed = JSON.parse(row.prefs_json || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveUserPrefsObject(userId, obj) {
  const json = JSON.stringify(obj);
  const updatedAt = new Date().toISOString();
  db.prepare(
    `
      INSERT INTO user_preferences (user_id, prefs_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        prefs_json = excluded.prefs_json,
        updated_at = excluded.updated_at
    `,
  ).run(userId, json, updatedAt);
}

function sanitizeDashboardPrefsPatch(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }
  const out = {};
  if ("dashboardNavbarMode" in body) {
    const v = String(body.dashboardNavbarMode);
    if (VALID_DASHBOARD_MODES.has(v)) {
      out.dashboardNavbarMode = v;
    }
  }
  if ("dashboardNavPlacement" in body) {
    const v = String(body.dashboardNavPlacement);
    if (VALID_DASHBOARD_PLACEMENTS.has(v)) {
      out.dashboardNavPlacement = v;
    }
  }
  if ("dashboardActiveTab" in body) {
    const v = String(body.dashboardActiveTab);
    if (VALID_DASHBOARD_TABS.has(v)) {
      out.dashboardActiveTab = v;
    }
  }
  if ("mainNavbarHidden" in body) {
    out.mainNavbarHidden = Boolean(body.mainNavbarHidden);
  }
  if ("preferredCurrency" in body) {
    const v = String(body.preferredCurrency || "").trim().toUpperCase();
    if (VALID_SUPPORTED_CURRENCIES.has(v)) {
      out.preferredCurrency = v;
    }
  }
  if ("previewBaseCurrency" in body) {
    const v = String(body.previewBaseCurrency || "").trim().toUpperCase();
    if (VALID_SUPPORTED_CURRENCIES.has(v)) {
      out.previewBaseCurrency = v;
    }
  }
  return out;
}

function pickDashboardPrefs(obj) {
  const out = {};
  if (obj.dashboardNavbarMode && VALID_DASHBOARD_MODES.has(String(obj.dashboardNavbarMode))) {
    out.dashboardNavbarMode = String(obj.dashboardNavbarMode);
  }
  if (
    obj.dashboardNavPlacement &&
    VALID_DASHBOARD_PLACEMENTS.has(String(obj.dashboardNavPlacement))
  ) {
    out.dashboardNavPlacement = String(obj.dashboardNavPlacement);
  }
  if (obj.dashboardActiveTab && VALID_DASHBOARD_TABS.has(String(obj.dashboardActiveTab))) {
    out.dashboardActiveTab = String(obj.dashboardActiveTab);
  }
  if (typeof obj.mainNavbarHidden === "boolean") {
    out.mainNavbarHidden = obj.mainNavbarHidden;
  }
  if (
    obj.preferredCurrency &&
    VALID_SUPPORTED_CURRENCIES.has(String(obj.preferredCurrency).toUpperCase())
  ) {
    out.preferredCurrency = String(obj.preferredCurrency).toUpperCase();
  } else {
    out.preferredCurrency = DEFAULT_SUPPORTED_CURRENCY;
  }
  if (
    obj.previewBaseCurrency &&
    VALID_SUPPORTED_CURRENCIES.has(String(obj.previewBaseCurrency).toUpperCase())
  ) {
    out.previewBaseCurrency = String(obj.previewBaseCurrency).toUpperCase();
  } else {
    out.previewBaseCurrency = DEFAULT_SUPPORTED_CURRENCY;
  }
  return out;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function pathnameOnly(url) {
  if (!url) return "";
  return url.split("?")[0] || "";
}

function getAdminUserDetailPathId(pathname) {
  const match = /^\/api\/admin\/users\/([^/]+)\/detail$/.exec(pathname);
  if (!match) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function isAdminUserWalletPath(pathname) {
  return pathname === "/api/admin/users/wallet";
}

function getAdminNodeRegionPathId(pathname) {
  const match = /^\/api\/admin\/nodes\/regions\/([^/]+)$/.exec(pathname);
  if (!match) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function getAdminRegionNodePathParams(pathname) {
  const match = /^\/api\/admin\/nodes\/regions\/([^/]+)\/nodes\/([^/]+)$/.exec(pathname);
  if (!match) {
    return null;
  }

  try {
    return {
      regionId: decodeURIComponent(match[1]),
      nodeId: decodeURIComponent(match[2]),
    };
  } catch {
    return {
      regionId: match[1],
      nodeId: match[2],
    };
  }
}

function getAdminNodeGamePathId(pathname) {
  const match = /^\/api\/admin\/nodes\/([^/]+)\/games$/.exec(pathname);
  if (!match) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...CORS_HEADERS,
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.end(message);
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function contentTypeFor(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".webp")) return "image/webp";
  if (filePath.endsWith(".ico")) return "image/x-icon";
  if (filePath.endsWith(".woff2")) return "font/woff2";
  if (filePath.endsWith(".mp4")) return "video/mp4";
  return "application/octet-stream";
}

function serveStaticFile(req, res) {
  if (!existsSync(distDir)) {
    sendText(
      res,
      404,
      "Build output not found. Run `npm run build` to serve the frontend from this server.",
    );
    return;
  }

  const rawPath = (req.url || "/").split("?")[0] || "/";
  const requestPath = rawPath === "/" ? "/index.html" : rawPath;
  const cleanedPath = requestPath;
  const resolved = path.join(distDir, cleanedPath);
  const canServeDirectly =
    existsSync(resolved) && statSync(resolved).isFile() && resolved.startsWith(distDir);
  const filePath = canServeDirectly ? resolved : path.join(distDir, "index.html");

  res.writeHead(200, { "Content-Type": contentTypeFor(filePath) });
  createReadStream(filePath).pipe(res);
}

ensureUserEmailColumn();
ensureUserUidColumn();
ensureLegacyDemoUsers();
ensureUserAdminProfiles();
ensureUserReferralRecords();
ensureAdminDashboardData();
bootstrapAdmin();

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url || !req.method) {
      sendJson(res, 400, { error: "Malformed request." });
      return;
    }

    const pathname = pathnameOnly(req.url);

    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    const allowUserRegister = process.env.AUTH_USER_REGISTER !== "0";

    if (pathname === "/api/auth/register" && req.method === "POST") {
      if (!allowUserRegister) {
        sendJson(res, 403, { error: "User registration is disabled." });
        return;
      }

      const body = await readJsonBody(req);
      const username = String(body.username || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const displayName = username;

      if (username.length < 2 || username.length > 64) {
        sendJson(res, 400, { error: "用户名长度必须在 2 到 64 个字符之间。" });
        return;
      }

      if (!/^[a-zA-Z0-9_\-.]+$/.test(username)) {
        sendJson(res, 400, {
          error: "用户名只能包含字母、数字、下划线、连字符和英文句点。",
        });
        return;
      }

      if (!isValidEmail(email)) {
        sendJson(res, 400, { error: "请输入有效的邮箱地址。" });
        return;
      }

      if (password.length < 6) {
        sendJson(res, 400, { error: "密码长度至少需要 6 个字符。" });
        return;
      }

      const salt = randomBytes(16).toString("hex");
      const passwordHash = hashPassword(password, salt);
      const uid = generateUniqueUserUid();

      try {
        const result = db
          .prepare(
            `
              INSERT INTO users (username, email, display_name, password_salt, password_hash, uid)
              VALUES (?, ?, ?, ?, ?, ?)
            `,
          )
          .run(username, email, displayName, salt, passwordHash, uid);

        ensureUserAdminProfiles();
        const publicUser = getUserPublicProfileById(Number(result.lastInsertRowid));
        const session = issueUserSession(result.lastInsertRowid);
        sendJson(res, 201, {
          token: session.token,
          expiresAt: session.expiresAt,
          user: publicUser ?? {
            id: Number(result.lastInsertRowid),
            username,
            displayName,
            email,
            uid,
            balance: 0,
            bonusCredit: 0,
            rank: "Bronze",
            status: "active",
            registeredAt: new Date().toISOString().slice(0, 10),
          },
        });
      } catch (e) {
        if (e && typeof e === "object" && "code" in e && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
          const message = "message" in e ? String(e.message) : "";

          if (message.includes("users.username")) {
            sendJson(res, 409, { error: "这个用户名已经被使用了。" });
            return;
          }

          if (message.includes("users.email") || message.includes("idx_users_email_nocase")) {
            sendJson(res, 409, { error: "这个邮箱已经被注册了。" });
            return;
          }

          sendJson(res, 409, { error: "用户名或邮箱已存在。" });
          return;
        }
        throw e;
      }
      return;
    }

    if (pathname === "/api/auth/login" && req.method === "POST") {
      const body = await readJsonBody(req);
      const identifier = String(body.identifier || body.email || body.username || "").trim();
      const password = String(body.password || "");

      if (!identifier || !password) {
        sendJson(res, 400, { error: "邮箱或用户名和密码不能为空。" });
        return;
      }

      const user = db.prepare(
        `
          SELECT id, username, email, display_name, password_salt, password_hash, uid
          FROM users
          WHERE email = ? COLLATE NOCASE
             OR username = ? COLLATE NOCASE
        `,
      ).get(identifier, identifier);

      if (!user || !verifyPassword(password, user.password_salt, user.password_hash)) {
        sendJson(res, 401, { error: "邮箱、用户名或密码错误。" });
        return;
      }

      const session = issueUserSession(user.id);
      const publicUser = getUserPublicProfileById(user.id);

      sendJson(res, 200, {
        token: session.token,
        expiresAt: session.expiresAt,
        user: publicUser ?? {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          email: user.email,
          uid: user.uid,
          balance: 0,
          bonusCredit: 0,
          rank: "Bronze",
          status: "active",
          registeredAt: new Date().toISOString().slice(0, 10),
        },
      });
      return;
    }

    if (pathname === "/api/auth/session" && req.method === "GET") {
      const session = getUserSessionFromRequest(req);

      if (!session) {
        sendJson(res, 401, { error: "Session expired or missing." });
        return;
      }

      sendJson(res, 200, {
        user: mapUserRowToPublicUser({
          id: session.user_id,
          username: session.username,
          display_name: session.display_name,
          email: session.email,
          uid: session.uid,
          balance: session.balance,
          bonus_credit: session.bonus_credit,
          rank: session.rank,
          status: session.status,
          registered_at: session.registered_at,
        }),
        expiresAt: session.expires_at,
      });
      return;
    }

    if (pathname === "/api/auth/logout" && req.method === "POST") {
      const authHeader = req.headers.authorization || "";
      if (authHeader.startsWith("Bearer ")) {
        const rawToken = authHeader.slice("Bearer ".length).trim();
        if (rawToken) {
          db.prepare("DELETE FROM user_sessions WHERE token_hash = ?").run(
            hashToken(rawToken),
          );
        }
      }

      sendJson(res, 200, { ok: true });
      return;
    }

    if (pathname === "/api/auth/preferences" && req.method === "GET") {
      const session = getUserSessionFromRequest(req);
      if (!session) {
        sendJson(res, 401, { error: "Session expired or missing." });
        return;
      }
      const stored = getUserPrefsObject(session.user_id);
      sendJson(res, 200, { preferences: pickDashboardPrefs(stored) });
      return;
    }

    if (pathname === "/api/auth/preferences" && req.method === "PATCH") {
      const session = getUserSessionFromRequest(req);
      if (!session) {
        sendJson(res, 401, { error: "Session expired or missing." });
        return;
      }
      const body = await readJsonBody(req);
      const patch = sanitizeDashboardPrefsPatch(body);
      if (Object.keys(patch).length === 0) {
        const stored = getUserPrefsObject(session.user_id);
        sendJson(res, 200, { preferences: pickDashboardPrefs(stored) });
        return;
      }
      const current = getUserPrefsObject(session.user_id);
      const next = { ...current, ...patch };
      saveUserPrefsObject(session.user_id, next);
      sendJson(res, 200, { preferences: pickDashboardPrefs(next) });
      return;
    }

    if (pathname === "/api/admin/login" && req.method === "POST") {
      const body = await readJsonBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");

      if (!email || !password) {
        sendJson(res, 400, { error: "Email and password are required." });
        return;
      }

      const admin = db.prepare(
        `
          SELECT id, email, display_name, password_salt, password_hash
          FROM admins
          WHERE email = ?
        `,
      ).get(email);

      if (!admin || !verifyPassword(password, admin.password_salt, admin.password_hash)) {
        sendJson(res, 401, { error: "Invalid admin credentials." });
        return;
      }

      const session = issueSession(admin.id);

      sendJson(res, 200, {
        token: session.token,
        expiresAt: session.expiresAt,
        admin: {
          id: admin.id,
          email: admin.email,
          displayName: admin.display_name,
        },
      });
      return;
    }

    if (pathname === "/api/admin/session" && req.method === "GET") {
      const session = getSessionFromRequest(req);

      if (!session) {
        sendJson(res, 401, { error: "Session expired or missing." });
        return;
      }

      sendJson(res, 200, {
        admin: {
          id: session.admin_id,
          email: session.email,
          displayName: session.display_name,
        },
        expiresAt: session.expires_at,
      });
      return;
    }

    if (pathname === "/api/admin/logout" && req.method === "POST") {
      const authHeader = req.headers.authorization || "";
      if (authHeader.startsWith("Bearer ")) {
        const rawToken = authHeader.slice("Bearer ".length).trim();
        if (rawToken) {
          db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").run(
            hashToken(rawToken),
          );
        }
      }

      sendJson(res, 200, { ok: true });
      return;
    }

    if (pathname === "/api/admin/health" && req.method === "GET") {
      sendJson(res, 200, { ok: true, dbPath });
      return;
    }

    if (pathname === "/api/admin/users" && req.method === "GET") {
      if (!requireDashboardAdminUserSession(req, res)) {
        return;
      }
      sendJson(res, 200, { users: listAdminUsers() });
      return;
    }

    if (isAdminUserWalletPath(pathname) && req.method === "PATCH") {
      if (!requireDashboardAdminUserSession(req, res)) {
        return;
      }

      const body = await readJsonBody(req);
      const users = adjustAdminUsersWallet(body);
      sendJson(res, 200, { users });
      return;
    }

    const adminUserDetailId = getAdminUserDetailPathId(pathname);
    if (adminUserDetailId && req.method === "GET") {
      if (!requireDashboardAdminUserSession(req, res)) {
        return;
      }

      const detail = getAdminUserDetail(adminUserDetailId);
      if (!detail) {
        sendJson(res, 404, { error: `Unknown admin user: ${adminUserDetailId}` });
        return;
      }

      sendJson(res, 200, detail);
      return;
    }

    if (pathname === "/api/admin/referrals" && req.method === "GET") {
      if (!requireDashboardAdminUserSession(req, res)) {
        return;
      }
      sendJson(res, 200, { referrals: listAdminReferrals() });
      return;
    }

    if (pathname === "/api/admin/nodes" && req.method === "GET") {
      if (!requireDashboardAdminUserSession(req, res)) {
        return;
      }
      sendJson(res, 200, { regions: listAdminDatacenterRegions() });
      return;
    }

    if (pathname === "/api/admin/nodes/regions" && req.method === "POST") {
      if (!requireDashboardAdminUserSession(req, res)) {
        return;
      }
      const body = await readJsonBody(req);
      sendJson(res, 201, { regions: createAdminDatacenterRegion(body) });
      return;
    }

    const adminNodeRegionId = getAdminNodeRegionPathId(pathname);
    if (adminNodeRegionId && req.method === "POST") {
      if (!requireDashboardAdminUserSession(req, res)) {
        return;
      }

      const body = await readJsonBody(req);
      sendJson(res, 201, { regions: createAdminDatacenterNode(adminNodeRegionId, body) });
      return;
    }

    if (adminNodeRegionId && req.method === "PATCH") {
      if (!requireDashboardAdminUserSession(req, res)) {
        return;
      }

      const body = await readJsonBody(req);
      sendJson(res, 200, { regions: updateAdminDatacenterRegion(adminNodeRegionId, body) });
      return;
    }

    const adminRegionNodeParams = getAdminRegionNodePathParams(pathname);
    if (adminRegionNodeParams && req.method === "DELETE") {
      if (!requireDashboardAdminUserSession(req, res)) {
        return;
      }

      sendJson(res, 200, {
        regions: deleteAdminDatacenterNode(
          adminRegionNodeParams.regionId,
          adminRegionNodeParams.nodeId,
        ),
      });
      return;
    }

    const adminNodeGameId = getAdminNodeGamePathId(pathname);
    if (adminNodeGameId && req.method === "PATCH") {
      if (!requireDashboardAdminUserSession(req, res)) {
        return;
      }

      const body = await readJsonBody(req);
      sendJson(res, 200, { regions: toggleAdminDatacenterNodeGame(adminNodeGameId, body) });
      return;
    }

    if (pathname === "/api/admin/instances" && req.method === "GET") {
      if (!requireDashboardAdminUserSession(req, res)) {
        return;
      }
      sendJson(res, 200, { instances: listAdminInstances() });
      return;
    }

    if (pathname === "/api/admin/tickets" && req.method === "GET") {
      if (!requireDashboardAdminUserSession(req, res)) {
        return;
      }
      sendJson(res, 200, { tickets: listAdminTickets() });
      return;
    }

    if (pathname.startsWith("/api/")) {
      sendJson(res, 404, {
        error: `Unknown API route: ${pathname}`,
      });
      return;
    }

    serveStaticFile(req, res);
  } catch (error) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? Number(error.statusCode) || 500
        : 500;
    const message = error instanceof Error ? error.message : "Unknown server error.";
    sendJson(res, statusCode, { error: message });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`[auth] API server listening on http://127.0.0.1:${port}`);
  console.log(`[auth] SQLite database: ${dbPath}`);
  console.log(
    "[auth] User routes: /api/auth/login, /api/auth/session, /api/auth/logout, /api/auth/preferences",
  );
  console.log(
    "[auth] Admin routes: /api/admin/users, /api/admin/users/wallet, /api/admin/users/:id/detail, /api/admin/referrals, /api/admin/nodes, /api/admin/instances, /api/admin/tickets",
  );
});
