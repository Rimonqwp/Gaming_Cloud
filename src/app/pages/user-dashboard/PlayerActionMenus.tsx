import type { ReactNode } from "react";
import { Ban, ChevronDown, ClipboardList, Eye, ShieldCheck, UserRoundX, Users, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from "../../components/ui/context-menu";
import type { ServerPlayer } from "./GameServerPlayerDetails";

export type PlayerAction = "kick" | "ban" | "unban" | "whitelist-add" | "whitelist-remove";
const actions: { id: PlayerAction; label: string; icon: typeof Ban; danger?: boolean }[] = [
  { id: "whitelist-add", label: "加入白名单", icon: ClipboardList },
  { id: "whitelist-remove", label: "移出白名单", icon: ClipboardList },
  { id: "kick", label: "踢出", icon: UserRoundX, danger: true },
  { id: "ban", label: "封禁", icon: Ban, danger: true },
  { id: "unban", label: "解除封禁", icon: ShieldCheck },
];

export function eligiblePlayers(players: ServerPlayer[], action: PlayerAction) {
  return players.filter(player => {
    switch (action) {
      case "kick": return player.status === "在线";
      case "ban": return player.status !== "已封禁";
      case "unban": return player.status === "已封禁";
      case "whitelist-add": return player.status !== "已封禁" && !player.roles.includes("白名单");
      case "whitelist-remove": return player.roles.includes("白名单");
    }
  });
}

export function BulkPlayerActions({ players, onAction, onClear }: {
  players: ServerPlayer[]; onAction: (action: PlayerAction) => void; onClear: () => void;
}) {
  return <><DropdownMenu>
    <DropdownMenuTrigger asChild><button className="gsd-bulk-trigger" aria-label="批量操作" disabled={!players.length}><Users size={14} />批量操作<ChevronDown size={13} /></button></DropdownMenuTrigger>
    <DropdownMenuContent className="gsd-player-action-menu" align="end">
      <DropdownMenuLabel>已选择 {players.length} 名玩家</DropdownMenuLabel>
      {actions.map(action => {
        const count = eligiblePlayers(players, action.id).length;
        return <DropdownMenuItem key={action.id} disabled={!count} className={action.danger ? "danger" : undefined} onSelect={() => onAction(action.id)}><action.icon size={14} />批量{action.label}<span className="gsd-menu-action-count">{count} 人</span></DropdownMenuItem>;
      })}
    </DropdownMenuContent>
  </DropdownMenu>{!!players.length && <button className="gsd-clear-selection" aria-label="取消全部玩家选择" title="取消选择" onClick={onClear}><X size={14} /></button>}</>;
}

export function PlayerRowContextMenu({ children, player, playerName, selectedPlayers, onBulkAction, onAction, onView }: {
  children: ReactNode; player: ServerPlayer; playerName: string; selectedPlayers: ServerPlayer[];
  onBulkAction: (action: PlayerAction) => void; onAction: (action: PlayerAction) => void; onView: () => void;
}) {
  return <ContextMenu modal={false}><ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
    <ContextMenuContent className="gsd-player-action-menu" aria-label={`${playerName} 的玩家操作`}>
      {!!selectedPlayers.length && <><ContextMenuLabel>批量操作 · 已选 {selectedPlayers.length} 人</ContextMenuLabel>
        {actions.map(action => {
          const count = eligiblePlayers(selectedPlayers, action.id).length;
          return <ContextMenuItem key={action.id} disabled={!count} className={action.danger ? "danger" : undefined} onSelect={() => onBulkAction(action.id)}><action.icon size={14} />批量{action.label}<span className="gsd-menu-action-count">{count} 人</span></ContextMenuItem>;
        })}<ContextMenuSeparator /></>}
      <ContextMenuLabel>{playerName} · 单个操作</ContextMenuLabel>
      <ContextMenuItem onSelect={onView}><Eye size={14} />查看详情</ContextMenuItem>
      {actions.filter(action => action.id !== (player.roles.includes("白名单") ? "whitelist-add" : "whitelist-remove") && action.id !== (player.status === "已封禁" ? "ban" : "unban")).map(action =>
        <ContextMenuItem key={action.id} disabled={!eligiblePlayers([player], action.id).length} className={action.danger ? "danger" : undefined} onSelect={() => onAction(action.id)}><action.icon size={14} />{action.label}</ContextMenuItem>
      )}
    </ContextMenuContent>
  </ContextMenu>;
}
