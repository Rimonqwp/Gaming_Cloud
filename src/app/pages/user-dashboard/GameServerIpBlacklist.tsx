import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { isValidIpSource } from "./gameServerPortRules";

export type BlockedIp = { id: string; source: string; note: string; enabled: boolean };
export function GameServerIpBlacklist({ entries, onEntriesChange: setEntries, onNotice }: { entries: BlockedIp[]; onEntriesChange: (entries: BlockedIp[]) => void; onNotice: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<BlockedIp | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<BlockedIp | null>(null);
  const filtered = entries.filter(entry => `${entry.source} ${entry.note}`.toLowerCase().includes(query.toLowerCase()));
  const notice = (message: string) => onNotice(`${message}（演示操作）`);
  function save() {
    if (!editor) return;
    const source = editor.source.trim();
    if (!isValidIpSource(source)) { setError("请输入有效的 IPv4 地址或 CIDR，例如 203.0.113.10 或 192.168.1.0/24。"); return; }
    const key = source.includes("/") ? source : `${source}/32`;
    if (entries.some(entry => entry.id !== editor.id && (entry.source.includes("/") ? entry.source : `${entry.source}/32`) === key)) { setError("这个 IP 或网段已在黑名单中。"); return; }
    const existing = entries.some(entry => entry.id === editor.id);
    const next = { ...editor, source, note: editor.note.trim() };
    setEntries(existing ? entries.map(entry => entry.id === editor.id ? next : entry) : [...entries, next]);
    setEditor(null); notice(existing ? "IP 黑名单已更新" : "已添加 IP 黑名单");
  }
  return <>
    <div className="gport-blacklist-heading"><h3>IP 黑名单</h3><p>管理禁止访问服务器的 IP 地址或网段。</p></div>
    <div className="gport-blacklist-tools"><label className="gport-search"><Search size={19} /><input aria-label="搜索 IP 黑名单" placeholder="搜索 IP 地址、网段或备注" value={query} onChange={event => setQuery(event.target.value)} /></label><button className="gport-button primary" onClick={() => { setError(""); setEditor({ id: crypto.randomUUID(), source: "", note: "", enabled: true }); }}><Plus size={16} />添加 IP</button></div>
    <div className="gport-table-scroll"><table className="gport-table gport-blacklist-table"><thead><tr><th>IP 地址 / CIDR</th><th>备注</th><th>状态</th><th>操作</th></tr></thead><tbody>{filtered.map(entry => <tr key={entry.id}><td>{entry.source}</td><td>{entry.note || "—"}</td><td><span className={`gport-badge ${entry.enabled ? "green" : "gray"}`}>{entry.enabled ? "已启用" : "已停用"}</span></td><td><div className="gport-row-actions"><button aria-label={`编辑黑名单 ${entry.source}`} onClick={() => { setError(""); setEditor({ ...entry }); }}>编辑</button><button onClick={() => { setEntries(entries.map(value => value.id === entry.id ? { ...value, enabled: !value.enabled } : value)); notice(`已${entry.enabled ? "停用" : "启用"}黑名单`); }}>{entry.enabled ? "停用" : "启用"}</button><button className="gport-delete" aria-label={`删除黑名单 ${entry.source}`} onClick={() => setDeleting(entry)}>删除</button></div></td></tr>)}{!filtered.length && <tr><td colSpan={4} className="gport-empty">{query ? "没有匹配的 IP 黑名单" : "暂无 IP 黑名单"}</td></tr>}</tbody></table></div><div className="gport-pagination">共 {entries.length} 条黑名单</div>
    <Dialog open={editor !== null} onOpenChange={open => { if (!open) setEditor(null); }}><DialogContent className="cloud-modal gport-form-dialog"><DialogTitle>{entries.some(entry => entry.id === editor?.id) ? "编辑 IP 黑名单" : "添加 IP 黑名单"}</DialogTitle><DialogDescription>填写需要限制访问的 IP 地址或网段。</DialogDescription>{editor && <form onSubmit={event => { event.preventDefault(); save(); }}><div className="gport-form-grid"><label className="wide">IP 地址 / CIDR<input aria-label="黑名单 IP 地址" value={editor.source} onChange={event => setEditor({ ...editor, source: event.target.value })} placeholder="203.0.113.10 或 192.168.1.0/24" /></label><label className="wide">备注<input aria-label="黑名单备注" value={editor.note} onChange={event => setEditor({ ...editor, note: event.target.value })} /></label><label className="gport-form-checkbox"><input type="checkbox" checked={editor.enabled} onChange={event => setEditor({ ...editor, enabled: event.target.checked })} />启用黑名单</label></div>{error && <p className="gport-form-error" role="alert">{error}</p>}<footer><button type="button" className="gport-button muted" onClick={() => setEditor(null)}>取消</button><button className="gport-button primary" type="submit">保存</button></footer></form>}</DialogContent></Dialog>
    <Dialog open={deleting !== null} onOpenChange={open => { if (!open) setDeleting(null); }}><DialogContent className="cloud-modal gport-form-dialog"><DialogTitle>删除 IP 黑名单</DialogTitle><DialogDescription>确认删除 {deleting?.source}？</DialogDescription><footer><button className="gport-button muted" onClick={() => setDeleting(null)}>取消</button><button className="gport-button danger" onClick={() => { setEntries(entries.filter(entry => entry.id !== deleting?.id)); setDeleting(null); notice("IP 黑名单已删除"); }}>确认删除</button></footer></DialogContent></Dialog>
  </>;
}
