import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronRight, Terminal, Zap } from "lucide-react";
import { usePerformanceMode } from "../hooks/usePerformanceMode";

export function HeroV2() {
  const { allowHeavyMotion } = usePerformanceMode();
  const reduceMotionPref = useReducedMotion();
  const [enableEnhancedEffects, setEnableEnhancedEffects] = useState(false);
  const heroGridMask =
    "radial-gradient(ellipse 78% 72% at 50% 50%, #000 74%, transparent 100%)";
  const enableEntranceMotion = reduceMotionPref !== true;
  const enableAmbientMotion =
    allowHeavyMotion && enableEnhancedEffects && reduceMotionPref !== true;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const enable = () => {
      setEnableEnhancedEffects(true);
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 350 });
    } else {
      timeoutId = window.setTimeout(enable, 220);
    }

    return () => {
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const badgeMotionProps = enableEntranceMotion
    ? {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: "easeOut" as const },
      }
    : {};
  const headlineMotionProps = enableEntranceMotion
    ? {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, delay: 0.2, ease: "easeOut" as const },
      }
    : {};
  const subtitleMotionProps = enableEntranceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.8, delay: 0.4 },
      }
    : {};
  const ctaMotionProps = enableEntranceMotion
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, delay: 0.6 },
      }
    : {};
  const statsMotionProps = enableEntranceMotion
    ? {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 1, delay: 0.8 },
      }
    : {};
  const topBadgeClass = enableEnhancedEffects
    ? "group relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm font-medium mb-10 overflow-hidden cursor-pointer backdrop-blur-sm"
    : "relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm font-medium mb-10 overflow-hidden";
  const topBadgeOverlayClass = enableEnhancedEffects
    ? "absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
    : "hidden";
  const topBadgeDotClass = enableEnhancedEffects
    ? "h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]"
    : "h-2 w-2 rounded-full bg-cyan-400";
  const topBadgeChevronClass = enableEnhancedEffects
    ? "h-4 w-4 text-zinc-500 group-hover:translate-x-1 group-hover:text-white transition-all"
    : "h-4 w-4 text-zinc-500";
  const primaryButtonClass = enableEnhancedEffects
    ? "group relative w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105"
    : "group relative w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden";
  const primaryButtonOverlayClass = enableEnhancedEffects
    ? "absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity"
    : "hidden";
  const primaryButtonIconClass = enableEnhancedEffects
    ? "h-5 w-5 fill-black group-hover:animate-pulse"
    : "h-5 w-5 fill-black";
  const secondaryButtonClass = enableEnhancedEffects
    ? "group flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-8 py-4 text-lg font-bold text-white transition-all hover:border-white/50 hover:bg-white/5 backdrop-blur-sm sm:w-auto"
    : "group flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-8 py-4 text-lg font-bold text-white transition-all sm:w-auto";
  const statCardClass = enableEnhancedEffects
    ? "flex flex-col items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 backdrop-blur-md"
    : "flex flex-col items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.03] p-6";

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-black pt-20">
      <div className="absolute inset-0 z-0">
        <img
          src="/cloud-gaming-home-bg.png"
          alt="Cloud gaming server room"
          decoding="async"
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-black/55 to-black/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

        {enableEnhancedEffects ? (
          <div
            className="absolute inset-x-0 top-0 h-[100svh] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"
            style={{
              WebkitMaskImage: heroGridMask,
              maskImage: heroGridMask,
            }}
          ></div>
        ) : null}

        {enableAmbientMotion ? (
          <>
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.28, 0.4, 0.28] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen"
            ></motion.div>
            <motion.div
              animate={{ scale: [1.12, 1, 1.12], opacity: [0.18, 0.32, 0.18] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="pointer-events-none absolute bottom-1/4 right-1/4 h-[800px] w-[800px] rounded-full bg-cyan-600/20 blur-[150px] mix-blend-screen"
            ></motion.div>
          </>
        ) : null}
      </div>

      <div className="relative z-30 mx-auto flex w-full max-w-7xl flex-col items-center px-6 text-center">
        <motion.div {...badgeMotionProps} className={topBadgeClass}>
          <div className={topBadgeOverlayClass}></div>
          <div className={topBadgeDotClass}></div>
          <span className="text-zinc-300">
            新一代游戏管理操控平台
            <span className="ml-1 font-bold text-white">NEXUS Core</span>
          </span>
          <ChevronRight className={topBadgeChevronClass} />
        </motion.div>

        <motion.div {...headlineMotionProps} className="relative max-w-5xl">
          <h1 className="mb-8 text-6xl font-black leading-[1.1] tracking-tighter text-white md:text-[73px]">
            重新定义你的
            <br className="hidden md:block" />
            <span className="relative inline-block">
              {enableEnhancedEffects ? (
                <span className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-20 blur-2xl"></span>
              ) : null}
              <span className="relative bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                多人游戏架构
              </span>
            </span>
          </h1>
        </motion.div>

        <motion.p
          {...subtitleMotionProps}
          className="mb-12 max-w-3xl text-[19px] font-light leading-relaxed text-zinc-400"
        >
          基于 Ryzen 9 9950X 节点与上游 DDoS 防护打造，为社区服务器提供更稳定、
          更低延迟的在线体验，同时尽量不拖慢首页首屏加载。
        </motion.p>

        <motion.div
          {...ctaMotionProps}
          className="flex flex-col items-center gap-6 sm:flex-row"
        >
          <button className={primaryButtonClass}>
            <div className={primaryButtonOverlayClass}></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              立即部署 <Zap className={primaryButtonIconClass} />
            </span>
          </button>

          <button className={secondaryButtonClass}>
            <Terminal className="h-5 w-5" /> 打开控制台
          </button>
        </motion.div>

        <motion.div
          {...statsMotionProps}
          className="mt-24 grid w-full max-w-4xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-8"
        >
          <div className={statCardClass}>
            <div className="mb-1 text-3xl font-black tracking-tight text-white">99.99%</div>
            <div className="text-sm font-medium text-zinc-500">SLA 可用性目标</div>
          </div>
          <div className={statCardClass}>
            <div className="mb-1 text-3xl font-black tracking-tight text-white">&lt;15ms</div>
            <div className="text-sm font-medium text-zinc-500">平均网络延迟</div>
          </div>
          <div className={statCardClass}>
            <div className="mb-1 text-3xl font-black tracking-tight text-white">480Gbps</div>
            <div className="text-sm font-medium text-zinc-500">DDoS 防护带宽</div>
          </div>
          <div className={statCardClass}>
            <div className="mb-1 text-3xl font-black tracking-tight text-white">60s</div>
            <div className="text-sm font-medium text-zinc-500">平均开通时间</div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 h-32 bg-gradient-to-t from-zinc-950 to-transparent"></div>
    </section>
  );
}
