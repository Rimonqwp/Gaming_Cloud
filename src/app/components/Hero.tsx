import { motion } from "motion/react";
import { ChevronRight, Terminal, Activity } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Background with abstract tech imagery & gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-zinc-950 z-10 opacity-70"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-zinc-950 to-zinc-950 z-20"></div>
        {/* Animated glow effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>
        <img 
          src="https://images.unsplash.com/photo-1744868562210-fffb7fa882d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwc2VydmVyJTIwcm9vbSUyMGRhdGElMjBjZW50ZXJ8ZW58MXx8fHwxNzc1NjgyODA5fDA&ixlib=rb-4.1.0&q=80&w=1920&utm_source=figma&utm_medium=referral" 
          alt="Server Room" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="relative z-30 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6 backdrop-blur-sm">
            <Activity className="w-4 h-4" />
            <span>全新 AMD Ryzen™ 9 9950X 節點已上線</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            打造極致<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              雲端遊戲體驗
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-8 leading-relaxed">
            專為硬核玩家與大型社群設計。提供企業級 DDoS 防禦、NVMe 極速存儲與 99.99% 在線保證，60 秒內即可完成專屬伺服器部署。
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <button className="group px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_40px_rgba(8,145,178,0.6)] flex items-center gap-2">
              瀏覽支援遊戲 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-lg transition-all backdrop-blur-sm flex items-center gap-2">
              查看定價方案
            </button>
          </div>
          
          <div className="mt-12 flex items-center gap-8 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              全球 15+ 數據中心
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
              24/7 技術支援
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              秒級自動部署
            </div>
          </div>
        </motion.div>

        {/* Decorative element on the right side - Terminal window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="hidden lg:block relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 blur-3xl -z-10 rounded-full"></div>
          <div className="rounded-2xl border border-white/10 bg-[#0c0c0e]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/40">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <div className="ml-2 flex items-center gap-2 text-xs text-zinc-500 font-mono">
                <Terminal className="w-3 h-3" /> server-deploy.sh
              </div>
            </div>
            <div className="p-6 font-mono text-sm text-zinc-300 space-y-2 h-[320px] overflow-hidden">
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}>&gt; Initializing instance: mc-survival-01</motion.div>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2}}>&gt; Allocating resources: 8GB RAM, 4 vCPU</motion.div>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.8}}>&gt; Mounting NVMe storage...</motion.div>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.4}} className="text-cyan-400">&gt; Storage mounted successfully.</motion.div>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:3.2}}>&gt; Installing Minecraft Paper 1.20.4...</motion.div>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:4.5}} className="text-green-400">&gt; Installation complete.</motion.div>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:5.0}}>&gt; Configuring DDoS mitigation rules...</motion.div>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:5.8}}>&gt; Starting server...</motion.div>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:6.5}} className="text-green-400 font-bold mt-4">
                [SUCCESS] Server is online! IP: 192.168.1.100:25565
              </motion.div>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:7.0}} className="animate-pulse text-cyan-500">_</motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
