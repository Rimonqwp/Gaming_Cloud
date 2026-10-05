import { useState } from "react";
import { Link } from "react-router";
import { AlertTriangle, ChevronRight, Gamepad2, Archive, Wallet, Activity } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import type { UserDashboardTabId } from "../../config/userDashboardNavTabs";
import { resourceMetrics, metricColors, gameRegions } from "./cloudDashboardData";
import { CostTrend, NetworkTraffic, ResourceUsage } from "./CloudDashboardCharts";
import { CloudDashboardInstances } from "./CloudDashboardInstances";
import "../../../styles/cloud-dashboard.css";

const metricIcons = [Gamepad2, Archive, Activity, Wallet];
const hongKongTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Hong_Kong",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const formatHongKongTime = (date: Date) => {
  const parts = Object.fromEntries(hongKongTimeFormatter.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
};

export function CloudDashboardOverview({ onSelectTab, mode = "overview", balance }: { balance: number; onSelectTab: (tab: UserDashboardTabId) => void; mode?: "overview" | "instances" }) {
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [detail, setDetail] = useState<{ title: string; description: string } | null>(null);
  const now = new Date();
  return <div className={`dash-overview${mode === "overview" ? " dash-overview-full" : ""}`}>
    {mode === "overview" ? <>
      <button className="cloud-maintenance" onClick={() => setMaintenanceOpen(true)}><AlertTriangle size={25} /><strong>新加坡游戏节点计划维护</strong><span>·　10月9日 02:00（HKT）维护 15 分钟，游戏连接可能短暂中断，请提前保存世界存档。</span><time dateTime={now.toISOString()}>{formatHongKongTime(now)} · 香港时间（HKT）</time></button>
      <section className="dash-metrics" aria-label="游戏托管概况">
        {resourceMetrics.map((metric, index) => {
          const Icon = metricIcons[index];
          const value = metric.title === "账户余额" ? balance.toFixed(2) : metric.value;
          const isServerMetric = metric.title === "游戏服务器";
          return <button key={metric.title} className={`dash-metric ${metric.tone}`} onClick={() => setDetail({ title: metric.title, description: `当前${metric.title}为 ${value} ${metric.unit}。${metric.description}` })}>
            {!isServerMetric && <span className="dash-metric-icon"><Icon /></span>}
            <div className="dash-metric-content">
              <h2>{metric.title}</h2>
              <strong>{value}<small>{metric.unit}</small></strong>
              {!isServerMetric && <p>{metric.summary}</p>}
            </div>
            <Icon className="dash-metric-decoration" />
            {!isServerMetric && <div className="dash-sparkline" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><AreaChart data={metric.points.map(value => ({ value }))}><Area dataKey="value" type="linear" stroke={metricColors[metric.tone]} strokeWidth={1.8} fill={metricColors[metric.tone]} fillOpacity={0.08} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>}
          </button>;
        })}
      </section>
      <div className="dash-monitor-grid">
        <ResourceUsage onMore={() => onSelectTab("instances")} />
        <CostTrend /><NetworkTraffic />
        <section className="dash-panel dash-health"><div className="dash-panel-heading"><h2>全球游戏节点状态</h2><div className="dash-health-legend"><span><i className="green" />正常 {gameRegions.filter(region => region.tone === "green").length}</span><span><i className="orange" />待维护 {gameRegions.filter(region => region.tone === "orange").length}</span></div></div><div className="dash-world-map"><img src="/console/world-map.png" alt="全球游戏托管节点分布地图" />{gameRegions.map(region => <div role="img" key={region.name} aria-label={`${region.name}（${region.city}）：${region.status}`} className={`dash-map-node ${region.tone} ${region.label}`} style={{ left: `${region.x}%`, top: `${region.y}%` }}><span className="dash-node-dot" /><span className="dash-node-label">{region.city}</span></div>)}</div></section>
      </div>
    </> : <div className="cloud-page-heading"><div><h1>游戏服务器</h1><p>管理你的游戏服务器、玩家连接与世界存档 · 演示数据</p></div><Link className="cloud-primary" to="/deploy">创建游戏服务器</Link></div>}
    <CloudDashboardInstances />
    <Dialog open={maintenanceOpen} onOpenChange={setMaintenanceOpen}><DialogContent className="cloud-modal"><DialogTitle>新加坡游戏节点计划维护</DialogTitle><DialogDescription>2026 年 10 月 9 日 02:00–02:15（HKT，香港时间）</DialogDescription><p>我们将维护新加坡游戏节点的网络设备。饥荒联机好友服的玩家连接可能短暂中断，预计维护持续 15 分钟。</p><p>请提前通知玩家并保存世界存档，建议在维护前创建存档备份。维护结束后玩家可重新连接。如需协助，请通过工单联系技术支持。</p><button className="cloud-primary" onClick={() => { setMaintenanceOpen(false); onSelectTab("tickets"); }}>联系技术支持 <ChevronRight size={16} /></button></DialogContent></Dialog>
    <Dialog open={!!detail} onOpenChange={open => { if (!open) setDetail(null); }}><DialogContent className="cloud-modal"><DialogTitle>{detail?.title}</DialogTitle><DialogDescription>{detail?.description}</DialogDescription><button className="cloud-primary" onClick={() => setDetail(null)}>我知道了</button></DialogContent></Dialog>
  </div>;
}
