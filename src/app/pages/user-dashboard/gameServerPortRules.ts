export type PortProtocol = "TCP" | "UDP";
export type PortRisk = "低风险" | "中风险" | "高风险";
export type PortRule = {
  id: string; protocol: PortProtocol; range: string; source: string;
  title: string; description: string; enabled: boolean; risk: PortRisk;
};
export type PortRuleDraft = Omit<PortRule, "id">;

export function createPortRules(gamePort: number, game: string): PortRule[] {
  const minecraft = game === "Minecraft";
  const rows: PortRuleDraft[] = [
    { protocol: "TCP", range: "22", source: "0.0.0.0/0", title: "SSH 远程连接", description: "服务器管理用", enabled: true, risk: "中风险" },
    { protocol: minecraft ? "TCP" : "UDP", range: String(gamePort), source: "0.0.0.0/0", title: `${game.split(" / ")[0]} 游戏主端口`, description: "玩家连接游戏服务器", enabled: true, risk: "低风险" },
    { protocol: "TCP", range: "25575", source: "0.0.0.0/0", title: "RCON 远程控制", description: "用于服务器管理工具", enabled: true, risk: "中风险" },
    { protocol: "TCP", range: "8080", source: "0.0.0.0/0", title: "Web 控制面板", description: "服务器管理面板访问", enabled: true, risk: "低风险" },
    { protocol: "UDP", range: "19132", source: "0.0.0.0/0", title: "Minecraft 基岩版端口", description: "支持基岩版玩家连接", enabled: false, risk: "低风险" },
    { protocol: "TCP", range: "443", source: "0.0.0.0/0", title: "HTTPS 安全访问", description: "用于面板 SSL 访问", enabled: true, risk: "低风险" },
  ];
  return rows.map((row, index) => ({ ...row, id: `port-${index + 1}` }));
}

export function validatePortRule(rule: PortRuleDraft): string | null {
  const match = rule.range.trim().match(/^(\d{1,5})(?:\s*-\s*(\d{1,5}))?$/);
  if (!match || +match[1] < 1 || +match[1] > 65535 || (match[2] && (+match[2] < +match[1] || +match[2] > 65535))) return "端口必须为 1–65535 的整数或递增范围，例如 25565 或 25565-25570。";
  const cidr = rule.source.trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/);
  if (!cidr || cidr[1].split(".").some(part => +part > 255) || +cidr[2] > 32) return "请输入有效的 IPv4 / CIDR，例如 0.0.0.0/0 或 192.168.1.0/24。";
  if (!rule.title.trim()) return "请填写端口说明。";
  return null;
}

export function parsePortRuleImport(text: string): PortRuleDraft[] {
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim());
  if (!text.trim()) throw new Error("请先填写要导入的规则。");
  return lines.map((line, index) => {
    const [protocol, range, source, title, description = ""] = line.split(/[,，\t]/).map(part => part.trim());
    if (protocol !== "TCP" && protocol !== "UDP") throw new Error(`第 ${index + 1} 行：协议必须为 TCP 或 UDP。`);
    const rule: PortRuleDraft = { protocol, range: range ?? "", source: source ?? "", title: title ?? "", description, enabled: true, risk: "低风险" };
    const error = validatePortRule(rule);
    if (error) throw new Error(`第 ${index + 1} 行：${error}`);
    return rule;
  });
}

export function isExposedManagementPort(rule: PortRule): boolean {
  const [start, end = start] = rule.range.split("-").map(Number);
  return rule.enabled && rule.source === "0.0.0.0/0" && (rule.risk === "高风险" || (start <= 25575 && end >= 25575));
}
