import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { costCategories, costData, networkData, weeklyNetworkData, resourceUsage } from "./cloudDashboardData";

export function PanelLink({ onClick }: { onClick: () => void }) {
  return <button className="dash-link" onClick={onClick}>查看更多 <ChevronRight size={14} /></button>;
}

export function ResourceUsage({ onMore }: { onMore: () => void }) {
  return <section className="dash-panel dash-resource">
    <div className="dash-panel-heading"><h2>游戏服务器资源</h2><PanelLink onClick={onMore} /></div>
    <div className="dash-donuts">
      {resourceUsage.map(metric => <div className="dash-donut-block" key={metric.title}>
        <div className="dash-donut" role="img" aria-label={`${metric.title} ${metric.value}%`}>
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{ value: metric.value }, { value: 100 - metric.value }]} dataKey="value" innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}><Cell fill={metric.color} /><Cell fill="#dfe6f2" /></Pie></PieChart></ResponsiveContainer>
          <div className="dash-donut-label"><strong>{metric.value}%</strong><span>{metric.title}</span></div>
        </div>
        <div className="dash-donut-legend"><span><i style={{ background: metric.color }} />已使用 {metric.value}%（{metric.used} {metric.unit}）</span><span><i />剩余 {100 - metric.value}%（{metric.rest} {metric.unit}）</span></div>
      </div>)}
    </div>
  </section>;
}

export function NetworkTraffic() {
  const [period, setPeriod] = useState("24");
  const periods = [{ value: "24", label: "最近 24 小时" }, { value: "7", label: "最近 7 天" }, { value: "30", label: "最近一个月" }];
  const days = period === "7" ? 7 : 30;
  const endDate = new Date();
  const dateLabel = (offset: number) => {
    const date = new Date(endDate);
    date.setDate(date.getDate() - days + 1 + offset);
    return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Hong_Kong", month: "numeric", day: "numeric" }).format(date);
  };
  const monthlyData = Array.from({ length: 30 }, (_, day) => {
    const sample = weeklyNetworkData[day % weeklyNetworkData.length];
    return { hour: day, inbound: sample.inbound + Math.floor(day / 7), outbound: sample.outbound + Math.floor(day / 7) * 2 };
  });
  const chartData = period === "24" ? networkData : period === "7" ? weeklyNetworkData.map((point, day) => ({ ...point, hour: day })) : monthlyData;
  const ticks = period === "24" ? [0, 4, 8, 12, 16, 20, 24] : period === "7" ? [0, 1, 2, 3, 4, 5, 6] : [0, 5, 10, 15, 20, 25, 29];
  const formatHour = (hour: number) => period === "24" ? `${String(Math.round(hour)).padStart(2, "0")}:00` : dateLabel(Math.round(hour));
  return <section className="dash-panel dash-network">
    <div className="dash-panel-heading"><h2>游戏网络流量</h2><div className="dash-network-controls">
      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger className="dash-period-trigger" aria-label="游戏网络流量时间范围"><SelectValue /></SelectTrigger>
        <SelectContent className="dash-period-menu" align="end" sideOffset={5}>
          {periods.map(option => <SelectItem key={option.value} value={option.value} className="dash-period-option">{option.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div></div>
    <p className="dash-axis-caption">流量（Mbps）</p>
    <div className="dash-network-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 6, right: 5, left: -14, bottom: 0 }}><CartesianGrid stroke="#edf2f9" /><XAxis dataKey="hour" type="number" domain={[0, period === "24" ? 24 : days - 1]} ticks={ticks} tickFormatter={formatHour} axisLine={false} tickLine={false} tick={{ fill: "#748099", fontSize: 11 }} minTickGap={12} /><YAxis axisLine={false} tickLine={false} domain={[0, 80]} ticks={[0, 20, 40, 60, 80]} tick={{ fill: "#748099", fontSize: 11 }} width={43} /><Tooltip labelFormatter={label => `${periods.find(option => option.value === period)?.label} ${formatHour(Number(label))}`} formatter={(v: number, name: string) => [`${v} Mbps`, name === "inbound" ? "入方向" : "出方向"]} contentStyle={{ border: "1px solid #e1e9f4", borderRadius: 6, fontSize: 12 }} /><Area dataKey="inbound" type="linear" stroke="#1683ff" strokeWidth={2} fill="#1683ff" fillOpacity={0.04} dot={{ r: 2, fill: "#1683ff", strokeWidth: 0 }} isAnimationActive={false} /><Area dataKey="outbound" type="linear" stroke="#13c68b" strokeWidth={2} fill="#13c68b" fillOpacity={0.06} dot={{ r: 2, fill: "#13c68b", strokeWidth: 0 }} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>
    <div className="dash-chart-legend"><span><i style={{ background: "#1683ff" }} />入方向</span><span><i style={{ background: "#13c68b" }} />出方向</span></div>
  </section>;
}

export function CostTrend() {
  const [period, setPeriod] = useState("6");
  return <section className="dash-panel dash-cost">
    <div className="dash-panel-heading"><h2>游戏托管费用</h2><select aria-label="费用趋势时间范围" value={period} onChange={e => setPeriod(e.target.value)}><option value="6">最近 6 个月</option><option value="3">最近 3 个月</option></select></div>
    <div className="dash-cost-caption"><span>费用（元）</span><div className="dash-chart-legend">{costCategories.map(c => <span key={c.key}><i style={{ background: c.color }} />{c.name}</span>)}</div></div>
    <div className="dash-cost-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={costData.slice(period === "3" ? -3 : 0)} margin={{ top: 6, right: 3, left: -14, bottom: 0 }} barSize={29}><CartesianGrid stroke="#edf2f9" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#748099", fontSize: 11 }} /><YAxis domain={[0, 1000]} ticks={[0, 250, 500, 750, 1000]} tickFormatter={value => value.toLocaleString()} tickLine={false} axisLine={false} tick={{ fill: "#748099", fontSize: 11 }} width={50} /><Tooltip formatter={(v: number, name: string) => [`¥${v.toLocaleString()}`, costCategories.find(c => c.key === name)?.name]} contentStyle={{ borderRadius: 6, border: "1px solid #e1e9f4", fontSize: 12 }} />{costCategories.map(c => <Bar key={c.key} dataKey={c.key} stackId="cost" fill={c.color} isAnimationActive={false} />)}</BarChart></ResponsiveContainer></div>
  </section>;
}

