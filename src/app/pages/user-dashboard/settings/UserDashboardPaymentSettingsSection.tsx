import { CreditCard } from "lucide-react";
import { SettingsPanel } from "./SettingsPanel";

export function UserDashboardPaymentSettingsSection() {
  return <SettingsPanel title="付款资讯" description="查看付款方式与账户账单。" icon={CreditCard}>
    <div className="ec-settings-empty"><CreditCard size={28} aria-hidden /><h3>暂无已绑定的付款方式</h3><p>付款方式管理暂未开放，您可以在财务页面查看账单和充值记录。</p><a href="/dashboard?tab=billing" className="ec-button">前往财务</a></div>
  </SettingsPanel>;
}
