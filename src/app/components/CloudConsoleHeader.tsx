import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  ChartNoAxesCombined,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router";
import { useTheme } from "next-themes";
import "../../styles/cloud-navigation.css";
import { USER_DASHBOARD_NAV_TABS } from "../config/userDashboardNavTabs";
import { useDashboardNav } from "../context/DashboardNavContext";
import {
  isNavbarAccountLocale,
  NavbarUserDesktop,
  UserLoginDialog,
} from "./NavbarUserAccount";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function CloudConsoleHeader() {
  const { activeTab, setActiveTab, dashboardNavPlacement, mainNavbarHidden } = useDashboardNav();
  const { resolvedTheme, theme: themePreference, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState<"zh-CN" | "zh-TW" | "en">("zh-CN");

  useEffect(() => {
    setMounted(true);
    const raw = window.localStorage.getItem("eggcloud.locale");
    if (isNavbarAccountLocale(raw ?? "")) {
      setLocale(raw);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang =
      locale === "en" ? "en" : locale === "zh-TW" ? "zh-Hant" : "zh-Hans";
    window.localStorage.setItem("eggcloud.locale", locale);
  }, [locale]);

  const isDark = mounted && resolvedTheme === "dark";
  const placement = mainNavbarHidden && dashboardNavPlacement === "navbar_embed"
    ? "below_navbar"
    : dashboardNavPlacement;
  return (
    <div className="cloud-console-chrome" data-nav-placement={placement} data-main-hidden={mainNavbarHidden}>
    <header className="cloud-header" aria-label={mainNavbarHidden ? "控制台工具栏" : "主导航"}>
      <Link to="/" className="cloud-brand" aria-label="EggCloud 首页">
        <img src="/console/brand.png" alt="EggCloud" />
      </Link>
      <div className="cloud-navigation">
        <Link to="/" className="cloud-back" aria-label="返回站点">
          <ArrowLeft size={19} />
        </Link>
        <nav className="cloud-nav-pills" aria-label="控制台导航">
          {USER_DASHBOARD_NAV_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-current={id === activeTab ? "page" : undefined}
              className={id === activeTab ? "active" : ""}
            >
              {id === "overview" ? (
                <ChartNoAxesCombined size={17} strokeWidth={1.9} />
              ) : id === "tickets" ? (
                <MessageSquare size={17} strokeWidth={1.9} />
              ) : (
                <Icon size={17} strokeWidth={1.9} />
              )}
              {label}
            </button>
          ))}
        </nav>
      </div>
      <div className="cloud-account">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cloud-notification" aria-label="通知">
              <Bell size={22} />
              <span />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="cloud-popover cloud-notices"
          >
            <strong>通知中心</strong>
            <p>新加坡游戏节点计划维护</p>
            <small>10 月 9 日 02:00（SGT），预计 15 分钟。请提前保存世界存档。</small>
            <DropdownMenuItem onSelect={() => setActiveTab("tickets")}>
              查看技术支持工单
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="cloud-account-profile">
          <NavbarUserDesktop
            mutedTextClass="text-slate-500"
            userButtonClass="cloud-user-profile"
            locale={locale}
            onLocaleChange={setLocale}
            themePreference={themePreference}
            onThemeChange={setTheme}
            themeMounted={mounted}
            isDark={isDark}
          />
        </div>
      </div>
      <UserLoginDialog />
    </header>
    </div>
  );
}
