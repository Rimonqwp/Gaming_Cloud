import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Cloud,
  Code2,
  Copy,
  FileText,
  Filter,
  Image,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Server,
  Smile,
  Star,
  UserRound,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../components/ui/dialog";
import type { DashboardTicket } from "./userDashboardTypes";
import {
  createSupportTickets,
  statusLabels,
  type SupportTicket,
  type TicketMessage,
} from "./supportTicketsData";
import "../../../styles/cloud-tickets.css";

function Status({ status }: { status: SupportTicket["status"] }) {
  return (
    <span className={`ticket-status ${status}`}>{statusLabels[status]}</span>
  );
}
function Avatar({
  staff = false,
  city = "杭",
}: {
  staff?: boolean;
  city?: string;
}) {
  return staff ? (
    <img
      className="ticket-avatar"
      src="/console/avatar.png"
      alt="技术支持工程师"
    />
  ) : (
    <span className="ticket-avatar city">{city}</span>
  );
}
function now() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function UserDashboardTicketsTab({
  tickets: sourceTickets,
}: {
  tickets: DashboardTicket[];
}) {
  const [tickets, setTickets] = useState(() =>
    createSupportTickets(sourceTickets),
  );
  const [selectedId, setSelectedId] = useState(tickets[0].id);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [highOnly, setHighOnly] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState<
    "new" | "close" | "transfer" | "instance" | "history" | "attachment" | null
  >(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [drafts, setDrafts] = useState<
    Record<string, { text: string; files: File[]; note: boolean }>
  >({});
  const [showExtras, setShowExtras] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const conversation = useRef<HTMLDivElement>(null);
  const ticket = tickets.find((item) => item.id === selectedId)!;
  const draft = drafts[selectedId] ?? { text: "", files: [], note: false };
  const updateDraft = (change: Partial<typeof draft>) =>
    setDrafts((previous) => ({
      ...previous,
      [selectedId]: { ...draft, ...change },
    }));
  const updateTicket = (change: Partial<SupportTicket>) =>
    setTickets((previous) =>
      previous.map((item) =>
        item.id === selectedId ? { ...item, ...change } : item,
      ),
    );
  const matchesStatus = (item: SupportTicket, id: string) =>
    id === "all" ||
    (id === "done"
      ? ["resolved", "closed"].includes(item.status)
      : item.status === id);
  const visible = tickets.filter(
    (item) =>
      matchesStatus(item, filter) &&
      (!highOnly || item.priority === "high") &&
      `${item.id} ${item.subject} ${item.company}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (ticket.messages.length > 4)
      conversation.current?.scrollTo({
        top: conversation.current.scrollHeight,
        behavior: "smooth",
      });
  }, [selectedId, ticket.messages.length]);
  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(ticket.id);
      setNotice("工单编号已复制");
    } catch {
      setNotice(`工单编号：${ticket.id}`);
    }
  };
  const sendReply = () => {
    if (
      ticket.status === "closed" ||
      (!draft.text.trim() && !draft.files.length)
    )
      return;
    const message: TicketMessage = {
      id: crypto.randomUUID(),
      author: "我",
      time: now(),
      text: draft.text.trim(),
      note: draft.note,
      attachments: draft.files.map((file) => ({
        name: file.name,
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      })),
    };
    updateTicket({
      messages: [...ticket.messages, message],
      updated: "刚刚",
      activity: [
        {
          time: message.time,
          actor: "我",
          action: draft.note ? "添加了内部备注" : "回复了工单",
        },
        ...ticket.activity,
      ],
    });
    updateDraft({ text: "", files: [] });
    setNotice(draft.note ? "内部备注已添加" : "回复已发送");
  };
  const finish = (status: SupportTicket["status"]) => {
    updateTicket({
      status,
      updated: "刚刚",
      activity: [
        {
          time: now(),
          actor: "我",
          action: `将工单标记为${statusLabels[status]}`,
        },
        ...ticket.activity,
      ],
    });
    setDialog(null);
    setNotice(`工单已${statusLabels[status]}`);
  };

  return (
    <section
      className={`ticket-workspace ${mobileDetail ? "show-detail" : ""}`}
      aria-label="工单中心"
    >
      <aside className="ticket-list-panel">
        <header className="ticket-list-heading">
          <div>
            <h1>工单中心</h1>
            <p>提交与跟踪您的问题，我们将为您提供专业的技术支持服务。</p>
          </div>
          <button className="ticket-primary" onClick={() => setDialog("new")}>
            <Plus size={16} />
            提交工单
          </button>
        </header>
        <div className="ticket-filters" aria-label="工单状态筛选">
          {[
            ["all", "全部"],
            ["open", "待处理"],
            ["pending", "处理中"],
            ["done", "已完成"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={filter === id}
              className={filter === id ? "active" : ""}
              onClick={() => setFilter(id)}
            >
              {label}
              <span>
                {tickets.filter((item) => matchesStatus(item, id)).length}
              </span>
            </button>
          ))}
        </div>
        <div className="ticket-search">
          <label>
            <Search size={17} />
            <input
              aria-label="搜索工单"
              placeholder="搜索工单编号、标题或关键词..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <button
            className={`ticket-icon-button ${highOnly ? "active" : ""}`}
            aria-label="仅显示高优先级工单"
            aria-pressed={highOnly}
            title="仅显示高优先级工单"
            onClick={() => setHighOnly(!highOnly)}
          >
            <Filter size={17} />
          </button>
        </div>
        <div className="ticket-list">
          {visible.map((item) => (
            <button
              key={item.id}
              className={`ticket-list-item ${item.id === selectedId ? "selected" : ""}`}
              aria-pressed={item.id === selectedId}
              onClick={() => {
                setSelectedId(item.id);
                setMobileDetail(true);
                setShowExtras(false);
              }}
            >
              <div className="ticket-list-top">
                <span>#{item.id}</span>
                <Status status={item.status} />
              </div>
              <div className="ticket-list-body">
                <Avatar city={item.city} />
                <div>
                  <h3>{item.subject}</h3>
                  <p>
                    <UserRound size={14} />
                    {item.company}
                  </p>
                </div>
                <time>{item.updated}</time>
              </div>
            </button>
          ))}
          {!visible.length && (
            <div className="ticket-empty">
              <Search size={28} />
              <h3>没有找到相关工单</h3>
              <p>试试其他关键词或筛选条件。</p>
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                  setHighOnly(false);
                }}
              >
                清除筛选
              </button>
            </div>
          )}
        </div>
        <div className="ticket-list-footer">
          <span className="ticket-online">
            <CircleDot size={14} />
            技术支持在线
          </span>
          <span>全天候为您服务</span>
        </div>
      </aside>
      <div className="ticket-detail-panel">
        <header className="ticket-detail-heading">
          <button
            className="ticket-mobile-back ticket-icon-button"
            aria-label="返回工单列表"
            onClick={() => setMobileDetail(false)}
          >
            <ChevronLeft size={18} />
          </button>
          <h2>
            <span>#{ticket.id}</span> {ticket.subject}
          </h2>
          <button
            className="ticket-icon-button"
            aria-label="复制工单编号"
            onClick={copyId}
          >
            <Copy size={16} />
          </button>
          <div className="ticket-heading-actions">
            <button onClick={() => setDialog("transfer")}>转接</button>
            <button
              disabled={ticket.status === "closed"}
              onClick={() => setDialog("close")}
            >
              关闭工单
            </button>
            <div className="ticket-more">
              <button
                className="ticket-icon-button"
                aria-label="更多工单操作"
                aria-expanded={showExtras}
                onClick={() => setShowExtras(!showExtras)}
              >
                <MoreHorizontal size={20} />
              </button>
              {showExtras && (
                <div className="ticket-more-menu">
                  <button
                    onClick={() => {
                      updateTicket({
                        priority:
                          ticket.priority === "high" ? "medium" : "high",
                      });
                      setShowExtras(false);
                    }}
                  >
                    设为{ticket.priority === "high" ? "普通" : "高"}优先级
                  </button>
                  <button
                    onClick={() => {
                      finish("open");
                      setShowExtras(false);
                    }}
                  >
                    重新打开工单
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="ticket-meta">
          <div>
            <small>工单状态</small>
            <Status status={ticket.status} />
          </div>
          <div>
            <small>优先级</small>
            <span
              className={`ticket-priority ${ticket.priority === "high" ? "high" : ""}`}
            >
              <AlertCircle size={13} />
              {ticket.priority === "high"
                ? "高"
                : ticket.priority === "low"
                  ? "低"
                  : "普通"}
            </span>
          </div>
          <div>
            <small>所属产品</small>
            <span>
              <Cloud size={24} className="ticket-blue" />
              {ticket.product}
            </span>
          </div>
          <div>
            <small>创建时间</small>
            <span>
              <Clock3 size={17} />
              {ticket.created}
            </span>
          </div>
          <div>
            <small>负责人</small>
            <span>
              <Avatar staff />
              <span>
                {ticket.assignee}
                <small>技术支持工程师</small>
              </span>
            </span>
          </div>
        </div>
        <div className="ticket-detail-grid">
          <div className="ticket-conversation-column">
            <section className="ticket-conversation">
              <h3>工单会话</h3>
              <div className="ticket-messages" ref={conversation}>
                {ticket.messages.map((message) => (
                  <article
                    key={message.id}
                    className={`ticket-message ${message.staff ? "staff" : ""} ${message.note ? "note" : ""}`}
                  >
                    <Avatar staff={message.staff} city={ticket.city} />
                    <div className="ticket-message-content">
                      <header>
                        <strong>{message.author}</strong>
                        <span>
                          {message.note
                            ? "内部备注 · 仅团队可见"
                            : message.staff
                              ? "技术支持工程师"
                              : ticket.company}
                        </span>
                        <time>{message.time}</time>
                      </header>
                      {message.text && (
                        <div className="ticket-bubble">{message.text}</div>
                      )}
                      {!!message.attachments?.length && (
                        <div className="ticket-attachments">
                          <small>
                            <Paperclip size={14} />
                            {message.attachments.length} 个附件
                          </small>
                          <div>
                            {message.attachments.map((file, index) => (
                              <button
                                key={`${file.name}-${index}`}
                                onClick={() => {
                                  setAttachmentName(file.name);
                                  setDialog("attachment");
                                }}
                              >
                                <span
                                  className={`ticket-file-icon ${file.name.endsWith(".pdf") ? "pdf" : ""}`}
                                >
                                  {file.name.endsWith(".png") ? (
                                    <Image size={26} />
                                  ) : (
                                    <FileText size={26} />
                                  )}
                                </span>
                                <span>
                                  {file.name}
                                  <small>{file.size}</small>
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="ticket-composer">
              <div className="ticket-reply-tabs">
                <button
                  className={!draft.note ? "active" : ""}
                  aria-pressed={!draft.note}
                  onClick={() => updateDraft({ note: false })}
                >
                  回复
                </button>
                <button
                  className={draft.note ? "active" : ""}
                  aria-pressed={draft.note}
                  onClick={() => updateDraft({ note: true })}
                >
                  内部备注（仅团队可见）
                </button>
              </div>
              <div className="ticket-editor">
                <textarea
                  aria-label={draft.note ? "内部备注内容" : "回复内容"}
                  placeholder={
                    ticket.status === "closed"
                      ? "工单已关闭，重新打开后可继续回复。"
                      : "请输入回复内容，支持粘贴图片或拖拽上传文件..."
                  }
                  value={draft.text}
                  disabled={ticket.status === "closed"}
                  onChange={(event) =>
                    updateDraft({ text: event.target.value })
                  }
                  onKeyDown={(event) => {
                    if (
                      (event.ctrlKey || event.metaKey) &&
                      event.key === "Enter"
                    )
                      sendReply();
                  }}
                  onPaste={(event) => {
                    const files = Array.from(event.clipboardData.files);
                    if (files.length)
                      updateDraft({ files: [...draft.files, ...files] });
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (ticket.status !== "closed")
                      updateDraft({
                        files: [
                          ...draft.files,
                          ...Array.from(event.dataTransfer.files),
                        ],
                      });
                  }}
                />
                <div className="ticket-draft-files">
                  {draft.files.map((file, index) => (
                    <span key={`${file.name}-${index}`}>
                      <Paperclip size={12} />
                      {file.name}
                      <button
                        aria-label={`移除附件 ${file.name}`}
                        onClick={() =>
                          updateDraft({
                            files: draft.files.filter((_, i) => i !== index),
                          })
                        }
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <footer>
                  <div className="ticket-editor-tools">
                    <button
                      disabled={ticket.status === "closed"}
                      onClick={() => fileInput.current?.click()}
                    >
                      <Paperclip size={16} />
                      添加附件
                    </button>
                    <button
                      disabled={ticket.status === "closed"}
                      onClick={() => {
                        if (fileInput.current) {
                          fileInput.current.accept = "image/*";
                          fileInput.current.click();
                        }
                      }}
                    >
                      <Image size={16} />
                      图片
                    </button>
                    <button
                      disabled={ticket.status === "closed"}
                      onClick={() =>
                        updateDraft({
                          text: `${draft.text}\n\x60\x60\x60\n\n\x60\x60\x60`,
                        })
                      }
                    >
                      <Code2 size={17} />
                      代码
                    </button>
                    <button
                      disabled={ticket.status === "closed"}
                      onClick={() => updateDraft({ text: `${draft.text} 😊` })}
                    >
                      <Smile size={16} />
                      表情
                    </button>
                  </div>
                  <div className="ticket-send-actions">
                    <button
                      disabled={["closed", "resolved"].includes(ticket.status)}
                      onClick={() => finish("resolved")}
                    >
                      标记已解决
                    </button>
                    <button
                      className="ticket-primary"
                      disabled={
                        ticket.status === "closed" ||
                        (!draft.text.trim() && !draft.files.length)
                      }
                      onClick={sendReply}
                    >
                      {draft.note ? "添加备注" : "发送回复"}
                    </button>
                  </div>
                </footer>
              </div>
              <input
                ref={fileInput}
                type="file"
                multiple
                hidden
                onChange={(event) => {
                  updateDraft({
                    files: [
                      ...draft.files,
                      ...Array.from(event.target.files ?? []),
                    ],
                  });
                  event.target.value = "";
                  event.target.accept = "";
                }}
              />
            </section>
          </div>
          <aside className="ticket-context-column">
            <section className="ticket-context-card">
              <header>
                <h3>处理进度</h3>
                <button onClick={() => setDialog("history")}>
                  查看全部
                  <ChevronRight size={14} />
                </button>
              </header>
              <ol className="ticket-timeline">
                {["已提交", "已受理", "处理中", "等待客户回复", "已解决"].map(
                  (label, index) => {
                    const stage = ["resolved", "closed"].includes(ticket.status)
                      ? 4
                      : ticket.status === "open"
                        ? 0
                        : 2;
                    return (
                      <li
                        key={label}
                        className={index <= stage ? "complete" : ""}
                      >
                        <span>
                          {index < stage || (index === 4 && stage === 4) ? (
                            <Check size={12} />
                          ) : (
                            <CircleDot size={13} />
                          )}
                        </span>
                        <div>
                          <strong>{label}</strong>
                          <p>
                            {index <= stage
                              ? index === 0
                                ? ticket.created
                                : (ticket.activity.find((item) =>
                                    (index === 1
                                      ? /受理/
                                      : index === 4
                                        ? /已解决|已完成/
                                        : /回复|处理中/
                                    ).test(item.action),
                                  )?.time ?? ticket.created)
                              : index === 3
                                ? "预计在客户回复后继续处理"
                                : ""}
                            <small>
                              {index <= stage
                                ? [
                                    "客户提交工单",
                                    "系统自动受理",
                                    "技术支持处理中",
                                    "等待客户确认",
                                    "问题已解决",
                                  ][index]
                                : ""}
                            </small>
                          </p>
                        </div>
                      </li>
                    );
                  },
                )}
              </ol>
            </section>
            <section className="ticket-context-card">
              <header>
                <h3>关联实例</h3>
                <button
                  disabled={!ticket.instance}
                  onClick={() => setDialog("instance")}
                >
                  查看详情
                  <ChevronRight size={14} />
                </button>
              </header>
              {ticket.instance ? (
                <button
                  className="ticket-instance"
                  onClick={() => setDialog("instance")}
                >
                  <div>
                    <span className="ticket-server-icon">
                      <Server size={22} />
                    </span>
                    <span>
                      <strong>{ticket.instance}</strong>
                      <small>{ticket.product}（华东1·杭州）</small>
                    </span>
                    <span className="ticket-status running">运行中</span>
                  </div>
                  <p>2 vCPU ｜ 4 GB ｜ 公网 IP：xxx.xxx.12.34</p>
                </button>
              ) : (
                <p className="ticket-no-instance">此工单尚未关联实例</p>
              )}
            </section>
            <section className="ticket-context-card">
              <header>
                <h3>最近操作记录</h3>
                <button onClick={() => setDialog("history")}>
                  查看更多
                  <ChevronRight size={14} />
                </button>
              </header>
              <ul className="ticket-activity">
                {ticket.activity.slice(0, 4).map((item, index) => (
                  <li key={`${item.time}-${index}`}>
                    <p>
                      {item.time}
                      <span>{item.actor}</span>
                    </p>
                    <small>{item.action}</small>
                  </li>
                ))}
              </ul>
            </section>
            <section className="ticket-context-card ticket-rating">
              <header>
                <h3>满意度评价</h3>
                <span className="ticket-status open">
                  {ticket.rating ? "已评价" : "待评价"}
                </span>
              </header>
              <p>您的问题是否已得到解决？</p>
              <div aria-label="满意度评分">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    aria-label={`${value} 星评价`}
                    aria-pressed={ticket.rating === value}
                    onClick={() => {
                      updateTicket({ rating: value });
                      setNotice(`感谢您的 ${value} 星评价`);
                    }}
                  >
                    <Star
                      size={23}
                      fill={
                        (ticket.rating ?? 0) >= value ? "#ffbd45" : "#f4f5f7"
                      }
                      color={
                        (ticket.rating ?? 0) >= value ? "#ffbd45" : "#cbd0d8"
                      }
                    />
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
      {notice && (
        <div className="ticket-notice" role="status">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <DialogContent className="cloud-modal ticket-dialog">
          <DialogTitle>
            {
              {
                new: "提交新工单",
                close: "关闭工单",
                transfer: "转接工单",
                instance: "关联实例详情",
                history: "工单处理记录",
                attachment: "附件信息",
              }[dialog ?? "new"]
            }
          </DialogTitle>
          <DialogDescription>
            {dialog === "new"
              ? "请描述您遇到的问题，技术支持团队将尽快协助您。"
              : `#${ticket.id} · ${ticket.subject}`}
          </DialogDescription>
          {dialog === "new" && (
            <form
              className="ticket-form"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                const title = String(data.get("subject") ?? "").trim();
                const text = String(data.get("description") ?? "").trim();
                if (!title || !text) return;
                const created = now();
                const newTicket: SupportTicket = {
                  ...ticket,
                  id: `TK-${Date.now()}`,
                  subject: title,
                  company: "我的账户",
                  city: "我",
                  status: "open",
                  priority: data.get("priority") as SupportTicket["priority"],
                  product: String(data.get("product")),
                  instance: "",
                  created,
                  updated: "刚刚",
                  assignee: "待分配",
                  rating: undefined,
                  messages: [
                    {
                      id: crypto.randomUUID(),
                      author: "我",
                      time: created,
                      text,
                    },
                  ],
                  activity: [
                    { time: created, actor: "我", action: "提交了工单" },
                  ],
                };
                setTickets((previous) => [newTicket, ...previous]);
                setSelectedId(newTicket.id);
                setFilter("all");
                setSearch("");
                setHighOnly(false);
                setMobileDetail(true);
                setDialog(null);
                setNotice("工单已提交");
              }}
            >
              <label>
                工单标题
                <input
                  name="subject"
                  required
                  maxLength={80}
                  placeholder="简要描述您遇到的问题"
                />
              </label>
              <div>
                <label>
                  所属产品
                  <select name="product">
                    <option>云服务器 ECS</option>
                    <option>游戏服务器</option>
                    <option>对象存储</option>
                    <option>账户与账单</option>
                  </select>
                </label>
                <label>
                  优先级
                  <select name="priority" defaultValue="medium">
                    <option value="low">低</option>
                    <option value="medium">普通</option>
                    <option value="high">高</option>
                  </select>
                </label>
              </div>
              <label>
                问题描述
                <textarea
                  name="description"
                  required
                  rows={5}
                  placeholder="请提供问题现象、发生时间及相关实例信息"
                />
              </label>
              <button className="ticket-primary" type="submit">
                提交工单
              </button>
            </form>
          )}
          {dialog === "close" && (
            <>
              <p>关闭后将停止接收回复。您可以通过“更多工单操作”重新打开。</p>
              <button
                className="ticket-primary"
                onClick={() => finish("closed")}
              >
                确认关闭
              </button>
            </>
          )}
          {dialog === "transfer" && (
            <form
              className="ticket-form"
              onSubmit={(event) => {
                event.preventDefault();
                const assignee = String(
                  new FormData(event.currentTarget).get("assignee"),
                );
                updateTicket({
                  assignee,
                  activity: [
                    { time: now(), actor: "我", action: `转接给 ${assignee}` },
                    ...ticket.activity,
                  ],
                });
                setDialog(null);
                setNotice(`工单已转接给 ${assignee}`);
              }}
            >
              <label>
                转接至
                <select name="assignee">
                  <option>李工</option>
                  <option>陈工</option>
                  <option>网络支持团队</option>
                </select>
              </label>
              <button className="ticket-primary">确认转接</button>
            </form>
          )}
          {dialog === "instance" && (
            <dl className="ticket-instance-detail">
              <dt>实例编号</dt>
              <dd>{ticket.instance}</dd>
              <dt>运行状态</dt>
              <dd>运行中</dd>
              <dt>产品</dt>
              <dd>{ticket.product}</dd>
              <dt>地域</dt>
              <dd>华东 1 · 杭州</dd>
              <dt>配置</dt>
              <dd>2 vCPU / 4 GB / 40 GB SSD</dd>
            </dl>
          )}
          {dialog === "history" && (
            <ul className="ticket-activity">
              {ticket.activity.map((item, index) => (
                <li key={index}>
                  <p>
                    {item.time}
                    <span>{item.actor}</span>
                  </p>
                  <small>{item.action}</small>
                </li>
              ))}
            </ul>
          )}
          {dialog === "attachment" && (
            <>
              <p>
                <Paperclip size={18} /> {attachmentName}
              </p>
              <p>
                当前为页面演示，附件仅展示文件信息；文件上传与下载将在接入工单服务后启用。
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
