import { motion } from "motion/react";
import { Shield, Zap, Globe, Cpu, Clock, Headset } from "lucide-react";

const features = [
  {
    icon: <Shield className="w-8 h-8 text-cyan-400" />,
    title: "480Gbps DDoS 防護",
    description: "專為遊戲設計的進階七層清洗規則，完美阻擋 UDP 放大攻擊等各類威脅，確保伺服器永不斷線。"
  },
  {
    icon: <Zap className="w-8 h-8 text-cyan-400" />,
    title: "頂級 NVMe 架構",
    description: "全節點採用企業級 NVMe SSD Raid 10 陣列，I/O 效能提升高達 10 倍，實現毫秒級的地圖加載與存檔。"
  },
  {
    icon: <Cpu className="w-8 h-8 text-cyan-400" />,
    title: "高時脈處理器",
    description: "配備 Ryzen 9 9950X 與 i9-14900K 處理器，單核時脈高達 5.8GHz+，完美應對單線程需求高的遊戲引擎。"
  },
  {
    icon: <Globe className="w-8 h-8 text-cyan-400" />,
    title: "全球低延遲網路",
    description: "連接全球 Tier-1 骨幹網路，提供 BGP 智能路由，無論玩家身在何處都能享受流暢低延遲的連線。"
  },
  {
    icon: <Clock className="w-8 h-8 text-cyan-400" />,
    title: "自動化備份與還原",
    description: "免費提供每日異地備份，並且可透過控制台一鍵還原至任何時間點，資料安全零風險。"
  },
  {
    icon: <Headset className="w-8 h-8 text-cyan-400" />,
    title: "24/7 專家支援",
    description: "由經驗豐富的遊戲伺服器工程師組成的團隊，全年無休為您解決所有疑難雜症，平均回覆時間 < 15 分鐘。"
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-zinc-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium mb-6"
          >
            企業級基礎架構
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            超越極限的<span className="text-cyan-400">核心優勢</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto"
          >
            我們不惜成本採用最高規格的硬體與網路環境，只為提供您最穩定、最順暢的遊戲體驗。
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 hover:border-cyan-500/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
