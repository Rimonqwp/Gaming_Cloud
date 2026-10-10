import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, Circle, Plus, Search, Settings, ShieldCheck, Network, X, type LucideIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { isExposedManagementPort, validatePortRule, type PortRule, type PortRuleDraft } from "./gameServerPortRules";
import { GameServerPortRuleDrawer, defaultPortDraft } from './GameServerPortRuleDrawer';
import { GameServerIpBlacklist, type BlockedIp } from './GameServerIpBlacklist';
import "../../../styles/cloud-port-settings.css";

const recommendations = ["开放 25565 TCP（Minecraft Java 版）", "开放 19132 UDP（Minecraft 基岩版）", "仅允许特定 IP 访问管理端口（如 22、25575）", "启用 DDoS 防护，防止恶意流量攻击"];

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <div className="gport-select"><select aria-label={label} value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={15} /></div>;
}
function Badge({ children, tone, dot = true }: { children: string; tone: string; dot?: boolean }) {
  return <span className={`gport-badge ${tone}`}>{dot && <Circle size={7} fill="currentColor" aria-hidden="true" />}{children}</span>;
}

export function GameServerPortSettings({ open, onOpenChange, rules, onRulesChange, onNotice, machineName, settingsPages, activeSetting, onSettingChange }: {
  open: boolean; onOpenChange: (value: boolean) => void; rules: PortRule[];
  onRulesChange: (rules: PortRule[]) => void; onNotice: (message: string) => void;
  machineName: string; activeSetting: string; onSettingChange: (value: string) => void;
  settingsPages: { id: string; title: string; description: string; icon: LucideIcon; content: ReactNode }[];
}) {
  const activePage = settingsPages.find(item => item.id === activeSetting);
  const [tab, setTab] = useState("端口规则");
  const [query, setQuery] = useState("");
  const [protocol, setProtocol] = useState("全部协议");
  const [status, setStatus] = useState("全部状态");
  const [networkExpanded, setNetworkExpanded] = useState(true);
  useEffect(() => { if (open && (activeSetting === "ports" || activeSetting === "blacklist")) setNetworkExpanded(true); }, [open, activeSetting]);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [editor, setEditor] = useState<{ id?: string; draft: PortRuleDraft } | null>(null);
  const [editorContainer, setEditorContainer] = useState<HTMLDivElement | null>(null);
  const [templates, setTemplates] = useState<PortRuleDraft[]>([]);
  const [blacklist, setBlacklist] = useState<BlockedIp[]>([]);

  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const selectAllRef = useRef<HTMLInputElement>(null);
  const filtered = rules.filter(rule => (!query.trim() || `${rule.range} ${rule.networkRange ?? rule.range} ${rule.protocol} ${rule.source} ${rule.title} ${rule.description}`.toLowerCase().includes(query.trim().toLowerCase())) && (protocol === "全部协议" || rule.protocol.includes(protocol)) && (status === "全部状态" || rule.enabled === (status === "已启用")));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allSelected = visible.length > 0 && visible.every(rule => selected.includes(rule.id));
  useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = !allSelected && visible.some(rule => selected.includes(rule.id)); }, [allSelected, visible, selected]);
  const enabledCount = rules.filter(rule => rule.enabled).length;
  const riskCount = rules.filter(isExposedManagementPort).length;
  const update = (next: PortRule[], message: string) => {
    onRulesChange(next);
    onNotice(`${message}（演示操作）`);
  };
  const toggle = (ids: string[], enabled: boolean) => update(rules.map(rule => ids.includes(rule.id) ? { ...rule, enabled } : rule), `已${enabled ? "启用" : "禁用"} ${ids.length} 条端口规则`);
  const saveRule = (saveTemplate = false) => {
    if (!editor) return;
    const draft = { ...editor.draft, range: editor.draft.range.replace(/\s/g, ""), networkRange: (editor.draft.networkRange ?? editor.draft.range).replace(/\s/g, ""), source: editor.draft.source.trim(), title: editor.draft.title.trim(), description: editor.draft.description.trim() };
    const validation = validatePortRule(draft);
    if (validation) { setError(validation); return; }
    if (rules.some(rule => rule.id !== editor.id && (rule.protocol.includes(draft.protocol) || draft.protocol.includes(rule.protocol)) && rule.range === draft.range && (rule.networkRange ?? rule.range) === draft.networkRange && rule.source === draft.source)) { setError("相同协议、端口范围和来源的规则已存在。"); return; }
    update(editor.id ? rules.map(rule => rule.id === editor.id ? { ...draft, id: editor.id! } : rule) : [...rules, { ...draft, id: crypto.randomUUID() }], editor.id ? "端口规则已更新" : "端口规则已新增");
    if (saveTemplate) setTemplates(previous => [...previous.filter(value => value.title !== draft.title), { ...draft, tags: [...(draft.tags ?? [])] }]);
    setEditor(null);
  };

  return <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={setEditorContainer} showCloseButton={false} className="cloud-modal gport-dialog" onCloseAutoFocus={event => { event.preventDefault(); document.querySelector<HTMLButtonElement>(".gsm-network-ports button")?.focus(); }}>
        <div className="gport-settings-layout">
          <aside className="gport-settings-sidebar">
            <div className="gport-settings-brand"><Settings size={23} /><div><strong>机器设定</strong><span>{machineName}</span></div></div>
            <nav aria-label="机器设定分页">
              {[...settingsPages.slice(0, 2), { id: "network-settings", title: "网络设定", icon: Network }, ...settingsPages.slice(2)].map(({ id, title, icon: Icon }) => id === "network-settings" ? <div className="gport-nav-group" key={id}><button type="button" aria-expanded={networkExpanded} aria-controls="gport-network-subnav" className={activeSetting === "ports" || activeSetting === "blacklist" ? "gport-nav-parent-active" : ""} onClick={() => setNetworkExpanded(value => !value)}><Icon size={19} /><span>{title}</span><ChevronDown size={15} /></button><div id="gport-network-subnav" className="gport-subnav" hidden={!networkExpanded}>{[{ id: "ports", title: "开放端口设定" }, { id: "blacklist", title: "IP 黑名单" }].map(item => <button type="button" key={item.id} aria-current={activeSetting === item.id ? "page" : undefined} onClick={() => onSettingChange(item.id)}><span>{item.title}</span></button>)}</div></div> : <button type="button" key={id} aria-current={activeSetting === id ? "page" : undefined} onClick={() => onSettingChange(id)}><Icon size={19} /><span>{title}</span><ChevronRight size={15} /></button>)}
            </nav>
          </aside>
          <div className="gport-settings-main">
          <header className="gport-content gport-header">
            <DialogTitle>{activePage?.title ?? (activeSetting === "blacklist" ? "IP 黑名单" : "开放端口设定")}</DialogTitle>
            <DialogDescription className="sr-only">{activePage?.description ?? "管理服务器的防火墙规则，控制端口的开放范围，保障服务器安全。"}</DialogDescription>
            <DialogClose className="gport-header-close" aria-label="关闭机器设定"><X size={21} /></DialogClose>
          </header>
        <div className="gport-settings-stage">
        <div className="gport-content" hidden={activeSetting !== "ports"}>
          <section className="gport-security-banner" aria-label="端口访问设定">
            <span className="gport-banner-shield"><ShieldCheck size={34} /></span>
            <div><h3>按需开放端口，让服务器连接更安全</h3><p>配置 {machineName} 的端口、协议和访问来源，按需启用规则，减少不必要的公网暴露。</p></div>
          </section>
          <div className="gport-toolbar"><div role="tablist" aria-label="端口设置内容" className="gport-tabs">{["端口规则", "安全建议"].map(value => <button key={value} type="button" role="tab" aria-selected={tab === value} aria-controls={`gport-panel-${value}`} id={`gport-tab-${value}`} onClick={() => setTab(value)} onKeyDown={event => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = value === "端口规则" ? "安全建议" : "端口规则"; setTab(event.key === "Home" ? "端口规则" : event.key === "End" ? "安全建议" : next); document.getElementById(`gport-tab-${event.key === "Home" ? "端口规则" : event.key === "End" ? "安全建议" : next}`)?.focus(); } }} tabIndex={tab === value ? 0 : -1}>{value}</button>)}</div></div>
          <div role="tabpanel" id="gport-panel-端口规则" aria-labelledby="gport-tab-端口规则" hidden={tab !== "端口规则"}>
            <div className="gport-filters"><label className="gport-search"><Search size={21} /><input aria-label="搜索端口规则" placeholder="搜索端口、协议、说明（如：25565、TCP、Minecraft）" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label><SelectField label="筛选协议" value={protocol} onChange={value => { setProtocol(value); setPage(1); }} options={["全部协议", "TCP", "UDP"]} /><SelectField label="筛选状态" value={status} onChange={value => { setStatus(value); setPage(1); }} options={["全部状态", "已启用", "已停用"]} /><div className="gport-actions"><button type="button" className="gport-button primary gport-add-rule" onClick={() => { setError(""); setEditor({ draft: { ...defaultPortDraft, tags: [...(defaultPortDraft.tags ?? [])] } }); }}><Plus size={18} />新增端口</button><DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="gport-button muted">批量操作<ChevronDown size={15} /></button></DropdownMenuTrigger><DropdownMenuContent className="cloud-popover gport-menu" align="end"><DropdownMenuItem disabled={!selected.length} onSelect={() => toggle(selected, true)}>批量启用</DropdownMenuItem><DropdownMenuItem disabled={!selected.length} onSelect={() => toggle(selected, false)}>批量禁用</DropdownMenuItem><DropdownMenuItem disabled={!selected.length} variant="destructive" onSelect={() => setDeleteIds(selected)}>批量删除</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></div>
            <div className="gport-table-scroll"><table className="gport-table"><colgroup>{[5, 10, 10, 10, 15, 25, 10, 15].map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}</colgroup><thead><tr><th><input ref={selectAllRef} type="checkbox" aria-label="选择当前页所有端口规则" checked={allSelected} disabled={!visible.length} onChange={event => setSelected(previous => event.target.checked ? [...new Set([...previous, ...visible.map(rule => rule.id)])] : previous.filter(id => !visible.some(rule => rule.id === id)))} /></th><th>协议</th><th>容器端口</th><th>网络端口</th><th>来源 IP / CIDR</th><th>说明</th><th>状态</th><th>操作</th></tr></thead><tbody>{visible.map(rule => <tr key={rule.id} className={selected.includes(rule.id) ? "selected" : ""}><td><input type="checkbox" aria-label={`选择端口 ${rule.range} ${rule.protocol}`} checked={selected.includes(rule.id)} onChange={event => setSelected(previous => event.target.checked ? [...previous, rule.id] : previous.filter(id => id !== rule.id))} /></td><td><Badge tone={rule.protocol === "UDP" ? "purple" : "blue"} dot={false}>{rule.protocol}</Badge></td><td>{rule.range}</td><td>{rule.networkRange ?? rule.range}</td><td className="gport-source">{rule.source}</td><td><strong>{rule.title}</strong><small>{rule.description}</small>{rule.action === "拒绝" && <span className="gport-badge red">拒绝</span>}</td><td><Badge tone={rule.enabled ? "green" : "gray"}>{rule.enabled ? "已启用" : "已停用"}</Badge></td><td><div className="gport-row-actions"><button aria-label={`编辑端口 ${rule.range} ${rule.protocol}`} onClick={() => { setError(""); setEditor({ id: rule.id, draft: { ...rule } }); }}>编辑</button><button aria-label={`${rule.enabled ? "禁用" : "启用"}端口 ${rule.range} ${rule.protocol}`} onClick={() => toggle([rule.id], !rule.enabled)}>{rule.enabled ? "禁用" : "启用"}</button><button className="gport-delete" aria-label={`删除端口 ${rule.range} ${rule.protocol}`} onClick={() => setDeleteIds([rule.id])}>删除</button></div></td></tr>)}{!visible.length && <tr><td colSpan={8} className="gport-empty">没有匹配的端口规则</td></tr>}</tbody></table></div>
            <footer className="gport-pagination"><span>共 {rules.length} 条规则，已启用 {enabledCount} 条，已停用 {rules.length - enabledCount} 条{filtered.length !== rules.length && ` · 筛选后 ${filtered.length} 条`}</span><nav aria-label="端口规则分页"><button className="gport-page" aria-label="上一页" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).filter(value => value === 1 || value === totalPages || Math.abs(value - currentPage) < 2).map((value, index, pages) => <span className="gport-page-group" key={value}>{index > 0 && value - pages[index - 1] > 1 && <span>…</span>}<button className={`gport-page ${currentPage === value ? "active" : ""}`} aria-label={`第 ${value} 页`} aria-current={currentPage === value ? "page" : undefined} onClick={() => setPage(value)}>{value}</button></span>)}<button className="gport-page" aria-label="下一页" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button></nav></footer>
          </div>
          <div role="tabpanel" className="gport-advice" id="gport-panel-安全建议" aria-labelledby="gport-tab-安全建议" hidden={tab !== "安全建议"}><h3><ShieldCheck size={23} />服务器端口安全建议</h3><p>优先开放游戏所需端口，将管理端口的来源限制为可信 IP。</p>{rules.filter(isExposedManagementPort).map(rule => <div className="gport-risk-note" key={rule.id}><AlertTriangle size={22} /><div><strong>{rule.title} · {rule.protocol} {rule.range}</strong><p>当前对所有 IPv4 地址开放，建议编辑规则并设置来源 IP 白名单。</p></div><button className="gport-button" onClick={() => { setError(""); setEditor({ id: rule.id, draft: { ...rule } }); }}>编辑规则</button></div>)}{!riskCount && <p className="gport-advice-success"><ShieldCheck size={22} />当前未发现对公网开放的高风险管理端口。</p>}<ul>{recommendations.map(text => <li key={text}>{text}</li>)}</ul></div>
        </div>
        <div className="gport-content gport-settings-page" hidden={activeSetting !== "blacklist"}><GameServerIpBlacklist entries={blacklist} onEntriesChange={setBlacklist} onNotice={onNotice} /></div>
        {activePage && <div className="gport-content gport-settings-page"><div className="gsm-workspace gport-machine-panel">{activePage.content}</div></div>}
        <GameServerPortRuleDrawer container={editorContainer} editor={editor} error={error} templates={templates} onDraftChange={draft => { setError(""); setEditor(previous => previous ? { ...previous, draft } : null); }} onClose={() => setEditor(null)} onSave={saveRule} />
        </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={deleteIds.length > 0} onOpenChange={value => { if (!value) setDeleteIds([]); }}><DialogContent className="cloud-modal gport-form-dialog"><DialogTitle>删除端口规则</DialogTitle><DialogDescription>确认删除所选的 {deleteIds.length} 条规则？当前操作仅影响演示页面。</DialogDescription><footer><button className="gport-button muted" onClick={() => setDeleteIds([])}>取消</button><button className="gport-button danger" onClick={() => { update(rules.filter(rule => !deleteIds.includes(rule.id)), `已删除 ${deleteIds.length} 条端口规则`); setSelected(previous => previous.filter(id => !deleteIds.includes(id))); setDeleteIds([]); }}>确认删除</button></footer></DialogContent></Dialog>
  </>;
}
