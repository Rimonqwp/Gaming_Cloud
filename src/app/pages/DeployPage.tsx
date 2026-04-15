import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Globe, Cpu, Server, Zap, Activity, HardDrive, Shield, MapPin, 
  Settings, Box, ChevronRight, CheckCircle2, SlidersHorizontal, Package,
  Wifi, Layers
} from "lucide-react";
import { usePerformanceMode } from "../hooks/usePerformanceMode";

// --- Original Data Constants ---
const gameHeroCopy: Record<string, { title: string, description: string }> = {
  Minecraft: {
    title: "搭建你的 Minecraft 服务器",
    description: "从地区、核心版本到资源方案一步选好，快速开服，适合生存服、插件服和模组整合包。",
  },
  Valheim: {
    title: "部署你的 Valheim 世界",
    description: "为小队冒险或长期社区选择稳定节点和资源配置，让联机探索更顺畅。",
  },
  Rust: {
    title: "准备你的 Rust 生存战场",
    description: "按玩家规模和地图负载选择配置，兼顾开荒、对抗和长期在线的稳定体验。",
  },
  ARK: {
    title: "开启你的 ARK 部落据点",
    description: "从部署地区到性能方案快速完成选择，更适合高负载地图和多人长期生存。",
  },
  CS2: {
    title: "快速配置你的 CS2 对战服务器",
    description: "选择低延迟节点与合适资源，让练枪、约战和社区比赛都保持流畅手感。",
  },
  Terraria: {
    title: "启动你的 Terraria 冒险房间",
    description: "用更轻量但稳定的配置快速上线，适合好友联机、创意地图和长期存档。",
  },
};

const minecraftHeroMessages = [
  "从地区、核心版本到资源方案一步选好，快速开服，适合生存服、插件服和模组整合包。",
  "專為 Minecraft 服主深度優化使用體驗。",
  "全新架構驅動，讓開服、管理與維運更流暢。",
  "從選配到部署，一套流程搞定你的 Minecraft 伺服器。",
  "為高品質社群服而生，兼顧性能、穩定與操作效率。",
];

const regionGroups = [
  {
    id: "china",
    label: "中国大陆",
    title: "中国大陆节点",
    description: "优先覆盖国内玩家，延迟更低，适合主服与核心成员长期在线。",
    nodes: [
      { city: "上海", description: "覆盖华东与长三角区域，适合核心玩家群体。", latency: "预计延迟 8-18ms" },
      { city: "广州", description: "连接华南与港澳方向，适合区域联机。", latency: "预计延迟 10-22ms" },
      { city: "北京", description: "兼顾华北覆盖，对北方玩家更友好。", latency: "预计延迟 12-25ms" },
    ],
  },
  {
    id: "asia",
    label: "亚洲",
    title: "亚洲节点",
    description: "面向香港、新加坡、日本等区域玩家，适合跨地区游戏社区。",
    nodes: [
      { city: "香港", description: "低延迟国际节点，适合连接东亚与东南亚玩家。", latency: "预计延迟 15-28ms" },
      { city: "新加坡", description: "东南亚核心节点，国际线路表现稳定。", latency: "预计延迟 35-50ms" },
      { city: "东京", description: "适合日本及东北亚玩家部署。", latency: "预计延迟 45-65ms" },
    ],
  },
  {
    id: "americas",
    label: "美洲",
    title: "美洲节点",
    description: "适合北美玩家，或需要服务美国西海岸与中部地区的服务器。",
    nodes: [
      { city: "洛杉矶", description: "美西热门入口节点，适合太平洋沿岸玩家。", latency: "预计延迟 130-155ms" },
      { city: "芝加哥", description: "适合覆盖美国中部与跨洲线路。", latency: "预计延迟 165-190ms" },
    ],
  },
  {
    id: "europe",
    label: "欧洲",
    title: "欧洲节点",
    description: "适合欧洲社区，或全球多地区混合部署场景。",
    nodes: [
      { city: "法兰克福", description: "欧洲骨干节点，适合覆盖中西欧地区。", latency: "预计延迟 180-205ms" },
      { city: "阿姆斯特丹", description: "适合欧洲多国访问与国际互联。", latency: "预计延迟 185-210ms" },
    ],
  },
];

const premiumCpuOptions = [
  { id: "epyc-7b13", model: "AMD EPYC 7B13", family: "EPYC Milan", score: "8420", turboClock: "3.65 GHz", details: "高主频，适合高并发游戏服。" },
  { id: "epyc-9654", model: "AMD EPYC 9654", family: "EPYC Genoa", score: "9180", turboClock: "3.70 GHz", details: "新一代高核心平台，适合大型集群。" },
  { id: "xeon-gold-6338", model: "Intel Xeon Gold 6338", family: "Xeon Scalable", score: "7630", turboClock: "3.20 GHz", details: "企业级均衡方案，兼顾性能与稳定。" },
  { id: "xeon-8375c", model: "Intel Xeon 8375C", family: "Xeon Platinum", score: "8010", turboClock: "3.50 GHz", details: "云上常见高规格型号，适合大型实例。" },
  { id: "ryzen-7950x", model: "AMD Ryzen 9 7950X", family: "Ryzen 7000", score: "9650", turboClock: "5.70 GHz", details: "高频低延迟，适合高 Tick 场景。" },
  { id: "xeon-e2388g", model: "Intel Xeon E-2388G", family: "Xeon E", score: "7060", turboClock: "5.10 GHz", details: "中小型实例常见方案，单核表现不错。" },
];

const threadPoolOptions = [
  { id: "pool-s", model: "A1", family: "轻便实用", score: "5820", turboClock: "3.40 GHz", details: "适合测试服、好友联机和轻量地图，开服更轻快。" },
  { id: "pool-m", model: "P1", family: "均衡流畅", score: "6480", turboClock: "3.70 GHz", details: "适合日常开服和轻中度负载，体验与预算更平衡。" },
  { id: "pool-l", model: "N1", family: "高频增强", score: "7110", turboClock: "4.10 GHz", details: "适合在线更稳定的常规社区服，整体表现更从容。" },
];

const processorModeOptions = [
  {
    id: "premium",
    label: "高端 CPU",
    badge: "公开型号",
    description: "展示具体底层型号，整体更偏高频、高规格和独享感，适合正式运营的主服。",
  },
  {
    id: "pool",
    label: "线程优化",
    badge: "隐藏型号",
    description: "不展示底层 CPU 型号，只展示性能分和睿频，更适合预算优先的轻量或过渡场景。",
  },
];

const plans = [
  { id: "c2m4", name: "C2M4 标准型", cpu: 2, memory: 4, storage: 80, price: 12 },
  { id: "c4m8", name: "C4M8 性能型", cpu: 4, memory: 8, storage: 160, price: 24 },
  { id: "c8m16", name: "C8M16 企业型", cpu: 8, memory: 16, storage: 320, price: 48 },
  { id: "c16m32", name: "C16M32 旗舰型", cpu: 16, memory: 32, storage: 640, price: 96 },
];

const planMeta: Record<string, any> = {
  c2m4: {
    summary: "适合小型私服、好友联机和轻量生存地图。",
    bestFor: "2-6 名玩家",
    traffic: "包含 3TB 月流量",
    backups: "2 份备份",
  },
  c4m8: {
    summary: "兼顾流畅度与成本，适合日常开服和常规模组包。",
    bestFor: "6-18 名玩家",
    traffic: "包含 5TB 月流量",
    backups: "4 份备份",
  },
  c8m16: {
    summary: "适合插件较多、在线更稳定的中大型社区服。",
    bestFor: "18-40 名玩家",
    traffic: "包含 8TB 月流量",
    backups: "6 份备份",
  },
  c16m32: {
    summary: "面向大型模组整合包、高并发活动服与集群节点。",
    bestFor: "40+ 名玩家",
    traffic: "包含 12TB 月流量",
    backups: "10 份备份",
  },
};

const billingCycleOptions = [
  { id: "monthly", label: "月付", multiplier: 1, totalLabel: "每月总价", description: "按月结算" },
  { id: "quarterly", label: "季付", multiplier: 3, totalLabel: "每季总价", description: "按季结算" },
  { id: "yearly", label: "年付", multiplier: 12, totalLabel: "每年总价", description: "按年结算" },
];

const networkOptions = [
  {
    id: "fixed",
    label: "固定网络",
    description: "适合常规开服。你可以按需增加附加端口，用于地图服、语音桥接和附加服务。",
  },
  {
    id: "vip",
    label: "鸡蛋云 VIP",
    description: "更适合长期运营社区服，提供更完整的网络增强能力和更多高级功能权限。",
  },
];

const vipFeatures = [
  "可视化拖拽式网络拓扑",
  "手动关联多台服务器网络",
  "自动连接关联节点",
  "活动服临时端口池",
  "专属网络工单通道",
  "高级访问控制功能",
];

const environmentModeOptions = [
  {
    id: "skip",
    label: "暂不选择",
    description: "先完成其他配置，环境可以稍后再选。",
  },
  {
    id: "select",
    label: "选择环境",
    description: "现在就指定游戏环境、核心类型和版本。",
  },
];

const environmentCatalog: Record<string, any> = {
  java: {
    label: "Java",
    description: "适合 Java 版 Minecraft，支持插件服、模组服和代理服。",
    categories: {
      plugin: {
        label: "插件服",
        description: "适合生存服、小游戏服和传统插件生态。",
        cores: [
          { id: "paper", label: "Paper", note: "当前最常见的插件服核心。", versions: ["1.20.1", "1.20.4", "1.21", "1.21.1"] },
          { id: "spigot", label: "Spigot", note: "兼容性稳定，适合传统插件环境。", versions: ["1.20.1", "1.20.4", "1.21"] },
          { id: "purpur", label: "Purpur", note: "在 Paper 基础上提供更多玩法配置。", versions: ["1.20.1", "1.20.4", "1.21.1"] },
          { id: "folia", label: "Folia", note: "更适合高并发与多区域 Tick 场景。", versions: ["1.20.6", "1.21", "1.21.1"] },
          { id: "vanilla-java", label: "Vanilla", note: "原版官方体验，适合纯净生存。", versions: ["1.20.1", "1.20.4", "1.21.1"] },
        ],
      },
      mod: {
        label: "模组服",
        description: "适合整合包、科技魔法模组和自定义玩法扩展。",
        cores: [
          { id: "forge", label: "Forge", note: "经典模组生态，兼容大量老牌模组。", versions: ["1.18.2", "1.19.2", "1.20.1"] },
          { id: "fabric", label: "Fabric", note: "轻量灵活，适合新版本模组。", versions: ["1.20.1", "1.20.4", "1.21.1"] },
          { id: "neoforge", label: "NeoForge", note: "新一代模组生态，适合较新的大型整合包。", versions: ["1.20.1", "1.20.6", "1.21.1"] },
          { id: "quilt", label: "Quilt", note: "更开放的轻量模组方案。", versions: ["1.20.1", "1.20.4", "1.21"] },
        ],
      },
      proxy: {
        label: "BC 代理服",
        description: "适合多节点互联、大厅服和分服网络结构。",
        cores: [
          { id: "velocity", label: "Velocity", note: "性能优秀，适合现代代理网络。", versions: ["3.2.x", "3.3.x", "3.4.x"] },
          { id: "waterfall", label: "Waterfall", note: "经典 Bungee 系代理分支。", versions: ["1.20", "1.20.4", "1.21"] },
          { id: "bungeecord", label: "BungeeCord", note: "传统代理核心，兼容老项目。", versions: ["1.19", "1.20", "1.21"] },
        ],
      },
    },
  },
  bedrock: {
    label: "基岩版",
    description: "适合 Bedrock 玩家，兼顾原版与社区核心。",
    cores: [
      { id: "bedrock-official", label: "官方基岩版", note: "原版体验，适合常规联机。", versions: ["1.20.80", "1.21.0", "1.21.20"] },
      { id: "pocketmine", label: "PocketMine-MP", note: "轻量插件生态，适合小型社群服。", versions: ["5.16", "5.19", "5.21"] },
      { id: "powernukkitx", label: "PowerNukkitX", note: "扩展性更强，适合定制玩法。", versions: ["1.20.0-r1", "1.20.30-r1", "1.20.60-r1"] },
    ],
  },
  custom: {
    label: "自定义",
    description: "适合上传自己的程序包、镜像或自定义启动命令。",
    cores: [
      { id: "custom-jar", label: "上传 JAR 启动", note: "直接上传服务端文件并指定 Java 版本。", versions: ["Java 17", "Java 21", "Java 22"] },
      { id: "custom-docker", label: "自定义 Docker 镜像", note: "适合已有镜像仓库和容器部署流程。", versions: ["Ubuntu 22.04", "Debian 12", "Alpine"] },
      { id: "custom-startup", label: "自定义启动命令", note: "适合高级用户接管整个启动流程。", versions: ["标准容器", "高级容器", "兼容模式"] },
    ],
  },
};

function HeroDescriptionTicker({
  selectedGame,
  fallbackDescription,
  allowHeavyMotion,
}: {
  selectedGame: string;
  fallbackDescription: string;
  allowHeavyMotion: boolean;
}) {
  const [heroMessageIndex, setHeroMessageIndex] = useState(0);
  const [typedHeroText, setTypedHeroText] = useState("");
  const [isDeletingHeroText, setIsDeletingHeroText] = useState(false);

  useEffect(() => {
    if (selectedGame !== "Minecraft" || !allowHeavyMotion) {
      setHeroMessageIndex(0);
      setTypedHeroText("");
      setIsDeletingHeroText(false);
      return;
    }

    const currentMessage = minecraftHeroMessages[heroMessageIndex];
    const isFullyTyped = typedHeroText === currentMessage;
    const isFullyDeleted = typedHeroText.length === 0;
    const delay = isFullyTyped ? 1800 : isDeletingHeroText ? 28 : 52;

    const timer = window.setTimeout(() => {
      if (isFullyTyped && !isDeletingHeroText) {
        setIsDeletingHeroText(true);
        return;
      }

      if (isDeletingHeroText && isFullyDeleted) {
        setIsDeletingHeroText(false);
        setHeroMessageIndex((currentIndex) => (currentIndex + 1) % minecraftHeroMessages.length);
        return;
      }

      const nextLength = typedHeroText.length + (isDeletingHeroText ? -1 : 1);
      setTypedHeroText(currentMessage.slice(0, nextLength));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [allowHeavyMotion, heroMessageIndex, isDeletingHeroText, selectedGame, typedHeroText]);

  const animateTicker = selectedGame === "Minecraft" && allowHeavyMotion;
  const heroDescription = animateTicker
    ? typedHeroText || minecraftHeroMessages[0].slice(0, 1)
    : fallbackDescription;
  const heroDescriptionTitle = animateTicker
    ? minecraftHeroMessages[heroMessageIndex]
    : fallbackDescription;

  return (
    <p
      className="w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-base font-light text-zinc-400 md:max-w-4xl md:text-lg"
      title={heroDescriptionTitle}
    >
      <span className="inline-block align-middle">{heroDescription}</span>
      {animateTicker ? (
        <span className="ml-1 inline-block h-[1.1em] w-px animate-pulse bg-emerald-400 align-middle" />
      ) : null}
    </p>
  );
}

// --- Component ---
export function DeployPage() {
  const { allowHeavyMotion } = usePerformanceMode();
  const [selectedGame, setSelectedGame] = useState("Minecraft");
  const [selectedRegion, setSelectedRegion] = useState("asia");
  const [selectedNodeByRegion, setSelectedNodeByRegion] = useState<Record<string, string>>(() =>
    Object.fromEntries(regionGroups.map((group) => [group.id, group.nodes[0]?.city ?? ""])),
  );
  
  const [selectedProcessorMode, setSelectedProcessorMode] = useState<"premium" | "pool">("premium");
  const [selectedCpuId, setSelectedCpuId] = useState("epyc-7b13");
  const [selectedThreadPoolId, setSelectedThreadPoolId] = useState("pool-m");
  const [selectedMode, setSelectedMode] = useState<"recommended" | "custom">("recommended");
  const [selectedPlanId, setSelectedPlanId] = useState("c4m8");
  const [selectedBillingCycle, setSelectedBillingCycle] = useState("monthly");
  
  const [customConfig, setCustomConfig] = useState({
    cpu: 4,
    memory: 8,
    storage: 160,
    backups: 4,
    traffic: 5,
  });

  const [selectedNetworkMode, setSelectedNetworkMode] = useState("fixed");
  const [fixedPortCount, setFixedPortCount] = useState(2);

  const [selectedEnvironmentMode, setSelectedEnvironmentMode] = useState("skip");
  const [selectedEnvironmentFamily, setSelectedEnvironmentFamily] = useState("java");
  const [selectedJavaCategory, setSelectedJavaCategory] = useState("plugin");
  const [selectedEnvironmentCoreId, setSelectedEnvironmentCoreId] = useState("paper");
  const [selectedEnvironmentVersion, setSelectedEnvironmentVersion] = useState("1.21.1");

  // Computed Values
  const activeGameHero = gameHeroCopy[selectedGame] ?? gameHeroCopy.Minecraft;
  const activeRegion = regionGroups.find((g) => g.id === selectedRegion) ?? regionGroups[0];
  const activeNodeCity = selectedNodeByRegion[selectedRegion];
  const activeNode = activeRegion.nodes.find((n) => n.city === activeNodeCity) ?? activeRegion.nodes[0];
  const activeProcessorOptions = selectedProcessorMode === "premium" ? premiumCpuOptions : threadPoolOptions;
  const selectedProcessor =
    selectedProcessorMode === "premium"
      ? premiumCpuOptions.find((c) => c.id === selectedCpuId) ?? premiumCpuOptions[0]
      : threadPoolOptions.find((c) => c.id === selectedThreadPoolId) ?? threadPoolOptions[0];
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? plans[1];
  const activeBillingCycle = billingCycleOptions.find((b) => b.id === selectedBillingCycle) ?? billingCycleOptions[0];
  // Environment Computed
  const activeEnvironmentFamily = environmentCatalog[selectedEnvironmentFamily] ?? environmentCatalog.java;
  const isJava = selectedEnvironmentFamily === "java";
  const activeJavaCategory = isJava ? activeEnvironmentFamily.categories[selectedJavaCategory] : null;
  const activeEnvironmentCores = isJava ? activeJavaCategory?.cores ?? [] : activeEnvironmentFamily.cores ?? [];
  const selectedEnvironmentCore = activeEnvironmentCores.find((c: any) => c.id === selectedEnvironmentCoreId) ?? activeEnvironmentCores[0];
  const environmentVersions = selectedEnvironmentCore?.versions ?? [];
  
  const environmentSummary = selectedEnvironmentMode === "skip" 
    ? "暂不选择" 
    : isJava 
      ? `${activeEnvironmentFamily.label} / ${activeJavaCategory?.label} / ${selectedEnvironmentCore?.label} / ${selectedEnvironmentVersion}`
      : `${activeEnvironmentFamily.label} / ${selectedEnvironmentCore?.label} / ${selectedEnvironmentVersion}`;
  const hasSelectedEnvironmentFamily = Boolean(selectedEnvironmentFamily);
  const hasSelectedJavaCategory = Boolean(selectedJavaCategory);
  const environmentIntro =
    selectedEnvironmentFamily === "java"
      ? activeJavaCategory?.description ?? activeEnvironmentFamily.description
      : activeEnvironmentFamily.description;
  const sectionShellClass = allowHeavyMotion
    ? "bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
    : "bg-[#0a0a0c]/94 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden";
  const summaryShellClass = allowHeavyMotion
    ? "bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col md:max-h-[calc(100vh-9rem)]"
    : "bg-[#0a0a0c]/94 border border-white/10 rounded-[2rem] p-6 shadow-xl flex flex-col md:max-h-[calc(100vh-9rem)]";
  const billingMenuClass = allowHeavyMotion
    ? "absolute right-0 top-[calc(100%+10px)] z-20 min-w-[144px] rounded-2xl border border-white/10 bg-[#08080A] p-1.5 shadow-2xl"
    : "absolute right-0 top-[calc(100%+10px)] z-20 min-w-[144px] rounded-2xl border border-white/10 bg-[#08080A] p-1.5 shadow-xl";

  // Pricing Logic
  const customPrice = customConfig.cpu * 4 + customConfig.memory * 1.5 + customConfig.storage * 0.05;
  const basePrice = selectedMode === "custom" ? customPrice : selectedPlan.price;
  const totalPrice = (basePrice * activeBillingCycle.multiplier).toFixed(2);
  const summary = selectedMode === "custom"
    ? {
        tier: "自定义配置",
        resources: `${customConfig.cpu} 核 vCPU / ${customConfig.memory}GB / ${customConfig.storage}GB NVMe`,
        backups: `${customConfig.backups} 份备份`,
        traffic: `${customConfig.traffic}TB 月流量`,
        network: selectedNetworkMode === "fixed" ? `固定网络 / 附加 ${fixedPortCount} 个端口` : "鸡蛋云 VIP 网络",
        environment: environmentSummary,
      }
    : {
        tier: selectedPlan.name,
        resources: `${selectedPlan.cpu} 核 vCPU / ${selectedPlan.memory}GB / ${selectedPlan.storage}GB NVMe`,
        backups: planMeta[selectedPlan.id]?.backups ?? "4 份备份",
        traffic: planMeta[selectedPlan.id]?.traffic ?? "包含 5TB 月流量",
        network: selectedNetworkMode === "fixed" ? `固定网络 / 附加 ${fixedPortCount} 个端口` : "鸡蛋云 VIP 网络",
        environment: environmentSummary,
      };
  // Handlers
  const handleNodeChange = (regionId: string, city: string) => {
    setSelectedNodeByRegion((prev) => ({ ...prev, [regionId]: city }));
  };

  const handleCustomChange = (field: keyof typeof customConfig) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomConfig((prev) => ({ ...prev, [field]: Number(event.target.value) }));
  };

  const handleEnvironmentFamilyChange = (familyId: string) => {
    setSelectedEnvironmentFamily(familyId);
    const nextFamily = environmentCatalog[familyId];
    if (familyId === "java") {
      setSelectedJavaCategory("plugin");
      const defaultCore = nextFamily.categories.plugin.cores[0];
      setSelectedEnvironmentCoreId(defaultCore.id);
      setSelectedEnvironmentVersion(defaultCore.versions[0]);
    } else {
      const defaultCore = nextFamily.cores[0];
      setSelectedEnvironmentCoreId(defaultCore.id);
      setSelectedEnvironmentVersion(defaultCore.versions[0]);
    }
  };

  const handleJavaCategoryChange = (categoryId: string) => {
    setSelectedJavaCategory(categoryId);
    const defaultCore = environmentCatalog.java.categories[categoryId].cores[0];
    setSelectedEnvironmentCoreId(defaultCore.id);
    setSelectedEnvironmentVersion(defaultCore.versions[0]);
  };

  const handleEnvironmentCoreChange = (coreId: string) => {
    const nextCore = activeEnvironmentCores.find((c: any) => c.id === coreId) ?? activeEnvironmentCores[0];
    setSelectedEnvironmentCoreId(coreId);
    setSelectedEnvironmentVersion(nextCore.versions[0]);
  };

  return (
    <div className="bg-[#08080A] min-h-screen font-sans text-slate-200 selection:bg-emerald-500/30 overflow-x-clip pt-28 pb-32 sm:pt-32">

      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col items-center justify-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Box className="w-3.5 h-3.5" /> 跨時代原創控制面板 v1.0
            </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            {activeGameHero.title.split(selectedGame)[0]}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mx-2">{selectedGame}</span>
            {activeGameHero.title.split(selectedGame)[1]}
          </h1>
          <HeroDescriptionTicker
            selectedGame={selectedGame}
            fallbackDescription={activeGameHero.description}
            allowHeavyMotion={allowHeavyMotion}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_320px] md:items-start lg:grid-cols-[minmax(0,1fr)_380px]">
        
        {/* Left Side: Wizard Configuration */}
        <div className="flex flex-col gap-8">
          
          {/* Section 1: Region */}
          <section id="plans-pricing" className={sectionShellClass}>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white tracking-tight">部署地区</h2>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 bg-black/40 p-1.5 rounded-2xl border border-white/5 w-fit">
              {regionGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedRegion(group.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    selectedRegion === group.id 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>

            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 mb-4">
              <h3 className="text-lg font-bold text-white mb-1">{activeRegion.title}</h3>
              <p className="text-sm text-zinc-400">{activeRegion.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activeRegion.nodes.map((node) => (
                <button
                  key={node.city}
                  onClick={() => handleNodeChange(activeRegion.id, node.city)}
                  className={`relative p-4 rounded-2xl border text-left transition-all ${
                    activeNodeCity === node.city 
                    ? "bg-emerald-900/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
                    : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {activeNodeCity === node.city && (
                    <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-500" />
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className={`w-4 h-4 ${activeNodeCity === node.city ? 'text-emerald-400' : 'text-zinc-500'}`} />
                    <span className="font-bold text-white">{node.city}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-3 min-h-[32px]">{node.description}</p>
                  <div className={`text-xs font-mono font-bold ${activeNodeCity === node.city ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {node.latency}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Section 2: CPU */}
          <section className={sectionShellClass}>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5 mb-6">
              <div className="flex items-center gap-3 min-w-0">
                <Cpu className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">处理器方案</h2>
                  <p className="text-sm text-zinc-400 mt-1">高端 CPU 显示型号，线程池只看性能分和睿频。</p>
                </div>
              </div>

              <div className="w-full xl:w-auto">
                <div className="flex flex-wrap xl:justify-end gap-2">
                  {processorModeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedProcessorMode(option.id as "premium" | "pool")}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        selectedProcessorMode === option.id
                          ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProcessorOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    selectedProcessorMode === "premium" ? setSelectedCpuId(option.id) : setSelectedThreadPoolId(option.id)
                  }
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col h-full ${
                    (selectedProcessorMode === "premium" ? selectedCpuId : selectedThreadPoolId) === option.id 
                    ? "bg-emerald-900/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
                    : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-white text-sm">{option.model}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-3 border border-emerald-500/20 w-fit px-2 py-0.5 rounded">
                    {option.family}
                  </div>
                  
                  <div className="space-y-2 w-full mt-auto">
                    <div className="flex items-center justify-between text-xs bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                      <div className="flex items-center gap-1.5 text-zinc-400"><Activity className="w-3.5 h-3.5" /> 性能分</div>
                      <span className="font-mono text-white font-bold">{option.score}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                      <div className="flex items-center gap-1.5 text-zinc-400"><Zap className="w-3.5 h-3.5" /> 睿频</div>
                      <span className="font-mono text-white font-bold">{option.turboClock}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Section 3: Resources / Plans */}
          <section className={sectionShellClass}>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div className="flex items-center gap-3">
                <Server className="w-6 h-6 text-emerald-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">计算资源方案</h2>
                  <p className="text-sm text-zinc-400 mt-1">先选推荐配置，再按需要切换到自定义模式。</p>
                </div>
              </div>
              
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
                <button
                  onClick={() => setSelectedMode("recommended")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedMode === "recommended" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}
                >
                  推荐配置
                </button>
                <button
                  onClick={() => setSelectedMode("custom")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${selectedMode === "custom" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}
                >
                  <SlidersHorizontal className="w-4 h-4" /> 自定义配置
                </button>
              </div>
            </div>

            {selectedMode === "recommended" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan) => {
                  const meta = planMeta[plan.id];
                  const isActive = selectedPlanId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`group relative p-5 rounded-2xl border text-left transition-all overflow-hidden flex flex-col ${
                        isActive 
                        ? "bg-emerald-900/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)]" 
                        : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      {isActive && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[50px] rounded-full pointer-events-none"></div>}
                      
                      <h4 className="text-lg font-bold text-white mb-1 relative z-10">{plan.name}</h4>
                      <p className="text-xs text-zinc-400 mb-5 flex-1 relative z-10">{meta.summary}</p>
                      
                      <div className="space-y-2 mb-6 relative z-10">
                        <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                          <span className="text-zinc-500">vCPU</span>
                          <span className="text-white font-bold">{plan.cpu} 核</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                          <span className="text-zinc-500">内存</span>
                          <span className="text-white font-bold">{plan.memory} GB</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                          <span className="text-zinc-500">存储</span>
                          <span className="text-white font-bold">{plan.storage} GB</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pb-1">
                          <span className="text-zinc-500">备份</span>
                          <span className="text-white font-bold">{meta.backups}</span>
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-white/10 flex items-end justify-between relative z-10">
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">适合场景</div>
                          <div className="text-xs text-emerald-400 font-bold">{meta.bestFor}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-white">${plan.price}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-black/30 border border-white/10 rounded-2xl p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Custom Sliders */}
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-white flex items-center gap-2"><Cpu className="w-4 h-4 text-emerald-500"/> vCPU 核心</label>
                        <span className="text-emerald-400 font-mono font-bold">{customConfig.cpu} 核</span>
                      </div>
                      <input type="range" min="2" max="16" step="1" value={customConfig.cpu} onChange={handleCustomChange('cpu')} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-white flex items-center gap-2"><Box className="w-4 h-4 text-emerald-500"/> 内存 (RAM)</label>
                        <span className="text-emerald-400 font-mono font-bold">{customConfig.memory} GB</span>
                      </div>
                      <input type="range" min="4" max="32" step="2" value={customConfig.memory} onChange={handleCustomChange('memory')} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-white flex items-center gap-2"><HardDrive className="w-4 h-4 text-emerald-500"/> 存储空间</label>
                        <span className="text-emerald-400 font-mono font-bold">{customConfig.storage} GB</span>
                      </div>
                      <input type="range" min="80" max="640" step="20" value={customConfig.storage} onChange={handleCustomChange('storage')} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-white flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-500"/> 备份数量</label>
                        <span className="text-emerald-400 font-mono font-bold">{customConfig.backups} 份</span>
                      </div>
                      <input type="range" min="1" max="10" step="1" value={customConfig.backups} onChange={handleCustomChange('backups')} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500"/> 月流量</label>
                        <span className="text-emerald-400 font-mono font-bold">{customConfig.traffic} TB</span>
                      </div>
                      <input type="range" min="1" max="20" step="1" value={customConfig.traffic} onChange={handleCustomChange('traffic')} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400" />
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col justify-center items-center text-center mt-6">
                      <div className="text-emerald-400 font-mono font-bold text-lg">
                        动态计费 ${customPrice.toFixed(2)} / 月
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </section>

          {/* Section 4: Network */}
          <section className={sectionShellClass}>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
            <div className="flex items-center gap-3 mb-6">
              <Wifi className="w-6 h-6 text-emerald-400" />
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">网络与访问设置</h2>
                <p className="text-sm text-zinc-400 mt-1">选择标准固定网络，或升级到增强型的鸡蛋云 VIP 网络。</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {networkOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedNetworkMode(opt.id)}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    selectedNetworkMode === opt.id 
                    ? "bg-emerald-900/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
                    : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {selectedNetworkMode === opt.id && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    <span className="font-bold text-white">{opt.label}</span>
                  </div>
                  <p className="text-sm text-zinc-400">{opt.description}</p>
                </button>
              ))}
            </div>

            {selectedNetworkMode === "vip" && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2"><Settings className="w-4 h-4"/> VIP 专属网络功能</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vipFeatures.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedNetworkMode === "fixed" && (
              <div className="flex items-center justify-between bg-black/30 border border-white/10 rounded-2xl p-5">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">附加端口</h4>
                  <p className="text-xs text-zinc-400">用于地图服、语音桥接和其他附加服务。</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-400 font-mono">{fixedPortCount} 个</span>
                  <div className="flex gap-2">
                    <button onClick={() => setFixedPortCount(Math.max(0, fixedPortCount - 1))} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20">-</button>
                    <button onClick={() => setFixedPortCount(fixedPortCount + 1)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20">+</button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Section 5: Environment */}
          <section className={sectionShellClass}>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
            <div className="flex items-center gap-3 mb-6">
              <Layers className="w-6 h-6 text-emerald-400" />
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">游戏环境</h2>
                <p className="text-sm text-zinc-400 mt-1">指定游戏环境、核心类型和版本</p>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              {environmentModeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedEnvironmentMode(opt.id)}
                  className={`flex-1 rounded-2xl border p-4 text-center transition-all ${
                    selectedEnvironmentMode === opt.id
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_10px_24px_rgba(16,185,129,0.12)]"
                      : "border-white/5 bg-black/30 text-zinc-400 hover:border-emerald-500/20 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="mb-1 font-bold">{opt.label}</div>
                  <div className="text-xs opacity-80">{opt.description}</div>
                </button>
              ))}
            </div>

            {selectedEnvironmentMode === "select" ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-emerald-500/12 bg-black/20 p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-black">
                        第一步
                      </span>
                      <span className="text-sm font-semibold text-white">选择环境类型</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      {Object.entries(environmentCatalog).map(([key, family]) => {
                        const isActive = selectedEnvironmentFamily === key;

                        return (
                          <button
                            key={key}
                            onClick={() => handleEnvironmentFamilyChange(key)}
                            className={`rounded-2xl border p-4 text-left transition-all ${
                              isActive
                                ? "border-emerald-500 bg-emerald-500/10 shadow-[0_10px_24px_rgba(16,185,129,0.12)] -translate-y-0.5"
                                : "border-transparent bg-white/5 hover:border-emerald-500/20 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-bold text-white">{family.label}</div>
                              {isActive ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : null}
                            </div>
                            <p className="mt-2 text-xs leading-5 text-zinc-400">{family.description}</p>
                          </button>
                        );
                      })}
                    </div>

                    {isJava ? (
                      <div className="rounded-xl bg-black/30 px-4 py-4">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-emerald-300">
                            第二步
                          </span>
                          <span className="text-sm font-semibold text-white">选择 Java 服务器类型</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          {Object.entries(environmentCatalog.java.categories).map(([key, cat]: [string, any]) => {
                            const isActive = selectedJavaCategory === key;

                            return (
                              <button
                                key={key}
                                onClick={() => handleJavaCategoryChange(key)}
                                className={`rounded-xl border p-3.5 text-left transition-all ${
                                  isActive
                                    ? "border-emerald-500/40 bg-emerald-500/10 shadow-md"
                                    : "border-transparent bg-white/5 hover:border-emerald-500/20 hover:bg-white/10"
                                }`}
                              >
                                <div className="text-sm font-bold text-white">{cat.label}</div>
                                <p className="mt-2 text-xs leading-5 text-zinc-400">{cat.description}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : hasSelectedEnvironmentFamily ? (
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-emerald-300">
                          第二步
                        </span>
                        <span className="text-sm font-semibold text-white">选择核心与版本</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {hasSelectedEnvironmentFamily && (selectedEnvironmentFamily !== "java" || hasSelectedJavaCategory) ? (
                  <div className="rounded-2xl border border-emerald-500/12 bg-black/20 p-5">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-bold text-white">选择核心与版本</h3>
                      <p className="text-sm text-zinc-400">{environmentIntro}</p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {activeEnvironmentCores.map((core: any) => {
                        const isActive = core.id === selectedEnvironmentCore?.id;

                        return (
                          <button
                            key={core.id}
                            onClick={() => handleEnvironmentCoreChange(core.id)}
                            className={`rounded-2xl border p-4 text-left transition-all ${
                              isActive
                                ? "border-emerald-500 bg-emerald-500/10 shadow-[0_10px_24px_rgba(16,185,129,0.12)] -translate-y-0.5"
                                : "border-transparent bg-white/5 hover:border-emerald-500/20 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-bold text-white">{core.label}</div>
                              {isActive ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : null}
                            </div>
                            <p className="mt-2 text-xs leading-5 text-zinc-400">{core.note}</p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 rounded-xl bg-black/30 px-4 py-4">
                      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">版本选择</div>
                          <div className="text-xs text-zinc-500">按当前核心显示常用版本，方便直接部署。</div>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                          当前：{selectedEnvironmentVersion}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {environmentVersions.map((version: string) => {
                          const isActive = version === selectedEnvironmentVersion;

                          return (
                            <button
                              key={version}
                              onClick={() => setSelectedEnvironmentVersion(version)}
                              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                isActive
                                  ? "bg-emerald-500 text-black shadow-sm"
                                  : "bg-white text-zinc-600 hover:bg-emerald-500/10 hover:text-emerald-300"
                              }`}
                            >
                              {version}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-emerald-500/20 bg-black/20 px-4 py-4 text-sm text-zinc-400">
                暂不选择环境时，后续可以在控制台里继续安装游戏核心、上传自定义程序包或切换运行版本。
              </div>
            )}
          </section>
        </div>

        {/* Right Side: Floating Summary Panel */}
        <div className="self-start md:sticky md:top-32">
          <div className={summaryShellClass}>
            
            <div className="mb-8 flex items-center justify-between gap-4">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                配置总览
              </h3>

              <details className="group relative shrink-0">
                <summary className="flex list-none cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-[#08080A] px-4 py-2 text-sm font-bold text-white transition-all hover:border-emerald-500/30 [&::-webkit-details-marker]:hidden">
                  {activeBillingCycle.label}
                  <ChevronRight className="w-4 h-4 rotate-90 text-emerald-400 transition-transform group-open:rotate-[270deg]" />
                </summary>

                <div className={billingMenuClass}>
                  {billingCycleOptions.map((cycle) => (
                    <button
                      key={cycle.id}
                      onClick={(event) => {
                        setSelectedBillingCycle(cycle.id);
                        event.currentTarget.closest("details")?.removeAttribute("open");
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition-all ${
                        selectedBillingCycle === cycle.id
                          ? "bg-emerald-500 text-black"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                      type="button"
                    >
                      <span>{cycle.label}</span>
                      <span className={`text-[11px] ${selectedBillingCycle === cycle.id ? "text-black/70" : "text-zinc-500"}`}>
                        {cycle.description}
                      </span>
                    </button>
                  ))}
                </div>
              </details>
            </div>

            <div className="mb-8 flex-1 min-h-0 rounded-2xl border border-white/5 bg-[#08080A] p-4 md:overflow-y-auto">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/5 py-1.5">
                  <span className="text-xs text-zinc-500">套餐</span>
                  <span className="text-xs font-semibold text-white">{summary.tier}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-white/5 py-1.5">
                  <span className="text-xs text-zinc-500">环境</span>
                  <span className="max-w-[190px] text-right text-xs font-semibold text-white">{summary.environment}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 py-1.5">
                  <span className="text-xs text-zinc-500">CPU</span>
                  <span className="text-xs font-semibold text-white">{selectedProcessor.model}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-white/5 py-1.5">
                  <span className="text-xs text-zinc-500">资源</span>
                  <span className="max-w-[190px] text-right text-xs font-semibold text-white">{summary.resources}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 py-1.5">
                  <span className="text-xs text-zinc-500">地区</span>
                  <span className="text-xs font-semibold text-white">{activeNode ? `${activeNode.city} / ${activeRegion.label}` : activeRegion.label}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 py-1.5">
                  <span className="text-xs text-zinc-500">备份</span>
                  <span className="text-xs font-bold text-emerald-400">{summary.backups}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 py-1.5">
                  <span className="text-xs text-zinc-500">流量</span>
                  <span className="text-xs font-bold text-emerald-400">{summary.traffic}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-zinc-500">网络方案</span>
                  <span className="max-w-[190px] text-right text-xs font-bold text-emerald-400">{summary.network}</span>
                </div>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-[#08080A] rounded-2xl p-5 border border-white/5 mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-zinc-400 text-sm font-medium">
                  {activeBillingCycle.totalLabel}
                </span>
                <div className="text-right">
                  <span className="text-3xl font-black text-white">${totalPrice}</span>
                  <span className="text-zinc-500 text-sm ml-1">USD</span>
                </div>
              </div>
              {selectedBillingCycle !== "monthly" && (
                <div className="text-right text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded w-fit ml-auto">
                  已套用长期优惠
                </div>
              )}
            </div>

            <button className="w-full py-4 rounded-xl font-black text-lg transition-all bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2">
              前往结账 <ChevronRight className="w-5 h-5" />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
