import { useState } from "react";
import { motion } from "motion/react";
import { Link, useParams } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  FileText,
  Share2,
  TerminalSquare,
} from "lucide-react";
import { getSupportArticle } from "../data/supportDocs";

export function DocArticlePage() {
  const { articleId } = useParams();
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(null);

  const { category, article } = getSupportArticle(articleId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`Article: ${article.id}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] font-sans text-slate-200 selection:bg-cyan-500/30 pb-32">
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-16 px-6 pt-32 lg:flex-row">
        <div className="lg:w-3/4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 border-b border-white/10 pb-10"
          >
            <div className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium">
              <Link to="/support" className="flex items-center gap-1 text-zinc-500 transition-colors hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                支援中心
              </Link>
              <span className="text-zinc-700">/</span>
              <Link to={`/support/category/${category.id}`} className={`${category.theme.text} transition-colors hover:text-white`}>
                {category.title}
              </Link>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-300">当前文章</span>
            </div>

            <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
              {article.title}
            </h1>

            <div className="flex items-center gap-6 text-sm font-medium text-zinc-500">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-400" />
                {article.time}
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-400" />
                最后更新 2026-04-09
              </div>
              <button className="ml-auto flex items-center gap-2 text-zinc-400 transition-colors hover:text-white">
                <Share2 className="h-4 w-4" />
                分享文章
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:text-white prose-p:leading-relaxed prose-p:text-zinc-400 prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-strong:text-zinc-200"
          >
            <h2 id="intro" className="mt-12 mb-6 flex scroll-mt-32 items-center gap-3 text-2xl font-bold">
              <span className={`h-6 w-1.5 rounded-full bg-gradient-to-b ${category.theme.gradient}`}></span>
              概览
            </h2>
            <p>{article.summary}</p>
            <p>
              这篇文档现在已经挂在真正的文章路由下，来自 <strong>{category.title}</strong> 分类。你可以继续从分类页返回，也可以通过页脚和导航中的入口再次访问。
            </p>

            <div className="relative my-8 overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-900/10 p-6 backdrop-blur-md">
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
              <div className="flex items-start gap-4">
                <AlertCircle className="mt-1 h-6 w-6 shrink-0 text-blue-400" />
                <div>
                  <h4 className="mt-0 mb-2 text-lg font-bold text-blue-300">提示</h4>
                  <p className="mb-0 text-sm text-blue-100/70">
                    如果你是从旧链接或占位链接进入这里，当前链路已经改成稳定的 `articleId` 形式，不会再因为标题里的空格或斜杠导致跳转异常。
                  </p>
                </div>
              </div>
            </div>

            <h2 id="step-1" className="mt-12 mb-6 flex scroll-mt-32 items-center gap-3 text-2xl font-bold">
              <span className={`h-6 w-1.5 rounded-full bg-gradient-to-b ${category.theme.gradient}`}></span>
              推荐操作流程
            </h2>
            <p>
              先从分类页确认你当前要解决的问题，再进入对应文章。对于部署与配置类问题，建议同时保留控制台、日志和本文档对照查看，这样排查速度会更快。
            </p>

            <div className="group/code relative my-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c]/90 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 bg-black/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <TerminalSquare className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs font-mono text-zinc-400">article-route.example</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? <span className="text-emerald-400">已复制</span> : "复制 ID"}
                </button>
              </div>
              <pre className="m-0 overflow-x-auto bg-transparent p-5 text-sm">
                <code className="font-mono text-cyan-300">
                  {`/support/article/${article.id}`}
                </code>
              </pre>
            </div>

            <h2 id="step-2" className="mt-12 mb-6 flex scroll-mt-32 items-center gap-3 text-2xl font-bold">
              <span className={`h-6 w-1.5 rounded-full bg-gradient-to-b ${category.theme.gradient}`}></span>
              下一步
            </h2>
            <p>
              如果当前文章还不能完全解决问题，可以返回分类页继续查看相关条目；如果你已经确认需要进一步操作，也可以直接前往部署页或支援中心继续处理。
            </p>

            <div className="relative my-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 text-center">
              <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-xl"></div>
              <div className="relative z-10">
                <h4 className="mb-2 text-xl font-bold text-white">这篇文档有帮助吗？</h4>
                <p className="mb-6 text-sm text-zinc-500">你的反馈可以帮助我们继续整理文档结构和链接体验。</p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setFeedbackGiven("up")}
                    className={`rounded-xl border px-6 py-2.5 font-bold transition-all ${
                      feedbackGiven === "up"
                        ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    能解决问题
                  </button>
                  <button
                    onClick={() => setFeedbackGiven("down")}
                    className={`rounded-xl border px-6 py-2.5 font-bold transition-all ${
                      feedbackGiven === "down"
                        ? "border-red-500/50 bg-red-500/20 text-red-400"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    还不够清楚
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="hidden lg:block lg:w-1/4">
          <div className="sticky top-32">
            <h4 className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white">
              <span className={`h-2 w-2 rounded-full bg-gradient-to-tr ${category.theme.gradient}`}></span>
              本页目录
            </h4>

            <div className="ml-1 flex flex-col gap-1 border-l border-white/10 pl-4">
              {[
                { id: "intro", title: "概览" },
                { id: "step-1", title: "推荐操作流程" },
                { id: "step-2", title: "下一步" },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="group flex items-center justify-between py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-200"
                >
                  {item.title}
                  <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-white/10 bg-[#0a0a0c]/80 p-6 shadow-xl backdrop-blur-2xl">
              <h4 className="mb-2 text-sm font-bold text-white">继续浏览</h4>
              <p className="mb-4 text-xs leading-relaxed text-zinc-400">
                你可以返回上一级分类继续看相关文章，或者回到支援中心重新搜索。
              </p>
              <Link
                to={`/support/category/${category.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-white transition-all hover:border-cyan-500/50 hover:bg-white/10"
              >
                返回分类页
                <ArrowLeft className="h-3 w-3 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
