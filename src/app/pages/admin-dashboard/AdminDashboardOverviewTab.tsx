import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  FileText,
  Globe,
  KeyRound,
  Server,
  Settings,
  ShieldAlert,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ADMIN_TRAFFIC_DATA } from "./adminDashboardConfig";

export function AdminDashboardOverviewTab() {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c]/80 p-6 backdrop-blur-xl">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
          <span className="flex items-center gap-2 text-sm font-bold text-zinc-400">
            <Server className="h-4 w-4" /> 活跃实例
          </span>
          <span className="mt-4 text-4xl font-black text-white">1,492</span>
          <span className="mt-2 font-mono text-xs text-emerald-400">+12% vs 上月</span>
        </div>
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c]/80 p-6 backdrop-blur-xl">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />
          <span className="flex items-center gap-2 text-sm font-bold text-zinc-400">
            <Activity className="h-4 w-4" /> 总频宽消耗
          </span>
          <span className="mt-4 text-4xl font-black text-white">
            18.4 <span className="text-2xl text-zinc-500">Tbps</span>
          </span>
          <span className="mt-2 font-mono text-xs text-blue-400">峰值负载 89%</span>
        </div>
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c]/80 p-6 backdrop-blur-xl">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl" />
          <span className="flex items-center gap-2 text-sm font-bold text-zinc-400">
            <Users className="h-4 w-4" /> 注册用户
          </span>
          <span className="mt-4 text-4xl font-black text-white">8,204</span>
          <span className="mt-2 font-mono text-xs text-purple-400">+234 本周新增</span>
        </div>
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c]/80 p-6 backdrop-blur-xl">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl" />
          <span className="flex items-center gap-2 text-sm font-bold text-zinc-400">
            <DollarSign className="h-4 w-4" /> 月度营收
          </span>
          <span className="mt-4 text-4xl font-black text-white">$84.2K</span>
          <span className="mt-2 font-mono text-xs text-cyan-400">+18% vs 上月</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0c]/80 p-6 shadow-2xl backdrop-blur-xl lg:col-span-2">
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
          <div className="relative z-10 mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Globe className="h-5 w-5 text-cyan-400" /> 全网活跃与流量趋势
            </h3>
            <div className="flex items-center gap-4 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                <span className="text-zinc-400">并发 IP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                <span className="text-zinc-400">总宽带 (Gbps)</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ADMIN_TRAFFIC_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActiveIPs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#52525b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0c",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    boxShadow: "0 0 20px rgba(0,0,0,0.8)",
                  }}
                  itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }}
                  labelStyle={{ color: "#a1a1aa", fontSize: "10px", marginBottom: "4px" }}
                />
                <Area
                  type="monotone"
                  dataKey="activeIPs"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorActiveIPs)"
                />
                <Area
                  type="monotone"
                  dataKey="bandwidth"
                  stroke="#c084fc"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBandwidth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-cyan-500/20 bg-[#0a0a0c]/80 p-5 backdrop-blur-xl">
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                <Wifi className="h-3.5 w-3.5 text-cyan-400" /> 当前浏览器活跃
              </span>
              <span className="animate-pulse rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-400">
                Live
              </span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                4,180
              </span>
              <span className="mb-1 font-mono text-xs text-zinc-500">连线 IP</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-[76%] bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
            </div>
            <span className="mt-2 w-full text-right text-[10px] text-zinc-500">负载率 76%</span>
          </div>

          <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-yellow-500/20 bg-[#0a0a0c]/80 p-5 backdrop-blur-xl">
            <div className="absolute inset-0 bg-yellow-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                <KeyRound className="h-3.5 w-3.5 text-yellow-400" /> 密码错误拦截
              </span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">24H</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                842
              </span>
              <span className="mb-1 font-mono text-xs text-zinc-500">次尝试</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-yellow-500/80">32 个账号存在暴力破解风险</span>
            </div>
          </div>

          <div className="group relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-red-500/20 bg-[#0a0a0c]/80 p-5 backdrop-blur-xl">
            <div className="absolute inset-0 bg-red-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                <ShieldAlert className="h-3.5 w-3.5 text-red-400" /> 恶意 IP 封锁拦截
              </span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                All Time
              </span>
            </div>
            <div className="mb-2 mt-auto flex items-end gap-3">
              <span className="text-4xl font-black text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.4)]">
                12,045
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-red-500/10 pt-2 text-[10px] text-red-400/80">
              <span>
                今日新增封锁: <b className="text-red-400">+128</b>
              </span>
              <button className="transition-colors hover:text-white">查看防火墙</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c]/80 p-6 backdrop-blur-xl">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />
          <span className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-400">
            <Settings className="h-4 w-4" /> 系统健康状态
          </span>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
              <span className="text-zinc-300">亚洲区网络节点</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> 正常运行
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
              <span className="text-zinc-300">美洲区储存集群</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> 正常运行
              </span>
            </div>
            <div className="flex items-center justify-between pb-1 text-sm">
              <span className="text-zinc-300">欧洲法兰克福清洗中心</span>
              <span className="flex items-center gap-1 font-bold text-orange-400">
                <Zap className="h-3.5 w-3.5" /> 负载偏高 (85%)
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c]/80 p-6 backdrop-blur-xl md:col-span-2">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-pink-500/10 blur-3xl" />
          <span className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-400">
            <FileText className="h-4 w-4" /> 最新待处理工单
          </span>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">紧急</span>
                <span className="text-zinc-300">服务器被 DDOS 攻击，IP 无法访问</span>
              </div>
              <span className="text-xs text-zinc-500">10 分钟前</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-bold text-yellow-400">一般</span>
                <span className="text-zinc-300">请问如何为 Rust 伺服器安装特定 Oxide 插件？</span>
              </div>
              <span className="text-xs text-zinc-500">1 小时前</span>
            </div>
            <div className="flex items-center justify-between pb-1 text-sm">
              <div className="flex items-center gap-3">
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400">财务</span>
                <span className="text-zinc-300">季付套餐升降级退款申请</span>
              </div>
              <span className="text-xs text-zinc-500">3 小时前</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
