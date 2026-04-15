import { useState, type Dispatch, type SetStateAction } from "react";
import { motion } from "motion/react";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Edit2,
  FileText,
  Globe,
  HardDrive,
  ListFilter,
  MemoryStick,
  MessageSquare,
  Network,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Save,
  Search,
  Server,
  Settings,
  Settings2,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { GAMES_FOR_NODES } from "./adminDashboardConfig";
import type {
  AdminDashboardSettings,
  DatacenterRegionFormInput,
  Doc,
  GlobalNode,
  GlobalRegion,
  NodePowerAction,
  Ticket,
} from "./adminDashboardTypes";

function privateIpv4FromNodeId(nodeId: string) {
  let h = 0;
  for (let i = 0; i < nodeId.length; i++) {
    h = (h * 31 + nodeId.charCodeAt(i)) >>> 0;
  }
  const a = (h & 0xff) % 200 + 20;
  const b = ((h >>> 16) & 0xff) % 200 + 20;
  return `10.0.${a}.${b}`;
}

function getNodeStatusMeta(status: GlobalNode["status"]) {
  if (status === "online") {
    return {
      dotClassName: "bg-emerald-500",
      badgeClassName: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      instanceStateLabel: "Running",
      instanceStateClassName: "text-emerald-400",
    };
  }

  if (status === "maintenance") {
    return {
      dotClassName: "bg-amber-400",
      badgeClassName: "border-amber-500/20 bg-amber-500/10 text-amber-200",
      instanceStateLabel: "Restarting",
      instanceStateClassName: "text-amber-300",
    };
  }

  return {
    dotClassName: "bg-red-500",
    badgeClassName: "border-red-500/20 bg-red-500/10 text-red-300",
    instanceStateLabel: "Stopped",
    instanceStateClassName: "text-red-400",
  };
}

type NodesTabProps = {
  globalRegions: GlobalRegion[];
  selectedRegionId: string | null;
  setSelectedRegionId: Dispatch<SetStateAction<string | null>>;
  selectedPhysicalNode: GlobalNode | null;
  setSelectedPhysicalNode: Dispatch<SetStateAction<GlobalNode | null>>;
  editingRegionId: string | null;
  newNodeCity: string;
  setEditingRegionId: (regionId: string | null) => void;
  setNewNodeCity: (city: string) => void;
  onAddNodeToRegion: (regionId: string) => void;
  onDeleteNode: (regionId: string, nodeId: string) => void;
  onAddNewRegion: (input: DatacenterRegionFormInput) => Promise<boolean>;
  onRunNodePowerAction: (nodeId: string, action: NodePowerAction) => void;
  onUpdateRegion: (regionId: string, input: DatacenterRegionFormInput) => Promise<boolean>;
  onToggleNodeGame: (nodeId: string, gameId: string) => void;
};

export function AdminDashboardNodesTab({
  globalRegions,
  selectedRegionId,
  setSelectedRegionId,
  selectedPhysicalNode,
  setSelectedPhysicalNode,
  editingRegionId,
  newNodeCity,
  setEditingRegionId,
  setNewNodeCity,
  onAddNodeToRegion,
  onDeleteNode,
  onAddNewRegion,
  onRunNodePowerAction,
  onUpdateRegion,
  onToggleNodeGame,
}: NodesTabProps) {
  const gamesList = GAMES_FOR_NODES;
  const [regionModalMode, setRegionModalMode] = useState<"create" | "edit" | null>(null);
  const [regionModalTargetId, setRegionModalTargetId] = useState<string | null>(null);
  const [regionForm, setRegionForm] = useState<DatacenterRegionFormInput>({
    label: "",
    city: "",
  });
  const [isRegionModalSubmitting, setIsRegionModalSubmitting] = useState(false);

  const resetRegionModal = () => {
    setRegionModalMode(null);
    setRegionModalTargetId(null);
    setRegionForm({
      label: "",
      city: "",
    });
    setIsRegionModalSubmitting(false);
  };

  const openCreateRegionModal = () => {
    setRegionModalMode("create");
    setRegionModalTargetId(null);
    setRegionForm({
      label: "",
      city: "",
    });
  };

  const openEditRegionModal = (region: GlobalRegion) => {
    const primaryNode = region.nodes[0];
    setRegionModalMode("edit");
    setRegionModalTargetId(region.id);
    setRegionForm({
      label: region.label,
      city: primaryNode?.city ?? "",
    });
  };

  const updateRegionFormField = (field: keyof DatacenterRegionFormInput, value: string) => {
    setRegionForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmitRegionModal = async () => {
    const normalizedInput = {
      label: regionForm.label.trim(),
      city: regionForm.city.trim(),
    };

    if (!normalizedInput.label || !normalizedInput.city) {
      return;
    }

    setIsRegionModalSubmitting(true);

    const didSucceed =
      regionModalMode === "edit" && regionModalTargetId
        ? await onUpdateRegion(regionModalTargetId, normalizedInput)
        : await onAddNewRegion(normalizedInput);

    if (didSucceed) {
      resetRegionModal();
      return;
    }

    setIsRegionModalSubmitting(false);
  };

  if (selectedPhysicalNode) {
    const privateIp = privateIpv4FromNodeId(selectedPhysicalNode.id);
    const statusMeta = getNodeStatusMeta(selectedPhysicalNode.status);
    const publicDns = `ec2-${selectedPhysicalNode.publicIp.replace(/\./g, "-")}.compute-1.amazonaws.com`;
    const powerActions: Array<{
      id: NodePowerAction;
      label: string;
      icon: typeof Power;
      className: string;
    }> = [
      {
        id: "power_on",
        label: "Power On",
        icon: Power,
        className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
      },
      {
        id: "shutdown",
        label: "Shutdown",
        icon: PowerOff,
        className: "border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:bg-zinc-700/80",
      },
      {
        id: "force_off",
        label: "Force Off",
        icon: X,
        className: "border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/20",
      },
      {
        id: "restart",
        label: "Restart",
        icon: RefreshCw,
        className: "border-amber-500/25 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20",
      },
    ];

    return (
      <motion.div
        key="node-detail"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="mx-auto w-full max-w-[1200px]"
      >
        <div className="mb-8 flex flex-col gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSelectedPhysicalNode(null)}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-zinc-100">{selectedPhysicalNode.city} Host</h2>
                <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${statusMeta.badgeClassName}`}>
                  <div className={`h-2 w-2 rounded-full ${statusMeta.dotClassName}`} />
                  <span className="text-xs font-semibold capitalize">{selectedPhysicalNode.status}</span>
                </div>
              </div>
              <div className="mt-1 font-mono text-sm text-zinc-500">{selectedPhysicalNode.id}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {powerActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onRunNodePowerAction(selectedPhysicalNode.id, action.id)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${action.className}`}
                >
                  <ActionIcon className="h-4 w-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-12 rounded-xl border border-zinc-800/80 bg-[#0c0c0e] p-8 shadow-sm">
          <section>
            <h3 className="mb-6 border-b border-zinc-800/80 pb-3 text-lg font-bold text-zinc-100">Instance summary</h3>
            <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Instance ID</span>
                <span className="flex items-center gap-2 font-mono text-[15px] text-zinc-200">
                  {selectedPhysicalNode.id} <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Public IPv4 address</span>
                <span className="font-mono text-[15px] text-zinc-200">{selectedPhysicalNode.publicIp}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Private IPv4 address</span>
                <span className="font-mono text-[15px] text-zinc-200">{privateIp}</span>
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Public IPv4 DNS</span>
                <span className="truncate font-mono text-[15px] text-zinc-200" title={publicDns}>
                  {publicDns}
                </span>
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Private IPv4 DNS</span>
                <span className="truncate font-mono text-[15px] text-zinc-200">ip-10-0-internal.ec2.internal</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Instance state</span>
                <span className={`text-[15px] font-medium ${statusMeta.instanceStateClassName}`}>
                  {statusMeta.instanceStateLabel}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Platform details</span>
                <span className="text-[15px] text-zinc-200">Ubuntu 22.04 LTS (Jammy Jellyfish)</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Kernel ID</span>
                <span className="font-mono text-[15px] text-zinc-200">5.15.0-88-generic</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Bandwidth Capacity</span>
                <span className="text-[15px] text-zinc-200">{selectedPhysicalNode.bandwidth}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Anti-DDoS Firewall</span>
                <span className="text-[15px] text-zinc-200">Active (BGP Anycast)</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Base Latency</span>
                <span className="font-mono text-[15px] text-zinc-200">{selectedPhysicalNode.latency}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Uptime</span>
                <span className="font-mono text-[15px] text-zinc-200">41 days, 12:45:00</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-6 border-b border-zinc-800/80 pb-3 text-lg font-bold text-zinc-100">Hardware specifications</h3>
            <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Processor (CPU)</span>
                <span className="text-[15px] text-zinc-200">{selectedPhysicalNode.cpuSpec}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Architecture</span>
                <span className="text-[15px] text-zinc-200">x86_64</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Memory (RAM)</span>
                <span className="text-[15px] text-zinc-200">{selectedPhysicalNode.ramSpec}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-zinc-500">Memory Type</span>
                <span className="text-[15px] text-zinc-200">ECC DDR5 4800MHz</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-6 border-b border-zinc-800/80 pb-3 text-lg font-bold text-zinc-100">Storage configuration</h3>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-12 gap-4 py-2 text-[13px] font-medium uppercase tracking-wider text-zinc-500">
                <div className="col-span-2">Volume ID</div>
                <div className="col-span-2">Device</div>
                <div className="col-span-3">Model</div>
                <div className="col-span-2">Capacity</div>
                <div className="col-span-3">Usage Type</div>
              </div>
              <div className="grid grid-cols-12 gap-4 border-t border-zinc-800/40 py-3 text-[15px] text-zinc-200">
                <div className="col-span-2 font-mono text-zinc-400">vol-0a1b2c3d4e</div>
                <div className="col-span-2 font-mono">/dev/nvme0n1</div>
                <div className="col-span-3 truncate">Samsung PM9A3 M.2 NVMe</div>
                <div className="col-span-2">1024 GB</div>
                <div className="col-span-3 flex items-center">
                  <span className="w-fit rounded border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                    Boot / System
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4 border-t border-zinc-800/40 py-3 text-[15px] text-zinc-200">
                <div className="col-span-2 font-mono text-zinc-400">vol-9f8e7d6c5b</div>
                <div className="col-span-2 font-mono">/dev/nvme1n1</div>
                <div className="col-span-3 truncate">Micron 7450 PRO U.2 NVMe</div>
                <div className="col-span-2">3840 GB</div>
                <div className="col-span-3 flex items-center">
                  <span className="w-fit rounded border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400">
                    Game Data
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4 border-t border-zinc-800/40 py-3 text-[15px] text-zinc-200">
                <div className="col-span-2 font-mono text-zinc-400">vol-1a2b3c4d5e</div>
                <div className="col-span-2 font-mono">/dev/sda1</div>
                <div className="col-span-3 truncate">Seagate Exos X20 SATA HDD</div>
                <div className="col-span-2">18000 GB</div>
                <div className="col-span-3 flex items-center">
                  <span className="w-fit rounded border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-400">
                    Cold Backup
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h3 className="text-lg font-bold text-zinc-100">Service allocation</h3>
              <span className="text-xs font-medium text-zinc-500">Toggle allowed game instances</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {gamesList.map((game) => {
                const isEnabled = selectedPhysicalNode.supportedGames.includes(game.id);
                return (
                  <div
                    key={game.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onToggleNodeGame(selectedPhysicalNode.id, game.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onToggleNodeGame(selectedPhysicalNode.id, game.id);
                      }
                    }}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors hover:border-zinc-600 ${
                      isEnabled ? "border-zinc-700 bg-zinc-800/30" : "border-zinc-800/60 bg-[#111]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl shadow-sm ${
                          isEnabled ? "bg-zinc-800" : "bg-zinc-900"
                        }`}
                      >
                        {game.icon}
                      </div>
                      <span className={`text-[15px] font-semibold ${isEnabled ? "text-zinc-100" : "text-zinc-400"}`}>
                        {game.name}
                      </span>
                    </div>
                    <div
                      className={`relative h-6 w-12 rounded-full transition-colors ${isEnabled ? "bg-emerald-500" : "bg-zinc-800"}`}
                    >
                      <span
                        className={`absolute left-1 top-1 h-4 w-4 rounded-full transition-all ${
                          isEnabled ? "translate-x-6 bg-zinc-900" : "translate-x-0 bg-zinc-500"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </motion.div>
    );
  }

  const regionForDetail = selectedRegionId
    ? globalRegions.find((r) => r.id === selectedRegionId) ?? null
    : null;

  return (
    <motion.div
      key={regionForDetail ? "region-detail" : "nodes-list"}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full"
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 pb-20">
        {regionForDetail ? (
          <motion.div
            key={`region-${regionForDetail.id}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRegionId(null);
                      setSelectedPhysicalNode(null);
                    }}
                    className="transition-colors hover:text-zinc-200"
                  >
                    Datacenters
                  </button>
                  <span>/</span>
                  <span className="font-medium text-zinc-100">{regionForDetail.label}</span>
                </div>

                <div className="flex flex-col justify-between gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-[#111] shadow-sm">
                      <Globe className="h-6 w-6 text-zinc-300" />
                    </div>
                    <div>
                      <h2 className="flex flex-wrap items-center gap-3 text-2xl font-bold text-zinc-100">
                        {regionForDetail.label} Cluster
                        <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          ONLINE
                        </span>
                      </h2>
                      <p className="mt-1 font-mono text-sm uppercase tracking-wider text-zinc-500">{regionForDetail.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEditRegionModal(regionForDetail)}
                      className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-[#0c0c0e] px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
                    >
                      <Settings2 className="h-4 w-4" /> Region Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingRegionId(regionForDetail.id)}
                      className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-900 shadow-sm transition-colors hover:bg-white"
                    >
                      <Plus className="h-4 w-4" /> Deploy Host
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div className="flex flex-col gap-4 rounded-xl border border-zinc-800/80 bg-[#0c0c0e] p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      <Cpu className="h-3.5 w-3.5" /> Cluster CPU
                    </span>
                    <span className="font-mono text-xs text-emerald-400">42%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
                    <div
                      className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                      style={{ width: "42%" }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500">2,480 Cores Allocated</span>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-zinc-800/80 bg-[#0c0c0e] p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      <MemoryStick className="h-3.5 w-3.5" /> Cluster RAM
                    </span>
                    <span className="font-mono text-xs text-orange-400">68%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
                    <div
                      className="h-full rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]"
                      style={{ width: "68%" }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500">12.5 TB / 18.4 TB Used</span>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-zinc-800/80 bg-[#0c0c0e] p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      <HardDrive className="h-3.5 w-3.5" /> Cluster Storage
                    </span>
                    <span className="font-mono text-xs text-zinc-300">31%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
                    <div className="h-full rounded-full bg-zinc-400" style={{ width: "31%" }} />
                  </div>
                  <span className="text-[11px] text-zinc-500">450 TB NVMe Available</span>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-zinc-800/80 bg-[#0c0c0e] p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      <Network className="h-3.5 w-3.5" /> Network Uplink
                    </span>
                    <span className="font-mono text-xs text-emerald-400">15%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
                    <div
                      className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                      style={{ width: "15%" }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500">42 Gbps / 200 Gbps Peak</span>
                </div>
              </div>

              <div className="mt-2 flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-[#0c0c0e] shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-zinc-800/80 bg-[#111]/50 p-5 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-base font-bold text-zinc-200">Physical Hosts</h3>
                    <p className="mt-1 text-xs text-zinc-500">Servers provisioned within this datacenter.</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search hosts..."
                      className="w-full rounded-lg border border-zinc-800/80 bg-[#0a0a0c] py-2 pl-9 pr-4 text-sm text-zinc-200 transition-colors focus:border-zinc-600 focus:outline-none sm:w-64"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full whitespace-nowrap text-left text-sm">
                    <thead className="border-b border-zinc-800/80 bg-[#0a0a0c] text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      <tr>
                        <th className="px-6 py-4">Host ID / Location</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Public IP</th>
                        <th className="px-6 py-4">Hardware Spec</th>
                        <th className="px-6 py-4">Allocated Games</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40 bg-[#0c0c0e]">
                      {regionForDetail.nodes.map((node) => (
                        <tr
                          key={node.id}
                          className="group cursor-pointer transition-colors hover:bg-zinc-800/30"
                          onClick={() => setSelectedPhysicalNode(node)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <HardDrive className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-zinc-300" />
                              <div className="flex flex-col">
                                <span className="font-medium text-zinc-200">{node.city}</span>
                                <span className="mt-0.5 font-mono text-[11px] text-zinc-500">{node.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  node.status === "online"
                                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                    : "bg-red-500"
                                }`}
                              />
                              <span className="text-[13px] font-medium capitalize text-zinc-300">{node.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-[13px] text-zinc-400">{node.publicIp}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[13px] text-zinc-300">{node.cpuSpec}</span>
                              <span className="text-[11px] text-zinc-500">{node.ramSpec}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex -space-x-1.5">
                              {node.supportedGames.slice(0, 3).map((gameId) => {
                                const game = gamesList.find((g) => g.id === gameId);
                                return game ? (
                                  <div
                                    key={gameId}
                                    title={game.name}
                                    className="z-10 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-600 bg-zinc-800 text-[10px] shadow-sm transition-transform hover:z-20 hover:-translate-y-0.5"
                                  >
                                    {game.icon}
                                  </div>
                                ) : null;
                              })}
                              {node.supportedGames.length > 3 && (
                                <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-[#111] text-[10px] font-medium text-zinc-400">
                                  +{node.supportedGames.length - 3}
                                </div>
                              )}
                              {node.supportedGames.length === 0 && <span className="text-xs text-zinc-600">None</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteNode(regionForDetail.id, node.id);
                                }}
                                className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-red-400/10 hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <ChevronRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-zinc-400" />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {regionForDetail.nodes.length === 0 && (
                        <tr>
                          <td colSpan={6} className="bg-[#0a0a0c] py-12 text-center text-sm text-zinc-500">
                            No physical hosts deployed in this region yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-zinc-800/80 bg-[#111]/50 p-4">
                  {editingRegionId === regionForDetail.id ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        placeholder="City (e.g. Tokyo)"
                        value={newNodeCity}
                        onChange={(e) => setNewNodeCity(e.target.value)}
                        className="flex-1 rounded-lg border border-zinc-700/80 bg-[#0a0a0c] px-4 py-2.5 text-sm text-zinc-200 shadow-inner transition-all placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => onAddNodeToRegion(regionForDetail.id)}
                        className="rounded-lg bg-zinc-200 px-6 py-2.5 text-sm font-bold text-zinc-900 shadow-sm transition-colors hover:bg-white"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingRegionId(regionForDetail.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700/80 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:border-zinc-500 hover:bg-zinc-800/20 hover:text-zinc-200"
                    >
                      <Plus className="h-4 w-4" /> Quick Add Host
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-col justify-between gap-4 border-b border-zinc-800/80 pb-6 md:flex-row md:items-center">
              <div>
                <h2 className="flex items-center gap-2.5 text-2xl font-semibold text-zinc-100">
                  <Server className="h-5 w-5 text-zinc-400" />
                  Physical Datacenters
                </h2>
                <p className="mt-1.5 text-sm text-zinc-500">Manage physical host servers and global routing regions.</p>
              </div>

              <div className="flex items-center gap-8 rounded-xl border border-zinc-800/80 bg-[#111] px-5 py-3 text-sm shadow-sm">
                <div className="flex flex-col">
                  <span className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Hosts</span>
                  <span className="text-base font-bold text-zinc-200">
                    {globalRegions.reduce((acc, r) => acc + r.nodes.length, 0)}
                  </span>
                </div>
                <div className="h-8 w-px bg-zinc-800/80" />
                <div className="flex flex-col">
                  <span className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Global Capacity</span>
                  <span className="text-base font-bold text-zinc-200">84.2 Tbps</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={openCreateRegionModal}
                className="flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-bold text-zinc-900 shadow-sm transition-colors hover:bg-white"
              >
                <Plus className="h-4 w-4" /> Add Datacenter Region
              </button>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {globalRegions.map((region) => (
                <div
                  key={region.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedPhysicalNode(null);
                    setSelectedRegionId(region.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPhysicalNode(null);
                      setSelectedRegionId(region.id);
                    }
                  }}
                  className="group flex cursor-pointer flex-col rounded-xl border border-zinc-800/80 bg-[#0c0c0e] p-5 shadow-sm transition-colors hover:border-zinc-600"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-[#111]">
                        <Globe className="h-5 w-5 text-zinc-400 transition-colors group-hover:text-zinc-200" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-zinc-100">{region.label}</h3>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">{region.id}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-600 transition-colors group-hover:text-zinc-400" />
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="flex flex-col rounded-lg border border-zinc-800/60 bg-[#0a0a0c] p-3">
                      <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Physical Hosts</span>
                      <span className="font-mono text-xl font-bold text-zinc-200">{region.nodes.length}</span>
                    </div>
                    <div className="flex flex-col rounded-lg border border-zinc-800/60 bg-[#0a0a0c] p-3">
                      <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Status</span>
                      <span className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />{" "}
                        Operational
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-zinc-800/60 pt-4">
                    <span className="flex items-center gap-1.5 font-mono text-xs text-zinc-500">
                      <Activity className="h-3.5 w-3.5 text-zinc-400" /> CPU: 42%
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-xs text-zinc-500">
                      <MemoryStick className="h-3.5 w-3.5 text-zinc-400" /> RAM: 68%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {globalRegions.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/80 bg-[#0c0c0e] py-20">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-[#111] shadow-sm">
                  <Server className="h-7 w-7 text-zinc-500" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-200">No datacenters configured</h3>
                <p className="max-w-md text-center text-sm leading-relaxed text-zinc-500">
                  Get started by provisioning a new region to allocate physical hosts for your game containers.
                </p>
              </div>
            )}
          </>
        )}

        <Dialog open={regionModalMode !== null} onOpenChange={(open) => !open && resetRegionModal()}>
          <DialogContent className="max-w-xl border border-zinc-800 bg-[#080808] p-0 text-zinc-100 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
            <DialogHeader className="border-b border-zinc-800/80 px-6 pb-4 pt-6 text-left">
              <DialogTitle className="text-lg font-semibold text-zinc-100">
                {regionModalMode === "edit" ? "Edit Datacenter Card" : "Create Datacenter Card"}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-zinc-500">
                {regionModalMode === "edit"
                  ? "Update the card title and the primary node details for this datacenter."
                  : "Create a new datacenter card and seed it with the first physical node."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 px-6 py-5">
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Node Name</span>
                <input
                  type="text"
                  value={regionForm.label}
                  onChange={(event) => updateRegionFormField("label", event.target.value)}
                  placeholder="e.g. Tokyo Prime"
                  className="rounded-xl border border-zinc-700/80 bg-[#0f0f10] px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Node Location</span>
                <input
                  type="text"
                  value={regionForm.city}
                  onChange={(event) => updateRegionFormField("city", event.target.value)}
                  placeholder="e.g. Tokyo, Japan"
                  className="rounded-xl border border-zinc-700/80 bg-[#0f0f10] px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </label>

            </div>

            <DialogFooter className="border-t border-zinc-800/80 bg-[#050505] px-6 py-4">
              <button
                type="button"
                onClick={resetRegionModal}
                className="rounded-lg border border-zinc-700 bg-transparent px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleSubmitRegionModal();
                }}
                disabled={
                  isRegionModalSubmitting ||
                  !regionForm.label.trim() ||
                  !regionForm.city.trim()
                }
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRegionModalSubmitting
                  ? "Saving..."
                  : regionModalMode === "edit"
                    ? "Save Changes"
                    : "Create Card"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}

type DocsTabProps = {
  docs: Doc[];
  onAddNewDoc: () => void;
  onToggleDocStatus: (id: number) => void;
  onDeleteDoc: (id: number) => void;
};

export function AdminDashboardDocsTab({
  docs,
  onAddNewDoc,
  onToggleDocStatus,
  onDeleteDoc,
}: DocsTabProps) {
  return (
    <motion.div key="docs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <FileText className="h-5 w-5 text-purple-400" /> 支持文档管理
        </h2>
        <button
          onClick={onAddNewDoc}
          className="flex items-center gap-2 rounded-xl bg-purple-500 px-4 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all hover:bg-purple-400"
        >
          <Plus className="h-4 w-4" /> 撰写新文章
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0c]/80 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center border-b border-white/5 bg-black/40 p-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="搜索文档..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white transition-colors focus:border-purple-500/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-6 border-b border-white/5 bg-black/20 p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
          <div className="w-10 text-center">ID</div>
          <div>文章标题</div>
          <div className="w-32">分类</div>
          <div className="w-24">状态</div>
          <div className="w-24 text-right">操作</div>
        </div>

        <div className="flex flex-col">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-6 border-b border-white/5 p-4 transition-colors hover:bg-white/5"
            >
              <div className="w-10 text-center font-mono text-xs text-zinc-600">{doc.id}</div>
              <div>
                <div className="flex cursor-pointer items-center gap-2 text-sm font-bold text-white transition-colors hover:text-purple-400">
                  {doc.title} <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
                </div>
                <div className="mt-1 text-xs text-zinc-500">最后更新: {doc.date}</div>
              </div>
              <div className="w-32">
                <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300">
                  {doc.category}
                </span>
              </div>
              <div className="w-24">
                <button
                  onClick={() => onToggleDocStatus(doc.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
                    doc.status === "published"
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {doc.status === "published" ? <CheckCircle2 className="h-3 w-3" /> : <Settings className="h-3 w-3" />}
                  {doc.status === "published" ? "已发布" : "草稿"}
                </button>
              </div>
              <div className="flex w-24 justify-end gap-2">
                <button className="rounded-lg bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/20 hover:text-white">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteDoc(doc.id)}
                  className="rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

type TicketsTabProps = {
  tickets: Ticket[];
  ticketsLoadError: string | null;
};

export function AdminDashboardTicketsTab({ tickets, ticketsLoadError }: TicketsTabProps) {
  return (
    <motion.div
      key="tickets"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-auto w-full max-w-[1400px] pb-20"
    >
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-zinc-800/80 pb-6 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2.5 text-2xl font-semibold text-zinc-100">
            <MessageSquare className="h-5 w-5 text-zinc-400" />
            Support Tickets
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500">
            Manage customer inquiries, billing disputes, and technical support requests.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-[#0c0c0e] p-1 shadow-sm">
          <button
            type="button"
            className="rounded-md bg-zinc-800 px-4 py-1.5 text-sm font-bold text-zinc-200 shadow-sm transition-colors"
          >
            All Tickets
          </button>
          <button
            type="button"
            className="rounded-md px-4 py-1.5 text-sm font-semibold text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
          >
            Open / Pending
          </button>
          <button
            type="button"
            className="rounded-md px-4 py-1.5 text-sm font-semibold text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
          >
            Closed
          </button>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-[#0c0c0e] shadow-sm">
        {ticketsLoadError && (
          <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{ticketsLoadError}</div>
        )}

        <div className="flex flex-col justify-between gap-4 border-b border-zinc-800/80 bg-[#111]/50 p-5 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search ticket ID or subject..."
                className="w-full rounded-lg border border-zinc-800 bg-[#0a0a0c] py-2.5 pl-9 pr-4 text-sm text-zinc-200 shadow-inner transition-colors focus:border-zinc-600 focus:outline-none sm:w-72"
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#0a0a0c] px-4 py-2.5 text-sm font-medium text-zinc-300 shadow-sm transition-colors hover:bg-zinc-800"
            >
              <ListFilter className="h-4 w-4 text-zinc-500" /> Filter
            </button>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-bold text-zinc-900 shadow-sm transition-colors hover:bg-white"
          >
            <Plus className="h-4 w-4" /> New Ticket
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-zinc-800/80 bg-[#0a0a0c] text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="w-24 px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Subject / Requester</th>
                <th className="w-32 px-6 py-4">Priority</th>
                <th className="w-40 px-6 py-4">Status</th>
                <th className="w-40 px-6 py-4 text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 bg-[#0c0c0e]">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="group cursor-pointer transition-colors hover:bg-zinc-800/30">
                  <td className="px-6 py-4">
                    <span className="font-mono text-[13px] text-zinc-400">#{ticket.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex max-w-md flex-col gap-1">
                      <span className="truncate font-bold text-zinc-200 transition-colors group-hover:text-emerald-400">
                        {ticket.subject}
                      </span>
                      <span className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                        <Users className="h-3.5 w-3.5" /> {ticket.user}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {ticket.priority === "urgent" && (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" /> Urgent
                      </span>
                    )}
                    {ticket.priority === "high" && (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-200">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400" /> High
                      </span>
                    )}
                    {ticket.priority === "normal" && (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Normal
                      </span>
                    )}
                    {ticket.priority === "low" && (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-xs font-bold text-zinc-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-500" /> Low
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {ticket.status === "open" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
                        <MessageSquare className="h-3.5 w-3.5" /> Open / Pending
                      </span>
                    ) : ticket.status === "answered" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-300">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Answered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-xs font-bold text-zinc-500">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Closed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center justify-end gap-1.5 font-mono text-[13px] text-zinc-500 transition-colors group-hover:text-zinc-300">
                      <Clock className="h-3.5 w-3.5" /> {ticket.updatedAt}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800/80 bg-[#0a0a0c] p-4">
          <span className="text-xs font-medium text-zinc-500">
            Showing {tickets.length} of {tickets.length} tickets
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-50"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

type SettingsTabProps = {
  settings: AdminDashboardSettings;
  setSettings: Dispatch<SetStateAction<AdminDashboardSettings>>;
};

export function AdminDashboardSettingsTab({ settings, setSettings }: SettingsTabProps) {
  return (
    <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <Settings className="h-5 w-5 text-zinc-400" /> 全局系统设置
        </h2>
        <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-bold text-black shadow-xl transition-colors hover:bg-zinc-200">
          <Save className="h-4 w-4" /> 保存更改
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6 rounded-3xl border border-white/10 bg-[#0a0a0c]/80 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="mb-4 border-b border-white/5 pb-3 text-lg font-bold text-white">基础控制</h3>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">网站维护模式</div>
              <div className="mt-1 text-xs text-zinc-500">开启后，除管理员外所有用户无法访问前端页面</div>
            </div>
            <button
              onClick={() => setSettings((current) => ({ ...current, maintenanceMode: !current.maintenanceMode }))}
              className={`relative h-6 w-12 rounded-full transition-colors ${
                settings.maintenanceMode ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${settings.maintenanceMode ? "left-7" : "left-1"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">允许新用户注册</div>
              <div className="mt-1 text-xs text-zinc-500">关闭后，注册接口将返回不可用</div>
            </div>
            <button
              onClick={() =>
                setSettings((current) => ({ ...current, newRegistrations: !current.newRegistrations }))
              }
              className={`relative h-6 w-12 rounded-full transition-colors ${
                settings.newRegistrations ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${settings.newRegistrations ? "left-7" : "left-1"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">实例自动开通 (Auto-Provisioning)</div>
              <div className="mt-1 text-xs text-zinc-500">用户付款后，系统将自动调用 Pterodactyl API 开设机器</div>
            </div>
            <button
              onClick={() => setSettings((current) => ({ ...current, autoProvision: !current.autoProvision }))}
              className={`relative h-6 w-12 rounded-full transition-colors ${
                settings.autoProvision ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${settings.autoProvision ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-white/10 bg-[#0a0a0c]/80 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="mb-4 border-b border-white/5 pb-3 text-lg font-bold text-white">外部接口与 API</h3>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">SMTP 服务器地址</label>
            <input
              type="text"
              value={settings.smtpHost}
              onChange={(event) => setSettings((current) => ({ ...current, smtpHost: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white transition-colors focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">Stripe Payment Key (Live)</label>
            <input
              type="password"
              value={settings.stripeKey}
              onChange={(event) => setSettings((current) => ({ ...current, stripeKey: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-zinc-400 transition-colors focus:border-zinc-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
