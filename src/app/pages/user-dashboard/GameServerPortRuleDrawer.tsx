import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, Folder, Gamepad2, Info, Plus, ShieldCheck, Terminal, X, XCircle } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogClose, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import type { PortRuleDraft } from "./gameServerPortRules";

export const defaultPortDraft: PortRuleDraft = { protocol: "TCP", range: "25565", networkRange: "25565", source: "0.0.0.0/0", title: "Minecraft Java 版", description: "Minecraft Java 版服务器端口", enabled: true, risk: "低风险", action: "允许", priority: 100, tags: ["游戏服务", "生产环境"] };
const services = [
  { name: "Minecraft Java", title: "Minecraft Java 版", port: "25565", protocol: "TCP" },
  { name: "Minecraft 基岩版", title: "Minecraft 基岩版", port: "19132", protocol: "UDP" },
  { name: "SSH", title: "SSH", port: "22", protocol: "TCP" },
  { name: "SFTP", title: "SFTP", port: "22", protocol: "TCP" },
  { name: "RCON", title: "RCON", port: "25575", protocol: "TCP" },
] as const;

export function GameServerPortRuleDrawer({ container, editor, error, templates, onDraftChange, onClose, onSave }: {
  container: HTMLDivElement | null;
  editor: { id?: string; draft: PortRuleDraft } | null; error: string; templates: PortRuleDraft[];
  onDraftChange: (draft: PortRuleDraft) => void; onClose: () => void; onSave: (template: boolean) => void;
}) {
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => { if (editor) { setWarningDismissed(false); setAddingTag(false); setTagInput(""); } }, [editor?.id, editor !== null]);
  useEffect(() => { if (error) errorRef.current?.scrollIntoView({ block: "nearest" }); }, [error]);
  const draft = editor?.draft;
  const change = (patch: Partial<PortRuleDraft>) => { if (draft) onDraftChange({ ...draft, ...patch }); };
  const addTag = () => { if (draft && tagInput.trim()) change({ tags: [...new Set([...(draft.tags ?? []), tagInput.trim()])] }); setTagInput(""); setAddingTag(false); };
  return <Dialog open={editor !== null} onOpenChange={open => { if (!open) { onClose(); setWarningDismissed(false); setAddingTag(false); } }}>
    {container && <DialogPrimitive.Portal container={container}>
    <DialogPrimitive.Overlay className="gport-drawer-overlay" />
    <DialogPrimitive.Content className="gport-rule-drawer" onOpenAutoFocus={() => { returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }} onCloseAutoFocus={event => { event.preventDefault(); if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus(); else container.querySelector<HTMLButtonElement>(".gport-add-rule")?.focus(); }}>
      <header className="gport-drawer-header"><DialogTitle>{editor?.id ? "编辑端口规则" : "新增端口规则"}</DialogTitle><DialogDescription>配置服务器的端口访问规则，支持常用服务一键添加。</DialogDescription><DialogClose aria-label="关闭端口规则面板"><X size={20} /></DialogClose></header>
      {draft && <form className="gport-drawer-form" onSubmit={event => { event.preventDefault(); onSave(false); }}>
        <div className="gport-drawer-body">
          <section className="gport-quick-services"><h3><ShieldCheck size={17} />快捷添加常用服务</h3><div className="gport-service-grid">{services.map((service, index) => <button key={service.name} type="button" className={draft.title === service.title ? "active" : ""} onClick={() => { setWarningDismissed(false); change({ title: service.title, range: service.port, networkRange: service.port, protocol: service.protocol, description: `${service.title} 服务器端口` }); }}>{index < 2 ? <img src="/console/minecraft/grass-block.png" alt="" /> : index === 2 ? <Terminal size={26} /> : index === 3 ? <Folder size={26} /> : <Gamepad2 size={26} />}<span><strong>{service.name}</strong><small>{service.port} / {service.protocol}</small></span></button>)}</div>{templates.length > 0 && <div className="gport-saved-templates"><span>已保存模板</span>{templates.map((template, index) => <button type="button" key={index} onClick={() => onDraftChange({ ...template, tags: [...(template.tags ?? [])] })}>{template.title}</button>)}</div>}</section>
          <div className="gport-drawer-field"><label htmlFor="gport-service-name"><b>*</b>服务名称</label><div><input id="gport-service-name" value={draft.title} onChange={event => change({ title: event.target.value })} /><small>为该规则设置一个易于识别的名称</small></div></div>
          <div className="gport-drawer-field"><label htmlFor="gport-container-port"><b>*</b>容器端口</label><div><div className="gport-port-input"><input id="gport-container-port" value={draft.range} placeholder="25565" onChange={event => change({ range: event.target.value })} /><select aria-label="端口类型" value={draft.range.includes("-") ? "端口范围" : "单个端口"} onChange={event => change({ range: event.target.value === "端口范围" ? `${draft.range.split("-")[0]}-${draft.range.split("-")[0]}` : draft.range.split("-")[0] })}><option>单个端口</option><option>端口范围</option></select></div><small>支持单个端口（如 25565）或范围（如 25560–25570）</small></div></div>
          <div className="gport-drawer-field"><label htmlFor="gport-network-port"><b>*</b>网络端口</label><div><input id="gport-network-port" value={draft.networkRange ?? draft.range} placeholder="25565" onChange={event => change({ networkRange: event.target.value })} /><small>对外访问端口，范围数量须与容器端口一致</small></div></div>
          <div className="gport-drawer-field"><span className="gport-field-label"><b>*</b>协议</span><div role="group" aria-label="端口协议" className="gport-choice-row">{(["TCP", "UDP", "TCP + UDP"] as const).map(value => <button key={value} type="button" aria-pressed={draft.protocol === value} className={draft.protocol === value ? "active" : ""} onClick={() => change({ protocol: value })}>{draft.protocol === value ? <CheckCircle2 size={16} /> : <ShieldCheck size={16} />}{value}</button>)}</div></div>
          <div className="gport-drawer-field"><label htmlFor="gport-source"><b>*</b>来源 IP / CIDR</label><div><div className="gport-source-input"><input id="gport-source" value={draft.source} onChange={event => { setWarningDismissed(false); change({ source: event.target.value }); }} /><Info size={16} /></div><small>支持单个 IP（如 203.0.113.10）或 CIDR（如 0.0.0.0/0）</small>{draft.source === "0.0.0.0/0" && !warningDismissed && <aside className="gport-source-warning"><Info size={16} /><div><strong>开放 0.0.0.0/0 可能带来安全风险</strong><p>这将允许所有 IP 访问该端口。建议仅在必要时开放，并考虑使用 IP 白名单或防火墙进一步限制访问。</p></div><button type="button" aria-label="关闭来源提示" onClick={() => setWarningDismissed(true)}><X size={14} /></button></aside>}</div></div>
          <div className="gport-drawer-field"><span className="gport-field-label"><b>*</b>动作</span><div><div className="gport-choice-row">{(["允许", "拒绝"] as const).map(action => <button type="button" key={action} className={`${action === "允许" ? "allow" : "deny"} ${(draft.action ?? "允许") === action ? "active" : ""}`} aria-pressed={(draft.action ?? "允许") === action} onClick={() => change({ action })}>{action === "允许" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}{action}</button>)}</div><small>允许或拒绝匹配的来源访问该端口</small></div></div>
          <div className="gport-drawer-field"><label htmlFor="gport-priority">优先级 <Info size={13} /></label><div><input id="gport-priority" type="number" min="1" max="1000" value={draft.priority ?? 100} onChange={event => change({ priority: Number(event.target.value) })} /><small>数字越小优先级越高，范围 1–1000</small></div></div>
          <div className="gport-drawer-field"><label htmlFor="gport-tag-select">关联标签</label><div><div className="gport-tag-select"><select id="gport-tag-select" value="" onChange={event => change({ tags: [...new Set([...(draft.tags ?? []), event.target.value])] })}><option value="">选择或创建标签</option>{["游戏服务", "生产环境", "管理服务", "测试环境"].map(tag => <option key={tag}>{tag}</option>)}</select><ChevronDown size={14} /></div><div className="gport-tags">{(draft.tags ?? []).map(tag => <span key={tag}>{tag}<button type="button" aria-label={`移除标签 ${tag}`} onClick={() => change({ tags: draft.tags?.filter(value => value !== tag) })}><X size={12} /></button></span>)}<button className="gport-new-tag" type="button" onClick={() => setAddingTag(true)}><Plus size={12} />新增标签</button></div>{addingTag && <div className="gport-tag-input"><input aria-label="新标签名称" value={tagInput} onChange={event => setTagInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addTag(); } }} /><button type="button" onClick={addTag}>添加</button></div>}</div></div>
          <div className="gport-drawer-field"><label htmlFor="gport-description">备注</label><div><textarea id="gport-description" maxLength={200} value={draft.description} onChange={event => change({ description: event.target.value })} /><span className="gport-note-count">{draft.description.length}/200</span></div></div>
          <div className="gport-drawer-field"><label htmlFor="gport-rule-enabled">启用状态</label><div><div className="gport-enable-row"><Switch id="gport-rule-enabled" checked={draft.enabled} onCheckedChange={enabled => change({ enabled })} aria-label="启用端口规则" /><span>{draft.enabled ? "启用" : "停用"}</span></div><small>关闭后该规则将不生效，但会保留配置</small></div></div>
          {error && <p ref={errorRef} role="alert" className="gport-form-error">{error}</p>}
        </div>
        <footer className="gport-drawer-footer"><button type="button" className="gport-button muted" onClick={onClose}>取消</button><button type="submit" className="gport-button primary">保存规则</button><button type="button" className="gport-button" onClick={() => onSave(true)}>保存并设为模板</button></footer>
      </form>}
    </DialogPrimitive.Content>
    </DialogPrimitive.Portal>}
  </Dialog>;
}
