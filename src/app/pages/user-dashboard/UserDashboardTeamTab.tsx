import { useMemo, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  FileText,
  Folder,
  Headphones,
  Laptop,
  MoreVertical,
  Package,
  PieChart,
  Plus,
  Search,
  Send,
  Server,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";
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
    icon: FileText,
    description: "负责云平台核心产品的研发与技术创新",
    avatars: ["张", "李", "王"],
    extra: 20,
  },
  {
    name: "运维组",
    count: 8,
    color: "green",
    icon: Server,
    description: "负责基础设施、系统运维与稳定性保障",
    avatars: ["陈", "赵", "周"],
    extra: 4,
  },
  {
    name: "财务组",
    count: 6,
    color: "orange",
    icon: WalletCards,
    description: "负责财务管理、预算控制与成本分析",
    avatars: ["刘", "孙"],
    extra: 2,
  },
  {
    name: "客服组",
    count: 10,
    color: "purple",
    icon: Headphones,
    description: "负责客户支持、问题响应与服务体验",
    avatars: ["吴", "郑", "徐"],
    extra: 6,
  },
];

const activities = [
  { icon: UserPlus, color: "green", title: "新增成员", detail: "李明 加入了 研发组", time: "10 分钟前" },
  { icon: ShieldCheck, color: "blue", title: "修改权限", detail: "王芳 更新了 张三 的项目访问权限", time: "1 小时前" },
  { icon: Package, color: "purple", title: "创建项目", detail: "陈磊 创建了项目「数据分析平台」", time: "3 小时前" },
  { icon: Users, color: "orange", title: "加入分组", detail: "刘洋 被添加到 运维组", time: "5 小时前" },
  { icon: Settings, color: "slate", title: "更新设置", detail: "张伟 修改了 团队配额上限", time: "昨天 18:20" },
];

const avatarPalette = ["#2f8df5", "#22b57b", "#8a63e9", "#ef8b2c", "#5b6f91"];

export function UserDashboardTeamTab({ teamMembers }: UserDashboardTeamTabProps) {
  const [query, setQuery] = useState("");
  const [activeView, setActiveView] = useState<"org" | "groups">("org");
  const [selectedDepartment, setSelectedDepartment] = useState("研发部");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("普通成员");
  const [inviteNote, setInviteNote] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "研发部": true,
    "运维部": true,
    "财务部": true,
    "客服部": true,
  });

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
        <div className="cloud-team-hero-art" aria-hidden="true">
          <div className="cloud-team-hero-orb" />
          <div className="cloud-team-hero-cube" />
          <div className="cloud-team-hero-cloud" />
          <span>连接团队，<br />让云上的力量创造更多可能</span>
        </div>
      </header>

      <section className="cloud-team-stats" aria-label="团队概况">
        <StatCard icon={Users} tone="green" title="在线成员" value="12 / 28" trend="▲" detail="较昨日 +3" />
        <StatCard icon={ClipboardList} tone="blue" title="今日操作" value="156" trend="↑ +18%" detail="来自 12 位成员" />
        <StatCard icon={Clock3} tone="orange" title="待审核申请" value="3" detail="较昨日 +1" />
        <StatCard icon={PieChart} tone="blue" title="团队配额使用率" value="68%" detail="68 GB / 100 GB" progress={68} />
      </section>

      <div className="cloud-team-main-grid">
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
            <button className="cloud-team-outline-button" onClick={() => setActiveView("groups")}><Plus size={17} /> 新建部门</button>
          </div>
          {activeView === "org" ? (
            <div className="cloud-team-structure-body">
              <div className="cloud-team-tree">
                <button className="cloud-team-company" onClick={() => setExpanded((current) => ({ ...current, company: !current.company }))}>
                  <ChevronDown size={15} className={expanded.company === false ? "is-collapsed" : ""} />
                  <span className="cloud-team-company-icon"><Users size={17} /></span>
                  <strong>云翼科技（上海）有限公司</strong>
                </button>
                {expanded.company !== false && departments.map((department) => (
                  <button key={department.name} className={`cloud-team-department ${selectedDepartment === department.name ? "active" : ""}`} onClick={() => { setSelectedDepartment(department.name); setExpanded((current) => ({ ...current, [department.name]: !current[department.name] })); }}>
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

        <div className="cloud-team-side-column">
          <section className="cloud-team-panel cloud-team-invite" id="invite-member">
            <div className="cloud-team-panel-heading"><h2><Send size={23} /> 邀请新成员</h2></div>
            <form onSubmit={submitInvite}>
              <label>输入成员邮箱（如：name@company.com）<input type="email" required value={inviteEmail} onChange={(event) => { setInviteEmail(event.target.value); setInviteSent(false); }} placeholder="请输入成员邮箱" /></label>
              <label>选择成员角色<select value={inviteRole} onChange={(event) => setInviteRole(event.target.value)}><option>普通成员</option><option>管理员</option><option>只读成员</option></select></label>
              <label>添加邀请说明（可选）<textarea value={inviteNote} onChange={(event) => setInviteNote(event.target.value)} placeholder="例如：欢迎加入我们的团队！" rows={3} /></label>
              {inviteSent && <p className="cloud-team-form-success" role="status">邀请已发送给 {inviteRole}，等待对方确认。</p>}
              <button type="submit" className="cloud-team-primary-button"><Send size={16} /> 发送邀请</button>
            </form>
          </section>

          <section className="cloud-team-panel cloud-team-activity">
            <div className="cloud-team-panel-heading"><h2>最近活动</h2><button className="cloud-team-link-button">查看全部 <ChevronRight size={15} /></button></div>
            <div className="cloud-team-activity-list">{activities.map((activity) => { const Icon = activity.icon; return <div className="cloud-team-activity-row" key={activity.title}><span className={`cloud-team-activity-icon ${activity.color}`}><Icon size={18} /></span><div><strong>{activity.title}</strong><p>{activity.detail}</p></div><time>{activity.time}</time></div>; })}</div>
          </section>
        </div>
      </div>

      <section className="cloud-team-panel cloud-team-security">
        <div className="cloud-team-panel-heading"><h2>访问与安全</h2></div>
        <div className="cloud-team-security-grid">
          <SecurityCard icon={ShieldCheck} tone="green" title="双重验证" detail="为团队成员提供更高的账户安全保护" action="管理设置" badge="已启用" />
          <SecurityCard icon={Laptop} tone="blue" title="登录设备" detail="查看和管理成员的登录设备" action="查看设备" badge="3 台设备" />
          <SecurityCard icon={ClipboardList} tone="slate" title="审计日志" detail="记录团队的关键操作行为" action="查看日志" />
        </div>
      </section>
    </motion.div>
  );
}

function StatCard({ icon: Icon, tone, title, value, trend, detail, progress }: { icon: typeof Users; tone: string; title: string; value: string; trend?: string; detail: string; progress?: number }) {
  return <button className={`cloud-team-stat ${tone}`} onClick={() => undefined}><span className="cloud-team-stat-icon"><Icon size={25} /></span><span className="cloud-team-stat-content"><strong>{title}</strong><b>{value} {trend && <small className={trend.includes("+") ? "positive" : ""}>{trend}</small>}</b><em>{detail}</em>{progress !== undefined && <span className="cloud-team-progress"><i style={{ width: `${progress}%` }} /></span>}</span></button>;
}

function GroupCard({ name, count, color, icon: Icon, description, avatars, extra }: (typeof groups)[number]) {
  return <article className="cloud-team-group-card"><div className={`cloud-team-group-icon ${color}`}><Icon size={24} /></div><div className="cloud-team-group-copy"><h3>{name}</h3><p>{count} 位成员</p><div className="cloud-team-avatars">{avatars.map((avatar, index) => <span key={`${avatar}-${index}`} style={{ backgroundColor: avatarPalette[index] }}>{avatar}</span>)}<b>+{extra}</b></div></div><button className="cloud-team-card-menu" aria-label={`${name}更多操作`}><MoreVertical size={17} /></button><small>{description}</small></article>;
}

function SecurityCard({ icon: Icon, tone, title, detail, action, badge }: { icon: typeof ShieldCheck; tone: string; title: string; detail: string; action: string; badge?: string }) {
  return <article className="cloud-team-security-card"><div className={`cloud-team-security-icon ${tone}`}><Icon size={22} /></div><div className="cloud-team-security-copy"><div><h3>{title}</h3>{badge && <span className={`cloud-team-badge ${tone}`}>{badge}</span>}</div><p>{detail}</p></div><button>{action} <ChevronRight size={15} /></button></article>;
}
