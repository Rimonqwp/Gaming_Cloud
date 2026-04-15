/**
 * 將示範交易列的 user_id 改為 admin@gmail.com 對應使用者（uid 586342232960）。
 * 用於把先前寫到其他示範帳號的 TXN 併入管理員帳號。
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const ADMIN_EMAIL = "admin@gmail.com";

const TRANSACTION_IDS = [
  "TXN-8099",
  "TXN-78006",
  "TXN-78007",
  "TXN-78008",
  "TXN-78009",
  "TXN-78010",
  "TXN-78011",
  "TXN-78012",
  "TXN-78013",
  "TXN-78014",
  "TXN-78015",
  "TXN-78016",
  "TXN-78020",
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const db = new Database(path.join(root, "data", "admin-auth.sqlite"));
db.pragma("foreign_keys = ON");

const admin = db.prepare("SELECT id FROM users WHERE lower(email) = lower(?) LIMIT 1").get(ADMIN_EMAIL);
if (!admin) {
  console.error("找不到使用者:", ADMIN_EMAIL);
  process.exit(1);
}

const placeholders = TRANSACTION_IDS.map(() => "?").join(", ");
const stmt = db.prepare(
  `UPDATE admin_user_transactions SET user_id = ? WHERE transaction_id IN (${placeholders})`,
);
const result = stmt.run(admin.id, ...TRANSACTION_IDS);
db.close();

console.log(`已將 ${result.changes} 筆交易改為歸屬 ${ADMIN_EMAIL} (user_id=${admin.id})。`);
