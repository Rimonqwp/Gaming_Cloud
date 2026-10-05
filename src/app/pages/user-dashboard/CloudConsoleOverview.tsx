import { useId, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpDown,
  ChartNoAxesColumnIncreasing,
  Check,
  Clock3,
  Copy,
  CreditCard,
  FileText,
  Info,
  List,
  MoreHorizontal,
  Plus,
  Power,
  Search,
  Server,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import type { UserDashboardTabId } from "../../config/userDashboardNavTabs";
import type { DashboardUser } from "./userDashboardTypes";

type CloudServer = {
  id: string;
  name: string;
  cpuCount: number;
  ram: number;
  disk: number;
  region: string;
  location: string;
  flag: string;
  ip: string;
  cpu: number;
  memory: number;
  running: boolean;
};
const initialServers: CloudServer[] = [
  {
    id: "ins-b7f2a9d1",
    name: "web-prod-01",
    cpuCount: 4,
    ram: 8,
    disk: 80,
    region: "新加坡",
    location: "Asia Pacific (SG)",
    flag: "sg",
    ip: "203.0.113.10",
    cpu: 24,
    memory: 40,
    running: true,
  },
  {
    id: "ins-c3e9f4b2",
    name: "api-prod-02",
    cpuCount: 2,
    ram: 4,
    disk: 60,
    region: "香港",
    location: "Asia Pacific (HK)",
    flag: "hk",
    ip: "203.0.113.11",
    cpu: 38,
    memory: 56,
    running: true,
  },
  {
    id: "ins-9a2d1e7c",
    name: "dev-ubuntu",
    cpuCount: 2,
    ram: 4,
    disk: 40,
    region: "东京",
    location: "Asia Pacific (JP)",
    flag: "jp",
    ip: "203.0.113.12",
    cpu: 0,
    memory: 0,
    running: false,
  },
];
const chartData = [
  { time: "00:00", cpu: 30, memory: 20 },
  { time: "02:00", cpu: 25, memory: 23 },
  { time: "04:00", cpu: 20, memory: 33 },
  { time: "06:00", cpu: 49, memory: 31 },
  { time: "08:00", cpu: 44, memory: 35 },
  { time: "10:00", cpu: 35, memory: 54 },
  { time: "12:00", cpu: 42, memory: 63 },
  { time: "14:00", cpu: 52, memory: 80 },
  { time: "16:00", cpu: 38, memory: 40 },
  { time: "18:00", cpu: 27, memory: 20 },
  { time: "20:00", cpu: 42, memory: 27 },
  { time: "22:00", cpu: 68, memory: 39 },
  { time: "24:00", cpu: 64, memory: 43 },
];

export function CloudUsageChart() {
  const [metric, setMetric] = useState<"cpu" | "memory">("cpu");
  const [period, setPeriod] = useState("24");
  const gradientId = useId().replace(/:/g, "");
  const data = useMemo(
    () =>
      chartData
        .map((row, i) => ({
          ...row,
          time:
            period === "month"
              ? `10/${String(i + 1).padStart(2, "0")}`
              : row.time,
        }))
        .slice(0, period === "month" ? 5 : 13),
    [period],
  );
  return (
    <section
      className="cloud-panel cloud-chart-panel"
      aria-label="资源使用趋势"
    >
      <div className="cloud-panel-title">
        <h2>资源使用趋势</h2>
        <div className="cloud-chart-tabs" role="group" aria-label="监控指标">
          <button
            className={metric === "cpu" ? "active" : ""}
            onClick={() => setMetric("cpu")}
          >
            CPU 使用率
          </button>
          <button
            className={metric === "memory" ? "active" : ""}
            onClick={() => setMetric("memory")}
          >
            内存使用率
          </button>
        </div>
      </div>
      <div className="cloud-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`${gradientId}-blue`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#0866ff" stopOpacity={0.14} />
                <stop offset="100%" stopColor="#0866ff" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient
                id={`${gradientId}-teal`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#00c9b0" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#00c9b0" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#dfe9f6" strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#607ba6", fontSize: 12 }}
              interval={0}
              ticks={
                period === "month"
                  ? undefined
                  : ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
              }
              tickMargin={13}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              width={50}
              tick={{ fill: "#607ba6", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value}%`,
                name === "cpu" ? "CPU 使用率" : "内存使用率",
              ]}
              contentStyle={{
                borderRadius: 8,
                borderColor: "#dce8f6",
                color: "#102145",
              }}
            />
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey={metric === "cpu" ? "memory" : "cpu"}
              stroke={metric === "cpu" ? "#00c9b0" : "#0866ff"}
              strokeWidth={2}
              fill={`url(#${gradientId}-${metric === "cpu" ? "teal" : "blue"})`}
            />
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey={metric}
              stroke={metric === "cpu" ? "#0866ff" : "#00c9b0"}
              strokeWidth={2}
              fill={`url(#${gradientId}-${metric === "cpu" ? "blue" : "teal"})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="cloud-chart-footer">
        <div className="cloud-chart-legend">
          <span>
            <i className="cpu" />
            CPU 使用率（平均）
          </span>
          <span>
            <i className="memory" />
            内存使用率（平均）
          </span>
        </div>
        <select
          aria-label="监控时间范围"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="24">近 24 小时</option>
          <option value="month">本月趋势</option>
        </select>
      </div>
    </section>
  );
}

function Status({ running }: { running: boolean }) {
  return (
    <span className={`cloud-status ${running ? "running" : "stopped"}`}>
      <i />
      {running ? "运行中" : "已停止"}
    </span>
  );
}

export function CloudBillPanel({
  onSelectTab,
}: {
  onSelectTab: (tab: UserDashboardTabId) => void;
}) {
  return (
    <section className="cloud-panel cloud-bill-panel">
      <div className="cloud-panel-title">
        <h2>本月账单</h2>
        <button className="cloud-link" onClick={() => onSelectTab("billing")}>
          查看账单 <ArrowRight size={16} />
        </button>
      </div>
      <div className="cloud-bill-amount">$36.80</div>
      <p className="cloud-bill-period">计费周期: 2026-10-01 至 2026-10-31</p>
      <dl className="cloud-bill-details">
        <div>
          <dt>
            <Clock3 />
            下次续费时间
          </dt>
          <dd>2026-10-20</dd>
        </div>
        <div>
          <dt>
            <FileText />
            账单状态
          </dt>
          <dd>
            <span className="cloud-bill-status">正常</span>
          </dd>
        </div>
        <div>
          <dt>
            <CreditCard />
            支付方式
          </dt>
          <dd>•••• 4242</dd>
        </div>
        <div>
          <dt>
            <List />
            资源合计
          </dt>
          <dd>3 个实例</dd>
        </div>
      </dl>
    </section>
  );
}

export function CloudConsoleOverview({
  dashboardUser,
  onSelectTab,
  mode = "overview",
}: {
  dashboardUser: DashboardUser;
  onSelectTab: (tab: UserDashboardTabId) => void;
  mode?: "overview" | "instances";
}) {
  const [servers, setServers] = useState(initialServers);
  const [query, setQuery] = useState("");
  const [sortAscending, setSortAscending] = useState<boolean | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState("");
  const selected = servers.find((server) => server.id === selectedId);
  const filtered = servers
    .filter((server) =>
      `${server.name} ${server.ip} ${server.region}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sortAscending === null
        ? 0
        : a.name.localeCompare(b.name) * (sortAscending ? 1 : -1),
    );
  const toggleServer = (server: CloudServer) =>
    setServers((current) =>
      current.map((row) =>
        row.id === server.id
          ? { ...row, running: !row.running, cpu: 0, memory: 0 }
          : row,
      ),
    );
  async function copyIp(server: CloudServer) {
    try {
      await navigator.clipboard.writeText(server.ip);
      setCopied(server.id);
      setCopyError("");
    } catch {
      setCopyError("复制失败，请选择并复制 IP 地址。");
    }
  }
  return (
    <div className="cloud-overview">
      {mode === "instances" && (
        <div className="cloud-page-heading">
          <div>
            <h1>云服务器</h1>
            <p>管理你的全部云服务器实例</p>
          </div>
          <Link className="cloud-primary" to="/deploy">
            <Plus size={23} />
            创建云服务器
          </Link>
        </div>
      )}
      {mode === "overview" && (
        <>
          <button
            className="cloud-maintenance"
            onClick={() => setMaintenanceOpen(true)}
          >
            <AlertTriangle size={25} />
            <strong>新加坡节点维护</strong>
            <span>
              ·　10月9日 02:00（SGT）进行网络设备维护，预计持续 15
              分钟，期间可能出现短暂网络波动。
            </span>
            <time>2026-10-05 10:00 · 新加坡（SGT）</time>
          </button>
          <section className="cloud-summary" aria-label="账户概况">
            <div className="cloud-stat">
              <span className="cloud-stat-icon">
                <Server />
              </span>
              <div>
                <p>运行中实例</p>
                <strong>
                  {servers.filter((s) => s.running).length}
                  <small>个</small>
                </strong>
              </div>
            </div>
            <div className="cloud-stat">
              <span className="cloud-stat-icon">
                <ChartNoAxesColumnIncreasing />
              </span>
              <div>
                <p>本月流量</p>
                <strong>
                  1.2<small>TB</small>
                </strong>
              </div>
            </div>
            <div className="cloud-stat">
              <span className="cloud-stat-icon teal">
                <Wallet />
              </span>
              <div>
                <p>账户余额</p>
                <strong>${dashboardUser.balance.toFixed(2)}</strong>
              </div>
            </div>
            <button
              className="cloud-stat"
              onClick={() => onSelectTab("tickets")}
            >
              <span className="cloud-stat-icon">
                <FileText />
              </span>
              <div>
                <p>待处理工单</p>
                <strong>
                  1<small>个</small>
                </strong>
              </div>
            </button>
          </section>
        </>
      )}
      <section className="cloud-panel cloud-servers" aria-label="我的云服务器">
        <div className="cloud-table-heading">
          <h2>我的云服务器（{servers.length}）</h2>
          <label className="cloud-search">
            <Search size={20} />
            <input
              aria-label="搜索云服务器"
              placeholder="搜索实例名称或 IP 地址..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="cloud-table-scroll">
          <table>
            <colgroup>
              <col className="col-name" />
              <col className="col-status" />
              <col className="col-spec" />
              <col className="col-region" />
              <col className="col-ip" />
              <col className="col-usage" />
              <col className="col-action" />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <button
                    className="cloud-sort"
                    onClick={() =>
                      setSortAscending((current) =>
                        current === null ? true : !current,
                      )
                    }
                  >
                    实例名称
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th>状态</th>
                <th>配置</th>
                <th>地域</th>
                <th>公网 IP</th>
                <th>
                  CPU / 内存 <Info size={14} />
                </th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((server) => (
                <tr key={server.id}>
                  <td>
                    <div className="cloud-server-name">
                      <span className="cloud-server-icon">
                        <Server size={23} />
                      </span>
                      <div>
                        <button onClick={() => setSelectedId(server.id)}>
                          {server.name}
                        </button>
                        <small>{server.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Status running={server.running} />
                  </td>
                  <td>
                    <span className="cloud-spec">
                      {server.cpuCount} vCPU　{server.ram} GB
                    </span>
                    <small>{server.disk} GB SSD</small>
                  </td>
                  <td>
                    <div className="cloud-region">
                      <img
                        src={`/console/${server.flag}.png`}
                        alt={`${server.region}地区标识`}
                      />
                      <div>
                        {server.region}
                        <small>{server.location}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cloud-ip">
                      <span>{server.ip}</span>
                      <button
                        aria-label={`复制 ${server.ip}`}
                        onClick={() => copyIp(server)}
                      >
                        {copied === server.id ? (
                          <Check size={17} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="cloud-usages">
                      <div>
                        <span>{server.cpu}%</span>
                        <progress
                          max="100"
                          value={server.cpu}
                          aria-label={`${server.name} CPU 使用率`}
                        />
                      </div>
                      <div>
                        <span>{server.memory}%</span>
                        <progress
                          className="memory"
                          max="100"
                          value={server.memory}
                          aria-label={`${server.name} 内存使用率`}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cloud-row-actions">
                      <button
                        className="cloud-link"
                        onClick={() => setSelectedId(server.id)}
                      >
                        管理
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="cloud-more"
                            aria-label={`${server.name} 更多操作`}
                          >
                            <MoreHorizontal size={22} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="cloud-popover"
                        >
                          <DropdownMenuItem
                            onSelect={() => setSelectedId(server.id)}
                          >
                            查看实例详情
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => toggleServer(server)}
                          >
                            <Power size={15} />
                            {server.running ? "停止实例" : "启动实例"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => copyIp(server)}>
                            复制公网 IP
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td className="cloud-empty" colSpan={7}>
                    没有找到匹配的服务器。
                    <button className="cloud-link" onClick={() => setQuery("")}>
                      清除搜索
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <span className="cloud-sr-only" role="status">
          {copied ? "IP 地址已复制" : copyError}
        </span>
      </section>
      {mode === "overview" && (
        <div className="cloud-bottom-grid">
          <CloudUsageChart />
          <CloudBillPanel onSelectTab={onSelectTab} />
        </div>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent className="cloud-modal">
          <DialogTitle>{selected?.name}</DialogTitle>
          <DialogDescription>云服务器实例详情与运行状态</DialogDescription>
          {selected && (
            <>
              <Status running={selected.running} />
              <dl className="cloud-instance-details">
                <div>
                  <dt>实例 ID</dt>
                  <dd>{selected.id}</dd>
                </div>
                <div>
                  <dt>公网 IP</dt>
                  <dd>{selected.ip}</dd>
                </div>
                <div>
                  <dt>地域</dt>
                  <dd>
                    {selected.region} · {selected.location}
                  </dd>
                </div>
                <div>
                  <dt>配置</dt>
                  <dd>
                    {selected.cpuCount} vCPU · {selected.ram} GB 内存 ·{" "}
                    {selected.disk} GB SSD
                  </dd>
                </div>
                <div>
                  <dt>操作系统</dt>
                  <dd>Ubuntu 22.04 LTS</dd>
                </div>
              </dl>
              <button
                className="cloud-primary"
                onClick={() => toggleServer(selected)}
              >
                <Power size={17} />
                {selected.running ? "停止实例" : "启动实例"}
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
        <DialogContent className="cloud-modal">
          <DialogTitle>新加坡节点计划维护</DialogTitle>
          <DialogDescription>
            2026 年 10 月 9 日 02:00–02:15（SGT）
          </DialogDescription>
          <p>
            我们将对新加坡节点的网络设备进行维护。维护期间可能出现短暂网络波动，预计影响
            15 分钟。
          </p>
          <p>服务器数据不会受到影响。如需协助，请通过工单联系技术支持。</p>
          <button
            className="cloud-primary"
            onClick={() => {
              setMaintenanceOpen(false);
              onSelectTab("tickets");
            }}
          >
            联系技术支持 <ArrowRight size={16} />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
