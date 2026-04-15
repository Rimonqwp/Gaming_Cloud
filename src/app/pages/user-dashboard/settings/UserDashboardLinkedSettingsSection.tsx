import { Link2 } from "lucide-react";
import { DiscordIcon } from "../userDashboardShared";

export function UserDashboardLinkedSettingsSection() {
  return (
    <section>
      <h3 className="mb-6 text-lg font-medium text-white">关联账号</h3>
      <div className="rounded-3xl border border-white/5 bg-[#050505]/60 p-6 shadow-xl backdrop-blur-xl">
        <div className="group flex items-center justify-between rounded-2xl border border-[#5865F2]/20 bg-[#5865F2]/[0.02] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#5865F2]/20 bg-[#5865F2]/10 transition-colors group-hover:bg-[#5865F2]/20">
              <DiscordIcon className="h-6 w-6 text-[#5865F2]" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">Discord 绑定</h4>
              <p className="mt-1 text-xs text-zinc-500">绑定后即可在 Discord 频道内直接接收服务器状态通知、控制台警报。</p>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-[#5865F2] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4752C4]"
          >
            <Link2 className="h-4 w-4" /> 连接账号
          </button>
        </div>
      </div>
    </section>
  );
}
