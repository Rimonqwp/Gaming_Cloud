import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, CircleCheck, CirclePlus, Clock3, CodeXml, Copy, Database, Download, ExternalLink, Eye, EyeOff, KeyRound, MoreHorizontal, MoreVertical, Network, PieChart, RefreshCw, Search, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import type { ConsoleInstance } from "./cloudDashboardData";
import "../../../styles/cloud-databases.css";

type DatabaseRecord = {
  id: string; name: string; description: string; type: "MySQL" | "MariaDB"; version: string;
  sizeMB: number; running: boolean; connections: number; created: string; backup: string;
  username: string; password: string;
};
type DatabaseDialog = "create" | "import" | "delete" | "connection" | "password" | "admin" | null;
const initialDatabases: DatabaseRecord[] = [
  { id: "db-minecraft", name: "minecraft", description: "主世界数据库", type: "MySQL", version: "8.0.36", sizeMB: 512, running: true, connections: 8, created: "2024-10-12 14:28:12", backup: "2024-10-26 14:28:31", username: "mc_admin", password: "mc_demo_2024" },
  { id: "db-bungeecord", name: "bungeecord", description: "跨服代理数据", type: "MySQL", version: "8.0.36", sizeMB: 128, running: true, connections: 3, created: "2024-10-13 10:20:00", backup: "2024-10-26 04:00:00", username: "bungee_admin", password: "bungee_demo" },
  { id: "db-luckperms", name: "luckperms", description: "权限插件数据", type: "MySQL", version: "8.0.36", sizeMB: 96, running: true, connections: 1, created: "2024-10-14 09:15:00", backup: "2024-10-25 04:00:00", username: "lp_admin", password: "lp_demo_2024" },
  { id: "db-essentialsx", name: "essentialsx", description: "基础插件数据", type: "MySQL", version: "8.0.36", sizeMB: 64, running: true, connections: 0, created: "2024-10-14 11:30:00", backup: "2024-10-25 04:00:00", username: "ess_admin", password: "ess_demo_2024" },
  { id: "db-old-world", name: "old_world", description: "旧世界存档数据", type: "MySQL", version: "8.0.28", sizeMB: 832, running: false, connections: 0, created: "2024-10-26 11:20:00", backup: "2024-10-20 04:00:00", username: "world_admin", password: "world_demo" },
];
const now = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date());
const databaseSize = (mb: number) => mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
function DatabaseStatus({ running, badge = false }: { running: boolean; badge?: boolean }) {
  return <span className={`gdb-status ${running ? "running" : "stopped"}${badge ? " badge" : ""}`}><i />{running ? "运行中" : "已停止"}</span>;
}

export function GameServerDatabases({ server, onNotice }: { server: ConsoleInstance; onNotice: (message: string) => void }) {
  const [databases, setDatabases] = useState(() => initialDatabases.map(record => ({ ...record })));
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = databases.find(record => record.id === activeId);
  const detailTriggerRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const sidebarAnimation = {
    initial: { opacity: 0, x: reducedMotion ? 0 : 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reducedMotion ? 0 : 16 },
    transition: { duration: reducedMotion ? 0 : 0.2 },
  };
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialog, setDialog] = useState<DatabaseDialog>(null);
  const [targets, setTargets] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", description: "", type: "MySQL" });
  const [importTarget, setImportTarget] = useState(initialDatabases[0].id);
  const [sqlFile, setSqlFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const usedMB = databases.reduce((sum, record) => sum + record.sizeMB, 0);
  const usedGB = (usedMB / 1024).toFixed(1);
  const usedPercent = Math.round(usedMB / 10240 * 100);
  const latestBackup = databases.reduce((latest, record) => record.backup > latest ? record.backup : latest, "");
  const runningCount = databases.filter(record => record.running).length;
  const connections = databases.reduce((sum, record) => sum + record.connections, 0);
  const filtered = databases.filter(record => `${record.name} ${record.description}`.toLowerCase().includes(query.trim().toLowerCase()) && (type === "all" || record.type === type) && (status === "all" || record.running === (status === "running")));
  const sorted = sort === "default" ? filtered : [...filtered].sort((a, b) => sort === "newest" ? b.created.localeCompare(a.created) : a.created.localeCompare(b.created));
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allChecked = rows.length > 0 && rows.every(record => selected.includes(record.id));
  const open = (kind: DatabaseDialog, ids: string[] = []) => {
    setError(""); setTargets(ids); setSqlFile(null); setForm({ name: "", description: "", type: "MySQL" });
    setImportTarget(active?.id ?? databases[0]?.id ?? ""); setDialog(kind);
  };
  const focusDatabase = (record: DatabaseRecord, trigger?: HTMLElement) => {
    detailTriggerRef.current = trigger ?? null;
    setActiveId(record.id); setShowPassword(false);
  };
  const closeDetails = () => {
    setActiveId(null); setShowPassword(false);
    if (detailTriggerRef.current?.isConnected) detailTriggerRef.current.focus({ preventScroll: true });
  };
  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); onNotice("已复制到剪贴板"); } catch { onNotice("复制失败，请手动复制连接信息"); }
  };
  const toggleSelection = (id: string) => setSelected(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]);
  const backup = (ids: string[]) => {
    const records = databases.filter(record => ids.includes(record.id));
    if (!records.length) { onNotice("请先选择需要备份的数据库"); return; }
    const timestamp = now();
    setDatabases(previous => previous.map(record => ids.includes(record.id) ? { ...record, backup: timestamp } : record));
    onNotice(`已备份 ${records.length} 个数据库（演示操作）`);
  };
  const toggleRunning = (record: DatabaseRecord) => {
    setDatabases(previous => previous.map(item => item.id === record.id ? { ...item, running: !item.running, connections: 0 } : item));
    onNotice(`${record.name} 已${record.running ? "停止" : "启动"}（演示操作）`);
  };
  const exportSQL = (record: DatabaseRecord) => {
    const sql = `-- ${record.name}: 演示数据库结构导出，不包含真实数据\nCREATE DATABASE IF NOT EXISTS \`${record.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;\nUSE \`${record.name}\`;\n`;
    const url = URL.createObjectURL(new Blob([sql], { type: "application/sql;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `${record.name}.sql`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    onNotice("已下载演示 SQL 结构文件");
  };
  const createDatabase = () => {
    const name = form.name.trim();
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(name)) { setError("名称需以字母开头，仅含字母、数字和下划线，最多 64 个字符。"); return; }
    if (databases.some(record => record.name.toLowerCase() === name.toLowerCase())) { setError("已存在同名数据库，请使用其他名称。"); return; }
    const record: DatabaseRecord = { id: crypto.randomUUID(), name, description: form.description.trim() || "游戏服务器数据库", type: form.type as DatabaseRecord["type"], version: form.type === "MySQL" ? "8.0.36" : "10.11.8", sizeMB: 0, running: true, connections: 0, created: now(), backup: "", username: `${name.slice(0, 25)}_admin`, password: `demo_${crypto.randomUUID().slice(0, 8)}` };
    setDatabases(previous => [...previous, record]); focusDatabase(record); setQuery(""); setType("all"); setStatus("all"); setSort("newest"); setPage(1);
    setDialog(null); onNotice(`${name} 已创建（演示操作）`);
  };
  const importSQL = async () => {
    if (!sqlFile || !/\.sql$/i.test(sqlFile.name)) { setError("请选择 .sql 格式的文件。"); return; }
    if (sqlFile.size > 10 * 1024 * 1024) { setError("演示导入支持最大 10 MB 的 SQL 文件。"); return; }
    const record = databases.find(item => item.id === importTarget);
    if (!record?.running) { setError("请选择正在运行的数据库。"); return; }
    setBusy(true);
    try {
      const text = await sqlFile.text();
      if (!text.trim()) { setError("SQL 文件为空，请选择包含内容的文件。"); return; }
      // Preview the import locally; SQL is never executed or uploaded.
      focusDatabase(record); setDialog(null);
      onNotice(`${sqlFile.name} 导入演示完成，未执行 SQL`);
    } catch { setError("无法读取 SQL 文件，请重新选择。"); } finally { setBusy(false); }
  };
  const deleteDatabases = () => {
    const records = databases.filter(record => targets.includes(record.id));
    setDatabases(previous => previous.filter(record => !targets.includes(record.id)));
    setSelected(previous => previous.filter(id => !targets.includes(id)));
    setShowPassword(false);
    if (activeId && targets.includes(activeId)) setActiveId(null);
    setDialog(null); onNotice(`已删除 ${records.length} 个数据库（演示操作）`);
  };
  const rowMenu = (record: DatabaseRecord) => <DropdownMenuContent className="gdb-menu" align="end">
    <DropdownMenuItem onSelect={() => focusDatabase(record)}><Database size={15} />查看数据库详情</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => { focusDatabase(record); open("connection"); }}><CodeXml size={15} />连接信息</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => exportSQL(record)}><Download size={15} />导出 SQL 结构</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => toggleRunning(record)}><Network size={15} />{record.running ? "停止数据库" : "启动数据库"}</DropdownMenuItem>
    <DropdownMenuItem className="gdb-danger" onSelect={() => open("delete", [record.id])}><Trash2 size={15} />删除数据库</DropdownMenuItem>
  </DropdownMenuContent>;
  const connection = active ? `主机：${server.ip}\n端口：3306\n数据库：${active.name}\n用户名：${active.username}\n字符集：utf8mb4` : "";

  return <div className="gdb-workspace">
      <section className="gdb-metrics" aria-label="数据库统计">
        <article className="gsd-card gdb-metric"><span className="gdb-icon"><Database size={26} /></span><div><h3>数据库总数</h3><strong>{databases.length}<small>个</small></strong><p>包含 {runningCount} 个可用，{databases.length - runningCount} 个已停止</p></div></article>
        <article className="gsd-card gdb-metric"><span className="gdb-icon"><PieChart size={26} /></span><div><h3>已用存储</h3><strong>{usedGB} GB<small>/ 10 GB</small></strong><div className="gdb-mini-storage"><div className="gdb-progress"><span style={{ width: `${Math.min(100, usedPercent)}%` }} /></div><b>{usedPercent}%</b></div></div></article>
        <article className="gsd-card gdb-metric"><span className="gdb-icon green"><Network size={26} /></span><div><h3>活跃连接数</h3><strong>{connections}<small className="gdb-positive"><ArrowDown size={15} />25%</small></strong><p>当前连接到数据库的客户端数</p></div></article>
        <article className="gsd-card gdb-metric"><span className="gdb-icon purple"><Clock3 size={26} /></span><div><h3>最近备份</h3><strong className="gdb-backup-time">{latestBackup ? latestBackup.slice(0, 16) : "暂无备份"}{latestBackup && <CircleCheck size={16} className="gdb-success-icon" />}</strong><p>最近一次数据库备份</p></div></article>
      </section>

    <main className="gdb-main">
      <section className="gsd-card gdb-list" aria-label="数据库列表">
        <header><h2><Database size={21} />数据库列表</h2><div className="gdb-toolbar">
          <button className="gsd-button primary" onClick={() => open("create")}><CirclePlus size={16} />新建数据库</button>
          <button className="gsd-button" disabled={!databases.length} onClick={() => open("import")}><Download size={16} />导入 SQL</button>
          <DropdownMenu><DropdownMenuTrigger asChild><button className="gsd-button"><Copy size={16} />备份<ChevronDown size={14} /></button></DropdownMenuTrigger><DropdownMenuContent className="gdb-menu" align="end"><DropdownMenuItem onSelect={() => backup(selected)}>备份选中数据库</DropdownMenuItem><DropdownMenuItem disabled={!active} onSelect={() => active && backup([active.id])}>备份当前数据库</DropdownMenuItem><DropdownMenuItem disabled={!databases.length} onSelect={() => backup(databases.map(record => record.id))}>备份全部数据库</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          <button className="gsd-button danger" aria-disabled={!selected.length} onClick={() => selected.length ? open("delete", selected) : onNotice("请先选择需要删除的数据库")}><Trash2 size={16} />删除</button>
        </div></header>
        <div className="gdb-filters">
          <label className="gdb-search"><Search size={18} /><input aria-label="搜索数据库" placeholder="搜索数据库名称，支持模糊匹配..." value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label>
          <label className="gdb-select"><select aria-label="数据库类型" value={type} onChange={event => { setType(event.target.value); setPage(1); }}><option value="all">全部类型</option><option>MySQL</option><option>MariaDB</option></select><ChevronDown size={15} /></label>
          <label className="gdb-select"><select aria-label="数据库状态" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">全部状态</option><option value="running">运行中</option><option value="stopped">已停止</option></select><ChevronDown size={15} /></label>
          <label className="gdb-select gdb-sort"><CalendarDays size={17} /><select aria-label="按创建时间排序" value={sort} onChange={event => { setSort(event.target.value); setPage(1); }}><option value="default">创建时间</option><option value="newest">创建时间：最新</option><option value="oldest">创建时间：最早</option></select><ChevronDown size={15} /></label>
          <button className="gsd-button gdb-refresh" aria-label="刷新数据库列表" onClick={() => { setDatabases(previous => [...previous]); onNotice("数据库列表已刷新（演示数据）"); }}><RefreshCw size={16} />刷新</button>
        </div>
        <div className="gdb-table-scroll"><table className="gdb-table"><colgroup><col className="gdb-col-check" /><col className="gdb-col-name" /><col className="gdb-col-type" /><col className="gdb-col-version" /><col className="gdb-col-size" /><col className="gdb-col-charset" /><col className="gdb-col-status" /><col className="gdb-col-connections" /><col className="gdb-col-backup" /><col className="gdb-col-actions" /></colgroup>
          <thead><tr><th><input type="checkbox" aria-label="选择当前页全部数据库" checked={allChecked} ref={element => { if (element) element.indeterminate = !allChecked && rows.some(record => selected.includes(record.id)); }} onChange={() => setSelected(previous => allChecked ? previous.filter(id => !rows.some(record => record.id === id)) : [...new Set([...previous, ...rows.map(record => record.id)])])} /></th><th>数据库名称</th><th>类型</th><th>版本</th><th>大小</th><th>字符集</th><th>状态</th><th>连接数</th><th>最近备份</th><th>操作</th></tr></thead>
          <tbody>{rows.map(record => <tr key={record.id} className={active?.id === record.id ? "active" : ""}>
            <td><input type="checkbox" aria-label={`选择 ${record.name}`} checked={selected.includes(record.id)} onChange={() => toggleSelection(record.id)} /></td>
            <td><button className="gdb-database-name" onClick={event => focusDatabase(record, event.currentTarget)} aria-label={`查看 ${record.name} 详情`} aria-expanded={active?.id === record.id} aria-controls={active?.id === record.id ? "gdb-database-details" : undefined}><span><Database size={21} /></span><div><strong>{record.name}</strong><small>{record.description}</small></div></button></td>
            <td><span className="gdb-type">{record.type}</span></td><td>{record.version}</td><td>{databaseSize(record.sizeMB)}</td><td>utf8mb4</td><td><DatabaseStatus running={record.running} /></td><td>{record.connections}</td>
            <td><span className="gdb-table-backup">{record.backup ? record.backup.slice(0, 16) : "暂无备份"}{record.backup && (record.running ? <CircleCheck size={14} className="gdb-success-icon" /> : <CircleAlert size={14} />)}</span></td>
            <td><div className="gdb-row-actions"><button onClick={event => focusDatabase(record, event.currentTarget)} aria-label={`管理 ${record.name}`} aria-expanded={active?.id === record.id} aria-controls={active?.id === record.id ? "gdb-database-details" : undefined}>管理</button><button onClick={() => record.running ? backup([record.id]) : toggleRunning(record)}>{record.running ? "备份" : "启动"}</button><DropdownMenu><DropdownMenuTrigger asChild><button aria-label={`${record.name} 更多操作`}><MoreHorizontal size={18} /></button></DropdownMenuTrigger>{rowMenu(record)}</DropdownMenu></div></td>
          </tr>)}</tbody>
        </table>{!rows.length && <div className="gdb-empty"><Database size={30} /><p>{databases.length ? "没有符合条件的数据库" : "暂无数据库"}</p><button className="gsd-button" onClick={() => { if (databases.length) { setQuery(""); setType("all"); setStatus("all"); } else open("create"); }}>{databases.length ? "清除筛选" : "新建数据库"}</button></div>}</div>
        <footer className="gdb-pagination"><span>共 {databases.length} 个数据库，当前显示 {rows.length} 个{selected.length ? `，已选 ${selected.length} 个` : ""}</span><nav aria-label="数据库分页"><button aria-label="数据库上一页" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={17} /></button>{Array.from({ length: Math.max(2, pageCount) }, (_, index) => <button key={index} className={currentPage === index + 1 ? "current" : ""} disabled={index + 1 > pageCount} aria-label={`数据库第 ${index + 1} 页`} aria-current={currentPage === index + 1 ? "page" : undefined} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button aria-label="数据库下一页" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={17} /></button><label className="gdb-select"><select aria-label="每页数据库数量" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}><option value="5">5 条/页</option><option value="10">10 条/页</option><option value="20">20 条/页</option></select><ChevronDown size={14} /></label></nav></footer>
      </section>

      <AnimatePresence initial={false} mode="wait">{active && <motion.aside key={active.id} {...sidebarAnimation} id="gdb-database-details" className="gsd-card gdb-details" aria-label="数据库详情" onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); closeDetails(); } }}>
      <header><h2><Database size={22} />数据库详情</h2><button autoFocus className="gdb-icon-button gdb-detail-close" aria-label="关闭数据库详情" onClick={closeDetails}><X size={18} /></button></header>
      <div className="gdb-detail-profile"><span className="gdb-icon"><Database size={27} /></span><div><div className="gdb-detail-title"><strong>{active.name}</strong><DatabaseStatus running={active.running} badge /></div><p>{active.description}</p></div><DropdownMenu><DropdownMenuTrigger asChild><button className="gdb-icon-button" aria-label="当前数据库更多操作"><MoreVertical size={18} /></button></DropdownMenuTrigger>{rowMenu(active)}</DropdownMenu></div>
      <dl className="gdb-detail-fields">
        <div><dt>数据库类型</dt><dd>{active.type}</dd></div><div><dt>数据库版本</dt><dd>{active.version}</dd></div><div><dt>数据库大小</dt><dd>{databaseSize(active.sizeMB)} ({(active.sizeMB * 1024 * 1024).toLocaleString("en-US")} 字节)</dd></div>
        <div><dt>字符集</dt><dd>utf8mb4</dd></div><div><dt>排序规则</dt><dd>utf8mb4_general_ci</dd></div>
        <div><dt>连接地址</dt><dd>{server.ip}<button className="gdb-icon-button" aria-label="复制数据库连接地址" onClick={() => copy(server.ip)}><Copy size={16} /></button></dd></div>
        <div><dt>端口</dt><dd>3306</dd></div><div><dt>用户名</dt><dd>{active.username}<button className="gdb-icon-button" aria-label="复制数据库用户名" onClick={() => copy(active.username)}><Copy size={16} /></button></dd></div>
        <div><dt>密码</dt><dd><span className="gdb-password">{showPassword ? active.password : "********"}</span><div className="gdb-field-actions"><button className="gdb-icon-button" aria-label={showPassword ? "隐藏数据库密码" : "显示数据库密码"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button><button className="gdb-icon-button" aria-label="复制数据库密码" onClick={() => copy(active.password)}><Copy size={16} /></button></div></dd></div>
        <div><dt>最大连接数</dt><dd>100</dd></div><div><dt>创建时间</dt><dd>{active.created}</dd></div><div><dt>最后备份</dt><dd>{active.backup || "暂无备份"}{active.backup && <CircleCheck size={16} className="gdb-success-icon" />}</dd></div>
      </dl><div className="gdb-detail-actions"><button className="gsd-button" onClick={() => open("connection")}><CodeXml size={18} />查看连接信息</button><button className="gsd-button" onClick={() => open("password")}><KeyRound size={18} />重置密码</button><button className="gsd-button primary" onClick={() => open("admin")}><ExternalLink size={17} />打开 phpMyAdmin</button></div>
      </motion.aside>}</AnimatePresence>
    </main>

    <Dialog open={dialog !== null} onOpenChange={value => { if (!value && !busy) setDialog(null); }}><DialogContent className="cloud-modal gsd-dialog gdb-dialog"><DialogTitle>{{ create: "新建数据库", import: "导入 SQL", delete: "删除数据库", connection: "数据库连接信息", password: "重置数据库密码", admin: "phpMyAdmin 管理" }[dialog ?? "create"]}</DialogTitle><DialogDescription>本页面使用演示数据，操作仅影响当前页面会话。</DialogDescription>
      {dialog === "create" && <form onSubmit={event => { event.preventDefault(); createDatabase(); }}><label>数据库名称<input autoFocus value={form.name} onChange={event => setForm(previous => ({ ...previous, name: event.target.value }))} placeholder="例如：minecraft_survival" maxLength={64} /></label><label>描述<input value={form.description} onChange={event => setForm(previous => ({ ...previous, description: event.target.value }))} placeholder="数据库用途" maxLength={60} /></label><label>数据库类型<select aria-label="数据库类型" value={form.type} onChange={event => setForm(previous => ({ ...previous, type: event.target.value }))}><option>MySQL</option><option>MariaDB</option></select></label>{error && <p className="gdb-error" role="alert">{error}</p>}<footer><button type="button" className="gsd-button" onClick={() => setDialog(null)}>取消</button><button className="gsd-button primary" type="submit">创建数据库</button></footer></form>}
      {dialog === "import" && <form onSubmit={event => { event.preventDefault(); void importSQL(); }}><label>目标数据库<select aria-label="目标数据库" value={importTarget} onChange={event => setImportTarget(event.target.value)}>{databases.map(record => <option key={record.id} value={record.id} disabled={!record.running}>{record.name}{record.running ? "" : "（已停止）"}</option>)}</select></label><label>SQL 文件<input ref={fileRef} type="file" accept=".sql" onChange={event => setSqlFile(event.target.files?.[0] ?? null)} /></label><p>支持 .sql 文件，最大 10 MB。演示仅在本地读取文件。</p>{error && <p className="gdb-error" role="alert">{error}</p>}<footer><button type="button" className="gsd-button" disabled={busy} onClick={() => setDialog(null)}>取消</button><button className="gsd-button primary" disabled={busy} type="submit">{busy ? "读取中..." : "导入 SQL"}</button></footer></form>}
      {dialog === "delete" && <><p>确认删除 {databases.filter(record => targets.includes(record.id)).map(record => record.name).join("、")}？演示数据删除后可通过刷新页面恢复。</p><footer><button className="gsd-button" onClick={() => setDialog(null)}>取消</button><button className="gsd-button danger" onClick={deleteDatabases}>确认删除</button></footer></>}
      {dialog === "connection" && active && <><pre>{connection}</pre><footer><button className="gsd-button primary" onClick={() => copy(connection)}><Copy size={16} />复制连接信息</button></footer></>}
      {dialog === "password" && active && <><p>为 {active.name} 生成新的演示密码。可在详情中查看和复制。</p><footer><button className="gsd-button" onClick={() => setDialog(null)}>取消</button><button className="gsd-button primary" onClick={() => { setDatabases(previous => previous.map(record => record.id === active.id ? { ...record, password: `demo_${crypto.randomUUID().slice(0, 12)}` } : record)); setShowPassword(false); setDialog(null); onNotice("演示密码已重置"); }}>生成演示密码</button></footer></>}
      {dialog === "admin" && active && <><div className="gdb-admin-summary"><Database size={28} /><div><strong>{active.name}</strong><p>{active.type} {active.version} · {databaseSize(active.sizeMB)}</p></div><DatabaseStatus running={active.running} badge /></div><p>phpMyAdmin 尚未配置真实服务地址。可以先复制连接信息，或导出 SQL 结构文件。</p><footer><button className="gsd-button" onClick={() => copy(connection)}><Copy size={16} />复制连接信息</button><button className="gsd-button primary" onClick={() => exportSQL(active)}><Download size={16} />导出 SQL 结构</button></footer></>}
    </DialogContent></Dialog>
  </div>;
}
