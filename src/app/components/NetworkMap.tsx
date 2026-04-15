import { motion } from "motion/react";
import { Server, CheckCircle } from "lucide-react";

export function NetworkMap() {
  const locations = [
    { name: "洛杉磯 (LAX)", ping: "20ms", region: "北美洲", status: "線上" },
    { name: "紐約 (NYC)", ping: "25ms", region: "北美洲", status: "線上" },
    { name: "法蘭克福 (FRA)", ping: "15ms", region: "歐洲", status: "線上" },
    { name: "倫敦 (LHR)", ping: "18ms", region: "歐洲", status: "線上" },
    { name: "新加坡 (SGP)", ping: "35ms", region: "亞洲", status: "線上" },
    { name: "東京 (NRT)", ping: "28ms", region: "亞洲", status: "線上" },
    { name: "台北 (TPE)", ping: "5ms", region: "亞洲", status: "線上" },
    { name: "雪梨 (SYD)", ping: "45ms", region: "大洋洲", status: "線上" }
  ];

  return (
    <section id="network" className="py-24 bg-[#0a0a0c] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/3">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-white mb-6"
            >
              全球 <span className="text-cyan-400">低延遲</span> 網路覆蓋
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 text-lg mb-8"
            >
              超過 15 個戰略性部署的數據中心，配備 10Gbps 上行頻寬。讓所有玩家享受順暢無阻的連線品質。
            </motion.p>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-3 text-zinc-300">
                <CheckCircle className="w-5 h-5 text-cyan-400" /> Premium Anycast 網路
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <CheckCircle className="w-5 h-5 text-cyan-400" /> 直接連接一線電信商
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <CheckCircle className="w-5 h-5 text-cyan-400" /> 24/7 網路狀態監控
              </div>
            </motion.div>
          </div>

          <div className="lg:w-2/3 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {locations.map((loc, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-zinc-900 border border-white/5 p-4 rounded-xl hover:border-cyan-500/50 hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <Server className="w-5 h-5 text-zinc-400" />
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] text-green-400 font-bold">{loc.status}</span>
                    </div>
                  </div>
                  <div className="text-sm text-cyan-400 font-semibold mb-1">{loc.region}</div>
                  <div className="text-white font-bold mb-2">{loc.name}</div>
                  <div className="text-xs text-zinc-500">平均延遲: {loc.ping}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
