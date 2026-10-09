export type BackupType = "自动备份" | "手动备份" | "系统备份";
export type BackupRecord = {
  id: string; name: string; description: string; type: BackupType;
  sizeGB: number; storedGB: number; created: string; completed: string;
  retention: number | null; path: string; files: number; checksum: string; upload?: File;
};
export const backupTime = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(new Date());
export const backupSize = (value: number) => value >= 1 ? `${value.toFixed(1)} GB` : value >= 1 / 1024 ? `${(value * 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(value * 1024 ** 2))} KB`;
export const backupTone = (type: BackupType) => type === "自动备份" ? "blue" : type === "手动备份" ? "green" : "system";
export function initialBackups(game: string, count = 12): BackupRecord[] {
  const path = game === "Minecraft" ? "/minecraft" : "/home/server";
  const seeds: [string, string, BackupType, number, string][] = [
    ["自动备份 2024-10-26 14:28", "每日自动备份", "自动备份", 2.3, "2024-10-26 14:28:12"],
    ["手动备份 - 新地图探索前", "准备探索新地图前的手动备份", "手动备份", 2.1, "2024-10-25 20:13:00"],
    ["自动备份 2024-10-25 04:00", "每日自动备份", "自动备份", 2.2, "2024-10-25 04:00:00"],
    ["版本更新前备份 (1.20.4)", "更新服务器版本前备份", "手动备份", 2.0, "2024-10-24 14:18:00"],
    ["自动备份 2024-10-24 04:00", "每日自动备份", "自动备份", 2.1, "2024-10-24 04:00:00"],
    ["建筑大赛活动备份", "准备建筑地图的手动备份", "手动备份", 1.9, "2024-10-21 18:30:00"],
    ["自动备份 2024-10-21 04:00", "每日自动备份", "自动备份", 2.0, "2024-10-21 04:00:00"],
    ["初始备份 (创建实例)", "实例创建后的初始备份", "系统备份", 1.8, "2024-10-20 16:33:00"],
    ["自动备份 2024-10-20 04:00", "每日自动备份", "自动备份", 1.7, "2024-10-20 04:00:00"],
    ["自动备份 2024-10-19 04:00", "每日自动备份", "自动备份", 1.6, "2024-10-19 04:00:00"],
    ["开服准备备份", "服务器配置与插件备份", "手动备份", 1.5, "2024-10-18 20:00:00"],
    ["自动备份 2024-10-18 04:00", "每日自动备份", "自动备份", 1.5, "2024-10-18 04:00:00"],
  ];
  // Keep demo records consistent with the instance count when reopening its details.
  const records = Array.from({ length: count }, (_, index) => seeds[index] ?? [`存档备份 ${index + 1}`, "服务器世界存档备份", "手动备份", 2.3, seeds[0][4]] as typeof seeds[number]);
  return records.map(([name, description, type, sizeGB, created], index) => ({
    id: index === 0 ? "bak-20241026-142812-7f3a9c" : `bak-${created.replace(/[- :]/g, "")}-${index}`,
    name, description, type, sizeGB, storedGB: 0.7, created,
    completed: index === 0 ? "2024-10-26 14:31:05" : created,
    retention: type === "自动备份" ? 30 : null, path, files: index === 0 ? 12483 : 11000 + index * 79,
    checksum: `a3f5d2e8c9b4f1a6${index.toString(16).padStart(2, "0")}7c09f6d2875a8c${"0".repeat(32)}`,
  }));
}
