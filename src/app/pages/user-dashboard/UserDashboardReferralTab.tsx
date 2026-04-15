import { motion } from "motion/react";
import { Copy, Gift } from "lucide-react";

const referralStats = [
  { label: "总点击次数", value: "248" },
  { label: "成功注册", value: "12" },
  { label: "累计赚取佣金", value: "$120.00", highlight: true },
] as const;

export function UserDashboardReferralTab() {
  return (
    <motion.div
      key="referral"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-auto max-w-5xl space-y-6"
    >
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 p-8 shadow-2xl">
        <div className="pointer-events-none absolute right-[-10%] top-[-50%] h-[300px] w-[300px] rounded-full bg-purple-500/20 blur-[120px]" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-md">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
              <Gift className="h-3 w-3" /> 推广联盟计划
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-white">邀请好友，获取免费额度</h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              分享您的专属邀请链接。当好友通过链接注册并产生首笔消费时，您和好友都将获得{" "}
              <span className="font-bold text-white">$10.00</span> 的云端充值赠金。
            </p>
          </div>

          <div className="w-full max-w-sm flex-1 md:w-auto">
            <label className="mb-2 block text-xs font-medium text-zinc-500">您的专属邀请链接</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-xl border border-white/10 bg-[#050505] px-4 py-3 font-mono text-sm text-zinc-300">
                https://nexus-host.com/ref/CYB3R99
              </div>
              <button className="rounded-xl bg-white p-3 text-black transition-colors hover:bg-zinc-200">
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {referralStats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/5 bg-[#050505]/60 p-6 text-center shadow-lg backdrop-blur-xl">
            <div className="mb-2 text-xs font-medium text-zinc-500">{stat.label}</div>
            <div className={`text-3xl font-mono font-medium ${stat.highlight ? "text-emerald-400" : "text-white"}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
