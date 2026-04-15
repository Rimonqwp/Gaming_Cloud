import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { Search, Filter, Server, Cpu, HardDrive, Users, Zap, ChevronRight } from "lucide-react";
import { useState } from "react";
import { usePerformanceMode } from "../hooks/usePerformanceMode";

const games = [
  {
    id: "minecraft",
    name: "Minecraft",
    category: "Sandbox",
    description: "專為高負載生怪與紅石機制設計，提供極致流暢體驗。支援跨版本連線與大型模組包。",
    image: "https://images.unsplash.com/photo-1703954413255-b8ac066fd53b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5lY3JhZnQlMjBsYW5kc2NhcGUlMjBzaGFkZXJzfGVufDF8fHx8MTc3NTY3MjU5NXww&ixlib=rb-4.1.0&q=80&w=1920",
    theme: {
      glow: "bg-emerald-500",
      line: "from-emerald-500/0 via-emerald-400 to-emerald-500/0",
      buttonBg: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400",
      border: "border-emerald-500/30",
    },
    path: "/minecraft",
    tags: ["Java", "Bedrock", "Modpack"],
    specs: { players: "無上限", ram: "16GB+", cpu: "5.5GHz" }
  },
  {
    id: "rust",
    name: "Rust",
    category: "Survival",
    description: "硬核生存首選。高頻率 CPU 保證百人伺服器 PVP 不卡頓，無懼突襲與高建築負載。",
    image: "https://images.unsplash.com/photo-1761888352639-4da7bcecaeeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3N0JTIwYXBvY2FseXB0aWMlMjBzdXJ2aXZhbHxlbnwxfHx8fDE3NzU2OTE1OTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    theme: {
      glow: "bg-orange-500",
      line: "from-orange-500/0 via-orange-400 to-orange-500/0",
      buttonBg: "bg-orange-500/10 hover:bg-orange-500/20 text-orange-400",
      border: "border-orange-500/30",
    },
    path: null,
    tags: ["Oxide", "Vanilla"],
    specs: { players: "500+", ram: "32GB+", cpu: "5.5GHz" }
  },
  {
    id: "cs2",
    name: "Counter-Strike 2",
    category: "FPS",
    description: "頂級線路與抗 DDoS 防護，極致低延遲，為競技比賽、死鬥與社群伺服器量身打造。",
    image: "https://images.unsplash.com/photo-1592089868710-9ab75a625e62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2F0JTIwcG9saWNlJTIwYWN0aW9ufGVufDF8fHx8MTc3NTY5MTYwMXww&ixlib=rb-4.1.0&q=80&w=1080",
    theme: {
      glow: "bg-cyan-500",
      line: "from-cyan-500/0 via-cyan-400 to-cyan-500/0",
      buttonBg: "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400",
      border: "border-cyan-500/30",
    },
    path: null,
    tags: ["128 Tick", "Workshop"],
    specs: { players: "64", ram: "8GB", cpu: "優先緒" }
  },
  {
    id: "fivem",
    name: "FiveM (GTA V)",
    category: "Roleplay",
    description: "完美支援大型模組與自定義腳本的高效運行，為您的 RP 伺服器提供最穩定的底層架構。",
    image: "https://images.unsplash.com/photo-1653474031572-248dffc6037a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBjaXR5JTIwbmlnaHQlMjBjYXJ8ZW58MXx8fHwxNzc1NjkxNjExfDA&ixlib=rb-4.1.0&q=80&w=1080",
    theme: {
      glow: "bg-purple-500",
      line: "from-purple-500/0 via-purple-400 to-purple-500/0",
      buttonBg: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400",
      border: "border-purple-500/30",
    },
    path: null,
    tags: ["RP", "ESX", "QBCore"],
    specs: { players: "2048", ram: "32GB+", cpu: "5.5GHz" }
  },
  {
    id: "palworld",
    name: "Palworld",
    category: "Survival",
    description: "為帕魯勞工提供全天候穩定的工作環境，獨家記憶體洩漏自動優化與定時重啟機制。",
    image: "https://images.unsplash.com/photo-1680507500073-320536d4faf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMG5hdHVyZSUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NzU2OTE2NTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    theme: {
      glow: "bg-blue-500",
      line: "from-blue-500/0 via-blue-400 to-blue-500/0",
      buttonBg: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400",
      border: "border-blue-500/30",
    },
    path: null,
    tags: ["Co-op", "Dedicated"],
    specs: { players: "32", ram: "16GB+", cpu: "5.0GHz" }
  },
  {
    id: "ark",
    name: "ARK: Ascended",
    category: "Survival",
    description: "無縫地圖加載與龐大龍群運算，提供企業級大記憶體方案，集群跨服技術完美支援。",
    image: "https://images.unsplash.com/photo-1525877442103-5ddb2089b2bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaW5vc2F1cnxlbnwxfHx8fDE3NzU2OTE2MDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    theme: {
      glow: "bg-lime-500",
      line: "from-lime-500/0 via-lime-400 to-lime-500/0",
      buttonBg: "bg-lime-500/10 hover:bg-lime-500/20 text-lime-400",
      border: "border-lime-500/30",
    },
    path: null,
    tags: ["Crossplay", "Clusters"],
    specs: { players: "250", ram: "64GB+", cpu: "5.5GHz" }
  }
];

const categories = ["All", "Sandbox", "Survival", "FPS", "Roleplay"];

export function GamesPage() {
  const { allowHeavyMotion } = usePerformanceMode();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const heroPanelClass = allowHeavyMotion
    ? "bg-[#0a0a0a]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
    : "bg-[#0a0a0a]/92 border border-white/10 rounded-2xl p-2 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl";

  const filteredGames = games.filter(game => {
    const matchesCategory = activeCategory === "All" || game.category === activeCategory;
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-black min-h-screen font-sans text-slate-200 selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* 沉浸式深層背景特效 (Immersive Deep Background) */}
      <div className="hidden">
        {/* 動態漸層光暈 */}
        {allowHeavyMotion ? (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-cyan-900/10 rounded-full blur-[150px] mix-blend-screen"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[150px] mix-blend-screen"></div>
          </>
        ) : null}
        {/* 微弱的科技感網格紋理 */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1768527858342-037cff722276?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG5lb24lMjBncmlkfGVufDF8fHx8MTc3NTY5MTYxOXww&ixlib=rb-4.1.0&q=80&w=1920')] bg-cover opacity-[0.03] mix-blend-screen mask-image-[linear-gradient(to_bottom,white,transparent)]"></div>
      </div>

      {/* Hero Section (頂部巨型視覺區) */}
      <section className="relative z-10 pt-[118px] pb-[42px] flex flex-col items-center justify-center text-center px-6">
        {/* 懸浮的玻璃裝飾幾何圖形 */}
        {allowHeavyMotion ? (
          <>
            <motion.div 
              animate={{ y: [-15, 15, -15], rotate: [0, 5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-24 left-[15%] w-32 h-32 bg-cyan-500/5 backdrop-blur-2xl border border-cyan-500/10 rounded-2xl rotate-12 hidden md:block"
            />
            <motion.div 
              animate={{ y: [15, -15, 15], rotate: [0, -5, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 right-[15%] w-48 h-48 bg-purple-500/5 backdrop-blur-2xl border border-purple-500/10 rounded-full -rotate-12 hidden md:block"
            />
          </>
        ) : null}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3 backdrop-blur-md"
        >
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          SYS.NAV // GAMES_DIRECTORY
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[69px] font-black text-white mb-3 tracking-tighter"
        >
          選擇你的 <span className="relative inline-block">
            <span className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-500 blur-2xl opacity-20"></span>
            <span className="relative text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500">戰場</span>
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[17px] md:text-xl text-zinc-500 max-w-2xl font-light leading-relaxed"
        >
          我們提供 50+ 款熱門遊戲的企業級託管。透過圖層交疊的直覺介面，探索並一鍵部署您的專屬伺服器。
        </motion.p>
      </section>

      {/* 玻璃擬態控制台 (Glassmorphism Command Palette) */}
      <section className="sticky top-24 z-40 max-w-7xl mx-auto px-6 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={heroPanelClass}
        >
          {/* Filters */}
          <div className="flex gap-1 p-1 bg-black/40 rounded-xl overflow-x-auto w-full md:w-auto scrollbar-hide">
            <div className="flex items-center px-3 text-zinc-500">
              <Filter className="w-4 h-4" />
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'bg-white text-black shadow-lg scale-100' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/10 scale-95 hover:scale-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="搜尋遊戲指令..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-transparent focus:border-cyan-500/30 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
            />
          </div>
        </motion.div>
      </section>

      {/* 圖層交疊與3D懸浮卡片網格 (Layered 3D Floating Cards Grid) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        {filteredGames.length === 0 ? (
          <div className="text-center py-32 bg-zinc-900/30 rounded-3xl border border-white/5 backdrop-blur-sm">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
              <Search className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">查無匹配結果</h3>
            <p className="text-zinc-500">請嘗試其他關鍵字，或聯絡技術支援為您開啟客製化容器。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            <AnimatePresence>
              {filteredGames.map((game, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  key={game.id}
                  className="group relative h-[480px] rounded-3xl"
                >
                  {/* 最底層：專屬霓虹光暈 (Layer 0: Neon Glow) */}
                  <div className={`absolute top-10 left-4 right-4 h-[300px] ${game.theme.glow} blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none`}></div>

                  {/* 中層：遊戲畫面背景卡 (Layer 1: Background Image Card) */}
                  <div className="absolute top-0 left-0 right-0 h-[380px] rounded-[2rem] overflow-hidden z-10 border border-white/5 group-hover:border-white/10 transition-colors duration-500 shadow-2xl bg-zinc-900">
                    <img 
                      src={game.image} 
                      alt={game.name} 
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-90 group-hover:scale-110 transition-all duration-1000 ease-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030303] opacity-90"></div>
                    
                    {/* 分類標籤 */}
                    <div className="absolute top-5 left-5">
                      <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-[10px] font-black text-white border border-white/10 uppercase tracking-widest shadow-lg">
                        {game.category}
                      </span>
                    </div>
                  </div>

                  {/* 最上層：懸浮的玻璃擬態資訊面板 (Layer 2: Floating Glass Info Panel) */}
                  <div className="absolute bottom-0 left-4 right-4 z-20">
                    <div className="bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform group-hover:-translate-y-6 group-hover:scale-[1.02] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative overflow-hidden">
                      
                      {/* 玻璃卡片頂部的細緻漸層發光線 */}
                      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${game.theme.line} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                      
                      <h3 className="text-2xl font-black text-white mb-2">{game.name}</h3>
                      <p className="text-zinc-400 text-sm mb-5 line-clamp-2 leading-relaxed">{game.description}</p>
                      
                      {/* 規格標籤 */}
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="bg-white/5 rounded-xl p-2 text-center border border-white/5 group-hover:border-white/10 transition-colors">
                          <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Users className="w-2.5 h-2.5" /> 玩家</div>
                          <div className="text-xs font-bold text-zinc-200">{game.specs.players}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2 text-center border border-white/5 group-hover:border-white/10 transition-colors">
                          <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><HardDrive className="w-2.5 h-2.5" /> 記憶體</div>
                          <div className="text-xs font-bold text-zinc-200">{game.specs.ram}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2 text-center border border-white/5 group-hover:border-white/10 transition-colors">
                          <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Cpu className="w-2.5 h-2.5" /> 處理器</div>
                          <div className="text-xs font-bold text-zinc-200">{game.specs.cpu}</div>
                        </div>
                      </div>

                      {/* 互動按鈕 */}
                      {game.path ? (
                        <Link 
                          to={game.path}
                          className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold transition-all ${game.theme.buttonBg} border border-transparent group-hover:${game.theme.border} group/btn`}
                        >
                          查看專屬優化 <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      ) : (
                        <button 
                          className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold transition-all ${game.theme.buttonBg} border border-transparent group-hover:${game.theme.border} group/btn`}
                        >
                          一鍵部署 <Zap className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* 底部行動呼籲 (Bottom CTA) */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <div className="p-px rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent relative overflow-hidden">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl rounded-[2.4rem]"></div>
          
          <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
            <div className="w-24 h-24 shrink-0 rounded-[1.5rem] bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center relative shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <Server className="w-10 h-10 text-white relative z-10" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-3xl font-black text-white mb-3">需要更進階的環境？</h3>
              <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                我們支援自定義 Docker 映像檔與 Pterodactyl 面板。聯繫技術團隊，立即開啟專屬的無頭伺服器 (Headless Server) 節點。
              </p>
            </div>
            
            <div className="shrink-0">
              <button className="px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1">
                聯絡技術專家
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
