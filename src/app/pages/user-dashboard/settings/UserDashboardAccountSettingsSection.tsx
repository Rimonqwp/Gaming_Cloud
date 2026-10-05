import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Camera, CheckCircle2, Mail, Pencil, ShieldCheck, UserRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../../components/ui/dialog";
import type { DashboardUser } from "../userDashboardTypes";
import { SettingsPanel } from "./SettingsPanel";

export function UserDashboardAccountSettingsSection({ dashboardUser }: { dashboardUser: DashboardUser }) {
  const [name, setName] = useState(dashboardUser.name);
  const [draft, setDraft] = useState(name);
  const [avatar, setAvatar] = useState("");
  const [editing, setEditing] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => { setName(dashboardUser.name); setDraft(dashboardUser.name); }, [dashboardUser.name]);
  useEffect(() => () => { if (avatar) URL.revokeObjectURL(avatar); }, [avatar]);

  return <>
    <SettingsPanel title="个人信息" icon={ShieldCheck} action={<button type="button" className="ec-button" onClick={() => { setDraft(name); setEditing(true); }}><Pencil size={14} aria-hidden />编辑资料</button>}>
      <div className="ec-profile">
        <div className="ec-profile-avatar">
          {avatar ? <img src={avatar} alt="个人头像" /> : <span className="ec-avatar-default" role="img" aria-label="默认个人头像"><UserRound size={48} strokeWidth={1.7} aria-hidden /></span>}
          <button type="button" aria-label="更换头像" onClick={() => fileInput.current?.click()}><Camera size={17} aria-hidden /></button>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png" hidden onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 5 * 1024 * 1024) { setFeedback("请选择不超过 5MB 的 JPG 或 PNG 图片。"); return; }
            setAvatar(URL.createObjectURL(file));
            setFeedback("头像预览已更新。");
          }} />
        </div>
        <div className="ec-profile-details">
          <div className="ec-profile-name"><h3>{name}</h3><span className="ec-badge">个人用户</span></div>
          <p className="ec-profile-caption">在 EggCloud，开启您的游戏世界。</p>
          <dl className="ec-profile-facts">
            <div><dt>绑定邮箱</dt><dd><Mail size={16} aria-hidden /><span>{dashboardUser.email}</span><span className="ec-inline-status"><CheckCircle2 size={14} aria-hidden />已绑定</span></dd></div>
            <div><dt>账户 ID</dt><dd><UserRound size={16} aria-hidden /><span>{dashboardUser.id}</span></dd></div>
            <div><dt>注册时间</dt><dd>{dashboardUser.registeredAt}</dd></div>
          </dl>
        </div>
      </div>
      <p className="ec-upload-help">头像支持 JPG、PNG，最大 5MB。</p>
      {feedback && <p className="ec-feedback" role="status">{feedback}</p>}
    </SettingsPanel>
    <SettingsPanel title="身份验证" icon={BadgeCheck} action={<span className="ec-badge ec-badge-neutral">暂未开放</span>}>
      <div className="ec-verification-banner"><span className="ec-verification-icon"><ShieldCheck size={28} aria-hidden /></span><div><h3>完善您的身份信息</h3><p>身份认证服务暂未开放，开放后可在此完成个人实名认证。</p></div></div>
      <dl className="ec-verification-facts"><div><dt>认证类型</dt><dd>个人实名认证</dd></div><div><dt>认证状态</dt><dd className="ec-muted">暂未开放</dd></div></dl>
      <div className="ec-panel-footer"><p>无需在此提交证件信息。</p><button type="button" className="ec-button" onClick={() => setVerificationOpen(true)}>了解身份认证</button></div>
    </SettingsPanel>
    <Dialog open={editing} onOpenChange={setEditing}><DialogContent className="ec-settings-dialog"><DialogTitle>编辑个人资料</DialogTitle><DialogDescription>预览您的头像与显示名称。邮箱用于账户登录，暂不支持在此修改。</DialogDescription><form onSubmit={(event) => { event.preventDefault(); setName(draft.trim()); setEditing(false); setFeedback("资料预览已更新，本次页面内有效。"); }}>
      <label htmlFor="settings-display-name">显示名称</label><input id="settings-display-name" value={draft} onChange={(event) => setDraft(event.target.value)} required minLength={2} maxLength={64} pattern=".*\S.*" />
      <label htmlFor="settings-email">电子邮箱</label><input id="settings-email" type="email" value={dashboardUser.email} readOnly />
      <p className="ec-muted">此处为资料预览，尚未连接账户资料保存服务。</p>
      <div className="ec-dialog-actions"><button type="button" className="ec-button" onClick={() => setEditing(false)}>取消</button><button type="submit" className="ec-button ec-button-primary" disabled={draft.trim().length < 2}>保存预览</button></div>
    </form></DialogContent></Dialog>
    <Dialog open={verificationOpen} onOpenChange={setVerificationOpen}><DialogContent className="ec-settings-dialog"><DialogTitle>身份认证</DialogTitle><DialogDescription>个人实名认证服务暂未开放。开放后，这里会展示认证流程及认证结果；目前不收集或保存您的证件信息。</DialogDescription><button type="button" className="ec-button" onClick={() => setVerificationOpen(false)}>知道了</button></DialogContent></Dialog>
  </>;
}
