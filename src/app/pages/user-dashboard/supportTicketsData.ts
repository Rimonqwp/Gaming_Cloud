import type { DashboardTicket } from "./userDashboardTypes";
export type TicketMessage = {
  id: string;
  author: string;
  time: string;
  text: string;
  staff?: boolean;
  note?: boolean;
  attachments?: { name: string; size: string }[];
};
export type SupportTicket = {
  id: string;
  subject: string;
  company: string;
  city: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "high" | "medium" | "low";
  updated: string;
  created: string;
  product: string;
  instance: string;
  assignee: string;
  messages: TicketMessage[];
  activity: { time: string; actor: string; action: string }[];
  rating?: number;
};
export const statusLabels = {
  open: "待处理",
  pending: "处理中",
  resolved: "已解决",
  closed: "已完成",
};
const references: Pick<
  SupportTicket,
  "id" | "subject" | "company" | "city" | "status" | "updated"
>[] = [
  {
    id: "TK-2026-0187",
    subject: "云服务器网络异常",
    company: "杭州云创科技有限公司",
    city: "杭",
    status: "pending",
    updated: "2 小时前",
  },
  {
    id: "TK-2026-0186",
    subject: "申请增加云服务器带宽",
    company: "上海迈拓科技有限公司",
    city: "上",
    status: "open",
    updated: "4 小时前",
  },
  {
    id: "TK-2026-0185",
    subject: "数据库连接超时问题",
    company: "北京数智未来科技有限公司",
    city: "北",
    status: "resolved",
    updated: "1 天前",
  },
  {
    id: "TK-2026-0184",
    subject: "对象存储上传失败",
    company: "深圳墨云网络有限公司",
    city: "深",
    status: "pending",
    updated: "1 天前",
  },
  {
    id: "TK-2026-0183",
    subject: "域名 DNS 解析异常",
    company: "广州云湾信息技术有限公司",
    city: "广",
    status: "closed",
    updated: "2 天前",
  },
  {
    id: "TK-2026-0182",
    subject: "账户实名认证问题",
    company: "成都智联科技有限公司",
    city: "成",
    status: "closed",
    updated: "3 天前",
  },
];
const networkMessages: TicketMessage[] = [
  {
    id: "m1",
    author: "王先生",
    time: "2026-04-28 10:24",
    text: "您好，我们的云服务器（实例ID：ins-8f3e…）从今天早上开始出现网络异常，通过公网无法访问，内网也有较高的丢包率，业务受到影响，请尽快协助排查原因，谢谢！",
    attachments: [
      { name: "ping结果截图.png", size: "328 KB" },
      { name: "网络拓扑图.pdf", size: "1.2 MB" },
    ],
  },
  {
    id: "m2",
    author: "李工",
    staff: true,
    time: "2026-04-28 10:36",
    text: "您好，已收到您的反馈。我们正在排查中，初步判断可能是所在可用区的网络抖动。我们会进一步检查实例的网络配置和监控数据，预计1小时内给您回复。",
  },
  {
    id: "m3",
    author: "王先生",
    time: "2026-04-28 11:05",
    text: "好的，麻烦尽快处理，这台服务器承载了我们的核心业务。",
  },
  {
    id: "m4",
    author: "李工",
    staff: true,
    time: "2026-04-28 11:20",
    text: "我们已经定位到问题，您的服务器所在的公网网关出现异常波动，目前已完成切换并恢复网络，您可以再测试一下访问情况。如果仍有问题，请随时告知。",
  },
];
export function createSupportTickets(
  source: DashboardTicket[],
): SupportTicket[] {
  const items = [
    ...references,
    ...source.map((item) => ({ ...item, company: "我的账户", city: "我" })),
  ];
  return items.map((item, index) => ({
    ...item,
    priority:
      index === 0 ? "high" : "priority" in item ? item.priority : "medium",
    product: index === 3 ? "对象存储" : "云服务器 ECS",
    created: "2026-04-28 10:24",
    instance: index === 0 ? "ins-8f3e7d2a" : `ins-8f3e7d${index + 20}`,
    assignee: "李工",
    messages:
      index === 0
        ? networkMessages
        : [
            {
              id: `initial-${item.id}`,
              author: "客户",
              time: "2026-04-28 10:24",
              text: `您好，需要协助处理「${item.subject}」，请帮忙跟进，谢谢。`,
            },
          ],
    activity:
      index === 0
        ? [
            {
              time: "2026-04-28 11:20",
              actor: "李工",
              action: "更新工单状态：处理中",
            },
            { time: "2026-04-28 10:36", actor: "李工", action: "回复了客户" },
            { time: "2026-04-28 10:30", actor: "系统", action: "工单已受理" },
            { time: "2026-04-28 10:24", actor: "王先生", action: "提交了工单" },
          ]
        : [{ time: "2026-04-28 10:24", actor: "客户", action: "提交了工单" }],
  }));
}
