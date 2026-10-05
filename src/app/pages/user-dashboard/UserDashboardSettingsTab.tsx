import { motion } from "motion/react";
import { Bell, CreditCard, KeyRound, Link2, LockKeyhole, Monitor, ShieldCheck } from "lucide-react";
import "../../../styles/cloud-settings.css";
import type { DashboardNavPlacement } from "../../context/DashboardNavContext";
import type { SupportedCurrency } from "../../lib/currency";
import type { DashboardUser, SettingsMenuId } from "./userDashboardTypes";
import { UserDashboardAccountSettingsSection } from "./settings/UserDashboardAccountSettingsSection";
import { UserDashboardLinkedSettingsSection } from "./settings/UserDashboardLinkedSettingsSection";
import { UserDashboardPaymentSettingsSection } from "./settings/UserDashboardPaymentSettingsSection";
import { UserDashboardPreferencesSettingsSection } from "./settings/UserDashboardPreferencesSettingsSection";
import { UserDashboardSecuritySettingsSection } from "./settings/UserDashboardSecuritySettingsSection";
import { SettingsPanel } from "./settings/SettingsPanel";

type UserDashboardSettingsTabProps = {
  settingsMenu: SettingsMenuId;
  setSettingsMenu: (menu: SettingsMenuId) => void;
  dashboardUser: DashboardUser;
  dashboardNavPlacement: DashboardNavPlacement;
  setDashboardNavPlacement: (placement: DashboardNavPlacement) => void;
  mainNavbarHidden: boolean;
  setMainNavbarHidden: (hidden: boolean) => void;
  preferredCurrency: SupportedCurrency;
  setPreferredCurrency: (currency: SupportedCurrency) => void;
  previewBaseCurrency: SupportedCurrency;
  setPreviewBaseCurrency: (currency: SupportedCurrency) => void;
};

const settingsMenuItems = [
  { id: "account" as const, label: "账户与安全", icon: ShieldCheck },
  { id: "preferences" as const, label: "通知与偏好", icon: Bell },
  { id: "api" as const, label: "API 与密钥", icon: KeyRound },
  { id: "security" as const, label: "登录与会话", icon: Monitor },
  { id: "linked" as const, label: "账号关联", icon: Link2 },
  { id: "payment" as const, label: "付款资讯", icon: CreditCard },
  { id: "privacy" as const, label: "数据与隐私", icon: LockKeyhole },
] as const;

export function UserDashboardSettingsTab({
  settingsMenu,
  setSettingsMenu,
  dashboardUser,
  dashboardNavPlacement,
  setDashboardNavPlacement,
  mainNavbarHidden,
  setMainNavbarHidden,
  preferredCurrency,
  setPreferredCurrency,
  previewBaseCurrency,
  setPreviewBaseCurrency,
}: UserDashboardSettingsTabProps) {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="ec-settings"
    >
      <header className="ec-settings-heading">
        <h1>个人设定</h1>
        <p>管理您的账户信息、安全设置和使用偏好。</p>
      </header>
      <div className="ec-settings-layout">
        <div className="ec-settings-nav" role="tablist" aria-label="设置分类" aria-orientation="vertical">
          {settingsMenuItems.map((item, index) => {
            const Icon = item.icon;
            const active = settingsMenu === item.id;

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`settings-tab-${item.id}`}
                aria-selected={active}
                aria-controls={`settings-panel-${item.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setSettingsMenu(item.id)}
                onKeyDown={(event) => {
                  const direction = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : ["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 0;
                  if (!direction && event.key !== "Home" && event.key !== "End") return;
                  event.preventDefault();
                  const next = event.key === "Home" ? 0 : event.key === "End" ? settingsMenuItems.length - 1 : (index + direction + settingsMenuItems.length) % settingsMenuItems.length;
                  setSettingsMenu(settingsMenuItems[next].id);
                  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
                }}
                className={`${active ? "is-active" : ""} ${item.id === "linked" ? "ec-nav-divider" : ""}`}
              >
                <Icon size={20} strokeWidth={1.8} aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="ec-settings-content">
          <div role="tabpanel" id="settings-panel-account" aria-labelledby="settings-tab-account" hidden={settingsMenu !== "account"} tabIndex={0}>
            <UserDashboardAccountSettingsSection key={dashboardUser.id} dashboardUser={dashboardUser} />
          </div>
          <div role="tabpanel" id="settings-panel-linked" aria-labelledby="settings-tab-linked" hidden={settingsMenu !== "linked"} tabIndex={0}><UserDashboardLinkedSettingsSection /></div>
          <div role="tabpanel" id="settings-panel-payment" aria-labelledby="settings-tab-payment" hidden={settingsMenu !== "payment"} tabIndex={0}><UserDashboardPaymentSettingsSection /></div>
          <div role="tabpanel" id="settings-panel-security" aria-labelledby="settings-tab-security" hidden={settingsMenu !== "security"} tabIndex={0}><UserDashboardSecuritySettingsSection /></div>
          <div role="tabpanel" id="settings-panel-preferences" aria-labelledby="settings-tab-preferences" hidden={settingsMenu !== "preferences"} tabIndex={0}>
            <UserDashboardPreferencesSettingsSection
              key={dashboardUser.id}
              userId={dashboardUser.id}
              dashboardNavPlacement={dashboardNavPlacement}
              setDashboardNavPlacement={setDashboardNavPlacement}
              mainNavbarHidden={mainNavbarHidden}
              setMainNavbarHidden={setMainNavbarHidden}
              preferredCurrency={preferredCurrency}
              setPreferredCurrency={setPreferredCurrency}
              previewBaseCurrency={previewBaseCurrency}
              setPreviewBaseCurrency={setPreviewBaseCurrency}
            />
          </div>
          <div role="tabpanel" id="settings-panel-api" aria-labelledby="settings-tab-api" hidden={settingsMenu !== "api"} tabIndex={0}>
            <SettingsPanel title="SSH 公钥" description="管理用于访问服务器的公钥。" icon={KeyRound}><div className="ec-settings-empty"><KeyRound size={28} aria-hidden /><h3>尚未配置 SSH 公钥</h3><p>公钥管理功能暂未开放。</p></div></SettingsPanel>
            <SettingsPanel title="API Token" description="使用 API 管理您的服务器资源。" icon={KeyRound}><div className="ec-settings-empty"><KeyRound size={28} aria-hidden /><h3>尚未配置 API Token</h3><p>API 访问功能暂未开放。</p></div></SettingsPanel>
          </div>
          <div role="tabpanel" id="settings-panel-privacy" aria-labelledby="settings-tab-privacy" hidden={settingsMenu !== "privacy"} tabIndex={0}>
            <SettingsPanel title="数据与隐私" description="了解您的账户资料与数据管理选项。" icon={LockKeyhole}>
              <div className="ec-setting-row"><div><h3>个人资料</h3><p>在「账户与安全」中查看您的账户信息。</p></div><button type="button" className="ec-button" onClick={() => setSettingsMenu("account")}>查看资料</button></div>
              <div className="ec-setting-row"><div><h3>数据导出与账户注销</h3><p>如需导出账户数据或申请注销，请提交工单联系我们。</p></div><a className="ec-button" href="/dashboard?tab=tickets">提交工单</a></div>
            </SettingsPanel>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
