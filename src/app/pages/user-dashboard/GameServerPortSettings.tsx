import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, Circle, Plus, Search, Settings, ShieldCheck, Upload, X, type LucideIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { isExposedManagementPort, parsePortRuleImport, validatePortRule, type PortRule, type PortRuleDraft } from "./gameServerPortRules";
import "../../../styles/cloud-port-settings.css";

const blankRule: PortRuleDraft = { protocol: "TCP", range: "", source: "0.0.0.0/0", title: "", description: "", enabled: true, risk: "低风险" };
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
  const [risk, setRisk] = useState("全部风险等级");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editor, setEditor] = useState<{ id?: string; draft: PortRuleDraft } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const selectAllRef = useRef<HTMLInputElement>(null);
  const filtered = rules.filter(rule => (!query.trim() || `${rule.range} ${rule.protocol} ${rule.source} ${rule.title} ${rule.description}`.toLowerCase().includes(query.trim().toLowerCase())) && (protocol === "全部协议" || protocol === rule.protocol) && (status === "全部状态" || rule.enabled === (status === "已启用")) && (risk === "全部风险等级" || risk === rule.risk));
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
  const saveRule = () => {
    if (!editor) return;
    const draft = { ...editor.draft, range: editor.draft.range.replace(/\s/g, ""), source: editor.draft.source.trim(), title: editor.draft.title.trim(), description: editor.draft.description.trim() };
    const validation = validatePortRule(draft);
    if (validation) { setError(validation); return; }
    if (rules.some(rule => rule.id !== editor.id && rule.protocol === draft.protocol && rule.range === draft.range && rule.source === draft.source)) { setError("相同协议、端口范围和来源的规则已存在。"); return; }
    update(editor.id ? rules.map(rule => rule.id === editor.id ? { ...draft, id: editor.id! } : rule) : [...rules, { ...draft, id: crypto.randomUUID() }], editor.id ? "端口规则已更新" : "端口规则已新增");
    setEditor(null);
  };
  const importRules = () => {
    try {
      const drafts = parsePortRuleImport(importText);
      const keys = new Set(rules.map(rule => `${rule.protocol}|${rule.range}|${rule.source}`));
      const additions = drafts.map(draft => {
        const key = `${draft.protocol}|${draft.range}|${draft.source}`;
        if (keys.has(key)) throw new Error(`规则重复：${draft.protocol} ${draft.range} ${draft.source}`);
        keys.add(key); return { ...draft, id: crypto.randomUUID() };
      });
      update([...rules, ...additions], `已导入 ${additions.length} 条端口规则`); setImportOpen(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "导入失败，请检查规则格式。"); }
  };

  return <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cloud-modal gport-dialog" onCloseAutoFocus={event => { event.preventDefault(); document.querySelector<HTMLButtonElement>(".gsm-network-ports button")?.focus(); }}>
        <div className="gport-settings-layout">
          <aside className="gport-settings-sidebar">
            <div className="gport-settings-brand"><Settings size={23} /><div><strong>机器设定</strong><span>{machineName}</span></div></div>
            <nav aria-label="机器设定分页">
              {[...settingsPages.slice(0, 2), { id: "ports", title: "开放端口设定", icon: ShieldCheck }, ...settingsPages.slice(2)].map(({ id, title, icon: Icon }) => <button type="button" key={id} aria-current={activeSetting === id ? "page" : undefined} onClick={() => onSettingChange(id)}><Icon size={19} /><span>{title}</span><ChevronRight size={15} /></button>)}
            </nav>
          </aside>
          <div className="gport-settings-main">
          <header className="gport-content gport-header">
            <DialogTitle>{activePage?.title ?? "开放端口设定"}</DialogTitle>
            <DialogDescription className="sr-only">{activePage?.description ?? "管理服务器的防火墙规则，控制端口的开放范围，保障服务器安全。"}</DialogDescription>
            <DialogClose className="gport-header-close" aria-label="关闭机器设定"><X size={21} /></DialogClose>
          </header>
        <div className="gport-content" hidden={activeSetting !== "ports"}>
          <section className="gport-security-banner" aria-label="端口访问设定">
            <span className="gport-banner-shield"><ShieldCheck size={34} /></span>
            <div><h3>按需开放端口，让服务器连接更安全</h3><p>配置 {machineName} 的端口、协议和访问来源，按需启用规则，减少不必要的公网暴露。</p></div>
          </section>
          <div className="gport-toolbar"><div role="tablist" aria-label="端口设置内容" className="gport-tabs">{["端口规则", "安全建议"].map(value => <button key={value} type="button" role="tab" aria-selected={tab === value} aria-controls={`gport-panel-${value}`} id={`gport-tab-${value}`} onClick={() => setTab(value)} onKeyDown={event => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = value === "端口规则" ? "安全建议" : "端口规则"; setTab(event.key === "Home" ? "端口规则" : event.key === "End" ? "安全建议" : next); document.getElementById(`gport-tab-${event.key === "Home" ? "端口规则" : event.key === "End" ? "安全建议" : next}`)?.focus(); } }} tabIndex={tab === value ? 0 : -1}>{value}</button>)}</div><div className="gport-actions"><button type="button" className="gport-button primary" onClick={() => { setError(""); setEditor({ draft: { ...blankRule } }); }}><Plus size={18} />新增端口</button><button type="button" className="gport-button" onClick={() => { setError(""); setImportText(""); setImportOpen(true); }}><Upload size={18} />批量导入</button><DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="gport-button muted">批量操作<ChevronDown size={15} /></button></DropdownMenuTrigger><DropdownMenuContent className="cloud-popover gport-menu" align="end"><DropdownMenuItem disabled={!selected.length} onSelect={() => toggle(selected, true)}>批量启用</DropdownMenuItem><DropdownMenuItem disabled={!selected.length} onSelect={() => toggle(selected, false)}>批量禁用</DropdownMenuItem><DropdownMenuItem disabled={!selected.length} variant="destructive" onSelect={() => setDeleteIds(selected)}>批量删除</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></div>
          <div role="tabpanel" id="gport-panel-端口规则" aria-labelledby="gport-tab-端口规则" hidden={tab !== "端口规则"}>
            <div className="gport-filters"><label className="gport-search"><Search size={21} /><input aria-label="搜索端口规则" placeholder="搜索端口、协议、说明（如：25565、TCP、Minecraft）" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label><SelectField label="筛选协议" value={protocol} onChange={value => { setProtocol(value); setPage(1); }} options={["全部协议", "TCP", "UDP"]} /><SelectField label="筛选状态" value={status} onChange={value => { setStatus(value); setPage(1); }} options={["全部状态", "已启用", "已停用"]} /><SelectField label="筛选风险等级" value={risk} onChange={value => { setRisk(value); setPage(1); }} options={["全部风险等级", "低风险", "中风险", "高风险"]} /></div>
            <div className="gport-table-scroll"><table className="gport-table"><colgroup><col style={{ width: "5%" }} /><col style={{ width: "8%" }} /><col style={{ width: "13%" }} /><col style={{ width: "14%" }} /><col style={{ width: "22%" }} /><col style={{ width: "11%" }} /><col style={{ width: "12%" }} /><col style={{ width: "15%" }} /></colgroup><thead><tr><th><input ref={selectAllRef} type="checkbox" aria-label="选择当前页所有端口规则" checked={allSelected} disabled={!visible.length} onChange={event => setSelected(previous => event.target.checked ? [...new Set([...previous, ...visible.map(rule => rule.id)])] : previous.filter(id => !visible.some(rule => rule.id === id)))} /></th><th>协议</th><th>端口范围</th><th>来源 IP / CIDR</th><th>说明</th><th>状态</th><th>风险等级</th><th>操作</th></tr></thead><tbody>{visible.map(rule => <tr key={rule.id} className={selected.includes(rule.id) ? "selected" : ""}><td><input type="checkbox" aria-label={`选择端口 ${rule.range} ${rule.protocol}`} checked={selected.includes(rule.id)} onChange={event => setSelected(previous => event.target.checked ? [...previous, rule.id] : previous.filter(id => id !== rule.id))} /></td><td><Badge tone={rule.protocol === "UDP" ? "purple" : "blue"} dot={false}>{rule.protocol}</Badge></td><td>{rule.range}</td><td className="gport-source">{rule.source}</td><td><strong>{rule.title}</strong><small>{rule.description}</small></td><td><Badge tone={rule.enabled ? "green" : "gray"}>{rule.enabled ? "已启用" : "已停用"}</Badge></td><td><Badge tone={rule.risk === "高风险" ? "red" : rule.risk === "中风险" ? "orange" : "blue"}>{rule.risk}</Badge></td><td><div className="gport-row-actions"><button aria-label={`编辑端口 ${rule.range} ${rule.protocol}`} onClick={() => { setError(""); setEditor({ id: rule.id, draft: { ...rule } }); }}>编辑</button><button aria-label={`${rule.enabled ? "禁用" : "启用"}端口 ${rule.range} ${rule.protocol}`} onClick={() => toggle([rule.id], !rule.enabled)}>{rule.enabled ? "禁用" : "启用"}</button><button className="gport-delete" aria-label={`删除端口 ${rule.range} ${rule.protocol}`} onClick={() => setDeleteIds([rule.id])}>删除</button></div></td></tr>)}{!visible.length && <tr><td colSpan={8} className="gport-empty">没有匹配的端口规则</td></tr>}</tbody></table></div>
            <footer className="gport-pagination"><span>共 {rules.length} 条规则，已启用 {enabledCount} 条，已停用 {rules.length - enabledCount} 条{filtered.length !== rules.length && ` · 筛选后 ${filtered.length} 条`}</span><nav aria-label="端口规则分页"><button className="gport-page" aria-label="上一页" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).filter(value => value === 1 || value === totalPages || Math.abs(value - currentPage) < 2).map((value, index, pages) => <span className="gport-page-group" key={value}>{index > 0 && value - pages[index - 1] > 1 && <span>…</span>}<button className={`gport-page ${currentPage === value ? "active" : ""}`} aria-label={`第 ${value} 页`} aria-current={currentPage === value ? "page" : undefined} onClick={() => setPage(value)}>{value}</button></span>)}<button className="gport-page" aria-label="下一页" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button><SelectField label="每页规则数量" value={`${pageSize} 条/页`} onChange={value => { setPageSize(parseInt(value)); setPage(1); }} options={["5 条/页", "10 条/页", "20 条/页"]} /></nav></footer>
          </div>
          <div role="tabpanel" className="gport-advice" id="gport-panel-安全建议" aria-labelledby="gport-tab-安全建议" hidden={tab !== "安全建议"}><h3><ShieldCheck size={23} />服务器端口安全建议</h3><p>优先开放游戏所需端口，将管理端口的来源限制为可信 IP。</p>{rules.filter(isExposedManagementPort).map(rule => <div className="gport-risk-note" key={rule.id}><AlertTriangle size={22} /><div><strong>{rule.title} · {rule.protocol} {rule.range}</strong><p>当前对所有 IPv4 地址开放，建议编辑规则并设置来源 IP 白名单。</p></div><button className="gport-button" onClick={() => { setError(""); setEditor({ id: rule.id, draft: { ...rule } }); }}>编辑规则</button></div>)}{!riskCount && <p className="gport-advice-success"><ShieldCheck size={22} />当前未发现对公网开放的高风险管理端口。</p>}<ul>{recommendations.map(text => <li key={text}>{text}</li>)}</ul></div>
        </div>
        {activePage && <div className="gport-content gport-settings-page"><div className="gsm-workspace gport-machine-panel">{activePage.content}</div></div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={editor !== null} onOpenChange={value => { if (!value) setEditor(null); }}><DialogContent className="cloud-modal gport-form-dialog"><DialogTitle>{editor?.id ? "编辑端口规则" : "新增端口规则"}</DialogTitle><DialogDescription>规则保存在当前页面会话，不会连接真实防火墙。</DialogDescription>{editor && <form onSubmit={event => { event.preventDefault(); saveRule(); }}><div className="gport-form-grid"><label>协议<SelectField label="端口协议" value={editor.draft.protocol} options={["TCP", "UDP"]} onChange={value => setEditor({ ...editor, draft: { ...editor.draft, protocol: value as PortRule["protocol"] } })} /></label><label>端口范围<input aria-label="端口范围" value={editor.draft.range} placeholder="例如：25565 或 25565-25570" onChange={event => setEditor({ ...editor, draft: { ...editor.draft, range: event.target.value } })} /></label><label className="wide">来源 IP / CIDR<input aria-label="来源 IP / CIDR" value={editor.draft.source} onChange={event => setEditor({ ...editor, draft: { ...editor.draft, source: event.target.value } })} /></label><label className="wide">说明<input aria-label="端口说明" value={editor.draft.title} onChange={event => setEditor({ ...editor, draft: { ...editor.draft, title: event.target.value } })} /></label><label className="wide">补充说明<input aria-label="补充说明" value={editor.draft.description} onChange={event => setEditor({ ...editor, draft: { ...editor.draft, description: event.target.value } })} /></label><label>风险等级<SelectField label="端口风险等级" value={editor.draft.risk} options={["低风险", "中风险", "高风险"]} onChange={value => setEditor({ ...editor, draft: { ...editor.draft, risk: value as PortRule["risk"] } })} /></label><label className="gport-form-checkbox"><input type="checkbox" checked={editor.draft.enabled} onChange={event => setEditor({ ...editor, draft: { ...editor.draft, enabled: event.target.checked } })} />启用此规则</label></div>{error && <p role="alert" className="gport-form-error">{error}</p>}<footer><button type="button" className="gport-button muted" onClick={() => setEditor(null)}>取消</button><button type="submit" className="gport-button primary">保存规则</button></footer></form>}</DialogContent></Dialog>
    <Dialog open={importOpen} onOpenChange={setImportOpen}><DialogContent className="cloud-modal gport-form-dialog"><DialogTitle>批量导入端口规则</DialogTitle><DialogDescription>每行一条规则：协议,端口范围,来源 IP/CIDR,说明,补充说明（可选）。</DialogDescription><form onSubmit={event => { event.preventDefault(); importRules(); }}><textarea aria-label="批量端口规则" placeholder={"TCP,25566,0.0.0.0/0,备用游戏端口,玩家连接\nUDP,19133,0.0.0.0/0,备用基岩版端口"} value={importText} onChange={event => setImportText(event.target.value)} />{error && <p role="alert" className="gport-form-error">{error}</p>}<footer><button type="button" className="gport-button muted" onClick={() => setImportOpen(false)}>取消</button><button type="submit" className="gport-button primary">导入规则</button></footer></form></DialogContent></Dialog>
    <Dialog open={deleteIds.length > 0} onOpenChange={value => { if (!value) setDeleteIds([]); }}><DialogContent className="cloud-modal gport-form-dialog"><DialogTitle>删除端口规则</DialogTitle><DialogDescription>确认删除所选的 {deleteIds.length} 条规则？当前操作仅影响演示页面。</DialogDescription><footer><button className="gport-button muted" onClick={() => setDeleteIds([])}>取消</button><button className="gport-button danger" onClick={() => { update(rules.filter(rule => !deleteIds.includes(rule.id)), `已删除 ${deleteIds.length} 条端口规则`); setSelected(previous => previous.filter(id => !deleteIds.includes(id))); setDeleteIds([]); }}>确认删除</button></footer></DialogContent></Dialog>
  </>;
}
