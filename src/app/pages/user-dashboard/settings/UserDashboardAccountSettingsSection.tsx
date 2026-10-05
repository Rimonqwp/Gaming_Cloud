import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Camera, CheckCircle2, Clock3, LockKeyhole, MapPin, Pencil, ShieldCheck, UserRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../../components/ui/dialog";
import type { DashboardUser } from "../userDashboardTypes";
import { SettingsPanel } from "./SettingsPanel";

const timeZoneOptions = [
  { value: "Asia/Shanghai", label: "北京时间 · UTC+08:00" },
  { value: "Asia/Hong_Kong", label: "香港时间 · UTC+08:00" },
  { value: "Asia/Singapore", label: "新加坡时间 · UTC+08:00" },
  { value: "Asia/Tokyo", label: "东京时间 · UTC+09:00" },
  { value: "Europe/London", label: "伦敦时间" },
  { value: "America/Los_Angeles", label: "洛杉矶时间" },
  { value: "UTC", label: "协调世界时 · UTC+00:00" },
];

const accountStatuses: Record<string, { label: string; tone: string }> = {
  active: { label: "正常", tone: "success" },
  suspended: { label: "已停用", tone: "warning" },
  banned: { label: "已封禁", tone: "danger" },
};

function getProfilePreview(user: DashboardUser) {
  return {
    name: user.name,
    phone: user.phone || "",
    region: user.region || "",
    timeZone: timeZoneOptions.find((option) => option.value === user.timeZone)?.value || "Asia/Shanghai",
  };
}

function formatAccountTime(value: string | undefined, timeZone: string) {
  if (!value) return "暂无记录";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", { timeZone, dateStyle: "medium", timeStyle: "short", hourCycle: "h23" }).format(date);
}

export function UserDashboardAccountSettingsSection({ dashboardUser }: { dashboardUser: DashboardUser }) {
  const [profile, setProfile] = useState(() => getProfilePreview(dashboardUser));
  const [draft, setDraft] = useState(profile);
  const [avatar, setAvatar] = useState("");
  const [editing, setEditing] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const next = getProfilePreview(dashboardUser);
    setProfile(next);
    setDraft(next);
  }, [dashboardUser.name, dashboardUser.phone, dashboardUser.region, dashboardUser.timeZone]);
  useEffect(() => () => { if (avatar) URL.revokeObjectURL(avatar); }, [avatar]);
  const status = accountStatuses[dashboardUser.status] || { label: dashboardUser.status || "未知", tone: "neutral" };
  const timeZoneLabel = timeZoneOptions.find((option) => option.value === profile.timeZone)?.label;

  return <>
    <SettingsPanel title="个人信息" icon={ShieldCheck} action={<button type="button" className="ec-button" onClick={() => { setDraft(profile); setEditing(true); }}><Pencil size={14} aria-hidden />编辑资料</button>}>
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
          <div className="ec-profile-name"><h3>{profile.name}</h3><span className="ec-badge">个人用户</span></div>
          <p className="ec-profile-caption">在 EggCloud，开启您的游戏世界。</p>
          <p className="ec-profile-uid"><UserRound size={14} aria-hidden /><span>账户 ID</span><span>{dashboardUser.id}</span></p>
        </div>
      </div>
      <div className="ec-profile-sections">
        <section className="ec-profile-section" aria-labelledby="settings-contact-heading">
          <h3 id="settings-contact-heading"><MapPin size={17} aria-hidden />联系与地区</h3>
          <dl className="ec-account-facts">
            <div><dt>绑定邮箱</dt><dd><span>{dashboardUser.email}</span><span className="ec-inline-status"><CheckCircle2 size={13} aria-hidden />已绑定</span></dd></div>
            <div><dt>电话</dt><dd className={profile.phone ? undefined : "ec-value-empty"}>{profile.phone || "未填写"}</dd></div>
            <div><dt>所在地区</dt><dd className={profile.region ? undefined : "ec-value-empty"}>{profile.region || "未设置"}</dd></div>
            <div><dt>网站时区</dt><dd><span>{timeZoneLabel}</span><small>{profile.timeZone}</small></dd></div>
          </dl>
        </section>
        <section className="ec-profile-section" aria-labelledby="settings-record-heading">
          <h3 id="settings-record-heading"><Clock3 size={17} aria-hidden />账户记录</h3>
          <dl className="ec-account-facts">
            <div><dt>注册时间</dt><dd>{formatAccountTime(dashboardUser.registeredAt, profile.timeZone)}</dd></div>
            <div><dt>上次登录时间</dt><dd className={dashboardUser.lastLoginAt ? undefined : "ec-value-empty"}>{formatAccountTime(dashboardUser.lastLoginAt, profile.timeZone)}</dd></div>
            <div><dt>登录方式</dt><dd><span className="ec-login-method"><LockKeyhole size={14} aria-hidden />{dashboardUser.loginMethod || "账号密码"}</span></dd></div>
            <div><dt>账号状态</dt><dd><span className={`ec-badge ec-badge-${status.tone}`}>{status.tone === "success" && <CheckCircle2 size={13} aria-hidden />}{status.label}</span></dd></div>
          </dl>
        </section>
      </div>
      <p className="ec-upload-help">头像支持 JPG、PNG，最大 5MB。</p>
      {feedback && <p className="ec-feedback" role="status">{feedback}</p>}
    </SettingsPanel>
    <SettingsPanel title="身份验证" icon={BadgeCheck} action={<span className="ec-badge ec-badge-neutral">暂未开放</span>}>
      <div className="ec-verification-banner"><span className="ec-verification-icon"><ShieldCheck size={28} aria-hidden /></span><div><h3>完善您的身份信息</h3><p>身份认证服务暂未开放，开放后可在此完成个人实名认证。</p></div></div>
      <dl className="ec-verification-facts"><div><dt>认证类型</dt><dd>个人实名认证</dd></div><div><dt>认证状态</dt><dd className="ec-muted">暂未开放</dd></div></dl>
      <div className="ec-panel-footer"><p>无需在此提交证件信息。</p><button type="button" className="ec-button" onClick={() => setVerificationOpen(true)}>了解身份认证</button></div>
    </SettingsPanel>
    <Dialog open={editing} onOpenChange={setEditing}><DialogContent className="ec-settings-dialog"><DialogTitle>编辑个人资料</DialogTitle><DialogDescription>预览显示名称、联系方式、所在地区和网站时区。邮箱与账户记录由系统管理。</DialogDescription><form onSubmit={(event) => { event.preventDefault(); setProfile({ ...draft, name: draft.name.trim(), phone: draft.phone.trim(), region: draft.region.trim() }); setEditing(false); setFeedback("资料预览已更新，本次页面内有效。"); }}>
      <div className="ec-profile-form-grid">
        <div><label htmlFor="settings-display-name">显示名称</label><input id="settings-display-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required minLength={2} maxLength={64} pattern=".*\S.*" /></div>
        <div><label htmlFor="settings-phone">电话</label><input id="settings-phone" type="tel" autoComplete="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} maxLength={32} placeholder="选填，包含国家或地区代码" /></div>
        <div><label htmlFor="settings-region">所在地区</label><input id="settings-region" value={draft.region} onChange={(event) => setDraft({ ...draft, region: event.target.value })} maxLength={64} placeholder="例如：中国 · 北京" /></div>
        <div><label htmlFor="settings-timezone">网站时区</label><select id="settings-timezone" value={draft.timeZone} onChange={(event) => setDraft({ ...draft, timeZone: event.target.value })}>{timeZoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
      </div>
      <label htmlFor="settings-email">电子邮箱</label><input id="settings-email" type="email" value={dashboardUser.email} readOnly />
      <p className="ec-muted">此处为页面内预览，尚未连接资料保存服务；时区预览仅影响本卡片的时间显示。</p>
      <div className="ec-dialog-actions"><button type="button" className="ec-button" onClick={() => setEditing(false)}>取消</button><button type="submit" className="ec-button ec-button-primary" disabled={draft.name.trim().length < 2}>保存预览</button></div>
    </form></DialogContent></Dialog>
    <Dialog open={verificationOpen} onOpenChange={setVerificationOpen}><DialogContent className="ec-settings-dialog"><DialogTitle>身份认证</DialogTitle><DialogDescription>个人实名认证服务暂未开放。开放后，这里会展示认证流程及认证结果；目前不收集或保存您的证件信息。</DialogDescription><button type="button" className="ec-button" onClick={() => setVerificationOpen(false)}>知道了</button></DialogContent></Dialog>
  </>;
}
