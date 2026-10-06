import { useState, type ReactNode } from "react";
import { AlertTriangle, BadgeCheck, Box, ChartColumnBig, CirclePlay, Copy, Cpu, Database, Folder, Gamepad2, Globe2, HardDrive, House, Info, KeyRound, LifeBuoy, MapPin, MemoryStick, Monitor, Network, Pencil, Play, RefreshCw, Settings, Shield, ShieldCheck, Square, Terminal, Timer, Wrench, type LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import type { ConsoleInstance } from "./cloudDashboardData";
import "../../../styles/cloud-machine-settings.css";

type Maintenance = "restart" | "container" | "rescue" | "environment" | "reinstall";
type SecurityPanel = "firewall" | "ports" | "ddos" | "keys";
type Script = "start" | "stop";
const systems = ["Ubuntu 22.04 LTS", "Ubuntu 24.04 LTS", "Debian 12"];
const maintenance = [
  { id: "restart", title: "重启机器", description: "安全重启主机", icon: RefreshCw, tone: "orange", confirmation: "重启后，当前游戏服务将暂时中断，请先保存游戏进度。" },
  { id: "container", title: "重建容器", description: "重新创建游戏容器", icon: Box, tone: "blue", confirmation: "重新创建游戏容器并保留游戏数据，服务将暂时中断。" },
  { id: "rescue", title: "进入救援模式", description: "进入系统救援环境", icon: LifeBuoy, tone: "purple", confirmation: "进入救援环境后，游戏服务将暂时不可用。" },
  { id: "environment", title: "重置环境", description: "清理并恢复初始环境", icon: Wrench, tone: "orange", confirmation: "恢复游戏运行环境的初始配置，请提前备份自定义配置。" },
] as const;
const startupOptions = [
  { id: "boot", title: "开机启动", description: "服务器重启后自动启动", icon: Timer },
  { id: "recovery", title: "异常自动重启", description: "当进程异常退出时自动重启", icon: BadgeCheck },
  { id: "daemon", title: "守护进程", description: "使用守护进程保持服务持续运行", icon: ShieldCheck },
] as const;

function PanelHeading({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return <h2><Icon size={22} strokeWidth={2} />{children}</h2>;
}

export function GameServerMachineSettings({ server, onNotice, onRestart, onLog }: {
  server: ConsoleInstance; onNotice: (message: string) => void; onRestart: () => void; onLog: (message: string) => void;
}) {
  const [system, setSystem] = useState(systems[0]);
  const [selectedSystem, setSelectedSystem] = useState(systems[0]);
  const [action, setAction] = useState<Maintenance | null>(null);
  const [startup, setStartup] = useState({ boot: true, recovery: true, daemon: true });
  const [scripts, setScripts] = useState({ start: "/home/server/start.sh", stop: "/home/server/stop.sh" });
  const [script, setScript] = useState<Script | null>(null);
  const [scriptDraft, setScriptDraft] = useState("");
  const [formError, setFormError] = useState("");
  const [securityPanel, setSecurityPanel] = useState<SecurityPanel | null>(null);
  const [ports, setPorts] = useState([22, server.port, 8080]);
  const [portDraft, setPortDraft] = useState("");
  const [sshKey, setSshKey] = useState("");
  const [keyDraft, setKeyDraft] = useState("");
  const [firewallRules, setFirewallRules] = useState({ ssh: true, game: true, panel: true });
  const region = server.region.match(/（(.+)）/);
  const city = region?.[1] ?? server.region;
  const location = region ? `中国 · ${city}` : city;
  const cpu = "AMD EPYC 7B13";
  const threadCount = server.cores * 2;
  const network = [
    { label: "SSH 连接", value: `ssh root@${server.ip} -p 22`, icon: Terminal },
    { label: "SFTP 连接", value: `sftp://root@${server.ip}:22`, icon: Folder },
    { label: "游戏端口", value: `${server.ip}:${server.port}`, icon: Gamepad2 },
    { label: "面板端口", value: `http://${server.ip}:8080`, icon: Monitor },
    { label: "内网 IP", value: `10.0.0.${Number(server.ip.split(".").at(-1)) + 2}`, icon: Network },
  ];
  const machineInfo = [
    { label: "节点名称", value: <>{server.region.replace(/[（）]/g, "-").replace(/-$/, "")} 高性能节点 <span className="gsm-bgp">BGP 多线</span></>, icon: CirclePlay },
    { label: "地区", value: location, icon: MapPin },
    { label: "宿主机编号", value: server.id === "srv-mc-01" ? "host-7f3e2a01" : `host-${server.id}`, icon: House },
    { label: "CPU", value: `${cpu}（${server.cores} 核心 ${threadCount} 线程）`, icon: Cpu },
    { label: "内存", value: `${server.ram} GB DDR4`, icon: MemoryStick },
    { label: "系统盘", value: "100 GB SSD（系统盘）", icon: HardDrive },
    { label: "数据盘", value: "50 GB SSD（游戏数据盘）", icon: Database },
    { label: "架构", value: "x86_64", icon: Box },
    { label: "内核版本", value: "5.15.0-91-generic", icon: Settings },
    { label: "Docker 环境", value: <><span className="gsm-dot" />已安装（v24.0.7）</>, icon: BadgeCheck },
    { label: "创建时间", value: "2024-10-14 08:32:16", icon: Info },
    { label: "开机时间", value: server.running ? <>2024-10-12 14:28:12 <span className="gsm-secondary">（运行 {server.uptime}）</span></> : "已停止", icon: Timer },
  ];
  const specs = [
    { title: "CPU 型号", value: cpu, detail: `${server.cores} 核心 ${threadCount} 线程`, icon: Cpu, tone: "blue" },
    { title: "核心数", value: `${server.cores} 核心`, detail: `${threadCount} 线程`, icon: Settings, tone: "blue" },
    { title: "内存", value: `${server.ram} GB`, detail: "DDR4", icon: ChartColumnBig, tone: "purple" },
    { title: "系统盘", value: "100 GB", detail: "SSD（系统盘）", icon: HardDrive, tone: "green" },
    { title: "公网 IP", value: server.ip, detail: location, icon: Globe2, tone: "orange" },
    { title: "操作系统", value: system, detail: "x86_64", icon: Monitor, tone: "blue" },
  ];
  const copy = async (label: string, value: string) => {
    try { await navigator.clipboard.writeText(value); onNotice(`${label}已复制`); }
    catch { onNotice("复制失败，请手动选择地址进行复制"); }
  };
  const confirmAction = () => {
    if (!action) return;
    if (action === "restart") { setAction(null); onRestart(); return; }
    if (action === "reinstall") setSystem(selectedSystem);
    const title = action === "reinstall" ? `重装系统为 ${selectedSystem}` : maintenance.find(item => item.id === action)!.title;
    onLog(`Machine: ${title}（演示操作）`);
    onNotice(`${title}已完成（演示操作）`);
    setAction(null);
  };
  const openSecurity = (panel: SecurityPanel) => { setSecurityPanel(panel); setPortDraft(ports.join(" / ")); setKeyDraft(sshKey); setFormError(""); };
  const savePorts = () => {
    const tokens = portDraft.trim().split(/[\s/,，]+/);
    const values = tokens.map(Number);
    if (!portDraft.trim() || values.some((value, index) => !/^\d+$/.test(tokens[index]) || !Number.isInteger(value) || value < 1 || value > 65535)) { setFormError("请输入 1 至 65535 的端口号，用空格、逗号或 / 分隔。"); return; }
    if (![22, server.port, 8080].every(value => values.includes(value))) { setFormError(`请保留 SSH、游戏和面板端口：22、${server.port}、8080。`); return; }
    setPorts([...new Set(values)]); setSecurityPanel(null); onNotice("开放端口已保存（演示操作）");
  };

  return <div className="gsm-workspace">
    <section className="gsm-specs" aria-label="机器规格">{specs.map(({ title, value, detail, icon: Icon, tone }) => <article className="gsm-spec" key={title}><span className={`gsm-spec-icon ${tone}`}><Icon size={27} /></span><div><h3>{title}</h3><strong>{value}</strong><p>{detail}</p></div></article>)}</section>
    <div className="gsm-main-grid">
      <section className="gsm-card gsm-information"><PanelHeading icon={Database}>基础机器信息</PanelHeading><dl>{machineInfo.map(({ label, value, icon: Icon }) => <div className="gsm-info-row" key={label}><dt><Icon size={16} />{label}</dt><dd>{value}</dd></div>)}</dl></section>
      <section className="gsm-card gsm-network"><PanelHeading icon={Shield}>网络与访问</PanelHeading><dl>{network.map(({ label, value, icon: Icon }) => <div className="gsm-network-row" key={label}><dt><Icon size={18} />{label}</dt><dd><div className="gsm-address"><code>{value}</code><button aria-label={`复制${label}`} onClick={() => copy(label, value)}><Copy size={16} /></button></div><span className="gsm-status"><span className="gsm-dot" />正常</span></dd></div>)}</dl><aside className="gsm-tip"><Info size={21} fill="currentColor" /><div><strong>提示</strong><p>以上地址和端口可直接用于连接，点击右侧按钮可快速复制。</p></div></aside></section>
      <section className="gsm-card gsm-maintenance"><PanelHeading icon={Wrench}>快捷维护</PanelHeading><div className="gsm-maintenance-grid">{maintenance.map(({ id, title, description, icon: Icon, tone }) => <button className={tone} key={id} onClick={() => id === "restart" ? onRestart() : setAction(id)}><Icon size={27} /><strong>{title}</strong><span>{description}</span></button>)}</div><div className="gsm-reinstall"><PanelHeading icon={Database}>重装系统</PanelHeading><label className="gsm-system-picker"><span className="gsm-os-icon">{selectedSystem.startsWith("Ubuntu") ? <img src="/console/machine/ubuntu.svg" alt="" /> : <Database size={24} />}</span><span><select aria-label="选择重装系统" value={selectedSystem} onChange={event => setSelectedSystem(event.target.value)}>{systems.map(value => <option key={value}>{value}</option>)}</select><small>稳定、通用，推荐使用</small></span></label><button className="gsd-button primary gsm-reinstall-button" onClick={() => setAction("reinstall")}>立即重装系统</button><p className="gsm-warning"><AlertTriangle size={18} fill="currentColor" /><span><strong>重装系统将清空系统盘数据，包括已安装的环境与文件。</strong><br />请提前做好数据备份，此操作不可恢复。</span></p></div></section>
    </div>
    <div className="gsm-bottom-grid">
      <section className="gsm-card gsm-startup"><PanelHeading icon={CirclePlay}>启动与运行设置</PanelHeading><div className="gsm-startup-content"><div className="gsm-toggles">{startupOptions.map(({ id, title, description, icon: Icon }) => <div className="gsm-toggle-row" key={id}><span><Icon size={16} />{title}</span><small>{description}{id === "boot" ? ` ${server.game.split(" / ")[0]} 服务` : ""}</small><Switch className="gsd-switch" aria-label={title} checked={startup[id]} onCheckedChange={checked => { setStartup(previous => ({ ...previous, [id]: checked })); onNotice(`${title}已${checked ? "开启" : "关闭"}（演示操作）`); }} /><b>{startup[id] ? "已开启" : "已关闭"}</b></div>)}</div><div className="gsm-scripts">{(["start", "stop"] as const).map(id => <div className="gsm-script-row" key={id}><span>{id === "start" ? <Play size={17} /> : <Square size={17} />}{id === "start" ? "启动脚本" : "停止脚本"}</span><code>{scripts[id]}</code><button className="gsd-button" aria-label={`编辑${id === "start" ? "启动" : "停止"}脚本`} onClick={() => { setScript(id); setScriptDraft(scripts[id]); setFormError(""); }}><Pencil size={14} />编辑</button></div>)}</div></div></section>
      <section className="gsm-card gsm-security"><PanelHeading icon={ShieldCheck}>安全与规则</PanelHeading><dl>{[
        { label: "防火墙状态", value: <span className="gsm-badge"><span className="gsm-dot" />已开启</span>, button: "管理规则", panel: "firewall", icon: BadgeCheck },
        { label: "开放端口", value: <code className="gsm-port-badge">{ports.join(" / ")}</code>, button: "配置端口", panel: "ports", icon: Network },
        { label: "DDoS 防护", value: <span className="gsm-badge"><span className="gsm-dot" />已开启</span>, button: "查看详情", panel: "ddos", icon: Shield },
        { label: "SSH 密钥登录", value: <span className="gsm-badge"><span className="gsm-dot" />已启用</span>, button: "管理密钥", panel: "keys", icon: KeyRound },
      ].map(({ label, value, button, panel, icon: Icon }) => <div className="gsm-security-row" key={label}><dt><Icon size={16} />{label}</dt><dd>{value}<button className="gsd-button" onClick={() => openSecurity(panel as SecurityPanel)}>{button}</button></dd></div>)}</dl></section>
    </div>
    <Dialog open={action !== null} onOpenChange={open => { if (!open) setAction(null); }}><DialogContent className="cloud-modal gsd-dialog gsm-dialog"><DialogTitle>{action === "reinstall" ? "确认重装系统" : maintenance.find(item => item.id === action)?.title}</DialogTitle><DialogDescription>{action === "reinstall" ? `将重装为 ${selectedSystem}，系统盘环境与文件将被清空，请确认已完成备份。` : maintenance.find(item => item.id === action)?.confirmation} 当前为演示操作，不会连接真实机器。</DialogDescription><footer><button className="gsd-button" onClick={() => setAction(null)}>取消</button><button className={`gsd-button ${action === "reinstall" || action === "environment" ? "danger" : "primary"}`} onClick={confirmAction}>确认{action === "reinstall" ? "重装" : "执行"}</button></footer></DialogContent></Dialog>
    <Dialog open={script !== null} onOpenChange={open => { if (!open) setScript(null); }}><DialogContent className="cloud-modal gsd-dialog gsm-dialog"><DialogTitle>编辑{script === "start" ? "启动" : "停止"}脚本</DialogTitle><DialogDescription>设置服务器脚本的绝对路径（演示配置）。</DialogDescription><form onSubmit={event => { event.preventDefault(); if (!/^\/(?:[^/\s]+\/)*[^/\s]+\.sh$/.test(scriptDraft.trim())) { setFormError("请输入以 / 开头、以 .sh 结尾的绝对路径，不能包含空格。"); return; } if (script) setScripts(previous => ({ ...previous, [script]: scriptDraft.trim() })); setScript(null); onNotice("脚本路径已保存（演示操作）"); }}><label>脚本路径<input aria-label="脚本路径" value={scriptDraft} onChange={event => setScriptDraft(event.target.value)} /></label>{formError && <p className="gsm-form-error" role="alert">{formError}</p>}<footer><button type="button" className="gsd-button" onClick={() => setScript(null)}>取消</button><button type="submit" className="gsd-button primary">保存脚本</button></footer></form></DialogContent></Dialog>
    <Dialog open={securityPanel !== null} onOpenChange={open => { if (!open) setSecurityPanel(null); }}><DialogContent className="cloud-modal gsd-dialog gsm-dialog"><DialogTitle>{{ firewall: "防火墙规则", ports: "配置开放端口", ddos: "DDoS 防护详情", keys: "管理 SSH 密钥" }[securityPanel ?? "firewall"]}</DialogTitle><DialogDescription>查看和调整当前实例的安全配置（演示数据）。</DialogDescription>
      {securityPanel === "firewall" && <><div className="gsm-rule-list">{([{ id: "ssh", name: "SSH 远程连接", port: 22 }, { id: "game", name: "游戏服务", port: server.port }, { id: "panel", name: "控制面板", port: 8080 }] as const).map(rule => <label key={rule.id}><span>{rule.name}<small>TCP / {rule.port}</small></span><Switch className="gsd-switch" aria-label={`允许${rule.name}`} checked={firewallRules[rule.id]} onCheckedChange={checked => setFirewallRules(previous => ({ ...previous, [rule.id]: checked }))} /></label>)}</div><p className="gsm-dialog-note">默认拒绝未匹配规则的入站连接。</p><footer><button className="gsd-button primary" onClick={() => { setSecurityPanel(null); onNotice("防火墙规则已保存（演示操作）"); }}>完成</button></footer></>}
      {securityPanel === "ports" && <form onSubmit={event => { event.preventDefault(); savePorts(); }}><label>允许访问的端口<input aria-label="开放端口" value={portDraft} onChange={event => setPortDraft(event.target.value)} /></label><p className="gsm-dialog-note">使用逗号、空格或 / 分隔，保留 SSH、游戏与面板端口。</p>{formError && <p className="gsm-form-error" role="alert">{formError}</p>}<footer><button type="button" className="gsd-button" onClick={() => setSecurityPanel(null)}>取消</button><button type="submit" className="gsd-button primary">保存端口</button></footer></form>}
      {securityPanel === "ddos" && <><div className="gsm-protection"><ShieldCheck size={38} /><strong>防护已开启</strong><p>节点网络防护正常，当前未检测到攻击。</p></div><dl className="gsm-protection-details"><div><dt>防护节点</dt><dd>{city}节点</dd></div><div><dt>防护方式</dt><dd>自动检测与流量清洗</dd></div><div><dt>当前状态</dt><dd>正常</dd></div></dl></>}
      {securityPanel === "keys" && <form onSubmit={event => { event.preventDefault(); if (!/^(ssh-ed25519|ssh-rsa|ecdsa-sha2-nistp(?:256|384|521)) [A-Za-z0-9+/]+={0,3}(?: [^\r\n]+)?$/.test(keyDraft.trim())) { setFormError("请输入有效的 SSH 公钥，例如 ssh-ed25519 AAAA…；请勿填写私钥。"); return; } setSshKey(keyDraft.trim()); setSecurityPanel(null); onNotice("SSH 公钥已保存（演示操作）"); }}><label>SSH 公钥<textarea aria-label="SSH 公钥" placeholder="ssh-ed25519 AAAA…" value={keyDraft} onChange={event => setKeyDraft(event.target.value)} /></label>{formError && <p className="gsm-form-error" role="alert">{formError}</p>}<footer><button type="button" className="gsd-button" onClick={() => setSecurityPanel(null)}>取消</button><button type="submit" className="gsd-button primary">保存公钥</button></footer></form>}
    </DialogContent></Dialog>
  </div>;
}
