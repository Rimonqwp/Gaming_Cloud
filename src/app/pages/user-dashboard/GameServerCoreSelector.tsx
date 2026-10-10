import { useState } from "react";
import { BadgeCheck, Box, ChevronDown, Database, Download, Gamepad2, Search, SlidersHorizontal, X } from "lucide-react";
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

function CoreImage({ core }: { core: Core }) { return <img className="gcore-image" src={`/console/cores/${core.id}.png`} alt={`${core.name} 核心图标`} />; }
function Filter({ label, value, options, onChange, icon = false }: { label: string; value: string; options: string[]; onChange: (value: string) => void; icon?: boolean }) {
  return <label className="gcore-filter">{icon && <Box size={17} />}<select aria-label={label} value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={15} /></label>;
}

export function GameServerCoreSelector({ open, onOpenChange, onBackup, onLog }: {
  open: boolean; onOpenChange: (open: boolean) => void;
  onBackup: () => boolean; onLog: (message: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("全部类型");
  const [versionFilter, setVersionFilter] = useState("全部版本");
  const [trait, setTrait] = useState("全部特性");
  const [sort, setSort] = useState("综合排序");
  const [target, setTarget] = useState({ core: cores[1], version: "1.20.6" });
  const [keepWorld, setKeepWorld] = useState(true);
  const [confirmation, setConfirmation] = useState<"backup" | "direct" | null>(null);
  const [feedback, setFeedback] = useState("");
  const versions = [...new Set(cores.flatMap(core => core.versions))].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const traits = [...new Set(cores.flatMap(core => core.tags.slice(1)))];
  const filtered = cores.filter(core => (!query.trim() || `${core.name} ${core.description} ${core.tags.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())) && (type === "全部类型" || core.type === type) && (versionFilter === "全部版本" || core.versions.includes(versionFilter)) && (trait === "全部特性" || core.tags.includes(trait)));
  const visible = sort === "名称排序" ? [...filtered].sort((a, b) => a.name.localeCompare(b.name)) : sort === "版本优先" ? [...filtered].sort((a, b) => b.latest.localeCompare(a.latest, undefined, { numeric: true })) : filtered;
  const choose = (core: Core) => { setTarget({ core, version: versionFilter === "全部版本" ? core.latest : versionFilter }); setConfirmation("backup"); setFeedback(""); };
  const backup = () => { const success = onBackup(); setFeedback(success ? "世界存档备份已创建（演示操作）" : "备份创建失败，可能已达到备份上限，请在文件备份中检查。"); return success; };
  const rebuild = () => {
    if (confirmation === "backup" && !backup()) { setConfirmation(null); return; }
    onLog(`Machine: 重建容器为 ${target.core.name} ${target.version}，${keepWorld ? "保留" : "清空"}世界数据（演示操作）`);
    setConfirmation(null);
    setFeedback(`已重建为 ${target.core.name} ${target.version}，${keepWorld ? "保留世界数据" : "清空世界数据"}（演示操作）`);
  };

  return <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cloud-modal gcore-dialog" onCloseAutoFocus={event => { event.preventDefault(); document.querySelector<HTMLButtonElement>(".gsm-maintenance-grid .blue")?.focus(); }}>
        <header className="gcore-dialog-header"><DialogTitle>重建容器</DialogTitle><DialogClose className="gcore-close" aria-label="关闭版本选择器"><X size={21} /></DialogClose></header>
        <DialogDescription className="sr-only">选择服务端核心、版本和世界数据保留方式，再重建游戏容器。</DialogDescription>
        <div className="gcore-frame gsd-page">
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
              {feedback && <p className="gcore-feedback" role="status">{feedback}</p>}
            </main>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={confirmation !== null && open} onOpenChange={value => { if (!value) setConfirmation(null); }}><DialogContent className="cloud-modal gsd-dialog gsm-dialog"><DialogTitle>确认重建容器</DialogTitle><DialogDescription>将安装 {target.core.name} 核心，替换核心文件和启动环境，并清空容器配置。请确认已备份重要数据。当前为演示操作，不会连接真实机器。</DialogDescription>
      <div className="gcore-config">
        <label className="gcore-version">安装版本<select aria-label="目标核心版本" value={target.version} onChange={event => setTarget(previous => ({ ...previous, version: event.target.value }))}>{target.core.versions.map(value => <option key={value}>{value}</option>)}</select></label>
        <div className="gcore-keep"><Database size={24} /><div><strong>保留世界数据</strong><p>{keepWorld ? "保留 /world 存档及玩家数据" : "重装时清空世界存档及玩家数据"}</p></div><Switch className="gsd-switch" checked={keepWorld} onCheckedChange={setKeepWorld} aria-label="保留世界数据" /></div>
        <label className="gcore-version">备份方式<select aria-label="重装前备份方式" value={confirmation ?? "backup"} onChange={event => setConfirmation(event.target.value as "backup" | "direct")}><option value="backup">创建备份并重装（推荐）</option><option value="direct">直接重装，不创建备份</option></select></label>
      </div><footer><button className="gsd-button" onClick={() => setConfirmation(null)}>取消</button><button className="gsd-button primary" onClick={rebuild}>确认重装</button></footer></DialogContent></Dialog>

  </>;
}
