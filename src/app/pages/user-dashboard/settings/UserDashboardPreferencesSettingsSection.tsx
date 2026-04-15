import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import type { DashboardNavPlacement } from "../../../context/DashboardNavContext";
import { SUPPORTED_CURRENCY_OPTIONS, type SupportedCurrency } from "../../../lib/currency";
import { navPlacementOptions } from "../userDashboardData";

type UserDashboardPreferencesSettingsSectionProps = {
  dashboardNavPlacement: DashboardNavPlacement;
  setDashboardNavPlacement: (placement: DashboardNavPlacement) => void;
  mainNavbarHidden: boolean;
  setMainNavbarHidden: (hidden: boolean) => void;
  preferredCurrency: SupportedCurrency;
  setPreferredCurrency: (currency: SupportedCurrency) => void;
  previewBaseCurrency: SupportedCurrency;
  setPreviewBaseCurrency: (currency: SupportedCurrency) => void;
};

export function UserDashboardPreferencesSettingsSection({
  dashboardNavPlacement,
  setDashboardNavPlacement,
  mainNavbarHidden,
  setMainNavbarHidden,
  preferredCurrency,
  setPreferredCurrency,
  previewBaseCurrency,
  setPreviewBaseCurrency,
}: UserDashboardPreferencesSettingsSectionProps) {
  return (
    <section>
      <h3 className="mb-6 text-lg font-medium text-white">偏好设置</h3>

      <div className="space-y-6">
        <div className="rounded-3xl border border-white/5 bg-[#050505]/60 p-6 shadow-xl backdrop-blur-xl">
          <h4 className="mb-1 text-sm font-medium text-zinc-300">貨幣顯示偏好</h4>
          <p className="mb-5 text-xs text-zinc-500">
            設定玩家自己的顯示貨幣，以及管理後台餘額調整彈窗的預設對照貨幣。兩項設定都會同步到帳號。
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                玩家顯示貨幣
              </label>
              <Select value={preferredCurrency} onValueChange={(value) => setPreferredCurrency(value as SupportedCurrency)}>
                <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
                  <SelectValue placeholder="選擇貨幣" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.code} {option.symbol} {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                系統預設對照貨幣
              </label>
              <Select
                value={previewBaseCurrency}
                onValueChange={(value) => setPreviewBaseCurrency(value as SupportedCurrency)}
              >
                <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
                  <SelectValue placeholder="選擇貨幣" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.code} {option.symbol} {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#050505]/60 p-6 shadow-xl backdrop-blur-xl">
          <h4 className="mb-1 text-sm font-medium text-zinc-300">控制台分頁位置</h4>
          <p className="mb-5 text-xs text-zinc-500">
            調整用戶控制台分頁列的顯示位置。登入後偏好會同步到帳號，未登入時則保存在本機瀏覽器。
          </p>
          {mainNavbarHidden ? (
            <p className="mb-3 text-xs text-amber-500/90">
              當主導覽列隱藏時，無法選擇「嵌入主導覽列」。
            </p>
          ) : null}
          <div className="space-y-3">
            {navPlacementOptions.map((option) => {
              const embedDisabled = mainNavbarHidden && option.value === "navbar_embed";

              return (
                <label
                  key={option.value}
                  className={`flex gap-4 rounded-2xl border p-4 transition-colors ${
                    embedDisabled
                      ? "pointer-events-none cursor-not-allowed border-white/5 bg-white/[0.02] opacity-45"
                      : dashboardNavPlacement === option.value
                        ? "cursor-pointer border-cyan-500/40 bg-cyan-500/[0.06]"
                        : "cursor-pointer border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="dashboard-nav-placement"
                    value={option.value}
                    checked={dashboardNavPlacement === option.value}
                    disabled={embedDisabled}
                    onChange={() => setDashboardNavPlacement(option.value)}
                    className="mt-1 h-4 w-4 shrink-0 accent-cyan-500 disabled:cursor-not-allowed"
                  />
                  <div className="min-w-0">
                    <div className={`text-sm font-medium ${embedDisabled ? "text-zinc-500" : "text-white"}`}>
                      {option.title}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">{option.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#050505]/60 p-6 shadow-xl backdrop-blur-xl">
          <h4 className="mb-1 text-sm font-medium text-zinc-300">主導覽列設定</h4>
          <p className="mb-5 text-xs text-zinc-500">
            控制主導覽列是否在控制台模式下隱藏。關閉後仍可透過控制台工具列操作主要入口。
          </p>
          <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20">
            <div className="min-w-0 pr-2">
              <div className="text-sm font-medium text-white">隱藏主導覽列</div>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                開啟後會在控制台模式生效；離開 dashboard 後仍會顯示完整主導覽列。
              </p>
            </div>
            <Switch
              checked={mainNavbarHidden}
              onCheckedChange={setMainNavbarHidden}
              className="mt-0.5 data-[state=checked]:bg-cyan-600"
              aria-label="隱藏主導覽列"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
