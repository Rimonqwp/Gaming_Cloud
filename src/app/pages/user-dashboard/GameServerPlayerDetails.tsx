import { useEffect, useRef, useState, type ReactNode } from "react";
import { ClipboardList, Copy, Crown, Plus, ShieldX, Signal, UserRoundX, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import type { MinecraftPlayerProfile } from "./minecraftPlayerProfiles";

export type PlayerStatus = "在线" | "离线" | "已封禁";
export type PlayerRole = "管理员" | "成员" | "白名单" | "黑名单";
export type ServerPlayer = { name: string; id: string; status: PlayerStatus; lastLogin: string; hours: number; roles: PlayerRole[]; avatar: string } & MinecraftPlayerProfile;
type DetailTab = "basic" | "stats" | "records";
const tabs = [{ id: "basic", label: "基础信息" }, { id: "stats", label: "统计数据" }, { id: "records", label: "操作记录" }] as const;
const roleClass = { 管理员: "admin", 成员: "member", 白名单: "whitelist", 黑名单: "blacklist" };
const statusClass = { 在线: "online", 离线: "offline", 已封禁: "banned" };
type BaseRole = Exclude<PlayerRole, "白名单">;
const baseRoles: BaseRole[] = ["管理员", "成员", "黑名单"];
const primaryRole = (roles: PlayerRole[]): BaseRole => roles.find((role): role is BaseRole => role !== "白名单") ?? "成员";

export function PlayerRoleBadges({ roles }: { roles: PlayerRole[] }) {
  return <span className="gsd-role-badges">{roles.map(role => <span key={role} className={`gsd-role ${roleClass[role]}`}>{role === "管理员" && <Crown size={12} fill="currentColor" />}{role}</span>)}</span>;
}

export function GameServerPlayerDetails({ player, minecraft, averageHours, records, onClose, onAction, onRoleChange, onNotice }: {
  player: ServerPlayer; minecraft: boolean; averageHours: number;
  records: { id: string; text: string; actor: string; time: string; action: string }[];
  onClose: () => void; onAction: (action: "kick" | "ban" | "unban") => void;
  onRoleChange: (roles: PlayerRole[]) => void; onNotice: (message: string) => void;
}) {
  const [tab, setTab] = useState<DetailTab>("basic");
  const [modal, setModal] = useState<"archive" | null>(null);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const currentRole = primaryRole(player.roles);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const playerName = minecraft ? player.gameId : player.name;
  const identity = minecraft ? player.uuid : player.id;
  const archivePath = minecraft ? `/minecraft/world/playerdata/${player.uuid}.dat` : `players/${player.id}`;
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 1200px)").matches) headingRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, []);
  const copy = async (value: string, label: string) => {
    try { await navigator.clipboard.writeText(value); onNotice(`${label}已复制`); }
    catch { onNotice(`${label}：${value}，请手动复制`); }
  };
  const statusBadge = <span className={`gsd-player-status ${statusClass[player.status]}`}><i />{player.status}</span>;
  const roleBadge = <div className="gsd-detail-roles"><PlayerRoleBadges roles={player.roles} /><DropdownMenu open={roleMenuOpen} onOpenChange={setRoleMenuOpen}>
    <DropdownMenuTrigger asChild><button className="gsd-detail-role-add" aria-label="管理玩家权限组" title="管理权限组"><Plus size={13} /></button></DropdownMenuTrigger>
    <DropdownMenuContent className="gsd-role-menu" align="end" aria-label="玩家权限组菜单" onEscapeKeyDown={event => event.stopPropagation()}>
      <DropdownMenuLabel>身份</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={currentRole} onValueChange={value => {
        if (value === currentRole) return;
        const role = value as BaseRole;
        onRoleChange(role === "黑名单" ? [role] : player.roles.includes("白名单") ? [role, "白名单"] : [role]);
      }}>{baseRoles.map(role => <DropdownMenuRadioItem key={role} value={role} onSelect={event => event.preventDefault()}>{role}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>访问名单</DropdownMenuLabel>
      <DropdownMenuCheckboxItem checked={player.roles.includes("白名单")} disabled={currentRole === "黑名单"} onSelect={event => event.preventDefault()} onCheckedChange={checked => onRoleChange(checked ? [currentRole, "白名单"] : [currentRole])}>白名单</DropdownMenuCheckboxItem>
      <p>{currentRole === "黑名单" ? "黑名单玩家不可加入白名单" : "白名单可与管理员或成员同时设置"}</p>
    </DropdownMenuContent>
  </DropdownMenu></div>;
  const fields: [string, ReactNode][] = [
    ["玩家名称", playerName],
    [minecraft ? "UUID" : "Steam ID", <><span className="gsd-detail-ellipsis" title={identity}>{identity}</span><button className="gsd-detail-copy" aria-label={`复制玩家 ${minecraft ? "UUID" : "Steam ID"}`} onClick={() => void copy(identity, minecraft ? "玩家 UUID" : "Steam ID")}><Copy size={12} /></button></>],
    ["在线状态", statusBadge], ["权限组", roleBadge],
    ...(minecraft ? [
      ["所在世界", player.world],
      ["当前位置", <>{player.position}<button className="gsd-detail-copy" aria-label="复制玩家坐标" onClick={() => void copy(player.position, "玩家坐标")}><Copy size={12} /></button></>],
      ["客户端版本", player.clientVersion],
      ["延迟 (Ping)", player.status === "在线" ? <span className="gsd-detail-ping"><Signal size={14} />{player.ping} ms</span> : "—"],
    ] as [string, ReactNode][] : []),
    ["累计游戏时长", `${player.hours} 小时`], ["首次加入", player.firstJoined],
  ];
  const statsFields: [string, ReactNode][] = [["最后登录", player.lastLogin], ["首次加入", player.firstJoined], ["当前状态", statusBadge], ["管理操作次数", `${records.length} 次`]];
  return <section className="gsd-card gsd-player-details" aria-labelledby="gsd-player-detail-heading" onKeyDown={event => {
    if (event.key === "Escape" && !modal && !roleMenuOpen) { event.stopPropagation(); onClose(); }
  }}>
    <header><h2 id="gsd-player-detail-heading" tabIndex={-1} ref={headingRef}>玩家详情</h2><button className="gsd-detail-close" aria-label="关闭玩家详情" onClick={onClose}><X size={17} /></button></header>
    <div className={`gsd-detail-profile${minecraft ? " minecraft" : ""}`}>
      <img src={minecraft ? player.skinAvatar : `/console/players/${player.avatar}.png`} alt={`${playerName} 的玩家头像`} width={54} height={54} />
      <div><div className="gsd-detail-name"><strong>{playerName}</strong>{statusBadge}</div><div className="gsd-detail-identity"><span title={identity}>{identity}</span><button className="gsd-detail-copy" aria-label={`复制${playerName}的标识`} onClick={() => void copy(identity, minecraft ? "玩家 UUID" : "Steam ID")}><Copy size={12} /></button></div></div>
    </div>
    <nav className="gsd-detail-tabs" role="tablist" aria-label="玩家详情分类">{tabs.map((item, index) => <button key={item.id} ref={element => { tabRefs.current[index] = element; }} id={`gsd-player-tab-${item.id}`} role="tab" aria-selected={tab === item.id} aria-controls="gsd-player-detail-panel" tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)} onKeyDown={event => {
      const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
      if (next >= 0) { event.preventDefault(); setTab(tabs[next].id); tabRefs.current[next]?.focus(); }
    }}>{item.label}</button>)}</nav>
    <div id="gsd-player-detail-panel" className="gsd-detail-panel" role="tabpanel" aria-labelledby={`gsd-player-tab-${tab}`}>
      {tab === "basic" && <dl className="gsd-detail-fields">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
      {tab === "stats" && <><div className="gsd-detail-stats"><article><span>累计游戏时长</span><strong>{player.hours}<small>小时</small></strong></article><article><span>服务器玩家平均时长</span><strong>{averageHours}<small>小时</small></strong></article></div><dl className="gsd-detail-fields">{statsFields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></>}
      {tab === "records" && (records.length ? <ul className="gsd-detail-records">{records.map(record => <li key={record.id}><div><strong>{record.text}</strong><span>{record.action}</span></div><p>管理员 {record.actor} · <time>{record.time}</time></p></li>)}</ul> : <div className="gsd-detail-empty"><ClipboardList size={25} /><span>暂无该玩家的管理操作记录</span></div>)}
    </div>
    <div className="gsd-detail-actions">
      <button className="archive" onClick={() => setModal("archive")}><ClipboardList size={13} />查看档案</button>
      <button className="kick" disabled={player.status !== "在线"} title={player.status !== "在线" ? "玩家当前未在线" : "踢出服务器"} onClick={() => onAction("kick")}><UserRoundX size={13} />踢出</button>
      <button className="ban" onClick={() => onAction(player.status === "已封禁" ? "unban" : "ban")}><ShieldX size={13} />{player.status === "已封禁" ? "解封" : "封禁"}</button>
    </div>
    <Dialog open={modal === "archive"} onOpenChange={open => { if (!open) setModal(null); }}><DialogContent className="cloud-modal gsd-dialog"><DialogTitle>{playerName} 的玩家档案</DialogTitle><DialogDescription>显示当前演示玩家档案；存档路径为示例，未读取真实服务器文件。</DialogDescription><dl className="gsd-detail-fields">{[["玩家名称", playerName], [minecraft ? "UUID" : "Steam ID", identity], ["存档路径", archivePath], ["累计游戏时长", `${player.hours} 小时`], ["首次加入", player.firstJoined], ["最后登录", player.lastLogin]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><button className="gsd-button" onClick={() => void copy(archivePath, "存档路径")}><Copy size={14} />复制存档路径</button></DialogContent></Dialog>
  </section>;
}
