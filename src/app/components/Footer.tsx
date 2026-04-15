import { Github, MessageCircle, Twitter } from "lucide-react";
import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white pt-20 pb-10 transition-colors duration-300 dark:border-white/10 dark:bg-[#060912]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 shadow-[0_10px_30px_rgba(79,70,229,0.3)]">
                <div className="h-4 w-4 rounded-md bg-white/90"></div>
              </div>
              <div className="leading-tight">
                <div className="text-lg font-semibold text-slate-900 dark:text-white">EggCloud</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">游戏云托管</div>
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              让游戏部署更快、运维更轻、扩容更稳定。我们把高性能节点、控制面板与文档支援整合成统一体验。
            </p>
            <div className="flex gap-4">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-blue-500 hover:text-white dark:bg-white/5 dark:text-slate-400 dark:hover:bg-cyan-500">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-blue-500 hover:text-white dark:bg-white/5 dark:text-slate-400 dark:hover:bg-cyan-500">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-blue-500 hover:text-white dark:bg-white/5 dark:text-slate-400 dark:hover:bg-cyan-500">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-slate-900 dark:text-white">热门入口</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/minecraft" className="transition-colors hover:text-cyan-400">Minecraft 页面</Link></li>
              <li><Link to="/games" className="transition-colors hover:text-cyan-400">游戏目录</Link></li>
              <li><Link to="/deploy" className="transition-colors hover:text-cyan-400">商城与部署</Link></li>
              <li><Link to="/support" className="transition-colors hover:text-cyan-400">文档&支援中心</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-slate-900 dark:text-white">文档分类</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/support/category/getting-started" className="transition-colors hover:text-cyan-400">快速入门指南</Link></li>
              <li><Link to="/support/category/configuration" className="transition-colors hover:text-cyan-400">服务器配置</Link></li>
              <li><Link to="/support/category/api-webhooks" className="transition-colors hover:text-cyan-400">API 与自动化</Link></li>
              <li><Link to="/support/category/billing" className="transition-colors hover:text-cyan-400">账单与方案升级</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-slate-900 dark:text-white">支援与说明</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/support" className="transition-colors hover:text-cyan-400">帮助中心</Link></li>
              <li><Link to="/support/article/first-deploy" className="transition-colors hover:text-cyan-400">提交前自检文档</Link></li>
              <li><a href="#" className="transition-colors hover:text-cyan-400">服务条款 (TOS)</a></li>
              <li><a href="#" className="transition-colors hover:text-cyan-400">隐私政策</a></li>
              <li><a href="#" className="transition-colors hover:text-cyan-400">系统状态</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 dark:border-white/10 dark:text-slate-500 md:flex-row">
          <p>© 2026 EggCloud. All rights reserved.</p>
          <div className="flex gap-4">
            <span>支持信用卡、PayPal 与加密货币付款</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
