import { Plus, Trash2 } from "lucide-react";

export function UserDashboardPaymentSettingsSection() {
  return (
    <section>
      <h3 className="mb-6 text-lg font-medium text-white">付款资讯</h3>
      <div className="space-y-4 rounded-3xl border border-white/5 bg-[#050505]/60 p-6 shadow-xl backdrop-blur-xl">
        <div className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-32 bg-gradient-to-l from-white/5 to-transparent" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-10 w-14 items-center justify-center rounded border border-white/10 bg-[#1a1f2e] shadow-inner">
              <span className="text-sm font-bold italic tracking-tighter text-white">VISA</span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-medium tracking-widest text-white">
                •••• •••• •••• 4242
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-normal text-zinc-300">默认</span>
              </div>
              <div className="mt-1 text-xs text-zinc-500">Exp: 12/28</div>
            </div>
          </div>
          <button type="button" className="relative z-10 p-2 text-zinc-500 transition-colors hover:text-white">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.01] p-4 text-sm text-zinc-400 transition-all hover:border-white/40 hover:bg-white/[0.03] hover:text-white"
        >
          <Plus className="h-4 w-4" /> 添加新的信用卡或签账卡
        </button>
      </div>
    </section>
  );
}
