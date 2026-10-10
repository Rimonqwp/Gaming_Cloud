import { useState, type ReactNode } from "react";
import { AlertTriangle, BadgeCheck, Box, ChartColumnBig, CirclePlay, Copy, Cpu, Database, Eye, EyeOff, Folder, Gamepad2, Globe2, HardDrive, House, Info, KeyRound, LifeBuoy, MapPin, MemoryStick, Network, Pencil, Play, Settings, Shield, ShieldCheck, Square, Terminal, Timer, Wrench, type LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import type { ConsoleInstance } from "./cloudDashboardData";
import { GameServerPortSettings } from "./GameServerPortSettings";
import { createPortRules } from "./gameServerPortRules";
import "../../../styles/cloud-machine-settings.css";

type Maintenance = "container" | "rescue" | "reinstall";
type Script = "start" | "stop";
const systems = ["Ubuntu 22.04 LTS", "Ubuntu 24.04 LTS", "Debian 12"];
const maintenance = [
  { id: "container", title: "重建容器", description: "重新创建游戏容器", icon: Box, tone: "blue", confirmation: "重新创建游戏容器并保留游戏数据，服务将暂时中断。" },
  { id: "rescue", title: "进入救援模式", description: "进入系统救援环境", icon: LifeBuoy, tone: "purple", confirmation: "进入救援环境后，游戏服务将暂时不可用。" },
] as const;
const startupOptions = [
  { id: "boot", title: "开机启动", description: "服务器重启后自动启动", icon: Timer },
  { id: "recovery", title: "异常自动重启", description: "当进程异常退出时自动重启", icon: BadgeCheck },
  { id: "daemon", title: "守护进程", description: "使用守护进程保持服务持续运行", icon: ShieldCheck },
] as const;

function PanelHeading({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return <h2><Icon size={22} strokeWidth={2} />{children}</h2>;
}

export function GameServerMachineSettings({ server, onNotice, onLog }: {
  server: ConsoleInstance; onNotice: (message: string) => void; onLog: (message: string) => void;
}) {
  const [system, setSystem] = useState(systems[0]);
  const [selectedSystem, setSelectedSystem] = useState(systems[0]);
  const [action, setAction] = useState<Maintenance | null>(null);
  const [showSftpPassword, setShowSftpPassword] = useState(false);
  const [startup, setStartup] = useState({ boot: true, recovery: true, daemon: true });
  const [scripts, setScripts] = useState({ start: "/home/server/start.sh", stop: "/home/server/stop.sh" });
  const [script, setScript] = useState<Script | null>(null);
  const [scriptDraft, setScriptDraft] = useState("");
  const [formError, setFormError] = useState("");
  const [portsOpen, setPortsOpen] = useState(false);
  const [activeSetting, setActiveSetting] = useState("ports");
  const [portRules, setPortRules] = useState(() => createPortRules(server.port, server.game));
  const ports = [...new Set(portRules.filter(rule => rule.enabled).map(rule => rule.range))];
  const region = server.region.match(/（(.+)）/);
  const city = region?.[1] ?? server.region;
  const location = region ? `中国 · ${city}` : city;
  const cpu = "AMD EPYC 7B13";
  const threadCount = server.cores * 2;
  const useSrvAddress = server.game === "Minecraft" || Boolean(server.srvAddress);
  const network = [
    { label: "SSH 连接", value: `ssh root@${server.ip} -p 22`, icon: Terminal },
    { label: useSrvAddress ? "SRV 连接" : "游戏端口", value: useSrvAddress ? server.srvAddress ?? "" : `${server.ip}:${server.port}`, icon: Gamepad2 },
    { label: "内网 IP", value: `10.0.0.${Number(server.ip.split(".").at(-1)) + 2}`, icon: Network },
    { label: "SFTP 连接", value: `sftp://root@${server.ip}:22`, icon: Folder },
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
    { title: "CPU 型号", value: cpu, detail: `${server.cores} 核心`, icon: Cpu, tone: "blue" },
    { title: "内存", value: `${server.ram} GB`, detail: "DDR4", icon: ChartColumnBig, tone: "purple" },
    { title: "系统盘", value: "100 GB", detail: "SSD（系统盘）", icon: HardDrive, tone: "green" },
    { title: "公网 IP", value: server.ip, detail: location, icon: Globe2, tone: "orange" },
    { title: "容器名称", value: server.containerName ?? "未分配", detail: "Docker 容器", icon: Box, tone: "blue" },
  ];
  const machineDetails = [
    { label: "储存池 ID", value: server.machineDetails?.storagePoolId },
    { label: "实例编号", value: server.machineDetails?.instanceNumber },
    { label: "数据池 ID", value: server.machineDetails?.dataPoolId },
    { label: "备份池 ID", value: server.machineDetails?.backupPoolId },
    { label: "资源池 ID", value: server.machineDetails?.resourcePoolId },
  ];
  const copy = async (label: string, value: string) => {
    try { await navigator.clipboard.writeText(value); onNotice(`${label}已复制`); }
    catch { onNotice("复制失败，请手动选择地址进行复制"); }
  };
  const confirmAction = () => {
    if (!action) return;
    if (action === "reinstall") setSystem(selectedSystem);
    const title = action === "reinstall" ? `重装系统为 ${selectedSystem}` : maintenance.find(item => item.id === action)!.title;
    onLog(`Machine: ${title}（演示操作）`);
    onNotice(`${title}已完成（演示操作）`);
    setAction(null);
  };
  const openPorts = () => { setActiveSetting("ports"); setPortsOpen(true); };

  const informationPanel = <section className="gsm-card gsm-information"><PanelHeading icon={Database}>基础机器信息</PanelHeading><dl>{machineInfo.map(({ label, value, icon: Icon }) => <div className="gsm-info-row" key={label}><dt><Icon size={16} />{label}</dt><dd>{value}</dd></div>)}</dl></section>;
  const networkPanel = <section className="gsm-card gsm-network">
        <PanelHeading icon={Shield}>网络与访问</PanelHeading>
        <dl>{network.map(({ label, value, icon: Icon }) => <div className={`gsm-network-row${label === "SFTP 连接" ? " gsm-sftp-row" : ""}`} key={label}>
          <dt><Icon size={18} />{label}</dt>
          <dd>
            <div className="gsm-network-value">
              <div className="gsm-address"><code>{value || "未配置"}</code><button type="button" aria-label={`复制${label}`} disabled={!value} onClick={() => copy(label, value)}><Copy size={16} /></button></div>
            </div>
            {label === "SFTP 连接" && <div className="gsm-network-value" aria-label="SFTP 密码">
              <div className="gsm-address">
                <span className="gsm-password-label">密码</span>
                <code>{server.sftpPassword ? showSftpPassword ? server.sftpPassword : "••••••••" : "未提供"}</code>
                {server.sftpPassword && <button type="button" aria-label={showSftpPassword ? "隐藏 SFTP 密码" : "显示 SFTP 密码"} aria-pressed={showSftpPassword} onClick={() => setShowSftpPassword(previous => !previous)}>{showSftpPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
                <button type="button" aria-label="复制SFTP 密码" disabled={!server.sftpPassword} onClick={() => copy("SFTP 密码", server.sftpPassword ?? "")}><Copy size={16} /></button>
              </div>
            </div>}
          </dd>
        </div>)}
          <div className="gsm-network-row gsm-network-ports">
            <dt><Network size={18} />端口信息</dt>
            <dd><code className="gsm-port-badge">{ports.join(" / ") || "无开放端口"}</code><button type="button" className="gsd-button" onClick={openPorts}>配置端口</button></dd>
          </div>
        </dl>
      </section>;
  const maintenancePanel = <div className="gsm-maintenance-grid">{maintenance.map(({ id, title, description, icon: Icon, tone }) => <button className={tone} key={id} onClick={() => setAction(id)}><Icon size={27} /><strong>{title}</strong><span>{description}</span></button>)}</div>;
  const detailsPanel = <section className="gsm-machine-details" aria-label="机器详细信息"><h3><Settings size={16} />机器详细信息</h3><dl>{machineDetails.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd><code>{value ?? "未分配"}</code><button type="button" aria-label={"复制" + label} disabled={!value} onClick={() => copy(label, value ?? "")}><Copy size={14} /></button></dd></div>)}</dl></section>;
  const startupPanel = <section className="gsm-card gsm-startup"><PanelHeading icon={CirclePlay}>启动与运行设置</PanelHeading><div className="gsm-startup-content"><div className="gsm-toggles">{startupOptions.map(({ id, title, description, icon: Icon }) => <div className="gsm-toggle-row" key={id}><span><Icon size={16} />{title}</span><small>{description}{id === "boot" ? ` ${server.game.split(" / ")[0]} 服务` : ""}</small><Switch className="gsd-switch" aria-label={title} checked={startup[id]} onCheckedChange={checked => { setStartup(previous => ({ ...previous, [id]: checked })); onNotice(`${title}已${checked ? "开启" : "关闭"}（演示操作）`); }} /><b>{startup[id] ? "已开启" : "已关闭"}</b></div>)}</div><div className="gsm-scripts">{(["start", "stop"] as const).map(id => <div className="gsm-script-row" key={id}><span>{id === "start" ? <Play size={17} /> : <Square size={17} />}{id === "start" ? "启动脚本" : "停止脚本"}</span><code>{scripts[id]}</code><button className="gsd-button" aria-label={`编辑${id === "start" ? "启动" : "停止"}脚本`} onClick={() => { setScript(id); setScriptDraft(scripts[id]); setFormError(""); }}><Pencil size={14} />编辑</button></div>)}</div></div></section>;
  const settingsPages = [
    { id: "information", title: "基础机器信息", description: "查看当前实例的机器规格、系统环境和运行信息。", icon: Database, content: informationPanel },
    { id: "network", title: "网络与访问", description: "查看连接地址、SFTP 凭据和开放端口。", icon: Network, content: networkPanel },
    { id: "startup", title: "启动与运行设置", description: "管理自动启动、异常恢复及启动和停止脚本。", icon: CirclePlay, content: startupPanel },
    { id: "maintenance", title: "快捷维护", description: "重建游戏容器或进入救援环境。", icon: Wrench, content: <section className="gsm-card">{maintenancePanel}</section> },
    { id: "details", title: "机器详细信息", description: "查看实例编号及储存、数据、备份和资源池标识。", icon: Settings, content: <section className="gsm-card">{detailsPanel}</section> },
  ];

  return <div className="gsm-workspace">
    <section className="gsm-specs" aria-label="机器规格">{specs.map(({ title, value, detail, icon: Icon, tone }) => <article className="gsm-spec" key={title}><span className={`gsm-spec-icon ${tone}`}><Icon size={27} /></span><div><h3>{title}</h3><strong>{value}</strong><p>{detail}</p></div></article>)}</section>
    <div className="gsm-main-grid">
      {informationPanel}
      {networkPanel}
      <section className="gsm-card gsm-maintenance"><PanelHeading icon={Wrench}>快捷维护</PanelHeading>{maintenancePanel}{detailsPanel}<div className="gsm-reinstall"><PanelHeading icon={Database}>重装系统</PanelHeading><label className="gsm-system-picker"><span className="gsm-os-icon">{selectedSystem.startsWith("Ubuntu") ? <img src="/console/machine/ubuntu.svg" alt="" /> : <Database size={24} />}</span><span><select aria-label="选择重装系统" value={selectedSystem} onChange={event => setSelectedSystem(event.target.value)}>{systems.map(value => <option key={value}>{value}</option>)}</select><small>稳定、通用，推荐使用</small></span></label><button className="gsd-button primary gsm-reinstall-button" onClick={() => setAction("reinstall")}>立即重装系统</button><p className="gsm-warning"><AlertTriangle size={18} fill="currentColor" /><span><strong>重装系统将清空系统盘数据，包括已安装的环境与文件。</strong><br />请提前做好数据备份，此操作不可恢复。</span></p></div></section>
    </div>
    <div className="gsm-bottom-grid">
      {startupPanel}
    </div>
    <Dialog open={action !== null} onOpenChange={open => { if (!open) setAction(null); }}><DialogContent className="cloud-modal gsd-dialog gsm-dialog"><DialogTitle>{action === "reinstall" ? "确认重装系统" : maintenance.find(item => item.id === action)?.title}</DialogTitle><DialogDescription>{action === "reinstall" ? `将重装为 ${selectedSystem}，系统盘环境与文件将被清空，请确认已完成备份。` : maintenance.find(item => item.id === action)?.confirmation} 当前为演示操作，不会连接真实机器。</DialogDescription><footer><button className="gsd-button" onClick={() => setAction(null)}>取消</button><button className={`gsd-button ${action === "reinstall" ? "danger" : "primary"}`} onClick={confirmAction}>确认{action === "reinstall" ? "重装" : "执行"}</button></footer></DialogContent></Dialog>
    <Dialog open={script !== null} onOpenChange={open => { if (!open) setScript(null); }}><DialogContent className="cloud-modal gsd-dialog gsm-dialog"><DialogTitle>编辑{script === "start" ? "启动" : "停止"}脚本</DialogTitle><DialogDescription>设置服务器脚本的绝对路径（演示配置）。</DialogDescription><form onSubmit={event => { event.preventDefault(); if (!/^\/(?:[^/\s]+\/)*[^/\s]+\.sh$/.test(scriptDraft.trim())) { setFormError("请输入以 / 开头、以 .sh 结尾的绝对路径，不能包含空格。"); return; } if (script) setScripts(previous => ({ ...previous, [script]: scriptDraft.trim() })); setScript(null); onNotice("脚本路径已保存（演示操作）"); }}><label>脚本路径<input aria-label="脚本路径" value={scriptDraft} onChange={event => setScriptDraft(event.target.value)} /></label>{formError && <p className="gsm-form-error" role="alert">{formError}</p>}<footer><button type="button" className="gsd-button" onClick={() => setScript(null)}>取消</button><button type="submit" className="gsd-button primary">保存脚本</button></footer></form></DialogContent></Dialog>
    <GameServerPortSettings open={portsOpen} onOpenChange={setPortsOpen} machineName={server.name} settingsPages={settingsPages} activeSetting={activeSetting} onSettingChange={setActiveSetting} rules={portRules} onRulesChange={setPortRules} onNotice={onNotice} />
  </div>;
}
