import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  Box,
  CreditCard,
  HardDrive,
  MessageSquare,
  Package,
  Plus,
  ShieldCheck,
  Terminal,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import type { UserDashboardTabId } from "../../config/userDashboardNavTabs";
import type { DashboardInstance, DashboardUsageDataPoint, DashboardUser } from "./userDashboardTypes";

type UserDashboardOverviewTabProps = {
  dashboardUser: DashboardUser;
  instances: DashboardInstance[];
  usageData: DashboardUsageDataPoint[];
  onSelectTab: (tab: UserDashboardTabId) => void;
};

type OverviewStat = {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  color: string;
  border: string;
};

const overviewStats: OverviewStat[] = [
  { label: "运行中服务", value: "3", icon: Box, color: "text-cyan-400", border: "border-cyan-500/20" },
  { label: "待回复工单", value: "1", icon: MessageSquare, color: "text-amber-400", border: "border-amber-500/20" },
  { label: "未支付账单", value: "0", icon: CreditCard, color: "text-emerald-400", border: "border-emerald-500/20" },
  { label: "本月流量消耗", value: "1.2", unit: "TB", icon: Activity, color: "text-purple-400", border: "border-purple-500/20" },
];

type QuickDeployItem = {
  name: string;
  desc: string;
  icon: LucideIcon;
  accentClass: string;
};

const quickDeployItems: QuickDeployItem[] = [
  { name: "Minecraft Server", desc: "Vanilla / Paper", icon: Package, accentClass: "group-hover/btn:text-emerald-400" },
  { name: "Palworld Server", desc: "Dedicated Host", icon: Box, accentClass: "group-hover/btn:text-cyan-400" },
  { name: "Ubuntu 22.04 LTS", desc: "Base VPS", icon: Terminal, accentClass: "group-hover/btn:text-purple-400" },
];

export function UserDashboardOverviewTab({
  dashboardUser,
  instances,
  usageData,
  onSelectTab,
}: UserDashboardOverviewTabProps) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-[#050505]/60 p-6 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="flex h-16 w-16 rounded-full border border-white/10 bg-white/5 p-0.5 backdrop-blur-md">
              <div
                className="flex min-h-0 min-w-0 flex-1 items-center justify-center rounded-full bg-cyan-950/80 text-cyan-400/95"
                role="img"
                aria-label="頭像"
              >
                <UserRound className="h-7 w-7" aria-hidden />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#020202]">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
            </div>
          </div>
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-wide text-white">
              {dashboardUser.name}
              <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
                <ShieldCheck className="h-3 w-3 text-cyan-400" /> {dashboardUser.rank}
              </span>
            </h1>
            <p className="mt-1.5 flex items-center gap-2 font-mono text-xs text-zinc-500">
              {dashboardUser.email} <span className="h-1 w-1 rounded-full bg-zinc-700" /> UID: {dashboardUser.id}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end px-4">
          <span className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">可用余额</span>
          <span className="text-xl font-mono text-white">${dashboardUser.balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {overviewStats.map((stat) => (
          <div
            key={stat.label}
            className="group flex items-center justify-between rounded-2xl border border-white/5 bg-[#050505]/60 p-5 shadow-lg transition-colors hover:border-white/10"
          >
            <div>
              <div className="mb-2 text-xs font-medium text-zinc-500">{stat.label}</div>
              <div className="flex items-baseline gap-1 text-2xl font-mono text-white">
                {stat.value} {stat.unit ? <span className="text-sm text-zinc-500">{stat.unit}</span> : null}
              </div>
            </div>
            <div className={`rounded-xl border bg-white/5 p-3 transition-transform group-hover:scale-110 ${stat.border}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-4 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent p-4 backdrop-blur-md md:items-center">
        <div className="shrink-0 rounded-full bg-amber-500/20 p-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
        </div>
        <div className="flex-1 gap-4 md:flex md:items-center md:justify-between">
          <div>
            <h4 className="text-sm font-medium text-amber-400/90">节点维护通知 - Asia Pacific (SG)</h4>
            <p className="mt-0.5 text-xs text-zinc-400">本周五凌晨 02:00 进行网络架构升级，预计影响 15 分钟。</p>
          </div>
          <button className="mt-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:text-amber-300 md:mt-0">
            查看详情
          </button>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white">
            <Box className="h-4 w-4 text-emerald-400" /> 我的产品概览
          </h3>
          <button className="text-xs text-zinc-500 transition-colors hover:text-white" onClick={() => onSelectTab("instances")}>
            查看所有实例 &rarr;
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {instances.slice(0, 3).map((instance) => (
            <div
              key={instance.id}
              className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-white/5 bg-[#050505]/60 p-4 transition-colors hover:border-white/10"
              onClick={() => onSelectTab("instances")}
            >
              <div
                className={`h-2 w-2 shrink-0 rounded-full ${instance.status === "running" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-zinc-600"}`}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white transition-colors group-hover:text-cyan-400">
                  {instance.name}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">{instance.game}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-2 transition-colors group-hover:bg-white/10">
                <HardDrive className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-[#050505]/60 p-6 shadow-2xl lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-base font-medium text-white">
                <Activity className="h-4 w-4 text-cyan-400" /> 资源消耗监控
              </h3>
              <p className="mt-1 text-xs text-zinc-500">过去 24 小时内的聚合性能数据</p>
            </div>
            <select className="appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-cyan-500/50">
              <option>所有实例</option>
              <option>Survival Server</option>
            </select>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff30" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0c",
                    borderColor: "#ffffff10",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ stroke: "#ffffff10", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" name="CPU" />
                <Area type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" name="Memory" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col rounded-3xl border border-white/5 bg-[#050505]/60 p-6 shadow-2xl backdrop-blur-xl">
          <h3 className="mb-1 text-base font-medium text-white">快速部署</h3>
          <p className="mb-6 text-xs text-zinc-500">一键启动预配置的云端环境</p>

          <div className="flex-1 space-y-3">
            {quickDeployItems.map((item) => (
              <button
                key={item.name}
                className="group/btn flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition-colors group-hover/btn:bg-white/10">
                    <item.icon className={`h-5 w-5 text-zinc-400 transition-colors ${item.accentClass}`} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">{item.name}</div>
                    <div className="text-xs text-zinc-500">{item.desc}</div>
                  </div>
                </div>
                <Plus className="h-4 w-4 text-zinc-600 transition-colors group-hover/btn:text-white" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
