import { useState } from "react";
import { motion } from "motion/react";
import { Cpu, Database, Edit2, HardDrive, MemoryStick, Network, Package, Plus, Save, Settings2, Trash2 } from "lucide-react";

type BillingCustomPricing = {
  cpuPerCore: number;
  ramPerGb: number;
  storagePer10Gb: number;
  trafficPerTb: number;
  backupPerSlot: number;
};

type BillingCpuProfile = {
  id: string;
  name: string;
  tier: string;
  summary: string;
  customPricing: BillingCustomPricing;
};

type BillingPlan = {
  id: string;
  name: string;
  cpu: number;
  ram: number;
  storage: number;
  traffic: number;
  backups: number;
  basePrice: number;
};

type BillingGame = {
  id: string;
  name: string;
  shortDesc: string;
  icon: string;
  coverImage: string;
  cpuProfiles: BillingCpuProfile[];
  plans: BillingPlan[];
};

const INITIAL_BILLING_GAMES: BillingGame[] = [
  {
    id: "minecraft",
    name: "Minecraft Server",
    shortDesc: "Vanilla, Spigot, Paper & Modpacks",
    icon: "⛏️",
    coverImage: "https://images.unsplash.com/photo-1605333556488-ce9e58832a21?q=80&w=2000&auto=format&fit=crop",
    cpuProfiles: [
      {
        id: "mc-7950x3d",
        name: "AMD Ryzen 9 7950X3D",
        tier: "PvP Premium",
        summary: "Best for high-TPS survival worlds and heavy modpacks.",
        customPricing: {
          cpuPerCore: 3.5,
          ramPerGb: 1.8,
          storagePer10Gb: 0.9,
          trafficPerTb: 5.0,
          backupPerSlot: 1.2,
        },
      },
      {
        id: "mc-9374f",
        name: "AMD EPYC 9374F",
        tier: "Balanced Fleet",
        summary: "Stable high-clock option for medium to large communities.",
        customPricing: {
          cpuPerCore: 2.8,
          ramPerGb: 1.6,
          storagePer10Gb: 0.8,
          trafficPerTb: 4.5,
          backupPerSlot: 1.0,
        },
      },
      {
        id: "mc-w3495x",
        name: "Intel Xeon W-3495X",
        tier: "Build Servers",
        summary: "Useful for creative clusters and automation-heavy setups.",
        customPricing: {
          cpuPerCore: 3.2,
          ramPerGb: 1.7,
          storagePer10Gb: 0.8,
          trafficPerTb: 4.8,
          backupPerSlot: 1.1,
        },
      },
    ],
    plans: [
      { id: "mc-starter", name: "Starter", cpu: 2, ram: 4, storage: 20, traffic: 1, backups: 1, basePrice: 9.99 },
      { id: "mc-pro", name: "Professional", cpu: 4, ram: 8, storage: 50, traffic: 3, backups: 3, basePrice: 19.99 },
      { id: "mc-ultra", name: "Ultra", cpu: 8, ram: 16, storage: 100, traffic: 5, backups: 5, basePrice: 39.99 },
    ],
  },
  {
    id: "rust",
    name: "Rust Dedicated",
    shortDesc: "Oxide Plugins, Procedural Maps",
    icon: "⚙️",
    coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000&auto=format&fit=crop",
    cpuProfiles: [
      {
        id: "rust-9950x",
        name: "AMD Ryzen 9 9950X",
        tier: "Raid Hour",
        summary: "High-frequency profile tuned for wipe-day and combat spikes.",
        customPricing: {
          cpuPerCore: 4.0,
          ramPerGb: 2.3,
          storagePer10Gb: 1.1,
          trafficPerTb: 5.5,
          backupPerSlot: 1.7,
        },
      },
      {
        id: "rust-9374f",
        name: "AMD EPYC 9374F",
        tier: "Community Default",
        summary: "Reliable mixed workload option for long-running Rust servers.",
        customPricing: {
          cpuPerCore: 3.2,
          ramPerGb: 2.0,
          storagePer10Gb: 1.0,
          trafficPerTb: 5.0,
          backupPerSlot: 1.5,
        },
      },
      {
        id: "rust-8592",
        name: "Intel Xeon 8592+",
        tier: "Large Map Ops",
        summary: "Capacity-oriented profile for bigger map sizes and analytics.",
        customPricing: {
          cpuPerCore: 3.6,
          ramPerGb: 2.1,
          storagePer10Gb: 1.0,
          trafficPerTb: 5.2,
          backupPerSlot: 1.6,
        },
      },
    ],
    plans: [
      { id: "rust-basic", name: "Rust Basic", cpu: 4, ram: 8, storage: 60, traffic: 2, backups: 2, basePrice: 24.99 },
      { id: "rust-max", name: "Rust Max", cpu: 8, ram: 16, storage: 120, traffic: 5, backups: 5, basePrice: 49.99 },
    ],
  },
  {
    id: "palworld",
    name: "Palworld",
    shortDesc: "Co-op survival crafting",
    icon: "🐾",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop",
    cpuProfiles: [
      {
        id: "pal-7950x",
        name: "AMD Ryzen 9 7950X",
        tier: "Launch Ready",
        summary: "Fast single-core performance for active co-op sessions.",
        customPricing: {
          cpuPerCore: 2.6,
          ramPerGb: 1.9,
          storagePer10Gb: 0.6,
          trafficPerTb: 4.2,
          backupPerSlot: 0.7,
        },
      },
      {
        id: "pal-9174f",
        name: "AMD EPYC 9174F",
        tier: "Long Session",
        summary: "Good fit for persistent worlds with stable memory pressure.",
        customPricing: {
          cpuPerCore: 2.3,
          ramPerGb: 1.8,
          storagePer10Gb: 0.5,
          trafficPerTb: 4.0,
          backupPerSlot: 0.5,
        },
      },
      {
        id: "pal-6538n",
        name: "Intel Xeon Gold 6538N",
        tier: "Economy",
        summary: "Lower-cost option for casual guilds and test clusters.",
        customPricing: {
          cpuPerCore: 2.1,
          ramPerGb: 1.7,
          storagePer10Gb: 0.5,
          trafficPerTb: 3.8,
          backupPerSlot: 0.5,
        },
      },
    ],
    plans: [
      { id: "pal-small", name: "Small Guild", cpu: 4, ram: 16, storage: 40, traffic: 2, backups: 2, basePrice: 29.99 },
      { id: "pal-large", name: "Large Server", cpu: 8, ram: 32, storage: 100, traffic: 10, backups: 5, basePrice: 59.99 },
    ],
  },
];

type BillingRank = {
  id: string;
  name: string;
  badgeColor: string;
  discountBase: number;
  discountExtra: number;
  maxServers: number;
  prioritySupport: boolean;
};

const INITIAL_BILLING_RANKS: BillingRank[] = [
  { id: "default", name: "Standard User", badgeColor: "bg-zinc-500", discountBase: 0, discountExtra: 0, maxServers: 5, prioritySupport: false },
  { id: "pro", name: "Pro Member", badgeColor: "bg-blue-500", discountBase: 10, discountExtra: 15, maxServers: 20, prioritySupport: true },
  { id: "partner", name: "Partner / Reseller", badgeColor: "bg-emerald-500", discountBase: 25, discountExtra: 30, maxServers: 100, prioritySupport: true },
  { id: "vip", name: "VIP Content Creator", badgeColor: "bg-purple-500", discountBase: 100, discountExtra: 100, maxServers: 3, prioritySupport: true },
];

/** 與 `admin_test.tsx` 中 `ProductsBillingTabV2` 一致的「產品與價格」版面（子分頁、等級折扣表、遊戲詳情）。 */
export function AdminDashboardProductsBillingTab() {
  const [games, setGames] = useState(INITIAL_BILLING_GAMES);
  const [ranks] = useState(INITIAL_BILLING_RANKS);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedCpuProfileId, setSelectedCpuProfileId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"products" | "ranks">("products");
  const [activeSettingsTab, setActiveSettingsTab] = useState<"general" | "cpu">("general");

  const selectedGame = games.find((g) => g.id === selectedGameId);
  const selectedCpuProfile = selectedGame?.cpuProfiles.find((cpuProfile) => cpuProfile.id === selectedCpuProfileId) ?? selectedGame?.cpuProfiles[0];

  const handleSelectGame = (gameId: string) => {
    const nextGame = games.find((game) => game.id === gameId);
    setSelectedGameId(gameId);
    setSelectedCpuProfileId(nextGame?.cpuProfiles[0]?.id ?? null);
    setActiveSettingsTab("general");
  };

  const handleSelectedCpuPricingChange = (field: keyof BillingCustomPricing, value: string) => {
    if (!selectedGame || !selectedCpuProfile) {
      return;
    }

    const nextValue = Number(value);

    setGames((currentGames) =>
      currentGames.map((game) =>
        game.id !== selectedGame.id
          ? game
          : {
              ...game,
              cpuProfiles: game.cpuProfiles.map((cpuProfile) =>
                cpuProfile.id !== selectedCpuProfile.id
                  ? cpuProfile
                  : {
                      ...cpuProfile,
                      customPricing: {
                        ...cpuProfile.customPricing,
                        [field]: Number.isFinite(nextValue) ? nextValue : 0,
                      },
                    },
              ),
            },
      ),
    );
  };

  if (!selectedGame) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mx-auto w-full max-w-[1400px] pb-20"
      >
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-zinc-800/80 pb-0 md:flex-row md:items-end">
          <div className="flex-1">
            <h2 className="flex items-center gap-2.5 text-2xl font-semibold text-zinc-100">
              <Package className="h-5 w-5 text-zinc-400" />
              Products & Pricing
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500">
              Manage game configurations, plans, custom resource pricing, and user rank discounts.
            </p>

            <div className="mt-6 flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveSubTab("products")}
                className={`relative top-px border-b-2 pb-3 text-sm font-semibold transition-colors ${
                  activeSubTab === "products" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Game Products
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("ranks")}
                className={`relative top-px border-b-2 pb-3 text-sm font-semibold transition-colors ${
                  activeSubTab === "ranks" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Ranks & Discounts
              </button>
            </div>
          </div>

          <div className="pb-3">
            {activeSubTab === "products" ? (
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-bold text-zinc-900 shadow-sm transition-colors hover:bg-white"
              >
                <Plus className="h-4 w-4" /> Create Product
              </button>
            ) : (
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-bold text-zinc-900 shadow-sm transition-colors hover:bg-white"
              >
                <Plus className="h-4 w-4" /> Create Rank
              </button>
            )}
          </div>
        </div>

        {activeSubTab === "products" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <div
                key={game.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectGame(game.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectGame(game.id);
                  }
                }}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-[#0c0c0e] shadow-sm transition-all hover:border-zinc-600"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <div className="absolute inset-0 z-10 bg-black/40 transition-colors group-hover:bg-black/20" />
                  <img
                    src={game.coverImage}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={game.name}
                  />
                  <div className="absolute bottom-4 left-5 z-20 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700/50 bg-[#0a0a0c]/80 text-xl shadow-lg backdrop-blur-md">
                      {game.icon}
                    </div>
                    <span className="text-lg font-bold text-white drop-shadow-md">{game.name}</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <p className="mb-6 text-sm text-zinc-400">{game.shortDesc}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-zinc-800/50 pt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Packages</span>
                      <span className="font-mono text-sm text-zinc-200">{game.plans.length} Active</span>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-lg border border-zinc-700/50 bg-[#111] px-3 py-1.5 text-xs font-semibold text-zinc-100">
                      <Settings2 className="h-3.5 w-3.5" /> Configure
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === "ranks" && (
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-[#0c0c0e] shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-800/80 bg-[#111]/50 p-5">
                <div>
                  <h3 className="text-base font-bold text-zinc-200">User Ranks & Permissions</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Configure global discount rules and server limits for different user tiers.
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap text-left text-sm">
                  <thead className="border-b border-zinc-800/80 bg-[#0a0a0c] text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="px-6 py-4">Rank Level</th>
                      <th className="px-6 py-4">Base Plan Discount</th>
                      <th className="px-6 py-4">Extra Res. Discount</th>
                      <th className="px-6 py-4">Max Servers</th>
                      <th className="px-6 py-4">Priority Support</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40 bg-[#0c0c0e]">
                    {ranks.map((rank) => (
                      <tr key={rank.id} className="transition-colors group hover:bg-zinc-800/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${rank.badgeColor}`} />
                            <div className="flex flex-col">
                              <span className="font-bold text-zinc-200">{rank.name}</span>
                              <span className="mt-0.5 font-mono text-[11px] text-zinc-500">{rank.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              defaultValue={rank.discountBase}
                              className="w-16 rounded-md border border-zinc-800 bg-[#0a0a0c] px-2 py-1 text-center font-mono text-sm text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                            />
                            <span className="text-zinc-500">% off</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              defaultValue={rank.discountExtra}
                              className="w-16 rounded-md border border-zinc-800 bg-[#0a0a0c] px-2 py-1 text-center font-mono text-sm text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                            />
                            <span className="text-zinc-500">% off</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            defaultValue={rank.maxServers}
                            className="w-20 rounded-md border border-zinc-800 bg-[#0a0a0c] px-2 py-1 text-center font-mono text-sm text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <label className="flex cursor-pointer items-center gap-2">
                            <div
                              className={`relative h-5 w-10 rounded-full transition-colors ${rank.prioritySupport ? "bg-emerald-500/20" : "bg-zinc-800"}`}
                            >
                              <div
                                className={`absolute top-1 h-3 w-3 rounded-full transition-all ${rank.prioritySupport ? "left-6 bg-emerald-400" : "left-1 bg-zinc-500"}`}
                              />
                            </div>
                            <span className="text-xs text-zinc-400">{rank.prioritySupport ? "Enabled" : "Disabled"}</span>
                          </label>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-emerald-400/10 hover:text-emerald-400"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-red-400/10 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="mx-auto w-full max-w-[1400px] pb-20"
    >
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <button
            type="button"
            onClick={() => {
              setSelectedGameId(null);
              setSelectedCpuProfileId(null);
            }}
            className="transition-colors hover:text-zinc-200"
          >
            Products
          </button>
          <span>/</span>
          <span className="font-medium text-zinc-100">{selectedGame.name}</span>
        </div>

        <div className="flex flex-col justify-between gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-800/80 bg-[#0c0c0e] text-2xl shadow-sm">
              {selectedGame.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">{selectedGame.name}</h2>
              <p className="mt-1 font-mono text-sm text-zinc-500">{selectedGame.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-zinc-800/80 bg-[#0c0c0e] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700"
            >
              View Store Page
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-900 shadow-sm transition-colors hover:bg-white"
            >
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </div>

        <div className="border-b border-zinc-800/80 pb-2">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveSettingsTab("general")}
              className={`relative top-px border-b-2 pb-3 text-sm font-semibold transition-colors ${
                activeSettingsTab === "general"
                  ? "border-white text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              General Settings
            </button>
            <button
              type="button"
              onClick={() => setActiveSettingsTab("cpu")}
              className={`relative top-px border-b-2 pb-3 text-sm font-semibold transition-colors ${
                activeSettingsTab === "cpu"
                  ? "border-white text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              CPU Settings
            </button>
          </div>

          {activeSettingsTab === "cpu" && (
            <div className="mt-4 rounded-xl border border-zinc-800/80 bg-[#0c0c0e]">
              <div className="overflow-x-auto px-3 py-3 sm:px-4">
                <div className="flex min-w-max items-stretch gap-3">
                  {selectedGame.cpuProfiles.map((cpuProfile) => {
                    const isActive = cpuProfile.id === selectedCpuProfile?.id;

                    return (
                      <button
                        key={cpuProfile.id}
                        type="button"
                        onClick={() => setSelectedCpuProfileId(cpuProfile.id)}
                        className={`min-w-[220px] rounded-lg border px-4 py-3 text-left transition-colors ${
                          isActive
                            ? "border-zinc-600 bg-[#15171a] text-zinc-100"
                            : "border-zinc-800 bg-[#0f1012] text-zinc-500 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                            <Cpu className={`h-3.5 w-3.5 ${isActive ? "text-zinc-300" : "text-zinc-600"}`} />
                            <span>{cpuProfile.tier}</span>
                          </div>
                          {isActive && <span className="rounded-md border border-zinc-700 bg-[#111214] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-300">Active</span>}
                        </div>
                        <div className="mt-2 whitespace-nowrap text-sm font-semibold">{cpuProfile.name}</div>
                        <div className={`mt-2 text-xs leading-5 ${isActive ? "text-zinc-400" : "text-zinc-500"}`}>
                          {cpuProfile.summary}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="flex flex-col gap-8 xl:col-span-1">
          <div className={activeSettingsTab === "general" ? "rounded-xl border border-zinc-800/80 bg-[#0c0c0e] p-6 shadow-sm" : "hidden"}>
            <h3 className="mb-6 border-b border-zinc-800/80 pb-3 text-base font-bold text-zinc-100">General Settings</h3>

            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Cover Image URL</label>
                <div className="relative">
                  <input
                    type="text"
                    defaultValue={selectedGame.coverImage}
                    className="w-full rounded-lg border border-zinc-800 bg-[#0a0a0c] px-3 py-2 text-sm text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                  />
                  <div className="mt-3 h-28 w-full overflow-hidden rounded-lg border border-zinc-800/80 shadow-inner">
                    <img src={selectedGame.coverImage} className="h-full w-full object-cover" alt="Preview" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Description</label>
                <input
                  type="text"
                  defaultValue={selectedGame.shortDesc}
                  className="w-full rounded-lg border border-zinc-800 bg-[#0a0a0c] px-3 py-2 text-sm text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Status</label>
                <select className="w-full appearance-none rounded-lg border border-zinc-800 bg-[#0a0a0c] px-3 py-2 text-sm text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none">
                  <option>Active / Available</option>
                  <option>Hidden</option>
                  <option>Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          <div
            key={selectedCpuProfile?.id}
            className={activeSettingsTab === "cpu" ? "rounded-xl border border-zinc-800/80 bg-[#0c0c0e] p-6 shadow-sm" : "hidden"}
          >
            <div className="mb-6 flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-100">{selectedCpuProfile?.name ?? "CPU Resource Pricing"}</h3>
                <p className="mt-1 text-xs text-zinc-500">{selectedCpuProfile?.summary}</p>
              </div>
              <span className="rounded border border-zinc-800 bg-[#0a0a0c] px-2 py-0.5 text-xs font-medium text-zinc-500">
                Monthly (USD)
              </span>
            </div>

            <p className="mb-6 text-xs leading-relaxed text-zinc-500">
              Adjust the custom add-on pricing that applies when this CPU profile is selected for the game.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <span className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-300">
                  <Cpu className="h-4 w-4 text-zinc-500" /> Additional CPU Core
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-zinc-600">$</span>
                  <input
                    type="number"
                    value={selectedCpuProfile?.customPricing.cpuPerCore ?? 0}
                    onChange={(event) => handleSelectedCpuPricingChange("cpuPerCore", event.target.value)}
                    step="0.5"
                    className="w-20 rounded-md border border-zinc-800 bg-[#0a0a0c] px-2.5 py-1.5 text-right font-mono text-sm text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between group">
                <span className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-300">
                  <MemoryStick className="h-4 w-4 text-zinc-500" /> Additional GB RAM
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-zinc-600">$</span>
                  <input
                    type="number"
                    value={selectedCpuProfile?.customPricing.ramPerGb ?? 0}
                    onChange={(event) => handleSelectedCpuPricingChange("ramPerGb", event.target.value)}
                    step="0.5"
                    className="w-20 rounded-md border border-zinc-800 bg-[#0a0a0c] px-2.5 py-1.5 text-right font-mono text-sm text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between group">
                <span className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-300">
                  <HardDrive className="h-4 w-4 text-zinc-500" /> Per 10GB Storage
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-zinc-600">$</span>
                  <input
                    type="number"
                    value={selectedCpuProfile?.customPricing.storagePer10Gb ?? 0}
                    onChange={(event) => handleSelectedCpuPricingChange("storagePer10Gb", event.target.value)}
                    step="0.1"
                    className="w-20 rounded-md border border-zinc-800 bg-[#0a0a0c] px-2.5 py-1.5 text-right font-mono text-sm text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between group">
                <span className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-300">
                  <Network className="h-4 w-4 text-zinc-500" /> Per 1TB Traffic
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-zinc-600">$</span>
                  <input
                    type="number"
                    value={selectedCpuProfile?.customPricing.trafficPerTb ?? 0}
                    onChange={(event) => handleSelectedCpuPricingChange("trafficPerTb", event.target.value)}
                    step="1.0"
                    className="w-20 rounded-md border border-zinc-800 bg-[#0a0a0c] px-2.5 py-1.5 text-right font-mono text-sm text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between group">
                <span className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-300">
                  <Database className="h-4 w-4 text-zinc-500" /> Per Backup Slot
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-zinc-600">$</span>
                  <input
                    type="number"
                    value={selectedCpuProfile?.customPricing.backupPerSlot ?? 0}
                    onChange={(event) => handleSelectedCpuPricingChange("backupPerSlot", event.target.value)}
                    step="0.5"
                    className="w-20 rounded-md border border-zinc-800 bg-[#0a0a0c] px-2.5 py-1.5 text-right font-mono text-sm text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 xl:col-span-2">
          {activeSettingsTab === "general" ? (
            <>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-xl font-bold text-zinc-100">Configured Packages</h3>
                  <p className="mt-1 text-sm text-zinc-500">Pre-defined resource bundles offered to clients.</p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-[#0c0c0e] px-4 py-2 text-sm font-semibold text-zinc-200 shadow-sm transition-colors hover:border-zinc-600"
                >
                  <Plus className="h-4 w-4" /> Add Package
                </button>
              </div>

              <div className="flex flex-col gap-5">
                {selectedGame.plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="group/plan flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-[#0c0c0e] shadow-sm transition-colors hover:border-zinc-600/80"
                  >
                    <div className="flex flex-col justify-between gap-4 border-b border-zinc-800/80 bg-[#111]/50 p-5 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-1.5 rounded-full bg-emerald-500/80" />
                        <div className="flex flex-col">
                          <span className="flex items-center gap-2 text-lg font-bold text-zinc-100">
                            {plan.name}{" "}
                            <Edit2 className="h-3.5 w-3.5 cursor-pointer text-zinc-600 transition-colors hover:text-zinc-300" />
                          </span>
                          <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">{plan.id}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Base Price</span>
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-medium text-zinc-500">$</span>
                            <input
                              type="number"
                              defaultValue={plan.basePrice}
                              step="0.01"
                              className="w-20 border-b border-zinc-700 bg-transparent text-right font-mono text-xl font-bold text-emerald-400 transition-colors focus:border-emerald-500 focus:outline-none"
                            />
                            <span className="text-xs text-zinc-500">/mo</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="rounded-lg border border-zinc-800 bg-[#0a0a0c] p-2.5 text-zinc-600 transition-colors hover:border-red-500/30 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-5">
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                            <Cpu className="h-3 w-3" /> CPU Cores
                          </label>
                          <input
                            type="number"
                            defaultValue={plan.cpu}
                            className="w-full rounded-lg border border-zinc-800 bg-[#0a0a0c] px-3 py-2 font-mono text-[15px] text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                            <MemoryStick className="h-3 w-3" /> RAM (GB)
                          </label>
                          <input
                            type="number"
                            defaultValue={plan.ram}
                            className="w-full rounded-lg border border-zinc-800 bg-[#0a0a0c] px-3 py-2 font-mono text-[15px] text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                            <HardDrive className="h-3 w-3" /> Storage (GB)
                          </label>
                          <input
                            type="number"
                            defaultValue={plan.storage}
                            className="w-full rounded-lg border border-zinc-800 bg-[#0a0a0c] px-3 py-2 font-mono text-[15px] text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                            <Network className="h-3 w-3" /> Traffic (TB)
                          </label>
                          <input
                            type="number"
                            defaultValue={plan.traffic}
                            className="w-full rounded-lg border border-zinc-800 bg-[#0a0a0c] px-3 py-2 font-mono text-[15px] text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                            <Database className="h-3 w-3" /> Backups
                          </label>
                          <input
                            type="number"
                            defaultValue={plan.backups}
                            className="w-full rounded-lg border border-zinc-800 bg-[#0a0a0c] px-3 py-2 font-mono text-[15px] text-zinc-200 transition-colors focus:border-zinc-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-zinc-800/80 bg-[#0c0c0e] p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between border-b border-zinc-800/80 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-100">{selectedCpuProfile?.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{selectedCpuProfile?.tier}</p>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Active CPU Profile
                </span>
              </div>
              <p className="text-sm leading-7 text-zinc-400">
                {selectedCpuProfile?.summary} Switch the CPU from the navigation above to refresh this section and edit a different pricing profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
