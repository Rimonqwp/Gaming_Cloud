import { motion } from "motion/react";
import { Wallet } from "lucide-react";

export function UserDashboardBillingTab() {
  return (
    <motion.div
      key="billing"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 py-20 text-center"
    >
      <Wallet className="mx-auto mb-4 h-12 w-12 text-emerald-400 opacity-50" />
      <h2 className="text-xl font-medium text-white">财务与账单</h2>
      <p className="text-sm text-zinc-500">管理发票、充值余额与订阅续费。</p>
    </motion.div>
  );
}
