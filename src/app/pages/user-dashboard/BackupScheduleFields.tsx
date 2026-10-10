import type { ReactNode } from "react";
import { CalendarDays, Clock3, Database, FileText, Folder, FolderArchive, Layers, Settings, ShieldCheck, ShieldPlus, type LucideIcon } from "lucide-react";
import { Switch } from "../../components/ui/switch";
import type { BackupStorageConfig } from "./BackupStorageSettings";
import { BackupPathPicker } from "./BackupPathPicker";
import { backupScheduleSummary, backupWeekdays } from "./backupSchedule";

type Props = {
  value: BackupStorageConfig;
  onChange: <K extends keyof BackupStorageConfig>(key: K, value: BackupStorageConfig[K]) => void;
};
const frequencies = [{ value: "hourly", label: "每小时" }, { value: "daily", label: "每天" }, { value: "weekly", label: "每周" }, { value: "monthly", label: "每月" }] as const;

function SettingRow({ icon: Icon, title, description, children, className = "" }: { icon: LucideIcon; title: string; description: string; children: ReactNode; className?: string }) {
  return <div className={`gsbs-setting-row ${className}`}><Icon className="gsbs-setting-icon" size={23} /><div className="gsbs-setting-label"><strong>{title}</strong><p>{description}</p></div><div className="gsbs-setting-control">{children}</div></div>;
}

export function BackupScheduleFields({ value, onChange }: Props) {
  const toggle = (key: "enabled" | "verify", label: string) => <label className="gsbs-setting-toggle"><Switch className="gsbs-switch" aria-label={label} checked={value[key]} onCheckedChange={checked => onChange(key, checked)} /><span>{value[key] ? "已开启" : "已关闭"}</span></label>;
  const example = value.filenameTemplate.replace("{server_name}", "Minecraft生存服").replace("{date}", "20241026").replace("{time}", `${value.executionTime.replace(":", "")}00`);
  const hasDate = value.frequency === "weekly" || value.frequency === "monthly";
  return <>
    <section className="gsbs-card gsbs-schedule-card"><h2><Settings size={20} />基础设置</h2><p className="gsbs-section-description">设置自动备份策略，系统将按设定的规则定期备份服务器文件，保障数据安全。</p>
      <div className="gsbs-setting-rows">
        <SettingRow icon={ShieldPlus} title="自动备份开关" description="开启后将按照下方配置自动执行备份任务。">{toggle("enabled", "自动备份开关")}</SettingRow>
        <SettingRow icon={CalendarDays} title="备份频率" description="设置自动备份的执行频率。"><div className="gsbs-frequency" role="radiogroup" aria-label="备份频率">{frequencies.map(item => <label key={item.value} className={value.frequency === item.value ? "selected" : ""}><input type="radio" name="backupFrequency" value={item.value} checked={value.frequency === item.value} disabled={!value.enabled} onChange={() => onChange("frequency", item.value)} /><span>{item.label}</span></label>)}</div></SettingRow>
        <SettingRow icon={Clock3} title="执行时间" description={`${backupScheduleSummary(value)} 执行备份任务。`}>
          <div className={`gsbs-execution-time${hasDate ? " gsbs-execution-date" : ""}`}>
            {value.frequency === "weekly" && <select aria-label="每周备份日期" disabled={!value.enabled} value={value.weekday ?? 1} onChange={event => onChange("weekday", Number(event.target.value))}>{backupWeekdays.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}</select>}
            {value.frequency === "monthly" && <select aria-label="每月备份日期" disabled={!value.enabled} value={value.monthDay ?? 1} onChange={event => onChange("monthDay", Number(event.target.value))}>{Array.from({ length: 31 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} 号</option>)}</select>}
            {value.frequency === "hourly" ? <select aria-label="执行分钟" disabled={!value.enabled} value={Number(value.executionTime.slice(3))} onChange={event => onChange("executionTime", `${value.executionTime.slice(0, 2) || "04"}:${String(event.target.value).padStart(2, "0")}`)}>{Array.from({ length: 60 }, (_, minute) => <option key={minute} value={minute}>{String(minute).padStart(2, "0")} 分</option>)}</select> : <input type="time" name="backupTime" aria-label="执行时间" required={value.enabled} disabled={!value.enabled} value={value.executionTime} onInput={event => onChange("executionTime", event.currentTarget.value)} onChange={event => onChange("executionTime", event.target.value)} />}
            <select aria-label="备份时区" disabled value={value.timezone}><option value="Asia/Shanghai">亚洲/上海 (UTC+8)</option><option value="UTC">协调世界时 (UTC+0)</option><option value="Asia/Tokyo">亚洲/东京 (UTC+9)</option></select>
          </div>
          {value.frequency === "monthly" && (value.monthDay ?? 1) > 28 && <small>没有该日期的月份将跳过备份。</small>}
        </SettingRow>
      </div>
    </section>
    <section className="gsbs-card gsbs-schedule-card"><h2><Database size={20} />备份内容与范围</h2><p className="gsbs-section-description">选择需要备份的文件路径，设置备份类型与文件命名规则。</p>
      <div className="gsbs-setting-rows">
        <SettingRow icon={Folder} title="备份路径" description="选择要备份的目录，或填写自定义地址。" className="gsbs-setting-tall"><BackupPathPicker value={value.sourcePath} mode={value.sourcePathMode} onChange={(path, mode) => { onChange("sourcePath", path); onChange("sourcePathMode", mode); }} /></SettingRow>
        <SettingRow icon={Layers} title="备份模式" description="选择备份的类型。" className="gsbs-setting-mode"><div className="gsbs-backup-modes" role="radiogroup" aria-label="备份模式">{[{ id: "full", title: "完整备份", text: "备份全部文件，数据最完整" }, { id: "incremental", title: "增量备份", text: "仅备份有变动的文件，更节省空间" }].map(mode => <label key={mode.id} className={value.backupMode === mode.id ? "selected" : ""}><input type="radio" name="backupMode" value={mode.id} checked={value.backupMode === mode.id} onChange={() => onChange("backupMode", mode.id as "full" | "incremental")} /><div><strong>{mode.title}</strong><p>{mode.text}</p></div></label>)}</div></SettingRow>
        <SettingRow icon={FileText} title="文件命名规则" description="设置备份文件的命名格式。" className="gsbs-setting-tall"><select aria-label="文件命名规则" value={value.filenameTemplate} onChange={event => onChange("filenameTemplate", event.target.value)}><option value="{server_name}_{date}_{time}">{"{server_name}_{date}_{time}"}</option><option value="{server_name}_{date}">{"{server_name}_{date}"}</option><option value="backup_{date}_{time}">{"backup_{date}_{time}"}</option></select><small>示例：{example}.zip</small></SettingRow>
        <SettingRow icon={FolderArchive} title="压缩备份文件" description="强制使用 ZIP 格式压缩备份文件，节省存储空间。"><label className="gsbs-setting-toggle" title="压缩备份文件强制开启"><Switch className="gsbs-switch" aria-label="压缩备份文件" checked disabled /><span>已开启</span></label></SettingRow>
        <SettingRow icon={ShieldCheck} title="备份完成后校验" description="备份完成后自动验证文件完整性（SHA256）。">{toggle("verify", "备份完成后校验")}</SettingRow>
      </div>
    </section>
  </>;
}
