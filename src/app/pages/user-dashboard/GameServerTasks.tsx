import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, Archive, BarChart3, CalendarDays, CalendarCheck2, Check, ChevronDown, ChevronLeft, ChevronRight, CircleCheck, CirclePlay, CircleX, Clock3, Copy, FolderClosed, ClipboardList, Megaphone, MoreVertical, Pencil, Play, Plus, RefreshCw, Search, Settings2, Square, Timer, Trash2, X } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import type { ConsoleInstance } from "./cloudDashboardData";
import { initialServerTasks, initialTaskExecutions, nextTaskRun, parseTaskCron, taskTime, taskTones, taskTypes, type ServerTask, type TaskExecution, type TaskResult } from "./gameServerTasksData";
import { TaskSettingsDialog } from "./TaskSettingsDialog";
import "../../../styles/cloud-server-tasks.css";

const taskIcons = [CalendarDays, CirclePlay, CalendarCheck2, Clock3, Megaphone, Settings2];
const iconFor = (task: ServerTask) => taskIcons[Number(task.id.replace("task-", "")) - 1] ?? CalendarDays;
const blankTask = (): ServerTask => ({ id: "", name: "", description: "", command: "bash /scripts/backup.sh", cron: "0 4 * * *", type: "备份", enabled: true, directory: "/home/server/", retries: 3, timeout: 30, notify: true, environment: "server", onlyWhenOnline: false, onlyWhenEmpty: false, created: taskTime(new Date()), lastRun: "-", nextRun: "", duration: "-", result: "成功" });

function Result({ result, detailed = false }: { result: TaskResult; detailed?: boolean }) {
  const Icon = result === "成功" ? (detailed ? Check : CircleCheck) : result === "失败" ? CircleX : Timer;
  return <span className={`gst-result ${result === "成功" ? "success" : result === "失败" ? "failure" : "pending"}`}><Icon size={15} />{detailed && result !== "执行中" ? `执行${result}` : result}</span>;
}

function TaskStatus({ enabled }: { enabled: boolean }) {
  return <span className={`gst-status ${enabled ? "enabled" : "paused"}`}><span />{enabled ? "已启用" : "已暂停"}</span>;
}

function TaskMetric({ title, value, unit, tone, change, caption, subline, icon: Icon, points }: {
  title: string; value: ReactNode; unit?: string; tone: string; change?: string; caption: string; subline?: string; icon: typeof CalendarDays; points: number[];
}) {
  const color = { blue: "#087bff", green: "#00bf89", purple: "#a146ff", orange: "#ff8709" }[tone];
  return <article className={`gst-metric ${tone}`}>
    <div className="gst-metric-top"><span className="gst-icon-tile"><Icon size={27} /></span><div className="gst-metric-copy"><h3>{title}</h3><strong>{value}{unit && <small>{unit}</small>}</strong><p className="gst-metric-caption">{caption}</p>{subline && <p>{subline}</p>}</div>{change && <div className="gst-change"><span><ArrowUp size={13} />{change}</span><small>较上周</small></div>}</div>
    <div className="gst-sparkline" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><AreaChart data={points.map(value => ({ value }))} margin={{ top: 3, bottom: 0, left: 0, right: 0 }}><Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.06} strokeWidth={1.4} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>
  </article>;
}

export function GameServerTasks({ server, autosaveEnabled, onAutosaveChange, onNotice, onLog }: {
  server: ConsoleInstance; autosaveEnabled: boolean; onAutosaveChange: (enabled: boolean) => void; onNotice: (message: string) => void; onLog: (message: string) => void;
}) {
  const [tasks, setTasks] = useState(() => initialServerTasks.map(task => ({ ...task })));
  const [executions, setExecutions] = useState(initialTaskExecutions);
  const [activeId, setActiveId] = useState<string | null>(null);
  const detailTriggerRef = useRef<HTMLElement | null>(null);
  const formTriggerRef = useRef<HTMLElement | null>(null);
  const newTaskRef = useRef<HTMLButtonElement | null>(null);
  const reducedMotion = useReducedMotion();
  const sidebarAnimation = {
    initial: { opacity: 0, x: reducedMotion ? 0 : 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reducedMotion ? 0 : 16 },
    transition: { duration: reducedMotion ? 0 : 0.2 },
  };
  const detailText = (text: ReactNode, title?: string) => <motion.span key={activeId} className="gst-detail-value" title={title} initial={{ opacity: reducedMotion ? 1 : 0, x: reducedMotion ? 0 : 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reducedMotion ? 0 : 0.24, ease: "easeOut" }}>{text}</motion.span>;
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [frequency, setFrequency] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [draft, setDraft] = useState<ServerTask | null>(null);
  const [formError, setFormError] = useState("");
  const [logTask, setLogTask] = useState<ServerTask | null>(null);
  const [deleteTask, setDeleteTask] = useState<ServerTask | null>(null);
  const timers = useRef(new Set<number>());
  const runningTasks = useRef(new Set<string>());
  const sequence = useRef(7);
  const effectiveTasks = tasks.map(task => task.id === "task-004" ? { ...task, enabled: autosaveEnabled } : task);
  const active = effectiveTasks.find(task => task.id === activeId);
  const enabledCount = effectiveTasks.filter(task => task.enabled).length;
  const addedRuns = executions.filter(run => run.id.startsWith("manual-"));
  const completedRuns = addedRuns.filter(run => run.result !== "执行中");
  const successRate = ((205 + completedRuns.filter(run => run.result === "成功").length) / (215 + completedRuns.length) * 100).toFixed(1);
  const upcomingTasks = effectiveTasks.filter(task => task.enabled && task.nextRun).sort((a, b) => a.nextRun.localeCompare(b.nextRun));
  const next = upcomingTasks.find(task => task.nextRun > taskTime(new Date())) ?? upcomingTasks[0];
  const nextDate = next ? new Date(`${next.nextRun.replace(" ", "T")}:00+08:00`) : null;
  const nextMinutes = nextDate && nextDate > new Date() ? Math.max(1, Math.ceil((nextDate.getTime() - Date.now()) / 60000)) : 84;
  const filtered = effectiveTasks.filter(task => {
    const fields = task.cron.trim().split(/\s+/);
    const taskFrequency = fields[1] === "*" ? "interval" : fields[4] !== "*" ? "weekly" : fields[2] !== "*" || fields[3] !== "*" ? "monthly" : "daily";
    return `${task.name} ${task.command} ${task.description}`.toLowerCase().includes(query.trim().toLowerCase()) && (status === "all" || task.enabled === (status === "enabled")) && (type === "all" || task.type === type) && (frequency === "all" || frequency === taskFrequency);
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1).filter(value => value === 1 || value === pageCount || Math.abs(value - currentPage) <= 1);

  useEffect(() => { setPage(1); }, [query, status, type, frequency, pageSize]);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
  useEffect(() => () => { timers.current.forEach(timer => window.clearTimeout(timer)); }, []);

  const focusTask = (task: ServerTask, trigger?: HTMLElement) => {
    detailTriggerRef.current = trigger ?? null;
    setActiveId(task.id);
  };
  const closeDetails = () => {
    setActiveId(null);
    if (detailTriggerRef.current?.isConnected) detailTriggerRef.current.focus({ preventScroll: true });
  };
  const setEnabled = (ids: string[], enabled: boolean) => {
    setTasks(previous => previous.map(task => ids.includes(task.id) ? { ...task, enabled } : task));
    if (ids.includes("task-004")) onAutosaveChange(enabled);
    onNotice(`${ids.length} 项任务已${enabled ? "启用" : "暂停"}（演示操作）`);
  };
  const edit = (task?: ServerTask) => { formTriggerRef.current = document.activeElement as HTMLElement; setDraft(task ? { ...task, environment: "server" } : blankTask()); setFormError(""); };
  const showLogs = (task: ServerTask) => { setLogTask(task); };
  const execute = (task: ServerTask) => {
    if (runningTasks.current.has(task.id)) return;
    if (task.onlyWhenOnline && !server.running) { onNotice("服务器离线，已按运行条件跳过此任务（演示操作）"); return; }
    if (task.onlyWhenEmpty && server.running && server.players > 0) { onNotice(`当前有 ${server.players} 位玩家在线，已按运行条件跳过此任务（演示操作）`); return; }
    runningTasks.current.add(task.id);
    const runId = `manual-${crypto.randomUUID()}`;
    const now = new Date();
    setTasks(previous => previous.map(row => row.id === task.id ? { ...row, result: "执行中" } : row));
    setExecutions(previous => [{ id: runId, taskId: task.id, name: task.name, time: taskTime(now, true), result: "执行中", duration: "-", output: "正在模拟执行，请稍候…" }, ...previous]);
    onNotice(`正在模拟执行「${task.name}」`);
    const timer = window.setTimeout(() => {
      const result = server.running ? "成功" : "失败";
      const output = server.running ? `模拟执行完成：${task.command}` : "模拟执行失败：服务器已停止，请先启动实例";
      setTasks(previous => previous.map(row => row.id === task.id ? { ...row, result, lastRun: taskTime(now), duration: "1 秒", nextRun: nextTaskRun(task.cron) ?? row.nextRun } : row));
      setExecutions(previous => previous.map(run => run.id === runId ? { ...run, result, duration: "1 秒", output } : run));
      onLog(`Tasks: ${task.name} · ${output}`);
      onNotice(`「${task.name}」模拟执行${result}`);
      runningTasks.current.delete(task.id);
      timers.current.delete(timer);
    }, 900);
    timers.current.add(timer);
  };
  const saveTask = () => {
    if (!draft) return;
    if (!draft.name.trim() || !draft.command.trim()) { setFormError("请填写任务名称和执行命令。"); return; }
    if (!Number.isInteger(draft.retries) || draft.retries < 0 || draft.retries > 10 || !Number.isInteger(draft.timeout) || draft.timeout < 1 || draft.timeout > 120) { setFormError("重试次数应为 0–10，超时时间应为 1–120 分钟的整数。"); return; }
    if (!parseTaskCron(draft.cron)) { setFormError("请输入有效的 5 段 Cron 表达式，例如 0 3 * * *。"); return; }
    const nextRun = nextTaskRun(draft.cron);
    if (!nextRun) { setFormError("此 Cron 表达式没有可执行的日期，请检查日期与月份。"); return; }
    const id = draft.id || `task-${String(sequence.current++).padStart(3, "0")}`;
    const saved: ServerTask = { ...draft, environment: "server", id, name: draft.name.trim(), command: draft.command.trim(), directory: draft.directory.trim() || "/home/server/", cron: draft.cron.trim().replace(/\s+/g, " "), nextRun };
    setTasks(previous => draft.id ? previous.map(task => task.id === id ? saved : task) : [...previous, saved]);
    if (id === "task-004") onAutosaveChange(saved.enabled);
    setActiveId(id);
    setDraft(null);
    onNotice(`任务已${draft.id ? "更新" : "创建"}（演示操作）`);
  };
  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); onNotice("已复制到剪贴板"); }
    catch { onNotice("复制失败，请手动选择并复制文本"); }
  };
  const menu = (task: ServerTask, detail = false) => <DropdownMenu><DropdownMenuTrigger asChild><button className={detail ? "gst-icon-button" : "gst-more"} aria-label={`${task.name}更多操作`}>{detail ? <MoreVertical size={17} /> : <>更多<ChevronDown size={12} /></>}</button></DropdownMenuTrigger><DropdownMenuContent className="gst-menu" align="end"><DropdownMenuItem onSelect={() => focusTask(task)}><Archive size={14} />查看任务详情</DropdownMenuItem><DropdownMenuItem onSelect={() => showLogs(task)}><FolderClosed size={14} />查看日志</DropdownMenuItem><DropdownMenuItem disabled={task.result === "执行中"} onSelect={() => setEnabled([task.id], !task.enabled)}>{task.enabled ? <Square size={14} /> : <Play size={14} />}{task.enabled ? "暂停任务" : "启用任务"}</DropdownMenuItem><DropdownMenuItem onSelect={() => { formTriggerRef.current = document.activeElement as HTMLElement; setDraft({ ...task, environment: "server", id: "", name: `${task.name}（副本）`, lastRun: "-", duration: "-", created: taskTime(new Date()), result: "成功" }); setFormError(""); }}><Copy size={14} />复制任务</DropdownMenuItem><DropdownMenuItem variant="destructive" disabled={task.result === "执行中"} onSelect={() => setDeleteTask(task)}><Trash2 size={14} />删除任务</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;

  const executionTable = (runs: TaskExecution[], expanded = false) => <div className="gst-table-scroll"><table className={`gst-history-table${expanded ? " expanded" : ""}`}><colgroup><col style={{ width: "14%" }} /><col style={{ width: "15.5%" }} /><col style={{ width: "9%" }} /><col style={{ width: "10%" }} /><col /></colgroup><thead><tr><th>执行时间</th><th>任务名称</th><th>结果</th><th>耗时</th><th>输出摘要</th></tr></thead><tbody>{runs.map((run, index) => <tr key={run.id} className={index === 0 ? "highlight" : undefined}><td>{run.time}</td><td>{run.name}</td><td><Result result={run.result} /></td><td>{run.duration}</td><td title={run.output}>{run.output}</td></tr>)}{!runs.length && <tr><td colSpan={5} className="gst-no-records">该任务还没有执行记录。</td></tr>}</tbody></table></div>;

  return <div className="gst-workspace">
    <section className="gst-metrics" aria-label="定时任务统计">
      <TaskMetric title="任务总数" value={effectiveTasks.length} unit="个" tone="blue" icon={CalendarDays} change="20%" caption="包含所有定时任务" points={[1, 4, 3, 6, 8, 7, 12, 14]} />
      <TaskMetric title="启用任务" value={enabledCount} unit="个" tone="green" icon={CirclePlay} change="25%" caption={`占总数 ${effectiveTasks.length ? Math.round(enabledCount / effectiveTasks.length * 100) : 0}%`} points={[2, 3, 6, 6, 9, 8, 12, 14]} />
      <TaskMetric title="成功率" value={successRate} unit="%" tone="purple" icon={BarChart3} change="2.1%" caption="近 7 天执行成功率" points={[3, 6, 8, 8, 13, 15, 14, 16]} />
      <TaskMetric title="下次执行" value={next ? <>{Math.floor(nextMinutes / 60) > 0 && <>{Math.floor(nextMinutes / 60)}<small>小时</small> </>}{nextMinutes % 60}<small>分钟</small></> : "-"} tone="orange" icon={Clock3} subline={next?.nextRun} caption={next?.name ?? "暂无启用的定时任务"} points={[1, 2, 3, 4, 5, 8, 12, 14]} />
    </section>
    <div className="gst-layout">
      <section className="gsd-card gst-list" aria-label="定时任务列表">
        <header><h2><ClipboardList size={20} />定时任务列表</h2><div className="gst-list-actions"><button ref={newTaskRef} className="gsd-button primary" onClick={() => edit()}><Plus size={18} />新建任务</button><DropdownMenu><DropdownMenuTrigger asChild><button className="gsd-button" disabled={!selected.length}><Settings2 size={16} />批量操作{selected.length > 0 && <span>（{selected.length}）</span>}<ChevronDown size={14} /></button></DropdownMenuTrigger><DropdownMenuContent className="gst-menu" align="end"><DropdownMenuItem onSelect={() => setEnabled(selected, true)}><Play size={14} />批量启用</DropdownMenuItem><DropdownMenuItem onSelect={() => setEnabled(selected, false)}><Square size={14} />批量禁用</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></header>
        <div className="gst-filters"><label className="gsd-search"><Search size={17} /><input aria-label="搜索定时任务" placeholder="搜索任务名称、执行命令或备注…" value={query} onChange={event => setQuery(event.target.value)} /></label><select aria-label="任务状态筛选" value={status} onChange={event => setStatus(event.target.value)}><option value="all">全部状态</option><option value="enabled">已启用</option><option value="paused">已暂停</option></select><select aria-label="任务类型筛选" value={type} onChange={event => setType(event.target.value)}><option value="all">全部类型</option>{taskTypes.map(type => <option key={type}>{type}</option>)}</select><select aria-label="执行频率筛选" value={frequency} onChange={event => setFrequency(event.target.value)}><option value="all">全部执行频率</option><option value="interval">定时间隔</option><option value="daily">每天</option><option value="weekly">每周</option><option value="monthly">按月或日期</option></select><button className="gsd-button gst-refresh" aria-label="刷新定时任务列表" onClick={() => { setTasks(previous => [...previous]); onNotice("定时任务列表已刷新（演示数据）"); }}><RefreshCw size={16} />刷新</button></div>
        <div className="gst-table-scroll"><table className="gst-task-table"><colgroup><col style={{ width: "3.5%" }} /><col style={{ width: "18%" }} /><col style={{ width: "8.5%" }} /><col style={{ width: "22%" }} /><col style={{ width: "6%" }} /><col style={{ width: "7%" }} /><col style={{ width: "13%" }} /><col style={{ width: "7.5%" }} /><col style={{ width: "14.5%" }} /></colgroup><thead><tr><th><input type="checkbox" aria-label="选择当前页全部任务" checked={rows.length > 0 && rows.every(task => selected.includes(task.id))} ref={element => { if (element) element.indeterminate = rows.some(task => selected.includes(task.id)) && !rows.every(task => selected.includes(task.id)); }} onChange={event => setSelected(previous => event.target.checked ? [...new Set([...previous, ...rows.map(task => task.id)])] : previous.filter(id => !rows.some(task => task.id === id)))} /></th>{["任务名称", "Cron 表达式", "执行命令", "类型", "状态", "下次执行", "最近结果", "操作"].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(task => {
          const Icon = iconFor(task);
          return <tr key={task.id} onClick={event => { if ((event.target as Element).closest("button, input, [role=menuitem]")) return; focusTask(task, event.currentTarget.querySelector<HTMLButtonElement>(".gst-task-name") ?? undefined); }} className={task.id === active?.id ? "active" : selected.includes(task.id) ? "checked" : undefined}><td><input type="checkbox" aria-label={`选择${task.name}`} checked={selected.includes(task.id)} onChange={event => setSelected(previous => event.target.checked ? [...previous, task.id] : previous.filter(id => id !== task.id))} /></td><td><button className={`gst-task-name ${task.id === "task-005" ? "red" : task.id === "task-003" ? "blue" : task.id === "task-004" ? "orange" : taskTones[task.type]}`} onClick={event => focusTask(task, event.currentTarget)} aria-label={`查看${task.name}详情`} aria-expanded={active?.id === task.id} aria-controls={active?.id === task.id ? "gst-task-details" : undefined}><span className="gst-task-symbol"><Icon size={18} /></span><span><strong>{task.name}</strong><small>{task.description || "自定义定时任务"}</small></span></button></td><td>{task.cron}</td><td><span className="gst-truncate" title={task.command}>{task.command}</span></td><td><span className={`gst-type ${taskTones[task.type]}`}>{task.type}</span></td><td><TaskStatus enabled={task.enabled} /></td><td>{task.enabled ? task.nextRun : "-"}</td><td>{task.lastRun === "-" && task.result !== "执行中" ? <span className="gst-muted">未执行</span> : <Result result={task.result} />}</td><td><div className="gst-row-actions"><button onClick={() => edit(task)}>编辑</button><button disabled={task.result === "执行中"} onClick={() => execute(task)}>执行</button>{menu(task)}</div></td></tr>;
        })}{!filtered.length && <tr><td colSpan={9}><div className="gst-empty"><Search size={24} /><strong>没有符合条件的任务</strong><button onClick={() => { setQuery(""); setStatus("all"); setType("all"); setFrequency("all"); }}>清除筛选</button></div></td></tr>}</tbody></table></div>
        <footer className="gst-pagination"><span aria-live="polite">共 {filtered.length} 个任务，当前显示 {rows.length} 个{selected.length ? `，已选 ${selected.length} 个` : ""}</span><nav aria-label="定时任务分页"><button aria-label="任务上一页" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button>{pageNumbers.map((value, index) => <span key={value} className="gst-page-number">{index > 0 && value - pageNumbers[index - 1] > 1 && <span className="gst-page-gap">…</span>}<button aria-label={`任务第 ${value} 页`} aria-current={currentPage === value ? "page" : undefined} className={currentPage === value ? "active" : undefined} onClick={() => setPage(value)}>{value}</button></span>)}<button aria-label="任务下一页" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button></nav><select aria-label="每页任务数量" value={pageSize} onChange={event => setPageSize(Number(event.target.value))}>{[5, 10, 20].map(value => <option key={value} value={value}>{value} 条/页</option>)}</select></footer>
      </section>
      <AnimatePresence initial={false} mode="wait">{active && <motion.aside key="task-details" {...sidebarAnimation} id="gst-task-details" className="gsd-card gst-detail" aria-label="任务详情" onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); closeDetails(); } }}>
        <header><h2><Archive size={18} />任务详情</h2><div className="gst-detail-controls"><TaskStatus enabled={active.enabled} />{menu(active, true)}<button autoFocus className="gst-icon-button gst-detail-close" aria-label="关闭任务详情" onClick={closeDetails}><X size={18} /></button></div></header>
        <><div className={`gst-detail-title ${taskTones[active.type]}`}><span className="gst-icon-tile">{(() => { const Icon = iconFor(active); return <Icon size={27} />; })()}</span><div><h3>{detailText(active.name)}</h3><p>{detailText(active.id === "task-001" ? `定期备份 ${server.game} 世界存档文件，防止数据丢失` : active.description || "自定义服务器定时任务")}</p></div></div>
          <dl className="gst-detail-fields"><div><dt>任务 ID</dt><dd>{detailText(active.id)}</dd></div><div><dt>执行目录</dt><dd>{detailText(active.directory)}</dd></div><div><dt>触发方式</dt><dd>Cron 表达式</dd></div><div><dt>Cron 表达式</dt><dd>{detailText(active.cron)}<button aria-label="复制 Cron 表达式" onClick={() => copy(active.cron)}><Copy size={13} /></button></dd></div><div><dt>执行命令</dt><dd>{detailText(active.command, active.command)}<button aria-label="复制执行命令" onClick={() => copy(active.command)}><Copy size={13} /></button></dd></div><div><dt>重试策略</dt><dd>{detailText(active.retries ? `失败后重试 ${active.retries} 次（间隔 5 分钟）` : "不重试")}</dd></div><div><dt>超时时间</dt><dd>{detailText(`${active.timeout} 分钟`)}</dd></div><div><dt>最近耗时</dt><dd>{detailText(active.duration)}</dd></div><div><dt>通知方式</dt><dd>{detailText(active.notify ? "站内信、邮件（失败时）" : "不通知")}</dd></div><div><dt>创建时间</dt><dd>{detailText(active.created)}</dd></div><div><dt>最近执行结果</dt><dd>{detailText(active.lastRun === "-" && active.result !== "执行中" ? "尚未执行" : <><Result result={active.result} detailed /><span className="gst-last-run">（{active.lastRun}）</span></>)}</dd></div></dl>
          <footer className="gst-detail-actions"><button className="gsd-button primary" disabled={active.result === "执行中"} onClick={() => execute(active)}><CirclePlay size={16} />{active.result === "执行中" ? "执行中…" : "立即执行"}</button><button className="gsd-button" onClick={() => edit(active)}><Pencil size={16} />编辑任务</button><button className="gsd-button" onClick={() => showLogs(active)}><FolderClosed size={17} />查看日志</button></footer></>
      </motion.aside>}</AnimatePresence>
    </div>

    <TaskSettingsDialog draft={draft} onChange={value => { setDraft({ ...value, environment: "server" }); setFormError(""); }} onClose={() => setDraft(null)} onSave={saveTask} error={formError} triggerRef={formTriggerRef} fallbackRef={newTaskRef} serverName={server.name} />
    <Dialog open={!!logTask} onOpenChange={open => { if (!open) setLogTask(null); }}><DialogContent className="cloud-modal gsd-dialog gst-log-dialog"><DialogTitle>{logTask?.name} · 执行日志</DialogTitle><DialogDescription>查看任务执行结果与输出摘要（演示记录，北京时间）。</DialogDescription>{executionTable(executions.filter(run => run.taskId === logTask?.id), true)}</DialogContent></Dialog>
    <Dialog open={!!deleteTask} onOpenChange={open => { if (!open) setDeleteTask(null); }}><DialogContent className="cloud-modal gsd-dialog"><DialogTitle>删除定时任务</DialogTitle><DialogDescription>确定删除「{deleteTask?.name}」？执行记录会保留。</DialogDescription><button className="gsd-button danger" onClick={() => { if (!deleteTask) return; setTasks(previous => previous.filter(task => task.id !== deleteTask.id)); setSelected(previous => previous.filter(id => id !== deleteTask.id)); if (deleteTask.id === "task-004") onAutosaveChange(false); if (deleteTask.id === activeId) setActiveId(null); setDeleteTask(null); onNotice("任务已删除（演示操作）"); }}><Trash2 size={16} />确认删除</button></DialogContent></Dialog>
  </div>;
}
