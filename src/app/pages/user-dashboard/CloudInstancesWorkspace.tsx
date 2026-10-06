import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Activity, Archive, ChevronDown, ChevronLeft, ChevronRight, Copy, Gamepad2, HardDrive, Layers3, Play, Plus, RefreshCw, Search, Server, Square, Tag, Users, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { consoleInstances, type ConsoleInstance } from "./cloudDashboardData";
import { poolInstances, poolResources } from "./cloudAccountSummaryData";
import { GameServerDetailWorkspace } from "./GameServerDetailWorkspace";
import "../../../styles/cloud-instances-workspace.css";

const dateFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" });
const detailTabs = [{ id: "info", label: "基本信息" }, { id: "monitor", label: "监控图表" }, { id: "backups", label: "存档备份" }, { id: "tags", label: "标签" }];
const formatDate = (value: string) => dateFormat.format(new Date(value));
const trendTimeFormat = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const trendHourMs = 3600000;
const maxTrendHours = 7 * 24;

function MetricTrend({ metric }: { metric: { title: string; unit: string; value: number; series: number[] } }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [endTime] = useState(() => Math.floor(Date.now() / trendHourMs) * trendHourMs);
  const [rangeHours, setRangeHours] = useState(24);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    let wheelDelta = 0;
    const adjustRange = (event: WheelEvent) => {
      if (event.ctrlKey || event.deltaY === 0) return;
      event.preventDefault();
      event.stopPropagation();
      wheelDelta += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
      const steps = Math.trunc(wheelDelta / 100);
      if (!steps) return;
      wheelDelta -= steps * 100;
      setRangeHours(previous => Math.max(24, Math.min(maxTrendHours, previous + steps * 24)));
    };
    chart.addEventListener("wheel", adjustRange, { passive: false });
    return () => chart.removeEventListener("wheel", adjustRange);
  }, []);

  // 演示历史按小时采样；切换范围时复用同一时间点，最新值固定在右侧。
  const history = Array.from({ length: maxTrendHours + 1 }, (_, index) => {
    const hoursAgo = maxTrendHours - index;
    const position = ((24 - hoursAgo % 24) % 24) / 24 * (metric.series.length - 1);
    const left = Math.floor(position);
    const right = Math.min(left + 1, metric.series.length - 1);
    const value = Math.round(metric.series[left] + (metric.series[right] - metric.series[left]) * (position - left));
    return { time: endTime - hoursAgo * trendHourMs, value: hoursAgo === 0 ? metric.value : value };
  });
  const data = history.slice(-(rangeHours + 1));
  const rangeLabel = rangeHours === 24 ? "近 24 小时" : `近 ${rangeHours / 24} 天`;
  return <div ref={chartRef} className="iw-spark" role="img" aria-label={`${metric.title}${rangeLabel}演示趋势，滚轮调整范围，最多7天，时间为北京时间`}>
    <span className="iw-trend-range" aria-hidden="true">{rangeLabel}</span>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <XAxis dataKey="time" hide />
        <Tooltip allowEscapeViewBox={{ y: true }} isAnimationActive={false} labelFormatter={label => `时间：${trendTimeFormat.format(new Date(Number(label)))}`} formatter={(value: number) => [`${value} ${metric.unit}`, metric.title]} cursor={{ stroke: "var(--iw-tone)", strokeOpacity: 0.3, strokeDasharray: "3 3" }} wrapperStyle={{ zIndex: 10 }} contentStyle={{ fontSize: 11, padding: "8px 10px", borderRadius: 8, borderColor: "#e0eaf7", boxShadow: "0 4px 16px #28375614" }} labelStyle={{ color: "#697793", marginBottom: 4 }} />
        <Area dataKey="value" type="linear" stroke="var(--iw-tone)" fill="var(--iw-tone)" fillOpacity={0.06} strokeWidth={1.5} activeDot={{ r: 3, stroke: "#fff", strokeWidth: 1.5 }} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>;
}

function ServerStatus({ running }: { running: boolean }) {
  return <span className={`iw-status ${running ? "running" : "stopped"}`}><i />{running ? "运行中" : "已停止"}</span>;
}

function FlexiblePoolStatus() {
  const poolExpiry = poolInstances.reduce<string | null>((earliest, server) => {
    if (!earliest || Date.parse(server.expiresAt) < Date.parse(earliest)) return server.expiresAt;
    return earliest;
  }, null);
  return <section className="iw-pool-status" aria-label="随心配资源状态">
    <div className="iw-pool-identity">
      <span className="iw-pool-icon"><Layers3 size={16} aria-hidden="true" /></span>
      <div><h2>随心配</h2><span>{poolExpiry ? formatDate(poolExpiry) : "—"}</span></div>
    </div>
    <div className="iw-pool-resources">
      {poolResources.map(resource => {
        const remaining = resource.total - resource.used;
        const format = (amount: number) => amount.toLocaleString("zh-CN");
        return <div className="iw-pool-resource" key={resource.key}>
          <span>{resource.title}</span>
          <progress className={resource.key === "monthlyTrafficGB" ? "traffic" : undefined} max={resource.total} value={resource.used} aria-label={`随心配${resource.title}${resource.usedLabel}`} aria-valuetext={`${resource.usedLabel} ${format(resource.used)} ${resource.unit}，总额 ${format(resource.total)} ${resource.unit}，${resource.remainingLabel} ${format(remaining)} ${resource.unit}`} />
          <strong>{format(resource.used)}<small> / {format(resource.total)} {resource.unit}</small></strong>
        </div>;
      })}
    </div>
  </section>;
}

function ResourceChart({ server, period }: { server: ConsoleInstance; period: string }) {
  const data = Array.from({ length: period === "24" ? 13 : 7 }, (_, index) => ({
    time: period === "24" ? `${String(index * 2).padStart(2, "0")}:00` : `${index + 1} 日`,
    cpu: server.running ? Math.max(0, Math.min(100, server.cpu + [0, -8, -3, 4, -5, 6, -2, 8, 2, -6, 5, -3, 0][index])) : 0,
    memory: server.running ? Math.max(0, Math.min(100, server.memory + [0, 3, -2, 5, 2, -4, 3, 0, -3, 4, -2, 2, 0][index])) : 0,
  }));
  return <div className="iw-chart" role="img" aria-label={`${server.name} CPU 和内存使用率演示曲线`}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 12, right: 20, left: -26, bottom: 0 }}><CartesianGrid stroke="#edf2fa" strokeDasharray="3 3" vertical /><XAxis dataKey="time" interval={period === "24" ? 3 : 2} tick={{ fill: "#7a88a1", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={value => `${value}%`} tick={{ fill: "#7a88a1", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value: number, name: string) => [`${value}%`, name === "cpu" ? "CPU" : "内存"]} contentStyle={{ fontSize: 11, borderRadius: 8, borderColor: "#e0eaf7" }} /><Area dataKey="cpu" stroke="#1683ff" fill="#1683ff" fillOpacity={0.05} strokeWidth={1.7} isAnimationActive={false} /><Area dataKey="memory" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.04} strokeWidth={1.7} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>;
}

export function CloudInstancesWorkspace() {
  const [servers, setServers] = useState(consoleInstances);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [region, setRegion] = useState("all");
  const [game, setGame] = useState("all");
  const [sort, setSort] = useState("default");
  const [selected, setSelected] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [fullDetail, setFullDetail] = useState(false);
  const [detailTab, setDetailTab] = useState("info");
  const [period, setPeriod] = useState("24");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [tags, setTags] = useState<Record<string, string>>({});
  const [tagDialog, setTagDialog] = useState(false);
  const [tagValue, setTagValue] = useState("");
  const [restartId, setRestartId] = useState<string | null>(null);

  const rows = servers.filter(row => (status === "all" || row.running === (status === "running")) && (region === "all" || row.region === region) && (game === "all" || row.game === game) && `${row.name} ${row.game} ${row.ip} ${tags[row.id] ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => sort === "expiry" ? Date.parse(a.expiresAt) - Date.parse(b.expiresAt) : sort === "name" ? a.name.localeCompare(b.name, "zh-CN") : 0);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const detail = servers.find(row => row.id === detailId);
  const running = servers.filter(row => row.running).length;
  const metrics = [
    { title: "服务器总数", value: servers.length, unit: "台", icon: Server, tone: "blue", series: [2, 3, 3, 4, 4, 5] },
    { title: "运行中", value: running, unit: "台", icon: Play, tone: "green", series: [2, 2, 3, 2, 4, running] },
    { title: "已停止", value: servers.length - running, unit: "台", icon: Square, tone: "blue", series: [2, 1, 1, 2, 1, servers.length - running] },
    { title: "在线玩家", value: servers.reduce((total, row) => total + row.players, 0), unit: "人", icon: Users, tone: "teal", series: [35, 52, 48, 69, 75, 86] },
    { title: "存档备份", value: servers.reduce((total, row) => total + row.backups, 0), unit: "份", icon: Archive, tone: "orange", series: [8, 12, 14, 17, 21, 24] },
  ];

  const openDetail = (id: string) => { setDetailId(id); setDetailTab("info"); };
  const openFullDetail = (id: string) => { openDetail(id); setNotice(""); setFullDetail(true); };
  const closeDetail = () => { setFullDetail(false); setDetailId(null); };
  const setRunning = (ids: string[], value: boolean) => {
    setServers(previous => previous.map(row => ids.includes(row.id) ? { ...row, running: value, players: value ? row.players : 0, cpu: value ? row.cpu || 15 : 0, memory: value ? row.memory || 25 : 0, uptime: value ? "刚刚启动" : "—" } : row));
    setNotice(`已${value ? "启动" : "停止"} ${ids.length} 台服务器（演示操作）`);
  };
  const copyAddress = async (server: ConsoleInstance) => {
    try { await navigator.clipboard.writeText(`${server.ip}:${server.port}`); setNotice(`已复制 ${server.name} 的连接地址`); }
    catch { setNotice(`连接地址：${server.ip}:${server.port}，请手动复制`); }
  };
  const backup = (server: ConsoleInstance) => { setServers(previous => previous.map(row => row.id === server.id ? { ...row, backups: row.backups + 1 } : row)); setNotice(`${server.name} 已创建存档备份（演示操作）`); };
  const toggleSelected = (id: string) => setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);

  return <div className={`instances-workspace${detail ? fullDetail ? " full-detail" : " has-detail" : ""}`}>
    {fullDetail && detail && <GameServerDetailWorkspace key={detail.id} server={detail} onBack={() => setFullDetail(false)} onCopy={() => void copyAddress(detail)} onRestart={() => detail.running ? setRestartId(detail.id) : setRunning([detail.id], true)} onBackup={() => backup(detail)} notice={notice} onNotice={setNotice} monitor={<ResourceChart server={detail} period={period} />} period={period} onPeriodChange={setPeriod} />}
    {!fullDetail && <div className="iw-main">
      <div className="iw-breadcrumb">控制台 <ChevronRight size={12} /> 实例 <ChevronRight size={12} /><span>游戏服务器</span></div>
      <header className="iw-heading"><h1>服务器列表</h1></header>
      <section className="iw-metrics" aria-label="服务器统计">{metrics.map(metric => <article className={`iw-metric ${metric.tone}`} key={metric.title}><div className="iw-metric-top"><span className="iw-metric-icon"><metric.icon size={21} /></span><div><h2>{metric.title}</h2><strong>{metric.value}<small>{metric.unit}</small></strong></div></div><div className="iw-metric-bottom"><MetricTrend metric={metric} /></div></article>)}</section>
      <FlexiblePoolStatus />
      <section className="iw-list" aria-label="游戏服务器列表">
        <div className="iw-actions"><Link to="/deploy" className="iw-button primary"><Plus size={17} />创建游戏服务器</Link><DropdownMenu><DropdownMenuTrigger asChild><button className="iw-button" disabled={!selected.length}>批量操作 {selected.length > 0 && <span className="iw-selection-count">{selected.length}</span>}<ChevronDown size={14} /></button></DropdownMenuTrigger><DropdownMenuContent className="iw-menu"><DropdownMenuItem onSelect={() => setRunning(selected, true)}><Play size={14} />启动服务器</DropdownMenuItem><DropdownMenuItem onSelect={() => setRunning(selected, false)}><Square size={14} />停止服务器</DropdownMenuItem></DropdownMenuContent></DropdownMenu><button className="iw-button" disabled={!selected.length} onClick={() => { setTagValue(""); setTagDialog(true); }}><Tag size={15} />绑定标签</button><button className="iw-button" onClick={() => setServers(previous => [...previous])}><RefreshCw size={15} />刷新</button>{selected.length > 0 && <button className="iw-text-button iw-selection-clear" onClick={() => setSelected([])}>取消选择</button>}</div>
        <div className="iw-filters"><label className="iw-search"><Search size={16} /><input aria-label="搜索游戏服务器" placeholder="搜索服务器名称、IP 地址或标签" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label><select aria-label="服务器状态" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">全部状态</option><option value="running">运行中</option><option value="stopped">已停止</option></select><select aria-label="托管节点" value={region} onChange={event => { setRegion(event.target.value); setPage(1); }}><option value="all">全部节点</option>{[...new Set(servers.map(row => row.region))].map(value => <option key={value}>{value}</option>)}</select><select aria-label="游戏类型" value={game} onChange={event => { setGame(event.target.value); setPage(1); }}><option value="all">全部游戏</option>{[...new Set(servers.map(row => row.game))].map(value => <option key={value}>{value}</option>)}</select><select aria-label="列表排序" value={sort} onChange={event => setSort(event.target.value)}><option value="default">默认排序</option><option value="expiry">到期时间</option><option value="name">服务器名称</option></select></div>
        {notice && <div className="iw-notice" role="status"><Activity size={14} /><span>{notice}</span><button aria-label="关闭提示" onClick={() => setNotice("")}><X size={14} /></button></div>}
        <div className="iw-table-scroll">
          <table>
            <thead><tr>
              <th className="iw-check-cell"><input type="checkbox" aria-label="选择当前页全部服务器" checked={pageRows.length > 0 && pageRows.every(row => selected.includes(row.id))} ref={element => { if (element) element.indeterminate = pageRows.some(row => selected.includes(row.id)) && !pageRows.every(row => selected.includes(row.id)); }} onChange={event => setSelected(previous => event.target.checked ? [...new Set([...previous, ...pageRows.map(row => row.id)])] : previous.filter(id => !pageRows.some(row => row.id === id)))} /></th>
              <th>服务器名称</th><th>状态</th><th>规格配置</th><th>连接地址</th><th>托管节点</th><th>资源占用</th><th>到期时间</th>
            </tr></thead>
            <tbody>
              {pageRows.map(row => <tr key={row.id} className={detailId === row.id ? "active" : ""} tabIndex={0} aria-label={row.name + "，单击查看简易信息，双击或按 Enter 查看完整详情"} onClick={() => openDetail(row.id)} onDoubleClick={() => openFullDetail(row.id)} onKeyDown={event => {
                if (event.target !== event.currentTarget) return;
                if (event.key === "Enter") { event.preventDefault(); openFullDetail(row.id); }
                if (event.key === " ") { event.preventDefault(); openDetail(row.id); }
              }}>
                <td className="iw-check-cell" onClick={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}><input type="checkbox" aria-label={"选择 " + row.name} checked={selected.includes(row.id)} onChange={() => toggleSelected(row.id)} /></td>
                <td><button className="iw-server-name" tabIndex={-1} title="单击查看简易信息，双击查看完整详情"><span className="iw-game-icon iw-server-icon" aria-hidden="true"><Gamepad2 size={20} /></span><span className="iw-server-label"><strong>{row.name}</strong><small>{row.game.split(" / ")[0]}{tags[row.id] && <span className="iw-inline-tag">{tags[row.id]}</span>}</small></span></button></td>
                <td><ServerStatus running={row.running} /></td>
                <td>{row.cores} 核 {row.ram} GB<small className="iw-cell-sub">{row.players} / {row.slots} 玩家</small></td>
                <td className="iw-address">{row.ip}<small className="iw-cell-sub">端口 {row.port}</small></td>
                <td>{row.region}</td>
                <td><div className="iw-usage"><progress aria-label={row.name + " CPU 使用率"} max={100} value={row.cpu} /><span>CPU {row.cpu}%</span></div><div className="iw-usage memory"><progress aria-label={row.name + " 内存使用率"} max={100} value={row.memory} /><span>内存 {row.memory}%</span></div></td>
                <td><time className={Date.parse(row.expiresAt) - Date.now() <= 7 * 86400000 ? "iw-expiry soon" : "iw-expiry"} dateTime={row.expiresAt}>{formatDate(row.expiresAt)}</time></td>
              </tr>)}
              {!rows.length && <tr><td colSpan={8}><div className="iw-empty"><Search size={26} /><strong>没有匹配的游戏服务器</strong><p>尝试其他关键词，或清除筛选条件。</p><button className="iw-button" onClick={() => { setQuery(""); setStatus("all"); setRegion("all"); setGame("all"); setPage(1); }}>清除筛选</button></div></td></tr>}
            </tbody>
          </table>
        </div>
        <footer className="iw-pagination"><span>共 {rows.length} 台服务器{rows.length > 0 && `，当前显示 ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, rows.length)} 台`}</span><nav aria-label="服务器分页"><button aria-label="上一页服务器" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={14} /></button>{Array.from({ length: pageCount }, (_, index) => <button key={index} className={currentPage === index + 1 ? "current" : ""} aria-current={currentPage === index + 1 ? "page" : undefined} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button aria-label="下一页服务器" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={14} /></button><select aria-label="每页服务器数量" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={10}>10 条/页</option><option value={5}>5 条/页</option><option value={3}>3 条/页</option></select></nav></footer>
      </section>
      <p className="iw-footnote"><HardDrive size={13} />服务器数据与操作为演示，实际资源以服务端为准。</p>
    </div>}
    {detail && !fullDetail && <aside className="iw-detail" aria-label={fullDetail ? "完整实例详情" : "简易实例信息"}><div className="iw-detail-heading"><h2>{fullDetail ? "服务器详情" : "简易实例信息"}</h2>{fullDetail ? <button aria-label="返回服务器列表" onClick={() => setFullDetail(false)}><ChevronLeft size={20} /></button> : <button aria-label="关闭简易实例信息" onClick={closeDetail}><X size={20} /></button>}</div><div className="iw-detail-identity"><span className="iw-game-icon"><Gamepad2 size={27} /></span><div><div><h3>{detail.name}</h3><ServerStatus running={detail.running} /></div><p>{detail.game}</p></div></div><div className="iw-detail-tabs" role="tablist" aria-label="实例详情分类">{detailTabs.map(item => <button role="tab" tabIndex={detailTab === item.id ? 0 : -1} onKeyDown={event => {
          const index = detailTabs.findIndex(tab => tab.id === item.id);
          const next = event.key === "ArrowRight" ? (index + 1) % detailTabs.length : event.key === "ArrowLeft" ? (index + detailTabs.length - 1) % detailTabs.length : event.key === "Home" ? 0 : event.key === "End" ? detailTabs.length - 1 : -1;
          if (next >= 0) { event.preventDefault(); setDetailTab(detailTabs[next].id); document.getElementById(`iw-tab-${detailTabs[next].id}`)?.focus(); }
        }} aria-selected={detailTab === item.id} aria-controls={`iw-panel-${item.id}`} id={`iw-tab-${item.id}`} key={item.id} onClick={() => setDetailTab(item.id)} className={detailTab === item.id ? "active" : ""}>{item.label}</button>)}</div><div className="iw-detail-content" role="tabpanel" id={`iw-panel-${detailTab}`} aria-labelledby={`iw-tab-${detailTab}`}>
      {detailTab === "info" && <dl className="iw-info"><div><dt>实例 ID</dt><dd>{detail.id}</dd></div><div><dt>连接地址</dt><dd>{detail.ip}:{detail.port}<button aria-label="复制连接地址" onClick={() => void copyAddress(detail)}><Copy size={13} /></button></dd></div><div><dt>实例规格</dt><dd>{detail.cores} 核 CPU · {detail.ram} GB 内存</dd></div><div><dt>托管节点</dt><dd>{detail.region}</dd></div><div><dt>在线玩家</dt><dd>{detail.players} / {detail.slots} 人</dd></div><div><dt>运行时长</dt><dd>{detail.uptime}</dd></div><div><dt>游戏存档</dt><dd>{detail.saveGB} GB</dd></div><div><dt>存档备份</dt><dd>{detail.backups} 份 <button className="iw-text-button" onClick={() => setDetailTab("backups")}>查看</button></dd></div><div><dt>到期时间</dt><dd>{formatDate(detail.expiresAt)}</dd></div><div><dt>服务器标签</dt><dd>{tags[detail.id] || "未设置"}</dd></div></dl>}
      {detailTab === "backups" && <div className="iw-tab-content"><Archive size={30} /><h3>世界存档与备份</h3><p>当前存档 {detail.saveGB} GB，已保留 {detail.backups} 份备份。</p><p>创建备份可保存当前世界进度与服务器配置。</p><button className="iw-button" onClick={() => backup(detail)}><Plus size={14} />创建存档备份</button></div>}
      {detailTab === "tags" && <div className="iw-tab-content"><Tag size={30} /><h3>服务器标签</h3><p>{tags[detail.id] || "尚未设置标签，可用标签区分公会、游戏或用途。"}</p><button className="iw-button" onClick={() => { setSelected([detail.id]); setTagValue(tags[detail.id] ?? ""); setTagDialog(true); }}>编辑标签</button></div>}
      {(detailTab === "info" || detailTab === "monitor") && <section className="iw-monitor"><div><h3>监控图表</h3><select aria-label="监控时间范围" value={period} onChange={event => setPeriod(event.target.value)}><option value="24">近 24 小时</option><option value="7">近 7 天</option></select></div><p className="iw-chart-legend"><span><i />CPU 使用率</span><span><i />内存使用率</span></p><ResourceChart server={detail} period={period} /><small>演示监控数据</small></section>}
    </div>{!fullDetail && <button className="iw-detail-open iw-text-button" onClick={() => openFullDetail(detail.id)}>查看完整详情<ChevronRight size={14} /></button>}<div className="iw-detail-footer"><button className="iw-button primary" onClick={() => void copyAddress(detail)}><Copy size={14} />连接地址</button><button className="iw-button" onClick={() => detail.running ? setRestartId(detail.id) : setRunning([detail.id], true)}><RefreshCw size={14} />{detail.running ? "重启" : "启动"}</button><button className="iw-button" onClick={() => backup(detail)}><Archive size={14} />备份</button></div></aside>}
    <Dialog open={tagDialog} onOpenChange={setTagDialog}><DialogContent className="cloud-modal"><DialogTitle>绑定服务器标签</DialogTitle><DialogDescription>为已选择的 {selected.length} 台服务器设置标签（演示数据）。</DialogDescription><input className="iw-tag-input" aria-label="标签名称" placeholder="例如：公会服、好友服" value={tagValue} maxLength={16} onChange={event => setTagValue(event.target.value)} /><button className="iw-button primary" disabled={!tagValue.trim()} onClick={() => { setTags(previous => ({ ...previous, ...Object.fromEntries(selected.map(id => [id, tagValue.trim()])) })); setNotice(`已为 ${selected.length} 台服务器绑定标签「${tagValue.trim()}」`); setTagDialog(false); }}>保存标签</button></DialogContent></Dialog>
    <Dialog open={!!restartId} onOpenChange={open => { if (!open) setRestartId(null); }}><DialogContent className="cloud-modal"><DialogTitle>重启游戏服务器</DialogTitle><DialogDescription>重启「{servers.find(row => row.id === restartId)?.name}」会断开当前玩家连接。请确认已保存世界存档。当前为演示操作。</DialogDescription><button className="iw-button primary" onClick={() => { if (restartId) { setServers(previous => previous.map(row => row.id === restartId ? { ...row, uptime: "刚刚重启", players: 0 } : row)); setNotice("服务器已重启，等待玩家重新连接（演示操作）"); } setRestartId(null); }}>确认重启</button></DialogContent></Dialog>
  </div>;
}
