import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Copy,
  Cpu,
  Crown,
  Database,
  Edit2,
  Feather,
  FolderOpen,
  GitBranch,
  Globe,
  HardDrive,
  History,
  Layers,
  Lock,
  ListFilter,
  MapPin,
  Maximize2,
  MessageSquare,
  Monitor,
  Network,
  Play,
  PlayCircle,
  Plus,
  Power,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Save,
  ScrollText,
  Search,
  Server,
  Settings,
  Settings2,
  ShieldAlert,
  ShieldBan,
  ShieldCheck,
  Square,
  Terminal,
  TerminalSquare,
  Trash2,
  Users,
  Users2,
  Wifi,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { ADMIN_DASHBOARD_INSTANCE_TABS } from "./adminDashboardConfig";
import type { AdminDashboardInstanceTabId, Instance } from "./adminDashboardTypes";

type AdminDashboardInstancesTabProps = {
  instances: Instance[];
  isInstancesLoading: boolean;
  instancesLoadError: string | null;
  selectedInstanceId: string | null;
  instanceActiveTab: AdminDashboardInstanceTabId;
  onSelectInstance: (instanceId: string) => void;
  onCloseInstanceDetail: () => void;
  onSetInstanceActiveTab: (tabId: AdminDashboardInstanceTabId) => void;
};

function getStatusBadgeClass(status: Instance["status"]) {
  if (status === "running") {
    return "bg-emerald-500/20 text-emerald-400";
  }
  if (status === "stopped") {
    return "bg-zinc-500/20 text-zinc-400";
  }
  return "bg-orange-500/20 text-orange-400";
}

function renderStatusDot(status: Instance["status"]) {
  if (status === "running") {
    return <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-emerald-400" title="运行中" />;
  }
  if (status === "stopped") {
    return <span className="mr-2 h-2 w-2 rounded-full bg-zinc-600" title="已停止" />;
  }
  return <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-orange-400" title="部署中" />;
}

function renderSparkTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; stroke: string }> }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const current = payload[0];
  const unit = current.dataKey === "net" ? " Mbps" : current.dataKey === "disk" ? " GB" : "%";

  return (
    <div className="rounded-lg border border-white/10 bg-black/80 px-3 py-1.5 text-xs font-mono shadow-2xl backdrop-blur-xl">
      <span className="font-bold" style={{ color: current.stroke }}>
        {current.value.toFixed(1)}
        {unit}
      </span>
    </div>
  );
}

function buildSparklineData(instance: Instance) {
  return [
    { time: "10:00", cpu: Math.max(5, instance.cpuUsage - 25), mem: Math.max(10, instance.memUsage - 15), disk: 24.1, net: 5 },
    { time: "10:05", cpu: Math.max(8, instance.cpuUsage - 15), mem: Math.max(12, instance.memUsage - 8), disk: 24.1, net: 12 },
    { time: "10:10", cpu: Math.max(15, instance.cpuUsage - 5), mem: Math.max(15, instance.memUsage - 5), disk: 24.2, net: 8 },
    { time: "10:15", cpu: Math.min(100, instance.cpuUsage + 10), mem: Math.min(100, instance.memUsage + 5), disk: 24.3, net: 25 },
    { time: "10:20", cpu: Math.max(10, instance.cpuUsage - 12), mem: Math.max(10, instance.memUsage - 2), disk: 24.5, net: 14 },
    { time: "10:25", cpu: Math.min(100, instance.cpuUsage + 15), mem: Math.min(100, instance.memUsage + 3), disk: 24.6, net: 32 },
    { time: "10:30", cpu: instance.cpuUsage, mem: instance.memUsage, disk: 24.8, net: 18.2 },
  ];
}

function renderMetricCard(
  label: string,
  icon: React.ReactNode,
  value: React.ReactNode,
  accentClass: string,
  dataKey: "cpu" | "mem" | "disk" | "net",
  data: Array<{ time: string; cpu: number; mem: number; disk: number; net: number }>,
  extra?: React.ReactNode,
) {
  const colorMap = {
    cpu: { stroke: "#34d399", fillId: "colorCpu" },
    mem: { stroke: "#60a5fa", fillId: "colorMem" },
    disk: { stroke: "#c084fc", fillId: "colorDisk" },
    net: { stroke: "#22d3ee", fillId: "colorNet" },
  } as const;

  const color = colorMap[dataKey];

  return (
    <div className={`group relative flex h-36 flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] transition-all ${accentClass}`}>
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30 transition-opacity duration-500 group-hover:opacity-100">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={color.fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color.stroke} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <RechartsTooltip
              content={renderSparkTooltip}
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color.stroke} strokeWidth={2} fillOpacity={1} fill={`url(#${color.fillId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="relative z-10 flex h-full flex-col justify-between p-4">
        <span className="flex items-center gap-1 text-xs font-bold text-zinc-500">
          {icon}
          {label}
        </span>
        <div>
          {value}
          {extra}
        </div>
      </div>
    </div>
  );
}

function AdminDashboardInstanceDetail({
  instance,
  instanceActiveTab,
  onCloseInstanceDetail,
  onSetInstanceActiveTab,
}: {
  instance: Instance;
  instanceActiveTab: AdminDashboardInstanceTabId;
  onCloseInstanceDetail: () => void;
  onSetInstanceActiveTab: (tabId: AdminDashboardInstanceTabId) => void;
}) {
  const sparklineData = buildSparklineData(instance);

  return (
    <motion.div
      key={`instance-detail-${instance.id}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={onCloseInstanceDetail}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
              <HardDrive className="h-6 w-6 text-emerald-400" />
              {instance.game} - {instance.node}
            </h2>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-500">ID: {instance.id}</span>
              <span className="text-xs font-mono text-zinc-500">OWNER: {instance.userId}</span>
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(instance.status)}`}>
                {instance.status === "running"
                  ? "● 运行中"
                  : instance.status === "stopped"
                    ? "○ 已停止"
                    : "◐ 部署中"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20">
            <Play className="h-4 w-4" /> 启动
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-zinc-500/20 bg-zinc-500/10 px-4 py-2 text-sm font-bold text-zinc-400 transition-colors hover:bg-zinc-500/20">
            <RotateCcw className="h-4 w-4" /> 重启
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/20">
            <Square className="h-4 w-4 fill-current" /> 强制停止
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-2">
        <nav className="flex w-max min-w-full items-center gap-2 rounded-2xl border border-white/10 bg-[#0a0a0c]/80 p-2 shadow-2xl backdrop-blur-2xl lg:min-w-0 lg:w-fit">
          {ADMIN_DASHBOARD_INSTANCE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = instanceActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSetInstanceActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
                  isActive ? "bg-white/10 text-white shadow-lg" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <>
        {instanceActiveTab === "console" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {renderMetricCard(
                "CPU 负载",
                <Activity className="h-3.5 w-3.5" />,
                <span className="text-2xl font-black text-emerald-400 drop-shadow-md">{instance.cpuUsage}%</span>,
                "hover:border-emerald-500/45",
                "cpu",
                sparklineData,
              )}
              {renderMetricCard(
                "内存占用",
                <HardDrive className="h-3.5 w-3.5" />,
                <>
                  <span className="text-2xl font-black text-blue-400 drop-shadow-md">{instance.memUsage}%</span>
                  <div className="mt-0.5 text-[10px] text-zinc-400">{(instance.memUsage * 0.08).toFixed(1)} GB / 8 GB</div>
                </>,
                "hover:border-blue-500/45",
                "mem",
                sparklineData,
              )}
              {renderMetricCard(
                "存储空间",
                <Database className="h-3.5 w-3.5" />,
                <>
                  <span className="text-2xl font-black text-purple-400 drop-shadow-md">
                    12.4 <span className="text-sm">GB</span>
                  </span>
                  <div className="mt-0.5 text-[10px] text-zinc-400">/ 50 GB (24.8%)</div>
                </>,
                "hover:border-purple-500/45",
                "disk",
                sparklineData,
              )}
              {renderMetricCard(
                "网络宽带",
                <Network className="h-3.5 w-3.5" />,
                <>
                  <span className="text-2xl font-black text-cyan-400 drop-shadow-md">
                    18.2 <span className="text-sm">Mbps</span>
                  </span>
                  <div className="mt-0.5 flex justify-between pr-2 text-[10px] text-zinc-400">
                    <span>↑ 12.4 GB</span>
                    <span>↓ 4.1 GB</span>
                  </div>
                </>,
                "hover:border-cyan-500/45",
                "net",
                sparklineData,
              )}
            </div>

            <div className="mt-6 flex flex-col gap-6 xl:flex-row">
              <div className="group relative flex h-[500px] flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 h-1 animate-[pulse_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="z-10 flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                      <div className="h-3 w-3 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    </div>
                    <span className="ml-2 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-300">
                      <TerminalSquare className="h-4 w-4 text-emerald-400" /> SYS.CONSOLE
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-mono text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                      DAEMON CONNECTED
                    </span>
                    <div className="flex gap-2">
                      <button className="text-zinc-500 transition-colors hover:text-white">
                        <Maximize2 className="h-4 w-4" />
                      </button>
                      <button className="text-zinc-500 transition-colors hover:text-white">
                        <Settings2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className="pointer-events-none absolute inset-0 z-0"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)",
                  }}
                />

                <div className="relative z-10 flex-1 space-y-1.5 overflow-y-auto p-4 font-mono text-xs">
                  <div className="text-zinc-400 drop-shadow-[0_0_2px_rgba(161,161,170,0.8)]"><span className="text-emerald-500">root@node-01:~#</span> ./start.sh</div>
                  <div className="text-zinc-400">[14:23:01 INFO]: Starting {instance.game} server runtime</div>
                  <div className="text-zinc-400">[14:23:01 INFO]: Loading properties</div>
                  <div className="text-zinc-400">[14:23:02 INFO]: Binding services on primary node</div>
                  <div className="text-zinc-400">[14:23:02 INFO]: Allocating instance on {instance.node}</div>
                  <div className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.6)]">[14:23:04 WARN]: Some optional modules are not enabled</div>
                  <div className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]">[14:23:05 INFO]: Done! Instance {instance.id} is available.</div>
                  <div className="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.6)]">[14:28:12 INFO]: Admin connected to remote console</div>
                  <div className="text-zinc-400"><span className="text-emerald-500">root@node-01:~#</span> <span className="ml-1 inline-block h-4 w-2 animate-pulse align-middle bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" /></div>
                </div>

                <div className="relative z-10 border-t border-white/10 bg-black/60 p-3 backdrop-blur-xl">
                  <div className="relative flex items-center">
                    <ChevronRight className="pointer-events-none absolute left-3 h-5 w-5 text-emerald-500" />
                    <input
                      type="text"
                      placeholder="ENTER COMMAND (/op username)..."
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-24 text-sm font-mono uppercase text-emerald-400 placeholder:text-zinc-600 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:shadow-[0_0_15px_rgba(52,211,153,0.2)] hover:border-emerald-500/50"
                    />
                    <button className="absolute right-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold font-mono text-emerald-400 transition-colors hover:bg-emerald-500/30">EXECUTE</button>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-4 xl:w-80">
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl transition-all hover:border-emerald-500/30">
                  <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-[50px] transition-all group-hover:bg-emerald-500/20" />
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-300">
                      <Server className="h-4 w-4 text-emerald-400" /> System Status
                    </h3>
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <span className="mb-1 text-[10px] font-mono uppercase text-zinc-500">Current Uptime</span>
                      <span className="font-mono text-xl font-black tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                        14<span className="mx-1 text-sm font-normal text-zinc-400">d</span>
                        08<span className="mx-1 text-sm font-normal text-zinc-400">h</span>
                        42<span className="mx-1 text-sm font-normal text-zinc-400">m</span>
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button className="group/btn flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 py-3 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/20">
                        <Play className="h-5 w-5 text-zinc-400 transition-all group-hover/btn:text-emerald-400 group-hover/btn:drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover/btn:text-emerald-400">Start</span>
                      </button>
                      <button className="group/btn flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 py-3 transition-all hover:border-blue-500/50 hover:bg-blue-500/20">
                        <RefreshCw className="h-5 w-5 text-zinc-400 transition-all group-hover/btn:text-blue-400 group-hover/btn:drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover/btn:text-blue-400">Restart</span>
                      </button>
                      <button className="group/btn flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 py-3 transition-all hover:border-yellow-500/50 hover:bg-yellow-500/20">
                        <Square className="h-4 w-4 text-zinc-400 transition-all group-hover/btn:text-yellow-400 group-hover/btn:drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover/btn:text-yellow-400">Stop</span>
                      </button>
                      <button className="group/btn flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 py-3 transition-all hover:border-red-500/50 hover:bg-red-500/20">
                        <Power className="h-5 w-5 text-zinc-400 transition-all group-hover/btn:text-red-400 group-hover/btn:drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover/btn:text-red-400">Kill</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="group relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl transition-all hover:border-white/20">
                  <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-300">
                    <Cpu className="h-4 w-4 text-purple-400" /> Instance Details
                  </h3>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:border-white/20">
                      <div className="mb-1 flex items-center gap-1 text-[10px] font-mono uppercase text-zinc-500">Primary IP Address</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-zinc-300">192.168.1.100:25565</span>
                        <button className="text-zinc-500 transition-colors hover:text-white">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:border-white/20">
                        <div className="mb-1 text-[10px] font-mono uppercase text-zinc-500">Node</div>
                        <div className="text-xs font-bold text-zinc-300">SG-Premium-01</div>
                      </div>
                      <div className="rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:border-white/20">
                        <div className="mb-1 text-[10px] font-mono uppercase text-zinc-500">Type</div>
                        <div className="text-xs font-bold text-zinc-300">{instance.game}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {instanceActiveTab === "files" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex max-w-[50%] items-center gap-2 overflow-x-auto whitespace-nowrap rounded-xl border border-white/5 bg-black/40 px-4 py-2 text-sm font-mono text-zinc-300 md:max-w-full">
                <span className="text-emerald-400">/</span>
                <span>home</span>
                <span className="text-zinc-600">/</span>
                <span>container</span>
              </div>
              <div className="shrink-0 flex gap-2">
                <button className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/10">新建文件</button>
                <button className="hidden rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/10 sm:block">新建文件夹</button>
                <button className="rounded-lg border border-blue-500/30 bg-blue-500/20 px-3 py-1.5 text-xs font-bold text-blue-400 transition-colors hover:bg-blue-500 hover:text-white">上传</button>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/40">
              <div className="w-full overflow-x-auto">
                <table className="min-w-[600px] w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs font-bold uppercase text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">名称</th>
                      <th className="w-32 px-4 py-3">大小</th>
                      <th className="w-48 px-4 py-3">最后修改</th>
                      <th className="w-24 px-4 py-3">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {["world", "plugins", "config", "logs"].map((folder) => (
                      <tr key={folder} className="group cursor-pointer transition-colors hover:bg-white/5">
                        <td className="flex items-center gap-3 px-4 py-3"><FolderOpen className="h-4 w-4 text-blue-400" /> {folder}</td>
                        <td className="px-4 py-3 text-zinc-500">-</td>
                        <td className="px-4 py-3 text-zinc-500">2 分钟前</td>
                        <td className="px-4 py-3"><button className="text-zinc-500 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"><Edit2 className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                    <tr className="group cursor-pointer transition-colors hover:bg-white/5">
                      <td className="flex items-center gap-3 px-4 py-3"><ScrollText className="h-4 w-4 text-zinc-400" /> server.properties</td>
                      <td className="px-4 py-3 text-zinc-500">1.2 KB</td>
                      <td className="px-4 py-3 text-zinc-500">5 小时前</td>
                      <td className="px-4 py-3"><button className="text-zinc-500 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"><Edit2 className="h-4 w-4" /></button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {instanceActiveTab === "players" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-5 transition-all hover:border-emerald-500/30">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-[40px]" />
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
                  <Users2 className="h-4 w-4" /> 在线玩家
                </div>
                <div className="flex items-baseline gap-2 text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                  4 <span className="text-sm font-bold text-zinc-500">/ 50</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" style={{ width: "8%" }} />
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-5 transition-all hover:border-blue-500/30">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10 blur-[40px]" />
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                  <Wifi className="h-4 w-4" /> 平均延迟
                </div>
                <div className="flex items-baseline gap-2 text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                  24 <span className="text-sm font-bold text-zinc-500">ms</span>
                </div>
                <div className="mt-2 text-xs text-zinc-500">网络连接优良</div>
              </div>

              <div className="group flex flex-col justify-center gap-3 rounded-2xl border border-white/5 bg-black/40 p-5 transition-all hover:border-white/20">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="搜索玩家 ID..."
                    className="w-full rounded-xl border border-white/10 bg-black/60 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 rounded-xl border border-white/5 bg-white/5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/10">白名单管理</button>
                  <button className="flex-1 rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20">封禁列表</button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/40 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-300">Connected Users</h3>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {[
                  { name: "game_master99", role: "OP / Admin", ping: 15, status: "Active", avatar: "MHF_Alex" },
                  { name: "steve_miner", role: "Player", ping: 24, status: "Active", avatar: "MHF_Steve" },
                  { name: "alex2024", role: "Player", ping: 42, status: "Away", avatar: "MHF_Villager" },
                  { name: "notch_fan", role: "Player", ping: 18, status: "Active", avatar: "MHF_Pig" },
                ].map((player) => (
                  <div key={player.name} className="group flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 p-1 shadow-inner transition-colors group-hover:border-white/20">
                          <img
                            src={`https://minotar.net/helm/${player.name}/64.png`}
                            alt={player.name}
                            className="h-full w-full rounded-lg"
                            style={{ imageRendering: "pixelated" }}
                            onError={(event) => {
                              event.currentTarget.src = `https://minotar.net/helm/${player.avatar}/64.png`;
                            }}
                          />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 z-20 h-3.5 w-3.5 rounded-full border-2 border-[#0a0a0c] ${player.status === "Active" ? "bg-emerald-500 shadow-[0_0_5px_rgba(52,211,153,0.8)]" : "bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-base font-bold text-white">
                          {player.name}
                          {player.role.includes("OP") && <Crown className="h-3.5 w-3.5 text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.8)]" />}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs">
                          <span className={`rounded border px-1.5 py-0.5 font-mono ${player.role.includes("OP") ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400" : "border-white/10 bg-white/5 text-zinc-400"}`}>
                            {player.role}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-zinc-500">
                            <Activity className="h-3 w-3 text-blue-400" /> {player.ping}ms
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      <button className="flex items-center gap-1.5 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs font-bold text-yellow-400 transition-all hover:bg-yellow-500 hover:text-black">
                        <Crown className="h-3.5 w-3.5" /> OP
                      </button>
                      <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-white hover:text-black">
                        <MessageSquare className="h-3.5 w-3.5" /> 私信
                      </button>
                      <button className="flex items-center gap-1.5 rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-400 transition-all hover:bg-orange-500 hover:text-white">
                        <ArrowRight className="h-3.5 w-3.5" /> 踢出
                      </button>
                      <button className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 transition-all hover:bg-red-500 hover:text-white">
                        <ShieldBan className="h-3.5 w-3.5" /> 封禁
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {instanceActiveTab === "network" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="group relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-black/40 p-6 backdrop-blur-xl">
              <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-yellow-500/10 blur-[80px] transition-all group-hover:bg-yellow-500/20" />
              <div className="relative z-10 mb-6 flex items-start justify-between">
                <div>
                  <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-yellow-400">
                    <Crown className="h-5 w-5 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
                    <span>VIP 专属网络线路 (Premium Routing)</span>
                  </h4>
                  <p className="text-xs text-zinc-400">已开启 BGP 多线高防与 DDoS 防御，提供极低延迟的专属独立 IP</p>
                </div>
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                  PRO ACTIVE
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-yellow-500/20 bg-black/60 p-4 transition-colors hover:border-yellow-500/50">
                  <div className="mb-1 flex items-center gap-1 text-[10px] font-mono uppercase text-zinc-500">
                    <Globe className="h-3 w-3" /> VIP 独立公网 IP
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-mono tracking-wider text-white">103.24.55.192</span>
                    <button className="text-yellow-400 transition-colors hover:text-white"><Copy className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="rounded-xl border border-yellow-500/20 bg-black/60 p-4 transition-colors hover:border-yellow-500/50">
                  <div className="mb-1 flex items-center gap-1 text-[10px] font-mono uppercase text-zinc-500">
                    <ShieldCheck className="h-3 w-3" /> DDoS 防御状态
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-emerald-400">防御中 (最高 500G)</span>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                  </div>
                </div>
                <div className="group/btn flex cursor-pointer flex-col items-center justify-center rounded-xl border border-yellow-500/20 bg-black/60 p-4 transition-colors hover:border-yellow-500/50">
                  <Settings2 className="mb-1 h-5 w-5 text-yellow-500/50 transition-colors group-hover/btn:text-yellow-400" />
                  <span className="text-xs font-bold text-zinc-400 transition-colors group-hover/btn:text-yellow-400">配置自定义域名解析</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-6 backdrop-blur-xl transition-all hover:border-white/10">
              <h4 className="mb-6 flex items-center gap-2 text-sm font-bold text-white">
                <Network className="h-4 w-4 text-cyan-400" /> 基础网络与端口路由 (Fire墙与NAT)
              </h4>
              <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-black/60">
                <table className="min-w-[700px] w-full text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="w-12 px-5 py-4 text-center">状态</th>
                      <th className="px-5 py-4">协议 (Protocol)</th>
                      <th className="px-5 py-4">公网端口 (Public)</th>
                      <th className="px-5 py-4">内部目标 (Internal)</th>
                      <th className="px-5 py-4">用途描述 (Description)</th>
                      <th className="px-5 py-4 text-right">操作 (Action)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs text-zinc-300">
                    <tr className="group/row bg-cyan-500/[0.02] transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-4 text-center">
                        <div className="flex justify-center">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4"><span className="rounded border border-white/10 bg-white/10 px-2 py-1 font-bold text-white">TCP / UDP</span></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">25565</span>
                          <button className="opacity-0 text-zinc-500 transition-colors group-hover/row:opacity-100 hover:text-cyan-400"><Copy className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-500"><span className="flex items-center gap-2"><ArrowRight className="h-3 w-3" /> 25565</span></td>
                      <td className="px-5 py-4"><span className="flex items-center gap-2 text-sm font-bold text-white">主服务端连接 (Primary) <span className="rounded border border-cyan-500/30 bg-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-400">必选</span></span></td>
                      <td className="px-5 py-4 text-right"><button className="cursor-not-allowed rounded-lg bg-white/5 p-2 text-zinc-500" disabled title="主端口不可修改"><Lock className="h-4 w-4" /></button></td>
                    </tr>
                    <tr className="group/row transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-4 text-center"><div className="flex justify-center"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(52,211,153,0.8)]" /></div></td>
                      <td className="px-5 py-4"><span className="rounded border border-white/5 bg-white/5 px-2 py-1 text-zinc-400">TCP</span></td>
                      <td className="px-5 py-4"><div className="flex items-center gap-2"><span className="text-base font-bold text-white transition-colors group-hover/row:text-emerald-400">8080</span><button className="opacity-0 text-zinc-500 transition-colors group-hover/row:opacity-100 hover:text-white"><Copy className="h-3.5 w-3.5" /></button></div></td>
                      <td className="px-5 py-4 text-zinc-500"><span className="flex items-center gap-2"><ArrowRight className="h-3 w-3" /> 8080</span></td>
                      <td className="px-5 py-4"><span className="text-sm text-zinc-300">Dynmap / Web API (Internal)</span></td>
                      <td className="px-5 py-4 text-right"><div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover/row:opacity-100"><button className="rounded-lg border border-white/5 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"><Edit2 className="h-4 w-4" /></button><button className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-colors hover:border-red-500 hover:bg-red-500 hover:text-white"><Trash2 className="h-4 w-4" /></button></div></td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex justify-center border-t border-white/10 bg-white/[0.01] p-4">
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm font-bold text-zinc-400 transition-colors hover:border-white/40 hover:bg-white/5 hover:text-white">
                    <Plus className="h-4 w-4" /> 添加新的端口映射规则 (Add Port Forwarding Rule)
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {instanceActiveTab === "startup" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="group relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-colors hover:border-emerald-500/30 md:flex-row md:items-center">
              <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-[100px] transition-all group-hover:bg-emerald-500/10" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 shadow-[0_0_15px_rgba(52,211,153,0.1)] transition-all group-hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                  <PlayCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-white">启动与环境变量 (Environment Variables)</h3>
                  <p className="mt-1 text-xs text-zinc-400">Docker 镜像定义及运行时环境参数，修改后需重启生效。</p>
                </div>
              </div>
              <button className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-black text-black shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-colors hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(52,211,153,0.6)]">
                <Save className="h-4 w-4" /> 部署并保存配置
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-1">
                <div className="rounded-2xl border border-white/5 bg-black/40 p-6 shadow-2xl backdrop-blur-xl">
                  <h4 className="mb-6 flex items-center gap-2 text-sm font-bold text-white">
                    <Layers className="h-4 w-4 text-emerald-400" /> 容器基础镜像 (Container Image)
                  </h4>
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                        <span>Docker Image</span>
                        <span className="rounded-[4px] border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-400">Registry</span>
                      </label>
                      <div className="group/input relative">
                        <input
                          type="text"
                          defaultValue="ghcr.io/pterodactyl/yolks:java_17"
                          className="w-full rounded-xl border border-white/10 bg-[#0a0a0c] px-4 py-3 text-sm font-mono text-zinc-300 shadow-inner transition-colors focus:border-emerald-500/50 focus:outline-none"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover/input:opacity-100">
                          <Lock className="h-4 w-4 text-zinc-500" />
                        </div>
                      </div>
                      <p className="mt-2 text-[10px] text-zinc-500">指定用于启动该实例的基础 Docker 容器镜像。</p>
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    <div>
                      <label className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                        <span>Startup Command</span>
                      </label>
                      <textarea
                        defaultValue="java -Xms128M -Xmx{{SERVER_MEMORY}}M -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}"
                        className="h-28 w-full resize-none rounded-xl border border-white/10 bg-[#0a0a0c] px-4 py-3 text-xs leading-relaxed text-zinc-300 shadow-inner transition-colors focus:border-emerald-500/50 focus:outline-none"
                      />
                      <p className="mt-2 text-[10px] text-zinc-500">可以使用 <code className="rounded bg-white/5 px-1 text-zinc-300">{"{{变量}}"}</code> 语法引用右侧的环境变量。</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-2">
                <div className="group/vars relative h-full overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-6 shadow-2xl backdrop-blur-xl">
                  <div className="absolute right-0 top-0 h-px w-[500px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 transition-opacity duration-1000 group-hover/vars:opacity-100" />
                  <h4 className="mb-6 flex items-center justify-between text-sm font-bold text-white">
                    <span className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-emerald-400" /> 环境变量 (Environment Variables)
                    </span>
                    <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono text-zinc-400">3 Active Vars</span>
                  </h4>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {[
                      { key: "SERVER_MEMORY", value: "8192", help: "定义 JVM 的最大内存限制 (-Xmx)", meta: "MB (兆字节)" },
                      { key: "SERVER_JARFILE", value: "server.jar", help: "服务端核心文件的名称，必须存在于根目录中。", meta: "File Path" },
                      { key: "MINECRAFT_VERSION", value: "1.20.4", help: "如果使用了自动更新镜像，此变量将决定下载的版本。", meta: "Version String" },
                    ].map((item) => (
                      <div key={item.key} className="group/var rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]">
                        <label className="mb-2 flex items-center justify-between font-mono text-xs font-bold text-zinc-400">
                          <span className="text-emerald-400">{item.key}</span>
                          <span className="text-[10px] text-zinc-500">{item.meta}</span>
                        </label>
                        <input
                          type="text"
                          defaultValue={item.value}
                          className="w-full rounded-lg border border-white/10 bg-[#0a0a0c] px-3 py-2 text-sm font-mono text-zinc-200 transition-colors focus:border-emerald-500 focus:outline-none group-hover/var:border-emerald-500/30"
                        />
                        <p className="mt-2 text-[10px] text-zinc-600">{item.help}</p>
                      </div>
                    ))}

                    <div className="group/addvar flex h-[116px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-4 text-center transition-colors hover:border-white/30 hover:bg-white/[0.03]">
                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors group-hover/addvar:bg-emerald-500/20">
                        <Plus className="h-4 w-4 text-zinc-500 transition-colors group-hover/addvar:text-emerald-400" />
                      </div>
                      <span className="text-xs font-bold text-zinc-400 group-hover/addvar:text-zinc-300">添加自定义变量</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {instanceActiveTab === "backups" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all hover:border-purple-500/30">
              <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-purple-500/10 blur-[80px] transition-all group-hover:bg-purple-500/20" />
              <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3.5 shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                    <Database className="h-8 w-8 text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.8)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">云端备份中心 <span className="rounded border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-300">AWS S3</span></h3>
                    <div className="mb-2 mt-1 text-xs text-zinc-400">已使用 2.3 GB · 自动快照受跨区域灾难恢复保护</div>
                    <div className="flex w-full items-center gap-4 md:w-64">
                      <div className="h-2 flex-1 overflow-hidden rounded-full border border-white/[0.05] bg-white/[0.03]">
                        <div className="relative h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" style={{ width: "40%" }}>
                          <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-white/20" style={{ backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }} />
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-purple-400 drop-shadow-[0_0_2px_rgba(192,132,252,0.5)]">2 / 5 槽位</span>
                    </div>
                  </div>
                </div>
                <button className="group/btn flex items-center justify-center gap-2 rounded-xl border border-purple-500/50 bg-purple-500/20 px-6 py-3 text-sm font-bold text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all hover:bg-purple-500 hover:text-white hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]">
                  <Plus className="h-4 w-4 transition-transform group-hover/btn:rotate-90" /> 创建新快照 (Create Backup)
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                { name: "Auto-Backup-20240312", size: "1.2 GB", date: "昨天 04:00", type: "自动 (Cron)", icon: Calendar, colorBorder: "border-blue-500", colorText: "text-blue-400", colorBg: "bg-blue-500", shadow: "shadow-[0_0_10px_rgba(59,130,246,0.8)]" },
                { name: "Before-Update-Modpack", size: "1.1 GB", date: "3 天前", type: "手动触发", icon: Database, colorBorder: "border-purple-500", colorText: "text-purple-400", colorBg: "bg-purple-500", shadow: "shadow-[0_0_10px_rgba(168,85,247,0.8)]" },
              ].map((backup) => {
                const Icon = backup.icon;
                return (
                  <div key={backup.name} className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/5 bg-black/40 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-colors hover:border-white/10 sm:flex-row sm:items-center">
                    <div className={`absolute bottom-0 left-0 top-0 w-1 opacity-0 transition-opacity group-hover:opacity-100 ${backup.colorBg} ${backup.shadow}`} />
                    <div className="flex items-center gap-5">
                      <div className={`rounded-xl border p-3 ${backup.colorBg}/10 ${backup.colorBorder}/20`}>
                        <Icon className={`h-5 w-5 ${backup.colorText} drop-shadow-[0_0_5px_currentColor]`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 text-base font-bold text-white">
                          {backup.name}
                          <span className={`rounded border px-2 py-0.5 text-[10px] font-mono ${backup.colorBg}/10 ${backup.colorText} ${backup.colorBorder}/20 shadow-[0_0_5px_currentColor]`}>
                            {backup.type}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-xs font-mono text-zinc-500">
                          <span className="flex items-center gap-1.5"><HardDrive className="h-3 w-3" /> {backup.size}</span>
                          <span className="h-1 w-1 rounded-full bg-zinc-700" />
                          <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {backup.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 transition-opacity sm:mt-0 sm:opacity-0 sm:group-hover:opacity-100">
                      <button className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white">
                        <RotateCcw className="h-3.5 w-3.5" /> 恢复 (Restore)
                      </button>
                      <button className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-400 transition-all hover:bg-blue-500 hover:text-white">
                        <HardDrive className="h-3.5 w-3.5" /> 下载 (Download)
                      </button>
                      <button className="rounded-lg border border-white/5 bg-zinc-800 px-3 py-2 text-zinc-400 transition-all hover:border-red-500 hover:bg-red-500 hover:text-white">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {instanceActiveTab === "logs" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <History className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white">System Activity Log</h3>
                  <p className="mt-0.5 text-xs font-mono text-zinc-500">Tracking all administrative actions & events</p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <select className="cursor-pointer appearance-none rounded-xl border border-white/10 bg-black/60 py-2 pl-9 pr-8 text-xs font-bold text-zinc-300 transition-colors focus:border-blue-500/50 focus:outline-none">
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                  </select>
                </div>
                <button className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/10">
                  <RefreshCw className="h-4 w-4" /> 刷新
                </button>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="w-full overflow-x-auto">
                <table className="min-w-[800px] w-full text-left text-sm">
                  <thead className="border-b border-white/5 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="px-6 py-4">时间戳 (UTC)</th>
                      <th className="px-6 py-4">事件类型</th>
                      <th className="px-6 py-4">操作来源</th>
                      <th className="px-6 py-4">详细信息</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs text-zinc-300">
                    {[
                      { date: "2024-03-12", time: "14:23:01", icon: Play, color: "emerald", label: "启动服务器", source: "game_master99", desc: "[Web Panel] 手动触发面板启动按钮", avatar: true },
                      { date: "2024-03-12", time: "04:00:00", icon: Database, color: "purple", label: "创建备份", source: "System (Cron)", desc: "Auto-Backup-20240312 (1.2GB)", avatar: false },
                      { date: "2024-03-11", time: "22:15:42", icon: Terminal, color: "blue", label: "执行指令", source: "game_master99", desc: "/op steve_miner", avatar: true, code: true },
                      { date: "2024-03-11", time: "21:00:10", icon: RotateCcw, color: "yellow", label: "重启服务器", source: "game_master99", desc: "[Web Panel] 面板点击重启", avatar: true },
                      { date: "2024-03-11", time: "19:45:00", icon: ShieldBan, color: "red", label: "封禁玩家", source: "Anti-Cheat", desc: "hacker_dude123 (Reason: Fly Hack)", avatar: false },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      const chipClass =
                        item.color === "emerald"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : item.color === "purple"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : item.color === "blue"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : item.color === "yellow"
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20";

                      return (
                        <tr key={`${item.date}-${item.time}-${index}`} className="group/row transition-colors hover:bg-white/[0.02]">
                          <td className="whitespace-nowrap px-6 py-4 text-zinc-500">
                            <div className="flex flex-col">
                              <span className="text-zinc-300">{item.date}</span>
                              <span className="text-[10px]">{item.time}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${chipClass}`}>
                              <Icon className="h-3 w-3" /> {item.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {item.avatar ? (
                              <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded border border-white/10 bg-zinc-800">
                                  <img src="https://minotar.net/helm/game_master99/32.png" alt="User" className="h-5 w-5 rounded-sm" style={{ imageRendering: "pixelated" }} onError={(event) => { event.currentTarget.style.display = "none"; }} />
                                </div>
                                <span className="font-sans font-bold text-white">{item.source}</span>
                              </div>
                            ) : item.source === "System (Cron)" ? (
                              <div className="flex items-center gap-2 font-sans text-purple-400">
                                <Monitor className="h-4 w-4" />
                                <span className="font-bold">{item.source}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 font-sans text-red-400">
                                <ShieldCheck className="h-4 w-4" />
                                <span className="font-bold">{item.source}</span>
                              </div>
                            )}
                          </td>
                          <td className="max-w-[250px] px-6 py-4 text-zinc-400">
                            {item.code ? (
                              <div className="inline-block truncate rounded border border-white/5 bg-black/50 px-2 py-1 font-mono text-[10px] text-emerald-400 transition-colors group-hover/row:border-emerald-500/30">{item.desc}</div>
                            ) : (
                              <div className="truncate transition-colors group-hover/row:text-zinc-200">{item.desc}</div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 bg-white/[0.01] px-6 py-3 text-xs text-zinc-500">
                <span>Showing 1 to 5 of 128 entries</span>
                <div className="flex gap-1">
                  <button className="rounded bg-white/5 px-3 py-1 transition-colors hover:bg-white/10 disabled:opacity-50">Prev</button>
                  <button className="rounded bg-blue-500/20 px-3 py-1 text-blue-400 transition-colors">1</button>
                  <button className="rounded bg-white/5 px-3 py-1 transition-colors hover:bg-white/10">2</button>
                  <button className="rounded bg-white/5 px-3 py-1 transition-colors hover:bg-white/10">3</button>
                  <span className="px-2">...</span>
                  <button className="rounded bg-white/5 px-3 py-1 transition-colors hover:bg-white/10">Next</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {instanceActiveTab === "versions" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-black/40">
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5" />
              <div className="absolute left-0 top-0 z-10 h-full w-1 bg-emerald-500 shadow-[0_0_15px_rgba(52,211,153,1)]" />
              <div className="relative z-10 flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center md:p-8">
                <div className="flex items-start gap-5">
                  <div className="rounded-2xl border border-emerald-500/30 bg-black/60 p-4 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                    <GitBranch className="h-8 w-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  </div>
                  <div>
                    <h3 className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">当前核心系统 (Active Core)</h3>
                    <div className="flex items-center gap-3 text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                      PaperMC 1.20.4
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-mono text-emerald-400"><ShieldCheck className="h-3 w-3" /> 官方受支持版本</span>
                      <span className="text-xs font-mono text-zinc-500">Build #496 (Latest)</span>
                    </div>
                  </div>
                </div>
                <button className="group/update flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/20 px-6 py-3 text-sm font-bold text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-all hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_25px_rgba(52,211,153,0.6)]">
                  <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover/update:rotate-180" /> 检查并一键更新 (Check Update)
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/40 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-bold text-white">
                  <Database className="h-4 w-4 text-blue-400" /> 切换服务端核心分支 (Switch Core Branch)
                </h4>
                <div className="flex items-center gap-1.5 rounded border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold text-red-400">
                  <AlertTriangle className="h-3 w-3" /> 切换核心可能会导致数据丢失，请先备份
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="group relative overflow-hidden rounded-xl border border-emerald-500/50 bg-black/60 p-5 shadow-[0_0_15px_rgba(52,211,153,0.1)] transition-colors hover:border-emerald-400">
                  <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-xl border-b border-l border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-400"><CheckCircle2 className="h-3 w-3" /> 正在使用</div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10"><Terminal className="h-5 w-5 text-emerald-400" /></div>
                    <div>
                      <div className="text-lg font-bold text-white transition-colors group-hover:text-emerald-400">PaperMC</div>
                      <div className="text-[10px] font-mono text-zinc-500">Spigot Fork</div>
                    </div>
                  </div>
                  <p className="line-clamp-2 h-8 text-xs leading-relaxed text-zinc-400">业界标准的高性能服务端，修复了大量漏洞，提供极致的插件兼容性与流畅度。</p>
                </div>

                {[
                  { name: "Purpur", meta: "Paper Fork", icon: Settings2, accent: "purple", desc: "在 Paper 基础上提供海量自定义游戏机制选项，可修改实体 AI 与游戏特性。" },
                  { name: "Forge", meta: "Modded Core", icon: Layers, accent: "orange", desc: "最老牌的模组服务端，支持复杂的工业、魔法等大型重量级模组。" },
                  { name: "Fabric", meta: "Modded Core", icon: Feather, accent: "blue", desc: "轻量级新兴模组端，更新速度极快，主要用于生化、辅助类等轻度模组。" },
                  { name: "Vanilla (原版)", meta: "Mojang Official", icon: Database, accent: "white", desc: "官方提供的纯净原版服务端核心，不支持任何插件与模组。" },
                ].map((core) => {
                  const Icon = core.icon;
                  const accentClass =
                    core.accent === "purple"
                      ? "hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                      : core.accent === "orange"
                        ? "hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                        : core.accent === "blue"
                          ? "hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                          : "hover:border-zinc-300/50";
                  const iconClass =
                    core.accent === "purple"
                      ? "group-hover:text-purple-400"
                      : core.accent === "orange"
                        ? "group-hover:text-orange-400"
                        : core.accent === "blue"
                          ? "group-hover:text-blue-400"
                          : "group-hover:text-white";
                  const btnClass =
                    core.accent === "purple"
                      ? "bg-purple-500 hover:bg-purple-400"
                      : core.accent === "orange"
                        ? "bg-orange-500 hover:bg-orange-400"
                        : core.accent === "blue"
                          ? "bg-blue-500 hover:bg-blue-400"
                          : "bg-white hover:bg-zinc-200 text-black";

                  return (
                    <div key={core.name} className={`group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-black/40 p-5 transition-colors ${accentClass}`}>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 bg-white/5 transition-colors">
                          <Icon className={`h-5 w-5 text-zinc-500 transition-colors ${iconClass}`} />
                        </div>
                        <div>
                          <div className={`text-lg font-bold text-white transition-colors ${iconClass}`}>{core.name}</div>
                          <div className="text-[10px] font-mono text-zinc-500">{core.meta}</div>
                        </div>
                      </div>
                      <p className="line-clamp-2 h-8 text-xs leading-relaxed text-zinc-400">{core.desc}</p>
                      <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-end border-t border-white/10 bg-black/80 p-3 backdrop-blur-sm transition-transform group-hover:translate-y-0">
                        <button className={`rounded px-3 py-1.5 text-xs font-bold text-white transition-colors ${btnClass}`}>安装此核心</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {instanceActiveTab === "management" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl border border-zinc-700/50 bg-black/40 p-6 shadow-2xl backdrop-blur-xl md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl border border-white/10 bg-zinc-800/50 p-4 shadow-inner">
                  <Server className="h-8 w-8 text-zinc-400" />
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-white">实例管理面板 (Instance Administration)</h3>
                  <p className="mt-1 text-xs text-zinc-500">UUID: <span className="rounded bg-white/5 px-1.5 font-mono text-zinc-400">{instance.id}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-6 rounded-xl border border-white/10 bg-white/5 px-6 py-3">
                <div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">当前操作状态</div>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {instance.status === "running" ? (
                      <><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> <span className="text-emerald-400">运行中 (Active)</span></>
                    ) : instance.status === "stopped" ? (
                      <><span className="h-2 w-2 rounded-full bg-red-400" /> <span className="text-red-400">已停止 (Stopped)</span></>
                    ) : (
                      <><span className="h-2 w-2 animate-pulse rounded-full bg-orange-400" /> <span className="text-orange-400">处理中 (Processing)</span></>
                    )}
                  </div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">到期时间</div>
                  <div className="text-sm font-bold font-mono text-zinc-300">2026-10-15</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-black/40 p-6 shadow-2xl backdrop-blur-xl">
                <h4 className="mb-6 flex items-center justify-between border-b border-white/10 pb-4 text-sm font-bold text-white">
                  <span className="flex items-center gap-2"><Cpu className="h-4 w-4 text-blue-400" /> 基础设施参数 (Infrastructure)</span>
                  <button className="rounded border border-white/5 bg-white/5 px-2 py-1 text-[10px] text-zinc-400 transition-colors hover:bg-white/10">刷新信息</button>
                </h4>
                <div className="space-y-4">
                  {[
                    { label: "Docker 容器 ID", value: "fc8d132a-9e11-4f90...", icon: Layers, copyable: true },
                    { label: "存储卷挂载点 (Volume)", value: `vol_user_data_${instance.id.substring(0, 8)}`, icon: HardDrive, copyable: true },
                    { label: "备份池分配 (Backup Pool)", value: "aws_s3_ap-northeast-1_b2", icon: Database },
                    { label: "分配内网 IP (Pterodactyl Node)", value: "172.18.0.5", icon: Network, highlight: true },
                  ].map((row) => {
                    const Icon = row.icon;
                    return (
                      <div key={row.label} className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/[0.02]">
                        <span className="flex items-center gap-2 text-xs font-bold text-zinc-500"><Icon className="h-3.5 w-3.5" /> {row.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`rounded border px-2 py-1 text-xs font-mono ${row.highlight ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-white/5 bg-black/50 text-zinc-300"}`}>{row.value}</span>
                          {row.copyable ? <button className="text-zinc-600 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"><Copy className="h-3.5 w-3.5" /></button> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-black/40 p-6 shadow-2xl backdrop-blur-xl">
                <h4 className="mb-6 flex items-center justify-between border-b border-white/10 pb-4 text-sm font-bold text-white">
                  <span className="flex items-center gap-2"><Users className="h-4 w-4 text-purple-400" /> 归属与账单 (Ownership)</span>
                  <button className="rounded border border-white/5 bg-white/5 px-2 py-1 text-[10px] text-zinc-400 transition-colors hover:bg-white/10">转移所有权</button>
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-purple-500/10 bg-purple-500/5 p-3">
                    <span className="flex items-center gap-2 text-xs font-bold text-purple-400/80"><Users className="h-3.5 w-3.5" /> 所属用户 (Owner)</span>
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-purple-500/20 text-[10px] font-bold text-purple-400">U</div>
                      <span className="text-sm font-bold text-white">{instance.userId}</span>
                      <ArrowRight className="h-3.5 w-3.5 cursor-pointer text-zinc-500 transition-colors hover:text-white" title="查看用户详情" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/[0.02]">
                    <span className="flex items-center gap-2 text-xs font-bold text-zinc-500"><Calendar className="h-3.5 w-3.5" /> 实例创建时间</span>
                    <span className="text-xs font-mono text-zinc-300">2024-03-01 14:22:05</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/[0.02]">
                    <span className="flex items-center gap-2 text-xs font-bold text-zinc-500"><Activity className="h-3.5 w-3.5" /> 计费套餐 (Plan)</span>
                    <span className="rounded border border-white/10 bg-white/10 px-2 py-1 text-xs font-bold text-white">{instance.planName ?? "未指定方案"} (${instance.price}/mo)</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/[0.02]">
                    <span className="flex items-center gap-2 text-xs font-bold text-zinc-500"><Globe className="h-3.5 w-3.5" /> 运行节点 (Node Allocation)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-300">{instance.node}</span>
                      <button className="rounded border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-400 transition-colors hover:bg-blue-500 hover:text-white">迁移</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <h4 className="mb-6 flex items-center gap-2 border-b border-red-500/20 pb-4 text-sm font-bold text-red-400">
                <ShieldAlert className="h-4 w-4" /> 危险操作与强制管理 (Administrative Danger Zone)
              </h4>
              <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { title: "挂起实例 (Suspend)", text: "冻结该实例的运行，并在用户面板中显示锁定状态。通常用于欠费处理。", icon: Power, accent: "orange", button: "立即挂起实例" },
                  { title: "强制重装 (Reinstall)", text: "删除所有文件（除非加入排除名单）并重新运行安装脚本下载核心文件。", icon: RefreshCw, accent: "yellow", button: "执行破坏性重装" },
                  { title: "彻底销毁 (Delete)", text: "从数据库和节点中永久删除此容器及所有相关数据卷。此操作不可逆。", icon: Trash2, accent: "red", button: "永久销毁实例", danger: true },
                ].map((card) => {
                  const Icon = card.icon;
                  const accentClass =
                    card.accent === "orange"
                      ? "border-orange-500/20 hover:border-orange-500/50 text-orange-400 bg-orange-500/10 hover:bg-orange-500"
                      : card.accent === "yellow"
                        ? "border-yellow-500/20 hover:border-yellow-500/50 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500"
                        : "border-red-500/30 hover:border-red-500/70 text-red-500 bg-red-500/20 hover:bg-red-500";

                  return (
                    <div key={card.title} className={`flex h-[140px] flex-col justify-between rounded-xl border bg-black/60 p-5 transition-all ${card.danger ? "hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]" : ""} ${card.accent === "orange" ? "border-orange-500/20 hover:border-orange-500/50" : card.accent === "yellow" ? "border-yellow-500/20 hover:border-yellow-500/50" : "border-red-500/30 hover:border-red-500/70"}`}>
                      <div>
                        <div className={`mb-1 flex items-center gap-2 font-bold ${card.accent === "orange" ? "text-orange-400" : card.accent === "yellow" ? "text-yellow-400" : "text-red-500"}`}>
                          <Icon className="h-4 w-4" /> {card.title}
                        </div>
                        <div className="text-[10px] leading-relaxed text-zinc-400">{card.text}</div>
                      </div>
                      <button className={`w-full rounded-lg border py-2 text-xs font-bold transition-colors hover:text-white ${accentClass} ${card.accent === "yellow" ? "hover:text-black" : ""}`}>
                        {card.button}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </>
    </motion.div>
  );
}

export function AdminDashboardInstancesTab({
  instances,
  isInstancesLoading,
  instancesLoadError,
  selectedInstanceId,
  instanceActiveTab,
  onSelectInstance,
  onCloseInstanceDetail,
  onSetInstanceActiveTab,
}: AdminDashboardInstancesTabProps) {
  const selectedInstance = selectedInstanceId
    ? instances.find((instance) => instance.id === selectedInstanceId) ?? null
    : null;

  const handleOpenInstance = (instanceId: string) => {
    onSetInstanceActiveTab("console");
    onSelectInstance(instanceId);
  };

  const runningCount = instances.filter((instance) => instance.status === "running").length;
  const stoppedCount = instances.filter((instance) => instance.status === "stopped").length;
  const installingCount = instances.filter((instance) => instance.status === "installing").length;
  const alertCount = instances.filter((instance) => instance.cpuUsage > 90 || instance.memUsage > 90).length;

  if (selectedInstance) {
    return (
      <AdminDashboardInstanceDetail
        instance={selectedInstance}
        instanceActiveTab={instanceActiveTab}
        onCloseInstanceDetail={onCloseInstanceDetail}
        onSetInstanceActiveTab={onSetInstanceActiveTab}
      />
    );
  }

  return (
    <motion.div
      key="instances"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full"
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 pb-20">
        <div className="flex flex-col justify-between gap-4 border-b border-zinc-800/80 pb-6 md:flex-row md:items-center">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-semibold text-zinc-100">
              <Terminal className="h-5 w-5 text-zinc-400" />
              Game Instances
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500">Monitor and manage containerized game servers globally.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 shadow-sm transition-colors hover:bg-zinc-800"
            >
              <RefreshCw className="h-4 w-4" /> Sync
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-bold text-zinc-900 shadow-sm transition-colors hover:bg-white"
            >
              <Plus className="h-4 w-4" /> Deploy Instance
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="flex flex-col gap-4 rounded-xl border border-zinc-800/80 bg-[#0c0c0e] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Running</span>
              </div>
              <Activity className="h-4 w-4 text-zinc-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-zinc-100">{runningCount}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-zinc-800/80 bg-[#0c0c0e] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-zinc-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Stopped</span>
              </div>
              <Power className="h-4 w-4 text-zinc-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-zinc-100">{stoppedCount}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-zinc-800/80 bg-[#0c0c0e] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pending</span>
              </div>
              <RefreshCw className="h-4 w-4 text-zinc-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-zinc-100">{installingCount}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-zinc-800/80 bg-[#0c0c0e] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Impaired</span>
              </div>
              <AlertTriangle className="h-4 w-4 text-zinc-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-zinc-100">{alertCount}</span>
            </div>
          </div>
        </div>

        {instancesLoadError ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">加载实例失败：{instancesLoadError}</div>
        ) : null}

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by instance ID, node, or status..."
              className="w-full rounded-lg border border-zinc-800/80 bg-[#0a0a0c] py-2.5 pl-10 pr-4 text-sm text-zinc-200 shadow-inner transition-all placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500/50"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-[#0a0a0c] px-4 py-2.5 text-sm font-medium text-zinc-300 shadow-sm transition-colors hover:border-zinc-600"
            >
              <ListFilter className="h-4 w-4" /> Filters
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-800/80 bg-[#0a0a0c] p-2.5 text-zinc-300 shadow-sm transition-colors hover:border-zinc-600"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-[#0c0c0e] shadow-sm">
          <div className="sticky top-0 z-20 grid grid-cols-[180px_1fr_120px_160px_140px_140px_100px] items-center gap-4 border-b border-zinc-800/80 bg-[#111]/50 p-4 text-[12px] font-semibold uppercase tracking-wider text-zinc-500 select-none">
            <div>Instance ID</div>
            <div>Identifier / Owner</div>
            <div>Status</div>
            <div>Datacenter</div>
            <div>CPU Usage</div>
            <div>Memory Usage</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="flex flex-col divide-y divide-zinc-800/40 bg-[#0a0a0c]">
            {isInstancesLoading ? (
              <div className="p-12 text-center text-sm text-zinc-500">正在加载实例监控数据...</div>
            ) : instances.length === 0 ? (
              <div className="p-12 text-center text-sm text-zinc-500">目前没有可显示的实例。</div>
            ) : (
              instances.map((instance) => (
                <div
                  key={instance.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenInstance(instance.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenInstance(instance.id);
                    }
                  }}
                  className="grid cursor-pointer grid-cols-[180px_1fr_120px_160px_140px_140px_100px] items-center gap-4 px-4 py-3.5 transition-colors group hover:bg-zinc-800/30"
                >
                  <div className="flex items-center gap-2 font-mono text-sm text-zinc-400 transition-colors group-hover:text-zinc-200">
                    <HardDrive className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400" />
                    {instance.id}
                  </div>

                  <div className="flex min-w-0 flex-col justify-center">
                    <div className="flex items-center gap-2 truncate text-sm font-semibold text-zinc-200">
                      {instance.game}
                      {instance.status === "running" ? (
                        <span className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-zinc-400">PROD</span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 truncate font-mono text-xs text-zinc-500">
                      <Users2 className="h-3 w-3 text-zinc-600" /> {instance.userId}
                    </div>
                  </div>

                  <div>
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold ${
                        instance.status === "running"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : instance.status === "stopped"
                            ? "border-zinc-700 bg-zinc-800 text-zinc-400"
                            : "border-orange-500/20 bg-orange-500/10 text-orange-400"
                      }`}
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          instance.status === "running"
                            ? "bg-emerald-500"
                            : instance.status === "stopped"
                              ? "bg-zinc-500"
                              : "bg-orange-500"
                        }`}
                      />
                      {instance.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    <span className="truncate text-[13px] text-zinc-300">{instance.node}</span>
                  </div>

                  <div className="flex flex-col justify-center gap-1.5 pr-6">
                    <div className="flex justify-between font-mono text-[11px] text-zinc-400">
                      <span>CPU</span>
                      <span>{instance.cpuUsage}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
                      <div
                        className={`h-full rounded-full ${instance.cpuUsage > 80 ? "bg-red-400" : "bg-zinc-400"}`}
                        style={{ width: `${instance.cpuUsage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-1.5 pr-6">
                    <div className="flex justify-between font-mono text-[11px] text-zinc-400">
                      <span>RAM</span>
                      <span>{instance.memUsage}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
                      <div
                        className={`h-full rounded-full ${instance.memUsage > 80 ? "bg-orange-400" : "bg-zinc-400"}`}
                        style={{ width: `${instance.memUsage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <ChevronRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-zinc-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
