import { useState, type RefObject } from "react";
import { ArrowDown, ArrowUp, BadgeDollarSign, Check, ChevronDown, ChevronRight, CircleHelp, ClipboardList, Cloud, FileText, Folder, HardDrive, Info, Link, MoreVertical, Plus, Save, Server, Settings, Upload } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Switch } from "../../components/ui/switch";
import "../../../styles/cloud-backup-storage.css";

type StorageKind = "local" | "object" | "remote" | "bound";
type StorageTarget = { id: string; kind: StorageKind; name: string; path: string; used: number; capacity: number };
export type BackupStorageConfig = {
  targets: StorageTarget[]; activeId: string; name: string; path: string; capacity: string; retention: string; days: string;
  compression: boolean; compressionLevel: string; deduplication: boolean; encryption: boolean; encryptionType: string;
  bandwidth: boolean; bandwidthLimit: string; multiSync: boolean; specifiedDirectories: boolean; directories: string;
};
const kinds = [
  { id: "local", title: "本地存储", description: "存储在服务器本地磁盘，适合快速备份和短期保存。", icon: HardDrive, badge: "本地存储", path: "/home/backups", name: "本地备份存储", capacity: "50" },
  { id: "object", title: "对象存储", description: "支持阿里云 OSS、腾讯云 COS 等主流云存储服务。", icon: Cloud, badge: "对象存储", path: "oss://mc-backups", name: "阿里云 OSS", capacity: "100" },
  { id: "remote", title: "远程 FTP/SFTP", description: "备份到其他服务器的 FTP 或 SFTP 目录。", icon: Server, badge: "SFTP", path: "sftp://backup.example.com/minecraft", name: "远程 SFTP 服务器", capacity: "200" },
  { id: "bound", title: "云存储桶绑定", description: "绑定已有的云存储桶，支持 S3 兼容协议。", icon: Link, badge: "云存储桶", path: "s3://minecraft-backups", name: "云存储桶", capacity: "100" },
] as const;
export const defaultBackupStorageConfig = (): BackupStorageConfig => ({
  targets: [
    { id: "local-backup", kind: "local", name: "本地备份存储", path: "/home/backups", used: 12.6, capacity: 50 },
    { id: "oss-backup", kind: "object", name: "阿里云 OSS", path: "oss://mc-backups", used: 8.4, capacity: 100 },
    { id: "sftp-backup", kind: "remote", name: "远程 SFTP 服务器", path: "sftp://backup.example.com/minecraft", used: 6.2, capacity: 200 },
  ],
  activeId: "local-backup", name: "本地备份存储", path: "/home/backups", capacity: "50", retention: "time", days: "30",
  compression: true, compressionLevel: "medium", deduplication: true, encryption: true, encryptionType: "AES-256",
  bandwidth: true, bandwidthLimit: "10", multiSync: true, specifiedDirectories: false, directories: "/minecraft/world\n/minecraft/plugins",
});
const palette = ["#087bff", "#22d8b4", "#9463ff", "#ffaf43"];
const timestamp = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date());

export function BackupStorageSettings({ open, onOpenChange, value, onSave, triggerRef }: {
  open: boolean; onOpenChange: (open: boolean) => void; value: BackupStorageConfig; onSave: (value: BackupStorageConfig) => void; triggerRef: RefObject<HTMLButtonElement>;
}) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="gsbs-dialog" onCloseAutoFocus={event => { event.preventDefault(); triggerRef.current?.focus({ preventScroll: true }); }}>
    {open && <BackupStorageForm key="storage-form" value={value} onSave={onSave} onCancel={() => onOpenChange(false)} />}
  </DialogContent></Dialog>;
}

function BackupStorageForm({ value, onSave, onCancel }: { value: BackupStorageConfig; onSave: (value: BackupStorageConfig) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(() => ({ ...value, targets: value.targets.map(target => ({ ...target })) }));
  const [kind, setKind] = useState<StorageKind>(() => value.targets.find(target => target.id === value.activeId)?.kind ?? "local");
  const [adding, setAdding] = useState(false);
  const [tested, setTested] = useState(true);
  const [testTime, setTestTime] = useState("2024-10-26 14:28:12");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<"directories" | "folder" | "help" | "cost" | null>(null);
  const [directories, setDirectories] = useState(draft.directories);
  const [folderPath, setFolderPath] = useState(draft.path);
  const update = <K extends keyof BackupStorageConfig>(key: K, next: BackupStorageConfig[K]) => {
    setDraft(previous => ({ ...previous, [key]: next })); setError("");
    if (["name", "path", "capacity"].includes(key)) setTested(false);
  };
  const selectTarget = (target: StorageTarget) => {
    setAdding(false);
    setKind(target.kind); setDraft(previous => ({ ...previous, activeId: target.id, name: target.name, path: target.path, capacity: String(target.capacity) }));
    setTested(false); setError(""); setMessage(`正在编辑：${target.name}`);
  };
  const chooseKind = (next: StorageKind) => {
    const existing = draft.targets.find(target => target.kind === next);
    if (existing && !adding) selectTarget(existing);
    else {
      const definition = kinds.find(item => item.id === next)!;
      setKind(next); setDraft(previous => ({ ...previous, activeId: "", name: definition.name, path: definition.path, capacity: definition.capacity })); setTested(false); setError(""); setMessage("");
    }
  };
  const validate = () => {
    if (!draft.name.trim()) return "请输入存储名称。";
    if (!draft.path.trim()) return "请输入存储路径。";
    if (kind === "local" && !draft.path.startsWith("/")) return "本地存储路径需要以 / 开头。";
    if (kind !== "local") {
      try {
        const url = new URL(draft.path);
        const protocols = kind === "object" ? ["oss:", "cos:", "s3:", "https:"] : kind === "remote" ? ["ftp:", "sftp:", "ftps:"] : ["s3:", "https:"];
        if (!url.hostname || !protocols.includes(url.protocol) || url.username || url.password) return "请填写正确的存储地址，不要在地址中嵌入账号或密码。";
      } catch { return "存储地址格式不正确。"; }
    }
    const current = draft.targets.find(target => target.id === draft.activeId);
    if (current && Number(draft.capacity) < current.used) return "最大保留空间不能小于已使用空间。";
    if (draft.retention === "time" && (!/^\d+$/.test(draft.days) || Number(draft.days) < 1 || Number(draft.days) > 365)) return "保留天数需要在 1 至 365 天之间。";
    if (draft.bandwidth && (!Number.isFinite(Number(draft.bandwidthLimit)) || Number(draft.bandwidthLimit) <= 0)) return "上传带宽必须大于 0。";
    if (draft.specifiedDirectories && !draft.directories.trim()) return "请至少设置一个备份目录。";
    return "";
  };
  const commitTarget = () => {
    const problem = validate(); if (problem) { setError(problem); return null; }
    const existing = draft.targets.find(target => target.id === draft.activeId);
    const target: StorageTarget = { id: existing?.id ?? crypto.randomUUID(), kind, name: draft.name.trim(), path: draft.path.trim(), capacity: Number(draft.capacity), used: existing?.used ?? 0 };
    const targets = existing ? draft.targets.map(item => item.id === target.id ? target : item) : [...draft.targets, target];
    return { ...draft, targets, activeId: target.id, name: target.name, path: target.path };
  };
  const addTarget = () => {
    const definition = kinds.find(item => item.id === kind)!;
    setAdding(true); setDraft(previous => ({ ...previous, activeId: "", name: "", path: definition.path, capacity: definition.capacity }));
    setTested(false); setError(""); setMessage("请在左侧选择类型并填写新存储目标，保存配置后完成添加。");
  };
  const testConnection = () => {
    const problem = validate(); if (problem) { setError(problem); setTested(false); return; }
    setTested(true); setTestTime(timestamp()); setMessage("连接测试演示完成；未连接真实存储服务。");
  };
  const used = draft.targets.reduce((total, target) => total + target.used, 0);
  const capacity = draft.targets.reduce((total, target) => total + target.capacity, 0);
  const percent = capacity ? Math.round(used / capacity * 100) : 0;
  const chartData = draft.targets.filter(target => target.used > 0);
  const optionSwitch = (key: "compression" | "deduplication" | "encryption" | "bandwidth" | "multiSync" | "specifiedDirectories", label: string) => <Switch className="gsbs-switch" aria-label={label} checked={draft[key]} onCheckedChange={checked => update(key, checked)} />;

  return <div className="gsbs-content">
    <header className="gsbs-banner"><span className="gsbs-icon blue"><Cloud size={34} /></span><div><DialogTitle className="gsbs-title">文件备份 <ChevronRight size={20} /> 存储与同步设定</DialogTitle><DialogDescription className="gsbs-description">配置备份文件的存储位置、同步策略和高级选项，支持本地存储、云存储和远程服务器，实现多重备份保护。</DialogDescription></div><button type="button" className="gsbs-button" onClick={() => setEditor(editor === "help" ? null : "help")}><CircleHelp size={17} />使用帮助</button></header>
    {editor === "help" && <section className="gsbs-note" role="status"><Info size={18} /><div>选择存储目标后填写名称和路径，可先测试配置，再保存。当前为演示设置，连接测试不会访问真实服务，保存仅在本次页面会话中生效。</div><button type="button" onClick={() => setEditor(null)}>收起</button></section>}
    <form className="gsbs-layout" onSubmit={event => { event.preventDefault(); const next = commitTarget(); if (next) onSave(next); }}>
      <div className="gsbs-main"><section className="gsbs-card gsbs-configuration"><h2><Settings size={19} />存储目标类型</h2><p className="gsbs-section-description">选择备份文件的存储位置，支持多种存储方式，可同时配置多个目标实现多重备份。</p>
        <div className="gsbs-types" role="group" aria-label="存储目标类型">{kinds.map(definition => <button type="button" key={definition.id} className={`gsbs-type${kind === definition.id ? " active" : ""}`} aria-pressed={kind === definition.id} onClick={() => chooseKind(definition.id)}><span className={`gsbs-icon ${definition.id === "remote" ? "ink" : "blue"}`}><definition.icon size={32} /></span><div><strong>{definition.title}</strong><p>{definition.description}</p></div>{kind === definition.id && <span className="gsbs-type-check"><Check size={12} /></span>}</button>)}</div>
        <h2 className="gsbs-subheading"><ClipboardList size={19} />存储配置</h2>
        <div className="gsbs-fields"><label>存储名称 <b>*</b><input aria-label="存储名称" required maxLength={60} value={draft.name} onChange={event => update("name", event.target.value)} /><small>用于区分不同的存储目标，便于管理。</small></label>
          <label>存储路径 <b>*</b><div className="gsbs-path-input"><input aria-label="存储路径" required value={draft.path} onChange={event => update("path", event.target.value)} /><button type="button" aria-label="选择存储目录" onClick={() => { setFolderPath(draft.path); setEditor(editor === "folder" ? null : "folder"); }}><Folder size={17} /></button></div><small>备份文件将在该目录下存储，建议使用大容量磁盘。</small></label>
          <label>最大保留空间<div className="gsbs-select"><select aria-label="最大保留空间" value={draft.capacity} onChange={event => update("capacity", event.target.value)}>{[20, 50, 100, 200, 500, 1000].map(size => <option key={size} value={size}>{size} GB</option>)}</select><ChevronDown size={16} /></div><small>达到上限后将自动清理最早的备份文件。</small></label>
          <label>保留策略<div className="gsbs-retention"><div className="gsbs-select"><select aria-label="保留策略" value={draft.retention} onChange={event => update("retention", event.target.value)}><option value="time">按时间保留</option><option value="forever">永久保留</option></select><ChevronDown size={16} /></div><div className="gsbs-unit"><input aria-label="存储保留天数" type="number" min={1} max={365} required={draft.retention === "time"} disabled={draft.retention !== "time"} value={draft.days} onChange={event => update("days", event.target.value)} /><span>天</span></div></div><small>根据备份时间自动清理过期文件。</small></label>
        </div>
        {editor === "folder" && <div className="gsbs-inline-editor"><label>存储目录<input aria-label="存储目录" value={folderPath} onChange={event => setFolderPath(event.target.value)} /></label><button type="button" className="gsbs-button" onClick={() => { update("path", folderPath); setEditor(null); }}>使用此目录</button></div>}
        <h2 className="gsbs-subheading gsbs-advanced-title"><Settings size={20} />高级选项</h2>
        <div className="gsbs-advanced"><div className="gsbs-option"><div className="gsbs-option-line">{optionSwitch("compression", "启用文件压缩")}<strong>启用文件压缩</strong><div className="gsbs-select"><select aria-label="压缩级别" disabled={!draft.compression} value={draft.compressionLevel} onChange={event => update("compressionLevel", event.target.value)}><option value="low">快速压缩</option><option value="medium">中等压缩（推荐）</option><option value="high">高压缩率</option></select><ChevronDown size={15} /></div></div><p>使用 zip 压缩备份文件，节省存储空间。</p></div>
          <div className="gsbs-option"><div className="gsbs-option-line">{optionSwitch("bandwidth", "上传带宽限制")}<strong>上传带宽限制</strong><div className="gsbs-unit"><input aria-label="上传带宽上限" type="number" min="0.1" step="0.1" disabled={!draft.bandwidth} value={draft.bandwidthLimit} onChange={event => update("bandwidthLimit", event.target.value)} /><span>MB/s</span></div></div><p>限制备份上传的最大带宽，避免影响服务器正常运行。</p></div>
          <div className="gsbs-option"><div className="gsbs-option-line">{optionSwitch("deduplication", "启用文件去重")}<strong>启用文件去重</strong></div><p>通过内容识别避免重复上传相同文件，减少存储空间占用。</p></div>
          <div className="gsbs-option"><div className="gsbs-option-line">{optionSwitch("multiSync", "启用多目标同步")}<strong>启用多目标同步</strong></div><p>同时将备份文件同步到多个存储目标。</p></div>
          <div className="gsbs-option"><div className="gsbs-option-line">{optionSwitch("encryption", "加密备份文件")}<strong>加密备份文件</strong><div className="gsbs-select"><select aria-label="备份加密方式" value={draft.encryptionType} disabled={!draft.encryption} onChange={event => update("encryptionType", event.target.value)}><option>AES-256</option><option>AES-128</option></select><ChevronDown size={15} /></div></div><p>对备份文件进行加密存储，保障数据安全。</p></div>
          <div className="gsbs-option"><div className="gsbs-option-line">{optionSwitch("specifiedDirectories", "仅备份指定目录")}<strong>仅备份指定目录</strong><button type="button" className="gsbs-button gsbs-directories-button" disabled={!draft.specifiedDirectories} onClick={() => { setDirectories(draft.directories); setEditor(editor === "directories" ? null : "directories"); }}>设置目录</button></div><p>只备份游戏世界、插件等指定目录，减少备份体积。</p></div>
        </div>
        {editor === "directories" && <div className="gsbs-inline-editor"><label>备份目录（每行一个）<textarea aria-label="指定备份目录" value={directories} onChange={event => setDirectories(event.target.value)} /></label><button type="button" className="gsbs-button" onClick={() => { update("directories", directories); setEditor(null); }}>应用目录</button></div>}
      </section>
      <section className="gsbs-card gsbs-test"><h2><FileText size={19} />连接测试</h2><p className="gsbs-section-description">测试存储目标的连接状态和写入权限，确保备份能够正常进行。</p><div className={`gsbs-test-result${tested ? "" : " pending"}`}><span className="gsbs-icon green">{tested ? <Check size={25} /> : <Info size={25} />}</span><div><strong>{tested ? "连接测试成功" : "配置已修改，等待测试"}</strong><p>{tested ? `存储路径 ${draft.path} 可正常访问，写入权限正常。` : "请重新测试当前存储配置。"}</p></div><time>{tested ? testTime : ""}</time><button type="button" className="gsbs-button" onClick={testConnection}>{tested ? "重新测试" : "测试连接"}</button></div>{error && <p className="gsbs-error" role="alert">{error}</p>}{message && <p className="gsbs-message" role="status">{message}</p>}<footer><button className="gsbs-button primary" type="submit"><Save size={18} />保存配置</button><button className="gsbs-button" type="button" onClick={onCancel}>取消</button></footer></section></div>

      <aside className="gsbs-sidebar"><section className="gsbs-card gsbs-targets"><header><h2><HardDrive size={19} />已绑定的存储目标</h2><button type="button" className="gsbs-button primary" onClick={addTarget}><Plus size={17} />添加存储目标</button></header><div className="gsbs-target-list">{draft.targets.map(target => { const definition = kinds.find(item => item.id === target.kind)!; const targetPercent = Math.round(target.used / target.capacity * 100); return <article className="gsbs-target" key={target.id}><span className={`gsbs-icon ${target.kind === "object" ? "blue" : "ink"}`}><definition.icon size={29} /></span><div className="gsbs-target-data"><div className="gsbs-target-title"><button type="button" onClick={() => selectTarget(target)}>{target.name}</button><span className="gsbs-target-kind">{definition.badge}</span><span className="gsbs-normal"><i />正常</span><DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="gsbs-icon-button" aria-label={`${target.name} 存储操作`}><MoreVertical size={19} /></button></DropdownMenuTrigger><DropdownMenuContent className="gsbs-menu" align="end"><DropdownMenuItem onSelect={() => selectTarget(target)}>编辑存储目标</DropdownMenuItem><DropdownMenuItem onSelect={() => { const remaining = draft.targets.filter(item => item.id !== target.id); const next = remaining[0]; if (draft.activeId === target.id && next) { selectTarget(next); } setDraft(previous => ({ ...previous, targets: remaining, ...(previous.activeId === target.id ? next ? { activeId: next.id, name: next.name, path: next.path, capacity: String(next.capacity) } : { activeId: "", name: "", path: "/home/backups" } : {}) })); setMessage("存储目标已从草稿中移除，保存配置后生效。"); }}>移除绑定</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><p className="gsbs-target-path">{target.path}</p><p>{target.used.toFixed(1)} GB / {target.capacity} GB ({targetPercent}%)</p><div className="gsbs-progress"><span style={{ width: `${Math.min(100, targetPercent)}%` }} /></div></div></article>; })}</div></section>
        <section className="gsbs-card gsbs-usage"><h2><ClipboardList size={19} />存储空间使用情况</h2><div className="gsbs-total"><strong>{used.toFixed(1)} GB <small>/ {capacity} GB</small></strong><span>{percent}%</span></div><div className="gsbs-progress"><span style={{ width: `${Math.min(100, percent)}%` }} /></div><div className="gsbs-usage-chart"><ul>{chartData.map((target, index) => <li key={target.id}><i style={{ background: palette[index % palette.length] }} /><div><span>{target.kind === "local" ? "本地存储" : target.kind === "remote" ? "远程 SFTP" : target.name}</span><small>{target.used.toFixed(1)} GB ({Math.round(target.used / used * 100)}%)</small></div></li>)}</ul><div className="gsbs-donut"><PieChart width={124} height={124}><Pie data={chartData} dataKey="used" innerRadius={44} outerRadius={61} startAngle={90} endAngle={-270} isAnimationActive={false} stroke="#fff" strokeWidth={1}>{chartData.map((target, index) => <Cell key={target.id} fill={palette[index % palette.length]} />)}</Pie></PieChart><div><strong>{used.toFixed(1)} GB</strong><span>已使用</span></div></div></div></section>
        <section className="gsbs-card gsbs-cost"><header><h2><ClipboardList size={19} />预计费用与用量</h2><button type="button" className="gsbs-link" onClick={() => setEditor(editor === "cost" ? null : "cost")}>费用说明<ChevronRight size={13} /></button></header><div className="gsbs-cost-row"><span className="gsbs-cost-icon"><HardDrive size={18} /></span><span>预计本月存储用量</span><strong>28.5 GB</strong><span className="green"><ArrowDown size={15} />12%</span></div><div className="gsbs-cost-row"><span className="gsbs-cost-icon orange"><BadgeDollarSign size={18} /></span><span>预计本月云存储费用</span><strong>￥ 2.80</strong><span className="red"><ArrowUp size={15} />8%</span></div><div className="gsbs-cost-row"><span className="gsbs-cost-icon blue"><Upload size={18} /></span><span>预计本月上传流量</span><strong>15.2 GB</strong><span className="green"><ArrowDown size={15} />20%</span></div><div className="gsbs-cost-note"><Info size={17} /><span>{editor === "cost" ? "费用为示例估算，实际计费取决于存储服务商和流量；保存设置不会产生扣费。" : "以上为根据当前备份设置和历史数据预估的用量，仅供参考。"}</span></div></section>
      </aside>
    </form>
  </div>;
}
