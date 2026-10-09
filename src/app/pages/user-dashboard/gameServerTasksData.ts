export type TaskType = "备份" | "系统" | "维护" | "其他";
export type TaskResult = "成功" | "失败" | "执行中";
export type ServerTask = {
  id: string;
  name: string;
  description: string;
  command: string;
  cron: string;
  type: TaskType;
  enabled: boolean;
  directory: string;
  retries: number;
  timeout: number;
  notify: boolean;
  environment?: "server" | "console";
  onlyWhenOnline?: boolean;
  onlyWhenEmpty?: boolean;
  created: string;
  lastRun: string;
  nextRun: string;
  duration: string;
  result: TaskResult;
};
export type TaskExecution = { id: string; taskId: string; name: string; time: string; result: TaskResult; duration: string; output: string };

export const taskTypes: TaskType[] = ["备份", "系统", "维护", "其他"];
export const taskTones: Record<TaskType, string> = { 备份: "blue", 系统: "purple", 维护: "orange", 其他: "blue" };
const defaults = { directory: "/home/server/", retries: 3, timeout: 30, notify: true, created: "2024-10-12 14:28" };

// Reference fixtures for the interactive console demo; commands are never sent to a server.
export const initialServerTasks: ServerTask[] = [
  { ...defaults, id: "task-001", name: "自动备份世界", description: "定期备份存档文件", cron: "0 3 * * *", command: "bash /scripts/backup.sh", type: "备份", enabled: true, lastRun: "2024-10-26 03:00", nextRun: "2024-10-27 03:00", duration: "2 分 18 秒", result: "成功" },
  { ...defaults, id: "task-002", name: "每日重启服务器", description: "保持服务器稳定运行", cron: "0 5 * * *", command: "restart", type: "系统", enabled: true, lastRun: "2024-10-26 05:00", nextRun: "2024-10-27 05:00", duration: "32 秒", result: "成功" },
  { ...defaults, id: "task-003", name: "清理日志文件", description: "删除 30 天前的日志", cron: "0 4 * * 0", command: "find logs -type f -mtime +30 -delete", type: "维护", enabled: true, lastRun: "2024-10-20 04:00", nextRun: "2024-10-27 04:00", duration: "18 秒", result: "成功" },
  { ...defaults, id: "task-004", name: "保存世界存档", description: "执行 save-all 命令", cron: "*/30 * * * *", command: "save-all", type: "系统", enabled: true, lastRun: "2024-10-26 16:00", nextRun: "2024-10-26 16:30", duration: "6 秒", result: "成功" },
  { ...defaults, id: "task-005", name: "广播活动提醒", description: "每晚发送活动提示", cron: "0 20 * * *", command: "say §6今晚8点有建筑比赛，欢迎参加！", type: "其他", enabled: false, lastRun: "2024-10-25 20:00", nextRun: "2024-10-26 20:00", duration: "3 秒", result: "失败" },
  { ...defaults, id: "task-006", name: "插件热更新检查", description: "检查插件更新并通知", cron: "0 12 * * 1", command: "bash /scripts/check_plugins.sh", type: "维护", enabled: true, lastRun: "2024-10-21 12:00", nextRun: "2024-10-28 12:00", duration: "12 秒", result: "成功" },
];

export const initialTaskExecutions: TaskExecution[] = [
  { id: "run-001", taskId: "task-001", name: "自动备份世界", time: "2024-10-26 03:00:12", result: "成功", duration: "2 分 18 秒", output: "已备份世界文件，文件大小：482 MB，保存在 /backups/2024-10-26_0300.zip" },
  { id: "run-002", taskId: "task-002", name: "每日重启服务器", time: "2024-10-26 05:00:03", result: "成功", duration: "32 秒", output: "服务器已正常重启，在线玩家 12 人" },
  { id: "run-003", taskId: "task-003", name: "清理日志文件", time: "2024-10-26 04:00:01", result: "成功", duration: "18 秒", output: "已删除 12 个旧日志文件，释放空间 56 MB" },
  { id: "run-004", taskId: "task-004", name: "保存世界存档", time: "2024-10-26 16:00:05", result: "成功", duration: "6 秒", output: "执行 save-all 完成，世界已保存" },
  { id: "run-005", taskId: "task-005", name: "广播活动提醒", time: "2024-10-25 20:00:02", result: "失败", duration: "3 秒", output: "命令执行失败：服务器未响应" },
];

export const taskTime = (date: Date, seconds = false) => new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", ...(seconds ? { second: "2-digit" } : {}),
}).format(date);

function cronValues(field: string, min: number, max: number): number[] | null {
  const values = new Set<number>();
  for (const part of field.split(",")) {
    const match = /^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/.exec(part);
    if (!match) return null;
    const step = match[2] ? Number(match[2]) : 1;
    if (step < 1 || step > max - min + 1) return null;
    const range = match[1] === "*" ? [min, max] : match[1].split("-").map(Number);
    const start = range[0];
    const end = range[1] ?? (match[2] ? max : start);
    if (start < min || end > max || start > end) return null;
    for (let value = start; value <= end; value += step) values.add(value);
  }
  return [...values].sort((a, b) => a - b);
}

export function parseTaskCron(cron: string) {
  const fields = cron.trim().split(/\s+/);
  if (fields.length !== 5) return null;
  const ranges = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];
  const values = fields.map((field, index) => cronValues(field, ranges[index][0], ranges[index][1]));
  return values.every(Boolean) ? { fields, values: values as number[][] } : null;
}

export function nextTaskRun(cron: string, now: Date = new Date()): string | null {
  const parsed = parseTaskCron(cron);
  if (!parsed) return null;
  const [minutes, hours, days, months, weekdays] = parsed.values;
  const chinaNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  // Iterate calendar days, then allowed hours/minutes; all scheduling previews use Beijing time.
  for (let offset = 0; offset < 366 * 8; offset++) {
    const day = new Date(Date.UTC(chinaNow.getUTCFullYear(), chinaNow.getUTCMonth(), chinaNow.getUTCDate() + offset));
    if (!months.includes(day.getUTCMonth() + 1)) continue;
    const dayMatches = days.includes(day.getUTCDate());
    const weekdayMatches = weekdays.some(value => value % 7 === day.getUTCDay());
    const dateMatches = parsed.fields[2] === "*" ? weekdayMatches : parsed.fields[4] === "*" ? dayMatches : dayMatches || weekdayMatches;
    if (!dateMatches) continue;
    for (const hour of hours) for (const minute of minutes) {
      const candidate = new Date(day.getTime() + (hour - 8) * 60 * 60 * 1000 + minute * 60 * 1000);
      if (candidate > now) return taskTime(candidate);
    }
  }
  return null;
}
