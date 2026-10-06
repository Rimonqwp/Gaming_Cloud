import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Archive, Ban, Check, ChevronLeft, ChevronRight, ClipboardList, Clock3, Copy, Crown, Eye, FileText, FolderClosed, Gamepad2, House, Megaphone, Power, RefreshCw, Save, Search, Send, Settings, SquareTerminal, Swords, Timer, Trash2, Users, Wrench, X, Zap } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import type { ConsoleInstance } from "./cloudDashboardData";
import { InstanceDetailFilesView } from "./InstanceDetailFilesView";
import { InstanceDetailLogsView } from "./InstanceDetailLogsView";
import "../../../styles/cloud-server-detail.css";
import { GameServerOverview } from "./GameServerOverview";
import { GameServerTasks } from "./GameServerTasks";
import { GameServerMachineSettings } from "./GameServerMachineSettings";
import { GameServerBackups } from "./GameServerBackups";
import { Box } from "lucide-react";
import { GameServerPlugins } from "./GameServerPlugins";

type PlayerStatus = "在线" | "离线" | "已封禁";
type PlayerRole = "管理员" | "成员" | "白名单" | "黑名单";
type Player = { name: string; id: string; status: PlayerStatus; lastLogin: string; hours: number; role: PlayerRole; avatar: string };
type DetailTab = "overview" | "players" | "files" | "plugins" | "backups" | "logs" | "tasks" | "machine";
type Mode = "whitelist" | "pvp" | "autosave" | "maintenance";
const tabs = [
  { id: "overview", label: "概览", icon: House },
  { id: "players", label: "玩家管理", icon: Users },
  { id: "plugins", label: "插件广场", icon: Box },
  { id: "files", label: "文件管理", icon: ClipboardList },
  { id: "backups", label: "文件备份", icon: FolderClosed },
  { id: "tasks", label: "定时任务", icon: Timer },
  { id: "logs", label: "日志", icon: FileText },
  { id: "machine", label: "机器设定", icon: Settings },
] as const;
const initialPlayers: Player[] = [
  { name: "小帕帕", id: "76561198000000001", status: "在线", lastLogin: "2024-10-26 14:32", hours: 26, role: "管理员", avatar: "player-1" },
  { name: "天空之城", id: "76561198000000002", status: "在线", lastLogin: "2024-10-26 14:18", hours: 18, role: "成员", avatar: "player-2" },
  { name: "喵喵子", id: "76561198000000003", status: "在线", lastLogin: "2024-10-26 13:56", hours: 12, role: "成员", avatar: "player-3" },
  { name: "星空旅人", id: "76561198000000004", status: "离线", lastLogin: "2024-10-26 11:20", hours: 8, role: "成员", avatar: "player-4" },
  { name: "黑夜骑士", id: "76561198000000005", status: "在线", lastLogin: "2024-10-26 14:05", hours: 34, role: "白名单", avatar: "player-5" },
  { name: "可乐不加冰", id: "76561198000000006", status: "已封禁", lastLogin: "2024-10-25 20:13", hours: 2, role: "黑名单", avatar: "player-6" },
  { name: "山田太郎", id: "76561198000000007", status: "离线", lastLogin: "2024-10-25 18:50", hours: 6, role: "成员", avatar: "player-7" },
  { name: "月下独吟", id: "76561198000000008", status: "在线", lastLogin: "2024-10-26 14:28", hours: 15, role: "成员", avatar: "player-8" },
];
const initialEvents = [
  { text: "小帕帕 加入了游戏", time: "2024-10-26 14:29", danger: false },
  { text: "月下独吟 加入了游戏", time: "2024-10-26 14:28", danger: false },
  { text: "黑夜骑士 加入了游戏", time: "2024-10-26 14:21", danger: false },
  { text: "可乐不加冰 被管理员封禁", time: "2024-10-26 14:18", danger: true },
  { text: "喵喵子 加入了游戏", time: "2024-10-26 13:56", danger: false },
];
const modeDefinitions = [
  { key: "whitelist", title: "白名单模式", description: "仅白名单玩家可加入服务器", icon: FileText, tone: "green" },
  { key: "pvp", title: "PVP 模式", description: "允许玩家之间进行 PVP", icon: Swords, tone: "blue" },
  { key: "autosave", title: "自动保存", description: "定时自动保存世界数据", detail: "每 30 分钟保存一次", icon: Save, tone: "blue" },
  { key: "maintenance", title: "维护模式", description: "阻止新玩家加入服务器", detail: "开启后仅管理员可进入", icon: Wrench, tone: "orange" },
] as const;
const timeFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
const clockFormat = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
const roleClass = (role: PlayerRole) => ({ 管理员: "admin", 成员: "member", 白名单: "whitelist", 黑名单: "blacklist" })[role];
const statusClass = (status: PlayerStatus) => ({ 在线: "online", 离线: "offline", 已封禁: "banned" })[status];

function initialLogs(server: ConsoleInstance) {
  const game = server.game.split(" / ")[0];
  return [
    `[14:28:31] Server: 服务器已${server.running ? "启动" : "停止"}，运行版本 v0.3.2.1`,
    "[14:28:31] Server: 正在加载世界数据...",
    `[14:28:33] Game: World loaded (${game})`,
    "[14:28:36] Player: 小帕帕 (76561198000000001) 已加入游戏",
    "[14:28:45] Player: 天空之城 (76561198000000002) 已加入游戏",
    "[14:29:02] Player: 喵喵子 (76561198000000003) 已加入游戏",
    "[14:29:18] Warning: 检测到异常移动行为: 可乐不加冰 (76561198000000006)",
    "[14:29:21] Player: 黑夜骑士 (76561198000000005) 已加入游戏",
    "[14:29:35] Save: 世界已自动保存（耗时 3.2 秒）",
    "[14:30:12] Player: 月下独吟 (76561198000000008) 已加入游戏",
  ];
}

function Metric({ title, value, description, tone, icon: Icon, points }: { title: string; value: number; description: string; tone: string; icon: typeof Users; points: number[] }) {
  const color = { green: "#00bf89", blue: "#087bff", red: "#ff4351", orange: "#f18a1c" }[tone];
  return <article className={`gsd-metric ${tone}`}>
    <div className="gsd-metric-heading"><span className="gsd-icon-tile"><Icon size={22} /></span><div><h2>{title}</h2><strong>{value}<small>人</small></strong><p>{description}</p></div></div>
    <div className="gsd-trend" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><AreaChart data={points.map(value => ({ value }))} margin={{ top: 3, bottom: 0, left: 0, right: 0 }}><Area type="linear" dataKey="value" stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.06} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>
  </article>;
}

export function GameServerDetailWorkspace({ server, onBack, onCopy, onRestart, onBackup, notice, onNotice, onStart, onStop, onForceStop }: {
  server: ConsoleInstance; onBack: () => void; onCopy: () => void; onRestart: () => void; onBackup: () => void;
  notice: string; onNotice: (message: string) => void; onStart: () => void; onStop: () => void; onForceStop: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [backupRequest, setBackupRequest] = useState(0);
  const availableTabs = tabs.filter(tab => tab.id !== "plugins" || server.game === "Minecraft");
  const [players, setPlayers] = useState(() => initialPlayers.map(player => ({ ...player, status: !server.running && player.status === "在线" ? "离线" as PlayerStatus : player.status })));
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [group, setGroup] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [logs, setLogs] = useState(() => initialLogs(server));
  const [events, setEvents] = useState(initialEvents);
  const [command, setCommand] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [modes, setModes] = useState<Record<Mode, boolean>>({ whitelist: true, pvp: true, autosave: true, maintenance: false });
  const [playerDetail, setPlayerDetail] = useState<Player | null>(null);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [shutdownMode, setShutdownMode] = useState<"graceful" | "force" | null>(null);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const consoleRef = useRef<HTMLPreElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousServer = useRef({ uptime: server.uptime, running: server.running });

  useLayoutEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [activeTab]);

  useEffect(() => {
    if (autoScroll && consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [logs, autoScroll, activeTab]);
  useEffect(() => {
    if (previousServer.current.uptime !== server.uptime || previousServer.current.running !== server.running) {
      if (server.uptime === "刚刚重启" || !server.running) setPlayers(previous => previous.map(player => ({ ...player, status: player.status === "在线" ? "离线" : player.status })));
      previousServer.current = { uptime: server.uptime, running: server.running };
    }
  }, [server.uptime, server.running]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => onNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice, onNotice]);

  const filtered = players.filter(player => `${player.name} ${player.id}`.toLowerCase().includes(query.trim().toLowerCase()) && (status === "all" || player.status === status) && (group === "all" || player.role === group));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const onlineCount = players.filter(player => player.status === "在线").length;
  const onlineDelta = onlineCount - initialPlayers.filter(player => player.status === "在线").length;
  const log = (text: string) => setLogs(previous => [...previous, `[${clockFormat.format(new Date())}] ${text}`]);
  const addEvent = (text: string, danger = false) => setEvents(previous => [{ text, time: timeFormat.format(new Date()), danger }, ...previous]);
  const actOnPlayer = (player: Player, action: "kick" | "ban" | "unban") => {
    const nextStatus = action === "ban" ? "已封禁" : "离线";
    setPlayers(previous => previous.map(row => row.id === player.id ? { ...row, status: nextStatus, role: action === "ban" ? "黑名单" : action === "unban" ? "成员" : row.role } : row));
    const text = `${player.name} ${action === "kick" ? "已被踢出服务器" : action === "ban" ? "已被管理员封禁" : "已解除封禁"}`;
    log(`Player: ${text}`); addEvent(text, action === "ban"); onNotice(`${text}（演示操作）`);
  };
  const save = () => { onBackup(); setBackupRequest(previous => previous + 1); log("Save: 世界存档备份已完成（演示操作）"); addEvent("已创建世界存档备份"); };
  const sendCommand = () => {
    const value = command.trim();
    if (!value) return;
    log(`Console: ${value}`); setCommand("");
    const [action, ...args] = value.split(/\s+/);
    const target = players.find(player => player.name === args.join(" ") || player.id === args.join(" "));
    if (action === "save") save();
    else if (["kick", "ban", "unban"].includes(action)) {
      if (target) actOnPlayer(target, action as "kick" | "ban" | "unban");
      else { log("Console: 未找到玩家，请输入完整昵称或 Steam ID"); onNotice("未找到玩家，请检查昵称或 Steam ID"); }
    } else { log("Console: 已接收指令（演示操作）"); onNotice("指令已发送（演示操作）"); }
  };
  const toggleMode = (key: Mode, checked: boolean) => {
    setModes(previous => ({ ...previous, [key]: checked }));
    const title = modeDefinitions.find(mode => mode.key === key)?.title;
    log(`Settings: ${title}已${checked ? "开启" : "关闭"}（演示操作）`);
    onNotice(`${title}已${checked ? "开启" : "关闭"}（演示操作）`);
  };
  const consolePanel = <section className="gsd-card gsd-console" aria-label="实时控制台">
    <header><h2><SquareTerminal size={20} />实时控制台</h2><div><button onClick={() => setLogs([])}><Trash2 size={14} />清空</button><label className="gsd-auto"><Eye size={15} /><span>自动滚动</span><Switch className="gsd-switch" aria-label="自动滚动" checked={autoScroll} onCheckedChange={setAutoScroll} /></label></div></header>
    <pre ref={consoleRef} aria-label="服务器控制台输出" tabIndex={0}>{logs.length ? logs.map((line, index) => <code key={index}>{line.split(/(Server:|Game:|Player:|Warning:|Save:|Console:|Settings:|Announcement:)/).map((part, index) => <span key={index} className={part === "Warning:" ? "warning" : part.endsWith(":") ? "category" : undefined}>{part}</span>)}</code>) : <span className="gsd-log-empty">控制台已清空，等待新的输出...</span>}</pre>
    <form className="gsd-command" onSubmit={event => { event.preventDefault(); sendCommand(); }}><input ref={inputRef} aria-label="控制台指令" value={command} onChange={event => setCommand(event.target.value)} placeholder="输入指令并发送（如：save、kick 玩家名、ban 玩家名...）" /><button className="gsd-button primary" type="submit"><Send size={17} />发送</button></form>
  </section>;

  return <div className="gsd-page">
    <nav className="gsd-breadcrumb" aria-label="面包屑">{["控制台", "实例", "游戏服务器"].map(label => <span key={label}><button onClick={onBack}>{label}</button><ChevronRight size={13} /></span>)}<strong>实例详情</strong></nav>
    <header className="gsd-hero"><div className="gsd-identity"><span className="gsd-game-icon">{server.game === "Minecraft" ? <img src="/console/minecraft/grass-block.png" alt="Minecraft 草方块" /> : <Gamepad2 size={30} />}</span><div><div className="gsd-title"><h1>{server.name}</h1><span className={`gsd-running${server.running ? "" : " stopped"}`}><i />{server.running ? "运行中" : "已停止"}</span></div><p><span>实例 ID：{server.id === "srv-pal-01" ? "ins-8f3a2d1c" : server.id}</span><i /><span>连接地址：{server.ip}:{server.port}</span><button aria-label="复制连接地址" onClick={onCopy}><Copy size={14} /></button></p></div></div><div className="gsd-actions"><button className="gsd-button" onClick={() => server.running ? setShutdownMode("graceful") : onNotice("服务器已停止")}><Power size={17} />关机</button><button className="gsd-button danger" onClick={() => server.running ? setShutdownMode("force") : onNotice("服务器已停止")}><Zap size={17} />硬关机</button><button className="gsd-button" onClick={onRestart}><RefreshCw size={18} />{server.running ? "重启实例" : "启动实例"}</button><button className="gsd-button" onClick={save}><Archive size={18} />备份数据</button></div></header>
    <nav className="gsd-tabs" role="tablist" aria-label="实例详情导航">{availableTabs.map((tab, index) => <button key={tab.id} id={`gsd-tab-${tab.id}`} role="tab" aria-selected={activeTab === tab.id} aria-controls="gsd-panel" tabIndex={activeTab === tab.id ? 0 : -1} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)} onKeyDown={event => {
      const next = event.key === "ArrowRight" ? (index + 1) % availableTabs.length : event.key === "ArrowLeft" ? (index + availableTabs.length - 1) % availableTabs.length : event.key === "Home" ? 0 : event.key === "End" ? availableTabs.length - 1 : -1;
      if (next >= 0) { event.preventDefault(); setActiveTab(availableTabs[next].id); document.getElementById(`gsd-tab-${availableTabs[next].id}`)?.focus(); }
    }}><tab.icon size={17} />{tab.label}</button>)}</nav>
    <div ref={panelRef} id="gsd-panel" className="gsd-panel" role="tabpanel" tabIndex={0} aria-labelledby={`gsd-tab-${activeTab}`}>
      <div hidden={activeTab !== "machine"}><GameServerMachineSettings server={server} onNotice={onNotice} onRestart={onRestart} onLog={log} /></div>
      <div hidden={activeTab !== "files"}><InstanceDetailFilesView onNotice={onNotice} /></div>
      <div hidden={activeTab !== "logs"}><InstanceDetailLogsView serverName={server.name} onNotice={onNotice} /></div>
      <div hidden={activeTab !== "overview"}><GameServerOverview server={server} onStart={onStart} onStop={onStop} onRestart={onRestart} onBackup={save} onOpen={setActiveTab} onNotice={onNotice} terminal={consolePanel} /></div>
      <div hidden={activeTab !== "tasks"}><GameServerTasks server={server} autosaveEnabled={modes.autosave} onAutosaveChange={checked => toggleMode("autosave", checked)} onNotice={onNotice} onLog={log} /></div>
      <div hidden={activeTab !== "backups"}><GameServerBackups server={server} backupRequest={backupRequest} onBackup={save} onNotice={onNotice} /></div>
      {activeTab === "plugins" && <GameServerPlugins server={server} onNotice={onNotice} />}
      {activeTab === "files" || activeTab === "overview" || activeTab === "tasks" || activeTab === "plugins" || activeTab === "backups" || activeTab === "machine" ? null : activeTab === "players" ? <div className="gsd-layout">
        <section className="gsd-main gsd-card" aria-label="玩家管理">
          <div className="gsd-metrics"><Metric title="在线玩家" value={Math.max(0, server.running ? server.players + onlineDelta : 0)} description="当前服务器在线人数" tone="green" icon={Users} points={[7, 9, 9, 9, 15, 15, 13, 14, 24, 24, 24, 22, 29, 29, 30, 31, 32]} /><Metric title="白名单" value={40} description="已加入白名单的玩家" tone="blue" icon={ClipboardList} points={[5, 12, 16, 18, 17, 15, 16, 21, 27, 32, 36, 38, 40]} /><Metric title="黑名单" value={3 + players.filter(player => player.role === "黑名单").length - 1} description="已加入黑名单的玩家" tone="red" icon={Ban} points={[1, 2, 3, 3, 3, 3, 5, 8, 11, 14, 16, 18]} /><Metric title="管理员" value={2 + players.filter(player => player.role === "管理员").length - 1} description="拥有管理员权限的玩家" tone="orange" icon={Crown} points={[4, 12, 15, 17, 20, 23, 26, 28, 30, 32, 35, 37]} /></div>
          <div className="gsd-filters"><label className="gsd-search"><Search size={17} /><input aria-label="搜索玩家" placeholder="搜索玩家昵称或 Steam ID..." value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label><select aria-label="玩家状态筛选" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">全部状态</option>{["在线", "离线", "已封禁"].map(value => <option key={value}>{value}</option>)}</select><select aria-label="权限组筛选" value={group} onChange={event => { setGroup(event.target.value); setPage(1); }}><option value="all">全部权限组</option>{["管理员", "成员", "白名单", "黑名单"].map(value => <option key={value}>{value}</option>)}</select><button className="gsd-button" onClick={() => { setPlayers(previous => [...previous]); onNotice("玩家列表已刷新"); }}><RefreshCw size={17} />刷新</button></div>
          <div className="gsd-table-scroll"><table className="gsd-player-table"><colgroup><col className="gsd-check-column" /><col className="gsd-name-column" /><col /><col className="gsd-login-column" /><col /><col /><col className="gsd-action-column" /></colgroup><thead><tr><th><input type="checkbox" aria-label="选择当前页全部玩家" checked={rows.length > 0 && rows.every(row => selected.includes(row.id))} ref={element => { if (element) element.indeterminate = rows.some(row => selected.includes(row.id)) && !rows.every(row => selected.includes(row.id)); }} onChange={event => setSelected(previous => event.target.checked ? [...new Set([...previous, ...rows.map(row => row.id)])] : previous.filter(id => !rows.some(row => row.id === id)))} /></th><th>玩家昵称</th><th>在线状态</th><th>最后登录</th><th>游戏时长</th><th>权限组</th><th>操作</th></tr></thead><tbody>{rows.map(player => <tr key={player.id} className={selected.includes(player.id) ? "selected" : undefined}><td><input type="checkbox" aria-label={`选择 ${player.name}`} checked={selected.includes(player.id)} onChange={event => setSelected(previous => event.target.checked ? [...previous, player.id] : previous.filter(id => id !== player.id))} /></td><td><div className="gsd-player"><img src={`/console/players/${player.avatar}.png`} alt="" width={36} height={36} /><div><button onClick={() => setPlayerDetail(player)}>{player.name}</button><small>{player.id}</small></div></div></td><td><span className={`gsd-player-status ${statusClass(player.status)}`}><i />{player.status}</span></td><td><time>{player.lastLogin}</time></td><td>{player.hours} 小时</td><td><span className={`gsd-role ${roleClass(player.role)}`}>{player.role === "管理员" && <Crown size={14} fill="currentColor" />}{player.role}</span></td><td className="gsd-row-actions"><button onClick={() => setPlayerDetail(player)}>查看</button>{player.status === "已封禁" ? <button onClick={() => actOnPlayer(player, "unban")}>解除封禁</button> : <><button onClick={() => actOnPlayer(player, "kick")}>踢出</button><button className="danger" onClick={() => actOnPlayer(player, "ban")}>封禁</button></>}</td></tr>)}{!rows.length && <tr><td colSpan={7}><div className="gsd-empty"><Search size={25} /><strong>没有符合条件的玩家</strong><button onClick={() => { setQuery(""); setStatus("all"); setGroup("all"); }}>清除筛选</button></div></td></tr>}</tbody></table></div>
          <footer className="gsd-pagination"><span>{selected.length ? `已选择 ${selected.length} 名玩家 · ` : ""}共 {filtered.length} 名玩家，当前在线 {onlineCount} 人</span><nav aria-label="玩家分页"><button aria-label="上一页玩家" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={15} /></button><button className="current" aria-current="page">{currentPage}</button><button aria-label="下一页玩家" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={15} /></button><select aria-label="每页玩家数量" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={10}>10 条/页</option><option value={5}>5 条/页</option></select></nav></footer>
        </section>
        <aside className="gsd-sidebar">{consolePanel}<section className="gsd-card gsd-quick"><h2><Settings size={20} />快捷管理</h2><div className="gsd-quick-grid">{modeDefinitions.map(mode => <div className={`gsd-quick-item ${mode.tone}`} key={mode.key}><span className="gsd-icon-tile"><mode.icon size={21} /></span><div><h3>{mode.title}</h3><p>{mode.description}</p>{"detail" in mode && <small>{mode.detail}</small>}</div><Switch className="gsd-switch" aria-label={mode.title} checked={modes[mode.key]} onCheckedChange={checked => toggleMode(mode.key, checked)} /></div>)}</div></section><section className="gsd-card gsd-events"><header><h2><Clock3 size={19} />最近事件</h2><button onClick={() => setEventsOpen(true)}>查看全部</button></header>{events.slice(0, 5).map((event, index) => <div className={`gsd-event${event.danger ? " danger" : ""}`} key={index}><i /><span>{event.text}</span><time>{event.time}</time></div>)}</section></aside>
      </div> : null}
    </div>
    {notice && <div className="gsd-toast" role="status"><Check size={17} /><span>{notice}</span><button aria-label="关闭提示" onClick={() => onNotice("")}><X size={16} /></button></div>}
    <Dialog open={terminalOpen} onOpenChange={setTerminalOpen}><DialogContent className="cloud-modal gsd-dialog ial-terminal-dialog" onOpenAutoFocus={event => { event.preventDefault(); inputRef.current?.focus(); }}><DialogTitle>服务器终端</DialogTitle><DialogDescription>{server.name} · 实时输出与指令操作（演示）</DialogDescription>{consolePanel}</DialogContent></Dialog>
    <Dialog open={!!playerDetail} onOpenChange={open => { if (!open) setPlayerDetail(null); }}><DialogContent className="cloud-modal gsd-dialog"><DialogTitle>玩家详情</DialogTitle><DialogDescription>查看玩家身份与当前服务器活动信息。</DialogDescription>{playerDetail && <><div className="gsd-player gsd-dialog-player"><img src={`/console/players/${playerDetail.avatar}.png`} alt="" /><strong>{playerDetail.name}</strong></div><dl className="gsd-server-info">{[["Steam ID", playerDetail.id], ["状态", playerDetail.status], ["权限组", playerDetail.role], ["最后登录", playerDetail.lastLogin], ["游戏时长", `${playerDetail.hours} 小时`]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></>}</DialogContent></Dialog>
    <Dialog open={shutdownMode !== null} onOpenChange={open => { if (!open) setShutdownMode(null); }}><DialogContent className="cloud-modal gsd-dialog"><DialogTitle>{shutdownMode === "force" ? "硬关机实例" : "关机实例"}</DialogTitle><DialogDescription>{shutdownMode === "force" ? "硬关机会立即终止服务器进程，可能导致未保存的数据丢失。确定继续吗？" : "关机会先通知服务器保存数据并断开当前玩家连接。确定继续吗？"}</DialogDescription><button className={`gsd-button ${shutdownMode === "force" ? "danger" : "primary"}`} onClick={() => { if (shutdownMode === "force") onForceStop(); else onStop(); setShutdownMode(null); }}>{shutdownMode === "force" ? "确认硬关机" : "确认关机"}</button></DialogContent></Dialog>
    <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}><DialogContent className="cloud-modal gsd-dialog"><DialogTitle>发送服务器公告</DialogTitle><DialogDescription>向当前服务器玩家发送公告（演示操作）。</DialogDescription><textarea aria-label="公告内容" placeholder="输入公告内容..." value={announcement} onChange={event => setAnnouncement(event.target.value)} maxLength={500} /><button className="gsd-button primary" disabled={!announcement.trim()} onClick={() => { log(`Announcement: ${announcement.trim()}`); addEvent("管理员发送了服务器公告"); onNotice("公告已发送（演示操作）"); setAnnouncement(""); setAnnouncementOpen(false); }}><Megaphone size={17} />发送公告</button></DialogContent></Dialog>
    <Dialog open={eventsOpen} onOpenChange={setEventsOpen}><DialogContent className="cloud-modal gsd-dialog"><DialogTitle>全部服务器事件</DialogTitle><DialogDescription>服务器最近活动记录（演示数据）。</DialogDescription><div className="gsd-all-events">{events.map((event, index) => <div className={`gsd-event${event.danger ? " danger" : ""}`} key={index}><i /><span>{event.text}</span><time>{event.time}</time></div>)}</div></DialogContent></Dialog>
  </div>;
}
