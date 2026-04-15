import { useEffect, useState, type MouseEvent } from "react";
import { Link } from "react-router";
import { ArrowLeft, Bell, Menu, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { NavbarUserDesktop, NavbarUserMobile, UserLoginDialog, isNavbarAccountLocale } from "./NavbarUserAccount";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { cn } from "./ui/utils";

const APP_LOCALES = ["zh-CN", "zh-TW", "en"] as const;
type AppLocale = (typeof APP_LOCALES)[number];

function isAppLocale(value: string | null): value is AppLocale {
  return APP_LOCALES.includes(value as AppLocale);
}

type AdminDashboardToolbarProps<T extends string> = {
  tabs: readonly { id: T; label: string; icon: LucideIcon }[];
  activeTab: T;
  onSelectTab: (id: T) => void;
  onBackClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * 與 DashboardConsoleToolbar 相同結構：左返回、中分頁、右通知＋帳戶（lg 以下選單進抽屜）。
 */
export function AdminDashboardToolbar<T extends string>({
  tabs,
  activeTab,
  onSelectTab,
  onBackClick,
}: AdminDashboardToolbarProps<T>) {
  const { resolvedTheme, theme: themePreference, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState<AppLocale>("zh-CN");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem("eggcloud.locale");
    if (isAppLocale(raw)) {
      setLocale(raw);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang =
      locale === "en" ? "en" : locale === "zh-TW" ? "zh-Hant" : "zh-Hans";
    window.localStorage.setItem("eggcloud.locale", locale);
  }, [locale]);

  const theme = mounted ? resolvedTheme ?? "dark" : "dark";
  const isDark = theme === "dark";
  const iconButtonClass = isDark
    ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50";
  const userButtonClass = isDark
    ? "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
  const mutedTextClass = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <>
      <UserLoginDialog />
      <div
        className={cn(
          "flex w-full max-w-full items-center gap-1.5 rounded-full border border-red-950/75 bg-[#0a0a0c]/85 py-1.5 pl-2 pr-3 shadow-[0_6px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:gap-2 sm:pl-2.5 sm:pr-4",
          !isDark && "border-red-800/70",
        )}
      >
        <Link
          to="/"
          onClick={onBackClick}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 sm:h-10 sm:w-10 ${iconButtonClass}`}
          aria-label="返回站点"
        >
          <ArrowLeft className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
        </Link>

        <div className="mx-0.5 hidden h-7 w-px shrink-0 bg-white/10 sm:block" aria-hidden />

        <div
          role="navigation"
          aria-label="管理後台分頁"
          className="flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto overflow-y-hidden no-scrollbar sm:gap-1"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`relative shrink-0 rounded-full px-2.5 py-2 text-xs font-medium transition-all sm:px-3.5 sm:text-sm ${
                  isActive ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {isActive ? (
                  <motion.div
                    layoutId="adminConsoleActivePill"
                    className="absolute inset-0 rounded-full border border-red-800/35 bg-red-950/35"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                ) : null}
                <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                  <Icon
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? "text-red-400" : ""}`}
                  />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mx-0.5 hidden h-7 w-px shrink-0 bg-white/10 sm:block" aria-hidden />

        <button
          type="button"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 sm:h-10 sm:w-10 ${iconButtonClass}`}
          aria-label="通知"
        >
          <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
        </button>

        <div className="hidden shrink-0 lg:block">
          <NavbarUserDesktop
            mutedTextClass={mutedTextClass}
            userButtonClass={userButtonClass}
            locale={locale}
            onLocaleChange={(v) => {
              if (isNavbarAccountLocale(v)) setLocale(v);
            }}
            themePreference={themePreference}
            onThemeChange={setTheme}
            themeMounted={mounted}
            isDark={isDark}
          />
        </div>

        <button
          type="button"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 lg:hidden ${iconButtonClass}`}
          onClick={() => setMobileOpen(true)}
          aria-label="開啟選單"
        >
          <Menu className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
        </button>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="right"
          className="border-white/10 bg-[#0a0a0c] text-slate-200 [&_[data-slot=sheet-close]]:text-slate-400"
        >
          <SheetHeader>
            <SheetTitle className="text-left text-white">管理後台</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-4 pb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(tab.id);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-red-400" : ""}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="mt-2 border-t border-white/10 px-4 pt-4">
            <NavbarUserMobile
              mutedTextClass={mutedTextClass}
              userButtonClass={userButtonClass}
              locale={locale}
              onLocaleChange={(v) => {
                if (isNavbarAccountLocale(v)) setLocale(v);
              }}
              themePreference={themePreference}
              onThemeChange={setTheme}
              themeMounted={mounted}
              isDark={isDark}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
