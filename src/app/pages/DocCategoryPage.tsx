import { motion } from "motion/react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Search,
  Settings,
  Terminal,
} from "lucide-react";
import { getSupportCategory, type SupportIconKey } from "../data/supportDocs";

function getCategoryIcon(icon: SupportIconKey) {
  const className = "w-8 h-8";

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

export function DocCategoryPage() {
  const { categoryId } = useParams();
  const category = getSupportCategory(categoryId);

  return (
    <div className="min-h-screen bg-[#030303] font-sans text-slate-200 selection:bg-cyan-500/30 pb-24">
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32">
        <div className="mb-8 flex items-center gap-2 text-sm font-medium">
          <Link to="/support" className="flex items-center gap-1 text-zinc-500 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            返回支援中心
          </Link>
          <span className="text-zinc-700">/</span>
          <span className={category.theme.text}>{category.title}</span>
        </div>

        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-32 rounded-3xl border border-white/10 bg-[#0a0a0c]/80 p-8 shadow-2xl backdrop-blur-2xl"
            >
              <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 ${category.theme.bg} ${category.theme.text} shadow-inner`}>
                {getCategoryIcon(category.icon)}
              </div>
              <h1 className="mb-4 text-3xl font-black tracking-tight text-white">{category.title}</h1>
              <p className="mb-8 leading-relaxed text-zinc-400">{category.description}</p>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder={`搜索 ${category.title}...`}
                  className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 transition-all focus:border-white/30 focus:outline-none"
                />
              </div>
            </motion.div>
          </div>

          <div className="lg:w-2/3">
            {category.sections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="mb-12"
              >
                <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-white">
                  <span className={`h-6 w-2 rounded-full bg-gradient-to-b ${category.theme.gradient}`}></span>
                  {section.title}
                </h2>

                <div className="grid gap-4">
                  {section.articles.map((article) => (
                    <Link
                      to={`/support/article/${article.id}`}
                      key={article.id}
                      className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-white/10"
                    >
                      <div className={`absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b ${category.theme.gradient} opacity-0 transition-opacity group-hover:opacity-100`}></div>

                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-black/40 transition-colors group-hover:border-white/10">
                          <FileText className="h-5 w-5 text-zinc-400 transition-colors group-hover:text-white" />
                        </div>
                        <div>
                          <h3 className="mb-1 text-lg font-bold text-zinc-200 transition-colors group-hover:text-white">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                            <Clock className="h-3 w-3" />
                            {article.time}
                          </div>
                        </div>
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-all group-hover:translate-x-1 group-hover:bg-white/10">
                        <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
