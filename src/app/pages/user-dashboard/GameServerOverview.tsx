import { useState } from "react";
import { Archive, ArrowDown, ArrowUp, BadgeCheck, Check, ChevronRight, ClipboardCheck, Clock3, Copy, Cpu, Crown, Database, FileText, Folder, Gamepad2, Globe2, HardDrive, KeyRound, MapPin, Megaphone, ChartColumnBig, Pin, PlayCircle, RefreshCw, Save, Settings, ShieldCheck, Square, Target, Timer, TrendingUp, UsersRound, Users, Waypoints } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import type { ConsoleInstance } from "./cloudDashboardData";
import "../../../styles/cloud-instance-overview.css";

type Resource = "cpu" | "memory" | "network" | "players";
type Modal = "files" | "config" | "renew" | "upgrade" | "billing" | "announcements" | "activity" | "stop" | null;
const cpuHistory = [25,22,25,28,31,37,43,35,32,27,23,21,28,34,36,33,25,18,19,23,24,25,24,29,32,34,31,25,25,25,31,38,34,27,23,22,24,23,25,25];
const memoryHistory = [50,50,55,64,69,75,65,61,55,51,48,49,55,64,69,65,61,52,54,60,58,57,50,51,57,57,57,58,59,58,51,54,65,61,56,59,61,57,62,63];
const tones = { blue: "#087bff", green: "#00bf87", purple: "#943dff", orange: "#ff8b18" };
const recentPlayers = ["Steve", "Alex", "Notch_233", "今天扶她山", "BrickPlayer", "萍キ人間"];
const announcements = [
  { type: "公告", tone: "orange", title: "10月26日 服务器版本已更新至 v1.20.4", text: "本次更新主要修复了部分插件兼容性的问题，建议…", time: "2024-10-26 14:20", pinned: true },
  { type: "维护", tone: "red", title: "10月24日 例行维护完成", text: "服务器已于 14:00 完成例行维护，所有服务已恢复正常。", time: "2024-10-24 14:05" },
  { type: "活动", tone: "green", title: "10月21日 周末建筑大赛开启", text: "10月28日前，服务器将开启周末建筑大赛活动，…", time: "2024-10-21 18:30" },
];
const dateFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" });

function Spark({ points, tone }: { points: number[]; tone: keyof typeof tones }) {
  return <div className="gso-spark" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><AreaChart data={points.map(value => ({ value }))} margin={{ top: 3, right: 0, bottom: 0, left: 0 }}><Area type="monotone" dataKey="value" stroke={tones[tone]} strokeWidth={1.5} fill={tones[tone]} fillOpacity={0.055} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>;
}

export function GameServerOverview({ server, onStart, onStop, onRestart, onBackup, onOpen, onNotice }: {
  server: ConsoleInstance; onStart: () => void; onStop: () => void; onRestart: () => void; onBackup: () => void;
  onOpen: (tab: "players" | "backups" | "logs") => void; onNotice: (message: string) => void;
}) {
  const [resource, setResource] = useState<Resource>("cpu");
  const [hours, setHours] = useState(1);
  const [modal, setModal] = useState<Modal>(null);
  const [autoRenew, setAutoRenew] = useState(true);
  const [expiresAt, setExpiresAt] = useState(server.expiresAt);
  const [worldName, setWorldName] = useState("生存世界");
  const [worldDraft, setWorldDraft] = useState(worldName);
  const [version, setVersion] = useState("1.20.4");
  const [versionDraft, setVersionDraft] = useState(version);
  const [gameMode, setGameMode] = useState("生存模式");
  const [modeDraft, setModeDraft] = useState(gameMode);
  const [plan, setPlan] = useState("专业版");
  const [planDraft, setPlanDraft] = useState(plan);
  const minecraft = server.game === "Minecraft";
  const remainingDays = Math.max(0, Math.ceil((Date.parse(expiresAt) - Date.now()) / 86400000));
  const openConfig = () => { setWorldDraft(worldName); setVersionDraft(version); setModeDraft(gameMode); setModal("config"); };
  const copySeed = async () => {
    try { await navigator.clipboard.writeText("76561198000000001"); onNotice("世界种子已复制"); }
    catch { onNotice("世界种子：76561198000000001，请手动复制"); }
  };
  const data = cpuHistory.map((cpu, index) => ({
    minute: 820 + index * 54 / (cpuHistory.length - 1) * hours,
    cpu: server.running ? cpu : 0,
    memory: server.running ? memoryHistory[index] : 0,
    network: server.running ? Math.round(cpu * 0.6 + 5) : 0,
    players: server.running ? Math.max(0, Math.min(server.slots, Math.round(server.players * (0.65 + memoryHistory[index] / 200)))) : 0,
  }));
  const resourceMeta = { cpu: { label: "CPU 使用率", unit: "%", color: tones.blue, max: 100 }, memory: { label: "内存使用率", unit: "%", color: tones.green, max: 100 }, network: { label: "网络流量", unit: " MB/s", color: tones.blue, max: 60 }, players: { label: "在线玩家", unit: " 人", color: tones.green, max: server.slots } }[resource];
  const info = [
    { label: "世界名称", value: worldName, icon: Gamepad2 },
    { label: "游戏版本", value: minecraft ? version : server.game.split(" / ")[0], icon: Globe2 },
    { label: "服务器模组", value: minecraft ? "Paper (Spigot)" : "默认服务端", icon: Settings },
    { label: "游戏模式", value: gameMode, icon: BadgeCheck },
    { label: "运行时长", value: server.uptime, icon: Clock3 },
    { label: "实例规格", value: `${server.cores}核 ${server.ram}GB`, icon: HardDrive },
    { label: "创建时间", value: "2024-10-12 14:28", icon: Timer },
  ];
  const metrics = [
    { label: "在线玩家", value: server.running ? server.players : 0, unit: `/ ${server.slots}`, icon: Users, tone: "green", change: "28%", direction: "up", points: [7,12,16,18,27,22,19,25,31,32] },
    { label: "CPU 使用率", value: server.running ? server.cpu : 0, unit: "%", icon: Cpu, tone: "blue", change: "12%", direction: "down", points: [7,16,28,30,28,30,22,26,36,35,40] },
    { label: "内存使用率", value: server.running ? server.memory : 0, unit: "%", icon: ChartColumnBig, tone: "purple", change: "6%", direction: "up", danger: true, points: [7,14,20,20,31,25,20,27,36,37,40] },
    { label: "网络延迟", value: server.running ? 18 : 0, unit: "ms", icon: KeyRound, tone: "orange", change: "25%", direction: "down", points: [7,18,29,32,22,21,20,23,34,42,40] },
    { label: "今日登录人数", value: 86, unit: "人", icon: UsersRound, tone: "blue", change: "12%", direction: "up", points: [7,14,30,21,18,28,29,23,31,34,37] },
  ] as const;
  const quickActions = [
    { label: "启动服务器", text: "如果服务器已停止运行", icon: PlayCircle, tone: "green", action: () => server.running ? onNotice("服务器已在运行中") : onStart() },
    { label: "重启服务器", text: "快速重启游戏服务器", icon: RefreshCw, tone: "blue", action: onRestart },
    { label: "停止服务器", text: "安全关闭服务器", icon: Square, tone: "red", action: () => server.running ? setModal("stop") : onNotice("服务器已停止") },
    { label: "备份数据", text: "立即备份存档数据", icon: Database, tone: "blue", action: onBackup },
    { label: "文件管理", text: "管理游戏文件与配置", icon: Folder, tone: "orange", action: () => setModal("files") },
    { label: "修改配置", text: "调整游戏参数设置", icon: Target, tone: "blue", action: openConfig },
  ];
  const worldInfo = [
    { label: "世界名称", value: worldName, icon: Waypoints },
    { label: "世界种子", value: "76561198000000001", icon: Users, copy: true },
    { label: "世界难度", value: "自定义", icon: ClipboardCheck },
    { label: "存档大小", value: `${minecraft ? "2.3" : server.saveGB} GB`, icon: Database },
    { label: "最后保存", value: "2024-10-26 14:28（2 小时前）", icon: Save },
    { label: "存储位置", value: minecraft ? "/minecraft/world" : "/Pal/Saved/SaveGames", icon: MapPin },
  ];

  if (!minecraft) return <section className="gsd-card gsd-secondary"><h2><Gamepad2 size={20} />服务器概览</h2><dl className="gsd-server-info">{[["实例 ID", server.id], ["游戏", server.game], ["连接地址", `${server.ip}:${server.port}`], ["规格", `${server.cores} 核 CPU · ${server.ram} GB 内存`], ["托管节点", server.region], ["在线玩家", `${server.players} / ${server.slots} 人`], ["运行时长", server.uptime], ["游戏存档", `${server.saveGB} GB`], ["存档备份", `${server.backups} 份`], ["到期时间", server.expiresAt.slice(0, 10)]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
  return <div className="gso-overview">
    <section className="gso-banner" aria-label="服务器世界信息">
      <img className="gso-cover" src="/console/minecraft/server-cover.png" alt="Minecraft 方块世界与冒险者" />
      <div className="gso-banner-content"><div className="gso-banner-title"><h2>{server.name}</h2><span className={`gsd-running${server.running ? "" : " stopped"}`}><i />{server.running ? "运行中" : "已停止"}</span></div><p>和小伙伴一起，探索无限可能的方块世界！</p><dl className="gso-summary">{info.map(item => <div key={item.label}><dt><item.icon size={14} />{item.label}</dt><dd>{item.value}</dd></div>)}</dl></div>
      <button className="gso-online-preview" onClick={() => onOpen("players")}><span>当前在线玩家</span><div>{[1,2,3,4].map(index => <img key={index} src={`/console/minecraft/avatar-${index}.png`} alt="" />)}<b>+{Math.max(0, server.players - 4)}</b></div></button>
    </section>
    <section className="gso-metrics" aria-label="服务器运行指标">{metrics.map(metric => <article key={metric.label} className={`gso-metric ${metric.tone}`}><span className="gso-icon"><metric.icon size={25} /></span><div><h3>{metric.label}</h3><strong>{metric.value}<small>{metric.unit}</small></strong></div><span className={`gso-change${"danger" in metric ? " danger" : ""}`}>{metric.direction === "down" ? <ArrowDown size={14} /> : <ArrowUp size={14} />}{metric.change}</span><Spark points={server.running ? [...metric.points] : metric.points.map(() => 0)} tone={metric.tone} /></article>)}</section>
    <div className="gso-middle-grid">
      <section className="gso-panel gso-resources" aria-label="实时资源趋势"><header><h2><TrendingUp size={20} />实时资源趋势</h2><div className="gso-ranges" aria-label="资源趋势时间范围">{[1,6,24].map(value => <button key={value} aria-pressed={hours === value} className={hours === value ? "active" : ""} onClick={() => setHours(value)}>近 {value} 小时</button>)}</div></header><div className="gso-resource-tabs" role="tablist" aria-label="资源类型">{[{id:"cpu",label:"CPU"},{id:"memory",label:"内存"},{id:"network",label:"网络流量"},{id:"players",label:"在线玩家"}].map(item => <button key={item.id} role="tab" aria-selected={resource === item.id} className={resource === item.id ? "active" : ""} onClick={() => setResource(item.id as Resource)}>{item.label}</button>)}</div><div className="gso-resource-chart" role="img" aria-label={`${resourceMeta.label}近${hours}小时演示趋势`}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 8, right: 13, left: -18, bottom: 0 }}><CartesianGrid stroke="#e9eff9" vertical={false} /><XAxis type="number" dataKey="minute" domain={[820,820+54*hours]} ticks={[0,10,20,30,40,50].map(value => 820+value*hours)} tickFormatter={value => `${String(Math.floor(value / 60) % 24).padStart(2,"0")}:${String(Math.floor(value % 60)).padStart(2,"0")}`} axisLine={false} tickLine={false} tick={{fontSize:11,fill:"#6c81aa"}} /><YAxis domain={[0,resourceMeta.max]} ticks={[0,.25,.5,.75,1].map(value => value*resourceMeta.max)} tickFormatter={value => `${Math.round(value)}${resourceMeta.unit}`} tick={{fontSize:11,fill:"#7186ad"}} axisLine={false} tickLine={false} /><Tooltip labelFormatter={value => `${String(Math.floor(Number(value)/60)%24).padStart(2,"0")}:${String(Math.floor(Number(value)%60)).padStart(2,"0")} · 演示数据`} formatter={(value:number,name:string) => [`${value}${name === "cpu" || name === "memory" ? "%" : resourceMeta.unit}`,name === "cpu" ? "CPU 使用率" : name === "memory" ? "内存使用率" : resourceMeta.label]} contentStyle={{fontSize:12,borderRadius:8,borderColor:"#dbe8fa"}} /><Area type="linear" dataKey={resource} stroke={resourceMeta.color} fill={resourceMeta.color} fillOpacity={0.045} strokeWidth={1.6} dot={{r:2,fill:"#fff",strokeWidth:1.2}} activeDot={{r:4}} isAnimationActive={false} />{(resource === "cpu" || resource === "memory") && <Area type="linear" dataKey={resource === "cpu" ? "memory" : "cpu"} stroke={resource === "cpu" ? tones.green : tones.blue} fill={resource === "cpu" ? tones.green : tones.blue} fillOpacity={0.025} strokeWidth={1.6} dot={{r:2,fill:"#fff",strokeWidth:1.2}} isAnimationActive={false} />}</AreaChart></ResponsiveContainer></div><div className="gso-legend">{resource === "cpu" || resource === "memory" ? <><span><i />CPU 使用率</span><span className="memory"><i />内存使用率</span></> : <span style={{color:resourceMeta.color}}><i style={{backgroundColor:resourceMeta.color}} />{resourceMeta.label}</span>}</div></section>
      <section className="gso-panel gso-quick" aria-label="快捷操作"><h2><Settings size={20} />快捷操作</h2><div>{quickActions.map(action => <button key={action.label} className={action.tone} onClick={action.action}><span className="gso-icon"><action.icon size={22} /></span><span><strong>{action.label}</strong><small>{action.text}</small></span></button>)}</div></section>
      <section className="gso-panel gso-billing"><header><h2><Crown size={20} />到期与计费提醒</h2><button className="gso-link" onClick={() => setModal("billing")}>查看详情<ChevronRight size={13} /></button></header><div className="gso-plan"><HardDrive size={15} /><div><small>当前套餐</small><strong>{plan} {server.cores}核 {server.ram}GB</strong></div><button onClick={() => { setPlanDraft(plan); setModal("upgrade"); }}>升级套餐</button></div><dl><div><dt><ClipboardCheck size={15} />到期时间</dt><dd className="expiry">{dateFormat.format(new Date(expiresAt))}<span>（剩余 {remainingDays} 天）</span></dd></div><div><dt><ShieldCheck size={15} />自动续费</dt><dd><button className="gso-autorenew" aria-pressed={autoRenew} onClick={() => { setAutoRenew(value => !value); onNotice(`自动续费已${autoRenew ? "关闭" : "开启"}（演示设置）`); }}><Check size={14} />{autoRenew ? "已开启" : "已关闭"}</button></dd></div><div><dt><MapPin size={15} />月付价格</dt><dd>¥ 120.00 / 月</dd></div></dl><button className="gsd-button primary gso-renew" onClick={() => setModal("renew")}>立即续费</button></section>
    </div>
    <div className="gso-bottom-grid">
      <section className="gso-panel gso-world"><h2><Globe2 size={20} />世界与存档信息</h2><div><dl>{worldInfo.map(item => <div key={item.label}><dt><item.icon size={14} />{item.label}</dt><dd>{item.value}{item.copy && <button aria-label="复制世界种子" onClick={() => void copySeed()}><Copy size={14} /></button>}</dd></div>)}</dl><img src="/console/minecraft/world-preview.png" alt="Minecraft 村庄、山丘与湖泊" /></div></section>
      <section className="gso-panel gso-announcements"><header><h2><Megaphone size={20} />最近公告 / 维护通知</h2><button className="gso-link" onClick={() => setModal("announcements")}>查看更多<ChevronRight size={13} /></button></header><div>{announcements.map(item => <button key={item.title} className="gso-announcement" onClick={() => setModal("announcements")}><span className={`gso-notice-tag ${item.tone}`}>{item.type}</span><span><strong>{item.title}</strong><small>{item.text}</small></span><time>{item.time}{item.pinned && <Pin size={13} fill="currentColor" />}</time></button>)}</div></section>
      <section className="gso-panel gso-activity"><header><h2><Timer size={20} />最近活动</h2><button className="gso-link" onClick={() => setModal("activity")}>查看更多<ChevronRight size={13} /></button></header><ul>{recentPlayers.map((player,index) => <li key={player}><img src={`/console/minecraft/avatar-${index%4+1}.png`} alt="" /><span><b>{player}</b> 加入了游戏</span><time>2024-10-26 14:{[29,28,21,18,13,5][index].toString().padStart(2,"0")}</time></li>)}</ul></section>
    </div>
    <Dialog open={modal !== null} onOpenChange={open => { if (!open) setModal(null); }}><DialogContent className="cloud-modal gsd-dialog gso-dialog"><DialogTitle>{{files:"游戏文件管理",config:"修改游戏配置",renew:"续费实例",upgrade:"升级套餐",billing:"计费详情",announcements:"公告与维护通知",activity:"最近服务器活动",stop:"停止游戏服务器"}[modal ?? "stop"]}</DialogTitle><DialogDescription>{modal === "stop" ? "停止服务器会断开当前玩家连接。请先保存世界存档。当前为演示操作。" : "当前页面使用演示数据，操作不会控制真实服务器或产生扣费。"}</DialogDescription>
      {modal === "files" && <div className="gso-file-list">{["world/","plugins/","server.properties","whitelist.json","banned-players.json"].map(file => <div key={file}>{file.endsWith("/") ? <Folder size={17} /> : <FileText size={17} />}<span>{file}</span><small>{file.endsWith("/") ? "文件夹" : "配置文件"}</small></div>)}<button className="gsd-button" onClick={() => { setModal(null); onOpen("backups"); }}><Archive size={17} />查看存档备份（{server.backups} 份）</button></div>}
      {modal === "config" && <form onSubmit={event => { event.preventDefault(); setWorldName(worldDraft.trim()); setVersion(versionDraft.trim()); setGameMode(modeDraft); setModal(null); onNotice("游戏配置已保存（演示操作）"); }} className="gso-form"><label>世界名称<input aria-label="世界名称" required maxLength={24} value={worldDraft} onChange={event => setWorldDraft(event.target.value)} /></label><label>游戏版本<input aria-label="游戏版本" required value={versionDraft} onChange={event => setVersionDraft(event.target.value)} /></label><label>游戏模式<select aria-label="游戏模式" value={modeDraft} onChange={event => setModeDraft(event.target.value)}><option>生存模式</option><option>创造模式</option><option>冒险模式</option></select></label><button className="gsd-button primary" type="submit" disabled={!worldDraft.trim() || !versionDraft.trim()}><Save size={17} />保存配置</button></form>}
      {modal === "upgrade" && <div className="gso-form"><label>选择套餐<select aria-label="选择套餐" value={planDraft} onChange={event => setPlanDraft(event.target.value)}><option>基础版</option><option>专业版</option><option>旗舰版</option></select></label><button className="gsd-button primary" onClick={() => { setPlan(planDraft); setModal(null); onNotice(`已选择${planDraft}（演示操作）`); }}>保存演示套餐</button></div>}
      {(modal === "billing" || modal === "renew") && <><dl className="gsd-server-info"><div><dt>当前套餐</dt><dd>{plan} · {server.cores}核 {server.ram}GB</dd></div><div><dt>计费周期</dt><dd>月付 · ¥ 120.00 / 月（演示价格）</dd></div><div><dt>到期时间</dt><dd>{dateFormat.format(new Date(expiresAt))}</dd></div><div><dt>自动续费</dt><dd><Switch className="gsd-switch" aria-label="自动续费设置" checked={autoRenew} onCheckedChange={setAutoRenew} /></dd></div></dl>{modal === "renew" && <button className="gsd-button primary" onClick={() => { setExpiresAt(new Date(Math.max(Date.parse(expiresAt),Date.now())+30*86400000).toISOString()); setModal(null); onNotice("已模拟续费 30 天，未产生实际扣费"); }}>模拟续费 30 天</button>}</>}
      {modal === "announcements" && <div className="gso-all-announcements">{announcements.map(item => <article key={item.title}><span className={`gso-notice-tag ${item.tone}`}>{item.type}</span><h3>{item.title}</h3><p>{item.text.replace("…","请更新客户端后重新连接服务器。")}</p><time>{item.time}</time></article>)}</div>}
      {modal === "activity" && <div className="gso-all-activity">{recentPlayers.map((player,index) => <div key={player}><img src={`/console/minecraft/avatar-${index%4+1}.png`} alt="" /><span>{player} 加入了游戏</span><time>2024-10-26 14:{[29,28,21,18,13,5][index].toString().padStart(2,"0")}</time></div>)}<button className="gsd-button" onClick={() => { setModal(null); onOpen("players"); }}><Users size={17} />打开玩家管理</button></div>}
      {modal === "stop" && <button className="gsd-button primary" onClick={() => { onStop(); setModal(null); }}>确认停止</button>}
    </DialogContent></Dialog>
  </div>;
}
