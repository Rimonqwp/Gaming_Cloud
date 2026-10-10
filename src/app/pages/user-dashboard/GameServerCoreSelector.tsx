import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import {
  AlertTriangle, ArrowDown, ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Box, Check, ChevronDown, CircleHelp, Clock3, Download,
  ExternalLink, FileText, Gamepad2, History, Package, Search, SlidersHorizontal,
  Lightbulb, RefreshCw, Wrench, X, Zap,
} from "lucide-react";
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

type VersionRow = { version: string; build: string; date: string; channel: "稳定版" | "测试版"; size: string; recommended?: boolean; latest?: boolean };
const paperVersions: VersionRow[] = [
  { version: "1.21.1", build: "#123", date: "2024-10-25 10:20", channel: "稳定版", size: "53.1 MB", latest: true },
  { version: "1.20.6", build: "#126", date: "2024-10-24 19:41", channel: "稳定版", size: "53.4 MB" },
  { version: "1.20.4", build: "#499", date: "2024-10-21 14:28", channel: "稳定版", size: "52.3 MB", recommended: true },
  { version: "1.20.4", build: "#498", date: "2024-10-18 10:12", channel: "稳定版", size: "52.1 MB" },
  { version: "1.20.6", build: "#125", date: "2024-10-22 11:20", channel: "稳定版", size: "53.1 MB" },
  { version: "1.20.6", build: "#124", date: "2024-10-19 08:15", channel: "测试版", size: "52.9 MB" },
];

function getCoreBuilds(core: Core): VersionRow[] {
  return core.id === "paper" ? paperVersions : core.versions.map((version, index) => ({ version, build: `#${520 - index}`, date: `2024-10-${String(25 - index * 2).padStart(2, "0")} 12:00`, channel: "稳定版", size: `${50 + index}.2 MB`, latest: version === core.latest, recommended: version === core.latest }));
}

function newestBuildFirst(a: VersionRow, b: VersionRow) {
  return b.date.localeCompare(a.date) || b.build.localeCompare(a.build, undefined, { numeric: true });
}

type InstallTarget = { core: Core; version: string; build: string };
function latestTarget(core: Core, selectedVersion = core.latest): InstallTarget {
  const rows = getCoreBuilds(core);
  const version = rows.some(row => row.version === selectedVersion) ? selectedVersion : rows[0].version;
  const build = rows.filter(row => row.version === version).sort(newestBuildFirst)[0].build;
  return { core, version, build };
}

const coreResources: Record<string, { site: string; docs: string }> = {
  paper: { site: "https://papermc.io/", docs: "https://docs.papermc.io/paper/getting-started/" },
  purpur: { site: "https://purpurmc.org/", docs: "https://purpurmc.org/docs/purpur/installation/" },
  spigot: { site: "https://www.spigotmc.org/", docs: "https://www.spigotmc.org/wiki/buildtools/" },
  vanilla: { site: "https://www.minecraft.net/", docs: "https://www.minecraft.net/en-us/download/server" },
  forge: { site: "https://files.minecraftforge.net/", docs: "https://docs.minecraftforge.net/en/latest/gettingstarted/" },
  fabric: { site: "https://fabricmc.net/", docs: "https://fabricmc.net/use/server/" },
  mohist: { site: "https://mohistmc.com/", docs: "https://mohistmc.com/docs" },
  folia: { site: "https://papermc.io/software/folia/", docs: "https://docs.papermc.io/folia/" },
  quilt: { site: "https://quiltmc.org/", docs: "https://quiltmc.org/en/install/server/" },
};

function CoreImage({ core, detail = false }: { core: Core; detail?: boolean }) { return <img className={detail ? "gcore-detail-image" : "gcore-image"} src={`/console/cores/${core.id}.png`} alt={`${core.name} 核心图标`} />; }
function Filter({ label, value, options, onChange, icon = false }: { label: string; value: string; options: string[]; onChange: (value: string) => void; icon?: boolean }) {
  return <label className="gcore-filter">{icon && <Box size={17} />}<select aria-label={label} value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={15} /></label>;
}

function CoreDetail({ core, onBack, onSelectCore, onSelectVersion }: { core: Core; onBack: () => void; onSelectCore: (core: Core) => void; onSelectVersion: (row: VersionRow) => void }) {
  const [activeTab, setActiveTab] = useState("versions");
  const [coreQuery, setCoreQuery] = useState("");
  const [version, setVersion] = useState("全部版本");
  const [channel, setChannel] = useState("全部渠道");
  const [buildQuery, setBuildQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const isPaper = core.id === "paper";
  const name = isPaper ? "PaperMC" : core.name;
  const resources = coreResources[core.id];
  const rows = getCoreBuilds(core);
  const recommended = rows.find(row => row.recommended) ?? rows[0];
  const releaseRows = [...rows].sort((a, b) => b.date.localeCompare(a.date));
  const filteredRows = rows.filter(row => (version === "全部版本" || row.version === version) && (channel === "全部渠道" || row.channel === channel) && (!buildQuery.trim() || `${row.version} ${row.build}`.toLowerCase().includes(buildQuery.trim().toLowerCase())));
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleCores = cores.filter(item => `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(coreQuery.trim().toLowerCase()));

  useEffect(() => {
    setVersion("全部版本");
    setChannel("全部渠道");
    setBuildQuery("");
    setPage(1);
  }, [core.id]);

  const clearFilters = () => { setVersion("全部版本"); setChannel("全部渠道"); setBuildQuery(""); setPage(1); };
  const renderBuildRow = (row: VersionRow) => <div className="gcore-version-row" key={`${row.version}-${row.build}`}>
    <strong>{row.version}</strong>
    <span>{row.build}</span><span>{row.date}</span><span><em className={`channel-badge ${row.channel === "测试版" ? "beta" : ""}`}>{row.channel}</em></span><span>{row.size}</span><span className="passed"><Check size={14} />通过</span><button className="gcore-build-install" aria-label={`安装 ${name} ${row.version} ${row.build}`} onClick={() => onSelectVersion(row)}><Download size={15} />安装</button>
  </div>;
  return <div className="gcore-detail">
    <aside className="gcore-detail-sidebar">
      <div className="gcore-detail-sidebar-toolbar">
        <button className="gcore-detail-back" aria-label="返回核心列表" title="返回核心列表" onClick={onBack}><ArrowLeft size={17} aria-hidden="true" /></button>
        <label className="gcore-detail-search"><Search size={17} /><input aria-label="搜索核心" placeholder="搜索核心名称，例如：Paper、Spigot..." value={coreQuery} onChange={event => setCoreQuery(event.target.value)} /></label>
      </div>
      <nav className="gcore-detail-core-list" aria-label="服务端核心列表">{visibleCores.map(item => <button key={item.id} className={item.id === core.id ? "active" : ""} onClick={() => onSelectCore(item)}><CoreImage core={item} /><span><strong>{item.id === "paper" ? "PaperMC" : item.name}<em>{item.range}</em></strong><small>{item.description.length > 29 ? `${item.description.slice(0, 29)}...` : item.description}</small></span></button>)}</nav>
      {!visibleCores.length && <p className="gcore-sidebar-empty">没有找到匹配的核心<button onClick={() => setCoreQuery("")}>清除搜索</button></p>}
    </aside>
    <main className="gcore-detail-content">
      <section className="gcore-detail-hero"><div className="gcore-detail-heading"><CoreImage core={core} detail /><div><h2>{name}<span className="gcore-recommend"><BadgeCheck size={14} />推荐</span><span className="gcore-selected-check"><Check size={14} /></span></h2><p>作者：{isPaper ? "PaperMC Team" : `${core.name} Team`}</p><p>{isPaper ? "PaperMC 是目前最受欢迎的 Minecraft 服务端，基于 Spigot 深度优化，提供更高的性能、更好的稳定性和更广泛的插件兼容性。" : core.description}</p><div className="gcore-tags">{core.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div></div><div className="gcore-detail-links"><a className="gcore-detail-link" href={resources.site} target="_blank" rel="noreferrer"><ExternalLink size={15} />官方网站</a><a className="gcore-detail-link" href={resources.docs} target="_blank" rel="noreferrer"><BookOpen size={15} />项目文档</a></div></section>
      <section className="gcore-detail-stats">
        <div><Package size={20} /><span><dd>支持版本</dd><dt>{core.range}</dt></span></div>
        <div><Wrench size={20} /><span><dd>支持 Java</dd><dt>Java 17 / Java 21</dt></span></div>
        <div><FileText size={20} /><span><dd>最新构建</dd><dt>{core.latest} {rows.find(row => row.latest)?.build}</dt></span></div>
        <div className="highlight"><Zap size={20} /><span><dd>推荐版本</dd><dt>{recommended.version} {recommended.build}</dt><em>{recommended.channel}</em></span></div>
      </section>
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="gcore-detail-tabs" aria-label="核心详情页面">
          <Tabs.Trigger value="versions">版本列表</Tabs.Trigger>
          <Tabs.Trigger value="changelog">更新日志</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="versions" className="gcore-version-panel">
          <div className="gcore-version-toolbar">
            <Filter label="选择版本" value={version} options={["全部版本", ...new Set(rows.map(row => row.version))]} onChange={value => { setVersion(value); setPage(1); }} />
            <Filter label="发布渠道" value={channel} options={["全部渠道", "稳定版", "测试版"]} onChange={value => { setChannel(value); setPage(1); }} />
            <label className="gcore-detail-search compact"><Search size={17} /><input aria-label="搜索构建号" placeholder="搜索版本或构建号，例如：499、498..." value={buildQuery} onChange={event => { setBuildQuery(event.target.value); setPage(1); }} /></label>
          </div>
          <div className="gcore-version-table">
            <div className="gcore-version-row table-head"><span>版本</span><span>构建号</span><span>发布时间</span><span>渠道</span><span>文件大小</span><span>校验状态</span><span>操作</span></div>
            {visibleRows.map(row => renderBuildRow(row))}
          </div>
          {!filteredRows.length && <div className="gcore-version-empty" role="status"><Search size={26} /><h3>没有找到匹配的版本</h3><p>试试其他版本、发布渠道或构建号。</p><button className="gsd-button" onClick={clearFilters}>清除筛选</button></div>}
          <div className="gcore-pagination">
            <button aria-label="上一页" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>‹</button>
            {Array.from({ length: pageCount }, (_, index) => <button key={index} className={currentPage === index + 1 ? "active" : ""} aria-label={`第 ${index + 1} 页`} aria-current={currentPage === index + 1 ? "page" : undefined} onClick={() => setPage(index + 1)}>{index + 1}</button>)}
            <button aria-label="下一页" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>›</button>
            <select aria-label="每页显示数量" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}>{[5, 10, 20].map(size => <option key={size} value={size}>{size} 条/页</option>)}</select>
          </div>
        </Tabs.Content>
        <Tabs.Content value="changelog" className="gcore-information-panel gcore-changelog">
          <div className="gcore-panel-heading">
            <div className="gcore-changelog-heading"><span className="gcore-changelog-icon"><History size={21} aria-hidden="true" /></span><div><h3>{name} 更新日志</h3><p>共 {rows.length} 个构建 · 按发布时间排序</p></div></div>
            <a className="gcore-detail-link" href={resources.docs} target="_blank" rel="noreferrer"><ExternalLink size={15} />项目文档</a>
          </div>
          <ol className="gcore-release-list" aria-label={`${name} 发布记录`}>{releaseRows.map(row => <li className={`gcore-release ${row.recommended ? "recommended" : ""}`} key={`${row.version}-${row.build}`}>
            <time dateTime={row.date.replace(" ", "T")}><span>{row.date.split(" ")[0]}</span><small>{row.date.split(" ")[1]}</small></time>
            <article className="gcore-release-body">
              <div className="gcore-release-details">
                <header><h4>{row.version}</h4><span className="gcore-release-build">{row.build}</span><em className={`channel-badge ${row.channel === "测试版" ? "beta" : ""}`}>{row.channel}</em>{row.latest && <em className="table-badge latest">最新</em>}{row.recommended && <em className="table-badge">推荐</em>}</header>
                <div className="gcore-release-meta"><span><Gamepad2 size={14} aria-hidden="true" />Minecraft {row.version}</span><span><Package size={14} aria-hidden="true" />{row.size}</span>{row.channel === "测试版" && <span className="gcore-release-caution">安装前请确认兼容性</span>}</div>
              </div>
              <button className="gcore-release-action" aria-label={`查看 ${name} ${row.version} ${row.build} 构建`} onClick={() => { setVersion(row.version); setChannel("全部渠道"); setBuildQuery(row.build); setPage(1); setActiveTab("versions"); }}>查看构建<ArrowRight size={15} aria-hidden="true" /></button>
            </article>
          </li>)}</ol>
        </Tabs.Content>
      </Tabs.Root>
    </main>
  </div>;
}

export function GameServerCoreSelector({ open, onOpenChange, onBackup, onLog, onNotice, running }: {
  open: boolean; onOpenChange: (open: boolean) => void;
  onBackup: () => boolean; onLog: (message: string) => void;
  onNotice: (message: string) => void; running: boolean;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("全部类型");
  const [versionFilter, setVersionFilter] = useState("全部版本");
  const [trait, setTrait] = useState("全部特性");
  const [sort, setSort] = useState("综合排序");
  const [target, setTarget] = useState<InstallTarget | null>(null);
  const [installed, setInstalled] = useState<InstallTarget>({ core: cores[0], version: "1.20.4", build: "#499" });
  const [detailCore, setDetailCore] = useState<Core | null>(null);
  const [keepWorld, setKeepWorld] = useState(true);
  const [confirmation, setConfirmation] = useState(false);
  const [backupReady, setBackupReady] = useState(false);
  const [installMessage, setInstallMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const versions = [...new Set(cores.flatMap(core => core.versions))].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const traits = [...new Set(cores.flatMap(core => core.tags.slice(1)))];
  const filtered = cores.filter(core => (!query.trim() || `${core.name} ${core.description} ${core.tags.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())) && (type === "全部类型" || core.type === type) && (versionFilter === "全部版本" || core.versions.includes(versionFilter)) && (trait === "全部特性" || core.tags.includes(trait)));
  const visible = sort === "名称排序" ? [...filtered].sort((a, b) => a.name.localeCompare(b.name)) : sort === "版本优先" ? [...filtered].sort((a, b) => b.latest.localeCompare(a.latest, undefined, { numeric: true })) : filtered;
  const choose = (core: Core) => { setTarget(latestTarget(core)); setDetailCore(core); setFeedback(""); };
  const selectDetailCore = (core: Core) => { setDetailCore(core); setTarget(latestTarget(core)); };
  const selectDetailVersion = (row: VersionRow) => { if (!detailCore) return; setTarget(latestTarget(detailCore, row.version)); setBackupReady(false); setInstallMessage(""); setConfirmation(true); };
  const targetBuilds = target ? getCoreBuilds(target.core).filter(row => row.version === target.version).sort(newestBuildFirst) : [];
  const backup = () => { const success = onBackup(); setBackupReady(success); setInstallMessage(success ? "世界存档备份已创建（演示操作）" : "备份创建失败，可能已达到备份上限，请在文件备份中检查。"); return success; };
  const rebuild = () => {
    if (!target) return;
    onLog(`Machine: 重建容器为 ${target.core.name} ${target.version}${target.build ? ` ${target.build}` : ""}，${keepWorld ? "保留" : "清空"}世界数据（演示操作）`);
    setInstalled(target);
    setConfirmation(false);
    setDetailCore(target.core);
    const message = `已重建为 ${target.core.name} ${target.version} ${target.build}，${keepWorld ? "保留世界数据" : "清空世界数据"}（演示操作）`;
    setFeedback(message);
    onNotice(message);
  };

  return <>
    <Dialog open={open} onOpenChange={value => { onOpenChange(value); if (!value) { setDetailCore(null); setTarget(null); setConfirmation(false); setFeedback(""); } }}>
      <DialogContent className="cloud-modal gcore-dialog" onCloseAutoFocus={event => { event.preventDefault(); document.querySelector<HTMLButtonElement>(".gsm-maintenance-grid .blue")?.focus(); }}>
        <header className="gcore-dialog-header"><DialogTitle>{detailCore ? `${detailCore.name === "Paper" ? "PaperMC" : detailCore.name} 核心详情` : "重建容器"}</DialogTitle><DialogClose className="gcore-close" aria-label="关闭版本选择器"><X size={21} /></DialogClose></header>
        <DialogDescription className="sr-only">选择服务端核心、版本和世界数据保留方式，再重建游戏容器。</DialogDescription>
        <div className="gcore-frame gsd-page">{detailCore ? <CoreDetail core={detailCore} onBack={() => setDetailCore(null)} onSelectCore={selectDetailCore} onSelectVersion={selectDetailVersion} /> : <div className="gcore-layout"><main className="gcore-catalog"><section className="gcore-banner"><img src="/console/cores/banner-change.png" alt="草方块切换为宝箱" /><div><h2>更换核心，打造你专属的 Minecraft 服务器</h2><p>支持多种主流服务端核心，一键切换并重装容器，轻松搭建插件服或模组服。</p></div></section><div className="gcore-filters"><label className="gcore-search"><Search size={20} /><input aria-label="搜索服务端核心" placeholder="搜索核心名称、关键词，如：Paper、Purpur、模组、插件..." value={query} onChange={event => setQuery(event.target.value)} /></label><Filter label="核心类型" value={type} onChange={setType} options={["全部类型", "插件服", "原版", "模组服", "混合核心"]} /><Filter label="兼容版本" value={versionFilter} onChange={setVersionFilter} options={["全部版本", ...versions]} icon /><Filter label="核心特性" value={trait} onChange={setTrait} options={["全部特性", ...traits]} icon /><label className="gcore-filter"><SlidersHorizontal size={17} /><select aria-label="核心排序" value={sort} onChange={event => setSort(event.target.value)}>{["综合排序", "名称排序", "版本优先"].map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></label></div><div className="gcore-cards">{visible.map(core => <article key={core.id} className={`gcore-card${target?.core.id === core.id ? " selected" : ""}`}><div className="gcore-card-main"><CoreImage core={core} /><div><h3>{core.name}{core.id === "paper" && <span className="gcore-recommend"><BadgeCheck size={14} />推荐</span>}</h3><p>{core.description}</p><div className="gcore-tags">{core.tags.map((tag, index) => <span key={tag} className={index === 0 && core.type !== "原版" ? core.type === "混合核心" ? "orange" : "purple" : ""}>{tag}</span>)}</div></div></div><div className="gcore-meta"><span><Gamepad2 size={17} />{core.range}</span><span className="latest"><Box size={17} />{core.latest} (最新)</span><span><Download size={17} />{core.java}</span></div><button className="gcore-pick" aria-label={`选择 ${core.name} 核心`} aria-pressed={target?.core.id === core.id} onClick={() => choose(core)}>选择此核心</button></article>)}</div>{!visible.length && <div className="gcore-empty"><Search size={30} /><h3>没有找到匹配的核心</h3><p>试试其他关键词，或清除筛选条件。</p><button className="gsd-button" onClick={() => { setQuery(""); setType("全部类型"); setVersionFilter("全部版本"); setTrait("全部特性"); }}>清除筛选</button></div>}{feedback && <p className="gcore-feedback" role="status">{feedback}</p>}</main></div>}</div>
      </DialogContent>
    </Dialog>
    {target && <Dialog open={confirmation && open} onOpenChange={setConfirmation}>
      <DialogContent className="cloud-modal gsd-dialog gcore-rebuild-dialog">
        <header className="gcore-rebuild-header"><DialogTitle><RefreshCw size={22} aria-hidden="true" />重装容器设置</DialogTitle><DialogClose className="gcore-rebuild-close" aria-label="关闭重装设置"><X size={18} /></DialogClose></header>
        <DialogDescription className="sr-only">安装版本固定为列表中点选的版本，可选择该版本的构建号，设置世界数据保留方式，再重装容器。可通过立即备份按钮先创建备份。当前为演示操作，不会连接真实机器。</DialogDescription>
        <div className="gcore-rebuild-body">
          <section className="gcore-rebuild-core" aria-label="当前核心">
            <h3>当前核心（{running ? "正在运行" : "已停止"}）</h3>
            <div className="gcore-rebuild-core-row"><CoreImage core={installed.core} /><div><div className="gcore-rebuild-core-name"><strong>{installed.core.name}</strong><span className={`gcore-rebuild-status${running ? "" : " stopped"}`}>{running ? "运行中" : "已停止"}</span></div><p>版本：<b>{installed.version}</b><span>Java：{installed.core.java}</span></p></div></div>
          </section>
          <div className="gcore-rebuild-arrow"><ArrowDown size={21} aria-hidden="true" /></div>
          <section className="gcore-rebuild-core" aria-label="目标核心">
            <h3>目标核心（将要安装）</h3>
            <div className="gcore-rebuild-core-row"><CoreImage core={target.core} /><div><strong>{target.core.name}</strong><p>版本：<b>{target.version}</b><span>Java：{target.core.java}</span></p></div></div>
            <div className="gcore-rebuild-selects">
              <label className="gcore-rebuild-field">构建号<select aria-label="目标核心构建号" value={target.build} onChange={event => setTarget({ ...target, build: event.target.value })}>{targetBuilds.map(row => <option key={row.build} value={row.build}>{row.build} · {row.channel}</option>)}</select></label>
            </div>
          </section>
          <section className="gcore-rebuild-options" aria-label="重装选项">
            <h3>重装选项</h3>
            <div className="gcore-keep"><Box size={22} aria-hidden="true" /><div><strong>保留世界数据</strong><p>{keepWorld ? "保留 /world 存档及玩家数据（推荐）" : "重装时清空世界存档及玩家数据"}</p></div><Switch className="gsd-switch" checked={keepWorld} onCheckedChange={setKeepWorld} aria-label="保留世界数据" /></div>
            <div className="gcore-rebuild-estimate"><Clock3 size={20} aria-hidden="true" /><strong>预计耗时</strong><span>约 3 - 8 分钟</span><CircleHelp size={16} aria-label="实际耗时取决于核心大小和服务器环境" /></div>
          </section>
          <div className="gcore-rebuild-backup"><Lightbulb size={22} aria-hidden="true" /><div><strong>{backupReady ? "世界存档已备份" : "建议先创建备份"}</strong><p>{backupReady ? "已创建备份，可以继续重装。" : "重装前建议先创建存档备份，以防止数据丢失。"}</p></div><button className="gcore-rebuild-secondary" onClick={backup} disabled={backupReady}>{backupReady ? "已备份" : "立即备份"}</button></div>
          <section className="gcore-rebuild-warning"><h3><AlertTriangle size={20} aria-hidden="true" />重要提示</h3><p>重装容器将会：</p><ul><li>替换服务器的核心文件和启动环境</li><li>{keepWorld ? "清空当前容器内的配置文件（保留世界数据）" : "清空当前容器内的配置文件、世界存档及玩家数据"}</li><li>此操作不可撤销，请确认已备份重要数据</li></ul></section>
          {installMessage && <p className={`gcore-rebuild-message${backupReady ? " success" : ""}`} role={backupReady ? "status" : "alert"}>{installMessage}</p>}
        </div>
        <footer className="gcore-rebuild-actions"><button className="gcore-rebuild-primary" onClick={rebuild}><RefreshCw size={20} aria-hidden="true" /><span>重装</span></button></footer>
      </DialogContent>
    </Dialog>}
  </>;
}




