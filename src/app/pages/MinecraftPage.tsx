import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Zap, Box, Database, PlaySquare, Settings, Gamepad2 } from "lucide-react";
import { Link } from "react-router";
import minecraftVideo from "../data/Minecraft.mp4";
import { usePerformanceMode } from "../hooks/usePerformanceMode";

export function MinecraftPage() {
  const { allowAutoplayVideo, allowHeavyMotion } = usePerformanceMode();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const heroGridMask =
    "radial-gradient(ellipse 60% 60% at 50% 50%, #000 70%, transparent 100%)";

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !allowAutoplayVideo) {
      return;
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        setVideoReady(false);
      });
    }
  }, [allowAutoplayVideo]);

  return (
    <div className="bg-[#070b09] min-h-screen">
      {/* MC Hero Section */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-20">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(22,163,74,0.22),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_36%),linear-gradient(180deg,#0a120d_0%,#070b09_55%,#050806_100%)]"
          ></div>
          <video
            ref={videoRef}
            autoPlay={allowAutoplayVideo}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            onLoadedData={() => setVideoReady(true)}
            onError={() => setVideoReady(false)}
            className={`absolute inset-0 h-full w-full object-cover object-center mix-blend-luminosity transition-opacity duration-700 ${
              videoReady ? "opacity-30" : "opacity-0"
            }`}
          >
            <source src={minecraftVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b09] via-[#070b09]/80 to-transparent"></div>
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,#10b98112_1px,transparent_1px),linear-gradient(to_bottom,#10b98112_1px,transparent_1px)] bg-[size:40px_40px]"
            style={{
              WebkitMaskImage: heroGridMask,
              maskImage: heroGridMask,
            }}
          ></div>
          
          {allowHeavyMotion ? (
            <motion.div 
              animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.32, 0.2] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"
            ></motion.div>
          ) : null}
        </div>

        <div className="relative z-30 max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8 backdrop-blur-md"
          >
            <Box className="w-4 h-4" /> 專為 Minecraft 深度優化
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 text-6xl font-black leading-[1.1] tracking-tighter text-white md:text-[73px]"
          >
            打造全新的 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              方块世界
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12 max-w-3xl text-[19px] font-light leading-relaxed text-zinc-400"
          >
            全新架构，为 Minecraft 而生，重新定义更流畅、更稳定、更顺手的服务器体验。
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/deploy"
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] flex items-center justify-center gap-2"
            >
              查看方案定價 <Zap className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-lg transition-all backdrop-blur-sm flex items-center justify-center gap-2">
              <PlaySquare className="w-5 h-5 text-emerald-400" /> 觀看控制台展示
            </button>
          </motion.div>
        </div>
      </section>

      {/* MC Specific Optimizations */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">我們為 Minecraft <span className="text-emerald-400">做了什麼優化？</span></h2>
            <p className="mx-auto max-w-2xl text-[19px] leading-relaxed text-zinc-400">不只是單純提供主機，我們從硬體底層到軟體環境，全面針對 Java 與 Bedrock 版本進行專屬調校。</p>
          </div>

          <div className="space-y-32 mt-20">
            <FeatureBlock 
              image="https://images.unsplash.com/photo-1666280932034-72b12935954e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5lY3JhZnQlMjByZWRzdG9uZSUyMGNvbXBsZXh8ZW58MXx8fHwxNzc1NjgzNTgyfDA&ixlib=rb-4.1.0&q=80&w=1080"
              icon={<Settings className="w-8 h-8 text-emerald-400" />}
              title="重新打造的新一代控制面板"
              subtitle="為伺服器管理者打造的新一代控制面板"
              desc="我們沒有沿用市面常見的翼龍面板，而是重新開發一套全新的控制面板，專注優化管理者的使用體驗，讓部署、監控與日常維運都更直覺、更順手。"
              reverse={false}
            />

            <FeatureBlock 
              image="https://images.unsplash.com/photo-1662531914405-c037eab676b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5lY3JhZnQlMjBmbHlpbmclMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzc1NjgzNTgyfDA&ixlib=rb-4.1.0&q=80&w=1080"
              icon={<Database className="w-8 h-8 text-emerald-400" />}
              title="告別破圖，光速區塊加載"
              subtitle="企業級 NVMe PCIe 4.0 儲存陣列"
              desc="當玩家使用鞘翅高速飛行或搭乘冰船時，最怕遇到區塊載入不及導致卡在半空中或撞牆。我們全線配備企業級 NVMe PCIe 4.0 固態硬碟陣列（RAID 10），I/O 效能比傳統 SSD 提升 10 倍以上。無論玩家移動多快，地圖區塊（Chunk）都能瞬間載入，提供如絲般順滑的探索體驗。"
              reverse={true}
            />

            <FeatureBlock 
              image="https://images.unsplash.com/photo-1759663174567-5e444de2488c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5lY3JhZnQlMjBwbGF5ZXJzJTIwc2VydmVyc3xlbnwxfHx8fDE3NzU2ODM1ODh8MA&ixlib=rb-4.1.0&q=80&w=1080"
              icon={<Gamepad2 className="w-8 h-8 text-emerald-400" />}
              title="打破界限，全平台完美互通"
              subtitle="Java & 基岩版 (Bedrock) 無縫連線"
              desc="朋友沒有電腦？沒關係！我們的伺服器深度整合 GeyserMC 協定。只需在控制台一鍵開啟跨平台選項，即可讓使用 PC (Java版)、手機 (iOS/Android)、Xbox、PS5 與 Switch (基岩版) 的玩家同時登入同一個伺服器。打破硬體隔閡，打造無障礙的終極遊戲社群。"
              reverse={false}
            />

            <FeatureBlock 
              image="https://images.unsplash.com/photo-1668319540959-53d1b12b866e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5lY3JhZnQlMjBtb2RkZWQlMjBjYXN0bGUlMjBzaGFkZXJzfGVufDF8fHx8MTc3NTY4MzU4Mnww&ixlib=rb-4.1.0&q=80&w=1080"
              icon={<Settings className="w-8 h-8 text-emerald-400" />}
              title="十萬款模組，一鍵自動部署"
              subtitle="內建強大的模組與插件管理器"
              desc="告別繁瑣的 FTP 上傳與版本衝突。我們的控制台內建與 CurseForge、Modrinth 及 FTB 深度連接的模組管理器。無論是 RLcraft、All the Mods 還是自定義整合包，點擊一次即可自動下載、安裝並配置所有相依性檔案，讓您將寶貴的時間專注於遊玩而非除錯。"
              reverse={true}
            />
          </div>
        </div>
      </section>

      {/* Pricing Plans tailored for MC */}
      <section className="py-24 bg-[#0a100c] border-t border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">選擇適合您的伺服器規模</h2>
            <p className="text-[19px] leading-relaxed text-zinc-400">所有方案均包含不限流量與免費 DDoS 防護</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PricingCard 
              name="草地 (Grass)" 
              ram="2GB" 
              price="$3.99" 
              players="1-5 玩家" 
              ideal="適合原味生存、少數好友聯機" 
            />
            <PricingCard 
              name="鐵錠 (Iron)" 
              ram="4GB" 
              price="$7.99" 
              players="5-15 玩家" 
              ideal="適合輕度模組、小型插件伺服器" 
              popular 
            />
            <PricingCard 
              name="鑽石 (Diamond)" 
              ram="8GB" 
              price="$14.99" 
              players="15-40 玩家" 
              ideal="適合中型社群、大型模組包" 
            />
            <PricingCard 
              name="獄髓 (Netherite)" 
              ram="16GB" 
              price="$28.99" 
              players="無限制" 
              ideal="適合百人伺服器、群組服 (BungeeCord)" 
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureBlock({ image, icon, title, subtitle, desc, reverse }: { image: string, icon: React.ReactNode, title: string, subtitle: string, desc: string, reverse: boolean }) {
  return (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 lg:gap-20`}>
      <motion.div 
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full md:w-1/2 relative group"
      >
        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-90 group-hover:bg-emerald-400/30 transition-colors duration-700"></div>
        <div className="relative rounded-3xl overflow-hidden border border-emerald-500/20 shadow-2xl aspect-[4/3]">
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b09] via-transparent to-transparent opacity-80"></div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: reverse ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="w-full md:w-1/2"
      >
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            {icon}
          </div>
          <span className="text-emerald-400 font-bold tracking-wide">{subtitle}</span>
        </div>
        <h3 className="mb-6 text-2xl font-black leading-tight text-white md:text-3xl">
          {title}
        </h3>
        <p className="text-[19px] leading-relaxed text-zinc-400">
          {desc}
        </p>
      </motion.div>
    </div>
  );
}

function PricingCard({ name, ram, price, players, ideal, popular }: { name: string, ram: string, price: string, players: string, ideal: string, popular?: boolean }) {
  return (
    <div className={`relative p-6 rounded-2xl border ${popular ? 'bg-emerald-900/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'bg-[#0b130e] border-white/5'} flex flex-col`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full">
          最多人選擇
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-1">{name} 方案</h3>
      <div className="text-zinc-400 text-sm mb-6">{ideal}</div>
      <div className="mb-6">
        <span className="text-4xl font-black text-white">{price}</span>
        <span className="text-zinc-500"> /月</span>
      </div>
      <div className="space-y-3 mb-8 flex-1">
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <span className="font-bold text-white">{ram}</span> DDR5 記憶體
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          {players}
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          不限 NVMe 儲存空間
        </div>
      </div>
      <button className={`w-full py-3 rounded-xl font-bold transition-all ${popular ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
        立即部署
      </button>
    </div>
  );
}
