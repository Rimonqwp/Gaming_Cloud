import { useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import { isValidIpSource } from "./gameServerPortRules";

export type BlockedIp = { id: string; source: string; note: string; enabled: boolean };
export function GameServerIpBlacklist({ container, entries, onEntriesChange: setEntries, onNotice }: { container: HTMLDivElement | null; entries: BlockedIp[]; onEntriesChange: (entries: BlockedIp[]) => void; onNotice: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<BlockedIp | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<BlockedIp | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
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
    <Dialog open={editor !== null} onOpenChange={open => { if (!open) setEditor(null); }}>
      {container && <DialogPrimitive.Portal container={container}>
        <DialogPrimitive.Overlay className="gport-drawer-overlay" />
        <DialogPrimitive.Content className="gport-rule-drawer" onOpenAutoFocus={() => { returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }} onCloseAutoFocus={event => { event.preventDefault(); if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus(); else container.querySelector<HTMLButtonElement>(".gport-blacklist-tools button")?.focus(); }}>
          <header className="gport-drawer-header">
            <DialogTitle>{entries.some(entry => entry.id === editor?.id) ? "编辑 IP 黑名单" : "添加 IP 黑名单"}</DialogTitle>
            <DialogDescription>填写需要限制访问的 IP 地址或网段。</DialogDescription>
            <DialogClose aria-label="关闭 IP 黑名单面板"><X size={20} /></DialogClose>
          </header>
          {editor && <form className="gport-drawer-form" onSubmit={event => { event.preventDefault(); save(); }}>
            <div className="gport-drawer-body">
              <div className="gport-drawer-field"><label htmlFor="gport-blacklist-source"><b>*</b>IP 地址 / CIDR</label><div><input id="gport-blacklist-source" aria-label="黑名单 IP 地址" value={editor.source} onChange={event => setEditor({ ...editor, source: event.target.value })} placeholder="203.0.113.10 或 192.168.1.0/24" /><small>支持单个 IPv4 地址或 CIDR 网段</small></div></div>
              <div className="gport-drawer-field"><label htmlFor="gport-blacklist-note">备注</label><div><input id="gport-blacklist-note" aria-label="黑名单备注" value={editor.note} onChange={event => setEditor({ ...editor, note: event.target.value })} /></div></div>
              <div className="gport-drawer-field"><label htmlFor="gport-blacklist-enabled">启用状态</label><div><div className="gport-enable-row"><Switch id="gport-blacklist-enabled" aria-label="启用黑名单" checked={editor.enabled} onCheckedChange={enabled => setEditor({ ...editor, enabled })} /><span>{editor.enabled ? "启用" : "停用"}</span></div><small>停用后保留配置，不再限制该 IP 或网段访问</small></div></div>
              {error && <p className="gport-form-error" role="alert">{error}</p>}
            </div>
            <footer className="gport-drawer-footer"><button type="button" className="gport-button muted" onClick={() => setEditor(null)}>取消</button><button className="gport-button primary" type="submit">保存</button></footer>
          </form>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>}
    </Dialog>
    <Dialog open={deleting !== null} onOpenChange={open => { if (!open) setDeleting(null); }}><DialogContent className="cloud-modal gport-form-dialog"><DialogTitle>删除 IP 黑名单</DialogTitle><DialogDescription>确认删除 {deleting?.source}？</DialogDescription><footer><button className="gport-button muted" onClick={() => setDeleting(null)}>取消</button><button className="gport-button danger" onClick={() => { setEntries(entries.filter(entry => entry.id !== deleting?.id)); setDeleting(null); notice("IP 黑名单已删除"); }}>确认删除</button></footer></DialogContent></Dialog>
  </>;
}
