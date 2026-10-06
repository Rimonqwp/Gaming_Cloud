import { useMemo, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Folder,
  MoreVertical,
  Plus,
  Search,
  Send,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import type { DashboardTeamMember } from "./userDashboardTypes";
import "../../../styles/cloud-team.css";

type UserDashboardTeamTabProps = {
  teamMembers: DashboardTeamMember[];
};

type Department = {
  name: string;
  count: number;
  color: "blue" | "green" | "orange" | "purple" | "slate";
  expandable?: boolean;
};

const departments: Department[] = [
  { name: "研发部", count: 24, color: "blue" },
  { name: "运维部", count: 8, color: "green" },
  { name: "财务部", count: 6, color: "blue" },
  { name: "客服部", count: 10, color: "purple" },
  { name: "产品部", count: 8, color: "slate", expandable: true },
  { name: "市场部", count: 6, color: "slate", expandable: true },
];

const groups = [
  {
    name: "研发组",
    count: 24,
    color: "blue",
    description: "负责云平台核心产品的研发与技术创新",
    asset: "development",
    avatars: [1, 2, 3],
    extra: 20,
  },
  {
    name: "运维组",
    count: 8,
    color: "green",
    description: "负责基础设施、系统运维与稳定性保障",
    asset: "operations",
    avatars: [4, 5, 6],
    extra: 4,
  },
  {
    name: "财务组",
    count: 6,
    color: "orange",
    description: "负责财务管理、预算控制与成本分析",
    asset: "finance",
    avatars: [7, 8],
    extra: 2,
  },
  {
    name: "客服组",
    count: 10,
    color: "purple",
    description: "负责客户支持、问题响应与服务体验",
    asset: "support",
    avatars: [9, 10, 11],
    extra: 6,
  },
];

const activities = [
  { color: "green", title: "新增成员", detail: "李明 加入了 研发组", time: "10 分钟前" },
  { color: "blue", title: "修改权限", detail: "王芳 更新了 张三 的项目访问权限", time: "1 小时前" },
  { color: "purple", title: "创建项目", detail: "陈磊 创建了项目「数据分析平台」", time: "3 小时前" },
  { color: "orange", title: "加入分组", detail: "刘洋 被添加到 运维组", time: "5 小时前" },
  { color: "slate", title: "更新设置", detail: "张伟 修改了 团队配额上限", time: "昨天 18:20" },
];

export function UserDashboardTeamTab(_props: UserDashboardTeamTabProps) {
  const [departmentList, setDepartmentList] = useState(departments);
  const [departmentDialog, setDepartmentDialog] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [departmentError, setDepartmentError] = useState("");
  const [query, setQuery] = useState("");
  const [activeView, setActiveView] = useState<"org" | "groups">("org");
  const [selectedDepartment, setSelectedDepartment] = useState("研发部");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("普通成员");
  const [inviteNote, setInviteNote] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [expanded, setExpanded] = useState({ company: true });

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return groups;
    return groups.filter((group) => `${group.name}${group.description}`.toLowerCase().includes(normalized));
  }, [query]);

  const submitInvite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setInviteEmail("");
    setInviteNote("");
  };

  return (
    <motion.div
      key="team"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="cloud-team-page"
    >
      <header className="cloud-team-hero">
        <div>
          <h1>组织与协作</h1>
          <p>管理团队成员、分组结构与权限，共同构建更高效的云上协作环境</p>
        </div>
        <img className="cloud-team-hero-art" src="/team/hero.png" alt="连接团队，让云上的力量创造更多可能" />
      </header>

      <section className="cloud-team-stats" aria-label="团队概况">
        <StatCard asset="members" tone="green" title="在线成员" value="12 / 28" trend="▲" detail="较昨日 +3" />
        <StatCard asset="operations" tone="blue" title="今日操作" value="156" trend="↑ +18%" detail="来自 12 位成员" />
        <StatCard asset="pending" tone="orange" title="待审核申请" value="3" detail="较昨日 +1" />
        <StatCard asset="quota" tone="blue" title="团队配额使用率" value="68%" detail="68 GB / 100 GB" progress={68} />
      </section>

      <div className="cloud-team-main-grid">
        <div className="cloud-team-primary-column">
          <section className="cloud-team-panel cloud-team-structure">
            <div className="cloud-team-panel-heading">
              <h2>团队结构</h2>
              <button className="cloud-team-icon-button" aria-label="更多团队结构操作"><MoreVertical size={18} /></button>
            </div>
            <div className="cloud-team-toolbar">
              <div className="cloud-team-tabs" role="tablist" aria-label="团队视图">
                <button className={activeView === "org" ? "active" : ""} onClick={() => setActiveView("org")} role="tab" aria-selected={activeView === "org"}>组织架构</button>
                <button className={activeView === "groups" ? "active" : ""} onClick={() => setActiveView("groups")} role="tab" aria-selected={activeView === "groups"}>分组视图</button>
              </div>
              <label className="cloud-team-search">
                <Search size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索成员或部门..." aria-label="搜索成员或部门" />
              </label>
              <button className="cloud-team-outline-button" onClick={() => { setDepartmentDialog(true); setDepartmentName(""); setDepartmentError(""); }}><Plus size={17} /> 新建部门</button>
            </div>
            {activeView === "org" ? (
              <div className="cloud-team-structure-body">
                <div className="cloud-team-tree">
                  <button className="cloud-team-company" aria-expanded={expanded.company !== false} onClick={() => setExpanded((current) => ({ ...current, company: current.company === false }))}>
                    <ChevronDown size={15} className={expanded.company === false ? "is-collapsed" : ""} />
                    <span className="cloud-team-company-icon"><img src="/team/company.png" alt="" /></span>
                    <strong>云擎科技（上海）有限公司</strong>
                  </button>
                  {expanded.company !== false && departmentList.map((department) => (
                    <button key={department.name} className={`cloud-team-department ${selectedDepartment === department.name ? "active" : ""}`} aria-pressed={selectedDepartment === department.name} onClick={() => { setSelectedDepartment(department.name);  }}>
                      {department.expandable ? <ChevronRight size={14} /> : <span className="cloud-team-tree-line" />}
                      <span className={`cloud-team-folder ${department.color}`}><Folder size={17} fill="currentColor" /></span>
                      <span>{department.name}</span>
                      <em>{department.count}</em>
                    </button>
                  ))}
                </div>
                <div className="cloud-team-group-grid">
                  {filteredGroups.map((group) => <GroupCard key={group.name} {...group} />)}
                  {filteredGroups.length === 0 && <div className="cloud-team-empty">没有找到匹配的团队分组</div>}
                </div>
              </div>
            ) : (
              <div className="cloud-team-group-grid cloud-team-groups-only">
                {filteredGroups.map((group) => <GroupCard key={group.name} {...group} />)}
              </div>
            )}
          </section>

        <section className="cloud-team-panel cloud-team-security">
          <div className="cloud-team-panel-heading"><h2>访问与安全</h2></div>
          <div className="cloud-team-security-grid">
            <SecurityCard asset="auth" tone="green" title="双重验证" detail="为团队成员提供更高的账户安全保护" action="管理设置" badge="已启用" />
            <SecurityCard asset="devices" tone="blue" title="登录设备" detail="查看和管理成员的登录设备" action="查看设备" badge="3 台设备" />
            <SecurityCard asset="audit" tone="slate" title="审计日志" detail="记录团队的关键操作行为" action="查看日志" />
          </div>
        </section>
        </div>

        <div className="cloud-team-side-column">
          <section className="cloud-team-panel cloud-team-invite" id="invite-member">
            <div className="cloud-team-panel-heading"><h2><Send size={23} /> 邀请新成员</h2></div>
            <form onSubmit={submitInvite}>
              <label className="cloud-team-email-label"><span className="sr-only">输入成员邮箱</span><input type="email" required value={inviteEmail} onChange={(event) => { setInviteEmail(event.target.value); setInviteSent(false); }} placeholder="输入成员邮箱（如：name@company.com）" /></label>
              <label>选择成员角色<select value={inviteRole} onChange={(event) => setInviteRole(event.target.value)}><option>普通成员</option><option>管理员</option><option>只读成员</option></select></label>
              <label>添加邀请说明（可选）<textarea value={inviteNote} onChange={(event) => setInviteNote(event.target.value)} placeholder="例如：欢迎加入我们的团队！" rows={2} /></label>
              {inviteSent && <p className="cloud-team-form-success" role="status">演示邀请已创建（{inviteRole}），尚未发送邮件。</p>}
              <button type="submit" className="cloud-team-primary-button"><Send size={16} /> 发送邀请</button>
            </form>
          </section>

          <section className="cloud-team-panel cloud-team-activity">
            <div className="cloud-team-panel-heading"><h2>最近活动</h2><button className="cloud-team-link-button">查看全部 <ArrowRight size={15} /></button></div>
            <div className="cloud-team-activity-list">
              {activities.map((activity, index) => (
                <div className="cloud-team-activity-row" key={activity.title}>
                  <span className={`cloud-team-activity-icon ${activity.color}`}>
                    <img src={`/team/activity-${["member", "permission", "project", "group", "settings"][index]}.png`} alt="" />
                  </span>
                  <div><strong>{activity.title}</strong><p>{activity.detail}</p></div>
                  <time>{activity.time}</time>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <Dialog open={departmentDialog} onOpenChange={setDepartmentDialog}>
        <DialogContent className="cloud-team-department-dialog">
          <DialogHeader><DialogTitle>新建部门</DialogTitle><DialogDescription>为团队添加一个部门，创建后会显示在组织架构中。</DialogDescription></DialogHeader>
          <form onSubmit={(event) => {
            event.preventDefault();
            const name = departmentName.trim();
            if (!name) return;
            if (departmentList.some((department) => department.name === name)) { setDepartmentError("已存在同名部门"); return; }
            setDepartmentList((current) => [...current, { name, count: 0, color: "blue" }]);
            setSelectedDepartment(name); setActiveView("org"); setExpanded((current) => ({ ...current, company: true })); setDepartmentDialog(false);
          }}>
            <label>部门名称<input required maxLength={30} value={departmentName} onChange={(event) => { setDepartmentName(event.target.value); setDepartmentError(""); }} placeholder="例如：设计部" /></label>
            {departmentError && <p role="alert">{departmentError}</p>}
            <button className="cloud-team-primary-button" type="submit">创建部门</button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function StatCard({ asset, tone, title, value, trend, detail, progress }: { asset: string; tone: string; title: string; value: string; trend?: string; detail: string; progress?: number }) {
  return <article className={`cloud-team-stat ${tone}`}><span className="cloud-team-stat-icon"><img src={`/team/stat-${asset}.png`} alt="" /></span><span className="cloud-team-stat-content"><strong>{title}</strong><b>{asset === "members" ? <>{value.split(" / ")[0]} <span>/ {value.split(" / ")[1]}</span></> : value} {trend && <small className={trend.includes("+") ? "positive" : ""}>{trend}</small>}</b>{progress === undefined && <em>{detail}</em>}{progress !== undefined && <span className="cloud-team-progress"><i style={{ width: `${progress}%` }} /></span>}{progress !== undefined && <em>{detail}</em>}</span></article>;
}

function GroupCard({ name, count, color, asset, description, avatars, extra }: (typeof groups)[number]) {
  return <article className="cloud-team-group-card"><div className={`cloud-team-group-icon ${color}`}><img src={`/team/group-${asset}.png`} alt="" /></div><div className="cloud-team-group-copy"><h3>{name}</h3><p>{count} 位成员</p><div className="cloud-team-avatars">{avatars.map((avatar) => <img key={avatar} src={`/team/avatar-${avatar}.png`} alt="团队成员头像" />)}<b>+{extra}</b></div></div><button className="cloud-team-card-menu" aria-label={`${name}更多操作`}><MoreVertical size={17} /></button><small>{description}</small></article>;
}

function SecurityCard({ asset, tone, title, detail, action, badge }: { asset: string; tone: string; title: string; detail: string; action: string; badge?: string }) {
  return <article className="cloud-team-security-card"><div className={`cloud-team-security-icon ${tone}`}><img src={`/team/security-${asset}.png`} alt="" /></div><div className="cloud-team-security-copy"><div><h3>{title}</h3>{badge && <span className={`cloud-team-badge ${tone}`}>{badge}</span>}</div><p>{detail}</p></div><button>{action} <ArrowRight size={15} /></button></article>;
}
