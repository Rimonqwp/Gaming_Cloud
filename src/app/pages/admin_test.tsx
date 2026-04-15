import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from "recharts";
import { 
  LayoutDashboard, Package, MapPin, FileText, Settings, 
  Plus, Edit2, Trash2, Save, X, Server, Activity, Users, DollarSign,
  ChevronRight, CheckCircle2, Search, ArrowUpRight, Zap, 
  Terminal, ShieldBan, HardDrive, MessageSquare, Clock, Power, PlayCircle, RotateCw,
  ArrowLeft, CreditCard, Smartphone, ShieldCheck, History, Bitcoin, Monitor,
  Trophy, Gift, Users as UsersIcon, Link as LinkIcon, Star, Crown,
  Globe, AlertTriangle, KeyRound, Wifi, ShieldAlert, Play, Square, RotateCcw, 
  TerminalSquare, FolderOpen, ScrollText, Users2, GitBranch, Network, Database, Calendar,
  Maximize2, Settings2, RefreshCw, Cpu, Copy, ArrowRight, Lock, Feather, Layers, Box, ServerCrash, DownloadCloud, File, FolderDown, ChevronDown, ListFilter, Download, FileJson, Shield, MemoryStick
} from "lucide-react";

// Mock Data Models
type Plan = { id: string; name: string; cpu: number; memory: number; storage: number; price: number; };
type Node = { city: string; latency: string; };
type Region = { id: string; label: string; nodes: Node[]; };
type Doc = { id: number; title: string; category: string; date: string; status: "published" | "draft"; };
type User = { 
  id: string; email: string; balance: number; bonusCredit: number; rank: "Bronze" | "Silver" | "Gold" | "Diamond" | "Partner"; 
  status: "active" | "banned"; registeredAt: string; phone?: string; discordId?: string; kycVerified?: boolean; twoFactorEnabled?: boolean; 
  referralCode: string; 
};
type Instance = { id: string; userId: string; game: string; node: string; status: "running" | "stopped" | "installing"; cpuUsage: number; memUsage: number; planName?: string; price?: number; };
type Ticket = { id: string; subject: string; user: string; priority: "low" | "normal" | "high" | "urgent"; status: "open" | "answered" | "closed"; updatedAt: string; };
type Transaction = { id: string; userId: string; date: string; amount: number; type: "deposit" | "payment" | "refund" | "bonus"; status: "completed" | "pending" | "failed"; description: string; method: string; };
type Referral = { id: string; codeOwnerId: string; referredUserId: string; referredUserEmail: string; date: string; bonusEarned: number; };

const INITIAL_RANKS = [
  { id: "default", name: "Standard User", badgeColor: "bg-zinc-500", discountBase: 0, discountExtra: 0, maxServers: 5, prioritySupport: false },
  { id: "pro", name: "Pro Member", badgeColor: "bg-blue-500", discountBase: 10, discountExtra: 15, maxServers: 20, prioritySupport: true },
  { id: "partner", name: "Partner / Reseller", badgeColor: "bg-emerald-500", discountBase: 25, discountExtra: 30, maxServers: 100, prioritySupport: true },
  { id: "vip", name: "VIP Content Creator", badgeColor: "bg-purple-500", discountBase: 100, discountExtra: 100, maxServers: 3, prioritySupport: true },
];

function ProductsBillingTabV2() {
  const [games, setGames] = useState(INITIAL_BILLING_GAMES);
  const [ranks, setRanks] = useState(INITIAL_RANKS);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"products" | "ranks">("products");

  const selectedGame = games.find(g => g.id === selectedGameId);

  // Detail View
  if (selectedGame) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-[1400px] mx-auto pb-20">
        
        {/* Breadcrumbs */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <button onClick={() => setSelectedGameId(null)} className="hover:text-zinc-200 transition-colors">Products</button>
            <span>/</span>
            <span className="text-zinc-100 font-medium">{selectedGame.name}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#0c0c0e] flex items-center justify-center text-2xl shadow-sm border border-zinc-800/80">{selectedGame.icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-100">{selectedGame.name}</h2>
                <p className="text-sm text-zinc-500 mt-1 font-mono">{selectedGame.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-[#0c0c0e] border border-zinc-800/80 rounded-lg text-sm font-medium hover:border-zinc-700 transition-colors text-zinc-300">View Store Page</button>
              <button className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg text-sm font-bold hover:bg-white transition-colors shadow-sm flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: General & Custom Pricing */}
          <div className="flex flex-col gap-8 xl:col-span-1">
            
            {/* General Settings */}
            <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-100 mb-6 border-b border-zinc-800/80 pb-3">General Settings</h3>
              
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-300">Cover Image URL</label>
                  <div className="relative">
                    <input type="text" defaultValue={selectedGame.coverImage} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors" />
                    <div className="mt-3 h-28 w-full rounded-lg overflow-hidden border border-zinc-800/80 shadow-inner">
                      <img src={selectedGame.coverImage} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-300">Description</label>
                  <input type="text" defaultValue={selectedGame.shortDesc} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-300">Status</label>
                  <select className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors appearance-none">
                    <option>Active / Available</option>
                    <option>Hidden</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Custom Resource Pricing */}
            <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b border-zinc-800/80 pb-3">
                 <h3 className="text-base font-bold text-zinc-100">Custom Resource Pricing</h3>
                 <span className="text-xs text-zinc-500 font-medium border border-zinc-800 bg-[#0a0a0c] px-2 py-0.5 rounded">Monthly (USD)</span>
              </div>
              
              <p className="text-xs text-zinc-500 mb-6 leading-relaxed">Set the unit price for clients who customize their plan beyond the base package resources.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <span className="text-[13px] text-zinc-300 flex items-center gap-2.5 font-medium"><Cpu className="w-4 h-4 text-zinc-500" /> Additional CPU Core</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-600 text-sm font-mono">$</span>
                    <input type="number" defaultValue={selectedGame.customPricing.cpuPerCore} step="0.5" className="w-20 bg-[#0a0a0c] border border-zinc-800 rounded-md px-2.5 py-1.5 text-sm text-zinc-200 text-right focus:outline-none focus:border-zinc-500 transition-colors font-mono" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between group">
                  <span className="text-[13px] text-zinc-300 flex items-center gap-2.5 font-medium"><MemoryStick className="w-4 h-4 text-zinc-500" /> Additional GB RAM</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-600 text-sm font-mono">$</span>
                    <input type="number" defaultValue={selectedGame.customPricing.ramPerGb} step="0.5" className="w-20 bg-[#0a0a0c] border border-zinc-800 rounded-md px-2.5 py-1.5 text-sm text-zinc-200 text-right focus:outline-none focus:border-zinc-500 transition-colors font-mono" />
                  </div>
                </div>

                <div className="flex items-center justify-between group">
                  <span className="text-[13px] text-zinc-300 flex items-center gap-2.5 font-medium"><HardDrive className="w-4 h-4 text-zinc-500" /> Per 10GB Storage</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-600 text-sm font-mono">$</span>
                    <input type="number" defaultValue={selectedGame.customPricing.storagePer10Gb} step="0.1" className="w-20 bg-[#0a0a0c] border border-zinc-800 rounded-md px-2.5 py-1.5 text-sm text-zinc-200 text-right focus:outline-none focus:border-zinc-500 transition-colors font-mono" />
                  </div>
                </div>

                <div className="flex items-center justify-between group">
                  <span className="text-[13px] text-zinc-300 flex items-center gap-2.5 font-medium"><Network className="w-4 h-4 text-zinc-500" /> Per 1TB Traffic</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-600 text-sm font-mono">$</span>
                    <input type="number" defaultValue={selectedGame.customPricing.trafficPerTb} step="1.0" className="w-20 bg-[#0a0a0c] border border-zinc-800 rounded-md px-2.5 py-1.5 text-sm text-zinc-200 text-right focus:outline-none focus:border-zinc-500 transition-colors font-mono" />
                  </div>
                </div>

                <div className="flex items-center justify-between group">
                  <span className="text-[13px] text-zinc-300 flex items-center gap-2.5 font-medium"><Database className="w-4 h-4 text-zinc-500" /> Per Backup Slot</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-600 text-sm font-mono">$</span>
                    <input type="number" defaultValue={selectedGame.customPricing.backupPerSlot} step="0.5" className="w-20 bg-[#0a0a0c] border border-zinc-800 rounded-md px-2.5 py-1.5 text-sm text-zinc-200 text-right focus:outline-none focus:border-zinc-500 transition-colors font-mono" />
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Right Column: Base Packages / Plans */}
          <div className="flex flex-col gap-6 xl:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-zinc-100">Configured Packages</h3>
                <p className="text-sm text-zinc-500 mt-1">Pre-defined resource bundles offered to clients.</p>
              </div>
              <button className="px-4 py-2 border border-zinc-800/80 bg-[#0c0c0e] hover:border-zinc-600 text-zinc-200 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> Add Package
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {selectedGame.plans.map((plan, idx) => (
                <div key={plan.id} className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm hover:border-zinc-600/80 transition-colors flex flex-col group/plan">
                  
                  {/* Plan Header */}
                  <div className="bg-[#111]/50 p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-10 rounded-full bg-emerald-500/80"></div>
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-100 text-lg flex items-center gap-2">{plan.name} <Edit2 className="w-3.5 h-3.5 text-zinc-600 cursor-pointer hover:text-zinc-300 transition-colors" /></span>
                        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">{plan.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Base Price</span>
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-zinc-500 font-medium">$</span>
                          <input type="number" defaultValue={plan.basePrice} step="0.01" className="w-20 bg-transparent border-b border-zinc-700 focus:border-emerald-500 font-mono font-bold text-xl text-emerald-400 text-right focus:outline-none transition-colors" />
                          <span className="text-zinc-500 text-xs">/mo</span>
                        </div>
                      </div>
                      <button className="p-2.5 text-zinc-600 hover:text-red-400 transition-colors bg-[#0a0a0c] border border-zinc-800 rounded-lg hover:border-red-500/30"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* Plan Details Config */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><Cpu className="w-3 h-3" /> CPU Cores</label>
                        <input type="number" defaultValue={plan.cpu} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-[15px] font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><MemoryStick className="w-3 h-3" /> RAM (GB)</label>
                        <input type="number" defaultValue={plan.ram} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-[15px] font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><HardDrive className="w-3 h-3" /> Storage (GB)</label>
                        <input type="number" defaultValue={plan.storage} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-[15px] font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><Network className="w-3 h-3" /> Traffic (TB)</label>
                        <input type="number" defaultValue={plan.traffic} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-[15px] font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><Database className="w-3 h-3" /> Backups</label>
                        <input type="number" defaultValue={plan.backups} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-[15px] font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </motion.div>
    );
  }

  // List Views (Products or Ranks)
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-[1400px] mx-auto pb-20">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-0 border-b border-zinc-800/80 mb-8">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2.5">
            <Package className="w-5 h-5 text-zinc-400" />
            Products & Pricing
          </h2>
          <p className="text-zinc-500 text-sm mt-1.5">Manage game configurations, plans, custom resource pricing, and user rank discounts.</p>
          
          <div className="flex items-center gap-6 mt-6">
            <button 
              onClick={() => setActiveSubTab("products")} 
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 relative top-[1px] ${activeSubTab === "products" ? "text-white border-white" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}
            >
              Game Products
            </button>
            <button 
              onClick={() => setActiveSubTab("ranks")} 
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 relative top-[1px] ${activeSubTab === "ranks" ? "text-white border-white" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}
            >
              Ranks & Discounts
            </button>
          </div>
        </div>
        
        <div className="pb-3">
          {activeSubTab === "products" ? (
            <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-sm font-bold transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Create Product
            </button>
          ) : (
            <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-sm font-bold transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Create Rank
            </button>
          )}
        </div>
      </div>

      {/* PRODUCTS SUB-TAB */}
      {activeSubTab === "products" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(game => (
            <div key={game.id} className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm hover:border-zinc-600 transition-all cursor-pointer group flex flex-col" onClick={() => setSelectedGameId(game.id)}>
              <div className="h-40 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                <img src={game.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={game.name} />
                <div className="absolute bottom-4 left-5 z-20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0a0a0c]/80 backdrop-blur-md border border-zinc-700/50 flex items-center justify-center text-xl shadow-lg">{game.icon}</div>
                  <span className="text-white font-bold text-lg drop-shadow-md">{game.name}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-sm text-zinc-400 mb-6">{game.shortDesc}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Packages</span>
                    <span className="text-zinc-200 font-mono text-sm">{game.plans.length} Active</span>
                  </div>
                  <button className="text-zinc-100 hover:text-white px-3 py-1.5 bg-[#111] border border-zinc-700/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <Settings2 className="w-3.5 h-3.5" /> Configure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RANKS SUB-TAB */}
      {activeSubTab === "ranks" && (
        <div className="flex flex-col gap-6">
          <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-zinc-800/80 bg-[#111]/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-200">User Ranks & Permissions</h3>
                <p className="text-xs text-zinc-500 mt-1">Configure global discount rules and server limits for different user tiers.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#0a0a0c] text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800/80">
                  <tr>
                    <th className="py-4 px-6">Rank Level</th>
                    <th className="py-4 px-6">Base Plan Discount</th>
                    <th className="py-4 px-6">Extra Res. Discount</th>
                    <th className="py-4 px-6">Max Servers</th>
                    <th className="py-4 px-6">Priority Support</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40 bg-[#0c0c0e]">
                  {ranks.map((rank) => (
                    <tr key={rank.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${rank.badgeColor}`}></div>
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-200">{rank.name}</span>
                            <span className="text-[11px] text-zinc-500 font-mono mt-0.5">{rank.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                           <input type="number" defaultValue={rank.discountBase} className="w-16 bg-[#0a0a0c] border border-zinc-800 rounded-md px-2 py-1 text-sm text-zinc-200 text-center focus:outline-none focus:border-zinc-500 transition-colors font-mono" />
                           <span className="text-zinc-500">% off</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                           <input type="number" defaultValue={rank.discountExtra} className="w-16 bg-[#0a0a0c] border border-zinc-800 rounded-md px-2 py-1 text-sm text-zinc-200 text-center focus:outline-none focus:border-zinc-500 transition-colors font-mono" />
                           <span className="text-zinc-500">% off</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                         <input type="number" defaultValue={rank.maxServers} className="w-20 bg-[#0a0a0c] border border-zinc-800 rounded-md px-2 py-1 text-sm text-zinc-200 text-center focus:outline-none focus:border-zinc-500 transition-colors font-mono" />
                      </td>
                      <td className="py-4 px-6">
                         <label className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-10 h-5 rounded-full transition-colors relative ${rank.prioritySupport ? 'bg-emerald-500/20' : 'bg-zinc-800'}`}>
                               <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${rank.prioritySupport ? 'left-6 bg-emerald-400' : 'left-1 bg-zinc-500'}`}></div>
                            </div>
                            <span className="text-xs text-zinc-400">{rank.prioritySupport ? 'Enabled' : 'Disabled'}</span>
                         </label>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-zinc-500 hover:text-emerald-400 transition-colors p-1.5 rounded-md hover:bg-emerald-400/10">
                            <Save className="w-4 h-4" />
                          </button>
                          <button className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-400/10">
                            <Trash2 className="w-4 h-4" />
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

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "nodes" | "docs" | "users" | "instances" | "tickets" | "settings">("overview");
  
  // -- Mock Data for Traffic & Network Analytics --
  const trafficData = [
    { time: '00:00', activeIPs: 1420, bandwidth: 450 },
    { time: '04:00', activeIPs: 980, bandwidth: 230 },
    { time: '08:00', activeIPs: 2150, bandwidth: 850 },
    { time: '12:00', activeIPs: 3450, bandwidth: 1200 },
    { time: '16:00', activeIPs: 4180, bandwidth: 1580 },
    { time: '20:00', activeIPs: 5720, bandwidth: 2240 },
    { time: '24:00', activeIPs: 2300, bandwidth: 920 },
  ];

  // -- Selected User State --
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isEditingRank, setIsEditingRank] = useState(false);

  // -- Selected Instance State --
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [instanceActiveTab, setInstanceActiveTab] = useState<"console" | "files" | "logs" | "startup" | "players" | "versions" | "network" | "management">("console");

  // --- State for Products ---
  const [plans, setPlans] = useState<Plan[]>([
    { id: "c2m4", name: "C2M4 标准型", cpu: 2, memory: 4, storage: 80, price: 12 },
    { id: "c4m8", name: "C4M8 性能型", cpu: 4, memory: 8, storage: 160, price: 24 },
    { id: "c8m16", name: "C8M16 企业型", cpu: 8, memory: 16, storage: 320, price: 48 },
    { id: "c16m32", name: "C16M32 旗舰型", cpu: 16, memory: 32, storage: 640, price: 96 },
    { id: "g1-rtx4090", name: "G1 算力型 (RTX 4090)", cpu: 16, memory: 64, storage: 1000, price: 299 },
    { id: "g2-a100", name: "G2 算力型 (A100 80G)", cpu: 32, memory: 128, storage: 2000, price: 899 },
    { id: "m-baremetal-1", name: "物理机 - 基础版", cpu: 32, memory: 128, storage: 2000, price: 150 },
    { id: "m-baremetal-2", name: "物理机 - 高阶版", cpu: 64, memory: 256, storage: 4000, price: 280 },
  ]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanDraft, setEditPlanDraft] = useState<Plan | null>(null);

  // --- State for Nodes ---
  type GlobalNode = {
    id: string;
    city: string;
    latency: string;
    publicIp: string;
    bandwidth: string;
    cpuSpec: string;
    ramSpec: string;
    status: "online" | "offline" | "maintenance";
    supportedGames: string[];
  };

  type GlobalRegion = {
    id: string;
    label: string;
    nodes: GlobalNode[];
  };

  const gamesList = [
    { id: "minecraft", name: "Minecraft", icon: "⛏️" },
    { id: "palworld", name: "Palworld", icon: "🐾" },
    { id: "rust", name: "Rust", icon: "⚙️" },
    { id: "cs2", name: "CS2", icon: "🔫" },
  ];

  const [globalRegions, setGlobalRegions] = useState<GlobalRegion[]>([
    {
      id: "asia", label: "Asia Pacific", nodes: [
        { id: "node-tky-01", city: "Tokyo", latency: "45ms", publicIp: "103.45.12.88", bandwidth: "10 Gbps", cpuSpec: "Dual EPYC 7763 (128C)", ramSpec: "512GB DDR4", status: "online", supportedGames: ["minecraft", "palworld", "cs2"] },
        { id: "node-hkg-01", city: "Hong Kong", latency: "15ms", publicIp: "45.12.88.103", bandwidth: "5 Gbps", cpuSpec: "Xeon Platinum 8380 (80C)", ramSpec: "256GB DDR4", status: "online", supportedGames: ["minecraft", "cs2"] },
        { id: "node-sgp-01", city: "Singapore", latency: "35ms", publicIp: "128.14.55.99", bandwidth: "10 Gbps", cpuSpec: "EPYC 7713 (64C)", ramSpec: "512GB DDR4", status: "online", supportedGames: ["rust"] }
      ]
    },
    {
      id: "americas", label: "Americas", nodes: [
        { id: "node-lax-01", city: "Los Angeles", latency: "135ms", publicIp: "192.168.4.5", bandwidth: "20 Gbps", cpuSpec: "Dual EPYC 9654 (192C)", ramSpec: "1TB DDR5", status: "online", supportedGames: ["minecraft", "palworld", "rust"] },
        { id: "node-sea-01", city: "Seattle", latency: "140ms", publicIp: "198.51.100.14", bandwidth: "10 Gbps", cpuSpec: "Xeon Gold 6348 (56C)", ramSpec: "256GB DDR4", status: "online", supportedGames: ["rust", "cs2"] }
      ]
    },
    {
      id: "europe", label: "Europe", nodes: [
        { id: "node-fra-01", city: "Frankfurt", latency: "165ms", publicIp: "46.4.22.11", bandwidth: "10 Gbps", cpuSpec: "Dual EPYC 7763 (128C)", ramSpec: "512GB DDR4", status: "online", supportedGames: ["minecraft", "rust"] }
      ]
    }
  ]);

  const [selectedPhysicalNode, setSelectedPhysicalNode] = useState<GlobalNode | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);
  const [newNodeCity, setNewNodeCity] = useState("");
  const [newNodeLatency, setNewNodeLatency] = useState("");

  // --- State for Docs ---
  const [docs, setDocs] = useState<Doc[]>([
    { id: 1, title: "如何部署你的第一个 Minecraft 服务器", category: "Minecraft", date: "2026-03-12", status: "published" },
    { id: 2, title: "Linux 防火墙配置与端口放行指南", category: "安全", date: "2026-03-20", status: "draft" },
    { id: 3, title: "Rust 开荒与建服基础教程", category: "Rust", date: "2026-04-01", status: "published" },
    { id: 4, title: "CS2 社区服插件安装全解析", category: "CS2", date: "2026-04-05", status: "published" },
    { id: 5, title: "Palworld 幻兽帕鲁 伺服器优化与内存泄漏解决方案", category: "Palworld", date: "2026-04-08", status: "published" },
    { id: 6, title: "云服务器 (ECS) 自动备份策略设置", category: "云端运算", date: "2026-04-08", status: "draft" },
    { id: 7, title: "DDOS 防护机制与 IP 封禁规则说明", category: "安全", date: "2026-04-09", status: "published" },
  ]);

  // --- New States for Pro Features ---
  const [users, setUsers] = useState<User[]>([
    { id: "USR-0829", email: "game_master99@gmail.com", balance: 125.50, bonusCredit: 50.00, rank: "Diamond", status: "active", registeredAt: "2025-11-20", phone: "+1 (555) 019-2834", discordId: "Master#0001", kycVerified: true, twoFactorEnabled: true, referralCode: "GAMEMASTER99" },
    { id: "USR-1102", email: "hacker_boi_2000@protonmail.com", balance: 0, bonusCredit: 0, rank: "Bronze", status: "banned", registeredAt: "2026-01-05", phone: "+86 138-0000-0000", kycVerified: false, twoFactorEnabled: false, referralCode: "HACKBOI2K" },
    { id: "USR-2944", email: "studio_dev@indie.co", balance: 1450.00, bonusCredit: 200.00, rank: "Partner", status: "active", registeredAt: "2026-02-18", phone: "+44 7700 900077", discordId: "IndieDev#1122", kycVerified: true, twoFactorEnabled: true, referralCode: "INDIE_STUDIO" },
    { id: "USR-3312", email: "mc_admin_team@mcserver.net", balance: 45.00, bonusCredit: 5.00, rank: "Gold", status: "active", registeredAt: "2026-03-10", kycVerified: true, twoFactorEnabled: false, referralCode: "MCTEAM" },
  ]);

  const [instances, setInstances] = useState<Instance[]>([
    { id: "SRV-9A8B", userId: "USR-0829", game: "Minecraft", node: "上海 (BGP 高防)", status: "running", cpuUsage: 45, memUsage: 82, planName: "C4M8 性能型", price: 24 },
    { id: "SRV-2C4F", userId: "USR-2944", game: "Rust", node: "法兰克福 (100G 高防)", status: "running", cpuUsage: 88, memUsage: 95, planName: "C8M16 企业型", price: 48 },
    { id: "SRV-7D1E", userId: "USR-3312", game: "CS2", node: "香港 (专线)", status: "stopped", cpuUsage: 0, memUsage: 0, planName: "C2M4 标准型", price: 12 },
    { id: "SRV-5F9A", userId: "USR-0829", game: "Palworld", node: "东京 (大带宽)", status: "installing", cpuUsage: 100, memUsage: 10, planName: "C16M32 旗舰型", price: 96 },
  ]);

  const [transactions] = useState<Transaction[]>([
    { id: "TXN-9091", userId: "USR-0829", date: "2026-04-08 14:22", amount: 50.00, type: "deposit", status: "completed", description: "Stripe 充值 (Visa)", method: "Credit Card (**** 4242)" },
    { id: "TXN-9088", userId: "USR-0829", date: "2026-04-01 00:00", amount: -24.00, type: "payment", status: "completed", description: "包月扣费 - SRV-9A8B", method: "Account Balance" },
    { id: "TXN-9080", userId: "USR-0829", date: "2026-03-30 11:15", amount: -96.00, type: "payment", status: "completed", description: "新购实例 - SRV-5F9A", method: "Account Balance" },
    { id: "TXN-9012", userId: "USR-0829", date: "2026-03-15 09:11", amount: 100.00, type: "deposit", status: "completed", description: "USDT-TRC20 充值", method: "Crypto Wallet (0x...A1b2)" },
    { id: "TXN-9005", userId: "USR-0829", date: "2026-03-10 10:00", amount: 15.00, type: "bonus", status: "completed", description: "邀请奖励 (邀请: USR-3312)", method: "Referral Bonus" },
    { id: "TXN-8099", userId: "USR-1102", date: "2026-01-06 18:45", amount: 20.00, type: "deposit", status: "failed", description: "Stripe 充值 (Mastercard)", method: "Credit Card (**** 5511)" },
  ]);

  const [referrals] = useState<Referral[]>([
    { id: "REF-101", codeOwnerId: "USR-0829", referredUserId: "USR-3312", referredUserEmail: "mc_admin_team@mcserver.net", date: "2026-03-10", bonusEarned: 15.00 },
    { id: "REF-102", codeOwnerId: "USR-0829", referredUserId: "USR-8899", referredUserEmail: "player_one@gmail.com", date: "2026-04-02", bonusEarned: 5.00 },
    { id: "REF-103", codeOwnerId: "USR-2944", referredUserId: "USR-9911", referredUserEmail: "new_studio@indie.co", date: "2026-03-25", bonusEarned: 50.00 },
  ]);

  const [tickets, setTickets] = useState<Ticket[]>([
    { id: "TK-8821", subject: "服务器被 DDOS 攻击，IP 无法访问", user: "USR-2944", priority: "urgent", status: "open", updatedAt: "10 分钟前" },
    { id: "TK-8820", subject: "请问如何为 Rust 伺服器安装特定 Oxide 插件？", user: "USR-0829", priority: "normal", status: "open", updatedAt: "1 小时前" },
    { id: "TK-8815", subject: "季付套餐升降级退款申请", user: "USR-3312", priority: "low", status: "answered", updatedAt: "3 小时前" },
  ]);

  const [settings, setSettings] = useState({
    maintenanceMode: false,
    autoProvision: true,
    newRegistrations: true,
    smtpHost: "smtp.mailgun.org",
    stripeKey: "sk_live_51M..."
  });

  // Handlers for Products
  const startEditingPlan = (plan: Plan) => { setEditingPlanId(plan.id); setEditPlanDraft({ ...plan }); };
  const saveEditingPlan = () => {
    if (editPlanDraft) {
      setPlans(plans.map(p => p.id === editPlanDraft.id ? editPlanDraft : p));
      setEditingPlanId(null);
      setEditPlanDraft(null);
    }
  };
  const deletePlan = (id: string) => setPlans(plans.filter(p => p.id !== id));
  const addNewPlan = () => {
    const newId = `new-${Date.now()}`;
    const newPlan: Plan = { id: newId, name: "新配置套餐", cpu: 1, memory: 1, storage: 20, price: 5 };
    setPlans([...plans, newPlan]);
    startEditingPlan(newPlan);
  };

  // Handlers for Nodes
  const addNodeToRegion = (regionId: string) => {
    if (!newNodeCity || !newNodeLatency) return;
    setGlobalRegions(prev => prev.map(r => {
      if (r.id === regionId) {
        return {
          ...r,
          nodes: [...r.nodes, {
            id: `node-${Date.now()}`,
            city: newNodeCity,
            latency: newNodeLatency,
            publicIp: "Pending...",
            bandwidth: "1 Gbps",
            cpuSpec: "Standard 16C",
            ramSpec: "64GB DDR4",
            status: "offline",
            supportedGames: []
          }]
        };
      }
      return r;
    }));
    setNewNodeCity("");
    setNewNodeLatency("");
    setEditingRegionId(null);
  };

  const deleteNode = (regionId: string, nodeId: string) => {
    setGlobalRegions(prev => prev.map(r => r.id === regionId ? { ...r, nodes: r.nodes.filter(n => n.id !== nodeId) } : r));
  };

  const addNewRegion = () => {
    const newRegion: GlobalRegion = { id: `region-${Date.now()}`, label: "New Region", nodes: [] };
    setGlobalRegions(prev => [...prev, newRegion]);
  };

  const toggleNodeGame = (nodeId: string, gameId: string) => {
    setGlobalRegions(prev => prev.map(r => ({
      ...r,
      nodes: r.nodes.map(n => {
        if (n.id === nodeId) {
          const hasGame = n.supportedGames.includes(gameId);
          return {
            ...n,
            supportedGames: hasGame 
              ? n.supportedGames.filter(g => g !== gameId)
              : [...n.supportedGames, gameId]
          };
        }
        return n;
      })
    })));
    if (selectedPhysicalNode && selectedPhysicalNode.id === nodeId) {
      setSelectedPhysicalNode(prev => {
        if (!prev) return prev;
        const hasGame = prev.supportedGames.includes(gameId);
        return {
          ...prev,
          supportedGames: hasGame
            ? prev.supportedGames.filter(g => g !== gameId)
            : [...prev.supportedGames, gameId]
        };
      });
    }
  };

  // Handlers for Docs
  const deleteDoc = (id: number) => setDocs(docs.filter(d => d.id !== id));
  const toggleDocStatus = (id: number) => {
    setDocs(docs.map(d => d.id === id ? { ...d, status: d.status === "published" ? "draft" : "published" } : d));
  };
  const addNewDoc = () => {
    const newDoc: Doc = {
      id: Date.now(), title: "新文章标题", category: "未分类", date: new Date().toISOString().split('T')[0], status: "draft"
    };
    setDocs([newDoc, ...docs]);
  };

  // Admin Top Navigation Items
  const navTabs = [
    { id: "overview", label: "面板总览", icon: LayoutDashboard },
    { id: "users", label: "用户管理", icon: Users },
    { id: "instances", label: "实例监控", icon: Terminal },
    { id: "products", label: "产品与价格", icon: Package },
    { id: "nodes", label: "节点与机房配置", icon: MapPin },
    { id: "tickets", label: "客服工单", icon: MessageSquare },
    { id: "docs", label: "文档与资源", icon: FileText },
    { id: "settings", label: "系统设置", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-[#030303] text-slate-200 pt-20 pb-32">
      {/* Background Cyberpunk Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[150px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-900/10 rounded-full blur-[150px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] mask-image-[radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Admin Top Navigation */}
        <div className="flex flex-col gap-6 mb-12 pt-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-emerald-400" /> 控制台 (Admin Center)
            </h1>
            <p className="text-zinc-400 mt-2">在这里管理产品价格、增加新节点与编辑支持文档。</p>
          </div>

          <div className="w-full overflow-x-auto pb-4 -mb-4 scrollbar-hide">
            <nav className="flex items-center gap-2 bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl w-max min-w-full lg:min-w-0 lg:w-fit">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative overflow-hidden whitespace-nowrap ${
                      isActive 
                        ? "text-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <main className="min-h-[60vh]">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                    <span className="text-zinc-400 text-sm font-bold flex items-center gap-2"><Server className="w-4 h-4" /> 活跃实例</span>
                    <span className="text-4xl font-black text-white mt-4">1,492</span>
                    <span className="text-xs text-emerald-400 mt-2 font-mono">+12% vs 上月</span>
                  </div>
                  <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                    <span className="text-zinc-400 text-sm font-bold flex items-center gap-2"><Activity className="w-4 h-4" /> 总频宽消耗</span>
                    <span className="text-4xl font-black text-white mt-4">18.4 <span className="text-2xl text-zinc-500">Tbps</span></span>
                    <span className="text-xs text-blue-400 mt-2 font-mono">峰值负载 89%</span>
                  </div>
                  <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
                    <span className="text-zinc-400 text-sm font-bold flex items-center gap-2"><Users className="w-4 h-4" /> 注册用户</span>
                    <span className="text-4xl font-black text-white mt-4">8,204</span>
                    <span className="text-xs text-purple-400 mt-2 font-mono">+234 本周新增</span>
                  </div>
                  <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
                    <span className="text-zinc-400 text-sm font-bold flex items-center gap-2"><DollarSign className="w-4 h-4" /> 月度营收</span>
                    <span className="text-4xl font-black text-white mt-4">$84.2K</span>
                    <span className="text-xs text-cyan-400 mt-2 font-mono">+18% vs 上月</span>
                  </div>
                </div>

                {/* Enhanced Network & Traffic Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                  {/* Charts Area */}
                  <div className="lg:col-span-2 bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-6 relative z-10">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-cyan-400" /> 全网活跃与流量趋势
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
                          <span className="text-zinc-400">并发 IP</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]"></span>
                          <span className="text-zinc-400">总宽带 (Gbps)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full relative z-10 h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient key="ip" id="colorActiveIPs" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient key="bw" id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 0 20px rgba(0,0,0,0.8)' }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#a1a1aa', fontSize: '10px', marginBottom: '4px' }}
                          />
                          <Area key="area-ip" type="monotone" dataKey="activeIPs" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorActiveIPs)" />
                          <Area key="area-bw" type="monotone" dataKey="bandwidth" stroke="#c084fc" strokeWidth={2} fillOpacity={1} fill="url(#colorBandwidth)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Security & Network Stats Column */}
                  <div className="flex flex-col gap-4">
                    {/* Active Connections */}
                    <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-5 flex flex-col relative overflow-hidden group">
                      <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-zinc-400 text-xs font-bold flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-cyan-400" /> 当前浏览器活跃</span>
                        <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 animate-pulse">Live</span>
                      </div>
                      <div className="flex items-end gap-3">
                        <span className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                          4,180
                        </span>
                        <span className="text-xs text-zinc-500 font-mono mb-1">连线 IP</span>
                      </div>
                      <div className="mt-3 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full w-[76%] shadow-[0_0_10px_#22d3ee]"></div>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-2 text-right w-full">负载率 76%</span>
                    </div>

                    {/* Failed Logins */}
                    <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-5 flex flex-col relative overflow-hidden group">
                      <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-zinc-400 text-xs font-bold flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5 text-yellow-400" /> 密码错误拦截</span>
                        <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full">24H</span>
                      </div>
                      <div className="flex items-end gap-3">
                        <span className="text-3xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                          842
                        </span>
                        <span className="text-xs text-zinc-500 font-mono mb-1">次尝试</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-yellow-500/80">32 个账号存在暴力破解风险</span>
                      </div>
                    </div>

                    {/* Banned IPs */}
                    <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-red-500/20 rounded-3xl p-5 flex flex-col relative overflow-hidden group flex-1">
                      <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-zinc-400 text-xs font-bold flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-red-400" /> 恶意 IP 封锁拦截</span>
                        <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full">All Time</span>
                      </div>
                      <div className="flex items-end gap-3 mt-auto mb-2">
                        <span className="text-4xl font-black text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.4)]">
                          12,045
                        </span>
                      </div>
                      <div className="text-[10px] text-red-400/80 flex items-center justify-between border-t border-red-500/10 pt-2 mt-2">
                        <span>今日新增封锁: <b className="text-red-400">+128</b></span>
                        <button className="hover:text-white transition-colors underline">查看防火墙</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
                    <span className="text-zinc-400 text-sm font-bold flex items-center gap-2 mb-4"><Settings className="w-4 h-4" /> 系统健康状态</span>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-zinc-300">亚洲区网络节点</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> 正常运行</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-zinc-300">美洲区储存集群</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> 正常运行</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pb-1">
                        <span className="text-zinc-300">欧洲法兰克福��洗中心</span>
                        <span className="text-orange-400 font-bold flex items-center gap-1"><Zap className="w-3.5 h-3.5"/> 负载偏高 (85%)</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-6 flex flex-col relative overflow-hidden md:col-span-2 shadow-sm">
                    <span className="text-zinc-400 text-sm font-bold flex items-center gap-2 mb-4"><MessageSquare className="w-4 h-4" /> 最新待处理工单</span>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm border-b border-zinc-800/60 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[11px] font-bold"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div> 紧急</span>
                          <span className="text-zinc-200 font-medium hover:text-emerald-400 transition-colors cursor-pointer truncate max-w-[200px] sm:max-w-xs">服务器被 DDOS 攻击，IP 无法访问</span>
                        </div>
                        <span className="text-zinc-500 text-xs font-mono">10 分钟前</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-zinc-800/60 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[11px] font-bold"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> 一般</span>
                          <span className="text-zinc-200 font-medium hover:text-emerald-400 transition-colors cursor-pointer truncate max-w-[200px] sm:max-w-xs">请问如何为 Rust 伺服器安装特定 Oxide 插件？</span>
                        </div>
                        <span className="text-zinc-500 text-xs font-mono">1 小时前</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pb-1">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 rounded text-[11px] font-bold"><div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div> 财务</span>
                          <span className="text-zinc-200 font-medium hover:text-emerald-400 transition-colors cursor-pointer truncate max-w-[200px] sm:max-w-xs">季付套餐升降级退款申请</span>
                        </div>
                        <span className="text-zinc-500 text-xs font-mono">3 小时前</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === "products" && (
              <ProductsBillingTabV2 key="products" />
            )}

            {/* FLAT ENTERPRISE DATACENTER NODES */}
            {activeTab === "nodes" && !selectedPhysicalNode && !selectedRegionId && (
              <motion.div key="nodes-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full">
                
                <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-20">
                  
                  {/* Page Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
                    <div>
                      <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2.5">
                        <Server className="w-5 h-5 text-zinc-400" />
                        Physical Datacenters
                      </h2>
                      <p className="text-zinc-500 text-sm mt-1.5">Manage physical host servers and global routing regions.</p>
                    </div>
                    
                    <div className="flex items-center gap-8 text-sm bg-[#111] border border-zinc-800/80 rounded-xl px-5 py-3 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-zinc-500 text-xs mb-0.5 uppercase tracking-wider font-semibold">Total Hosts</span>
                        <span className="text-zinc-200 font-bold text-base">{globalRegions.reduce((acc, r) => acc + r.nodes.length, 0)}</span>
                      </div>
                      <div className="w-px h-8 bg-zinc-800/80"></div>
                      <div className="flex flex-col">
                        <span className="text-zinc-500 text-xs mb-0.5 uppercase tracking-wider font-semibold">Global Capacity</span>
                        <span className="text-zinc-200 font-bold text-base">84.2 Tbps</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <button onClick={addNewRegion} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-sm font-bold transition-colors shadow-sm">
                      <Plus className="w-4 h-4" /> Add Datacenter Region
                    </button>
                  </div>

                  {/* Regions Grid (Cards only) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                     {globalRegions.map(region => (
                        <div key={region.id} className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-600 transition-colors cursor-pointer flex flex-col group shadow-sm" onClick={() => setSelectedRegionId(region.id)}>
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-lg bg-[#111] border border-zinc-800 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                                 </div>
                                 <div>
                                    <h3 className="text-base font-bold text-zinc-100">{region.label}</h3>
                                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">{region.id}</span>
                                 </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4 mt-2">
                              <div className="flex flex-col bg-[#0a0a0c] border border-zinc-800/60 rounded-lg p-3">
                                 <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Physical Hosts</span>
                                 <span className="text-xl font-bold text-zinc-200 font-mono">{region.nodes.length}</span>
                              </div>
                              <div className="flex flex-col bg-[#0a0a0c] border border-zinc-800/60 rounded-lg p-3">
                                 <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Status</span>
                                 <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div> Operational
                                 </span>
                              </div>
                           </div>
                           
                           <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                              <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-mono"><Activity className="w-3.5 h-3.5 text-zinc-400" /> CPU: 42%</span>
                              <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-mono"><MemoryStick className="w-3.5 h-3.5 text-zinc-400" /> RAM: 68%</span>
                           </div>
                        </div>
                     ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* REGION DETAIL VIEW */}
            {activeTab === "nodes" && selectedRegionId && !selectedPhysicalNode && (() => {
               const region = globalRegions.find(r => r.id === selectedRegionId);
               if (!region) return null;
               
               return (
                 <motion.div key="region-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
                   <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-20">
                     
                     {/* Breadcrumbs & Header */}
                     <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <button onClick={() => setSelectedRegionId(null)} className="hover:text-zinc-200 transition-colors">Datacenters</button>
                          <span>/</span>
                          <span className="text-zinc-100 font-medium">{region.label}</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-[#111] border border-zinc-800 flex items-center justify-center shadow-sm">
                                <Globe className="w-6 h-6 text-zinc-300" />
                             </div>
                             <div>
                                <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                                   {region.label} Cluster
                                   <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ONLINE</span>
                                </h2>
                                <p className="text-sm text-zinc-500 mt-1 font-mono uppercase tracking-wider">{region.id}</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-3">
                             <button className="px-4 py-2 border border-zinc-700 bg-[#0c0c0e] hover:bg-zinc-800 text-zinc-200 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                               <Settings2 className="w-4 h-4" /> Region Settings
                             </button>
                             <button className="px-4 py-2 bg-zinc-100 text-zinc-900 hover:bg-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm">
                               <Plus className="w-4 h-4" /> Deploy Host
                             </button>
                           </div>
                        </div>
                     </div>
                     
                     {/* Cluster Average Usage Stats */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Cluster CPU</span>
                            <span className="text-xs font-mono text-emerald-400">42%</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" style={{width: '42%'}}></div>
                          </div>
                          <span className="text-[11px] text-zinc-500">2,480 Cores Allocated</span>
                        </div>

                        <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><MemoryStick className="w-3.5 h-3.5" /> Cluster RAM</span>
                            <span className="text-xs font-mono text-orange-400">68%</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                             <div className="h-full bg-orange-400 rounded-full shadow-[0_0_8px_rgba(251,146,60,0.5)]" style={{width: '68%'}}></div>
                          </div>
                          <span className="text-[11px] text-zinc-500">12.5 TB / 18.4 TB Used</span>
                        </div>

                        <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> Cluster Storage</span>
                            <span className="text-xs font-mono text-zinc-300">31%</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                             <div className="h-full bg-zinc-400 rounded-full" style={{width: '31%'}}></div>
                          </div>
                          <span className="text-[11px] text-zinc-500">450 TB NVMe Available</span>
                        </div>

                        <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><Network className="w-3.5 h-3.5" /> Network Uplink</span>
                            <span className="text-xs font-mono text-emerald-400">15%</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" style={{width: '15%'}}></div>
                          </div>
                          <span className="text-[11px] text-zinc-500">42 Gbps / 200 Gbps Peak</span>
                        </div>
                     </div>

                     {/* Server Host List */}
                     <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm flex flex-col mt-2">
                        <div className="flex items-center justify-between p-5 border-b border-zinc-800/80 bg-[#111]/50">
                           <div>
                              <h3 className="text-base font-bold text-zinc-200">Physical Hosts</h3>
                              <p className="text-xs text-zinc-500 mt-1">Servers provisioned within this datacenter.</p>
                           </div>
                           <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                              <input type="text" placeholder="Search hosts..." className="bg-[#0a0a0c] border border-zinc-800/80 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors w-64" />
                           </div>
                        </div>
                        
                        {/* Table */}
                        <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead className="bg-[#0a0a0c] text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800/80">
                                <tr>
                                  <th className="py-4 px-6">Host ID / Location</th>
                                  <th className="py-4 px-6">Status</th>
                                  <th className="py-4 px-6">Public IP</th>
                                  <th className="py-4 px-6">Hardware Spec</th>
                                  <th className="py-4 px-6">Allocated Games</th>
                                  <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-800/40 bg-[#0c0c0e]">
                                {region.nodes.map((node) => (
                                  <tr key={node.id} className="hover:bg-zinc-800/30 transition-colors group cursor-pointer" onClick={() => setSelectedPhysicalNode(node)}>
                                    <td className="py-4 px-6">
                                      <div className="flex items-center gap-3">
                                        <HardDrive className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                                        <div className="flex flex-col">
                                          <span className="font-medium text-zinc-200">{node.city}</span>
                                          <span className="text-[11px] text-zinc-500 font-mono mt-0.5">{node.id}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-4 px-6">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`}></div>
                                        <span className="text-[13px] text-zinc-300 capitalize font-medium">{node.status}</span>
                                      </div>
                                    </td>
                                    <td className="py-4 px-6">
                                       <span className="text-[13px] text-zinc-400 font-mono">{node.publicIp}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                       <div className="flex flex-col gap-0.5">
                                          <span className="text-[13px] text-zinc-300">{node.cpuSpec}</span>
                                          <span className="text-[11px] text-zinc-500">{node.ramSpec}</span>
                                       </div>
                                    </td>
                                    <td className="py-4 px-6">
                                      <div className="flex -space-x-1.5">
                                        {node.supportedGames.slice(0, 3).map(gameId => {
                                          const game = gamesList.find(g => g.id === gameId);
                                          return game ? (
                                            <div key={gameId} className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-[10px] shadow-sm z-10 hover:z-20 hover:-translate-y-0.5 transition-transform" title={game.name}>
                                              {game.icon}
                                            </div>
                                          ) : null;
                                        })}
                                        {node.supportedGames.length > 3 && (
                                          <div className="w-6 h-6 rounded-full bg-[#111] border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400 font-medium z-10">
                                            +{node.supportedGames.length - 3}
                                          </div>
                                        )}
                                        {node.supportedGames.length === 0 && <span className="text-xs text-zinc-600">None</span>}
                                      </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); deleteNode(region.id, node.id); }} className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-400/10">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                                {region.nodes.length === 0 && (
                                   <tr>
                                      <td colSpan={6} className="py-12 text-center text-zinc-500 text-sm bg-[#0a0a0c]">
                                         No physical hosts deployed in this region yet.
                                      </td>
                                   </tr>
                                )}
                              </tbody>
                           </table>
                        </div>
                        
                        {/* Footer (Add physical host fast action) */}
                        <div className="p-4 bg-[#111]/50 border-t border-zinc-800/80">
                          {editingRegionId === region.id ? (
                            <div className="flex flex-col sm:flex-row gap-3">
                              <input type="text" placeholder="City (e.g. Tokyo)" value={newNodeCity} onChange={e => setNewNodeCity(e.target.value)} className="flex-1 bg-[#0a0a0c] border border-zinc-700/80 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-all shadow-inner" />
                              <input type="text" placeholder="Latency (e.g. 45ms)" value={newNodeLatency} onChange={e => setNewNodeLatency(e.target.value)} className="flex-1 bg-[#0a0a0c] border border-zinc-700/80 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-all shadow-inner" />
                              <button onClick={() => addNodeToRegion(region.id)} className="bg-zinc-200 hover:bg-white text-zinc-900 px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm">
                                Add
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setEditingRegionId(region.id)} className="w-full py-3 border border-dashed border-zinc-700/80 hover:border-zinc-500 rounded-lg text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center gap-2 hover:bg-zinc-800/20">
                              <Plus className="w-4 h-4" /> Quick Add Host
                            </button>
                          )}
                        </div>
                     </div>
                     
                   </div>
                 </motion.div>
               );
            })()}

            {/* Server Detail Page */}
            {activeTab === "nodes" && selectedPhysicalNode && (
               <motion.div key="node-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-[1200px] mx-auto">
                 
                 {/* Detail Header */}
                 <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-800/80">
                   <button onClick={() => setSelectedPhysicalNode(null)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors">
                     <ArrowLeft className="w-5 h-5" />
                   </button>
                   <div>
                     <div className="flex items-center gap-3">
                       <h2 className="text-2xl font-bold text-zinc-100">{selectedPhysicalNode.city} Host</h2>
                       <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50">
                         <div className={`w-2 h-2 rounded-full ${selectedPhysicalNode.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                         <span className="text-xs font-semibold text-zinc-300 capitalize">{selectedPhysicalNode.status}</span>
                       </div>
                     </div>
                     <div className="text-sm text-zinc-500 font-mono mt-1">{selectedPhysicalNode.id}</div>
                   </div>
                 </div>

                 <div className="flex flex-col gap-12 bg-[#0c0c0e] p-8 border border-zinc-800/80 rounded-xl shadow-sm mt-4">
                   
                   {/* Instance Summary */}
                   <section>
                     <h3 className="text-lg font-bold text-zinc-100 mb-6 border-b border-zinc-800/80 pb-3">Instance summary</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12">
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Instance ID</span>
                         <span className="text-[15px] text-zinc-200 font-mono flex items-center gap-2">{selectedPhysicalNode.id} <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" /></span>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Public IPv4 address</span>
                         <span className="text-[15px] text-zinc-200 font-mono">{selectedPhysicalNode.publicIp}</span>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Private IPv4 address</span>
                         <span className="text-[15px] text-zinc-200 font-mono">10.0.{Math.floor(Math.random()*255)}.{Math.floor(Math.random()*255)}</span>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Public IPv4 DNS</span>
                         <span className="text-[15px] text-zinc-200 font-mono truncate" title={`ec2-${selectedPhysicalNode.publicIp.replace(/\./g, '-')}.compute-1.amazonaws.com`}>
                           ec2-{selectedPhysicalNode.publicIp.replace(/\./g, '-')}.compute-1.amazonaws.com
                         </span>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Private IPv4 DNS</span>
                         <span className="text-[15px] text-zinc-200 font-mono truncate">ip-10-0-internal.ec2.internal</span>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Instance state</span>
                         <span className="text-[15px] text-emerald-400 font-medium capitalize">Running</span>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Platform details</span>
                         <span className="text-[15px] text-zinc-200">Ubuntu 22.04 LTS (Jammy Jellyfish)</span>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Kernel ID</span>
                         <span className="text-[15px] text-zinc-200 font-mono">5.15.0-88-generic</span>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Bandwidth Capacity</span>
                         <span className="text-[15px] text-zinc-200">{selectedPhysicalNode.bandwidth}</span>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Anti-DDoS Firewall</span>
                         <span className="text-[15px] text-zinc-200">Active (BGP Anycast)</span>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Base Latency</span>
                         <span className="text-[15px] text-zinc-200 font-mono">{selectedPhysicalNode.latency}</span>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Uptime</span>
                         <span className="text-[15px] text-zinc-200 font-mono">41 days, 12:45:00</span>
                       </div>
                     </div>
                   </section>

                   {/* Hardware Specifications */}
                   <section>
                     <h3 className="text-lg font-bold text-zinc-100 mb-6 border-b border-zinc-800/80 pb-3">Hardware specifications</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12">
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Processor (CPU)</span>
                         <span className="text-[15px] text-zinc-200">{selectedPhysicalNode.cpuSpec}</span>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Architecture</span>
                         <span className="text-[15px] text-zinc-200">x86_64</span>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Memory (RAM)</span>
                         <span className="text-[15px] text-zinc-200">{selectedPhysicalNode.ramSpec}</span>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <span className="text-[13px] text-zinc-500 font-medium">Memory Type</span>
                         <span className="text-[15px] text-zinc-200">ECC DDR5 4800MHz</span>
                       </div>
                     </div>
                   </section>

                   {/* Storage Configuration */}
                   <section>
                     <h3 className="text-lg font-bold text-zinc-100 mb-6 border-b border-zinc-800/80 pb-3">Storage configuration</h3>
                     <div className="flex flex-col gap-2">
                       <div className="grid grid-cols-12 gap-4 py-2 text-[13px] font-medium text-zinc-500 uppercase tracking-wider">
                         <div className="col-span-2">Volume ID</div>
                         <div className="col-span-2">Device</div>
                         <div className="col-span-3">Model</div>
                         <div className="col-span-2">Capacity</div>
                         <div className="col-span-3">Usage Type</div>
                       </div>
                       <div className="grid grid-cols-12 gap-4 py-3 text-[15px] text-zinc-200 border-t border-zinc-800/40">
                         <div className="font-mono text-zinc-400 col-span-2">vol-0a1b2c3d4e</div>
                         <div className="font-mono col-span-2">/dev/nvme0n1</div>
                         <div className="col-span-3 truncate">Samsung PM9A3 M.2 NVMe</div>
                         <div className="col-span-2">1024 GB</div>
                         <div className="col-span-3 flex items-center">
                           <span className="text-emerald-400 text-xs font-semibold py-1 px-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded w-fit">Boot / System</span>
                         </div>
                       </div>
                       <div className="grid grid-cols-12 gap-4 py-3 text-[15px] text-zinc-200 border-t border-zinc-800/40">
                         <div className="font-mono text-zinc-400 col-span-2">vol-9f8e7d6c5b</div>
                         <div className="font-mono col-span-2">/dev/nvme1n1</div>
                         <div className="col-span-3 truncate">Micron 7450 PRO U.2 NVMe</div>
                         <div className="col-span-2">3840 GB</div>
                         <div className="col-span-3 flex items-center">
                           <span className="text-blue-400 text-xs font-semibold py-1 px-2.5 bg-blue-500/10 border border-blue-500/20 rounded w-fit">Game Data</span>
                         </div>
                       </div>
                       <div className="grid grid-cols-12 gap-4 py-3 text-[15px] text-zinc-200 border-t border-zinc-800/40">
                         <div className="font-mono text-zinc-400 col-span-2">vol-1a2b3c4d5e</div>
                         <div className="font-mono col-span-2">/dev/sda1</div>
                         <div className="col-span-3 truncate">Seagate Exos X20 SATA HDD</div>
                         <div className="col-span-2">18000 GB</div>
                         <div className="col-span-3 flex items-center">
                           <span className="text-purple-400 text-xs font-semibold py-1 px-2.5 bg-purple-500/10 border border-purple-500/20 rounded w-fit">Cold Backup</span>
                         </div>
                       </div>
                     </div>
                   </section>

                   {/* Service Allocation */}
                   <section>
                     <div className="flex items-center justify-between mb-6 border-b border-zinc-800/80 pb-3">
                       <h3 className="text-lg font-bold text-zinc-100">Service allocation</h3>
                       <span className="text-xs font-medium text-zinc-500">Toggle allowed game instances</span>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       {gamesList.map(game => {
                         const isEnabled = selectedPhysicalNode.supportedGames.includes(game.id);
                         return (
                           <div key={game.id} className={`flex items-center justify-between p-4 rounded-xl border ${isEnabled ? 'bg-zinc-800/30 border-zinc-700' : 'bg-[#111] border-zinc-800/60'} hover:border-zinc-600 transition-colors cursor-pointer`} onClick={() => toggleNodeGame(selectedPhysicalNode.id, game.id)}>
                             <div className="flex items-center gap-3.5">
                               <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${isEnabled ? 'bg-zinc-800' : 'bg-zinc-900'} shadow-sm`}>{game.icon}</div>
                               <span className={`text-[15px] font-semibold ${isEnabled ? 'text-zinc-100' : 'text-zinc-400'}`}>{game.name}</span>
                             </div>
                             
                             <div className={`relative w-12 h-6 rounded-full transition-colors ${isEnabled ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                               <span className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-all ${isEnabled ? 'bg-zinc-900 translate-x-6' : 'bg-zinc-500 translate-x-0'}`}></span>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </section>

                 </div>
               </motion.div>
            )}

            {/* DOCS TAB */}
            {activeTab === "docs" && (
              <motion.div key="docs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-purple-400" /> 支持文档管理</h2>
                  <button onClick={addNewDoc} className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-2">
                    <Plus className="w-4 h-4" /> 撰写新文章
                  </button>
                </div>

                <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="flex items-center p-4 border-b border-white/5 bg-black/40">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input type="text" placeholder="搜索文档..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-6 p-4 border-b border-white/5 bg-black/20 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <div className="w-10 text-center">ID</div>
                    <div>文章标题</div>
                    <div className="w-32">分类</div>
                    <div className="w-24">状态</div>
                    <div className="w-24 text-right">操作</div>
                  </div>
                  
                  <div className="flex flex-col">
                    {docs.map((doc) => (
                      <div key={doc.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-6 p-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                        <div className="w-10 text-center text-xs text-zinc-600 font-mono">{doc.id}</div>
                        <div>
                          <div className="font-bold text-white text-sm hover:text-purple-400 transition-colors cursor-pointer flex items-center gap-2">
                            {doc.title} <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                          </div>
                          <div className="text-xs text-zinc-500 mt-1">最后更新: {doc.date}</div>
                        </div>
                        <div className="w-32">
                          <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-medium text-zinc-300">
                            {doc.category}
                          </span>
                        </div>
                        <div className="w-24">
                          <button 
                            onClick={() => toggleDocStatus(doc.id)}
                            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                              doc.status === 'published' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {doc.status === 'published' ? <CheckCircle2 className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
                            {doc.status === 'published' ? '已发布' : '草稿'}
                          </button>
                        </div>
                        <div className="w-24 flex justify-end gap-2">
                          <button className="p-2 bg-white/5 text-zinc-400 rounded-lg hover:bg-white/20 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => deleteDoc(doc.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* USERS TAB */}
            {activeTab === "users" && !selectedUserId && (
              <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-blue-400" /> 用户管理与控制</h2>
                  <button className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
                    <Plus className="w-4 h-4" /> 邀请用户
                  </button>
                </div>

                <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="flex items-center p-4 border-b border-white/5 bg-black/40">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input type="text" placeholder="搜索邮箱或用户 ID..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-[100px_1fr_120px_100px_120px] gap-6 p-4 border-b border-white/5 bg-black/20 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <div>用户 ID</div>
                    <div>注册邮箱 / 等级</div>
                    <div>账户资产</div>
                    <div>账户状态</div>
                    <div className="text-right">操作</div>
                  </div>
                  
                  <div className="flex flex-col">
                    {users.map((user) => (
                      <div key={user.id} className="grid grid-cols-[100px_1fr_120px_100px_120px] gap-6 p-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                        <div className="text-xs text-zinc-500 font-mono">{user.id}</div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="avatar" className="w-6 h-6 rounded-full bg-white/10" />
                            {user.email}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            {user.rank === 'Bronze' && <span className="flex items-center gap-1 text-[10px] font-bold text-[#cd7f32] bg-[#cd7f32]/10 px-1.5 py-0.5 rounded border border-[#cd7f32]/20"><Star className="w-3 h-3" /> 青铜会员</span>}
                            {user.rank === 'Silver' && <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-300 bg-white/10 px-1.5 py-0.5 rounded border border-white/20"><Star className="w-3 h-3" /> 白银会员</span>}
                            {user.rank === 'Gold' && <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20"><Crown className="w-3 h-3" /> 黄金会员</span>}
                            {user.rank === 'Diamond' && <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20"><Trophy className="w-3 h-3" /> 钻石会员</span>}
                            {user.rank === 'Partner' && <span className="flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20"><LinkIcon className="w-3 h-3" /> 商业伙伴</span>}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-mono text-emerald-400 font-bold">${user.balance.toFixed(2)}</div>
                          <div className="text-[10px] font-mono text-purple-400 mt-0.5 flex items-center gap-1" title="推广虚拟额度"><Gift className="w-2.5 h-2.5" /> ${user.bonusCredit.toFixed(2)}</div>
                        </div>
                        <div>
                          {user.status === 'active' ? (
                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-medium flex items-center gap-1.5 w-fit"><CheckCircle2 className="w-3 h-3"/> 正常</span>
                          ) : (
                            <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-xs font-medium flex items-center gap-1.5 w-fit"><ShieldBan className="w-3 h-3"/> 封禁</span>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedUserId(user.id); setIsEditingRank(false); }}
                            className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs rounded-lg hover:bg-blue-500 hover:text-black transition-colors shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                          >
                            查看详情
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* USER DETAIL VIEW (Overrides activeTab visually if selectedUserId is set) */}
            {selectedUserId && activeTab === "users" && (() => {
              const user = users.find(u => u.id === selectedUserId);
              if (!user) return null;
              
              const userInstances = instances.filter(i => i.userId === user.id);
              const userTxns = transactions.filter(t => t.userId === user.id);
              const userReferrals = referrals.filter(r => r.codeOwnerId === user.id);
              const totalReferralBonus = userReferrals.reduce((sum, r) => sum + r.bonusEarned, 0);
              
              return (
                <motion.div key={`user-detail-${user.id}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <button 
                      onClick={() => { setSelectedUserId(null); setIsEditingRank(false); }}
                      className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors w-fit"
                    >
                      <ArrowLeft className="w-5 h-5" /> 返回用户列表
                    </button>
                    <div className="flex flex-wrap gap-3">
                      <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                        重置密码
                      </button>
                      <button 
                        className={`px-4 py-2 rounded-xl border text-sm font-bold transition-colors ${
                          user.status === 'active' ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black'
                        }`}
                        onClick={() => setUsers(users.map(u => u.id === user.id ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u))}
                      >
                        {user.status === 'active' ? '封禁此用户' : '解除封禁'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-6">
                    {/* Left Column: User Profile & Balance */}
                    <div className="space-y-6">
                      
                      {/* Profile Card */}
                      <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="flex flex-col items-center text-center">
                          <div className="relative">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="avatar" className="w-24 h-24 rounded-full bg-white/5 border-4 border-[#0a0a0c] shadow-[0_0_20px_rgba(59,130,246,0.3)] relative z-10" />
                            {user.status === 'active' ? (
                              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-[#0a0a0c] rounded-full z-20"></div>
                            ) : (
                              <div className="absolute bottom-1 right-1 w-5 h-5 bg-red-500 border-4 border-[#0a0a0c] rounded-full z-20 flex items-center justify-center"><X className="w-2 h-2 text-white" /></div>
                            )}
                          </div>
                          <h3 className="text-xl font-black text-white mt-4 flex items-center gap-2">
                            {user.email}
                          </h3>
                          <div className="relative mt-2 flex flex-col items-center">
                            <button 
                              onClick={() => setIsEditingRank(!isEditingRank)}
                              className="flex items-center gap-1.5 cursor-pointer group hover:scale-105 transition-transform"
                              title="点击修改等级"
                            >
                              {user.rank === 'Bronze' && <span className="flex items-center gap-1 text-[10px] font-bold text-[#cd7f32] bg-[#cd7f32]/10 px-2 py-0.5 rounded border border-[#cd7f32]/20 uppercase"><Star className="w-3 h-3" /> Bronze</span>}
                              {user.rank === 'Silver' && <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-300 bg-white/10 px-2 py-0.5 rounded border border-white/20 uppercase"><Star className="w-3 h-3" /> Silver</span>}
                              {user.rank === 'Gold' && <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 uppercase"><Crown className="w-3 h-3" /> Gold</span>}
                              {user.rank === 'Diamond' && <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase"><Trophy className="w-3 h-3" /> Diamond</span>}
                              {user.rank === 'Partner' && <span className="flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase"><LinkIcon className="w-3 h-3" /> Partner</span>}
                              <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 className="w-3 h-3 text-zinc-400" />
                              </div>
                            </button>

                            <AnimatePresence>
                              {isEditingRank && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                  className="absolute top-full mt-2 w-32 bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50 flex flex-col p-1.5 overflow-hidden"
                                >
                                  {(['Bronze', 'Silver', 'Gold', 'Diamond', 'Partner'] as User['rank'][]).map(r => (
                                    <button 
                                      key={r}
                                      onClick={() => {
                                        setUsers(users.map(u => u.id === user.id ? { ...u, rank: r } : u));
                                        setIsEditingRank(false);
                                      }}
                                      className={`text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors hover:bg-white/10 ${user.rank === r ? 'bg-white/5 text-white' : 'text-zinc-400'}`}
                                    >
                                      {r === 'Bronze' && <span className="flex items-center gap-2 text-[#cd7f32]"><Star className="w-3 h-3" /> 青铜</span>}
                                      {r === 'Silver' && <span className="flex items-center gap-2 text-zinc-300"><Star className="w-3 h-3" /> 白银</span>}
                                      {r === 'Gold' && <span className="flex items-center gap-2 text-yellow-400"><Crown className="w-3 h-3" /> 黄金</span>}
                                      {r === 'Diamond' && <span className="flex items-center gap-2 text-cyan-400"><Trophy className="w-3 h-3" /> 钻石</span>}
                                      {r === 'Partner' && <span className="flex items-center gap-2 text-purple-400"><LinkIcon className="w-3 h-3" /> 伙伴</span>}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <span className="text-xs font-mono text-zinc-500 mt-2">{user.id}</span>
                          <span className="text-xs text-zinc-400 mt-1">注册于 {user.registeredAt}</span>
                        </div>

                        <div className="h-px w-full bg-white/10 my-6"></div>

                        {/* Balance */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/40 border border-blue-500/20 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-xs font-bold text-zinc-400 mb-1 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> 真实余额</span>
                            <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                              ${user.balance.toFixed(2)}
                            </span>
                            <button className="mt-3 w-full py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-[10px] rounded-lg transition-colors border border-blue-500/30 flex justify-center items-center gap-1 relative z-10">
                              <Plus className="w-3 h-3" /> 加扣款
                            </button>
                          </div>
                          
                          <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-xs font-bold text-zinc-400 mb-1 flex items-center gap-1.5"><Gift className="w-3.5 h-3.5 text-purple-400" /> 推广赠金</span>
                            <span className="text-2xl font-black text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                              ${user.bonusCredit.toFixed(2)}
                            </span>
                            <button className="mt-3 w-full py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-[10px] rounded-lg transition-colors border border-purple-500/30 flex justify-center items-center gap-1 relative z-10">
                              <Edit2 className="w-3 h-3" /> 修改额度
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Bound Identity Info */}
                      <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-purple-400" /> 身份与安全绑定</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                            <div className="flex items-center gap-3 text-zinc-400"><LinkIcon className="w-4 h-4 text-purple-400" /> 邀请码</div>
                            <div className="flex items-center gap-2">
                              <span className="text-purple-400 font-mono font-bold bg-purple-500/10 px-2 py-0.5 rounded text-xs border border-purple-500/20">{user.referralCode}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3 text-zinc-400"><Smartphone className="w-4 h-4" /> 手机号码</div>
                            <div className="text-white font-mono">{user.phone || <span className="text-zinc-600 italic">未绑定</span>}</div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3 text-zinc-400"><MessageSquare className="w-4 h-4" /> Discord</div>
                            <div className="text-white font-mono">{user.discordId || <span className="text-zinc-600 italic">未绑定</span>}</div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3 text-zinc-400"><CheckCircle2 className="w-4 h-4" /> 身份认证 (KYC)</div>
                            <div>
                              {user.kycVerified ? <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-xs">已认证</span> : <span className="text-zinc-500 font-bold bg-zinc-800 px-2 py-0.5 rounded text-xs">未认证</span>}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3 text-zinc-400"><ShieldCheck className="w-4 h-4" /> 两步验证 (2FA)</div>
                            <div>
                              {user.twoFactorEnabled ? <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded text-xs">已开启</span> : <span className="text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded text-xs">未开启</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Payment Methods */}
                      <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-400" /> 已存付款方式</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                            <div className="w-10 h-6 bg-gradient-to-br from-blue-600 to-indigo-800 rounded flex items-center justify-center text-[8px] font-black text-white italic">VISA</div>
                            <div className="flex-1">
                              <div className="text-sm font-bold text-white">•••• 4242</div>
                              <div className="text-xs text-zinc-500">Exp: 12/28</div>
                            </div>
                            <button className="text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          {user.id === "USR-0829" && (
                            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                              <div className="w-10 h-6 bg-[#F7931A]/20 border border-[#F7931A]/30 rounded flex items-center justify-center text-[#F7931A]"><Bitcoin className="w-4 h-4" /></div>
                              <div className="flex-1">
                                <div className="text-sm font-bold text-white">Crypto Wallet</div>
                                <div className="text-xs text-zinc-500">0x...A1b2</div>
                              </div>
                              <button className="text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Right Column: Instances & Logs */}
                    <div className="space-y-6">
                      
                      {/* Owned Instances */}
                      <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                        <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Monitor className="w-5 h-5 text-orange-400" /> 名下运行实例 ({userInstances.length})</h4>
                        
                        {userInstances.length === 0 ? (
                          <div className="text-center py-8 text-zinc-500 text-sm border border-dashed border-white/10 rounded-2xl bg-black/20">
                            该用户目前没有任何实例
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {userInstances.map(instance => (
                              <div key={instance.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-black/40 border border-white/5 hover:border-orange-500/30 rounded-2xl transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-white/5 rounded-xl"><Server className="w-5 h-5 text-zinc-400" /></div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-white">{instance.game}</span>
                                      <span className="text-xs font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded">{instance.id}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {instance.node}</span>
                                      <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {instance.planName}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                                  <div className="text-right flex-1 sm:flex-none">
                                    <div className="text-sm font-bold text-emerald-400">${instance.price}/月</div>
                                    <div className="text-xs text-zinc-500 mt-1 flex justify-end">
                                      {instance.status === 'running' && <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> 运行中</span>}
                                      {instance.status === 'stopped' && <span className="text-zinc-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> 已停止</span>}
                                      {instance.status === 'installing' && <span className="text-orange-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span> 部署中</span>}
                                    </div>
                                  </div>
                                  <button className="p-2 bg-white/5 hover:bg-white/20 text-zinc-400 hover:text-white rounded-lg transition-colors"><Settings className="w-4 h-4" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Transaction Logs */}
                      <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
                        <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><History className="w-5 h-5 text-cyan-400" /> 资金与交易记录</h4>
                        
                        <div className="overflow-x-auto">
                          <div className="min-w-[600px]">
                            <div className="grid grid-cols-[140px_1fr_120px_100px_80px] gap-4 p-3 border-b border-white/10 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                              <div>时间</div>
                              <div>描述 & 方式</div>
                              <div className="text-right">金额 (USD)</div>
                              <div>交易单号</div>
                              <div className="text-right">状态</div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              {userTxns.length === 0 ? (
                                <div className="text-center py-6 text-zinc-500 text-sm">无交易记录</div>
                              ) : (
                                userTxns.map(txn => (
                                  <div key={txn.id} className="grid grid-cols-[140px_1fr_120px_100px_80px] gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-xl items-center transition-colors">
                                    <div className="text-xs text-zinc-400">{txn.date}</div>
                                    <div className="overflow-hidden">
                                      <div className="text-sm font-bold text-white truncate">{txn.description}</div>
                                      <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1 truncate">
                                        {txn.type === 'deposit' && <ArrowUpRight className="w-3 h-3 text-emerald-400 shrink-0" />}
                                        {txn.type === 'payment' && <ArrowUpRight className="w-3 h-3 text-orange-400 rotate-90 shrink-0" />}
                                        {txn.type === 'bonus' && <Gift className="w-3 h-3 text-purple-400 shrink-0" />}
                                        {txn.method}
                                      </div>
                                    </div>
                                    <div className={`text-right font-bold text-sm font-mono ${txn.amount > 0 ? (txn.type === 'bonus' ? 'text-purple-400' : 'text-emerald-400') : 'text-white'}`}>
                                      {txn.amount > 0 ? '+' : ''}{txn.amount.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-zinc-600 font-mono">{txn.id}</div>
                                    <div className="flex justify-end">
                                      {txn.status === 'completed' && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase">成功</span>}
                                      {txn.status === 'failed' && <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[10px] font-bold uppercase">失败</span>}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Referral Network (New) */}
                      <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-lg font-bold text-white flex items-center gap-2"><UsersIcon className="w-5 h-5 text-purple-400" /> 邀请返利网络</h4>
                          <div className="text-xs font-bold text-zinc-400">总计收益: <span className="text-purple-400 font-mono">${totalReferralBonus.toFixed(2)}</span></div>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <div className="min-w-[500px]">
                            <div className="grid grid-cols-[100px_1fr_120px_100px] gap-4 p-3 border-b border-white/10 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                              <div>注册时间</div>
                              <div>受邀用户</div>
                              <div>用户 ID</div>
                              <div className="text-right">产生佣金</div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              {userReferrals.length === 0 ? (
                                <div className="text-center py-6 text-zinc-500 text-sm border border-dashed border-white/10 rounded-xl bg-white/5">尚无邀请记录</div>
                              ) : (
                                userReferrals.map(ref => (
                                  <div key={ref.id} className="grid grid-cols-[100px_1fr_120px_100px] gap-4 p-3 bg-purple-500/5 border border-purple-500/10 hover:border-purple-500/30 rounded-xl items-center transition-colors">
                                    <div className="text-xs text-zinc-400">{ref.date}</div>
                                    <div className="text-sm font-bold text-white truncate">{ref.referredUserEmail}</div>
                                    <div className="text-xs text-zinc-500 font-mono">{ref.referredUserId}</div>
                                    <div className="text-right font-bold text-sm font-mono text-purple-400 flex items-center justify-end gap-1">
                                      <Gift className="w-3 h-3" /> +{ref.bonusEarned.toFixed(2)}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* INSTANCES TAB (List) */}
            {activeTab === "instances" && !selectedInstanceId && (
              <motion.div key="instances" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full">
                
                <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-20">
                  
                  {/* Page Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
                    <div>
                      <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2.5">
                        <Terminal className="w-5 h-5 text-zinc-400" />
                        Game Instances
                      </h2>
                      <p className="text-zinc-500 text-sm mt-1.5">Monitor and manage containerized game servers globally.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium transition-colors shadow-sm">
                        <RefreshCw className="w-4 h-4" /> Sync
                      </button>
                      <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-sm font-bold transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> Deploy Instance
                      </button>
                    </div>
                  </div>

                  {/* FLAT STATS GRID */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     {/* Running */}
                     <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                           <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Running</span>
                         </div>
                         <Activity className="w-4 h-4 text-zinc-600" />
                       </div>
                       <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-bold text-zinc-100 font-mono">1,492</span>
                       </div>
                     </div>
                     
                     {/* Stopped */}
                     <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-zinc-500"></div>
                           <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stopped</span>
                         </div>
                         <Power className="w-4 h-4 text-zinc-600" />
                       </div>
                       <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-bold text-zinc-100 font-mono">83</span>
                       </div>
                     </div>

                     {/* Pending */}
                     <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div>
                           <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pending</span>
                         </div>
                         <RefreshCw className="w-4 h-4 text-zinc-600" />
                       </div>
                       <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-bold text-zinc-100 font-mono">14</span>
                       </div>
                     </div>

                     {/* Impaired */}
                     <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                           <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Impaired</span>
                         </div>
                         <AlertTriangle className="w-4 h-4 text-zinc-600" />
                       </div>
                       <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-bold text-zinc-100 font-mono">2</span>
                       </div>
                     </div>
                  </div>

                  {/* FILTER BAR */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input 
                        type="text" 
                        placeholder="Search by instance ID, node, or status..." 
                        className="w-full bg-[#0a0a0c] border border-zinc-800/80 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-all shadow-inner"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2.5 border border-zinc-800/80 bg-[#0a0a0c] rounded-lg text-sm font-medium hover:border-zinc-600 transition-colors text-zinc-300 flex items-center gap-2 shadow-sm">
                        <ListFilter className="w-4 h-4" /> Filters
                      </button>
                      <button className="p-2.5 border border-zinc-800/80 bg-[#0a0a0c] rounded-lg hover:border-zinc-600 transition-colors text-zinc-300 shadow-sm">
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* FLAT DATA TABLE */}
                  <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="grid grid-cols-[180px_1fr_120px_160px_140px_140px_100px] gap-4 p-4 border-b border-zinc-800/80 bg-[#111]/50 text-[12px] font-semibold text-zinc-500 uppercase tracking-wider items-center select-none sticky top-0 z-20">
                      <div>Instance ID</div>
                      <div>Identifier / Owner</div>
                      <div>Status</div>
                      <div>Datacenter</div>
                      <div>CPU Usage</div>
                      <div>Memory Usage</div>
                      <div className="text-right">Actions</div>
                    </div>
                    
                    <div className="flex flex-col divide-y divide-zinc-800/40 bg-[#0a0a0c]">
                      {instances.map((instance) => (
                        <div key={instance.id} className="grid grid-cols-[180px_1fr_120px_160px_140px_140px_100px] gap-4 px-4 py-3.5 items-center hover:bg-zinc-800/30 transition-colors group cursor-pointer" onClick={() => { setSelectedInstanceId(instance.id); setInstanceActiveTab('console'); }}>
                          
                          <div className="flex items-center gap-2 text-sm font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors">
                            <HardDrive className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                            {instance.id}
                          </div>

                          <div className="flex flex-col justify-center min-w-0">
                            <div className="font-semibold text-zinc-200 text-sm flex items-center gap-2 truncate">
                              {instance.game}
                              {instance.status === 'running' && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">PROD</span>}
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5 font-mono flex items-center gap-1.5 truncate">
                              <Users2 className="w-3 h-3 text-zinc-600" /> {instance.userId}
                            </div>
                          </div>
                          
                          <div>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              instance.status === 'running' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              instance.status === 'stopped' ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' :
                              'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                instance.status === 'running' ? 'bg-emerald-500' :
                                instance.status === 'stopped' ? 'bg-zinc-500' :
                                'bg-orange-500'
                              }`}></div>
                              {instance.status.toUpperCase()}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="text-[13px] text-zinc-300 truncate">
                              {instance.node}
                            </span>
                          </div>
                          
                          <div className="flex flex-col justify-center gap-1.5 pr-6">
                            <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                              <span>CPU</span>
                              <span>{instance.cpuUsage}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${instance.cpuUsage > 80 ? 'bg-red-400' : 'bg-zinc-400'}`} style={{width: `${instance.cpuUsage}%`}}></div>
                            </div>
                          </div>

                          <div className="flex flex-col justify-center gap-1.5 pr-6">
                            <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                              <span>RAM</span>
                              <span>{instance.memUsage}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${instance.memUsage > 80 ? 'bg-orange-400' : 'bg-zinc-400'}`} style={{width: `${instance.memUsage}%`}}></div>
                            </div>
                          </div>
                          
                          <div className="text-right flex items-center justify-end gap-2">
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* INSTANCE DETAIL VIEW */}
            {selectedInstanceId && activeTab === "instances" && (() => {
              const instance = instances.find(i => i.id === selectedInstanceId) || userInstances.find(i => i.id === selectedInstanceId);
              if (!instance) return null;

              const tabs = [
                { id: "console", label: "主页与终端", icon: TerminalSquare },
                { id: "files", label: "文件管理", icon: FolderOpen },
                { id: "logs", label: "活动日志", icon: ScrollText },
                { id: "players", label: "玩家管理", icon: Users2 },
                { id: "versions", label: "版本控制", icon: GitBranch },
                { id: "network", label: "网络与端口", icon: Network },
                { id: "backups", label: "备份中心", icon: Database },
                { id: "startup", label: "启动设置", icon: Settings },
                { id: "management", label: "管理设置", icon: Settings2 },
              ] as const;

              return (
                <motion.div key={`instance-detail-${instance.id}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {/* Detail Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelectedInstanceId(null)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                          <HardDrive className="w-6 h-6 text-emerald-400" />
                          {instance.game} - {instance.node}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-zinc-500 font-mono">ID: {instance.id}</span>
                          <span className="text-xs text-zinc-500 font-mono">OWNER: {instance.userId}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            instance.status === 'running' ? 'bg-emerald-500/20 text-emerald-400' :
                            instance.status === 'stopped' ? 'bg-zinc-500/20 text-zinc-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {instance.status === 'running' ? '● 运行中' : instance.status === 'stopped' ? '○ 已停止' : '◐ 部署中'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                        <Play className="w-4 h-4" /> 启动
                      </button>
                      <button className="px-4 py-2 bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-400 border border-zinc-500/20 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> 重启
                      </button>
                      <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                        <Square className="w-4 h-4 fill-current" /> 强制停止
                      </button>
                    </div>
                  </div>

                  {/* Inner Navigation Navigation */}
                  <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                    <nav className="flex items-center gap-2 bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl w-max min-w-full lg:min-w-0 lg:w-fit">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = instanceActiveTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setInstanceActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                              isActive 
                                ? "bg-white/10 text-white shadow-lg" 
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : ''}`} />
                            {tab.label}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Dynamic Content Area */}
                  <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 min-h-[500px] shadow-2xl">
                    
                    {/* CONSOLE TAB */}
                    {instanceActiveTab === 'console' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* 4 Stats */}
                        {(() => {
                          const renderSparkTooltip = ({ active, payload }: any) => {
                            if (active && payload && payload.length) {
                              const val = payload[0].value;
                              const name = payload[0].dataKey;
                              const unit = (name === 'net' || name === 'disk') ? (name === 'net' ? ' Mbps' : ' GB') : '%';
                              return (
                                <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-lg shadow-2xl text-xs font-mono z-[100]">
                                  <span style={{ color: payload[0].stroke }} className="font-bold">{val.toFixed(1)}{unit}</span>
                                </div>
                              );
                            }
                            return null;
                          };

                          const sparklineData = [
                            { time: '10:00', cpu: Math.max(5, instance.cpuUsage - 25), mem: Math.max(10, instance.memUsage - 15), disk: 24.1, net: 5 },
                            { time: '10:05', cpu: Math.max(8, instance.cpuUsage - 15), mem: Math.max(12, instance.memUsage - 8), disk: 24.1, net: 12 },
                            { time: '10:10', cpu: Math.max(15, instance.cpuUsage - 5), mem: Math.max(15, instance.memUsage - 5), disk: 24.2, net: 8 },
                            { time: '10:15', cpu: Math.min(100, instance.cpuUsage + 10), mem: Math.min(100, instance.memUsage + 5), disk: 24.3, net: 25 },
                            { time: '10:20', cpu: Math.max(10, instance.cpuUsage - 12), mem: Math.max(10, instance.memUsage - 2), disk: 24.5, net: 14 },
                            { time: '10:25', cpu: Math.min(100, instance.cpuUsage + 15), mem: Math.min(100, instance.memUsage + 3), disk: 24.6, net: 32 },
                            { time: '10:30', cpu: instance.cpuUsage, mem: instance.memUsage, disk: 24.8, net: 18.2 },
                          ];

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                              <div className="bg-black/40 border border-white/5 rounded-2xl flex flex-col relative overflow-hidden group hover:border-emerald-500/30 transition-colors h-36">
                                <div className="absolute inset-0 z-0 opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:pointer-events-auto">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sparklineData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                      <defs>
                                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <RechartsTooltip content={renderSparkTooltip} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                      <Area type="monotone" dataKey="cpu" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="relative z-10 flex flex-col h-full justify-between p-4 pointer-events-none">
                                  <span className="text-zinc-500 text-xs font-bold flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> CPU 负载</span>
                                  <div>
                                    <span className="text-2xl font-black text-emerald-400 drop-shadow-md">{instance.cpuUsage}%</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-black/40 border border-white/5 rounded-2xl flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-colors h-36">
                                <div className="absolute inset-0 z-0 opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:pointer-events-auto">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sparklineData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                      <defs>
                                        <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <RechartsTooltip content={renderSparkTooltip} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                      <Area type="monotone" dataKey="mem" stroke="#60a5fa" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="relative z-10 flex flex-col h-full justify-between p-4 pointer-events-none">
                                  <span className="text-zinc-500 text-xs font-bold flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> 内存占用</span>
                                  <div>
                                    <span className="text-2xl font-black text-blue-400 drop-shadow-md">{instance.memUsage}%</span>
                                    <div className="text-[10px] text-zinc-400 mt-0.5">{(instance.memUsage * 0.08).toFixed(1)} GB / 8 GB</div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-black/40 border border-white/5 rounded-2xl flex flex-col relative overflow-hidden group hover:border-purple-500/30 transition-colors h-36">
                                <div className="absolute inset-0 z-0 opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:pointer-events-auto">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sparklineData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                      <defs>
                                        <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <RechartsTooltip content={renderSparkTooltip} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                      <Area type="monotone" dataKey="disk" stroke="#c084fc" strokeWidth={2} fillOpacity={1} fill="url(#colorDisk)" />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="relative z-10 flex flex-col h-full justify-between p-4 pointer-events-none">
                                  <span className="text-zinc-500 text-xs font-bold flex items-center gap-1"><Database className="w-3.5 h-3.5" /> 存储空间</span>
                                  <div>
                                    <span className="text-2xl font-black text-purple-400 drop-shadow-md">12.4 <span className="text-sm">GB</span></span>
                                    <div className="text-[10px] text-zinc-400 mt-0.5">/ 50 GB (24.8%)</div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-black/40 border border-white/5 rounded-2xl flex flex-col relative overflow-hidden group hover:border-cyan-500/30 transition-colors h-36">
                                <div className="absolute inset-0 z-0 opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:pointer-events-auto">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sparklineData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                      <defs>
                                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <RechartsTooltip content={renderSparkTooltip} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                      <Area type="monotone" dataKey="net" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorNet)" />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="relative z-10 flex flex-col h-full justify-between p-4 pointer-events-none">
                                  <span className="text-zinc-500 text-xs font-bold flex items-center gap-1"><Network className="w-3.5 h-3.5" /> 网络宽带</span>
                                  <div>
                                    <span className="text-2xl font-black text-cyan-400 drop-shadow-md">18.2 <span className="text-sm">Mbps</span></span>
                                    <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5 pr-2">
                                      <span>↑ 12.4 GB</span>
                                      <span>↓ 4.1 GB</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Main Console & Command Center */}
                        <div className="mt-6 flex flex-col xl:flex-row gap-6">
                          {/* Left: Terminal Pane */}
                          <div className="flex-1 flex flex-col h-[500px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden relative group shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                            {/* Animated Scanner Line */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-[pulse_2s_ease-in-out_infinite] z-20 pointer-events-none" />
                            
                            {/* Terminal Header */}
                            <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between backdrop-blur-md z-10">
                              <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
                                  <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                </div>
                                <span className="text-xs font-mono text-zinc-300 flex items-center gap-2 ml-2 tracking-widest uppercase">
                                  <TerminalSquare className="w-4 h-4 text-emerald-400" /> SYS.CONSOLE
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]"></span>
                                  DAEMON CONNECTED
                                </span>
                                <div className="flex gap-2">
                                  <button className="text-zinc-500 hover:text-white transition-colors"><Maximize2 className="w-4 h-4" /></button>
                                  <button className="text-zinc-500 hover:text-white transition-colors"><Settings2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            </div>
                            
                            {/* CRT Screen Filter Background */}
                            <div className="absolute inset-0 pointer-events-none z-0" style={{ 
                              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)' 
                            }}></div>
                            
                            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 z-10 relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                              <div className="text-zinc-400 drop-shadow-[0_0_2px_rgba(161,161,170,0.8)]"><span className="text-emerald-500">root@node-01:~#</span> ./start.sh</div>
                              <div className="text-zinc-400 drop-shadow-[0_0_2px_rgba(161,161,170,0.8)]">[14:23:01 INFO]: Starting minecraft server version 1.20.4</div>
                              <div className="text-zinc-400 drop-shadow-[0_0_2px_rgba(161,161,170,0.8)]">[14:23:01 INFO]: Loading properties</div>
                              <div className="text-zinc-400 drop-shadow-[0_0_2px_rgba(161,161,170,0.8)]">[14:23:01 INFO]: Default game type: SURVIVAL</div>
                              <div className="text-zinc-400 drop-shadow-[0_0_2px_rgba(161,161,170,0.8)]">[14:23:01 INFO]: Generating keypair</div>
                              <div className="text-zinc-400 drop-shadow-[0_0_2px_rgba(161,161,170,0.8)]">[14:23:02 INFO]: Starting Minecraft server on *:25565</div>
                              <div className="text-zinc-400 drop-shadow-[0_0_2px_rgba(161,161,170,0.8)]">[14:23:02 INFO]: Using default channel type</div>
                              <div className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.6)]">[14:23:04 WARN]: [Vanilla] Loaded 0 recipes</div>
                              <div className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]">[14:23:05 INFO]: Done (4.123s)! For help, type "help"</div>
                              <div className="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.6)]">[14:28:12 INFO]: game_master99 joined the game</div>
                              <div className="text-zinc-400 drop-shadow-[0_0_2px_rgba(161,161,170,0.8)]"><span className="text-emerald-500">root@node-01:~#</span> <span className="w-2 h-4 bg-emerald-500 inline-block align-middle animate-pulse ml-1 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span></div>
                            </div>
                            
                            <div className="p-3 border-t border-white/10 bg-black/60 backdrop-blur-xl z-10 relative">
                              <div className="relative flex items-center">
                                <ChevronRight className="w-5 h-5 text-emerald-500 absolute left-3 pointer-events-none" />
                                <input 
                                  type="text" 
                                  placeholder="ENTER COMMAND (/op username)..." 
                                  className="w-full bg-black/40 border border-white/10 hover:border-emerald-500/50 rounded-xl pl-10 pr-24 py-3 text-sm font-mono text-emerald-400 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 focus:shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-all uppercase"
                                />
                                <button className="absolute right-2 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold font-mono transition-colors">EXECUTE</button>
                              </div>
                            </div>
                          </div>

                          {/* Right: Command Center Panel */}
                          <div className="w-full xl:w-80 flex flex-col gap-4">
                            {/* Status Overview Card */}
                            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
                              
                              <div className="flex items-center justify-between mb-6">
                                <h3 className="text-zinc-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                  <Server className="w-4 h-4 text-emerald-400" /> System Status
                                </h3>
                                <span className="flex h-3 w-3 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                </span>
                              </div>

                              <div className="flex flex-col gap-4">
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-zinc-500 font-mono mb-1 uppercase">Current Uptime</span>
                                  <span className="text-xl font-black text-white font-mono tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                                    14<span className="text-sm text-zinc-400 font-normal mx-1">d</span>
                                    08<span className="text-sm text-zinc-400 font-normal mx-1">h</span>
                                    42<span className="text-sm text-zinc-400 font-normal mx-1">m</span>
                                  </span>
                                </div>
                                
                                {/* Action Grid */}
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <button className="bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/50 rounded-xl py-3 flex flex-col items-center justify-center gap-2 transition-all group/btn">
                                    <Play className="w-5 h-5 text-zinc-400 group-hover/btn:text-emerald-400 group-hover/btn:drop-shadow-[0_0_5px_rgba(52,211,153,0.8)] transition-all" />
                                    <span className="text-[10px] font-bold text-zinc-400 group-hover/btn:text-emerald-400 uppercase tracking-wider">Start</span>
                                  </button>
                                  <button className="bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/50 rounded-xl py-3 flex flex-col items-center justify-center gap-2 transition-all group/btn">
                                    <RefreshCw className="w-5 h-5 text-zinc-400 group-hover/btn:text-blue-400 group-hover/btn:drop-shadow-[0_0_5px_rgba(96,165,250,0.8)] transition-all" />
                                    <span className="text-[10px] font-bold text-zinc-400 group-hover/btn:text-blue-400 uppercase tracking-wider">Restart</span>
                                  </button>
                                  <button className="bg-white/5 hover:bg-yellow-500/20 border border-white/5 hover:border-yellow-500/50 rounded-xl py-3 flex flex-col items-center justify-center gap-2 transition-all group/btn">
                                    <Square className="w-4 h-4 text-zinc-400 group-hover/btn:text-yellow-400 group-hover/btn:drop-shadow-[0_0_5px_rgba(250,204,21,0.8)] transition-all" />
                                    <span className="text-[10px] font-bold text-zinc-400 group-hover/btn:text-yellow-400 uppercase tracking-wider">Stop</span>
                                  </button>
                                  <button className="bg-white/5 hover:bg-red-500/20 border border-white/5 hover:border-red-500/50 rounded-xl py-3 flex flex-col items-center justify-center gap-2 transition-all group/btn">
                                    <Power className="w-5 h-5 text-zinc-400 group-hover/btn:text-red-400 group-hover/btn:drop-shadow-[0_0_5px_rgba(248,113,113,0.8)] transition-all" />
                                    <span className="text-[10px] font-bold text-zinc-400 group-hover/btn:text-red-400 uppercase tracking-wider">Kill</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Network & Node Info Card */}
                            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex-1 relative overflow-hidden group hover:border-white/20 transition-all">
                              <h3 className="text-zinc-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Cpu className="w-4 h-4 text-purple-400" /> Instance Details
                              </h3>
                              
                              <div className="space-y-4">
                                <div className="bg-white/5 border border-white/5 rounded-lg p-3 group/item hover:border-white/20 transition-colors">
                                  <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Primary IP Address</div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-mono text-zinc-300">192.168.1.100:25565</span>
                                    <button className="text-zinc-500 hover:text-white transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-white/5 border border-white/5 rounded-lg p-3 hover:border-white/20 transition-colors">
                                    <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Node</div>
                                    <div className="text-xs font-bold text-zinc-300">SG-Premium-01</div>
                                  </div>
                                  <div className="bg-white/5 border border-white/5 rounded-lg p-3 hover:border-white/20 transition-colors">
                                    <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Type</div>
                                    <div className="text-xs font-bold text-zinc-300">Minecraft Java</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* FILES TAB */}
                    {instanceActiveTab === 'files' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-sm font-mono bg-black/40 px-4 py-2 rounded-xl border border-white/5 text-zinc-300 overflow-x-auto whitespace-nowrap scrollbar-hide max-w-[50%] md:max-w-full">
                            <span className="text-emerald-400">/</span>
                            <span>home</span>
                            <span className="text-zinc-600">/</span>
                            <span>container</span>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white transition-colors">新建文件</button>
                            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white transition-colors hidden sm:block">新建文件夹</button>
                            <button className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-500 hover:text-white transition-colors">上传</button>
                          </div>
                        </div>
                        <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/40">
                          <div className="w-full overflow-x-auto">
                            <table className="w-full text-sm text-left min-w-[600px]">
                              <thead className="text-xs text-zinc-500 bg-white/5 uppercase font-bold">
                                <tr>
                                  <th className="px-4 py-3">名称</th>
                                  <th className="px-4 py-3 w-32">大小</th>
                                  <th className="px-4 py-3 w-48">最后修改</th>
                                  <th className="px-4 py-3 w-24">操作</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-zinc-300">
                                {['world', 'plugins', 'config', 'logs'].map((folder) => (
                                  <tr key={folder} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                    <td className="px-4 py-3 flex items-center gap-3"><FolderOpen className="w-4 h-4 text-blue-400" /> {folder}</td>
                                    <td className="px-4 py-3 text-zinc-500">-</td>
                                    <td className="px-4 py-3 text-zinc-500">2 分钟前</td>
                                    <td className="px-4 py-3"><button className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100"><Edit2 className="w-4 h-4" /></button></td>
                                  </tr>
                                ))}
                                <tr className="hover:bg-white/5 transition-colors group cursor-pointer">
                                  <td className="px-4 py-3 flex items-center gap-3"><ScrollText className="w-4 h-4 text-zinc-400" /> server.properties</td>
                                  <td className="px-4 py-3 text-zinc-500">1.2 KB</td>
                                  <td className="px-4 py-3 text-zinc-500">5 小时前</td>
                                  <td className="px-4 py-3"><button className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100"><Edit2 className="w-4 h-4" /></button></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* PLAYERS TAB */}
                    {instanceActiveTab === 'players' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Header Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 blur-[40px] rounded-full"></div>
                            <div className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Users2 className="w-4 h-4" /> 在线玩家
                            </div>
                            <div className="text-3xl font-black text-white flex items-baseline gap-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                              4 <span className="text-sm font-bold text-zinc-500">/ 50</span>
                            </div>
                            <div className="mt-3 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" style={{ width: '8%' }}></div>
                            </div>
                          </div>
                          
                          <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 blur-[40px] rounded-full"></div>
                            <div className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Wifi className="w-4 h-4" /> 平均延迟
                            </div>
                            <div className="text-3xl font-black text-white flex items-baseline gap-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                              24 <span className="text-sm font-bold text-zinc-500">ms</span>
                            </div>
                            <div className="mt-2 text-xs text-zinc-500">网络连接优良</div>
                          </div>

                          <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-center gap-3 group hover:border-white/20 transition-all">
                            <div className="relative">
                              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input 
                                type="text" 
                                placeholder="搜索玩家 ID..." 
                                className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-zinc-600"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2.5 rounded-xl border border-white/5 transition-colors">白名单管理</button>
                              <button className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold py-2.5 rounded-xl border border-red-500/20 transition-colors">封禁列表</button>
                            </div>
                          </div>
                        </div>

                        {/* Player List */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                          <div className="px-5 py-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Connected Users</h3>
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                          </div>
                          
                          <div className="divide-y divide-white/5">
                            {[
                              { name: 'game_master99', role: 'OP / Admin', ping: 15, status: 'Active', avatar: 'MHF_Alex' },
                              { name: 'steve_miner', role: 'Player', ping: 24, status: 'Active', avatar: 'MHF_Steve' },
                              { name: 'alex2024', role: 'Player', ping: 42, status: 'Away', avatar: 'MHF_Villager' },
                              { name: 'notch_fan', role: 'Player', ping: 18, status: 'Active', avatar: 'MHF_Pig' }
                            ].map(player => (
                              <div key={player.name} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center p-1 shadow-inner relative z-10 group-hover:border-white/20 transition-colors">
                                      <img src={`https://minotar.net/helm/${player.name}/64.png`} alt={player.name} className="w-full h-full rounded-lg pixelated" onError={(e) => { e.currentTarget.src = `https://minotar.net/helm/${player.avatar}/64.png`; }} />
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-[#0a0a0c] rounded-full z-20 ${player.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(52,211,153,0.8)]' : 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]'}`}></div>
                                  </div>
                                  
                                  <div>
                                    <div className="font-bold text-white text-base flex items-center gap-2">
                                      {player.name}
                                      {player.role.includes('OP') && <Crown className="w-3.5 h-3.5 text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.8)]" />}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs mt-1">
                                      <span className={`font-mono px-1.5 py-0.5 rounded border ${player.role.includes('OP') ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-white/5 text-zinc-400 border-white/10'}`}>
                                        {player.role}
                                      </span>
                                      <span className="text-zinc-500 font-mono flex items-center gap-1">
                                        <Activity className="w-3 h-3 text-blue-400" /> {player.ping}ms
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  <button className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-black border border-yellow-500/20 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5">
                                    <Crown className="w-3.5 h-3.5" /> OP
                                  </button>
                                  <button className="px-3 py-1.5 bg-zinc-800 text-white hover:bg-white hover:text-black border border-white/10 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5" /> 私信
                                  </button>
                                  <button className="px-3 py-1.5 bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white border border-orange-500/20 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5">
                                    <ArrowUpRight className="w-3.5 h-3.5" /> 踢出
                                  </button>
                                  <button className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5">
                                    <ShieldBan className="w-3.5 h-3.5" /> 封禁
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* NETWORK TAB */}
                    {instanceActiveTab === 'network' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* VIP Premium Network Section */}
                        <div className="bg-black/40 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-yellow-500/20 transition-all"></div>
                          
                          <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                              <h4 className="text-sm font-bold text-yellow-400 flex items-center gap-2 mb-1">
                                <Crown className="w-5 h-5 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" /> 
                                <span>VIP 专属网络线路 (Premium Routing)</span>
                              </h4>
                              <p className="text-xs text-zinc-400">已开启 BGP 多线高防与 DDoS 防御，提供极低延迟的专属独立 IP</p>
                            </div>
                            <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold rounded-lg shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                              PRO ACTIVE
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
                            <div className="bg-black/60 border border-yellow-500/20 hover:border-yellow-500/50 rounded-xl p-4 transition-colors">
                              <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1 flex items-center gap-1">
                                <Globe className="w-3 h-3" /> VIP 独立公网 IP
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-lg font-mono text-white tracking-wider">103.24.55.192</span>
                                <button className="text-yellow-400 hover:text-white transition-colors"><Copy className="w-4 h-4" /></button>
                              </div>
                            </div>
                            <div className="bg-black/60 border border-yellow-500/20 hover:border-yellow-500/50 rounded-xl p-4 transition-colors">
                              <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> DDoS 防御状态
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-lg font-bold text-emerald-400">防御中 (最高 500G)</span>
                                <span className="flex h-2.5 w-2.5 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                              </div>
                            </div>
                            <div className="bg-black/60 border border-yellow-500/20 hover:border-yellow-500/50 rounded-xl p-4 transition-colors flex flex-col justify-center items-center cursor-pointer group/btn">
                              <Settings2 className="w-5 h-5 text-yellow-500/50 group-hover/btn:text-yellow-400 transition-colors mb-1" />
                              <span className="text-xs font-bold text-zinc-400 group-hover/btn:text-yellow-400">配置自定义域名解析</span>
                            </div>
                          </div>
                        </div>

                        {/* Standard Network Configuration */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
                          <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                            <Network className="w-4 h-4 text-cyan-400" /> 基础网络与端口路由 (Fire墙与NAT)
                          </h4>

                          {/* Interactive Firewall Table Layout */}
                          <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-black/60">
                            <table className="w-full text-sm text-left min-w-[700px]">
                              <thead className="text-xs text-zinc-500 bg-white/[0.02] uppercase font-bold tracking-wider border-b border-white/10">
                                <tr>
                                  <th className="px-5 py-4 w-12 text-center">状态</th>
                                  <th className="px-5 py-4">协议 (Protocol)</th>
                                  <th className="px-5 py-4">公网端口 (Public)</th>
                                  <th className="px-5 py-4">内部目标 (Internal)</th>
                                  <th className="px-5 py-4">用途描述 (Description)</th>
                                  <th className="px-5 py-4 text-right">操作 (Action)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-zinc-300 font-mono text-xs">
                                {/* Primary Port Row */}
                                <tr className="hover:bg-white/[0.02] transition-colors group/row bg-cyan-500/[0.02]">
                                  <td className="px-5 py-4 text-center">
                                    <div className="flex justify-center">
                                      <span className="flex h-2.5 w-2.5 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4">
                                    <span className="px-2 py-1 bg-white/10 text-white rounded border border-white/10 font-bold">TCP / UDP</span>
                                  </td>
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base text-cyan-400 font-black drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">25565</span>
                                      <button className="text-zinc-500 hover:text-cyan-400 transition-colors opacity-0 group-hover/row:opacity-100"><Copy className="w-3.5 h-3.5" /></button>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-zinc-500">
                                    <span className="flex items-center gap-2">
                                      <ArrowRight className="w-3 h-3" /> 25565
                                    </span>
                                  </td>
                                  <td className="px-5 py-4">
                                    <span className="font-sans text-sm font-bold text-white flex items-center gap-2">
                                      主服务端连接 (Primary) <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] rounded border border-cyan-500/30">必选</span>
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <button className="p-2 bg-white/5 text-zinc-500 rounded-lg cursor-not-allowed" disabled title="主端口不可修改">
                                      <Lock className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>

                                {/* Secondary Port Row */}
                                <tr className="hover:bg-white/[0.02] transition-colors group/row">
                                  <td className="px-5 py-4 text-center">
                                    <div className="flex justify-center">
                                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(52,211,153,0.8)]"></div>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4">
                                    <span className="px-2 py-1 bg-white/5 text-zinc-400 rounded border border-white/5">TCP</span>
                                  </td>
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base text-white font-bold group-hover/row:text-emerald-400 transition-colors">8080</span>
                                      <button className="text-zinc-500 hover:text-white transition-colors opacity-0 group-hover/row:opacity-100"><Copy className="w-3.5 h-3.5" /></button>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-zinc-500">
                                    <span className="flex items-center gap-2">
                                      <ArrowRight className="w-3 h-3" /> 8080
                                    </span>
                                  </td>
                                  <td className="px-5 py-4">
                                    <span className="font-sans text-sm text-zinc-300">
                                      Dynmap / Web API (Internal)
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                      <button className="p-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg transition-colors border border-white/5"><Edit2 className="w-4 h-4" /></button>
                                      <button className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors border border-red-500/20 hover:border-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            
                            {/* Add New Rule Button */}
                            <div className="p-4 border-t border-white/10 bg-white/[0.01] flex justify-center">
                              <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-dashed border-white/20 hover:border-white/40 w-full justify-center">
                                <Plus className="w-4 h-4" /> 添加新的端口映射规则 (Add Port Forwarding Rule)
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STARTUP SETTINGS TAB */}
                    {instanceActiveTab === 'startup' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Configuration Meta Header */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group hover:border-emerald-500/30 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-all"></div>
                          
                          <div className="flex items-center gap-4 relative z-10">
                            <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)] group-hover:shadow-[0_0_20px_rgba(52,211,153,0.2)] transition-all">
                              <PlayCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                启动与环境变量 (Environment Variables)
                              </h3>
                              <p className="text-xs text-zinc-400 mt-1">Docker 镜像定义及运行时环境参数，修改后需重启生效。</p>
                            </div>
                          </div>
                          
                          <button className="px-6 py-3 bg-emerald-500 text-black font-black text-sm rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.6)]">
                            <Save className="w-4 h-4" /> 部署并保存配置
                          </button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                          {/* Left Column: Core Docker Settings */}
                          <div className="xl:col-span-1 space-y-6">
                            <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
                              <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                                <Box className="w-4 h-4 text-emerald-400" /> 容器基础镜像 (Container Image)
                              </h4>
                              
                              <div className="space-y-5">
                                <div>
                                  <label className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                                    <span>Docker Image</span>
                                    <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-[4px] text-[10px]">Registry</span>
                                  </label>
                                  <div className="relative group/input">
                                    <input 
                                      type="text" 
                                      defaultValue="ghcr.io/pterodactyl/yolks:java_17" 
                                      className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-colors shadow-inner" 
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/input:opacity-100 transition-opacity">
                                      <Lock className="w-4 h-4 text-zinc-500" />
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-zinc-500 mt-2">指定用于启动该实例的基础 Docker 容器镜像。</p>
                                </div>
                                
                                <div className="h-px w-full bg-white/5"></div>
                                
                                <div>
                                  <label className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                                    <span>Startup Command</span>
                                  </label>
                                  <textarea 
                                    defaultValue="java -Xms128M -Xmx{{SERVER_MEMORY}}M -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}" 
                                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500/50 h-28 resize-none transition-colors shadow-inner leading-relaxed"
                                  ></textarea>
                                  <p className="text-[10px] text-zinc-500 mt-2">可以使用 <code className="text-zinc-300 bg-white/5 px-1 rounded">{'{{变量}}'}</code> 语法引用右侧的环境变量。</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Environment Variables */}
                          <div className="xl:col-span-2">
                            <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full shadow-2xl relative overflow-hidden group/vars">
                              <div className="absolute top-0 right-0 w-[500px] h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover/vars:opacity-100 transition-opacity duration-1000"></div>
                              
                              <h4 className="text-sm font-bold text-white mb-6 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <Terminal className="w-4 h-4 text-emerald-400" /> 环境变量 (Environment Variables)
                                </span>
                                <span className="px-2 py-1 bg-white/5 text-zinc-400 text-xs rounded border border-white/10 font-mono">
                                  3 Active Vars
                                </span>
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Var 1 */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-colors group/var">
                                  <label className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-2 font-mono">
                                    <span className="text-emerald-400">SERVER_MEMORY</span>
                                    <span className="text-[10px] text-zinc-500">MB (兆字节)</span>
                                  </label>
                                  <input 
                                    type="text" 
                                    defaultValue="8192" 
                                    className="w-full bg-[#0a0a0c] border border-white/10 group-hover/var:border-emerald-500/30 rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors" 
                                  />
                                  <p className="text-[10px] text-zinc-600 mt-2">定义 JVM 的最大内存限制 (-Xmx)</p>
                                </div>

                                {/* Var 2 */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-colors group/var">
                                  <label className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-2 font-mono">
                                    <span className="text-emerald-400">SERVER_JARFILE</span>
                                    <span className="text-[10px] text-zinc-500">File Path</span>
                                  </label>
                                  <input 
                                    type="text" 
                                    defaultValue="server.jar" 
                                    className="w-full bg-[#0a0a0c] border border-white/10 group-hover/var:border-emerald-500/30 rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors" 
                                  />
                                  <p className="text-[10px] text-zinc-600 mt-2">服务端核心文件的名称，必须存在于根目录中。</p>
                                </div>

                                {/* Var 3 */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-colors group/var">
                                  <label className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-2 font-mono">
                                    <span className="text-emerald-400">MINECRAFT_VERSION</span>
                                    <span className="text-[10px] text-zinc-500">Version String</span>
                                  </label>
                                  <input 
                                    type="text" 
                                    defaultValue="1.20.4" 
                                    className="w-full bg-[#0a0a0c] border border-white/10 group-hover/var:border-emerald-500/30 rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors" 
                                  />
                                  <p className="text-[10px] text-zinc-600 mt-2">如果使用了自动更新镜像，此变量将决定下载的版本。</p>
                                </div>
                                
                                {/* Add New Var Placeholder */}
                                <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.03] hover:border-white/30 transition-colors group/addvar h-[116px]">
                                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover/addvar:bg-emerald-500/20 transition-colors">
                                    <Plus className="w-4 h-4 text-zinc-500 group-hover/addvar:text-emerald-400 transition-colors" />
                                  </div>
                                  <span className="text-xs font-bold text-zinc-400 group-hover/addvar:text-zinc-300">添加自定义变量</span>
                                </div>

                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* BACKUPS TAB */}
                    {instanceActiveTab === 'backups' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Cloud Storage Quota & Creation Header */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all"></div>
                          
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="flex items-start gap-4">
                              <div className="p-3.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all">
                                <Database className="w-8 h-8 text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.8)]" />
                              </div>
                              <div>
                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                  云端备份中心 <span className="text-[10px] px-2 py-0.5 bg-white/10 text-zinc-300 font-mono rounded border border-white/10">AWS S3</span>
                                </h3>
                                <div className="text-xs text-zinc-400 mt-1 mb-2">已使用 2.3 GB · 自动快照受跨区域灾难恢复保护</div>
                                
                                {/* Quota Bar */}
                                <div className="flex items-center gap-4 w-full md:w-64">
                                  <div className="flex-1 bg-white/[0.03] h-2 rounded-full overflow-hidden border border-white/[0.05]">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)] relative" style={{ width: '40%' }}>
                                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                                    </div>
                                  </div>
                                  <span className="text-xs font-mono font-bold text-purple-400 drop-shadow-[0_0_2px_rgba(192,132,252,0.5)]">2 / 5 槽位</span>
                                </div>
                              </div>
                            </div>

                            <button className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-white font-bold text-sm rounded-xl border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all flex items-center justify-center gap-2 group/btn">
                              <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" /> 
                              创建新快照 (Create Backup)
                            </button>
                          </div>
                        </div>

                        {/* Backup List grid */}
                        <div className="grid gap-4">
                          {[
                            { name: 'Auto-Backup-20240312', size: '1.2 GB', date: '昨天 04:00', type: '自动 (Cron)', icon: Clock, colorBorder: 'border-blue-500', colorText: 'text-blue-400', colorBg: 'bg-blue-500', colorShadow: 'shadow-[0_0_10px_rgba(59,130,246,0.8)]' },
                            { name: 'Before-Update-Modpack', size: '1.1 GB', date: '3 天前', type: '手动触发', icon: Database, colorBorder: 'border-purple-500', colorText: 'text-purple-400', colorBg: 'bg-purple-500', colorShadow: 'shadow-[0_0_10px_rgba(168,85,247,0.8)]' }
                          ].map((bk, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors group relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                              {/* Hover Highlight line */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${bk.colorBg} opacity-0 group-hover:opacity-100 transition-opacity ${bk.colorShadow}`}></div>
                              
                              <div className="flex items-center gap-5">
                                <div className={`p-3 ${bk.colorBg}/10 rounded-xl border ${bk.colorBorder}/20 group-hover:${bk.colorBorder}/40 transition-colors`}>
                                  <bk.icon className={`w-5 h-5 ${bk.colorText} drop-shadow-[0_0_5px_currentColor]`} />
                                </div>
                                <div>
                                  <div className="font-bold text-white text-base flex items-center gap-3">
                                    {bk.name}
                                    <span className={`text-[10px] px-2 py-0.5 ${bk.colorBg}/10 ${bk.colorText} border ${bk.colorBorder}/20 font-mono rounded shadow-[0_0_5px_currentColor]`}>
                                      {bk.type}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono mt-1">
                                    <span className="flex items-center gap-1.5"><HardDrive className="w-3 h-3" /> {bk.size}</span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {bk.date}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 font-bold text-xs rounded-lg transition-all flex items-center gap-2">
                                  <RotateCcw className="w-3.5 h-3.5" /> 恢复 (Restore)
                                </button>
                                <button className="px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 font-bold text-xs rounded-lg transition-all flex items-center gap-2">
                                  <HardDrive className="w-3.5 h-3.5" /> 下载 (Download)
                                </button>
                                <button className="px-3 py-2 bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white border border-white/5 hover:border-red-500 font-bold text-xs rounded-lg transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* LOGS TAB */}
                    {instanceActiveTab === 'logs' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                              <History className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-bold text-sm tracking-widest uppercase">System Activity Log</h3>
                              <p className="text-xs text-zinc-500 font-mono mt-0.5">Tracking all administrative actions & events</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <div className="relative">
                              <Calendar className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                              <select className="bg-black/60 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer">
                                <option value="today">Today</option>
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Last 30 Days</option>
                              </select>
                            </div>
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/5 transition-colors flex items-center gap-2">
                              <RefreshCw className="w-4 h-4" /> 刷新
                            </button>
                          </div>
                        </div>

                        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative group">
                          {/* Top Highlight Line */}
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          <div className="w-full overflow-x-auto">
                            <table className="w-full text-sm text-left min-w-[800px]">
                              <thead className="text-xs text-zinc-500 bg-white/[0.02] uppercase font-bold tracking-wider border-b border-white/5">
                                <tr>
                                  <th className="px-6 py-4">时间戳 (UTC)</th>
                                  <th className="px-6 py-4">事件类型</th>
                                  <th className="px-6 py-4">操作来源</th>
                                  <th className="px-6 py-4">详细信息</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-zinc-300 font-mono text-xs">
                                <tr className="hover:bg-white/[0.02] transition-colors group/row">
                                  <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <span className="text-zinc-300">2024-03-12</span>
                                      <span className="text-[10px]">14:23:01</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                                      <Play className="w-3 h-3 drop-shadow-[0_0_3px_rgba(52,211,153,0.8)]" /> 启动服务器
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded bg-zinc-800 border border-white/10 flex items-center justify-center">
                                        <img src="https://minotar.net/helm/game_master99/32.png" alt="User" className="w-5 h-5 rounded-sm pixelated" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                      </div>
                                      <span className="text-white font-sans font-bold">game_master99</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-zinc-400 max-w-[250px]">
                                    <div className="truncate group-hover/row:text-zinc-200 transition-colors">
                                      [Web Panel] 手动触发面板启动按钮
                                    </div>
                                  </td>
                                </tr>
                                <tr className="hover:bg-white/[0.02] transition-colors group/row">
                                  <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <span className="text-zinc-300">2024-03-12</span>
                                      <span className="text-[10px]">04:00:00</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md">
                                      <Database className="w-3 h-3 drop-shadow-[0_0_3px_rgba(192,132,252,0.8)]" /> 创建备份
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-purple-400 font-sans">
                                      <Monitor className="w-4 h-4" />
                                      <span className="font-bold">System (Cron)</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-zinc-400 max-w-[250px]">
                                    <div className="truncate group-hover/row:text-zinc-200 transition-colors">
                                      Auto-Backup-20240312 (1.2GB)
                                    </div>
                                  </td>
                                </tr>
                                <tr className="hover:bg-white/[0.02] transition-colors group/row">
                                  <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <span className="text-zinc-300">2024-03-11</span>
                                      <span className="text-[10px]">22:15:42</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                                      <Terminal className="w-3 h-3 drop-shadow-[0_0_3px_rgba(96,165,250,0.8)]" /> 执行指令
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded bg-zinc-800 border border-white/10 flex items-center justify-center">
                                        <img src="https://minotar.net/helm/game_master99/32.png" alt="User" className="w-5 h-5 rounded-sm pixelated" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                      </div>
                                      <span className="text-white font-sans font-bold">game_master99</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-zinc-400 max-w-[250px]">
                                    <div className="truncate font-mono bg-black/50 px-2 py-1 rounded text-[10px] text-emerald-400 border border-white/5 inline-block group-hover/row:border-emerald-500/30 transition-colors">
                                      /op steve_miner
                                    </div>
                                  </td>
                                </tr>
                                <tr className="hover:bg-white/[0.02] transition-colors group/row">
                                  <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <span className="text-zinc-300">2024-03-11</span>
                                      <span className="text-[10px]">21:00:10</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-md">
                                      <RotateCcw className="w-3 h-3 drop-shadow-[0_0_3px_rgba(250,204,21,0.8)]" /> 重启服务器
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded bg-zinc-800 border border-white/10 flex items-center justify-center">
                                        <img src="https://minotar.net/helm/game_master99/32.png" alt="User" className="w-5 h-5 rounded-sm pixelated" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                      </div>
                                      <span className="text-white font-sans font-bold">game_master99</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-zinc-400 max-w-[250px]">
                                    <div className="truncate group-hover/row:text-zinc-200 transition-colors">
                                      [Web Panel] 面板点击重启
                                    </div>
                                  </td>
                                </tr>
                                <tr className="hover:bg-white/[0.02] transition-colors group/row">
                                  <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <span className="text-zinc-300">2024-03-11</span>
                                      <span className="text-[10px]">19:45:00</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md">
                                      <ShieldBan className="w-3 h-3 drop-shadow-[0_0_3px_rgba(248,113,113,0.8)]" /> 封禁玩家
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-red-400 font-sans">
                                      <ShieldCheck className="w-4 h-4" />
                                      <span className="font-bold">Anti-Cheat</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-zinc-400 max-w-[250px]">
                                    <div className="truncate group-hover/row:text-zinc-200 transition-colors">
                                      hacker_dude123 (Reason: Fly Hack)
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          
                          {/* Pagination Footer */}
                          <div className="px-6 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-xs text-zinc-500">
                            <span>Showing 1 to 5 of 128 entries</span>
                            <div className="flex gap-1">
                              <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded transition-colors disabled:opacity-50">Prev</button>
                              <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded transition-colors">1</button>
                              <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded transition-colors">2</button>
                              <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded transition-colors">3</button>
                              <span className="px-2">...</span>
                              <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded transition-colors">Next</button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* VERSIONS TAB */}
                    {instanceActiveTab === 'versions' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Current Version Dashboard */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden relative group">
                          {/* Animated Gradient Background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 z-0"></div>
                          
                          {/* Glowing Accent */}
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-[0_0_15px_rgba(52,211,153,1)] z-10"></div>
                          
                          <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                            <div className="flex items-start gap-5">
                              <div className="p-4 bg-black/60 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.15)] flex-shrink-0">
                                <GitBranch className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                              </div>
                              <div>
                                <h3 className="text-zinc-400 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
                                  当前核心系统 (Active Core)
                                </h3>
                                <div className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                  PaperMC 1.20.4
                                  <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 mt-3">
                                  <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                    <ShieldCheck className="w-3 h-3" /> 官方受支持版本
                                  </span>
                                  <span className="text-xs text-zinc-500 font-mono">Build #496 (Latest)</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                              <button className="px-6 py-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold text-sm rounded-xl border border-emerald-500/50 shadow-[0_0_15px_rgba(52,211,153,0.2)] hover:shadow-[0_0_25px_rgba(52,211,153,0.6)] transition-all flex items-center justify-center gap-2 group/update">
                                <RefreshCw className="w-4 h-4 group-hover/update:rotate-180 transition-transform duration-500" />
                                检查并一键更新 (Check Update)
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Version Switcher Grid */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <Database className="w-4 h-4 text-blue-400" /> 
                              切换服务端核心分支 (Switch Core Branch)
                            </h4>
                            <div className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold rounded border border-red-500/20 flex items-center gap-1.5">
                              <AlertTriangle className="w-3 h-3" /> 切换核心可能会导致数据丢失，请先备份
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* PaperMC - Active */}
                            <div className="bg-black/60 border border-emerald-500/50 rounded-xl p-5 cursor-pointer relative overflow-hidden group hover:border-emerald-400 transition-colors shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                              <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> 正在使用
                              </div>
                              
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                  <Terminal className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                  <div className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">PaperMC</div>
                                  <div className="text-[10px] font-mono text-zinc-500">Spigot Fork</div>
                                </div>
                              </div>
                              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed h-8">
                                业界标准的高性能服务端，修复了大量漏洞，提供极致的插件兼容性与流畅度。
                              </p>
                            </div>

                            {/* Purpur */}
                            <div className="bg-black/40 border border-white/10 hover:border-purple-500/50 rounded-xl p-5 cursor-pointer relative overflow-hidden group transition-colors hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/5 group-hover:bg-purple-500/10 flex items-center justify-center border border-white/5 group-hover:border-purple-500/30 transition-colors">
                                  <Settings2 className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                                </div>
                                <div>
                                  <div className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors">Purpur</div>
                                  <div className="text-[10px] font-mono text-zinc-500">Paper Fork</div>
                                </div>
                              </div>
                              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed h-8">
                                在 Paper 基础上提供海量自定义游戏机制选项，可修改实体 AI 与游戏特性。
                              </p>
                              
                              {/* Hover Action */}
                              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform bg-black/80 backdrop-blur-sm border-t border-purple-500/30 flex justify-end">
                                <button className="text-xs font-bold text-white bg-purple-500 hover:bg-purple-400 px-3 py-1.5 rounded transition-colors">安装此核心</button>
                              </div>
                            </div>

                            {/* Forge */}
                            <div className="bg-black/40 border border-white/10 hover:border-orange-500/50 rounded-xl p-5 cursor-pointer relative overflow-hidden group transition-colors hover:shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-500/5 group-hover:bg-orange-500/10 flex items-center justify-center border border-white/5 group-hover:border-orange-500/30 transition-colors">
                                  <Layers className="w-5 h-5 text-zinc-500 group-hover:text-orange-400 transition-colors" />
                                </div>
                                <div>
                                  <div className="font-bold text-white text-lg group-hover:text-orange-400 transition-colors">Forge</div>
                                  <div className="text-[10px] font-mono text-zinc-500">Modded Core</div>
                                </div>
                              </div>
                              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed h-8">
                                最老牌的模组 (Mods) 服务端，支持复杂的工业、魔法等大型重量级模组。
                              </p>
                              
                              {/* Hover Action */}
                              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform bg-black/80 backdrop-blur-sm border-t border-orange-500/30 flex justify-end">
                                <button className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-400 px-3 py-1.5 rounded transition-colors">安装此核心</button>
                              </div>
                            </div>
                            
                            {/* Fabric */}
                            <div className="bg-black/40 border border-white/10 hover:border-blue-500/50 rounded-xl p-5 cursor-pointer relative overflow-hidden group transition-colors hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/5 group-hover:bg-blue-500/10 flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-colors">
                                  <Feather className="w-5 h-5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                                </div>
                                <div>
                                  <div className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">Fabric</div>
                                  <div className="text-[10px] font-mono text-zinc-500">Modded Core</div>
                                </div>
                              </div>
                              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed h-8">
                                輕量級新興模组端，更新速度極快，主要用於生化、輔助類等輕度模組。
                              </p>
                              
                              {/* Hover Action */}
                              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform bg-black/80 backdrop-blur-sm border-t border-blue-500/30 flex justify-end">
                                <button className="text-xs font-bold text-white bg-blue-500 hover:bg-blue-400 px-3 py-1.5 rounded transition-colors">安装此核心</button>
                              </div>
                            </div>
                            
                            {/* Vanilla */}
                            <div className="bg-black/40 border border-white/10 hover:border-zinc-300/50 rounded-xl p-5 cursor-pointer relative overflow-hidden group transition-colors">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center border border-white/5 group-hover:border-white/30 transition-colors">
                                  <Box className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                  <div className="font-bold text-white text-lg group-hover:text-white transition-colors">Vanilla (原版)</div>
                                  <div className="text-[10px] font-mono text-zinc-500">Mojang Official</div>
                                </div>
                              </div>
                              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed h-8">
                                官方提供的純淨原版伺服器核心，不支援任何插件與模組，適合極致原汁原味生存。
                              </p>
                              
                              {/* Hover Action */}
                              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform bg-black/80 backdrop-blur-sm border-t border-white/30 flex justify-end">
                                <button className="text-xs font-bold text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded transition-colors">安装此核心</button>
                              </div>
                            </div>

                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* MANAGEMENT SETTINGS TAB */}
                    {instanceActiveTab === 'management' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Status Overview Banner */}
                        <div className="bg-black/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
                          <div className="flex items-center gap-4">
                            <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/10 shadow-inner flex-shrink-0">
                              <Server className="w-8 h-8 text-zinc-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                实例管理面板 (Instance Administration)
                              </h3>
                              <p className="text-xs text-zinc-500 mt-1">UUID: <span className="font-mono text-zinc-400 bg-white/5 px-1.5 rounded">{instance.id}</span></p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 px-6 py-3 bg-white/5 rounded-xl border border-white/10">
                            <div>
                              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">当前操作状态</div>
                              <div className="flex items-center gap-2 font-bold text-sm">
                                {instance.status === 'running' ? (
                                  <><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> <span className="text-emerald-400">运行中 (Active)</span></>
                                ) : instance.status === 'stopped' ? (
                                  <><span className="w-2 h-2 rounded-full bg-red-400"></span> <span className="text-red-400">已停止 (Stopped)</span></>
                                ) : (
                                  <><span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span> <span className="text-orange-400">处理中 (Processing)</span></>
                                )}
                              </div>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div>
                              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">到期时间</div>
                              <div className="text-sm font-bold text-zinc-300 font-mono">2026-10-15</div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Infrastructure Details */}
                          <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative">
                            <h4 className="text-sm font-bold text-white mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                              <span className="flex items-center gap-2"><Cpu className="w-4 h-4 text-blue-400" /> 基础设施参数 (Infrastructure)</span>
                              <button className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-zinc-400 transition-colors border border-white/5">刷新信息</button>
                            </h4>
                            
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors group">
                                <span className="text-xs font-bold text-zinc-500 flex items-center gap-2"><Box className="w-3.5 h-3.5" /> Docker 容器 ID</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-zinc-300 bg-black/50 px-2 py-1 rounded border border-white/5">fc8d132a-9e11-4f90...</span>
                                  <button className="text-zinc-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Copy className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors group">
                                <span className="text-xs font-bold text-zinc-500 flex items-center gap-2"><HardDrive className="w-3.5 h-3.5" /> 存储卷挂载点 (Volume)</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-zinc-300 bg-black/50 px-2 py-1 rounded border border-white/5">vol_user_data_{instance.id.substring(0,8)}</span>
                                  <button className="text-zinc-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Copy className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors group">
                                <span className="text-xs font-bold text-zinc-500 flex items-center gap-2"><Database className="w-3.5 h-3.5" /> 备份池分配 (Backup Pool)</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-zinc-300 bg-black/50 px-2 py-1 rounded border border-white/5">aws_s3_ap-northeast-1_b2</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors group">
                                <span className="text-xs font-bold text-zinc-500 flex items-center gap-2"><Network className="w-3.5 h-3.5" /> 分配内网 IP (Pterodactyl Node)</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">172.18.0.5</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Ownership & Billing */}
                          <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative">
                            <h4 className="text-sm font-bold text-white mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-purple-400" /> 归属与账单 (Ownership)</span>
                              <button className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-zinc-400 transition-colors border border-white/5">转移所有权</button>
                            </h4>
                            
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                                <span className="text-xs font-bold text-purple-400/80 flex items-center gap-2"><Users className="w-3.5 h-3.5" /> 所属用户 (Owner)</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 text-[10px] font-bold">U</div>
                                  <span className="text-sm font-bold text-white">user_789456</span>
                                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 cursor-pointer hover:text-white transition-colors" title="查看用户详情" />
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                                <span className="text-xs font-bold text-zinc-500 flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> 实例创建时间</span>
                                <span className="text-xs font-mono text-zinc-300">2024-03-01 14:22:05</span>
                              </div>
                              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                                <span className="text-xs font-bold text-zinc-500 flex items-center gap-2"><DollarSign className="w-3.5 h-3.5" /> 计费套餐 (Plan)</span>
                                <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded border border-white/10">C4M8 性能型 ($24/mo)</span>
                              </div>
                              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                                <span className="text-xs font-bold text-zinc-500 flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> 运行节点 (Node Allocation)</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-zinc-300">Node-JP-Tokyo-02</span>
                                  <button className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-colors">迁移</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Danger Zone / Admin Actions */}
                        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden group">
                          <h4 className="text-sm font-bold text-red-400 mb-6 flex items-center gap-2 border-b border-red-500/20 pb-4">
                            <ShieldAlert className="w-4 h-4" /> 危险操作与强制管理 (Administrative Danger Zone)
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                            {/* Suspend */}
                            <div className="bg-black/60 border border-orange-500/20 hover:border-orange-500/50 rounded-xl p-5 transition-colors flex flex-col justify-between h-[140px]">
                              <div>
                                <div className="font-bold text-orange-400 flex items-center gap-2 mb-1">
                                  <Power className="w-4 h-4" /> 挂起实例 (Suspend)
                                </div>
                                <div className="text-[10px] text-zinc-400 leading-relaxed">
                                  冻结该实例的运行，并在用户面板中显示锁定状态。通常用于欠费处理。
                                </div>
                              </div>
                              <button className="w-full py-2 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white text-xs font-bold rounded-lg border border-orange-500/30 transition-colors">
                                立即挂起实例
                              </button>
                            </div>

                            {/* Reinstall */}
                            <div className="bg-black/60 border border-yellow-500/20 hover:border-yellow-500/50 rounded-xl p-5 transition-colors flex flex-col justify-between h-[140px]">
                              <div>
                                <div className="font-bold text-yellow-400 flex items-center gap-2 mb-1">
                                  <RefreshCw className="w-4 h-4" /> 强制重装 (Reinstall)
                                </div>
                                <div className="text-[10px] text-zinc-400 leading-relaxed">
                                  删除所有文件（除非加入排除名单）并重新运行安装脚本下载核心文件。
                                </div>
                              </div>
                              <button className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-black text-xs font-bold rounded-lg border border-yellow-500/30 transition-colors">
                                执行破坏性重装
                              </button>
                            </div>

                            {/* Delete */}
                            <div className="bg-black/60 border border-red-500/30 hover:border-red-500/70 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] rounded-xl p-5 transition-all flex flex-col justify-between h-[140px]">
                              <div>
                                <div className="font-bold text-red-500 flex items-center gap-2 mb-1">
                                  <Trash2 className="w-4 h-4" /> 彻底销毁 (Delete)
                                </div>
                                <div className="text-[10px] text-zinc-400 leading-relaxed">
                                  从数据库和节点中永久删除此容器及所有相关数据卷。此操作不可逆。
                                </div>
                              </div>
                              <button className="w-full py-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold rounded-lg border border-red-500/50 transition-colors flex items-center justify-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5" /> 永久销毁实例
                              </button>
                            </div>
                          </div>
                        </div>

                      </motion.div>
                    )}

                    {/* OTHER TABS (Placeholders for any we missed, just in case) */}
                    {!['console', 'files', 'players', 'network', 'startup', 'backups', 'logs', 'versions', 'management'].includes(instanceActiveTab) && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-[400px] text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-black/20">
                        <Settings className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm font-bold text-zinc-400">[{tabs.find(t => t.id === instanceActiveTab)?.label}] 模块开发中</p>
                      </motion.div>
                    )}

                  </div>
                </motion.div>
              );
            })()}

            {/* TICKETS TAB */}
            {activeTab === "tickets" && (
              <motion.div key="tickets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-[1400px] mx-auto pb-20">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2.5">
                      <MessageSquare className="w-5 h-5 text-zinc-400" />
                      Support Tickets
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1.5">Manage customer inquiries, billing disputes, and technical support requests.</p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-[#0c0c0e] border border-zinc-800 rounded-lg p-1 shadow-sm">
                    <button className="px-4 py-1.5 rounded-md text-sm font-bold bg-zinc-800 text-zinc-200 shadow-sm transition-colors">All Tickets</button>
                    <button className="px-4 py-1.5 rounded-md text-sm font-semibold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors">Open / Pending</button>
                    <button className="px-4 py-1.5 rounded-md text-sm font-semibold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors">Closed</button>
                  </div>
                </div>

                <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm flex flex-col">
                  {/* Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-zinc-800/80 bg-[#111]/50 gap-4">
                     <div className="flex items-center gap-4">
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                           <input type="text" placeholder="Search ticket ID or subject..." className="bg-[#0a0a0c] border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors w-full sm:w-72 shadow-inner" />
                        </div>
                        <button className="px-4 py-2.5 border border-zinc-800 bg-[#0a0a0c] hover:bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                           <ListFilter className="w-4 h-4 text-zinc-500" /> Filter
                        </button>
                     </div>
                     <button className="px-5 py-2.5 bg-zinc-100 text-zinc-900 rounded-lg text-sm font-bold hover:bg-white transition-colors shadow-sm flex items-center gap-2">
                       <Plus className="w-4 h-4" /> New Ticket
                     </button>
                  </div>

                  {/* Tickets Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-[#0a0a0c] text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800/80">
                        <tr>
                          <th className="py-4 px-6 w-24">Ticket ID</th>
                          <th className="py-4 px-6">Subject / Requester</th>
                          <th className="py-4 px-6 w-32">Priority</th>
                          <th className="py-4 px-6 w-40">Status</th>
                          <th className="py-4 px-6 w-40 text-right">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/40 bg-[#0c0c0e]">
                        {tickets.map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-zinc-800/30 transition-colors group cursor-pointer">
                            <td className="py-4 px-6">
                              <span className="text-[13px] text-zinc-400 font-mono">#{ticket.id}</span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-1">
                                 <span className="font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate max-w-md">{ticket.subject}</span>
                                 <span className="text-[12px] text-zinc-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {ticket.user}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {ticket.priority === 'urgent' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-xs font-bold"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div> Urgent</span>}
                              {ticket.priority === 'normal' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-xs font-bold"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Normal</span>}
                              {ticket.priority === 'low' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 rounded-md text-xs font-bold"><div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div> Low</span>}
                            </td>
                            <td className="py-4 px-6">
                              {ticket.status === 'open' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-bold"><MessageSquare className="w-3.5 h-3.5" /> Open / Pending</span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 rounded-md text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Resolved</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="text-[13px] text-zinc-500 font-mono group-hover:text-zinc-300 transition-colors flex items-center justify-end gap-1.5"><Clock className="w-3.5 h-3.5" /> {ticket.updatedAt}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination Footer */}
                  <div className="p-4 border-t border-zinc-800/80 bg-[#0a0a0c] flex items-center justify-between">
                     <span className="text-xs text-zinc-500 font-medium">Showing {tickets.length} of {tickets.length} tickets</span>
                     <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 border border-zinc-800 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50">Previous</button>
                        <button className="px-3 py-1.5 border border-zinc-800 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50">Next</button>
                     </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5 text-zinc-400" /> 全局系统设置</h2>
                  <button className="bg-white text-black px-5 py-2 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors shadow-xl flex items-center gap-2">
                    <Save className="w-4 h-4" /> 保存更改
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-3">基础控制</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-sm">网站维护模式</div>
                        <div className="text-xs text-zinc-500 mt-1">开启后，除管理员外所有用户无法访问前端页面</div>
                      </div>
                      <button 
                        onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                        className={`w-12 h-6 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-sm">允许新用户注册</div>
                        <div className="text-xs text-zinc-500 mt-1">关闭后，注册接口将返回不可用</div>
                      </div>
                      <button 
                        onClick={() => setSettings({...settings, newRegistrations: !settings.newRegistrations})}
                        className={`w-12 h-6 rounded-full relative transition-colors ${settings.newRegistrations ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.newRegistrations ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-sm">实例自动开通 (Auto-Provisioning)</div>
                        <div className="text-xs text-zinc-500 mt-1">用户付款后，系统将自动调用 Pterodactyl API 开设机器</div>
                      </div>
                      <button 
                        onClick={() => setSettings({...settings, autoProvision: !settings.autoProvision})}
                        className={`w-12 h-6 rounded-full relative transition-colors ${settings.autoProvision ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.autoProvision ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-3">外部接口与 API</h3>
                    
                    <div>
                      <label className="block font-bold text-white text-sm mb-2">SMTP 服务器地址</label>
                      <input 
                        type="text" 
                        value={settings.smtpHost} 
                        onChange={e => setSettings({...settings, smtpHost: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors" 
                      />
                    </div>
                    
                    <div>
                      <label className="block font-bold text-white text-sm mb-2">Stripe Payment Key (Live)</label>
                      <input 
                        type="password" 
                        value={settings.stripeKey} 
                        onChange={e => setSettings({...settings, stripeKey: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors" 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

const INITIAL_BILLING_GAMES = [
  {
    id: "minecraft",
    name: "Minecraft Server",
    shortDesc: "Vanilla, Spigot, Paper & Modpacks",
    icon: "⛏️",
    coverImage: "https://images.unsplash.com/photo-1605333556488-ce9e58832a21?q=80&w=2000&auto=format&fit=crop",
    customPricing: {
      cpuPerCore: 2.5,
      ramPerGb: 1.5,
      storagePer10Gb: 0.8,
      trafficPerTb: 5.0,
      backupPerSlot: 1.0
    },
    plans: [
      { id: "mc-starter", name: "Starter", cpu: 2, ram: 4, storage: 20, traffic: 1, backups: 1, basePrice: 9.99 },
      { id: "mc-pro", name: "Professional", cpu: 4, ram: 8, storage: 50, traffic: 3, backups: 3, basePrice: 19.99 },
      { id: "mc-ultra", name: "Ultra", cpu: 8, ram: 16, storage: 100, traffic: 5, backups: 5, basePrice: 39.99 },
    ]
  },
  {
    id: "rust",
    name: "Rust Dedicated",
    shortDesc: "Oxide Plugins, Procedural Maps",
    icon: "⚙️",
    coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000&auto=format&fit=crop",
    customPricing: {
      cpuPerCore: 3.0,
      ramPerGb: 2.0,
      storagePer10Gb: 1.0,
      trafficPerTb: 5.0,
      backupPerSlot: 1.5
    },
    plans: [
      { id: "rust-basic", name: "Rust Basic", cpu: 4, ram: 8, storage: 60, traffic: 2, backups: 2, basePrice: 24.99 },
      { id: "rust-max", name: "Rust Max", cpu: 8, ram: 16, storage: 120, traffic: 5, backups: 5, basePrice: 49.99 },
    ]
  },
  {
    id: "palworld",
    name: "Palworld",
    shortDesc: "Co-op survival crafting",
    icon: "🐾",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop",
    customPricing: {
      cpuPerCore: 2.0,
      ramPerGb: 1.8,
      storagePer10Gb: 0.5,
      trafficPerTb: 4.0,
      backupPerSlot: 0.5
    },
    plans: [
      { id: "pal-small", name: "Small Guild", cpu: 4, ram: 16, storage: 40, traffic: 2, backups: 2, basePrice: 29.99 },
      { id: "pal-large", name: "Large Server", cpu: 8, ram: 32, storage: 100, traffic: 10, backups: 5, basePrice: 59.99 },
    ]
  }
];

const INITIAL_RANKS_LEGACY = [
  { id: "default", name: "Standard User", badgeColor: "bg-zinc-500", discountBase: 0, discountExtra: 0, maxServers: 5, prioritySupport: false },
  { id: "pro", name: "Pro Member", badgeColor: "bg-blue-500", discountBase: 10, discountExtra: 15, maxServers: 20, prioritySupport: true },
  { id: "partner", name: "Partner / Reseller", badgeColor: "bg-emerald-500", discountBase: 25, discountExtra: 30, maxServers: 100, prioritySupport: true },
  { id: "vip", name: "VIP Content Creator", badgeColor: "bg-purple-500", discountBase: 100, discountExtra: 100, maxServers: 3, prioritySupport: true },
];

function ProductsBillingTab() {
  const [games, setGames] = useState(INITIAL_BILLING_GAMES);
  const [ranks, setRanks] = useState(INITIAL_RANKS_LEGACY);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"products" | "ranks">("products");

  const selectedGame = games.find(g => g.id === selectedGameId);

  // Detail View
  if (selectedGame) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-[1400px] mx-auto pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2.5">
              <Package className="w-5 h-5 text-zinc-400" />
              Products & Pricing
            </h2>
            <p className="text-zinc-500 text-sm mt-1.5">Manage game configurations, plans, and custom resource pricing.</p>
          </div>
          
          <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-sm font-bold transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Create Product
          </button>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(game => (
            <div key={game.id} className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm hover:border-zinc-600 transition-all cursor-pointer group flex flex-col" onClick={() => setSelectedGameId(game.id)}>
              <div className="h-40 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                <img src={game.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={game.name} />
                <div className="absolute bottom-4 left-5 z-20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0a0a0c]/80 backdrop-blur-md border border-zinc-700/50 flex items-center justify-center text-xl shadow-lg">{game.icon}</div>
                  <span className="text-white font-bold text-lg drop-shadow-md">{game.name}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-sm text-zinc-400 mb-6">{game.shortDesc}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Packages</span>
                    <span className="text-zinc-200 font-mono text-sm">{game.plans.length} Active</span>
                  </div>
                  <button className="text-zinc-100 hover:text-white px-3 py-1.5 bg-[#111] border border-zinc-700/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <Settings2 className="w-3.5 h-3.5" /> Configure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Detail View
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-[1400px] mx-auto pb-20">
      
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <button onClick={() => setSelectedGameId(null)} className="hover:text-zinc-200 transition-colors">Products</button>
          <span>/</span>
          <span className="text-zinc-100 font-medium">{selectedGame.name}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#0c0c0e] flex items-center justify-center text-2xl shadow-sm border border-zinc-800/80">{selectedGame.icon}</div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">{selectedGame.name}</h2>
              <p className="text-sm text-zinc-500 mt-1 font-mono">{selectedGame.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-[#0c0c0e] border border-zinc-800/80 rounded-lg text-sm font-medium hover:border-zinc-700 transition-colors text-zinc-300">View Store Page</button>
            <button className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg text-sm font-bold hover:bg-white transition-colors shadow-sm flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: General & Custom Pricing */}
        <div className="flex flex-col gap-8 xl:col-span-1">
          
          {/* General Settings */}
          <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-zinc-100 mb-6 border-b border-zinc-800/80 pb-3">General Settings</h3>
            
            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Cover Image URL</label>
                <div className="relative">
                  <input type="text" defaultValue={selectedGame.coverImage} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors" />
                  <div className="mt-3 h-28 w-full rounded-lg overflow-hidden border border-zinc-800/80 shadow-inner">
                    <img src={selectedGame.coverImage} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Description</label>
                <input type="text" defaultValue={selectedGame.shortDesc} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors" />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Status</label>
                <select className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors appearance-none">
                  <option>Active / Available</option>
                  <option>Hidden</option>
                  <option>Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Custom Resource Pricing */}
          <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-zinc-800/80 pb-3">
               <h3 className="text-base font-bold text-zinc-100">Custom Resource Pricing</h3>
               <span className="text-xs text-zinc-500 font-medium border border-zinc-800 bg-[#0a0a0c] px-2 py-0.5 rounded">Monthly (USD)</span>
            </div>
            
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">Set the unit price for clients who customize their plan beyond the base package resources.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <span className="text-[13px] text-zinc-300 flex items-center gap-2.5 font-medium"><Cpu className="w-4 h-4 text-zinc-500" /> Additional CPU Core</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 text-sm font-mono">$</span>
                  <input type="number" defaultValue={selectedGame.customPricing.cpuPerCore} step="0.5" className="w-20 bg-[#0a0a0c] border border-zinc-800 rounded-md px-2.5 py-1.5 text-sm text-zinc-200 text-right focus:outline-none focus:border-zinc-500 transition-colors font-mono" />
                </div>
              </div>
              
              <div className="flex items-center justify-between group">
                <span className="text-[13px] text-zinc-300 flex items-center gap-2.5 font-medium"><MemoryStick className="w-4 h-4 text-zinc-500" /> Additional GB RAM</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 text-sm font-mono">$</span>
                  <input type="number" defaultValue={selectedGame.customPricing.ramPerGb} step="0.5" className="w-20 bg-[#0a0a0c] border border-zinc-800 rounded-md px-2.5 py-1.5 text-sm text-zinc-200 text-right focus:outline-none focus:border-zinc-500 transition-colors font-mono" />
                </div>
              </div>

              <div className="flex items-center justify-between group">
                <span className="text-[13px] text-zinc-300 flex items-center gap-2.5 font-medium"><HardDrive className="w-4 h-4 text-zinc-500" /> Per 10GB Storage</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 text-sm font-mono">$</span>
                  <input type="number" defaultValue={selectedGame.customPricing.storagePer10Gb} step="0.1" className="w-20 bg-[#0a0a0c] border border-zinc-800 rounded-md px-2.5 py-1.5 text-sm text-zinc-200 text-right focus:outline-none focus:border-zinc-500 transition-colors font-mono" />
                </div>
              </div>

              <div className="flex items-center justify-between group">
                <span className="text-[13px] text-zinc-300 flex items-center gap-2.5 font-medium"><Network className="w-4 h-4 text-zinc-500" /> Per 1TB Traffic</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 text-sm font-mono">$</span>
                  <input type="number" defaultValue={selectedGame.customPricing.trafficPerTb} step="1.0" className="w-20 bg-[#0a0a0c] border border-zinc-800 rounded-md px-2.5 py-1.5 text-sm text-zinc-200 text-right focus:outline-none focus:border-zinc-500 transition-colors font-mono" />
                </div>
              </div>

              <div className="flex items-center justify-between group">
                <span className="text-[13px] text-zinc-300 flex items-center gap-2.5 font-medium"><Database className="w-4 h-4 text-zinc-500" /> Per Backup Slot</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 text-sm font-mono">$</span>
                  <input type="number" defaultValue={selectedGame.customPricing.backupPerSlot} step="0.5" className="w-20 bg-[#0a0a0c] border border-zinc-800 rounded-md px-2.5 py-1.5 text-sm text-zinc-200 text-right focus:outline-none focus:border-zinc-500 transition-colors font-mono" />
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Base Packages / Plans */}
        <div className="flex flex-col gap-6 xl:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-zinc-100">Configured Packages</h3>
              <p className="text-sm text-zinc-500 mt-1">Pre-defined resource bundles offered to clients.</p>
            </div>
            <button className="px-4 py-2 border border-zinc-800/80 bg-[#0c0c0e] hover:border-zinc-600 text-zinc-200 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Add Package
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {selectedGame.plans.map((plan, idx) => (
              <div key={plan.id} className="bg-[#0c0c0e] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm hover:border-zinc-600/80 transition-colors flex flex-col group/plan">
                
                {/* Plan Header */}
                <div className="bg-[#111]/50 p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 rounded-full bg-emerald-500/80"></div>
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-100 text-lg flex items-center gap-2">{plan.name} <Edit2 className="w-3.5 h-3.5 text-zinc-600 cursor-pointer hover:text-zinc-300 transition-colors" /></span>
                      <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">{plan.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Base Price</span>
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-zinc-500 font-medium">$</span>
                        <input type="number" defaultValue={plan.basePrice} step="0.01" className="w-20 bg-transparent border-b border-zinc-700 focus:border-emerald-500 font-mono font-bold text-xl text-emerald-400 text-right focus:outline-none transition-colors" />
                        <span className="text-zinc-500 text-xs">/mo</span>
                      </div>
                    </div>
                    <button className="p-2.5 text-zinc-600 hover:text-red-400 transition-colors bg-[#0a0a0c] border border-zinc-800 rounded-lg hover:border-red-500/30"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Plan Details Config */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><Cpu className="w-3 h-3" /> CPU Cores</label>
                      <input type="number" defaultValue={plan.cpu} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-[15px] font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><MemoryStick className="w-3 h-3" /> RAM (GB)</label>
                      <input type="number" defaultValue={plan.ram} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-[15px] font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><HardDrive className="w-3 h-3" /> Storage (GB)</label>
                      <input type="number" defaultValue={plan.storage} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-[15px] font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><Network className="w-3 h-3" /> Traffic (TB)</label>
                      <input type="number" defaultValue={plan.traffic} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-[15px] font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><Database className="w-3 h-3" /> Backups</label>
                      <input type="number" defaultValue={plan.backups} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-[15px] font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </motion.div>
  );
}
