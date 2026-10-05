import { useState } from "react";
import { Bell, Mail, MessageSquare, PanelTop, SlidersHorizontal, Sun } from "lucide-react";
import { Switch } from "../../../components/ui/switch";
import type { DashboardNavPlacement } from "../../../context/DashboardNavContext";
import { SUPPORTED_CURRENCY_OPTIONS, type SupportedCurrency } from "../../../lib/currency";
import { navPlacementOptions } from "../userDashboardData";
import { SettingsPanel } from "./SettingsPanel";

type Props = {
  userId: string;
  dashboardNavPlacement: DashboardNavPlacement;
  setDashboardNavPlacement: (placement: DashboardNavPlacement) => void;
  mainNavbarHidden: boolean;
  setMainNavbarHidden: (hidden: boolean) => void;
  preferredCurrency: SupportedCurrency;
  setPreferredCurrency: (currency: SupportedCurrency) => void;
  previewBaseCurrency: SupportedCurrency;
  setPreviewBaseCurrency: (currency: SupportedCurrency) => void;
};

export function UserDashboardPreferencesSettingsSection({ userId, dashboardNavPlacement, setDashboardNavPlacement, mainNavbarHidden, setMainNavbarHidden, preferredCurrency, setPreferredCurrency, previewBaseCurrency, setPreviewBaseCurrency }: Props) {
  const storageKey = `eggcloud.notification-preview.${userId}`;
  const [notifications, setNotifications] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(storageKey) || "null"); return { email: saved?.email === true, site: saved?.site === true }; } catch { return { email: false, site: false }; }
  });
  const [feedback, setFeedback] = useState("");
  function toggleNotification(channel: "email" | "site", checked: boolean) {
    const next = { ...notifications, [channel]: checked };
    setNotifications(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setFeedback("已保存此设备上的通知偏好预览。"); } catch { setFeedback("通知偏好仅在当前页面有效。"); }
  }
  return <>
    <SettingsPanel title="通知设置" description="选择适合您的通知方式。" icon={Bell}>
      <div className="ec-setting-row"><div className="ec-setting-with-icon"><Mail size={20} aria-hidden /><div><h3>邮件通知</h3><p>接收服务器状态、账单和安全提醒。</p></div></div><Switch checked={notifications.email} onCheckedChange={(checked) => toggleNotification("email", checked)} aria-label="邮件通知" /></div>
      <div className="ec-setting-row"><div className="ec-setting-with-icon"><MessageSquare size={20} aria-hidden /><div><h3>站内通知</h3><p>在控制台内查看重要的系统消息。</p></div></div><Switch checked={notifications.site} onCheckedChange={(checked) => toggleNotification("site", checked)} aria-label="站内通知" /></div>
      <p className="ec-muted ec-notification-note">通知偏好可在此预览，通知发送服务暂未开放。</p>
      {feedback && <p className="ec-feedback" role="status">{feedback}</p>}
    </SettingsPanel>
    <SettingsPanel title="偏好设置" description="自定义您的控制台使用体验。" icon={SlidersHorizontal}>
      <div className="ec-preference-grid">
        <label htmlFor="settings-currency">显示货币<select id="settings-currency" value={preferredCurrency} onChange={(event) => setPreferredCurrency(event.target.value as SupportedCurrency)}>{SUPPORTED_CURRENCY_OPTIONS.map((option) => <option key={option.code} value={option.code}>{option.code} {option.symbol} {option.label}</option>)}</select></label>
        <label htmlFor="settings-base-currency">默认对照货币<select id="settings-base-currency" value={previewBaseCurrency} onChange={(event) => setPreviewBaseCurrency(event.target.value as SupportedCurrency)}>{SUPPORTED_CURRENCY_OPTIONS.map((option) => <option key={option.code} value={option.code}>{option.code} {option.symbol} {option.label}</option>)}</select></label>
      </div>
      <div className="ec-setting-row"><div><h3>界面主题</h3><p>清晰明亮的控制台界面。</p></div><span className="ec-badge"><Sun size={16} aria-hidden />浅色主题</span></div>
    </SettingsPanel>
    <SettingsPanel title="导航设置" description="设置控制台导航的位置与显示方式。" icon={PanelTop}>
      <fieldset className="ec-nav-options"><legend>控制台分页位置</legend>{navPlacementOptions.map((option) => <label key={option.value}><input type="radio" name="dashboard-nav-placement" value={option.value} checked={dashboardNavPlacement === option.value} disabled={mainNavbarHidden && option.value === "navbar_embed"} onChange={() => setDashboardNavPlacement(option.value)} /><span><strong>{option.title}</strong><small>{option.description}</small></span></label>)}</fieldset>
      <div className="ec-setting-row"><div><h3>隐藏主导航列</h3><p>在控制台模式下隐藏站点主导航列。</p></div><Switch checked={mainNavbarHidden} onCheckedChange={setMainNavbarHidden} aria-label="隐藏主导航列" /></div>
    </SettingsPanel>
  </>;
}
