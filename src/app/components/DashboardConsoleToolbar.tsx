import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Bell, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useUserAuth } from "../context/UserAuthContext";
import { useDashboardNav } from "../context/DashboardNavContext";
import { DashboardConsolePills } from "./DashboardConsolePills";
import { NavbarUserDesktop, NavbarUserMobile, isNavbarAccountLocale } from "./NavbarUserAccount";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { cn } from "./ui/utils";

const APP_LOCALES = ["zh-CN", "zh-TW", "en"] as const;
type AppLocale = (typeof APP_LOCALES)[number];

function isAppLocale(value: string | null): value is AppLocale {
  return APP_LOCALES.includes(value as AppLocale);
}

/**
 * 主導覽列隱藏時：還原、分頁、通知、帳戶同一條控制台列。
 * 樣式對齊 AdminDashboardToolbar：左返回、中分頁、右通知＋帳戶（lg 以下選單進抽屜）。
 */
export function DashboardConsoleToolbar() {
  const { user } = useUserAuth();
  const { resolvedTheme, theme: themePreference, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState<AppLocale>("zh-CN");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeTab, setActiveTab } = useDashboardNav();

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

  if (!user) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          "flex w-full max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-[#0a0a0c]/85 py-1.5 pl-2 pr-3 shadow-[0_6px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:gap-2 sm:pl-2.5 sm:pr-4",
          !isDark && "border-slate-200/60",
        )}
      >
        <Link
          to="/"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 sm:h-10 sm:w-10 ${iconButtonClass}`}
          aria-label="返回站點"
        >
          <ArrowLeft className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
        </Link>

        <div className="mx-0.5 hidden h-7 w-px shrink-0 bg-white/10 sm:block" aria-hidden />

        <DashboardConsolePills
          activeTab={activeTab}
          onSelect={setActiveTab}
          density="floating"
          embedded
        />

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
            <SheetTitle className="text-left text-white">用戶控制台</SheetTitle>
          </SheetHeader>
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
