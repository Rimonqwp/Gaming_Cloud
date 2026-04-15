export type SupportIconKey = "book" | "settings" | "terminal" | "credit-card";

export type SupportArticle = {
  id: string;
  title: string;
  time: string;
  summary: string;
};

export type SupportSection = {
  title: string;
  articles: SupportArticle[];
};

export type SupportTheme = {
  glow: string;
  line: string;
  border: string;
  iconBg: string;
  text: string;
  bg: string;
  gradient: string;
};

export type SupportCategory = {
  id: string;
  title: string;
  description: string;
  icon: SupportIconKey;
  theme: SupportTheme;
  sections: SupportSection[];
};

export const supportCategories: SupportCategory[] = [
  {
    id: "getting-started",
    title: "快速入门指南",
    description: "从注册账户、选择方案到第一次部署，帮你最快把服务跑起来。",
    icon: "book",
    theme: {
      glow: "bg-cyan-500",
      line: "from-cyan-500/0 via-cyan-400 to-cyan-500/0",
      border: "border-cyan-500/30",
      iconBg: "bg-cyan-500/20 text-cyan-400",
      text: "text-cyan-400",
      bg: "bg-cyan-500/10",
      gradient: "from-cyan-500 to-blue-500",
    },
    sections: [
      {
        title: "新手第一步",
        articles: [
          {
            id: "choose-plan",
            title: "如何选择适合的服务器方案",
            time: "3 分钟阅读",
            summary: "根据玩家人数、游戏类型和预算，快速挑出合适配置。",
          },
          {
            id: "create-account",
            title: "注册账户与基础安全设置",
            time: "2 分钟阅读",
            summary: "完成账户创建、邮箱验证和基础安全设置。",
          },
          {
            id: "first-deploy",
            title: "第一次部署你的游戏服务器",
            time: "5 分钟阅读",
            summary: "从地域选择到启动实例，一次完成首台服务器部署。",
          },
        ],
      },
      {
        title: "连接与基础使用",
        articles: [
          {
            id: "connect-server",
            title: "连接你的游戏服务器",
            time: "4 分钟阅读",
            summary: "了解 IP、端口与不同游戏客户端的连接方式。",
          },
          {
            id: "basic-panel",
            title: "认识控制面板的基础功能",
            time: "6 分钟阅读",
            summary: "快速熟悉控制台中的启动、停止、重启和日志功能。",
          },
        ],
      },
    ],
  },
  {
    id: "configuration",
    title: "服务器配置",
    description: "学习如何修改参数、安装模组与插件，以及设置自动化任务。",
    icon: "settings",
    theme: {
      glow: "bg-purple-500",
      line: "from-purple-500/0 via-purple-400 to-purple-500/0",
      border: "border-purple-500/30",
      iconBg: "bg-purple-500/20 text-purple-400",
      text: "text-purple-400",
      bg: "bg-purple-500/10",
      gradient: "from-purple-500 to-pink-500",
    },
    sections: [
      {
        title: "文件与模组管理",
        articles: [
          {
            id: "pterodactyl-panel",
            title: "Pterodactyl 面板基本操作",
            time: "4 分钟阅读",
            summary: "理解文件管理、控制台、备份与网络设置。",
          },
          {
            id: "ftp-guide",
            title: "FTP / SFTP 文件上传指南",
            time: "5 分钟阅读",
            summary: "安全连接你的实例并上传存档、模组与配置文件。",
          },
          {
            id: "install-mods",
            title: "如何安装 Forge / Fabric 模组",
            time: "7 分钟阅读",
            summary: "适用于 Minecraft Java 的常见模组安装流程。",
          },
        ],
      },
      {
        title: "自动化与维护",
        articles: [
          {
            id: "schedule-restart",
            title: "设置定时重启与自动任务",
            time: "4 分钟阅读",
            summary: "通过计划任务减少卡顿并让维护流程更稳定。",
          },
        ],
      },
    ],
  },
  {
    id: "api-webhooks",
    title: "API 与自动化",
    description: "通过 REST API 管理资源、获取状态，并接入 Discord 等通知系统。",
    icon: "terminal",
    theme: {
      glow: "bg-emerald-500",
      line: "from-emerald-500/0 via-emerald-400 to-emerald-500/0",
      border: "border-emerald-500/30",
      iconBg: "bg-emerald-500/20 text-emerald-400",
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      gradient: "from-emerald-500 to-cyan-500",
    },
    sections: [
      {
        title: "API 基础",
        articles: [
          {
            id: "rest-api-auth",
            title: "REST API 认证与访问方式",
            time: "4 分钟阅读",
            summary: "生成 API Token，并以安全方式调用控制台接口。",
          },
          {
            id: "server-metrics",
            title: "获取服务器实时状态与资源数据",
            time: "5 分钟阅读",
            summary: "读取 CPU、内存、磁盘与在线状态等关键指标。",
          },
        ],
      },
      {
        title: "Webhook 联动",
        articles: [
          {
            id: "discord-webhook",
            title: "设置 Discord Webhook 通知",
            time: "3 分钟阅读",
            summary: "在开服、重启或异常时自动推送消息到频道。",
          },
        ],
      },
    ],
  },
  {
    id: "billing",
    title: "账单与方案升级",
    description: "管理订单、付款方式、升级降配与续费相关问题。",
    icon: "credit-card",
    theme: {
      glow: "bg-orange-500",
      line: "from-orange-500/0 via-orange-400 to-orange-500/0",
      border: "border-orange-500/30",
      iconBg: "bg-orange-500/20 text-orange-400",
      text: "text-orange-400",
      bg: "bg-orange-500/10",
      gradient: "from-orange-500 to-amber-500",
    },
    sections: [
      {
        title: "订单与升级",
        articles: [
          {
            id: "upgrade-plan",
            title: "如何升级或降配当前方案",
            time: "3 分钟阅读",
            summary: "了解升降配后的资源变化、费用差额与切换时机。",
          },
          {
            id: "billing-history",
            title: "查看账单与历史交易记录",
            time: "4 分钟阅读",
            summary: "快速定位订单详情、付款状态与过往记录。",
          },
        ],
      },
      {
        title: "付款方式",
        articles: [
          {
            id: "payment-methods",
            title: "支持的付款方式与结算说明",
            time: "2 分钟阅读",
            summary: "查看可用支付渠道、续费方式与账单周期说明。",
          },
        ],
      },
    ],
  },
];

export function getSupportCategory(categoryId?: string) {
  return (
    supportCategories.find((category) => category.id === categoryId) ??
    supportCategories[0]
  );
}

export function getSupportArticle(articleId?: string) {
  for (const category of supportCategories) {
    for (const section of category.sections) {
      const article = section.articles.find((item) => item.id === articleId);
      if (article) {
        return { category, section, article };
      }
    }
  }

  const fallbackCategory = supportCategories[0];
  const fallbackSection = fallbackCategory.sections[0];
  const fallbackArticle = fallbackSection.articles[0];

  return {
    category: fallbackCategory,
    section: fallbackSection,
    article: fallbackArticle,
  };
}
