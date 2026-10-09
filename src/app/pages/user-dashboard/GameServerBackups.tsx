import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { zipSync, strToU8 } from "fflate";
import { Archive, ArchiveRestore, ArrowDown, ArrowRight, ArrowUp, CalendarDays, Check, ChevronLeft, ChevronRight, Copy, Database, Download, FileText, FolderArchive, MoreHorizontal, PlusCircle, RefreshCw, Search, Settings, Trash2, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Switch } from "../../components/ui/switch";
import { BackupDescription } from "./BackupDescription";
import type { ConsoleInstance } from "./cloudDashboardData";
import { backupSize, backupTime, backupTone, initialBackups, type BackupRecord } from "./gameServerBackupsData";
import "../../../styles/cloud-backups.css";

type BackupDialog = { kind: "create" | "upload" | "settings" } | { kind: "restore" | "delete"; records: BackupRecord[] } | { kind: "rename"; record: BackupRecord };
const defaultForm = () => ({ name: "", description: "", retention: "永久" });
export type GameServerBackupsHandle = { createBackup: () => boolean };

export const GameServerBackups = forwardRef<GameServerBackupsHandle, { server: ConsoleInstance; onBackup: () => void; onCountChange: (count: number) => void; onNotice: (message: string) => void }>(function GameServerBackups({ server, onBackup, onCountChange, onNotice }, ref) {
  const [backups, setBackups] = useState(() => initialBackups(server.game, server.backups));
  const recordsRef = useRef(backups);
  const [activeId, setActiveId] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailTriggerRef = useRef<HTMLElement | null>(null);
  const rowTriggers = useRef(new Map<string, HTMLButtonElement>());
  const reducedMotion = useReducedMotion();
  const sidebarAnimation = {
    initial: { opacity: 0, x: reducedMotion ? 0 : 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reducedMotion ? 0 : 16 },
    transition: { duration: reducedMotion ? 0 : 0.2 },
  };
  const showDetails = (record: BackupRecord) => {
    detailTriggerRef.current = rowTriggers.current.get(record.id) || null;
    setActiveId(record.id); setDetailId(record.id);
  };
  const closeDetails = () => {
    setDetailId(null);
    if (detailTriggerRef.current?.isConnected) detailTriggerRef.current.focus({ preventScroll: true });
  };
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [descending, setDescending] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [autoBackup, setAutoBackup] = useState(true);
  const [schedule, setSchedule] = useState({ time: "04:00", retention: "30" });
  const [scheduleDraft, setScheduleDraft] = useState(schedule);
  const [dialog, setDialog] = useState<BackupDialog | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [upload, setUpload] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const atLimit = backups.length >= server.backupLimit;
  const limitMessage = `已达到此服务器的 ${server.backupLimit} 个备份上限，请先删除旧备份再继续。`;
  const canAddBackup = () => {
    if (recordsRef.current.length < server.backupLimit) return true;
    setError(limitMessage); onNotice(limitMessage); return false;
  };
  const insertBackup = (record: BackupRecord) => {
    if (!canAddBackup()) return false;
    recordsRef.current = [record, ...recordsRef.current];
    setBackups(recordsRef.current); setActiveId(record.id); onCountChange(recordsRef.current.length);
    setPage(1); setQuery(""); setType("all"); setStatus("all"); setStart(""); setEnd(""); setDescending(true);
    onBackup(); onNotice(`${record.name} 已添加（演示操作）`); return true;
  };
  const createBackup = (draft?: ReturnType<typeof defaultForm>) => {
    const now = backupTime();
    return insertBackup({ id: `bak-${crypto.randomUUID()}`, name: draft?.name.trim() || `手动备份 ${now.slice(0, 16)}`, description: draft?.description.trim() || "手动创建的世界存档备份", type: "手动备份", sizeGB: 2.3, storedGB: 0.7, created: now, completed: now, retention: !draft || draft.retention === "永久" ? null : Number(draft.retention), path: server.game === "Minecraft" ? "/minecraft" : "/home/server", files: 12483, checksum: "" });
  };
  useImperativeHandle(ref, () => ({ createBackup: () => createBackup() }));

  const filtered = backups.filter(record => `${record.name} ${record.description} ${record.path}`.toLowerCase().includes(query.trim().toLowerCase()) && (type === "all" || record.type === type) && (status === "all" || status === "success") && (!start || record.created.slice(0, 10) >= start) && (!end || record.created.slice(0, 10) <= end)).sort((a, b) => descending ? b.created.localeCompare(a.created) : a.created.localeCompare(b.created));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const active = backups.find(record => record.id === detailId);
  const selectedRecords = backups.filter(record => selected.includes(record.id));
  const latest = backups.reduce<BackupRecord | undefined>((last, record) => !last || record.completed > last.completed ? record : last, undefined);
  const open = (value: BackupDialog) => { if ((value.kind === "create" || value.kind === "upload") && !canAddBackup()) return; setError(""); setForm(value.kind === "rename" ? { name: value.record.name, description: value.record.description, retention: value.record.retention === null ? "永久" : String(value.record.retention) } : defaultForm()); setUpload(null); setScheduleDraft(schedule); setDialog(value); };
  const copy = async (value: string) => { try { await navigator.clipboard.writeText(value); onNotice("已复制到剪贴板"); } catch { onNotice("复制失败，请手动选择并复制内容"); } };
  const download = (records: BackupRecord[]) => {
    records.forEach(record => {
      const archive = record.upload || new Blob([zipSync({ "README.txt": strToU8("这是游戏托管控制台的演示备份，仅包含元数据，不包含真实服务器世界文件。"), "backup-manifest.json": strToU8(JSON.stringify({ ...record, demo: true, server: server.id }, null, 2)) })], { type: "application/zip" });
      const url = URL.createObjectURL(archive); const link = document.createElement("a");
      link.href = url; link.download = record.upload?.name || `${record.name.replace(/[\\/:*?"<>|]/g, "-")}.demo.zip`; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    onNotice(records.some(record => !record.upload) ? "已发起演示备份包下载，仅含元数据" : "已发起备份文件下载");
  };
  const uploadBackup = async () => {
    if (!canAddBackup()) return;
    if (!upload) { setError("请选择一个 ZIP 备份文件"); return; }
    if (!/\.zip$/i.test(upload.name) || !upload.size) { setError("请选择有效的非空 ZIP 备份文件"); return; }
    if (upload.size > 100 * 1024 ** 2) { setError("演示上传支持最大 100 MB 的 ZIP 文件"); return; }
    setBusy(true);
    try {
      const header = new Uint8Array(await upload.slice(0, 4).arrayBuffer());
      if (!mounted.current) return;
      if (!(header[0] === 0x50 && header[1] === 0x4b && ((header[2] === 3 && header[3] === 4) || (header[2] === 5 && header[3] === 6)))) { setError("文件内容不是有效的 ZIP 格式"); return; }
      const now = backupTime(); const sizeGB = upload.size / 1024 ** 3;
      if (!insertBackup({ id: `bak-${crypto.randomUUID()}`, name: form.name.trim() || upload.name, description: form.description.trim() || "上传的备份文件", type: "手动备份", sizeGB, storedGB: sizeGB, created: now, completed: now, retention: form.retention === "永久" ? null : Number(form.retention), path: server.game === "Minecraft" ? "/minecraft" : "/home/server", files: 0, checksum: "", upload })) return;
      setDialog(null);
    } catch { if (mounted.current) setError("文件读取失败，请重新选择文件"); }
    finally { if (mounted.current) setBusy(false); }
  };

  return <div className="gsb-workspace">

    <div className="gsb-layout"><div className="gsb-main">
      <section className="gsb-list gsd-card" aria-label="备份列表"><header><h2><Archive size={19} />备份列表</h2><div className="gsb-toolbar"><button className="gsd-button primary" disabled={atLimit} title={atLimit ? limitMessage : undefined} onClick={() => open({ kind: "create" })}><PlusCircle size={16} />立即备份</button><button className="gsd-button" disabled={atLimit} title={atLimit ? limitMessage : undefined} onClick={() => open({ kind: "upload" })}><Upload size={16} />上传备份</button><button className="gsd-button" disabled={selectedRecords.length !== 1} onClick={() => open({ kind: "restore", records: selectedRecords })}><ArchiveRestore size={16} />还原</button><button className="gsd-button" disabled={!selectedRecords.length} onClick={() => download(selectedRecords)}><Download size={16} />下载</button><button className="gsd-button danger" disabled={!selectedRecords.length} onClick={() => open({ kind: "delete", records: selectedRecords })}><Trash2 size={16} />批量删除</button></div></header>
      <div className="gsb-filters"><label className="gsd-search"><Search size={17} /><input aria-label="搜索备份" placeholder="搜索备份名称、描述或来源路径..." value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label><select aria-label="备份类型筛选" value={type} onChange={event => { setType(event.target.value); setPage(1); }}><option value="all">全部类型</option>{["自动备份", "手动备份", "系统备份"].map(value => <option key={value}>{value}</option>)}</select><select aria-label="备份状态筛选" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">全部状态</option><option value="success">备份成功</option><option value="failure">备份失败</option></select><div className="gsb-date-filter"><CalendarDays size={16} /><label>{!start && <span>开始日期</span>}<input aria-label="备份开始日期" type="date" value={start} max={end || undefined} onInput={event => { setStart(event.currentTarget.value); setPage(1); }} onChange={event => { setStart(event.target.value); setPage(1); }} /></label><ArrowRight size={14} /><label>{!end && <span>结束日期</span>}<input aria-label="备份结束日期" type="date" value={end} min={start || undefined} onInput={event => { setEnd(event.currentTarget.value); setPage(1); }} onChange={event => { setEnd(event.target.value); setPage(1); }} /></label></div><button className="gsd-button gsb-refresh" aria-label="刷新备份列表" onClick={() => { setBackups([...recordsRef.current]); onCountChange(recordsRef.current.length); onNotice("备份列表已刷新（演示数据）"); }}><RefreshCw size={16} />刷新</button></div>
      {selected.length > 0 && <div className="gsb-selection" role="status">已选择 {selected.length} 个备份<button onClick={() => setSelected([])}>取消选择</button></div>}
      <div className="gsb-table-scroll"><table className="gsb-table"><colgroup>{[4, 23, 9.5, 8, 14, 9, 11, 11, 10.5].map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}</colgroup><thead><tr><th><input type="checkbox" aria-label="选择当前页全部备份" checked={rows.length > 0 && rows.every(record => selected.includes(record.id))} ref={element => { if (element) element.indeterminate = rows.some(record => selected.includes(record.id)) && !rows.every(record => selected.includes(record.id)); }} onChange={event => setSelected(previous => event.target.checked ? [...new Set([...previous, ...rows.map(record => record.id)])] : previous.filter(id => !rows.some(record => record.id === id)))} /></th><th>备份名称</th><th>类型</th><th>大小</th><th aria-sort={descending ? "descending" : "ascending"}><button className="gsb-sort" onClick={() => { setDescending(!descending); setPage(1); }}>创建时间{descending ? <ArrowDown size={13} /> : <ArrowUp size={13} />}</button></th><th>保留天数</th><th>状态</th><th>来源路径</th><th>操作</th></tr></thead><tbody>{rows.map(record => <tr key={record.id} onClick={event => { if ((event.target as HTMLElement).closest("input, .gsb-row-actions, [role=menuitem]")) return; showDetails(record); }} className={`${record.id === activeId ? "active" : ""} ${selected.includes(record.id) ? "checked" : ""}`}><td><input type="checkbox" aria-label={`选择 ${record.name}`} checked={selected.includes(record.id)} onChange={event => setSelected(previous => event.target.checked ? [...previous, record.id] : previous.filter(id => id !== record.id))} /></td><td><button ref={node => { if (node) rowTriggers.current.set(record.id, node); else rowTriggers.current.delete(record.id); }} className={`gsb-name ${backupTone(record.type)}`} aria-label={`查看 ${record.name}`} aria-pressed={record.id === activeId} aria-expanded={record.id === detailId} aria-controls={record.id === detailId ? "gsb-backup-details" : undefined} title="点击查看备份详情" onClick={event => { event.stopPropagation(); showDetails(record); }}><span className="gsb-file-icon">{record.type === "系统备份" ? <FolderArchive size={18} /> : <FileText size={20} />}</span><span><strong title={record.name}>{record.name}</strong><small title={record.description}>{record.description}</small></span></button></td><td><span className={`gsb-type ${backupTone(record.type)}`}>{record.type}</span></td><td>{backupSize(record.sizeGB)}</td><td>{record.created.slice(0, 16)}</td><td>{record.retention === null ? "永久" : `${record.retention} 天`}</td><td><span className="gsb-status"><i />备份成功</span></td><td><span className="gsb-truncate" title={record.path}>{record.path}</span></td><td><div className="gsb-row-actions"><button aria-label={`下载 ${record.name}`} onClick={() => download([record])}>下载</button><button aria-label={`还原 ${record.name}`} onClick={() => open({ kind: "restore", records: [record] })}>还原</button><DropdownMenu><DropdownMenuTrigger asChild><button aria-label={`更多操作 ${record.name}`}><MoreHorizontal size={18} /></button></DropdownMenuTrigger><DropdownMenuContent className="gsb-menu" align="end"><DropdownMenuItem onSelect={() => showDetails(record)}><Archive size={15} />查看备份详情</DropdownMenuItem><DropdownMenuItem onSelect={() => open({ kind: "rename", record })}><FileText size={15} />重命名备份</DropdownMenuItem><DropdownMenuItem onSelect={() => void copy(record.id)}><Copy size={15} />复制备份 ID</DropdownMenuItem><DropdownMenuItem onSelect={() => open({ kind: "delete", records: [record] })}><Trash2 size={15} />删除备份</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td></tr>)}{!rows.length && <tr><td colSpan={9}><div className="gsb-empty"><Archive size={26} /><strong>没有符合条件的备份</strong><span>试试调整搜索关键词或筛选条件</span><button onClick={() => { setQuery(""); setType("all"); setStatus("all"); setStart(""); setEnd(""); }}>清除筛选</button></div></td></tr>}</tbody></table></div>
      <footer className="gsb-pagination"><span>共 {filtered.length} 个备份，当前显示 {rows.length} 个</span><nav aria-label="备份分页"><button aria-label="上一页备份" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button>{Array.from({ length: pageCount }, (_, index) => <button key={index} aria-label={`备份第 ${index + 1} 页`} aria-current={currentPage === index + 1 ? "page" : undefined} className={currentPage === index + 1 ? "active" : ""} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button aria-label="下一页备份" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button></nav><select aria-label="每页备份数量" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}>{[8, 10, 20].map(value => <option key={value} value={value}>{value} 条/页</option>)}</select></footer></section>

    </div>
    <div className="gsb-sidebar"><AnimatePresence initial={false} mode="wait">{active && <motion.aside key={active.id} {...sidebarAnimation} id="gsb-backup-details" className="gsb-detail gsd-card" aria-label="备份详情" onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); closeDetails(); } }}><header><h2><Database size={19} />备份详情</h2><button autoFocus className="gsb-icon-button gsb-detail-close" aria-label="关闭备份详情" onClick={closeDetails}><X size={18} /></button></header>{active ? <><div className="gsb-detail-title"><span className={`gsb-icon ${backupTone(active.type)}`}><Archive size={25} /></span><div><h3>{active.name}</h3><BackupDescription description={active.description} /></div><span className="gsb-detail-status"><i />备份成功</span></div><dl className="gsb-properties"><div><dt>备份 ID</dt><dd><span className="gsb-truncate" title={active.id}>{active.id}</span><button aria-label="复制备份 ID" className="gsb-icon-button" onClick={() => void copy(active.id)}><Copy size={14} /></button></dd></div><div><dt>备份类型</dt><dd><span className={`gsb-type ${backupTone(active.type)}`}>{active.type}</span></dd></div><div><dt>备份大小</dt><dd>{backupSize(active.sizeGB)} ({(active.upload?.size ?? Math.round(active.sizeGB * 1024 ** 3)).toLocaleString("en-US")} 字节)</dd></div><div><dt>创建时间</dt><dd>{active.created}</dd></div><div><dt>完成时间</dt><dd>{active.completed}</dd></div><div><dt>保留天数</dt><dd>{active.retention === null ? "永久" : `${active.retention} 天`}</dd></div><div><dt>存储位置</dt><dd><Database size={14} />{active.upload ? "浏览器会话" : "对象存储 · 华东区域"}</dd></div><div><dt>来源路径</dt><dd>{active.path}</dd></div></dl><div className="gsb-detail-actions"><button className="gsd-button" onClick={() => download([active])}><Download size={17} />下载备份</button><button className="gsd-button primary" onClick={() => open({ kind: "restore", records: [active] })}><ArchiveRestore size={17} />恢复到当前服务器</button></div></> : <div className="gsb-empty"><Archive size={28} />选择一个备份查看详情</div>}</motion.aside>}</AnimatePresence>
    <div className="gsb-metrics gsd-card" role="region" aria-label="备份概况">
      <article className="gsb-metric"><h3>备份状态</h3><div className="gsb-auto-controls" title={!autoBackup ? "自动备份已关闭，可手动备份" : atLimit ? "数量已达上限，自动备份已暂停" : `每天 ${schedule.time} 自动备份`}><strong>{autoBackup ? "已开启" : "已关闭"}</strong><Switch className="gsd-switch" aria-label="自动备份" checked={autoBackup} onCheckedChange={checked => { setAutoBackup(checked); onNotice(`自动备份已${checked ? "开启" : "关闭"}（演示设置）`); }} /><button className="gsb-icon-button" aria-label="自动备份设置" onClick={() => open({ kind: "settings" })}><Settings size={16} /></button></div></article>
      <article className="gsb-metric"><h3>最近备份时间</h3><strong>{latest ? <time dateTime={`${latest.created.replace(" ", "T")}+08:00`}>{latest.created.slice(0, 16)}</time> : "暂无备份"}</strong></article>
      <article className={`gsb-metric${atLimit ? " gsb-limit-reached" : ""}`}><h3>备份数量</h3><strong aria-label={`当前 ${backups.length} 个，最多 ${server.backupLimit} 个`} title={atLimit ? limitMessage : "当前数量 / 最大数量"}>{backups.length} / {server.backupLimit} 个</strong></article>
    </div></div></div>

    <Dialog open={dialog !== null} onOpenChange={value => { if (!value && !busy) setDialog(null); }}><DialogContent className="cloud-modal gsd-dialog gsb-dialog"><DialogTitle>{dialog && ({ create: "创建服务器备份", upload: "上传备份文件", settings: "自动备份设置", restore: "还原服务器备份", delete: "删除备份", rename: "重命名备份" })[dialog.kind]}</DialogTitle><DialogDescription>{dialog?.kind === "restore" ? "此操作仅演示恢复流程，不修改真实服务器文件。" : dialog?.kind === "upload" ? "ZIP 文件仅保存在当前浏览器会话，刷新后清除；最大 100 MB。" : "本页面使用演示数据，设置和操作仅在当前会话中生效。"}</DialogDescription>
    {dialog && ["create", "upload", "rename"].includes(dialog.kind) && <form className="gsb-form" onSubmit={event => { event.preventDefault(); if (dialog.kind === "upload") { void uploadBackup(); return; } if (!form.name.trim()) { setError("请输入备份名称"); return; } if (dialog.kind === "rename") { recordsRef.current = recordsRef.current.map(record => record.id === dialog.record.id ? { ...record, name: form.name.trim(), description: form.description.trim() } : record); setBackups(recordsRef.current); onNotice("备份名称已更新（演示操作）"); setDialog(null); } else { if (createBackup(form)) setDialog(null); } }}><label>备份名称<input aria-label="备份名称" value={form.name} required={dialog.kind !== "upload"} maxLength={80} placeholder="例如：更新前的世界备份" onChange={event => setForm({ ...form, name: event.target.value })} /></label><label>备份描述<textarea aria-label="备份描述" value={form.description} maxLength={300} placeholder="记录本次备份的用途..." onChange={event => setForm({ ...form, description: event.target.value })} /></label>{dialog.kind !== "rename" && <label>保留时间<select aria-label="备份保留时间" value={form.retention} onChange={event => setForm({ ...form, retention: event.target.value })}><option>永久</option><option value="7">7 天</option><option value="30">30 天</option><option value="90">90 天</option></select></label>}{dialog.kind === "upload" && <label className="gsb-upload"><Upload size={24} /><span>{upload?.name || "选择 ZIP 备份文件"}</span><input type="file" aria-label="备份 ZIP 文件" accept=".zip,application/zip" disabled={busy} onChange={event => { setUpload(event.target.files?.[0] || null); setError(""); }} /></label>}{error && <p className="gsb-error" role="alert">{error}</p>}<footer><button type="button" className="gsd-button" disabled={busy} onClick={() => setDialog(null)}>取消</button><button className="gsd-button primary" disabled={busy} type="submit"><Check size={16} />{busy ? "读取中..." : dialog.kind === "upload" ? "上传备份" : dialog.kind === "rename" ? "保存修改" : "创建备份"}</button></footer></form>}
    {dialog?.kind === "settings" && <form className="gsb-form" onSubmit={event => { event.preventDefault(); setSchedule(scheduleDraft); setDialog(null); onNotice("自动备份设置已保存（演示设置）"); }}><label>每日备份时间（北京时间）<input aria-label="每日备份时间" type="time" required value={scheduleDraft.time} onInput={event => setScheduleDraft({ ...scheduleDraft, time: event.currentTarget.value })} onChange={event => setScheduleDraft({ ...scheduleDraft, time: event.target.value })} /></label><label>自动备份保留天数<select aria-label="自动备份保留天数" value={scheduleDraft.retention} onChange={event => setScheduleDraft({ ...scheduleDraft, retention: event.target.value })}>{[7, 30, 90].map(value => <option key={value} value={value}>{value} 天</option>)}</select></label><footer><button className="gsd-button" type="button" onClick={() => setDialog(null)}>取消</button><button className="gsd-button primary" type="submit">保存设置</button></footer></form>}
    {(dialog?.kind === "restore" || dialog?.kind === "delete") && <><ul className="gsb-confirm-list">{dialog.records.map(record => <li key={record.id}>{record.name}</li>)}</ul><p>{dialog.kind === "restore" ? "正式恢复会覆盖当前服务器存档，请先保存最新进度。" : `将从当前演示列表中删除这 ${dialog.records.length} 个备份。`}</p><div className="gsb-dialog-actions"><button className="gsd-button" onClick={() => setDialog(null)}>取消</button><button className={`gsd-button ${dialog.kind === "delete" ? "danger" : "primary"}`} onClick={() => { if (dialog.kind === "delete") { const ids = new Set(dialog.records.map(record => record.id)); recordsRef.current = recordsRef.current.filter(record => !ids.has(record.id)); setBackups(recordsRef.current); onCountChange(recordsRef.current.length); setSelected(previous => previous.filter(id => !ids.has(id))); if (detailId && ids.has(detailId)) closeDetails(); if (ids.has(activeId)) setActiveId(backups.find(record => !ids.has(record.id))?.id || ""); onNotice(`已删除 ${ids.size} 个备份（演示操作）`); } else { onNotice("备份恢复流程已完成（演示操作）"); } setDialog(null); }}>{dialog.kind === "delete" ? "确认删除" : "确认演示恢复"}</button></div></>}
    </DialogContent></Dialog>
  </div>;
});
