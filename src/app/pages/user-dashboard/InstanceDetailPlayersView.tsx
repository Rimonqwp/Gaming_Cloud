import { useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  Gamepad2,
  ListFilter,
  Play,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  Terminal,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { ConsoleInstance } from "./cloudDashboardData";

type Player = {
  name: string;
  id: string;
  status: "在线" | "离线" | "已封禁";
  lastLogin: string;
  hours: string;
  role: "管理员" | "白名单" | "成员" | "黑名单";
  avatar: string;
};

const players: Player[] = [
  { name: "小帕帕", id: "76561198000000001", status: "在线", lastLogin: "2024-10-26 14:32", hours: "26 小时", role: "管理员", avatar: "🧑🏻‍🚀" },
  { name: "天空之城", id: "76561198000000002", status: "在线", lastLogin: "2024-10-26 14:18", hours: "18 小时", role: "成员", avatar: "🏔️" },
  { name: "喵喵子", id: "76561198000000003", status: "在线", lastLogin: "2024-10-26 13:56", hours: "12 小时", role: "成员", avatar: "🐶" },
  { name: "星空旅人", id: "76561198000000004", status: "离线", lastLogin: "2024-10-26 11:20", hours: "8 小时", role: "成员", avatar: "🌸" },
  { name: "黑夜骑士", id: "76561198000000005", status: "在线", lastLogin: "2024-10-26 14:05", hours: "34 小时", role: "白名单", avatar: "🌌" },
  { name: "可乐不加冰", id: "76561198000000006", status: "已封禁", lastLogin: "2024-10-25 20:13", hours: "2 小时", role: "黑名单", avatar: "🐻" },
  { name: "山田太郎", id: "76561198000000007", status: "离线", lastLogin: "2024-10-25 18:50", hours: "6 小时", role: "成员", avatar: "🌅" },
  { name: "月下独吟", id: "76561198000000008", status: "在线", lastLogin: "2024-10-26 14:28", hours: "15 小时", role: "成员", avatar: "🐱" },
];

const consoleLines = [
  "[14:28:31] Server：服务器已启动，运行版本 v0.3.2.1",
  "[14:28:31] Server：正在加载世界数据...",
  "[14:28:33] Game：World loaded (Palworld)",
  "[14:28:36] Player：小帕帕 (76561198000000001) 已加入游戏",
  "[14:28:45] Player：天空之城 (76561198000000002) 已加入游戏",
  "[14:29:02] Player：喵喵子 (76561198000000003) 已加入游戏",
  "[14:29:18] Warning：检测到异常移动行为：可乐不加冰 (76561198000000006)",
  "[14:29:21] Player：黑夜骑士 (76561198000000005) 已加入游戏",
  "[14:29:35] Save：世界已自动保存（耗时 3.2 秒）",
  "[14:30:12] Player：月下独吟 (76561198000000008) 已加入游戏",
];

const events = [
  ["小帕帕 加入了游戏", "2024-10-26 14:29", "green"],
  ["月下独吟 加入了游戏", "2024-10-26 14:28", "green"],
  ["黑夜骑士 加入了游戏", "2024-10-26 14:21", "green"],
  ["可乐不加冰 被管理员封禁", "2024-10-26 14:18", "red"],
  ["喵喵子 加入了游戏", "2024-10-26 13:56", "green"],
] as const;

const metricLines = {
  online: [12, 12, 14, 14, 16, 16, 15, 18, 20, 20, 24, 26, 25, 28, 28, 32],
  white: [12, 13, 15, 15, 18, 19, 21, 22, 24, 27, 29, 31, 34, 36, 38, 40],
  black: [0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3],
  admins: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2],
};

function MiniLine({ points, color }: { points: number[]; color: string }) {
  const max = Math.max(...points, 1);
  const path = points.map((point, index) => `${(index / (points.length - 1)) * 100},${34 - (point / max) * 27}`).join(" ");
  return <svg className="idp-mini-line" viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true"><polyline points={path} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" /></svg>;
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" className={`idp-switch ${checked ? "on" : ""}`} aria-pressed={checked} aria-label={label} onClick={onChange}><span /></button>;
}

export function InstanceDetailPlayersView({
  server,
  onBack,
  onCopy,
  onRestart,
  onBackup,
  notice,
  onNotice,
}: {
  server: ConsoleInstance;
  onBack: () => void;
  onCopy: () => void;
  onRestart: () => void;
  onBackup: () => void;
  notice: string;
  onNotice: (message: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [group, setGroup] = useState("all");
  const [command, setCommand] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [modes, setModes] = useState({ whitelist: true, pvp: true, autosave: true, maintenance: false });
  const [sentLines, setSentLines] = useState<string[]>([]);
  const filteredPlayers = useMemo(() => players.filter((player) => {
    const matchesQuery = `${player.name} ${player.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "all" || player.status === status;
    const matchesGroup = group === "all" || player.role === group;
    return matchesQuery && matchesStatus && matchesGroup;
  }), [query, status, group]);
  const toggleMode = (key: keyof typeof modes) => setModes((previous) => ({ ...previous, [key]: !previous[key] }));
  const sendCommand = () => {
    if (!command.trim()) return;
    setSentLines((previous) => [...previous, `[14:30:21] Console：${command.trim()}`]);
    setCommand("");
    onNotice("命令已发送到实时控制台（演示操作）");
  };
  const serverName = server.id === "srv-pal-01" ? "幻兽帕鲁公会服" : server.name;

  return <div className="idp-page">
    <div className="idp-breadcrumb"><button type="button" onClick={onBack}>控制台</button><span>›</span><button type="button" onClick={onBack}>实例</button><span>›</span><button type="button" onClick={onBack}>游戏服务器</button><span>›</span><strong>实例详情</strong></div>
    <header className="idp-hero">
      <div className="idp-identity"><span className="idp-game-icon"><Gamepad2 size={25} /></span><div><div className="idp-title-row"><h1>{serverName}</h1><span className="idp-running"><i />运行中</span></div><p>实例 ID：ins-8f3a2d1c <b /> 连接地址：{server.ip}:8211 <button type="button" aria-label="复制连接地址" onClick={onCopy}><Copy size={14} /></button></p></div></div>
      <div className="idp-actions"><button type="button" onClick={() => onNotice("公告编辑已打开（演示操作）")}><Bell size={15} />发送公告</button><button type="button" onClick={onRestart}><RefreshCw size={16} />重启实例</button><button type="button" onClick={onBackup}><Archive size={16} />备份数据</button><button type="button" className="dark" onClick={() => onNotice("终端连接已打开（演示操作）")}><Terminal size={15} />打开终端</button></div>
    </header>
    <nav className="idp-tabs" aria-label="实例详情导航">{["概览", "性能监控", "玩家管理", "文件备份", "日志", "定时任务"].map((tab) => <button key={tab} type="button" className={tab === "玩家管理" ? "active" : ""} onClick={() => tab !== "玩家管理" && onNotice(`${tab}页面已准备就绪（演示操作）`)}>{tab}</button>)}</nav>
    <div className="idp-layout">
      <main className="idp-main">
        <section className="idp-metrics">{[
          { label: "在线玩家", value: "32", unit: "人", desc: "当前服务器在线人数", tone: "green", points: metricLines.online },
          { label: "白名单", value: "40", unit: "人", desc: "已加入白名单的玩家", tone: "blue", points: metricLines.white },
          { label: "黑名单", value: "3", unit: "人", desc: "已加入黑名单的玩家", tone: "red", points: metricLines.black },
          { label: "管理员", value: "2", unit: "人", desc: "拥有管理员权限的玩家", tone: "orange", points: metricLines.admins },
        ].map((metric) => <article className={`idp-metric ${metric.tone}`} key={metric.label}><div className="idp-metric-icon">{metric.tone === "green" ? <Users size={22} /> : metric.tone === "blue" ? <Clipboard size={21} /> : metric.tone === "red" ? <X size={22} /> : <Shield size={22} />}</div><div><h2>{metric.label}</h2><strong>{metric.value}<small>{metric.unit}</small></strong><p>{metric.desc}</p></div><MiniLine points={metric.points} color={metric.tone === "green" ? "#0bc28c" : metric.tone === "blue" ? "#1683ff" : metric.tone === "red" ? "#ff4351" : "#f18a1c"} /></article>)}
        </section>
        <section className="idp-player-panel"><div className="idp-player-toolbar"><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索玩家昵称或 Steam ID..." /></label><select aria-label="玩家状态筛选" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">全部状态</option><option>在线</option><option>离线</option><option>已封禁</option></select><select aria-label="权限组筛选" value={group} onChange={(event) => setGroup(event.target.value)}><option value="all">全部权限组</option><option>管理员</option><option>白名单</option><option>成员</option><option>黑名单</option></select><button type="button" onClick={() => { setQuery(""); setStatus("all"); setGroup("all"); onNotice("玩家列表已刷新"); }}><RefreshCw size={15} />刷新</button></div><div className="idp-player-table-wrap"><table className="idp-player-table"><thead><tr><th><input type="checkbox" aria-label="选择全部玩家" /></th><th>玩家昵称</th><th>在线状态</th><th>最后登录</th><th>游戏时长</th><th>权限组</th><th>操作</th></tr></thead><tbody>{filteredPlayers.map((player) => <tr key={player.id}><td><input type="checkbox" aria-label={`选择 ${player.name}`} /></td><td><div className="idp-player-name"><span>{player.avatar}</span><b>{player.name}</b><small>{player.id}</small></div></td><td><span className={`idp-player-status ${player.status === "在线" ? "online" : player.status === "已封禁" ? "banned" : "offline"}`}><i />{player.status}</span></td><td>{player.lastLogin}</td><td>{player.hours}</td><td><span className={`idp-role ${player.role === "管理员" ? "admin" : player.role === "白名单" ? "white" : player.role === "黑名单" ? "black" : "member"}`}>{player.role}</span></td><td><button type="button" onClick={() => onNotice(`已查看 ${player.name} 的玩家详情`)}>查看</button><button type="button" onClick={() => onNotice(`${player.name} 已被踢出服务器（演示操作）`)}>踢出</button>{player.status === "已封禁" ? <button type="button" className="danger" onClick={() => onNotice(`${player.name} 已解除封禁（演示操作）`)}>解封</button> : <button type="button" className="danger" onClick={() => onNotice(`${player.name} 已被封禁（演示操作）`)}>封禁</button>}</td></tr>)}</tbody></table></div><footer className="idp-table-footer"><span>共 8 名玩家，当前在线 {players.filter((player) => player.status === "在线").length} 人</span><div><button type="button" disabled>‹</button><button type="button" className="selected">1</button><button type="button" disabled>›</button><select aria-label="每页玩家数量"><option>10 条/页</option></select></div></footer></section>
      </main>
      <aside className="idp-sidebar">
        <section className="idp-card idp-console"><header><h2><Terminal size={17} />实时控制台</h2><div><button type="button" onClick={() => setSentLines([])}><X size={14} />清空</button><button type="button" className="idp-auto" onClick={() => setAutoScroll((value) => !value)}><span className={autoScroll ? "on" : ""}><i /></span>自动滚动</button></div></header><pre>{[...consoleLines, ...sentLines].map((line, index) => <code key={`${line}-${index}`} className={line.includes("Warning") ? "warning" : ""}>{line}</code>)}</pre><div className="idp-command"><input value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendCommand()} placeholder="输入指令并发送（如：save、kick 玩家名、ban 玩家名...）" /><button type="button" onClick={sendCommand}><Send size={15} />发送</button></div></section>
        <section className="idp-card idp-quick"><h2><Settings size={17} />快捷管理</h2><div className="idp-quick-grid">{[
          ["whitelist", "白名单模式", "仅白名单玩家可加入服务器", "#0bbf8a", Clipboard],
          ["pvp", "PVP 模式", "允许玩家之间进行 PVP", "#1683ff", Shield],
          ["autosave", "自动保存", "定时自动保存世界数据", "#1683ff", Archive],
          ["maintenance", "维护模式", "阻止新玩家加入服务器", "#ef8b24", Wrench],
        ].map(([key, title, desc, color, Icon]) => <div className="idp-quick-item" key={String(key)}><span className="idp-quick-icon" style={{ color: String(color) }}><Icon size={19} /></span><div><b>{String(title)}</b><small>{String(desc)}</small>{key === "autosave" && <em>每 30 分钟保存一次</em>}{key === "maintenance" && <em>开启后仅管理员可进入</em>}</div><Switch checked={modes[key as keyof typeof modes]} onChange={() => toggleMode(key as keyof typeof modes)} label={`切换${String(title)}`} /></div>)}</div></section>
        <section className="idp-card idp-events"><header><h2><span className="idp-clock">◷</span>最近事件</h2><button type="button" onClick={() => onNotice("已打开全部事件")} >查看全部</button></header>{events.map(([label, time, tone]) => <div key={label}><i className={tone} /><span>{label}</span><time>{time}</time></div>)}</section>
      </aside>
    </div>
    {notice && <div className="idp-toast" role="status"><Check size={15} />{notice}<button type="button" aria-label="关闭提示" onClick={() => onNotice("")}><X size={14} /></button></div>}
  </div>;
}
