import { motion } from "motion/react";
import { Users, Server, Cpu, HardDrive } from "lucide-react";
import { Link } from "react-router";

const games = [
  {
    id: "minecraft",
    name: "Minecraft",
    edition: "Java & Bedrock",
    price: "$2.99",
    players: "無限玩家",
    image: "https://images.unsplash.com/photo-1759663174469-f1e2a7a4bdcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5lY3JhZnQlMjBibG9jayUyMGdhbWV8ZW58MXx8fHwxNzc1NTYzMTcxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: true,
  },
  {
    id: "palworld",
    name: "Palworld",
    edition: "幻獸帕魯",
    price: "$14.99",
    players: "32 玩家",
    image: "https://images.unsplash.com/photo-1772536115165-4f6adf0e34bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGZhbnRhc3klMjB3b3JsZHxlbnwxfHx8fDE3NzU2MjA3MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: true,
  },
  {
    id: "gta",
    name: "FiveM",
    edition: "GTA V Roleplay",
    price: "$8.99",
    players: "最高 2048 玩家",
    image: "https://images.unsplash.com/photo-1641650265007-b2db704cd9f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBjaXR5JTIwbmVvbnxlbnwxfHx8fDE3NzU2NTg4Njl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: false,
  },
  {
    id: "rust",
    name: "Rust",
    edition: "腐蝕",
    price: "$9.99",
    players: "最高 500 玩家",
    image: "https://images.unsplash.com/photo-1693998054498-89161a27c828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBzdXJ2aXZhbCUyMGFkdmVudHVyZXxlbnwxfHx8fDE3NzU2ODI4MDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: false,
  },
  {
    id: "ark",
    name: "ARK",
    edition: "Survival Ascended",
    price: "$15.99",
    players: "250 玩家",
    image: "https://images.unsplash.com/photo-1733783792708-a877aa2f8460?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaW5vc2F1ciUyMGFyayUyMHN1cnZpdmFsfGVufDF8fHx8MTc3NTY4MjgxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    popular: false,
  },
  {
    id: "enshrouded",
    name: "Enshrouded",
    edition: "霧鎖王國",
    price: "$7.99",
    players: "16 玩家",
    image: "https://images.unsplash.com/photo-1771875797242-77f69f061132?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjBuZW9uJTIwdGVjaHxlbnwxfHx8fDE3NzU2ODI4MDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    popular: false,
  }
];

export function GamesGrid() {
  return (
    <section id="games" className="py-24 bg-zinc-950 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            選擇你的<span className="text-cyan-400">戰場</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto"
          >
            支援超過 50+ 種熱門遊戲。所有伺服器均配備專屬控制台，只需點擊幾下即可完成所有模組與設定。
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-cyan-500/50 transition-all duration-300 shadow-xl"
            >
              {/* Image Background */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={game.image} 
                  alt={game.name} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-6 h-full flex flex-col justify-end min-h-[320px]">
                {game.popular && (
                  <div className="absolute top-4 right-4 bg-cyan-500/20 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full border border-cyan-500/20 backdrop-blur-sm">
                    最熱門
                  </div>
                )}
                
                <h3 className="text-3xl font-black text-white tracking-wide mb-1 drop-shadow-lg">{game.name}</h3>
                <p className="text-zinc-300 font-medium mb-6 drop-shadow">{game.edition}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-400 mb-1">起步價 (每月)</span>
                    <span className="text-xl font-bold text-cyan-400">{game.price}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-400 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> 支援人數</span>
                    <span className="text-sm font-semibold text-white">{game.players}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="flex items-center justify-center gap-1 bg-white/5 py-2 rounded-lg text-xs font-medium text-zinc-300 border border-white/5">
                    <Cpu className="w-3 h-3" /> 5.5GHz
                  </div>
                  <div className="flex items-center justify-center gap-1 bg-white/5 py-2 rounded-lg text-xs font-medium text-zinc-300 border border-white/5">
                    <HardDrive className="w-3 h-3" /> NVMe
                  </div>
                  <div className="flex items-center justify-center gap-1 bg-white/5 py-2 rounded-lg text-xs font-medium text-zinc-300 border border-white/5">
                    <Server className="w-3 h-3" /> 立即開通
                  </div>
                </div>

                <button className="w-full py-3 bg-white/10 hover:bg-cyan-600 text-white rounded-xl font-bold transition-all border border-white/10 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(8,145,178,0.4)] backdrop-blur-sm">
                  部署伺服器
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/games" className="px-8 py-3 bg-zinc-900 border border-white/10 hover:border-white/30 text-white rounded-xl font-medium transition-all inline-flex items-center gap-2">
            查看所有 50+ 款遊戲
          </Link>
        </div>
      </div>
    </section>
  );
}
