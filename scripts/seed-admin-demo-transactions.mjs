/**
 * 將擴充的 admin_user_transactions 種子寫入 SQLite（與 server/auth-server.mjs 中
 * LEGACY_ADMIN_TRANSACTION_SEEDS 的 TXN-780* 列一致；全部歸屬 uid 586342232960（admin@gmail.com）。
 * 可重複執行，已存在的 transaction_id 會略過。
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const DASHBOARD_ADMIN_UID = "586342232960";

const SEEDS = [
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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = path.join(root, "data", "admin-auth.sqlite");
const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

const findUserId = db.prepare("SELECT id FROM users WHERE uid = ? LIMIT 1");
const exists = db.prepare(
  "SELECT 1 FROM admin_user_transactions WHERE transaction_id = ? LIMIT 1",
);
const insert = db.prepare(`
  INSERT INTO admin_user_transactions (
    transaction_id, user_id, transaction_date, amount, type, status, description, method
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

let inserted = 0;
let skipped = 0;
let missingUser = 0;

for (const seed of SEEDS) {
  if (exists.get(seed.transactionId)) {
    skipped += 1;
    continue;
  }
  const row = findUserId.get(seed.ownerUid);
  if (!row) {
    console.warn("略過（找不到使用者 uid）:", seed.transactionId, seed.ownerUid);
    missingUser += 1;
    continue;
  }
  insert.run(
    seed.transactionId,
    row.id,
    seed.date,
    seed.amount,
    seed.type,
    seed.status,
    seed.description,
    seed.method,
  );
  inserted += 1;
}

db.close();
console.log(`完成：寫入 ${inserted} 筆，已存在略過 ${skipped} 筆，找不到使用者 ${missingUser} 筆。`);
