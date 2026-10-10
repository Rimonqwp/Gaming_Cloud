import { useState, type ReactNode } from "react";
import { AlertTriangle, ArrowDown, BadgeCheck, Box, ChevronDown, ChevronRight, Clock3, Database, Download, FileText, FolderClosed, Gamepad2, House, Lightbulb, RefreshCw, Search, SquareTerminal, ChartNoAxesCombined, SlidersHorizontal, Timer, Users, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import "../../../styles/cloud-core-selector.css";

const cores = [
  { id: "paper", name: "Paper", type: "插件服", description: "高性能的插件服务端，兼容 Bukkit，提供优秀的性能和稳定性，是目前最受欢迎的核心。", tags: ["插件服", "高性能", "稳定"], range: "1.8 - 1.21", latest: "1.21.1", java: "Java 17+", versions: ["1.21.1", "1.21", "1.20.6", "1.20.4", "1.19.4", "1.18.2", "1.8.8"] },
  { id: "purpur", name: "Purpur", type: "插件服", description: "在 Paper 基础上增强的高性能服务端，提供更多可配置选项和优化功能。", tags: ["插件服", "高性能", "更多功能"], range: "1.8 - 1.21", latest: "1.21.1", java: "Java 17+", versions: ["1.21.1", "1.21", "1.20.6", "1.20.4", "1.19.4", "1.18.2", "1.8.8"] },
  { id: "spigot", name: "Spigot", type: "插件服", description: "经典的插件服务端，稳定可靠，拥有庞大的插件生态。", tags: ["插件服", "轻量稳定", "经典"], range: "1.8 - 1.20.6", latest: "1.20.6", java: "Java 8/17+", versions: ["1.20.6", "1.20.4", "1.19.4", "1.18.2", "1.8.8"] },
  { id: "vanilla", name: "Vanilla", type: "原版", description: "官方原版服务端，纯净稳定，适合原版生存或小型服务器。", tags: ["原版", "官方", "稳定"], range: "1.8 - 1.21", latest: "1.21.1", java: "Java 17+", versions: ["1.21.1", "1.21", "1.20.6", "1.20.4", "1.19.4", "1.18.2", "1.8.8"] },
  { id: "forge", name: "Forge", type: "模组服", description: "最流行的模组加载器，支持大量的 Forge 模组生态。", tags: ["模组服", "模组生态", "稳定"], range: "1.7.10 - 1.20.1", latest: "1.20.1", java: "Java 17+", versions: ["1.20.1", "1.19.4", "1.18.2", "1.16.5", "1.12.2", "1.7.10"] },
  { id: "fabric", name: "Fabric", type: "模组服", description: "轻量、快速的模组加载器，启动更快，资源占用更低。", tags: ["模组服", "轻量高效", "现代"], range: "1.14 - 1.21", latest: "1.20.6", java: "Java 17+", versions: ["1.21", "1.20.6", "1.20.4", "1.19.4", "1.18.2", "1.14.4"] },
  { id: "mohist", name: "Mohist", type: "混合核心", description: "同时支持插件和模组的混合服务端，兼容 Bukkit 插件和 Forge 模组。", tags: ["混合核心", "插件 + 模组", "功能丰富"], range: "1.12.2 - 1.20.1", latest: "1.20.1", java: "Java 17+", versions: ["1.20.1", "1.19.4", "1.18.2", "1.16.5", "1.12.2"] },
  { id: "folia", name: "Folia", type: "插件服", description: "新一代并行化服务端，采用区域化多线程架构，提供极致的性能表现。", tags: ["插件服", "高性能", "多线程"], range: "1.19.4 - 1.20.6", latest: "1.20.6", java: "Java 17+", versions: ["1.20.6", "1.20.4", "1.19.4"] },
  { id: "quilt", name: "Quilt", type: "模组服", description: "另一个现代化的模组加载器，兼容大部分 Fabric 模组，提供更灵活的开发环境。", tags: ["模组服", "轻量", "兼容性好"], range: "1.14 - 1.21", latest: "1.20.6", java: "Java 17+", versions: ["1.21", "1.20.6", "1.20.4", "1.19.4", "1.18.2", "1.14.4"] },
];
type Core = typeof cores[number];
const navigation = [
  { id: "overview", label: "概览", icon: House }, { id: "performance", label: "性能监控", icon: ChartNoAxesCombined }, { id: "players", label: "玩家管理", icon: Users },
  { id: "files", label: "文件管理", icon: FileText }, { id: "cores", label: "版本选择器", icon: Box },
  { id: "backups", label: "文件备份", icon: FolderClosed }, { id: "logs", label: "日志", icon: FileText }, { id: "tasks", label: "定时任务", icon: Timer },
] as const;

function CoreImage({ core }: { core: Core }) { return <img className="gcore-image" src={`/console/cores/${core.id}.png`} alt={`${core.name} 核心图标`} />; }
function Filter({ label, value, options, onChange, icon = false }: { label: string; value: string; options: string[]; onChange: (value: string) => void; icon?: boolean }) {
  return <label className="gcore-filter">{icon && <Box size={17} />}<select aria-label={label} value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={15} /></label>;
}

export function GameServerCoreSelector({ open, onOpenChange, header, running, onNavigate, onBackup, onLog, terminal }: {
  terminal: ReactNode; open: boolean; onOpenChange: (open: boolean) => void; header: ReactNode; running: boolean;
  onNavigate: (id: string) => void; onBackup: () => boolean; onLog: (message: string) => void;
}) {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("全部类型");
  const [versionFilter, setVersionFilter] = useState("全部版本");
  const [trait, setTrait] = useState("全部特性");
  const [sort, setSort] = useState("综合排序");
  const [current, setCurrent] = useState({ core: cores[0], version: "1.20.4" });
  const [target, setTarget] = useState({ core: cores[1], version: "1.20.6" });
  const [keepWorld, setKeepWorld] = useState(true);
  const [editingVersion, setEditingVersion] = useState(false);
  const [confirmation, setConfirmation] = useState<"backup" | "direct" | null>(null);
  const [feedback, setFeedback] = useState("");
  const versions = [...new Set(cores.flatMap(core => core.versions))].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const traits = [...new Set(cores.flatMap(core => core.tags.slice(1)))];
  const filtered = cores.filter(core => (!query.trim() || `${core.name} ${core.description} ${core.tags.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())) && (type === "全部类型" || core.type === type) && (versionFilter === "全部版本" || core.versions.includes(versionFilter)) && (trait === "全部特性" || core.tags.includes(trait)));
  const visible = sort === "名称排序" ? [...filtered].sort((a, b) => a.name.localeCompare(b.name)) : sort === "版本优先" ? [...filtered].sort((a, b) => b.latest.localeCompare(a.latest, undefined, { numeric: true })) : filtered;
  const choose = (core: Core) => { setTarget({ core, version: versionFilter === "全部版本" ? core.latest : versionFilter }); setEditingVersion(true); setFeedback(""); };
  const backup = () => { const success = onBackup(); setFeedback(success ? "世界存档备份已创建（演示操作）" : "备份创建失败，可能已达到备份上限，请在文件备份中检查。"); return success; };
  const rebuild = () => {
    if (confirmation === "backup" && !backup()) { setConfirmation(null); return; }
    onLog(`Machine: 重建容器为 ${target.core.name} ${target.version}，${keepWorld ? "保留" : "清空"}世界数据（演示操作）`);
    setCurrent({ ...target }); setConfirmation(null);
    setFeedback(`已重建为 ${target.core.name} ${target.version}，${keepWorld ? "保留世界数据" : "清空世界数据"}（演示操作）`);
  };

  return <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cloud-modal gcore-dialog" onCloseAutoFocus={event => { event.preventDefault(); document.querySelector<HTMLButtonElement>(".gsm-maintenance-grid .blue")?.focus(); }}>
        <DialogTitle className="sr-only">Minecraft 版本选择器与重装容器设置</DialogTitle>
        <DialogDescription className="sr-only">选择服务端核心、版本和世界数据保留方式，再重建游戏容器。</DialogDescription>
        <div className="gcore-frame gsd-page">
          <nav className="gsd-breadcrumb" aria-label="版本选择器面包屑"><span><button onClick={() => onOpenChange(false)}>控制台</button><ChevronRight size={13} /></span><span><button onClick={() => onOpenChange(false)}>实例</button><ChevronRight size={13} /></span><span><button onClick={() => onOpenChange(false)}>游戏服务器</button><ChevronRight size={13} /></span><strong>实例详情</strong><DialogClose className="gcore-close" aria-label="关闭版本选择器"><X size={20} /></DialogClose></nav>
          <div className="gcore-server-header">{header}<button className="gsd-button dark gcore-terminal" onClick={() => setTerminalOpen(true)}><SquareTerminal size={18} />打开终端</button></div>
          <nav className="gsd-tabs" aria-label="重建容器导航">{navigation.map(({ id, label, icon: Icon }) => <button key={id} className={id === "cores" ? "active" : ""} aria-current={id === "cores" ? "page" : undefined} onClick={() => { if (id !== "cores") { onOpenChange(false); onNavigate(id === "performance" ? "overview" : id); } }}><Icon size={17} />{label}</button>)}</nav>
          <div className="gcore-layout">
            <main className="gcore-catalog">
              <section className="gcore-banner"><img src="/console/cores/banner-change.png" alt="草方块切换为宝箱" /><div><h2>更换核心，打造你专属的 Minecraft 服务器</h2><p>支持多种主流服务端核心，一键切换并重装容器，轻松搭建插件服或模组服。</p></div></section>
              <div className="gcore-filters"><label className="gcore-search"><Search size={20} /><input aria-label="搜索服务端核心" placeholder="搜索核心名称、关键词，如：Paper、Purpur、模组、插件..." value={query} onChange={event => setQuery(event.target.value)} /></label><Filter label="核心类型" value={type} onChange={setType} options={["全部类型", "插件服", "原版", "模组服", "混合核心"]} /><Filter label="兼容版本" value={versionFilter} onChange={setVersionFilter} options={["全部版本", ...versions]} icon /><Filter label="核心特性" value={trait} onChange={setTrait} options={["全部特性", ...traits]} icon /><label className="gcore-filter"><SlidersHorizontal size={17} /><select aria-label="核心排序" value={sort} onChange={event => setSort(event.target.value)}>{["综合排序", "名称排序", "版本优先"].map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></label></div>
              <div className="gcore-cards">{visible.map(core => <article key={core.id} className={`gcore-card${core.id === "paper" ? " recommended" : ""}${target.core.id === core.id ? " selected" : ""}`}>
                <div className="gcore-card-main"><CoreImage core={core} /><div><h3>{core.name}{core.id === "paper" && <span className="gcore-recommend"><BadgeCheck size={14} />推荐</span>}</h3><p>{core.description}</p><div className="gcore-tags">{core.tags.map((tag, index) => <span key={tag} className={index === 0 && core.type !== "原版" ? core.type === "混合核心" ? "orange" : "purple" : ""}>{tag}</span>)}</div></div></div>
                <div className="gcore-meta"><span><Gamepad2 size={17} />{core.range}</span><span className="latest"><Box size={17} />{core.latest} (最新)</span><span><Download size={17} />{core.java}</span></div>
                <button className="gcore-pick" aria-label={`选择 ${core.name} 核心`} aria-pressed={target.core.id === core.id} onClick={() => choose(core)}>选择此核心</button>
              </article>)}</div>
              {!visible.length && <div className="gcore-empty"><Search size={30} /><h3>没有找到匹配的核心</h3><p>试试其他关键词，或清除筛选条件。</p><button className="gsd-button" onClick={() => { setQuery(""); setType("全部类型"); setVersionFilter("全部版本"); setTrait("全部特性"); }}>清除筛选</button></div>}
            </main>
            <aside className="gcore-settings" aria-label="重装容器设置"><h2><RefreshCw size={23} />重装容器设置</h2>
              <section className="gcore-summary"><h3>当前核心（{running ? "正在运行" : "已停止"}）</h3><div><CoreImage core={current.core} /><div><h4>{current.core.name}<span className={`gsd-running${running ? "" : " stopped"}`}><i />{running ? "运行中" : "已停止"}</span></h4><p>版本: <strong>{current.version}</strong><span>Java: {current.core.java}</span></p></div></div></section>
              <ArrowDown className="gcore-arrow" size={22} />
              <section className="gcore-summary"><h3>目标核心（将要安装）</h3><div><CoreImage core={target.core} /><div><h4>{target.core.name}<button className="gsd-button" onClick={() => setEditingVersion(value => !value)} aria-expanded={editingVersion}>更换</button></h4><p>版本: <strong>{target.version}</strong><span>Java: {target.core.java}</span></p></div></div>{editingVersion && <label className="gcore-version">安装版本<select aria-label="目标核心版本" value={target.version} onChange={event => setTarget(previous => ({ ...previous, version: event.target.value }))}>{target.core.versions.map(value => <option key={value}>{value}</option>)}</select></label>}</section>
              <h3 className="gcore-options-heading">重装选项</h3><div className="gcore-keep"><Database size={24} /><div><strong>保留世界数据</strong><p>保留 /world 存档及玩家数据（推荐）</p></div><Switch className="gsd-switch" checked={keepWorld} onCheckedChange={setKeepWorld} aria-label="保留世界数据" /></div>
              <div className="gcore-duration"><Clock3 size={20} /><strong>预计耗时</strong><span>约 3 - 8 分钟</span></div>
              <div className="gcore-backup"><Lightbulb size={22} /><div><strong>建议先创建备份</strong><p>重装前建议先创建存档备份，以防止数据丢失。</p></div><button className="gsd-button" onClick={backup}>立即备份</button></div>
              <div className="gcore-warning"><h3><AlertTriangle size={22} fill="currentColor" />重要提示</h3><p>重装容器将会:</p><ul><li>替换服务器的核心文件和启动环境</li><li>清空当前容器内的配置文件（{keepWorld ? "除非保留世界数据" : "包含世界及玩家数据"}）</li><li>此操作不可撤销，请确认已备份重要数据</li></ul></div>
              {feedback && <p className="gcore-feedback" role="status">{feedback}</p>}
              <div className="gcore-submit"><button className="gsd-button primary" onClick={() => setConfirmation("backup")}><Database size={22} />创建备份并重装</button><button className="gsd-button" onClick={() => setConfirmation("direct")}><RefreshCw size={22} /><span>直接重装<small>（不创建备份）</small></span></button></div>
            </aside>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={confirmation !== null && open} onOpenChange={value => { if (!value) setConfirmation(null); }}><DialogContent className="cloud-modal gsd-dialog gsm-dialog"><DialogTitle>确认重建容器</DialogTitle><DialogDescription>将安装 {target.core.name} {target.version}，{keepWorld ? "保留世界存档及玩家数据" : "清空世界存档及玩家数据"}。{confirmation === "backup" ? "先创建备份，再重建容器。" : "本次不会创建备份。"}当前为演示操作，不会连接真实机器。</DialogDescription><footer><button className="gsd-button" onClick={() => setConfirmation(null)}>取消</button><button className="gsd-button primary" onClick={rebuild}>确认重装</button></footer></DialogContent></Dialog>
    <Dialog open={terminalOpen && open} onOpenChange={setTerminalOpen}><DialogContent className="cloud-modal gsd-dialog gcore-terminal-dialog"><DialogTitle>服务器终端</DialogTitle><DialogDescription className="sr-only">查看服务器控制台并发送指令。</DialogDescription>{terminal}</DialogContent></Dialog>
  </>;
}
