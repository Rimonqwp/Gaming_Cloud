import {
  ArrowRight,
  Bell,
  ChevronDown,
  Cloud,
  Gamepad2,
  Globe,
  Menu,
  MoonStar,
  PanelTop,
  ShieldCheck,
  SunMedium,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link, useLocation } from "react-router";
import { useTheme } from "next-themes";
import { useUserAuth } from "../context/UserAuthContext";
import { useDashboardNav } from "../context/DashboardNavContext";
import { USER_DASHBOARD_NAV_TABS } from "../config/userDashboardNavTabs";
import { DashboardConsolePills } from "./DashboardConsolePills";
import { usePerformanceMode } from "../hooks/usePerformanceMode";
import {
  NavbarUserDesktop,
  NavbarUserMobile,
  UserLoginDialog,
  useCloseDropdownOnOutsideScroll,
} from "./NavbarUserAccount";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type NavItem = {
  label: string;
  to?: string;
  href?: string;
  withChevron?: boolean;
};

const navItems: NavItem[] = [
  { label: "首页", to: "/" },
  { label: "支持", to: "/support" },
  { label: "关于我们", href: "#", withChevron: true },
];

const APP_LOCALES = ["zh-CN", "zh-TW", "en"] as const;
type AppLocale = (typeof APP_LOCALES)[number];

function isAppLocale(value: string | null): value is AppLocale {
  return APP_LOCALES.includes(value as AppLocale);
}

type NavbarIconDropdownProps = {
  className: string;
  ariaLabel: string;
  children: ReactNode;
  menu: ReactNode;
};

function NavbarIconDropdown({ className, ariaLabel, children, menu }: NavbarIconDropdownProps) {
  const [open, setOpen] = useState(false);
  useCloseDropdownOnOutsideScroll(open, setOpen);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button" className={className} aria-label={ariaLabel}>
          {children}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[11rem]">
        {menu}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [enableGlassEffects, setEnableGlassEffects] = useState(false);
  const isPointerOverProductRef = useRef(false);
  const allowProductMenuOpenRef = useRef(true);
  const location = useLocation();
  const { resolvedTheme, theme: themePreference, setTheme } = useTheme();
  const [locale, setLocale] = useState<AppLocale>("zh-CN");

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
  const { user } = useUserAuth();
  const { allowHeavyMotion } = usePerformanceMode();
  const {
    activeTab: dashboardActiveTab,
    setActiveTab: setDashboardActiveTab,
    dashboardNavbarMode,
    dashboardNavPlacement,
    mainNavbarHidden,
    setMainNavbarHidden,
    dashboardAuxDrawerOpen,
    setDashboardAuxDrawerOpen,
  } = useDashboardNav();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setProductMenuOpen(false);
    setIsOpen(false);
    setDashboardAuxDrawerOpen(false);
    if (isPointerOverProductRef.current) {
      allowProductMenuOpenRef.current = false;
    }
  }, [location.pathname, setDashboardAuxDrawerOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    let idleId: number | null = null;

    const enable = () => {
      setEnableGlassEffects(true);
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enable, { timeout: 400 });
    } else {
      timeoutId = globalThis.setTimeout(enable, 260);
    }

    return () => {
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }

      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, []);

  const theme = mounted ? resolvedTheme ?? "dark" : "dark";
  const isDark = theme === "dark";
  const allowGlassEffects = allowHeavyMotion && enableGlassEffects;

  const navShellClass = isDark
    ? allowGlassEffects
      ? "bg-[#07101b]/78 border-white/10 shadow-[0_18px_50px_rgba(2,8,23,0.45)]"
      : "bg-[#07101b]/94 border-white/10 shadow-[0_16px_32px_rgba(2,8,23,0.34)]"
    : allowGlassEffects
      ? "bg-white/88 border-slate-200/90 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
      : "bg-white/96 border-slate-200/95 shadow-[0_12px_26px_rgba(15,23,42,0.08)]";
  const panelClass = isDark
    ? allowGlassEffects
      ? "bg-[#050910]/96 border-white/10 text-slate-100"
      : "bg-[#050910] border-white/10 text-slate-100"
    : allowGlassEffects
      ? "bg-white/96 border-slate-200 text-slate-900"
      : "bg-white border-slate-200 text-slate-900";
  const mutedTextClass = isDark ? "text-slate-400" : "text-slate-500";
  const hoverTextClass = isDark ? "hover:text-white" : "hover:text-slate-900";
  const navBackdropClass = allowGlassEffects ? "backdrop-blur-2xl" : "backdrop-blur-0";
  const iconButtonClass = isDark
    ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50";
  const userButtonClass = isDark
    ? "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  const isItemActive = (to?: string) => {
    if (!to) return false;
    if (to === "/") return location.pathname === "/";
    if (to === "/support") {
      return location.pathname === "/support" || location.pathname.startsWith("/support/");
    }
    return location.pathname === to;
  };

  const isProductNavActive =
    location.pathname === "/minecraft" ||
    location.pathname === "/deploy" ||
    location.pathname.startsWith("/deploy/") ||
    location.pathname === "/games" ||
    location.pathname.startsWith("/games/");

  const isDashboardRoute = location.pathname === "/dashboard";
  const showConsoleNavInNavbar =
    isDashboardRoute && dashboardNavbarMode === "console" && dashboardNavPlacement === "navbar_embed";
  const hideMainNav = Boolean(
    user && isDashboardRoute && mainNavbarHidden && dashboardNavbarMode === "console",
  );
  const mobileDrawerOpen = hideMainNav ? dashboardAuxDrawerOpen : isOpen;

  const closeMobileDrawer = () => {
    if (hideMainNav) {
      setDashboardAuxDrawerOpen(false);
    } else {
      setIsOpen(false);
    }
  };

  const megaMenuPanelClass = isDark
    ? `${allowGlassEffects ? "backdrop-blur-2xl" : ""} bg-[#050910]/96 border-white/10 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.55)]`
    : `${allowGlassEffects ? "backdrop-blur-2xl" : ""} bg-white/98 border-slate-200 text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.12)]`;
  const megaMenuMutedClass = isDark ? "text-slate-500" : "text-slate-500";
  const megaMenuHoverRow = isDark ? "hover:bg-white/5" : "hover:bg-slate-100";

  const handleProductPointerEnter = () => {
    isPointerOverProductRef.current = true;
    if (allowProductMenuOpenRef.current) {
      setProductMenuOpen(true);
    }
  };

  const handleProductPointerLeave = () => {
    isPointerOverProductRef.current = false;
    allowProductMenuOpenRef.current = true;
    setProductMenuOpen(false);
  };

  const renderNavContent = (item: NavItem) => {
    const active = isItemActive(item.to);
    const itemClass = active
      ? isDark
        ? "text-white"
        : "text-slate-900"
      : `${mutedTextClass} ${hoverTextClass}`;

    return (
      <span className={`relative flex items-center gap-1 transition-colors duration-200 ${itemClass}`}>
        <span>{item.label}</span>
        {item.withChevron && <ChevronDown className="h-4 w-4" />}
        {active && (
          <span className="absolute -bottom-[23px] left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"></span>
        )}
      </span>
    );
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 px-4 transition-colors duration-300 sm:px-6 ${
        hideMainNav ? "pointer-events-none h-0 min-h-0 overflow-visible border-0 bg-transparent p-0 shadow-none" : "py-3"
      }`}
    >
      <div className={hideMainNav ? "pointer-events-auto" : undefined}>
        <UserLoginDialog />
      </div>
      {!hideMainNav ? (
      <div
        className={`mx-auto flex h-[68px] max-w-7xl items-center justify-between overflow-visible rounded-[22px] border px-4 transition-colors duration-300 sm:px-5 ${navBackdropClass} ${navShellClass}`}
      >
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 shadow-[0_10px_30px_rgba(79,70,229,0.35)]">
            <div className="h-5 w-5 rounded-[7px] bg-white/90"></div>
          </div>
          <div className="leading-tight">
            <div className={`text-[1.05rem] font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>EggCloud</div>
            <div className={`text-xs ${mutedTextClass}`}>云游戏托管平台</div>
          </div>
        </Link>

        <div
          className={
            showConsoleNavInNavbar
              ? "hidden min-w-0 flex-1 items-center justify-center gap-2 px-1 sm:px-2 lg:flex"
              : `hidden items-center gap-7 overflow-visible text-sm font-medium lg:flex ${mutedTextClass}`
          }
        >
          {showConsoleNavInNavbar ? (
            <DashboardConsolePills
              activeTab={dashboardActiveTab}
              onSelect={setDashboardActiveTab}
              density="navbar"
            />
          ) : (
            <>
          <Link to="/">{renderNavContent(navItems[0])}</Link>

          <div
            className="relative -mx-1 flex h-[68px] items-center px-1"
            onPointerEnter={handleProductPointerEnter}
            onPointerLeave={handleProductPointerLeave}
          >
            <Link
              to="/games"
              className={`relative inline-flex items-center gap-1 transition-colors duration-200 ${
                isProductNavActive
                  ? isDark
                    ? "text-white"
                    : "text-slate-900"
                  : `${mutedTextClass} ${hoverTextClass}`
              }`}
            >
              <span>产品服务</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-300 ${productMenuOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
              {isProductNavActive && (
                <span className="absolute -bottom-[23px] left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"></span>
              )}
            </Link>

            <div
              className={`absolute left-1/2 top-full z-50 w-[min(100vw-2rem,850px)] -translate-x-1/2 -mt-3 pt-3 transition-all duration-300 ${
                productMenuOpen
                  ? "pointer-events-auto visible opacity-100"
                  : "pointer-events-none invisible opacity-0"
              }`}
            >
              <div className={`flex gap-6 rounded-2xl border p-6 ${megaMenuPanelClass}`}>
                <div className="flex w-[45%] flex-col">
                  <div className="mb-4 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
                    <Gamepad2 className="h-4 w-4" />
                    游戏云端托管
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Link
                      to="/minecraft"
                      className={`group/item relative flex items-center gap-4 overflow-hidden rounded-xl p-3 transition-colors ${megaMenuHoverRow}`}
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 transition-colors group-hover/item:border-emerald-500 dark:border-white/10 dark:group-hover/item:border-emerald-500">
                        <img
                          src="https://images.unsplash.com/photo-1703954413255-b8ac066fd53b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
                          alt="Minecraft"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 transition-colors group-hover/item:bg-black/0"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-sm font-bold text-slate-900 transition-colors group-hover/item:text-emerald-500 dark:text-white dark:group-hover/item:text-emerald-400">
                          Minecraft 我的世界
                        </div>
                        <div className={`mt-1 text-xs leading-relaxed ${megaMenuMutedClass}`}>
                          专为大型模组与百人服务器优化，流畅稳定。
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/games"
                      className={`group/item relative flex items-center gap-4 overflow-hidden rounded-xl p-3 transition-colors ${megaMenuHoverRow}`}
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 transition-colors group-hover/item:border-cyan-500 dark:border-white/10 dark:group-hover/item:border-cyan-500">
                        <img
                          src="https://images.unsplash.com/photo-1554130386-2dfd5b8f5aae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
                          alt="Valheim"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 transition-colors group-hover/item:bg-black/0"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-sm font-bold text-slate-900 transition-colors group-hover/item:text-cyan-600 dark:text-white dark:group-hover/item:text-cyan-400">
                          Valheim 英灵神殿
                        </div>
                        <div className={`mt-1 text-xs leading-relaxed ${megaMenuMutedClass}`}>
                          稳定节点，适合小队长期生存与探索。
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/games"
                      className={`group/item relative flex items-center gap-4 overflow-hidden rounded-xl p-3 transition-colors ${megaMenuHoverRow}`}
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 transition-colors group-hover/item:border-orange-500 dark:border-white/10 dark:group-hover/item:border-orange-500">
                        <img
                          src="https://images.unsplash.com/photo-1765578539072-7c074ddb5ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
                          alt="Rust"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 transition-colors group-hover/item:bg-black/0"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-sm font-bold text-slate-900 transition-colors group-hover/item:text-orange-600 dark:text-white dark:group-hover/item:text-orange-400">
                          Rust 腐蚀
                        </div>
                        <div className={`mt-1 text-xs leading-relaxed ${megaMenuMutedClass}`}>
                          承受高强度地图负载，保障对战稳定。
                        </div>
                      </div>
                    </Link>
                  </div>
                  <Link
                    to="/games"
                    className="mx-3 mt-3 flex items-center gap-1 text-xs font-bold text-emerald-500 transition-colors hover:text-emerald-400 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    查看全部支持游戏
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className={`my-2 w-px shrink-0 ${isDark ? "bg-white/10" : "bg-slate-200"}`}></div>

                <div className="flex w-[55%] flex-col gap-6">
                  <div>
                    <div className="mb-3 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-widest text-cyan-500 dark:text-cyan-400">
                      <Cloud className="h-4 w-4" />
                      云端算力（VPS）
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { title: "弹性云服务器（ECS）", desc: "适合通用应用与网站部署，按需扩容。" },
                        { title: "裸金属服务器", desc: "无虚拟化损耗，释放极致硬件性能。" },
                        { title: "GPU 计算实例", desc: "顶级 GPU，面向 AI 与图形渲染。" },
                        { title: "NVMe 高性能云盘", desc: "PCIe 4.0 存储，高速读写。" },
                      ].map((cell) => (
                        <Link
                          key={cell.title}
                          to="/deploy"
                          className={`group/item block rounded-xl p-3 transition-colors ${megaMenuHoverRow}`}
                        >
                          <div className="mb-1 text-sm font-bold text-slate-900 transition-colors group-hover/item:text-cyan-600 dark:text-white dark:group-hover/item:text-cyan-400">
                            {cell.title}
                          </div>
                          <div className={`text-xs ${megaMenuMutedClass}`}>{cell.desc}</div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className={`mx-2 h-px ${isDark ? "bg-white/10" : "bg-slate-200"}`}></div>

                  <div>
                    <div className="mb-3 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-widest text-violet-500 dark:text-purple-400">
                      <ShieldCheck className="h-4 w-4" />
                      网络与安全
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/deploy" className={`group/item block rounded-xl p-3 transition-colors ${megaMenuHoverRow}`}>
                        <div className="mb-1 text-sm font-bold text-slate-900 transition-colors group-hover/item:text-violet-600 dark:text-white dark:group-hover/item:text-purple-400">
                          游戏专属加速网络
                        </div>
                        <div className={`text-xs ${megaMenuMutedClass}`}>专线互联，降低跨国延迟与丢包。</div>
                      </Link>
                      <Link to="/deploy" className={`group/item block rounded-xl p-3 transition-colors ${megaMenuHoverRow}`}>
                        <div className="mb-1 text-sm font-bold text-slate-900 transition-colors group-hover/item:text-violet-600 dark:text-white dark:group-hover/item:text-purple-400">
                          DDoS 高防 IP
                        </div>
                        <div className={`text-xs ${megaMenuMutedClass}`}>大流量清洗能力，保障业务在线。</div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {navItems.slice(1).map((item) =>
            item.to ? (
              <Link key={item.label} to={item.to}>
                {renderNavContent(item)}
              </Link>
            ) : (
              <a key={item.label} href={item.href}>
                {renderNavContent(item)}
              </a>
            )
          )}
            </>
          )}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {!user ? (
            <>
              <NavbarIconDropdown
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200 ${iconButtonClass}`}
                ariaLabel="语言"
                menu={
                  <>
                    <DropdownMenuLabel>界面语言</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={locale}
                      onValueChange={(v) => {
                        if (isAppLocale(v)) setLocale(v);
                      }}
                    >
                      <DropdownMenuRadioItem value="zh-CN">简体中文</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="zh-TW">繁體中文</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </>
                }
              >
                <Globe className="h-4.5 w-4.5" />
              </NavbarIconDropdown>
              <NavbarIconDropdown
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200 ${iconButtonClass}`}
                ariaLabel="外观与主题"
                menu={
                  <>
                    <DropdownMenuLabel>主题</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={mounted ? (themePreference ?? "system") : "system"}
                      onValueChange={setTheme}
                    >
                      <DropdownMenuRadioItem value="light">浅色</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">深色</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="system">跟随系统</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </>
                }
              >
                {isDark ? <SunMedium className="h-4.5 w-4.5" /> : <MoonStar className="h-4.5 w-4.5" />}
              </NavbarIconDropdown>
            </>
          ) : null}
          {user && isDashboardRoute ? (
            <NavbarIconDropdown
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200 ${iconButtonClass}`}
              ariaLabel="主導覽列設定"
              menu={
                <>
                  <DropdownMenuLabel>主導覽列設定</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={mainNavbarHidden}
                    onCheckedChange={(v) => setMainNavbarHidden(v === true)}
                  >
                    隱藏頂部導覽列
                  </DropdownMenuCheckboxItem>
                </>
              }
            >
              <PanelTop className="h-4.5 w-4.5" />
            </NavbarIconDropdown>
          ) : null}
          <button
            type="button"
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200 ${iconButtonClass}${user ? "" : " hidden"}`}
            aria-label="通知"
          >
            <Bell className="h-4.5 w-4.5" />
          </button>
          <NavbarUserDesktop
            mutedTextClass={mutedTextClass}
            userButtonClass={userButtonClass}
            locale={locale}
            onLocaleChange={setLocale}
            themePreference={themePreference}
            onThemeChange={setTheme}
            themeMounted={mounted}
            isDark={isDark}
          />
        </div>

        <button
          type="button"
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors lg:hidden ${iconButtonClass}`}
          onClick={() => setIsOpen((open) => !open)}
          aria-label="切换导航菜单"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      ) : null}

      <AnimatePresence>
        {mobileDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={
              hideMainNav
                ? `pointer-events-auto fixed left-4 right-4 top-4 z-[100] max-h-[min(85vh,calc(100dvh-2rem))] overflow-y-auto rounded-[24px] border p-4 shadow-2xl lg:hidden ${navBackdropClass} ${panelClass}`
                : `mx-auto mt-3 max-w-7xl rounded-[24px] border p-4 shadow-2xl lg:hidden ${navBackdropClass} ${panelClass}`
            }
          >
            {hideMainNav ? (
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={closeMobileDrawer}
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200 ${iconButtonClass}`}
                  aria-label="關閉選單"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              {isDashboardRoute ? (
                <div
                  className={`mb-1 rounded-2xl border p-3 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-slate-50"}`}
                >
                  <div className={`mb-2 text-[11px] font-bold uppercase tracking-wider ${mutedTextClass}`}>
                    用户控制台
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {USER_DASHBOARD_NAV_TABS.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = dashboardActiveTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setDashboardActiveTab(tab.id);
                            closeMobileDrawer();
                          }}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                            isActive
                              ? isDark
                                ? "border-cyan-500/40 bg-cyan-500/10 text-white"
                                : "border-cyan-300 bg-cyan-50 text-slate-900"
                              : isDark
                                ? "border-white/10 text-slate-300 hover:bg-white/6"
                                : "border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <Link
                to="/"
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  isItemActive("/")
                    ? isDark
                      ? "bg-white/10 text-white"
                      : "bg-slate-100 text-slate-900"
                    : isDark
                      ? "text-slate-300 hover:bg-white/6 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                onClick={closeMobileDrawer}
              >
                <span>首页</span>
              </Link>

              <div className="rounded-2xl px-4 py-3">
                <Link
                  to="/games"
                  className={`mb-2 flex items-center justify-between rounded-xl px-0 py-1 text-sm font-medium transition-colors ${isDark ? "text-slate-200 hover:text-white" : "text-slate-800 hover:text-slate-900"}`}
                  onClick={closeMobileDrawer}
                >
                  产品服务
                  <span className={`text-xs font-normal ${mutedTextClass}`}>进入总览</span>
                </Link>
                <div
                  className={`flex flex-col gap-2 border-l pl-3 ${isDark ? "border-white/10" : "border-slate-200"}`}
                >
                  <Link
                    to="/minecraft"
                    className={`text-sm transition-colors ${isDark ? "text-slate-400 hover:text-emerald-400" : "text-slate-600 hover:text-emerald-600"}`}
                    onClick={closeMobileDrawer}
                  >
                    Minecraft 我的世界
                  </Link>
                  <Link
                    to="/games"
                    className={`text-sm transition-colors ${isDark ? "text-slate-400 hover:text-cyan-400" : "text-slate-600 hover:text-cyan-600"}`}
                    onClick={closeMobileDrawer}
                  >
                    游戏列表 / Valheim · Rust
                  </Link>
                  <Link
                    to="/deploy"
                    className={`text-sm transition-colors ${isDark ? "text-slate-400 hover:text-violet-400" : "text-slate-600 hover:text-violet-600"}`}
                    onClick={closeMobileDrawer}
                  >
                    云服务器与网络方案
                  </Link>
                </div>
              </div>

              {navItems.slice(1).map((item) => {
                const active = isItemActive(item.to);
                const baseClass = active
                  ? isDark
                    ? "bg-white/10 text-white"
                    : "bg-slate-100 text-slate-900"
                  : isDark
                    ? "text-slate-300 hover:bg-white/6 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

                if (item.to) {
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${baseClass}`}
                      onClick={closeMobileDrawer}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${baseClass}`}
                    onClick={closeMobileDrawer}
                  >
                    <span>{item.label}</span>
                    {item.withChevron && <ChevronDown className="h-4 w-4" />}
                  </a>
                );
              })}
            </div>

            <div className={`my-3 h-px ${isDark ? "bg-white/10" : "bg-slate-200"}`}></div>

            <div className="grid grid-cols-2 gap-3">
              {!user ? (
                <>
                  <NavbarIconDropdown
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${iconButtonClass}`}
                    ariaLabel="语言"
                    menu={
                      <>
                        <DropdownMenuLabel>界面语言</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                          value={locale}
                          onValueChange={(v) => {
                            if (isAppLocale(v)) setLocale(v);
                          }}
                        >
                          <DropdownMenuRadioItem value="zh-CN">简体中文</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="zh-TW">繁體中文</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </>
                    }
                  >
                    <Globe className="h-4.5 w-4.5" />
                    <span>语言</span>
                  </NavbarIconDropdown>
                  <NavbarIconDropdown
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${iconButtonClass}`}
                    ariaLabel="外观与主题"
                    menu={
                      <>
                        <DropdownMenuLabel>主题</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                          value={mounted ? (themePreference ?? "system") : "system"}
                          onValueChange={setTheme}
                        >
                          <DropdownMenuRadioItem value="light">浅色</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="dark">深色</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="system">跟随系统</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </>
                    }
                  >
                    {isDark ? <SunMedium className="h-4.5 w-4.5" /> : <MoonStar className="h-4.5 w-4.5" />}
                    <span>主题</span>
                  </NavbarIconDropdown>
                </>
              ) : null}
              <button
                type="button"
                className={`col-span-2 flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${iconButtonClass}${user ? "" : " hidden"}`}
              >
                <Bell className="h-4.5 w-4.5" />
                <span>通知</span>
              </button>
            </div>

            <div className="mt-3">
              <NavbarUserMobile
                mutedTextClass={mutedTextClass}
                userButtonClass={userButtonClass}
                onNavigate={closeMobileDrawer}
                locale={locale}
                onLocaleChange={setLocale}
                themePreference={themePreference}
                onThemeChange={setTheme}
                themeMounted={mounted}
                isDark={isDark}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
