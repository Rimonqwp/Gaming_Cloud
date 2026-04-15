import { motion } from "motion/react";
import { AlertTriangle, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { DashboardVirtualAvatar } from "./userDashboardShared";
import type { DashboardTeamMember } from "./userDashboardTypes";

type UserDashboardTeamTabProps = {
  teamMembers: DashboardTeamMember[];
};

export function UserDashboardTeamTab({ teamMembers }: UserDashboardTeamTabProps) {
  return (
    <motion.div
      key="team"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-auto max-w-5xl space-y-6"
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">团队与权限管理</h2>
          <p className="mt-1 text-sm text-zinc-400">邀请成员协作管理您的服务器资源，并设定角色权限。</p>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-zinc-200">
          <Plus className="h-4 w-4" /> 邀请成员
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#050505]/60 shadow-2xl backdrop-blur-xl">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01] text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-6 py-4 font-medium">成员</th>
              <th className="px-6 py-4 font-medium">角色权限</th>
              <th className="px-6 py-4 font-medium">安全状态</th>
              <th className="px-6 py-4 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {teamMembers.map((member) => (
              <tr key={member.id} className="group transition-colors hover:bg-white/[0.02]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <DashboardVirtualAvatar size="sm" />
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-white">
                        {member.name}
                        {member.role === "Owner" ? (
                          <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                            You
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-zinc-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {member.twoFA ? (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <ShieldCheck className="h-4 w-4" /> 2FA 开启
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-amber-400">
                      <AlertTriangle className="h-4 w-4" /> 未配置 2FA
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {member.role !== "Owner" ? (
                    <button className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10" title="移除成员">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
