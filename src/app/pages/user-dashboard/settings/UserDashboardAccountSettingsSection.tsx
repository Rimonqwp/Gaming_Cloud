import type { DashboardUser } from "../userDashboardTypes";
import { DashboardVirtualAvatar } from "../userDashboardShared";

type UserDashboardAccountSettingsSectionProps = {
  dashboardUser: DashboardUser;
};

export function UserDashboardAccountSettingsSection({
  dashboardUser,
}: UserDashboardAccountSettingsSectionProps) {
  return (
    <section>
      <h3 className="mb-6 text-lg font-medium text-white">账号信息</h3>
      <div className="space-y-5 rounded-3xl border border-white/5 bg-[#050505]/60 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-5 border-b border-white/5 pb-5">
          <DashboardVirtualAvatar size="lg" />
          <div>
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10"
            >
              更换头像
            </button>
            <p className="mt-2 text-[10px] text-zinc-500">支持 JPG, PNG. 最大 5MB.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500">用户名</label>
            <input
              type="text"
              defaultValue={dashboardUser.name}
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0c] px-4 py-2.5 text-sm text-white transition-colors focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500">电子邮箱</label>
            <input
              type="email"
              defaultValue={dashboardUser.email}
              className="w-full cursor-not-allowed rounded-xl border border-white/5 bg-[#0a0a0c]/50 px-4 py-2.5 text-sm text-zinc-500"
              disabled
            />
          </div>
        </div>
        <div className="pt-2">
          <button
            type="button"
            className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
          >
            保存更改
          </button>
        </div>
      </div>
    </section>
  );
}
