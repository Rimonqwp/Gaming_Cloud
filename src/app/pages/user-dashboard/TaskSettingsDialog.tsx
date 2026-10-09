import { useMemo, useState, type ReactNode, type RefObject } from "react";
import { Archive, Bell, CalendarDays, CircleCheck, CircleHelp, Clock3, Code2, FileText, Layers, Mail, Megaphone, Play, RotateCcw, Save, Server, Settings, ShieldCheck, Terminal, Timer, TriangleAlert, Users, Wrench, type LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import { nextTaskRun, parseTaskCron, taskTypes, type ServerTask } from "./gameServerTasksData";
import "../../../styles/cloud-task-settings.css";

const templates: { name: string; description: string; icon: LucideIcon; command: string; type: ServerTask["type"]; environment: "server" | "console" }[] = [
  { name: "自动备份", description: "备份服务器文件与世界存档，防止数据丢失。", icon: Archive, command: "bash /scripts/backup.sh", type: "备份", environment: "server" },
  { name: "自动重启", description: "定时重启服务器，释放内存并保持稳定运行。", icon: RotateCcw, command: "restart", type: "系统", environment: "console" },
  { name: "清理日志", description: "清理过期的日志文件，释放磁盘空间。", icon: FileText, command: "find logs -type f -mtime +30 -delete", type: "维护", environment: "server" },
  { name: "广播消息", description: "向所有在线玩家发送服务器消息。", icon: Megaphone, command: "say 欢迎来到服务器！", type: "其他", environment: "console" },
  { name: "执行控制台指令", description: "按计划执行自定义控制台命令。", icon: Terminal, command: "", type: "其他", environment: "console" },
  { name: "世界维护", description: "保存世界存档，定期维护服务器。", icon: Wrench, command: "save-all", type: "系统", environment: "console" },
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

function Card({ title, description, icon: Icon, children }: { title: string; description?: string; icon: LucideIcon; children: ReactNode }) {
  return <section className="gstc-card"><header><Icon size={24} /><div><h2>{title}</h2>{description && <p>{description}</p>}</div></header>{children}</section>;
}

function SettingRow({ title, description, icon: Icon, children }: { title: string; description?: string; icon: LucideIcon; children: ReactNode }) {
  return <div className="gstc-setting-row"><Icon size={24} /><div className="gstc-setting-copy"><strong>{title}</strong>{description && <small>{description}</small>}</div><div className="gstc-setting-control">{children}</div></div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <div className="gstc-toggle"><Switch aria-label={label} checked={checked} onCheckedChange={onChange} /><span>{checked ? "已开启" : "已关闭"}</span></div>;
}

function TaskSettingsForm({ draft, onChange, error, onSave, onCancel, serverName, players }: {
  draft: ServerTask; onChange: (draft: ServerTask) => void; error: string; onSave: () => void; onCancel: () => void; serverName: string; players: number;
}) {
  const [original] = useState(() => ({ ...draft }));
  const [templateIndex, setTemplateIndex] = useState(() => templates.findIndex(template => template.command === draft.command && template.type === draft.type));
  const schedule = visualSchedule(draft.cron);
  const preview = useMemo(() => nextTaskRun(draft.cron), [draft.cron]);
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
    setTemplateIndex(index);
    const template = templates[index];
    update({ command: template.command, type: template.type, environment: template.environment });
  };
  const reset = () => { onChange({ ...original }); setTemplateIndex(templates.findIndex(template => template.command === original.command && template.type === original.type)); };
  const templateName = templates[templateIndex]?.name ?? "自定义动作";
  return <form className="gstc-content" onSubmit={event => { event.preventDefault(); onSave(); }}>
    <header className="gstc-banner"><span className="gstc-banner-icon"><CalendarDays size={30} /></span><div><DialogTitle>{draft.id ? "编辑任务" : "新建任务"}</DialogTitle><DialogDescription>设置执行计划、动作和运行条件，让服务器按时完成日常任务。</DialogDescription></div></header>
    <div className="gstc-scroll"><div className="gstc-layout"><main>
      <Card title="基础设置" description="配置任务信息、默认行为和运行环境。" icon={Settings}>
        <div className="gstc-name-fields"><label>任务名称<input autoFocus aria-label="任务名称" value={draft.name} maxLength={60} required onChange={event => update({ name: event.target.value })} placeholder="例如：自动备份世界" /></label><label>任务备注<input aria-label="任务备注" value={draft.description} maxLength={150} onChange={event => update({ description: event.target.value })} placeholder="简要描述任务用途" /></label></div>
        <div className="gstc-rows">
          <SettingRow title="定时任务开关" description="开启后按下方配置自动执行定时任务。" icon={ShieldCheck}><Toggle label="定时任务开关" checked={draft.enabled} onChange={enabled => update({ enabled })} /></SettingRow>
          <SettingRow title="默认时区" description="执行时间与 Cron 表达式均使用北京时间。" icon={Clock3}><div className="gstc-static-input">亚洲/上海 (UTC+8)</div></SettingRow>
          <SettingRow title="任务执行环境" description="选择服务器脚本或游戏控制台指令。" icon={Terminal}><select aria-label="任务执行环境" value={draft.environment ?? templates[templateIndex]?.environment ?? "server"} onChange={event => update({ environment: event.target.value as "server" | "console" })}><option value="server">服务器内（推荐）</option><option value="console">游戏控制台</option></select></SettingRow>
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
          <SettingRow title="CRON 表达式" description="分钟 · 小时 · 日期 · 月份 · 星期" icon={Code2}><div className="gstc-cron"><input aria-label="Cron 表达式" aria-invalid={!preview} value={draft.cron} required onChange={event => update({ cron: event.target.value })} /><button type="button" className="gstc-button" onClick={() => chooseFrequency(schedule.frequency === "custom" ? "daily" : schedule.frequency)}><RotateCcw size={16} />使用可视化选择</button></div></SettingRow>
          <SettingRow title="下次执行时间预览" icon={Clock3}><output aria-live="polite" className={`gstc-preview${preview ? "" : " invalid"}`}>{!preview ? "请输入有效的执行计划" : draft.enabled ? `${preview}:00` : "任务已暂停，开启后按计划执行"}</output></SettingRow>
        </div>
      </Card>
      <Card title="执行动作" description="选择动作模板，再按需要调整执行命令。" icon={Play}>
        <div className="gstc-templates">{templates.map((template, index) => <label key={template.name} className={templateIndex === index ? "selected" : ""}><input type="radio" name="task-template" value={index} checked={templateIndex === index} onChange={() => chooseTemplate(index)} /><template.icon size={26} /><span><strong>{template.name}</strong><small>{template.description}</small></span></label>)}</div>
        <div className="gstc-command-fields"><label>执行目录<input aria-label="执行目录" required value={draft.directory} onChange={event => update({ directory: event.target.value })} /></label><div className="gstc-name-fields"><label>任务类型<select aria-label="任务类型" value={draft.type} onChange={event => update({ type: event.target.value as ServerTask["type"] })}>{taskTypes.map(type => <option key={type}>{type}</option>)}</select></label><label>超时时间（分钟）<input aria-label="超时时间" type="number" min={1} max={120} required value={draft.timeout} onChange={event => update({ timeout: Number(event.target.value) })} /></label></div><label>执行命令<textarea aria-label="执行命令" value={draft.command} required onChange={event => update({ command: event.target.value })} placeholder="输入需要执行的命令" /></label></div>
      </Card>
      <Card title="运行条件" description="设置执行条件，避免在不合适的情况下运行。" icon={ShieldCheck}>
        <div className="gstc-conditions">{[{ label: "仅在服务器在线时执行", description: "服务器离线时跳过任务。", icon: Server, value: draft.onlyWhenOnline ?? true, onChange: (onlyWhenOnline: boolean) => update({ onlyWhenOnline }) }, { label: "避免玩家在线高峰", description: "仅在没有在线玩家时执行。", icon: Users, value: draft.onlyWhenEmpty ?? false, onChange: (onlyWhenEmpty: boolean) => update({ onlyWhenEmpty }) }, { label: "执行失败发送通知", description: "通过站内信、邮件通知。", icon: Bell, value: draft.notify, onChange: (notify: boolean) => update({ notify }) }].map(condition => <div key={condition.label}><condition.icon size={23} /><span><strong>{condition.label}</strong><small>{condition.description}</small></span><Switch aria-label={condition.label} checked={condition.value} onCheckedChange={condition.onChange} /></div>)}</div>
      </Card>
    </main><aside>
      <Card title="定时任务概览" icon={Timer}><dl className="gstc-summary"><div><Clock3 size={22} /><dt>定时任务状态</dt><dd><span className={`gstc-status${draft.enabled ? "" : " off"}`}>{draft.enabled ? "已开启" : "已暂停"}</span></dd></div><div><Server size={22} /><dt>所属服务器</dt><dd>{serverName}</dd></div><div><Clock3 size={22} /><dt>当前时区</dt><dd>亚洲/上海 (UTC+8)</dd></div><div><Layers size={22} /><dt>执行动作</dt><dd>{templateName}</dd></div><div><CalendarDays size={22} /><dt>下次执行任务</dt><dd>{draft.name || "未命名任务"}<small>{draft.enabled ? preview ?? "等待有效计划" : "已暂停"}</small></dd></div></dl></Card>
      <Card title="通知与告警摘要" icon={Bell}><dl className="gstc-summary"><div><Mail size={21} /><dt>失败通知</dt><dd><span className={`gstc-status${draft.notify ? "" : " off"}`}>{draft.notify ? "已开启" : "已关闭"}</span></dd></div><div><TriangleAlert size={21} /><dt>失败重试</dt><dd>{draft.retries ? `最多 ${draft.retries} 次，间隔 5 分钟` : "不自动重试"}</dd></div><div><CircleCheck size={21} /><dt>超时时间</dt><dd>{draft.timeout} 分钟</dd></div><div><Users size={21} /><dt>通知接收人</dt><dd>服务器管理员</dd></div></dl></Card>
      <Card title="使用说明" icon={CircleHelp}><ol className="gstc-help"><li>选择合适的动作模板，设置执行时间和频率。</li><li>建议在服务器空闲时执行占用资源较大的任务。</li><li>高级执行计划可直接填写 5 段 Cron 表达式。</li><li>保存后可在任务列表中编辑、执行或查看日志。</li></ol>{draft.onlyWhenEmpty && players > 0 && <p className="gstc-condition-note">当前有 {players} 位玩家在线，任务将在无人在线时执行。</p>}</Card>
    </aside></div></div>
    <footer className="gstc-footer">{error && <p className="gstc-error" role="alert">{error}</p>}<div><button type="submit" className="gstc-button primary"><Save size={17} />{draft.id ? "保存任务" : "创建任务"}</button><button type="button" className="gstc-button" onClick={reset}><RotateCcw size={16} />{draft.id ? "还原修改" : "恢复默认"}</button><button type="button" className="gstc-button" onClick={onCancel}>取消</button></div><small>当前为演示环境，任务在本次页面会话中保存。</small></footer>
  </form>;
}

export function TaskSettingsDialog({ draft, onChange, onClose, onSave, error, triggerRef, fallbackRef, serverName, players }: {
  draft: ServerTask | null; onChange: (draft: ServerTask) => void; onClose: () => void; onSave: () => void; error: string;
  triggerRef: RefObject<HTMLElement | null>; fallbackRef: RefObject<HTMLButtonElement | null>; serverName: string; players: number;
}) {
  return <Dialog open={!!draft} onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="gstc-dialog" onCloseAutoFocus={event => { event.preventDefault(); (triggerRef.current?.isConnected ? triggerRef.current : fallbackRef.current)?.focus({ preventScroll: true }); }}>{draft && <TaskSettingsForm key={draft.id || "new-task"} draft={draft} onChange={onChange} onCancel={onClose} onSave={onSave} error={error} serverName={serverName} players={players} />}</DialogContent></Dialog>;
}
