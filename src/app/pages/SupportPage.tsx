import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  BookOpen,
  ChevronRight,
  CreditCard,
  FileText,
  LifeBuoy,
  MessageSquare,
  Search,
  Settings,
  Terminal,
} from "lucide-react";
import { supportCategories, type SupportCategory, type SupportIconKey } from "../data/supportDocs";

function getCategoryIcon(icon: SupportIconKey) {
  const className = "w-6 h-6";

  switch (icon) {
    case "settings":
      return <Settings className={className} />;
    case "terminal":
      return <Terminal className={className} />;
    case "credit-card":
      return <CreditCard className={className} />;
    case "book":
    default:
      return <BookOpen className={className} />;
  }
}

function matchesSearch(category: SupportCategory, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const haystack = [
    category.title,
    category.description,
    ...category.sections.map((section) => section.title),
    ...category.sections.flatMap((section) => section.articles.map((article) => `${article.title} ${article.summary}`)),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

export function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(
    () => supportCategories.filter((category) => matchesSearch(category, searchQuery)),
    [searchQuery],
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#030303] font-sans text-slate-200 selection:bg-cyan-500/30">
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-36 pb-10 text-center md:pt-44">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 text-3xl font-black tracking-tighter text-white md:text-5xl"
        >
          文档与
          <span className="relative inline-block">
            <span className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-20 blur-2xl"></span>
            <span className="relative bg-gradient-to-br from-blue-400 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              支援中心
            </span>
          </span>
        </motion.h1>
      </section>

      <section className="relative z-40 mx-auto mb-12 max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]/70 p-1.5 shadow-[0_16px_28px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
        >
          <div className="absolute top-0 left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50 transition-opacity group-hover:opacity-100"></div>

          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4.5 w-4.5 text-zinc-500" />
            <input
              type="text"
              placeholder="搜索关键词、分类或文章标题..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full border-none bg-transparent py-3.5 pl-12 pr-4 text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:ring-0 md:text-base"
            />
            <div className="absolute right-4 hidden rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-500 md:block">
              CTRL + K
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredCategories.map((category, index) => {
            const previewArticles = category.sections.flatMap((section) => section.articles).slice(0, 3);

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative"
              >
                <div className={`pointer-events-none absolute top-1/2 left-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 ${category.theme.glow} opacity-0 blur-[80px] transition-opacity duration-700 group-hover:opacity-10`}></div>

                <div className="relative h-full transform overflow-hidden rounded-[1.75rem] border border-white/5 bg-[#0a0a0c]/80 p-5 backdrop-blur-3xl transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-white/10">
                  <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${category.theme.line} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}></div>

                  <div className="mb-4 flex items-start gap-3.5">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/5 ${category.theme.iconBg} shadow-inner`}>
                      {getCategoryIcon(category.icon)}
                    </div>
                    <div>
                      <h3 className="mb-1.5 text-lg font-black tracking-tight text-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-400 group-hover:bg-clip-text group-hover:text-transparent md:text-xl">
                        {category.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-zinc-400 md:text-sm">{category.description}</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 border-t border-white/5 pt-4">
                    {previewArticles.map((article) => (
                      <Link
                        key={article.id}
                        to={`/support/article/${article.id}`}
                        className="group/link flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-zinc-500 transition-colors group-hover/link:text-white" />
                          <span className="text-xs font-medium text-zinc-300 transition-colors group-hover/link:text-white md:text-sm">
                            {article.title}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-600 transition-all group-hover/link:translate-x-1 group-hover/link:text-white" />
                      </Link>
                    ))}
                  </div>

                  <Link
                    to={`/support/category/${category.id}`}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white transition-colors hover:text-cyan-300 md:text-sm"
                  >
                    查看 {category.title}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="rounded-[1.75rem] border border-white/10 bg-[#0a0a0c]/80 p-7 text-center backdrop-blur-3xl">
            <h3 className="mb-3 text-xl font-black text-white">没有找到匹配内容</h3>
            <p className="text-sm text-zinc-400">试试输入游戏名、配置关键词，或者直接从分类入口继续浏览。</p>
          </div>
        )}
      </section>

      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="group relative overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-white/10 to-transparent p-px">
            <div className="absolute inset-0 rounded-[1.75rem] bg-zinc-950/80 backdrop-blur-xl"></div>
            <div className="relative z-10 flex h-full flex-col p-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-tr from-blue-600/20 to-cyan-500/20">
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="mb-3 text-lg font-black text-white md:text-xl">提交支援工单前</h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-zinc-400">
                先查看部署、配置与账单文档，通常能更快定位问题。你现在的文档页入口和分类链接都已经可以直接访问。
              </p>
              <Link
                to="/support/category/getting-started"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold text-white transition-all hover:border-blue-500/30 hover:bg-white/10"
              >
                打开入门文档
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-white/10 to-transparent p-px">
            <div className="absolute inset-0 rounded-[1.75rem] bg-zinc-950/80 backdrop-blur-xl"></div>
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-indigo-500/10 opacity-0 blur-[80px] transition-opacity duration-700 group-hover:opacity-100"></div>

            <div className="relative z-10 flex h-full flex-col p-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-tr from-indigo-600/20 to-purple-500/20">
                <LifeBuoy className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="mb-3 text-lg font-black text-white md:text-xl">继续配置或部署</h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-zinc-400">
                如果你是从导航或页脚跳过来的，现在商城与部署页也已经挂上路由，可以直接继续配置实例。
              </p>
              <Link
                to="/deploy"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
              >
                前往商城部署
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
