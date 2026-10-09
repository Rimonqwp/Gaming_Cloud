import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Archive, Bell, BookOpen, CalendarDays, CircleCheck, Clock3, Code2, ExternalLink, FileText, Layers, Mail, Play, Puzzle, RotateCcw, Save, Server, Settings, ShieldCheck, Terminal, Timer, TriangleAlert, Users, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import { nextTaskRun, parseTaskCron, taskTypes, type ServerTask } from "./gameServerTasksData";
import "../../../styles/cloud-task-settings.css";

const templates: { name: string; description: string; icon: LucideIcon; command: string; type: ServerTask["type"] }[] = [
  { name: "自动备份", description: "备份服务器文件与世界存档，防止数据丢失。", icon: Archive, command: "bash /scripts/backup.sh", type: "备份" },
  { name: "自动重启", description: "定时重启服务器，释放内存并保持稳定运行。", icon: RotateCcw, command: "restart", type: "系统" },
  { name: "自动更新插件", description: "按计划更新服务器插件，保持插件版本最新。", icon: Puzzle, command: "bash /scripts/update_plugins.sh", type: "维护" },
  { name: "执行控制台指令", description: "按计划执行自定义控制台命令。", icon: Terminal, command: "", type: "其他" },
];

type Frequency = "hourly" | "daily" | "weekly" | "monthly" | "custom";
const frequencies: { value: Frequency; label: string }[] = [{ value: "hourly", label: "每小时" }, { value: "daily", label: "每天" }, { value: "weekly", label: "每周" }, { value: "monthly", label: "每月" }];
const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function visualSchedule(cron: string) {
  const fields = cron.trim().split(/\s+/);
  const valid = parseTaskCron(cron);
  const [minute, hour, day, month, weekday] = fields;
  const single = (field: string) => /^\d+$/.test(field);
  let frequency: Frequency = "custom";
  if (valid && single(minute) && month === "*") {
    if (day === "*" && weekday === "*") frequency = hour === "*" ? "hourly" : single(hour) ? "daily" : "custom";
    else if (single(hour) && day === "*" && single(weekday)) frequency = "weekly";
    else if (single(hour) && single(day) && weekday === "*") frequency = "monthly";
  }
  return { frequency, minute: valid && single(minute) ? Number(minute) : 0, hour: valid && single(hour) ? Number(hour) : 4, day: valid && single(day) ? Number(day) : 1, weekday: valid && single(weekday) ? Number(weekday) % 7 : 1 };
}

function DocumentationLink({ label }: { label: string }) {
  return <Link className="gstc-doc-link" to="/support/article/schedule-restart" target="_blank" rel="noopener noreferrer" aria-label={`${label}（新标签页打开）`}><BookOpen size={17} />查看文档<ExternalLink size={14} /></Link>;
}

function Card({ title, description, icon: Icon, action, children }: { title: string; description?: string; icon: LucideIcon; action?: ReactNode; children: ReactNode }) {
  return <section className="gstc-card"><header><Icon size={24} /><div className="gstc-card-heading"><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</header>{children}</section>;
}

function SettingRow({ title, description, icon: Icon, children }: { title: string; description?: string; icon: LucideIcon; children: ReactNode }) {
  return <div className="gstc-setting-row"><Icon size={24} /><div className="gstc-setting-copy"><strong>{title}</strong>{description && <small>{description}</small>}</div><div className="gstc-setting-control">{children}</div></div>;
}

function SummaryRow({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return <div><Icon size={22} /><dt>{title}</dt><dd>{children}</dd></div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <div className="gstc-toggle"><Switch aria-label={label} checked={checked} onCheckedChange={onChange} /><span>{checked ? "已开启" : "已关闭"}</span></div>;
}

function TaskSettingsForm({ draft, onChange, error, onSave, onCancel, serverName }: {
  draft: ServerTask; onChange: (draft: ServerTask) => void; error: string; onSave: () => void; onCancel: () => void; serverName: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const observer = new ResizeObserver(([entry]) => {
      scroll.style.setProperty("--gstc-scroll-height", `${entry.contentRect.height}px`);
    });
    observer.observe(scroll);
    return () => observer.disconnect();
  }, []);
  const [original] = useState(() => ({ ...draft }));
  const [selectedTemplateName, setSelectedTemplateName] = useState(() => templates.find(template => template.command === draft.command && template.type === draft.type)?.name ?? null);
  const selectedTemplate = templates.find(template => template.name === selectedTemplateName);
  const schedule = visualSchedule(draft.cron);
  const [currentMinute, setCurrentMinute] = useState(() => Math.floor(Date.now() / 60000));
  useEffect(() => {
    const updateClock = () => setCurrentMinute(Math.floor(Date.now() / 60000));
    const timer = window.setInterval(updateClock, 1000);
    document.addEventListener("visibilitychange", updateClock);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", updateClock);
    };
  }, []);
  const preview = useMemo(() => nextTaskRun(draft.cron, new Date(currentMinute * 60000)), [draft.cron, currentMinute]);
  const update = (patch: Partial<ServerTask>) => onChange({ ...draft, ...patch });
  const chooseFrequency = (frequency: Frequency, patch: Partial<typeof schedule> = {}) => {
    const value = { ...schedule, ...patch, frequency };
    update({ cron: `${value.minute} ${frequency === "hourly" ? "*" : value.hour} ${frequency === "monthly" ? value.day : "*"} * ${frequency === "weekly" ? value.weekday : "*"}` });
  };
  const chooseTime = (value: string) => {
    if (!value) return;
    const [hour, minute] = value.split(":").map(Number);
    chooseFrequency(schedule.frequency, { hour, minute });
  };
  const chooseTemplate = (index: number) => {
    const template = templates[index];
    setSelectedTemplateName(template.name);
    update({ command: template.command, type: template.type, environment: "server" });
  };
  const reset = () => { onChange({ ...original, environment: "server" }); setSelectedTemplateName(templates.find(template => template.command === original.command && template.type === original.type)?.name ?? null); };
  const templateName = selectedTemplate?.name ?? "自定义动作";
  const validSchedule = !!parseTaskCron(draft.cron);
  const frequencyLabel = validSchedule ? frequencies.find(option => option.value === schedule.frequency)?.label ?? "自定义 Cron" : "待设置有效计划";
  const time = `${String(schedule.hour).padStart(2, "0")}:${String(schedule.minute).padStart(2, "0")}`;
  const executionTime = !validSchedule ? "待设置有效计划" : schedule.frequency === "hourly" ? `每小时第 ${schedule.minute} 分钟` : schedule.frequency === "weekly" ? `${weekdays[schedule.weekday]} ${time}` : schedule.frequency === "monthly" ? `每月 ${schedule.day} 日 ${time}` : schedule.frequency === "daily" ? time : "按 Cron 表达式执行";
  const scheduleSummary = schedule.frequency === "daily" || schedule.frequency === "weekly" ? `${frequencyLabel} ${executionTime}` : schedule.frequency === "custom" ? frequencyLabel : executionTime;
  return <form className="gstc-content" onSubmit={event => { event.preventDefault(); onSave(); }}>
    <header className="gstc-banner"><span className="gstc-banner-icon"><CalendarDays size={30} /></span><div className="gstc-banner-copy"><DialogTitle>{draft.id ? "编辑任务" : "新建任务"}</DialogTitle><DialogDescription>设置执行计划、动作和运行条件，让服务器按时完成日常任务。</DialogDescription></div><DocumentationLink label="查看定时任务文档" /></header>
    <div className="gstc-scroll" ref={scrollRef}><div className="gstc-layout"><main>
      <Card title="基础设置" description="配置任务信息、默认行为和运行环境。" icon={Settings}>
        <div className="gstc-name-fields"><label>任务名称<input autoFocus aria-label="任务名称" value={draft.name} maxLength={60} required onChange={event => update({ name: event.target.value })} placeholder="例如：自动备份世界" /></label><label>任务备注<input aria-label="任务备注" value={draft.description} maxLength={150} onChange={event => update({ description: event.target.value })} placeholder="简要描述任务用途" /></label></div>
        <div className="gstc-rows">
          <SettingRow title="定时任务开关" description="开启后按下方配置自动执行定时任务。" icon={ShieldCheck}><Toggle label="定时任务开关" checked={draft.enabled} onChange={enabled => update({ enabled })} /></SettingRow>
          <SettingRow title="默认时区" description="执行时间与 Cron 表达式均使用北京时间。" icon={Clock3}><div className="gstc-static-input">亚洲/上海 (UTC+8)</div></SettingRow>
          <SettingRow title="任务执行环境" description="任务统一在服务器内执行。" icon={Terminal}><div className="gstc-static-input">服务器内</div></SettingRow>
          <SettingRow title="失败重试次数" description="失败后每隔 5 分钟重试，0 表示不重试。" icon={RotateCcw}><div className="gstc-unit"><input aria-label="失败重试次数" type="number" min={0} max={10} required value={draft.retries} onChange={event => update({ retries: Number(event.target.value) })} /><span>次</span></div></SettingRow>
        </div>
      </Card>
      <Card title="调度规则" description="支持可视化选择执行时间，或手动输入 CRON 表达式。" icon={CalendarDays}>
        <div className="gstc-rows">
          <SettingRow title="执行频率" icon={CalendarDays}><div className="gstc-frequency" role="group" aria-label="执行频率">{frequencies.map(option => <button type="button" key={option.value} aria-pressed={schedule.frequency === option.value} onClick={() => chooseFrequency(option.value)}>{option.label}</button>)}</div></SettingRow>
          {schedule.frequency === "custom" ? <SettingRow title="自定义计划" description="保留当前 Cron 表达式，选择执行频率可切换到可视化配置。" icon={Code2}><span className="gstc-chip">自定义 Cron</span></SettingRow> : <>
            <SettingRow title="执行时间" description={schedule.frequency === "hourly" ? "每小时在指定分钟执行任务。" : "在指定时间执行任务。"} icon={Clock3}><div className="gstc-time-controls">{schedule.frequency === "hourly" ? <div className="gstc-unit"><input aria-label="执行分钟" type="number" min={0} max={59} required value={schedule.minute} onChange={event => chooseFrequency("hourly", { minute: Number(event.target.value) })} /><span>分</span></div> : <input aria-label="执行时间" type="time" required value={`${String(schedule.hour).padStart(2, "0")}:${String(schedule.minute).padStart(2, "0")}`} onInput={event => chooseTime(event.currentTarget.value)} onChange={event => chooseTime(event.target.value)} />}<span className="gstc-static-input">亚洲/上海 (UTC+8)</span></div></SettingRow>
            {schedule.frequency === "weekly" && <SettingRow title="执行星期" icon={CalendarDays}><select aria-label="执行星期" value={schedule.weekday} onChange={event => chooseFrequency("weekly", { weekday: Number(event.target.value) })}>{weekdays.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></SettingRow>}
            {schedule.frequency === "monthly" && <SettingRow title="执行日期" description="当月没有该日期时跳过。" icon={CalendarDays}><div className="gstc-unit"><input aria-label="执行日期" type="number" min={1} max={31} required value={schedule.day} onChange={event => chooseFrequency("monthly", { day: Number(event.target.value) })} /><span>日</span></div></SettingRow>}
          </>}
          <SettingRow title="CRON 表达式" description="分钟 · 小时 · 日期 · 月份 · 星期" icon={Code2}><input aria-label="Cron 表达式" aria-invalid={!preview} value={draft.cron} required onChange={event => update({ cron: event.target.value })} /></SettingRow>
          <SettingRow title="下次执行时间预览" description="按默认时区实时计算。" icon={Clock3}><output aria-live="polite" className={`gstc-preview${preview ? "" : " invalid"}`}>{!preview ? "请输入有效的执行计划" : draft.enabled ? `${preview}:00` : "任务已暂停，开启后按计划执行"}</output></SettingRow>
        </div>
      </Card>
      <Card title="执行动作" description="选择动作模板，再按需要调整执行命令。" icon={Play} action={<DocumentationLink label="查看执行动作文档" />}>
        <div className="gstc-templates">{templates.map((template, index) => <label key={template.name} className={selectedTemplate?.name === template.name ? "selected" : ""}><input type="radio" name="task-template" value={index} checked={selectedTemplate?.name === template.name} onChange={() => chooseTemplate(index)} /><template.icon size={26} /><span><strong>{template.name}</strong><small>{template.description}</small></span></label>)}</div>
        <div className="gstc-command-fields"><div className="gstc-name-fields"><label>任务类型<select aria-label="任务类型" value={draft.type} onChange={event => update({ type: event.target.value as ServerTask["type"] })}>{taskTypes.map(type => <option key={type}>{type}</option>)}</select></label><label>超时时间（分钟）<input aria-label="超时时间" type="number" min={1} max={120} required value={draft.timeout} onChange={event => update({ timeout: Number(event.target.value) })} /></label></div><label>执行命令<textarea aria-label="执行命令" value={draft.command} required onChange={event => update({ command: event.target.value })} placeholder="输入需要执行的命令" /></label></div>
      </Card>
      <Card title="运行条件" description="设置执行条件，避免在不合适的情况下运行。" icon={ShieldCheck}>
        <div className="gstc-conditions">{[{ label: "仅在服务器在线时执行", description: "服务器离线时跳过任务。", icon: Server, value: draft.onlyWhenOnline ?? true, onChange: (onlyWhenOnline: boolean) => update({ onlyWhenOnline }) }, { label: "避免玩家在线高峰", description: "仅在没有在线玩家时执行。", icon: Users, value: draft.onlyWhenEmpty ?? false, onChange: (onlyWhenEmpty: boolean) => update({ onlyWhenEmpty }) }, { label: "执行失败发送通知", description: "通过站内信、邮件通知。", icon: Bell, value: draft.notify, onChange: (notify: boolean) => update({ notify }) }].map(condition => <div key={condition.label}><condition.icon size={23} /><span><strong>{condition.label}</strong><small>{condition.description}</small></span><Switch aria-label={condition.label} checked={condition.value} onCheckedChange={condition.onChange} /></div>)}</div>
      </Card>
    </main><aside>
      <Card title="定时任务概览" icon={Timer}><dl className="gstc-summary" aria-label="定时任务概览">
        <SummaryRow title="定时任务状态" icon={Clock3}><span className={`gstc-status${draft.enabled ? "" : " off"}`}>{draft.enabled ? "已开启" : "已暂停"}</span></SummaryRow>
        <SummaryRow title="任务名称" icon={FileText}>{draft.name.trim() || "未命名任务"}</SummaryRow>
        <SummaryRow title="任务描述" icon={FileText}>{draft.description.trim() || "未填写描述"}</SummaryRow>
        <SummaryRow title="所属服务器" icon={Server}>{serverName}</SummaryRow>
        <SummaryRow title="当前时区" icon={Clock3}>亚洲/上海 (UTC+8)</SummaryRow>
        <SummaryRow title="调度计划" icon={RotateCcw}>{scheduleSummary}</SummaryRow>
        <SummaryRow title="执行动作" icon={Layers}>{templateName}</SummaryRow>
        <SummaryRow title="任务类型" icon={Layers}>{draft.type}</SummaryRow>
        <SummaryRow title="执行命令" icon={Terminal}><code>{draft.command.trim() || "未填写命令"}</code></SummaryRow>
        <SummaryRow title="下次执行时间" icon={CalendarDays}>{draft.enabled ? preview ?? "等待有效计划" : "任务已暂停"}</SummaryRow>
      </dl></Card>
      <Card title="通知与告警摘要" icon={Bell}><dl className="gstc-summary"><div><Mail size={21} /><dt>失败通知</dt><dd><span className={`gstc-status${draft.notify ? "" : " off"}`}>{draft.notify ? "已开启" : "已关闭"}</span></dd></div><div><TriangleAlert size={21} /><dt>失败重试</dt><dd>{draft.retries ? `最多 ${draft.retries} 次，间隔 5 分钟` : "不自动重试"}</dd></div><div><CircleCheck size={21} /><dt>超时时间</dt><dd>{draft.timeout} 分钟</dd></div><div><Users size={21} /><dt>通知接收人</dt><dd>服务器管理员</dd></div></dl></Card>
    </aside></div></div>
    <footer className="gstc-footer">{error && <p className="gstc-error" role="alert">{error}</p>}<div><button type="submit" className="gstc-button primary"><Save size={17} />{draft.id ? "保存任务" : "创建任务"}</button><button type="button" className="gstc-button" onClick={reset}><RotateCcw size={16} />{draft.id ? "还原修改" : "恢复默认"}</button><button type="button" className="gstc-button" onClick={onCancel}>取消</button></div><small>当前为演示环境，任务在本次页面会话中保存。</small></footer>
  </form>;
}

export function TaskSettingsDialog({ draft, onChange, onClose, onSave, error, triggerRef, fallbackRef, serverName }: {
  draft: ServerTask | null; onChange: (draft: ServerTask) => void; onClose: () => void; onSave: () => void; error: string;
  triggerRef: RefObject<HTMLElement | null>; fallbackRef: RefObject<HTMLButtonElement | null>; serverName: string;
}) {
  return <Dialog open={!!draft} onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="gstc-dialog" onCloseAutoFocus={event => { event.preventDefault(); (triggerRef.current?.isConnected ? triggerRef.current : fallbackRef.current)?.focus({ preventScroll: true }); }}>{draft && <TaskSettingsForm key={draft.id || "new-task"} draft={draft} onChange={onChange} onCancel={onClose} onSave={onSave} error={error} serverName={serverName} />}</DialogContent></Dialog>;
}
