import { motion } from "motion/react";
import { ArrowRight, Clock, Ticket } from "lucide-react";
import type { DashboardTicket } from "./userDashboardTypes";

type UserDashboardTicketsTabProps = {
  tickets: DashboardTicket[];
};

export function UserDashboardTicketsTab({ tickets }: UserDashboardTicketsTabProps) {
  return (
    <motion.div
      key="tickets"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-auto max-w-5xl space-y-6"
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">技术支持工单</h2>
          <p className="mt-1 text-sm text-zinc-400">遇到问题？我们的 24/7 技术团队随时待命。</p>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all hover:bg-cyan-500">
          <Ticket className="h-4 w-4" /> 提交新工单
        </button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#050505]/60 shadow-2xl backdrop-blur-xl">
        {tickets.map((ticket, index) => (
          <div
            key={ticket.id}
            className={`flex cursor-pointer items-center justify-between p-5 transition-colors hover:bg-white/[0.02] ${index !== tickets.length - 1 ? "border-b border-white/5" : ""}`}
          >
            <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
              <div className="flex w-48 shrink-0 items-center gap-3">
                {ticket.status === "open" ? (
                  <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                ) : ticket.status === "pending" ? (
                  <div className="h-2 w-2 rounded-full bg-cyan-400" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-zinc-600" />
                )}
                <span className="font-mono text-xs text-zinc-500">{ticket.id}</span>
              </div>
              <div className="flex-1 font-medium text-white">{ticket.subject}</div>
            </div>
            <div className="flex shrink-0 items-center gap-6">
              <div className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:flex">
                <Clock className="h-3.5 w-3.5" /> 更新于 {ticket.updated}
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-600" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
