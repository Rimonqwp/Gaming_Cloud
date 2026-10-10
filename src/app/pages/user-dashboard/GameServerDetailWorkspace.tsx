import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { Archive, ArrowDown, ArrowUp, ArrowUpDown, Ban, Check, ChevronLeft, ChevronRight, ClipboardList, Clock3, Copy, Eye, FileText, FolderClosed, Gamepad2, House, Megaphone, Power, RefreshCw, Save, Search, Send, Settings, ShieldCheck, SquareTerminal, Swords, Timer, Trash2, Users, Wrench, X, Zap } from "lucide-react";
import { MetricTrend } from "./MetricTrend";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useUserAuth } from "../../context/UserAuthContext";
import type { ConsoleInstance } from "./cloudDashboardData";
import { InstanceDetailFilesView } from "./InstanceDetailFilesView";
import { InstanceDetailLogsView } from "./InstanceDetailLogsView";
import "../../../styles/cloud-server-detail.css";
import { GameServerOverview } from "./GameServerOverview";
import { GameServerTasks } from "./GameServerTasks";
import { GameServerMachineSettings } from "./GameServerMachineSettings";
import { GameServerBackups, type GameServerBackupsHandle } from "./GameServerBackups";
import { Box } from "lucide-react";
import { GameServerPlugins } from "./GameServerPlugins";
import { GameServerDatabases } from "./GameServerDatabases";
import { minecraftPlayerProfiles, type MinecraftPlayerProfile } from "./minecraftPlayerProfiles";
import { GameServerPlayerDetails, PlayerRoleBadges, type ServerPlayer as Player, type PlayerStatus, type PlayerRole } from "./GameServerPlayerDetails";
import { BulkPlayerActions, PlayerRowContextMenu, eligiblePlayers, type PlayerAction } from "./PlayerActionMenus";

type PlayerSortKey = "name" | "status" | "lastLogin" | "hours" | "role";
type PlayerSort = { key: PlayerSortKey; direction: "ascending" | "descending" };
const playerCollator = new Intl.Collator("zh-CN", { numeric: true, sensitivity: "base" });
const playerStatusOrder: Record<PlayerStatus, number> = { 在线: 0, 离线: 1, 已封禁: 2 };
const playerRoleOrder: Record<PlayerRole, number> = { 管理员: 0, 成员: 1, 白名单: 2, 黑名单: 3 };

function comparePlayers(a: Player, b: Player, sort: PlayerSort, minecraft: boolean) {
  let difference = 0;
  switch (sort.key) {
    case "name":
      difference = playerCollator.compare(minecraft ? a.gameId : a.name, minecraft ? b.gameId : b.name)
        || playerCollator.compare(minecraft ? a.uuid : a.id, minecraft ? b.uuid : b.id);
      break;
    case "status": difference = playerStatusOrder[a.status] - playerStatusOrder[b.status]; break;
    case "lastLogin": difference = a.lastLogin.localeCompare(b.lastLogin); break;
    case "hours": difference = a.hours - b.hours; break;
    case "role": {
      difference = Math.min(...a.roles.map(role => playerRoleOrder[role])) - Math.min(...b.roles.map(role => playerRoleOrder[role]))
        || Number(b.roles.includes("白名单")) - Number(a.roles.includes("白名单"));
      break;
    }
  }
  return (difference || playerCollator.compare(a.id, b.id)) * (sort.direction === "ascending" ? 1 : -1);
}
type DetailTab = "overview" | "players" | "files" | "databases" | "plugins" | "backups" | "logs" | "tasks" | "machine";
type Mode = "whitelist" | "pvp" | "autosave" | "maintenance";
const tabs = [
  { id: "overview", label: "概览", icon: House },
  { id: "players", label: "玩家管理", icon: Users },
  { id: "plugins", label: "插件广场", icon: Box },
  { id: "files", label: "文件管理", icon: ClipboardList },
  { id: "backups", label: "文件备份", icon: FolderClosed },
  { id: "databases", label: "数据库", icon: Box },
  { id: "tasks", label: "定时任务", icon: Timer },
  { id: "logs", label: "日志", icon: FileText },
  { id: "machine", label: "机器设定", icon: Settings },
] as const;
const basePlayers: Omit<Player, keyof MinecraftPlayerProfile>[] = [
  { name: "小帕帕", id: "76561198000000001", status: "在线", lastLogin: "2024-10-26 14:32", hours: 26, roles: ["管理员", "白名单"], avatar: "player-1" },
  { name: "天空之城", id: "76561198000000002", status: "在线", lastLogin: "2024-10-26 14:18", hours: 18, roles: ["成员", "白名单"], avatar: "player-2" },
  { name: "喵喵子", id: "76561198000000003", status: "在线", lastLogin: "2024-10-26 13:56", hours: 12, roles: ["成员"], avatar: "player-3" },
  { name: "星空旅人", id: "76561198000000004", status: "离线", lastLogin: "2024-10-26 11:20", hours: 8, roles: ["成员"], avatar: "player-4" },
  { name: "黑夜骑士", id: "76561198000000005", status: "在线", lastLogin: "2024-10-26 14:05", hours: 34, roles: ["成员", "白名单"], avatar: "player-5" },
  { name: "可乐不加冰", id: "76561198000000006", status: "已封禁", lastLogin: "2024-10-25 20:13", hours: 2, roles: ["黑名单"], avatar: "player-6" },
  { name: "山田太郎", id: "76561198000000007", status: "离线", lastLogin: "2024-10-25 18:50", hours: 6, roles: ["成员"], avatar: "player-7" },
  { name: "月下独吟", id: "76561198000000008", status: "在线", lastLogin: "2024-10-26 14:28", hours: 15, roles: ["成员"], avatar: "player-8" },
];
const initialPlayers: Player[] = basePlayers.map(player => ({ ...player, ...minecraftPlayerProfiles[player.id] }));
type ManagementAction = "封禁" | "解封" | "白名单" | "权限变更" | "移除" | "踢出";
type ManagementRecord = { id: string; playerId: string; text: string; action: ManagementAction; actor: string; time: string };
const managementActionTone: Record<ManagementAction, string> = { 封禁: "red", 解封: "green", 白名单: "blue", 权限变更: "orange", 移除: "muted", 踢出: "muted" };
const initialManagementRecords: ManagementRecord[] = [
  { id: "management-1", playerId: "76561198000000006", text: "被加入黑名单", action: "封禁", actor: "Rimon12", time: "2024-10-25 20:13" },
  { id: "management-2", playerId: "76561198000000007", text: "被移出黑名单", action: "解封", actor: "Rimon12", time: "2024-10-25 18:50" },
  { id: "management-3", playerId: "76561198000000005", text: "被加入白名单", action: "白名单", actor: "SkyCity", time: "2024-10-24 16:05" },
  { id: "management-4", playerId: "76561198000000003", text: "被设置为管理员", action: "权限变更", actor: "Rimon12", time: "2024-10-24 12:30" },
  { id: "management-5", playerId: "76561198000000004", text: "被移出白名单", action: "移除", actor: "Rimon12", time: "2024-10-23 22:17" },
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
  { key: "maintenance", title: "维护模式", description: "开启后仅管理员可进入", icon: Wrench, tone: "orange" },
] as const;
const timeFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
const clockFormat = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
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

function Metric({ title, value, unit = "人", description, tone, icon: Icon, points }: { title: string; value: number; unit?: string; description: string; tone: "green" | "blue" | "red" | "orange"; icon: typeof Users; points: number[] }) {
  const color = { green: "#00bf89", blue: "#087bff", red: "#ff4351", orange: "#f18a1c" }[tone];
  return <article className={`gsd-metric ${tone}`}>
    <div className="gsd-metric-heading"><span className="gsd-icon-tile"><Icon size={22} /></span><div><h2>{title}</h2><strong>{value}<small>{unit}</small></strong><p>{description}</p></div></div>
    <MetricTrend className="gsd-trend" points={[...points.slice(0, -1), value]} color={color} label={title} unit={unit} precision={unit === "人" ? 0 : 1} />
  </article>;
}

function PlayerSelect({ label, value, onValueChange, options }: {
  label: string; value: string; onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger className="gsd-select-trigger" aria-label={label}><SelectValue /></SelectTrigger>
    <SelectContent className="gsd-select-menu" sideOffset={5}>
      {options.map(option => <SelectItem key={option.value} value={option.value} className="gsd-select-option">{option.label}</SelectItem>)}
    </SelectContent>
  </Select>;
}

function PlayerSidebarReveal({ children, placement }: { children: ReactNode; placement: "before" | "after" }) {
  const present = useIsPresent();
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current) ref.current.inert = !present;
  }, [present]);
  return <motion.div ref={ref} className={`gsd-player-sidebar-reveal ${placement}`} aria-hidden={!present}
    initial={{ height: 0, opacity: 0, x: !reducedMotion && placement === "before" ? 32 : 0, y: !reducedMotion && placement === "after" ? -8 : 0 }}
    animate={{ height: "auto", opacity: 1, x: 0, y: 0 }}
    exit={{ height: 0, opacity: 0, x: !reducedMotion && placement === "before" ? 32 : 0, y: !reducedMotion && placement === "after" ? -8 : 0 }}
    transition={{ duration: reducedMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
    style={{ overflow: "hidden", pointerEvents: present ? "auto" : "none" }}>
    <div className="gsd-player-sidebar-reveal-content">{children}</div>
  </motion.div>;
}

export function GameServerDetailWorkspace({ server, onBack, onCopy, onRestart, onBackup, notice, onNotice, onStart, onStop, onForceStop }: {
  server: ConsoleInstance; onBack: () => void; onCopy: () => void; onRestart: () => void; onBackup: (count: number) => void;
  notice: string; onNotice: (message: string) => void; onStart: () => void; onStop: () => void; onForceStop: () => void;
}) {
  const { user } = useUserAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<DetailTab>(() => searchParams.get("view") === "databases" ? "databases" : server.game === "Minecraft" && (searchParams.has("plugin") || searchParams.get("view") === "plugins") ? "plugins" : "overview");
  useEffect(() => {
    if (searchParams.get("view") === "databases") setActiveTab("databases");
    else if (server.game === "Minecraft" && (searchParams.has("plugin") || searchParams.get("view") === "plugins")) setActiveTab("plugins");
  }, [searchParams, server.game]);
  const minecraft = server.game === "Minecraft";
  const displayPlayerId = (player: Player) => minecraft ? player.gameId : player.name;
  const playerAvatar = (player: Player) => minecraft ? player.skinAvatar : `/console/players/${player.avatar}.png`;
  const backupsRef = useRef<GameServerBackupsHandle>(null);
  const availableTabs = tabs.filter(tab => tab.id !== "plugins" || server.game === "Minecraft");
  const [players, setPlayers] = useState(() => initialPlayers.map(player => ({ ...player, status: !server.running && player.status === "在线" ? "离线" as PlayerStatus : player.status })));
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [group, setGroup] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [playerSort, setPlayerSort] = useState<PlayerSort | null>(null);
  const [logs, setLogs] = useState(() => initialLogs(server));
  const [events, setEvents] = useState(initialEvents);
  const [managementRecords, setManagementRecords] = useState(initialManagementRecords);
  const [managementRecordsOpen, setManagementRecordsOpen] = useState(false);
  const [command, setCommand] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [modes, setModes] = useState<Record<Mode, boolean>>({ whitelist: true, pvp: true, autosave: true, maintenance: false });
  const [playerDetailId, setPlayerDetailId] = useState<string | null>(null);
  const playerDetail = players.find(player => player.id === playerDetailId) ?? null;
  const detailTriggerRef = useRef<HTMLElement | null>(null);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [shutdownMode, setShutdownMode] = useState<"graceful" | "force" | null>(null);
  const [eventsOpen, setEventsOpen] = useState(false);
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

  const filtered = players.filter(player => `${player.name} ${player.id}${minecraft ? ` ${player.gameId} ${player.uuid}` : ""}`.toLowerCase().includes(query.trim().toLowerCase()) && (status === "all" || player.status === status) && (group === "all" || player.roles.includes(group as PlayerRole)));
  const sorted = playerSort ? [...filtered].sort((a, b) => comparePlayers(a, b, playerSort, minecraft)) : filtered;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedPlayers = players.filter(player => selected.includes(player.id));
  const sortHeader = (key: PlayerSortKey, label: string, description?: string) => {
    const active = playerSort?.key === key;
    const nextDirection = active && playerSort.direction === "ascending" ? "descending" : "ascending";
    const SortIcon = active ? playerSort.direction === "ascending" ? ArrowUp : ArrowDown : ArrowUpDown;
    return <th aria-sort={active ? playerSort.direction : undefined}>
      <button type="button" className={`gsd-player-sort${active ? " active" : ""}`} aria-label={`按${label}${nextDirection === "ascending" ? "升序" : "降序"}排序`} title={description} onClick={() => {
        setPlayerSort({ key, direction: nextDirection });
        setPage(1);
      }}>{label}<SortIcon size={12} aria-hidden="true" /></button>
    </th>;
  };
  const onlineCount = players.filter(player => player.status === "在线").length;
  const onlineDelta = onlineCount - initialPlayers.filter(player => player.status === "在线").length;
  const averagePlayHours = players.length ? Math.round(players.reduce((total, player) => total + player.hours, 0) / players.length * 10) / 10 : 0;
  const log = (text: string) => setLogs(previous => [...previous, `[${clockFormat.format(new Date())}] ${text}`]);
  const openPlayerDetail = (player: Player) => {
    detailTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPlayerDetailId(player.id);
    setActiveTab("players");
  };
  const closePlayerDetail = () => {
    setPlayerDetailId(null);
    if (detailTriggerRef.current?.isConnected) detailTriggerRef.current.focus({ preventScroll: true });
    else document.getElementById("gsd-tab-players")?.focus({ preventScroll: true });
  };
  const addEvent = (text: string, danger = false) => setEvents(previous => [{ text, time: timeFormat.format(new Date()), danger }, ...previous]);
  const actOnPlayers = (targets: Player[], action: PlayerAction, bulk = false) => {
    const affected = eligiblePlayers(targets, action);
    if (!affected.length) { onNotice("没有可执行此操作的玩家"); return; }
    const ids = new Set(affected.map(player => player.id));
    setPlayers(previous => previous.map<Player>(row => {
      if (!ids.has(row.id)) return row;
      if (action === "whitelist-add") return { ...row, roles: [...row.roles, "白名单"] };
      if (action === "whitelist-remove") {
        const roles = row.roles.filter(role => role !== "白名单");
        return { ...row, roles: roles.length ? roles : ["成员"] };
      }
      return { ...row, status: action === "ban" ? "已封禁" : "离线", roles: action === "ban" ? ["黑名单"] : action === "unban" ? ["成员"] : row.roles };
    }));
    const definitions: Record<PlayerAction, { label: string; text: string; recordAction: ManagementAction }> = {
      kick: { label: "踢出", text: "被踢出服务器", recordAction: "踢出" },
      ban: { label: "封禁", text: "被加入黑名单", recordAction: "封禁" },
      unban: { label: "解除封禁", text: "被移出黑名单", recordAction: "解封" },
      "whitelist-add": { label: "加入白名单", text: "被加入白名单", recordAction: "白名单" },
      "whitelist-remove": { label: "移出白名单", text: "被移出白名单", recordAction: "移除" },
    };
    const definition = definitions[action];
    const time = timeFormat.format(new Date());
    const actor = user?.displayName || user?.username || "本地管理员";
    setManagementRecords(previous => [...affected.map(player => ({ id: crypto.randomUUID(), playerId: player.id, text: definition.text, action: definition.recordAction, actor, time })), ...previous]);
    const text = bulk ? `已对 ${affected.length} 名玩家执行${definition.label}${targets.length > affected.length ? `，跳过 ${targets.length - affected.length} 名不适用玩家` : ""}` : `${displayPlayerId(affected[0])} 已${definition.text}`;
    log(`Player: ${text}`); addEvent(text, action === "ban"); onNotice(`${text}（演示操作）`);
  };
  const actOnPlayer = (player: Player, action: PlayerAction) => actOnPlayers([player], action);
  const actOnSelection = (action: PlayerAction) => actOnPlayers(selectedPlayers, action, true);
  const changePlayerRole = (player: Player, roles: PlayerRole[]) => {
    const banned = roles.includes("黑名单");
    setPlayers(previous => previous.map<Player>(row => row.id === player.id ? { ...row, roles, status: banned ? "已封禁" : row.status === "已封禁" ? "离线" : row.status } : row));
    const groups = roles.join(" + ");
    const text = `${displayPlayerId(player)} 的权限组已设为${groups}`;
    setManagementRecords(previous => [{ id: crypto.randomUUID(), playerId: player.id, text: `权限组被设为${groups}`, action: "权限变更", actor: user?.displayName || user?.username || "本地管理员", time: timeFormat.format(new Date()) }, ...previous]);
    log(`Player: ${text}（演示操作）`); addEvent(text, banned); onNotice(`${text}（演示操作）`);
  };
  const save = () => { backupsRef.current?.createBackup(); };
  const backupCompleted = () => { log("Save: 世界存档备份已完成（演示操作）"); addEvent("已创建世界存档备份"); };
  const sendCommand = () => {
    const value = command.trim();
    if (!value) return;
    log(`Console: ${value}`); setCommand("");
    const [action, ...args] = value.split(/\s+/);
    const target = players.find(player => player.name === args.join(" ") || player.id === args.join(" ") || minecraft && (player.gameId === args.join(" ") || player.uuid === args.join(" ")));
    if (action === "save") save();
    else if (["kick", "ban", "unban"].includes(action)) {
      if (target) actOnPlayer(target, action as "kick" | "ban" | "unban");
      else { log(`Console: 未找到玩家，请输入${minecraft ? "玩家 ID 或 UUID" : "完整昵称或 Steam ID"}`); onNotice(`未找到玩家，请检查${minecraft ? "玩家 ID 或 UUID" : "昵称或 Steam ID"}`); }
    } else { log("Console: 已接收指令（演示操作）"); onNotice("指令已发送（演示操作）"); }
  };
  const toggleMode = (key: Mode, checked: boolean) => {
    setModes(previous => ({ ...previous, [key]: checked }));
    const title = modeDefinitions.find(mode => mode.key === key)?.title;
    log(`Settings: ${title}已${checked ? "开启" : "关闭"}（演示操作）`);
    onNotice(`${title}已${checked ? "开启" : "关闭"}（演示操作）`);
  };
  const renderManagementRecords = (records: ManagementRecord[]) => <ul className={`gsd-management-list${minecraft ? " minecraft" : ""}`}>
    {records.map(record => {
      const player = players.find(player => player.id === record.playerId);
      if (!player) return null;
      return <li key={record.id}>
        <img src={playerAvatar(player)} alt="" width={30} height={30} />
        <div className="gsd-management-content">
          <p><button type="button" onClick={() => { setManagementRecordsOpen(false); openPlayerDetail(player); }}>{displayPlayerId(player)}</button> {record.text}</p>
          <div className="gsd-management-meta"><span>管理员 {record.actor}</span><span aria-hidden="true"> · </span><time dateTime={`${record.time.replace(" ", "T")}+08:00`}>{record.time}</time></div>
        </div>
        <span className={`gsd-management-badge ${managementActionTone[record.action]}`}>{record.action}</span>
      </li>;
    })}
  </ul>;
  const consolePanel = <section className="gsd-card gsd-console" aria-label="实时控制台">
    <header><h2><SquareTerminal size={20} />实时控制台</h2><div><button onClick={() => setLogs([])}><Trash2 size={14} />清空</button><label className="gsd-auto"><Eye size={15} /><span>自动滚动</span><Switch className="gsd-switch" aria-label="自动滚动" checked={autoScroll} onCheckedChange={setAutoScroll} /></label></div></header>
    <pre ref={consoleRef} aria-label="服务器控制台输出" tabIndex={0}>{logs.length ? logs.map((line, index) => <code key={index}>{line.split(/(Server:|Game:|Player:|Warning:|Save:|Console:|Settings:|Announcement:)/).map((part, index) => <span key={index} className={part === "Warning:" ? "warning" : part.endsWith(":") ? "category" : undefined}>{part}</span>)}</code>) : <span className="gsd-log-empty">控制台已清空，等待新的输出...</span>}</pre>
    <form className="gsd-command" onSubmit={event => { event.preventDefault(); sendCommand(); }}><input ref={inputRef} aria-label="控制台指令" value={command} onChange={event => setCommand(event.target.value)} placeholder="输入指令并发送（如：save、kick 玩家名、ban 玩家名...）" /><button className="gsd-button primary" type="submit"><Send size={17} />发送</button></form>
  </section>;

  const serverHeader = <header className="gsd-hero"><div className="gsd-identity"><span className="gsd-game-icon">{server.game === "Minecraft" ? <img src="/console/minecraft/grass-block.png" alt="Minecraft 草方块" /> : <Gamepad2 size={30} />}</span><div><div className="gsd-title"><h1>{server.name}</h1><span className={`gsd-running${server.running ? "" : " stopped"}`}><i />{server.running ? "运行中" : "已停止"}</span></div><p><span>实例 ID：{server.id === "srv-pal-01" ? "ins-8f3a2d1c" : server.id}</span><i /><span>连接地址：{server.ip}:{server.port}</span><button aria-label="复制连接地址" onClick={onCopy}><Copy size={14} /></button></p></div></div><div className="gsd-actions"><button className="gsd-button" onClick={() => server.running ? setShutdownMode("graceful") : onNotice("服务器已停止")}><Power size={17} />关机</button><button className="gsd-button danger" onClick={() => server.running ? setShutdownMode("force") : onNotice("服务器已停止")}><Zap size={17} />硬关机</button><button className="gsd-button" onClick={onRestart}><RefreshCw size={18} />{server.running ? "重启实例" : "启动实例"}</button><button className="gsd-button" onClick={save}><Archive size={18} />备份数据</button></div></header>;

  return <div className={`gsd-page${activeTab === "databases" ? " gsd-databases-page" : ""}`}>
    <nav className="gsd-breadcrumb" aria-label="面包屑">{["控制台", "实例", "游戏服务器"].map(label => <span key={label}><button onClick={onBack}>{label}</button><ChevronRight size={13} /></span>)}<strong>实例详情</strong></nav>
    {serverHeader}
    <nav className="gsd-tabs" role="tablist" aria-label="实例详情导航">{availableTabs.map((tab, index) => <button key={tab.id} id={`gsd-tab-${tab.id}`} role="tab" aria-selected={activeTab === tab.id} aria-controls="gsd-panel" tabIndex={activeTab === tab.id ? 0 : -1} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)} onKeyDown={event => {
      const next = event.key === "ArrowRight" ? (index + 1) % availableTabs.length : event.key === "ArrowLeft" ? (index + availableTabs.length - 1) % availableTabs.length : event.key === "Home" ? 0 : event.key === "End" ? availableTabs.length - 1 : -1;
      if (next >= 0) { event.preventDefault(); setActiveTab(availableTabs[next].id); document.getElementById(`gsd-tab-${availableTabs[next].id}`)?.focus(); }
    }}><tab.icon size={17} />{tab.label}</button>)}</nav>
    <div ref={panelRef} id="gsd-panel" className="gsd-panel" role="tabpanel" tabIndex={0} aria-labelledby={`gsd-tab-${activeTab}`}>
      <div hidden={activeTab !== "machine"}><GameServerMachineSettings terminal={consolePanel} server={server} onNotice={onNotice} onLog={log} rebuildHeader={serverHeader} onNavigate={id => setActiveTab(id as DetailTab)} onBackup={() => backupsRef.current?.createBackup() ?? false} /></div>
      <div hidden={activeTab !== "files"}><InstanceDetailFilesView onNotice={onNotice} /></div>
      <div hidden={activeTab !== "logs"}><InstanceDetailLogsView serverName={server.name} onNotice={onNotice} /></div>
      <div hidden={activeTab !== "overview"}><GameServerOverview server={server} onStart={onStart} onStop={onStop} onRestart={onRestart} onBackup={save} onOpen={setActiveTab} onNotice={onNotice} terminal={consolePanel} /></div>
      <div hidden={activeTab !== "tasks"}><GameServerTasks server={server} autosaveEnabled={modes.autosave} onAutosaveChange={checked => toggleMode("autosave", checked)} onNotice={onNotice} onLog={log} /></div>
      <div hidden={activeTab !== "backups"}><GameServerBackups ref={backupsRef} server={server} onBackup={backupCompleted} onCountChange={onBackup} onNotice={onNotice} /></div>
      <div hidden={activeTab !== "databases"}><GameServerDatabases server={server} onNotice={onNotice} /></div>
      {activeTab === "plugins" && <GameServerPlugins server={server} onNotice={onNotice} />}
      {activeTab === "files" || activeTab === "overview" || activeTab === "tasks" || activeTab === "plugins" || activeTab === "backups" || activeTab === "machine" || activeTab === "databases" ? null : activeTab === "players" ? <div className={`gsd-layout gsd-players-layout${playerDetail ? " gsd-player-selected" : ""}`}>
        <div className="gsd-metrics gsd-player-metrics" role="region" aria-label="玩家统计">
          <Metric title="在线玩家" value={Math.max(0, server.running ? server.players + onlineDelta : 0)} description="当前服务器在线人数" tone="green" icon={Users} points={[7, 9, 9, 9, 15, 15, 13, 14, 24, 24, 24, 22, 29, 29, 30, 31, 32]} />
          <Metric title="白名单" value={40 + players.filter(player => player.roles.includes("白名单")).length - initialPlayers.filter(player => player.roles.includes("白名单")).length} description="已加入白名单的玩家" tone="blue" icon={ClipboardList} points={[5, 12, 16, 18, 17, 15, 16, 21, 27, 32, 36, 38, 40]} />
          <Metric title="黑名单" value={3 + players.filter(player => player.roles.includes("黑名单")).length - 1} description="已加入黑名单的玩家" tone="red" icon={Ban} points={[1, 2, 3, 3, 3, 3, 5, 8, 11, 14, 16, 18]} />
          <Metric title="平均在线时长" value={averagePlayHours} unit="小时" description="所有玩家游戏时长均值" tone="orange" icon={Clock3} points={[8, 9, 10, 11, 11.4, 12.2, 13, 13.6, 14.2, 14.8, averagePlayHours]} />
        </div>
        <section className="gsd-main gsd-card" aria-label="玩家管理">
          <div className="gsd-filters"><label className="gsd-search"><Search size={17} /><input aria-label="搜索玩家" placeholder={minecraft ? "搜索玩家 ID、UUID 或昵称..." : "搜索玩家昵称或 Steam ID..."} value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label><PlayerSelect label="玩家状态筛选" value={status} onValueChange={value => { setStatus(value); setPage(1); }} options={[{ value: "all", label: "全部状态" }, ...["在线", "离线", "已封禁"].map(value => ({ value, label: value }))]} /><PlayerSelect label="权限组筛选" value={group} onValueChange={value => { setGroup(value); setPage(1); }} options={[{ value: "all", label: "全部权限组" }, ...["管理员", "成员", "白名单", "黑名单"].map(value => ({ value, label: value }))]} /><button className="gsd-button" onClick={() => { setPlayers(previous => [...previous]); onNotice("玩家列表已刷新"); }}><RefreshCw size={17} />刷新</button></div>
          <div className="gsd-player-list-heading"><div className="gsd-player-list-title"><h2>玩家列表</h2>{!!selectedPlayers.length && <span className="gsd-selection-summary">已选 {selectedPlayers.length} 人</span>}</div><div className="gsd-player-list-tools"><span>{server.game} · {filtered.length} 名玩家 · 演示数据</span><BulkPlayerActions players={selectedPlayers} onAction={actOnSelection} onClear={() => setSelected([])} /></div></div>
          <div className="gsd-table-scroll"><table className={`gsd-player-table${minecraft ? " minecraft" : ""}`}>
            <colgroup><col className="gsd-check-column" /><col className="gsd-name-column" /><col /><col className="gsd-login-column" /><col /><col /><col className="gsd-action-column" /></colgroup>
            <thead><tr>
              <th><input type="checkbox" aria-label="选择当前页全部玩家" checked={rows.length > 0 && rows.every(row => selected.includes(row.id))} ref={element => { if (element) element.indeterminate = rows.some(row => selected.includes(row.id)) && !rows.every(row => selected.includes(row.id)); }} onChange={event => setSelected(previous => event.target.checked ? [...new Set([...previous, ...rows.map(row => row.id)])] : previous.filter(id => !rows.some(row => row.id === id)))} /></th>
              {sortHeader("name", minecraft ? "玩家 ID / UUID" : "玩家昵称", minecraft ? "按玩家 ID 排序，相同时比较 UUID" : "按玩家昵称排序")}{sortHeader("status", "在线状态", "升序：在线、离线、已封禁")}{sortHeader("lastLogin", "最后登录")}{sortHeader("hours", "游戏时长")}{sortHeader("role", "权限组", "升序：管理员、成员、黑名单；同组优先白名单玩家")}<th>操作</th>
            </tr></thead>
            <tbody>{rows.map(player => <PlayerRowContextMenu key={player.id} player={player} playerName={displayPlayerId(player)} selectedPlayers={selectedPlayers} onBulkAction={actOnSelection} onAction={action => actOnPlayer(player, action)} onView={() => openPlayerDetail(player)}><tr className={selected.includes(player.id) ? "selected" : undefined} title="双击查看详情，右键打开操作菜单" onDoubleClick={event => {
              if (!(event.target instanceof Element) || event.target.closest("button, input, a, select, [role='button']")) return;
              openPlayerDetail(player);
            }}>
              <td><input type="checkbox" aria-label={`选择 ${displayPlayerId(player)}`} checked={selected.includes(player.id)} onChange={event => setSelected(previous => event.target.checked ? [...previous, player.id] : previous.filter(id => id !== player.id))} /></td>
              <td><div className={`gsd-player${minecraft ? " minecraft" : ""}`}><img src={playerAvatar(player)} alt={`${displayPlayerId(player)} 的玩家头像`} width={36} height={36} /><div><button title={player.name} onClick={() => openPlayerDetail(player)}>{displayPlayerId(player)}</button><small title={minecraft ? player.uuid : player.id}>{minecraft ? player.uuid : player.id}</small></div></div></td>
              <td><span className={`gsd-player-status ${statusClass(player.status)}`}><i />{player.status}</span></td>
              <td><time>{player.lastLogin}</time></td><td>{player.hours} 小时</td>
              <td><PlayerRoleBadges roles={player.roles} /></td>
              <td className="gsd-row-actions"><button onClick={() => openPlayerDetail(player)}>查看</button>{player.status === "已封禁" ? <button onClick={() => actOnPlayer(player, "unban")}>解除封禁</button> : <><button disabled={player.status !== "在线"} title={player.status !== "在线" ? "玩家当前未在线" : undefined} onClick={() => actOnPlayer(player, "kick")}>踢出</button><button className="danger" onClick={() => actOnPlayer(player, "ban")}>封禁</button></>}</td>
            </tr></PlayerRowContextMenu>)}{!rows.length && <tr><td colSpan={7}><div className="gsd-empty"><Search size={25} /><strong>没有符合条件的玩家</strong><button onClick={() => { setQuery(""); setStatus("all"); setGroup("all"); }}>清除筛选</button></div></td></tr>}</tbody>
          </table></div>
          <footer className="gsd-pagination"><span>{selected.length ? `已选择 ${selected.length} 名玩家 · ` : ""}共 {filtered.length} 名玩家，当前在线 {onlineCount} 人</span><nav aria-label="玩家分页"><button aria-label="上一页玩家" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={15} /></button><button className="current" aria-current="page">{currentPage}</button><button aria-label="下一页玩家" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={15} /></button><PlayerSelect label="每页玩家数量" value={String(pageSize)} onValueChange={value => { setPageSize(Number(value)); setPage(1); }} options={[{ value: "10", label: "10 条/页" }, { value: "5", label: "5 条/页" }]} /></nav></footer>
        </section>
        <aside className="gsd-sidebar gsd-player-sidebar">
          <AnimatePresence initial={false}>
            {playerDetail && <PlayerSidebarReveal key="player-details" placement="before"><GameServerPlayerDetails key={playerDetail.id} player={playerDetail} minecraft={minecraft} averageHours={averagePlayHours} records={managementRecords.filter(record => record.playerId === playerDetail.id)} onClose={closePlayerDetail} onAction={action => actOnPlayer(playerDetail, action)} onRoleChange={role => changePlayerRole(playerDetail, role)} onNotice={onNotice} /></PlayerSidebarReveal>}
          </AnimatePresence>
          <section className="gsd-card gsd-quick"><h2><Settings size={20} />快捷管理</h2><div className="gsd-quick-grid">{modeDefinitions.filter(mode => mode.key === "whitelist" || mode.key === "maintenance").map(mode => <div className={`gsd-quick-item ${mode.tone}`} key={mode.key} title={mode.description}><span className="gsd-icon-tile"><mode.icon size={21} /></span><div><h3>{mode.title}</h3><p>{mode.description}</p></div><Switch className="gsd-switch" aria-label={mode.title} checked={modes[mode.key]} onCheckedChange={checked => toggleMode(mode.key, checked)} /></div>)}</div></section>
          <AnimatePresence initial={false}>{!playerDetail && <PlayerSidebarReveal key="management-records" placement="after"><section className="gsd-card gsd-management-records" aria-label="最近管理记录">
            <header><h2><ShieldCheck size={18} />最近管理记录</h2><button className="gsd-management-more" type="button" aria-label="查看更多管理记录" onClick={() => setManagementRecordsOpen(true)}>查看更多<ChevronRight size={13} /></button></header>
            {renderManagementRecords(managementRecords.slice(0, 5))}
          </section></PlayerSidebarReveal>}</AnimatePresence>
        </aside>
      </div> : null}
    </div>
    {notice && <div className="gsd-toast" role="status"><Check size={17} /><span>{notice}</span><button aria-label="关闭提示" onClick={() => onNotice("")}><X size={16} /></button></div>}
    <Dialog open={managementRecordsOpen} onOpenChange={setManagementRecordsOpen}><DialogContent className="cloud-modal gsd-dialog"><DialogTitle>全部管理记录</DialogTitle><DialogDescription>玩家管理操作记录，时间为北京时间；当前为演示数据，新操作仅保存在本次页面会话中。</DialogDescription><div className="gsd-management-history">{renderManagementRecords(managementRecords)}</div></DialogContent></Dialog>
    <Dialog open={shutdownMode !== null} onOpenChange={open => { if (!open) setShutdownMode(null); }}><DialogContent className="cloud-modal gsd-dialog"><DialogTitle>{shutdownMode === "force" ? "硬关机实例" : "关机实例"}</DialogTitle><DialogDescription>{shutdownMode === "force" ? "硬关机会立即终止服务器进程，可能导致未保存的数据丢失。确定继续吗？" : "关机会先通知服务器保存数据并断开当前玩家连接。确定继续吗？"}</DialogDescription><button className={`gsd-button ${shutdownMode === "force" ? "danger" : "primary"}`} onClick={() => { if (shutdownMode === "force") onForceStop(); else onStop(); setShutdownMode(null); }}>{shutdownMode === "force" ? "确认硬关机" : "确认关机"}</button></DialogContent></Dialog>
    <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}><DialogContent className="cloud-modal gsd-dialog"><DialogTitle>发送服务器公告</DialogTitle><DialogDescription>向当前服务器玩家发送公告（演示操作）。</DialogDescription><textarea aria-label="公告内容" placeholder="输入公告内容..." value={announcement} onChange={event => setAnnouncement(event.target.value)} maxLength={500} /><button className="gsd-button primary" disabled={!announcement.trim()} onClick={() => { log(`Announcement: ${announcement.trim()}`); addEvent("管理员发送了服务器公告"); onNotice("公告已发送（演示操作）"); setAnnouncement(""); setAnnouncementOpen(false); }}><Megaphone size={17} />发送公告</button></DialogContent></Dialog>
    <Dialog open={eventsOpen} onOpenChange={setEventsOpen}><DialogContent className="cloud-modal gsd-dialog"><DialogTitle>全部服务器事件</DialogTitle><DialogDescription>服务器最近活动记录（演示数据）。</DialogDescription><div className="gsd-all-events">{events.map((event, index) => <div className={`gsd-event${event.danger ? " danger" : ""}`} key={index}><i /><span>{event.text}</span><time>{event.time}</time></div>)}</div></DialogContent></Dialog>
  </div>;
}
