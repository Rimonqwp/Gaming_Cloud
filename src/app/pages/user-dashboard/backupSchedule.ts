export type BackupSchedule = {
  frequency: "hourly" | "daily" | "weekly" | "monthly";
  executionTime: string;
  weekday?: number;
  monthDay?: number;
};

export const backupWeekdays = [
  { value: 1, label: "星期一" }, { value: 2, label: "星期二" },
  { value: 3, label: "星期三" }, { value: 4, label: "星期四" },
  { value: 5, label: "星期五" }, { value: 6, label: "星期六" },
  { value: 0, label: "星期日" },
];

export function validateBackupSchedule(value: BackupSchedule): string {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value.executionTime)) return "请设置有效的执行时间。";
  const weekday = value.weekday ?? 1;
  const monthDay = value.monthDay ?? 1;
  if (value.frequency === "weekly" && (!Number.isInteger(weekday) || weekday < 0 || weekday > 6)) return "请选择星期一至星期日的备份日期。";
  if (value.frequency === "monthly" && (!Number.isInteger(monthDay) || monthDay < 1 || monthDay > 31)) return "请选择 1 至 31 号的备份日期。";
  return "";
}

export function backupScheduleSummary(value: BackupSchedule): string {
  if (validateBackupSchedule(value)) return "待设置有效备份计划";
  if (value.frequency === "hourly") return `每小时第 ${Number(value.executionTime.slice(3))} 分钟`;
  if (value.frequency === "weekly") return `每周${backupWeekdays.find(day => day.value === (value.weekday ?? 1))!.label.slice(2)} ${value.executionTime}`;
  if (value.frequency === "monthly") return `每月 ${value.monthDay ?? 1} 号 ${value.executionTime}`;
  return `每天 ${value.executionTime}`;
}

export function backupScheduleCron(value: BackupSchedule): string | null {
  if (validateBackupSchedule(value)) return null;
  const [hour, minute] = value.executionTime.split(":").map(Number);
  if (value.frequency === "hourly") return `${minute} * * * *`;
  if (value.frequency === "weekly") return `${minute} ${hour} * * ${value.weekday ?? 1}`;
  if (value.frequency === "monthly") return `${minute} ${hour} ${value.monthDay ?? 1} * *`;
  return `${minute} ${hour} * * *`;
}
