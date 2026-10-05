import { Link2 } from "lucide-react";
import { DiscordIcon } from "../userDashboardShared";
import { SettingsPanel } from "./SettingsPanel";

export function UserDashboardLinkedSettingsSection() {
  return <SettingsPanel title="账号关联" description="关联第三方账号，便捷接收游戏服务器通知。" icon={Link2}>
    <div className="ec-setting-row"><div className="ec-setting-with-icon"><span className="ec-provider-icon"><DiscordIcon width={24} height={24} aria-hidden /></span><div><h3>Discord</h3><p>绑定后可接收服务器状态通知与控制台警报。</p></div></div><span className="ec-badge ec-badge-neutral">暂未开放</span></div>
  </SettingsPanel>;
}
