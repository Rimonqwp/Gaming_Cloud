import { LockKeyhole, Monitor, ShieldCheck } from "lucide-react";
import { SettingsPanel } from "./SettingsPanel";

export function UserDashboardSecuritySettingsSection() {
  return <>
    <SettingsPanel title="登录安全" description="管理账户的登录保护方式。" icon={ShieldCheck}>
      <div className="ec-setting-row"><div className="ec-setting-with-icon"><LockKeyhole size={20} aria-hidden /><div><h3>多因素认证（MFA）</h3><p>为您的账户增加一层安全保护。</p></div></div><span className="ec-badge ec-badge-neutral">暂未开放</span></div>
    </SettingsPanel>
    <SettingsPanel title="登录与会话" description="查看和管理账户的活跃会话。" icon={Monitor}>
      <div className="ec-settings-empty"><Monitor size={28} aria-hidden /><h3>会话管理暂未开放</h3><p>开放后可在此查看登录设备，并管理其他设备的会话。</p></div>
    </SettingsPanel>
  </>;
}
