import { useState } from "react";
import { ArrowDown, ArrowUp, Bell, Bot, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, CodeXml, Download, Monitor, RefreshCw, Search, Settings, ShieldCheck, ShieldAlert, TriangleAlert, X } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import "../../../styles/cloud-logs.css";

type AuditRecord = { id: string; time: string; actor: string; role: string; avatar?: string; ip: string; type: string; target: string; result: string; risk: string; detail: string };
const samples: Omit<AuditRecord, "id">[] = [
  { time: "2024-10-26 14:28:31", actor: "Rimon12", role: "管理员", avatar: "rimon", ip: "203.0.113.10", type: "权限变更", target: "玩家组 vip", result: "成功", risk: "中", detail: "将玩家组 vip 添加权限 minecraft.command.tp" },
  { time: "2024-10-26 14:18:22", actor: "小帕帕", role: "玩家", avatar: "papa", ip: "125.77.88.12", type: "登录", target: "–", result: "成功", risk: "低", detail: "使用密码登录游戏服务器" },
  { time: "2024-10-26 13:56:10", actor: "Rimon12", role: "管理员", avatar: "rimon", ip: "203.0.113.10", type: "执行指令", target: "/ban 天空之城", result: "成功", risk: "高", detail: "封禁玩家 天空之城（76561198000000002）" },
  { time: "2024-10-26 13:42:18", actor: "系统", role: "系统", ip: "–", type: "敏感操作", target: "修改服务器配置", result: "成功", risk: "中", detail: "修改 server.properties" },
  { time: "2024-10-26 12:36:05", actor: "黑夜骑士", role: "玩家", avatar: "knight", ip: "183.32.116.5", type: "登录", target: "–", result: "成功", risk: "低", detail: "使用 Microsoft 账号登录" },
  { time: "2024-10-26 11:20:37", actor: "Console", role: "控制台", avatar: "console", ip: "127.0.0.1", type: "执行指令", target: "/op 山田太郎", result: "成功", risk: "高", detail: "授予玩家 山田太郎 管理员权限" },
  { time: "2024-10-26 10:52:19", actor: "喵喵子", role: "玩家", avatar: "meow", ip: "98.76.54.32", type: "登录失败", target: "–", result: "失败", risk: "中", detail: "密码错误，连续 3 次失败" },
  { time: "2024-10-26 10:21:46", actor: "Rimon12", role: "管理员", avatar: "rimon", ip: "203.0.113.10", type: "备份操作", target: "手动备份", result: "成功", risk: "低", detail: "创建了服务器备份 20241026_102146" },
  { time: "2024-10-26 09:18:33", actor: "系统", role: "系统", ip: "–", type: "安全事件", target: "异常登录", result: "阻止", risk: "高", detail: "来自高风险地区的登录尝试已被阻止" },
  { time: "2024-10-26 08:55:12", actor: "Notch_233", role: "玩家", avatar: "notch", ip: "45.67.89.123", type: "敏感指令", target: "/give @a command_block", result: "成功", risk: "高", detail: "给予物品 command_block ×1" },
];
const records: AuditRecord[] = Array.from({ length: 50 }, (_, index) => {
  const sample = samples[index % 10];
  const day = 26 - Math.floor(index / 10);
  return { ...sample, id: `audit-${index + 1}`, time: `2024-10-${day}${sample.time.slice(10)}`, detail: index % 10 === 7 ? `创建了服务器备份 202410${day}_102146` : sample.detail };
});
const typeTone = (type: string) => type === "权限变更" ? "orange" : ["登录", "备份操作"].includes(type) ? "blue" : "red";
const riskTone = (risk: string) => ({ 高: "red", 中: "orange", 低: "blue" })[risk];
const riskData = [{ name: "高风险", value: 23, color: "#ff6678" }, { name: "中风险", value: 28, color: "#ffc174" }, { name: "低风险", value: 21, color: "#8bbfff" }];
const alerts = ["玩家 Notch_233 使用了 /give 指令", "Rimon12 修改了服务器配置", "山田太郎 被授予管理员权限", "尝试使用非法物品 (barrier)", "连续 3 次登录失败（IP: 98.76.54.32）"];
const bans = [{ name: "天空之城", avatar: "sky", status: "封禁", reason: "作弊使用外挂", actor: "Rimon12", time: "2024-10-26 13:56", duration: "永久封禁" }, { name: "可乐不加冰", avatar: "notch", status: "封禁", reason: "发布不当言论", actor: "Console", time: "2024-10-25 20:13", duration: "7 天" }, { name: "黑夜骑士", avatar: "knight", status: "解封", reason: "误封申请通过", actor: "Rimon12", time: "2024-10-24 16:22", duration: "已解封" }];

function Actor({ record }: { record: AuditRecord }) {
  return <div className="ial-actor">{record.avatar ? <img src={`/console/audit/${record.avatar}.png`} alt="" /> : <span className="ial-bot"><Bot size={23} /></span>}<span><strong>{record.actor}</strong><small>（{record.role}）</small></span></div>;
}
function Donut({ data, value, caption }: { data: typeof riskData; value: number; caption: string }) {
  return <div className="ial-donut" role="img" aria-label={`${caption} ${value}，${data.map(item => `${item.name} ${item.value}`).join("，")}`}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" innerRadius="69%" outerRadius="98%" startAngle={90} endAngle={-270} stroke="#fff" strokeWidth={1} isAnimationActive={false}>{data.map(item => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer><div className="ial-donut-center"><strong>{value}</strong><span>{caption}</span></div></div>;
}

export function InstanceDetailLogsView({ serverName, onNotice }: { serverName: string; onNotice: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState("all");
  const [risk, setRisk] = useState("all");
  const [type, setType] = useState("all");
  const [start, setStart] = useState("2024-10-20");
  const [end, setEnd] = useState("2024-10-26");
  const [dateOpen, setDateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [collection, setCollection] = useState<string | null>(null);
  const [riskPeriod, setRiskPeriod] = useState("7");
  const filtered = records.filter(record => `${record.actor} ${record.ip} ${record.type} ${record.target} ${record.detail}`.toLowerCase().includes(query.trim().toLowerCase()) && (actor === "all" || record.actor === actor) && (risk === "all" || record.risk === risk) && (type === "all" || record.type === type) && (!start || record.time.slice(0, 10) >= start) && (!end || record.time.slice(0, 10) <= end));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleSelected = filtered.filter(record => selected.includes(record.id));
  const reset = () => { setQuery(""); setActor("all"); setRisk("all"); setType("all"); setStart("2024-10-20"); setEnd("2024-10-26"); setPage(1); setSelected([]); };
  const exportLogs = () => {
    const exported = visibleSelected.length ? visibleSelected : filtered;
    const escape = (value: string) => `"${(/^[=+@\-]/.test(value) ? "'" : "") + value.replaceAll('"', '""')}"`;
    const csv = [["记录 ID", "时间", "操作人", "IP 地址", "事件类型", "对象", "结果", "风险等级", "详情"], ...exported.map(record => [record.id, record.time, record.actor, record.ip, record.type, record.target, record.result, record.risk, record.detail])].map(row => row.map(escape).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `${serverName}-审计日志.csv`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    onNotice(`已导出 ${exported.length} 条${visibleSelected.length ? "选中" : "筛选后"}日志`);
  };
  const metricDefinitions = [ { title: "管理员操作", value: 128, change: "12%", up: true, tone: "blue", icon: Settings }, { title: "敏感指令", value: 42, change: "35%", up: true, tone: "red", icon: CodeXml }, { title: "权限变更", value: 18, change: "20%", up: false, tone: "orange", icon: ShieldCheck }, { title: "失败尝试", value: 23, change: "", up: false, tone: "purple", icon: TriangleAlert } ];
  return <div className="ial-layout">
    <section className="ial-metrics" aria-label="近七天审计统计">{metricDefinitions.map((metric, index) => <article className={`gsd-card ial-metric ${metric.tone}`} key={metric.title}><div className="ial-metric-top"><span className="ial-icon-tile"><metric.icon size={23} /></span><div><h2>{metric.title}</h2><strong>{metric.value}<small>次</small></strong></div>{metric.change && <span className={`ial-change ${metric.up && metric.tone === "red" ? "red" : "green"}`}>{metric.up ? <ArrowUp size={13} /> : <ArrowDown size={13} />}{metric.change}</span>}</div><span className="ial-metric-period">近 7 天</span><div className="ial-sparkline" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart data={[5, 8, 11, 18, 12, 8, 10, 15, 20, 18, 26, 30, 22, 17, 22, 17, 9].map((value, point) => ({ value: value + (point * (index + 2) % 9) }))} barCategoryGap="32%"><Bar dataKey="value" fill={metric.tone === "red" ? "#ff9ea7" : metric.tone === "orange" ? "#ffc276" : metric.tone === "purple" ? "#c79bff" : "#8cbfff"} isAnimationActive={false} /></BarChart></ResponsiveContainer></div></article>)}</section>
    <div className="ial-main">
      <section className="gsd-card ial-audit" aria-label="审计日志">
        <header className="ial-heading"><h2><ClipboardList size={19} />审计日志</h2>{visibleSelected.length > 0 && <span>已选 {visibleSelected.length} 条<button className="ial-link" onClick={() => setSelected([])} aria-label="取消日志选择"><X size={14} /></button></span>}</header>
        <div className="ial-filters">
          <label className="ial-search"><Search size={16} /><input aria-label="搜索审计日志" placeholder="搜索操作人、IP 地址、事件或内容..." value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label>
          <select aria-label="日志操作人" value={actor} onChange={event => { setActor(event.target.value); setPage(1); }}><option value="all">全部操作人</option>{[...new Set(records.map(record => record.actor))].map(name => <option key={name}>{name}</option>)}</select>
          <button className="ial-date" onClick={() => setDateOpen(true)}><CalendarDays size={15} /><span>{start || "开始日期"}　~　{end || "结束日期"}</span><ChevronDown size={13} /></button>
          <select aria-label="日志风险等级" value={risk} onChange={event => { setRisk(event.target.value); setPage(1); }}><option value="all">全部风险等级</option>{["高", "中", "低"].map(value => <option key={value} value={value}>{value}风险</option>)}</select>
          <select aria-label="日志事件类型" value={type} onChange={event => { setType(event.target.value); setPage(1); }}><option value="all">全部事件类型</option>{[...new Set(records.map(record => record.type))].map(value => <option key={value}>{value}</option>)}</select>
          <button className="ial-tool" onClick={() => onNotice(`已刷新审计日志，共 ${filtered.length} 条记录（演示数据）`)}><RefreshCw size={16} />刷新</button>
          <button className="ial-tool ial-export" onClick={exportLogs} disabled={!filtered.length}><Download size={16} />导出</button>
        </div>
        <div className="ial-table-scroll"><table className="ial-table"><colgroup>{["check", "time", "actor", "ip", "type", "target", "result", "risk", "detail"].map(name => <col className={`ial-col-${name}`} key={name} />)}</colgroup><thead><tr><th><input type="checkbox" aria-label="选择当前页全部日志" checked={rows.length > 0 && rows.every(row => selected.includes(row.id))} ref={element => { if (element) element.indeterminate = rows.some(row => selected.includes(row.id)) && !rows.every(row => selected.includes(row.id)); }} onChange={event => setSelected(previous => event.target.checked ? [...new Set([...previous, ...rows.map(row => row.id)])] : previous.filter(id => !rows.some(row => row.id === id)))} /></th>{["时间", "操作人", "IP 地址", "事件类型", "对象", "结果", "风险等级", "详情"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{rows.map(record => <tr key={record.id} className={selected.includes(record.id) ? "selected" : undefined}><td><input type="checkbox" aria-label={`选择日志 ${record.id}`} checked={selected.includes(record.id)} onChange={event => setSelected(previous => event.target.checked ? [...previous, record.id] : previous.filter(id => id !== record.id))} /></td><td><time>{record.time}</time></td><td><Actor record={record} /></td><td>{record.ip}</td><td><span className={`ial-badge ${typeTone(record.type)}`}>{record.type}</span></td><td title={record.target}>{record.target}</td><td><span className={`ial-badge ${record.result === "成功" ? "green" : "red"}`}>{record.result}</span></td><td><span className={`ial-badge ${riskTone(record.risk)}`}>{record.risk}</span></td><td title={record.detail}>{record.detail}</td></tr>)}{!rows.length && <tr><td colSpan={9}><div className="ial-empty"><Search size={25} /><strong>没有符合条件的日志</strong><button className="ial-link" onClick={reset}>清除筛选</button></div></td></tr>}</tbody></table></div>
        <footer className="ial-pagination"><span>共 {filtered.length} 条记录，当前第 {currentPage} / {pageCount} 页</span><nav aria-label="审计日志分页"><button aria-label="上一页日志" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={15} /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} aria-label={`日志第 ${number} 页`} aria-current={number === currentPage ? "page" : undefined} className={number === currentPage ? "current" : ""} onClick={() => setPage(number)}>{number}</button>)}<button aria-label="下一页日志" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={15} /></button><select aria-label="每页日志数量" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={10}>10 条/页</option><option value={20}>20 条/页</option><option value={50}>50 条/页</option></select></nav></footer>
      </section>
    </div>
    <aside className="ial-sidebar">
      <section className="gsd-card ial-risk-card"><header className="ial-heading"><h2><ShieldAlert size={19} />风险概览</h2><select aria-label="风险概览时间" value={riskPeriod} onChange={event => setRiskPeriod(event.target.value)}><option value="7">近 7 天</option><option value="30">近 30 天</option></select></header><div className="ial-risk-content"><Donut data={riskData.map(item => ({ ...item, value: item.value * (riskPeriod === "30" ? 4 : 1) }))} value={riskPeriod === "30" ? 92 : 23} caption="高风险事件" /><div className="ial-legend">{riskData.map(item => <button key={item.name} aria-label={`筛选${item.name}日志`} onClick={() => { setRisk(item.name[0]); setPage(1); }}><i style={{ background: item.color }} /><span>{item.name}</span><strong>{item.value * (riskPeriod === "30" ? 4 : 1)}</strong><small>{Math.round(item.value / 72 * 100)}%</small></button>)}</div></div></section>
      <section className="gsd-card ial-alerts"><header className="ial-heading"><h2><Bell size={19} />敏感操作提醒</h2><button className="ial-link" onClick={() => setCollection("敏感操作提醒")}>查看全部<ChevronRight size={13} /></button></header>{alerts.map((alert, index) => <div className={`ial-alert ${index > 2 ? "orange" : "red"}`} key={alert}><i /><span title={alert}>{alert}</span><time>2024-10-26 { ["08:55", "13:42", "11:20", "09:18", "10:52"][index]}</time></div>)}</section>
      <section className="gsd-card ial-bans"><header className="ial-heading"><h2><Monitor size={19} />最近封禁 / 解封记录</h2><button className="ial-link" onClick={() => setCollection("最近封禁 / 解封记录")}>查看全部<ChevronRight size={13} /></button></header>{bans.map(ban => <div className="ial-ban" key={ban.name}><img src={`/console/audit/${ban.avatar}.png`} alt="" /><div><p><strong>{ban.name}</strong><span className={`ial-status ${ban.status === "封禁" ? "red" : "green"}`}>{ban.status}</span><span>{ban.reason}</span></p><p><span>{ban.actor}</span><time>{ban.time}</time><span className={`ial-badge ${ban.duration === "已解封" ? "green" : ban.duration === "7 天" ? "orange" : "red"}`}>{ban.duration}</span></p></div></div>)}</section>
    </aside>
    <Dialog open={dateOpen} onOpenChange={setDateOpen}><DialogContent className="cloud-modal gsd-dialog ial-dialog"><DialogTitle>筛选日志日期</DialogTitle><DialogDescription>按记录时间筛选审计日志；当前展示 2024 年 10 月的历史演示数据。</DialogDescription><label>开始日期<input aria-label="日志开始日期" type="date" value={start} max={end || undefined} onInput={event => { setStart(event.currentTarget.value); setPage(1); }} onChange={event => { setStart(event.target.value); setPage(1); }} /></label><label>结束日期<input aria-label="日志结束日期" type="date" value={end} min={start || undefined} onInput={event => { setEnd(event.currentTarget.value); setPage(1); }} onChange={event => { setEnd(event.target.value); setPage(1); }} /></label>{start && end && start > end && <p role="alert">开始日期不能晚于结束日期</p>}<button className="gsd-button primary" disabled={!!start && !!end && start > end} onClick={() => setDateOpen(false)}>完成</button></DialogContent></Dialog>
    <Dialog open={!!collection} onOpenChange={open => { if (!open) setCollection(null); }}><DialogContent className="cloud-modal gsd-dialog ial-dialog"><DialogTitle>{collection}</DialogTitle><DialogDescription>{serverName} · 历史演示数据</DialogDescription>{collection === "敏感操作提醒" ? alerts.map((alert, index) => <p key={alert}>{index + 1}. {alert}</p>) : bans.map(ban => <p key={ban.name}>{ban.name} · {ban.status} · {ban.reason} · {ban.duration}<br />{ban.actor} · {ban.time}</p>)}</DialogContent></Dialog>
  </div>;
}
