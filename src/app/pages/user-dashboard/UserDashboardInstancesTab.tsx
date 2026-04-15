import { motion } from "motion/react";
import { Server } from "lucide-react";

export function UserDashboardInstancesTab() {
  return (
    <motion.div
      key="instances"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 py-20 text-center"
    >
      <Server className="mx-auto mb-4 h-12 w-12 text-cyan-400 opacity-50" />
      <h2 className="text-xl font-medium text-white">实例管理</h2>
      <p className="text-sm text-zinc-500">您的所有游戏与云端节点都在这里运作中。</p>
    </motion.div>
  );
}
