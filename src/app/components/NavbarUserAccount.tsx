import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  KeyRound,
  Languages,
  LayoutDashboard,
  Loader2,
  LogOut,
  Moon,
  Settings,
  Shield,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useUserAuth } from "../context/UserAuthContext";
import {
  formatCurrencyAmount,
  normalizeSupportedCurrency,
} from "../lib/currency";
import { isDashboardAdminUser, type UserPublic } from "../lib/userAuth";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "./ui/utils";

/** 選單開啟時，頁面上下捲動或在外側使用滾輪／觸控滑動時關閉（選單內可捲內容除外）。 */
export function useCloseDropdownOnOutsideScroll(
  open: boolean,
  onOpenChange: (next: boolean) => void,
) {
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  useEffect(() => {
    if (!open) return;

    const openedAt = Date.now();
    const graceMs = 200;

    const close = () => onOpenChangeRef.current(false);

    const contentSelector = '[data-slot="dropdown-menu-content"][data-state="open"]';

    const targetInsideMenuContent = (target: EventTarget | null) => {
      if (!(target instanceof Node)) return false;
      const surface = document.querySelector(contentSelector);
      return surface != null && surface.contains(target);
    };

    const onWheel = (e: WheelEvent) => {
      if (Date.now() - openedAt < graceMs) return;
      if (!targetInsideMenuContent(e.target)) close();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (Date.now() - openedAt < graceMs) return;
      if (!targetInsideMenuContent(e.target)) close();
    };

    const onScroll = () => {
      if (Date.now() - openedAt < graceMs) return;
      close();
    };

    const scrollEl = document.scrollingElement ?? document.documentElement;
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("wheel", onWheel, { passive: true, capture: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true, capture: true });

    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("wheel", onWheel, true);
      document.removeEventListener("touchmove", onTouchMove, true);
    };
  }, [open]);
}

type AuthMode = "login" | "register";

export function UserLoginDialog() {
  const {
    loginModalOpen,
    setLoginModalOpen,
    login,
    register,
    authError,
    submitting,
    clearAuthError,
  } = useUserAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [formResetToken, setFormResetToken] = useState(0);
  const [forgotPasswordHint, setForgotPasswordHint] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (!loginModalOpen) {
      setMode("login");
      setFormResetToken((current) => current + 1);
      setForgotPasswordHint("");
      formRef.current?.reset();
      clearAuthError();
    }
  }, [loginModalOpen, clearAuthError]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFormResetToken((current) => current + 1);
    setForgotPasswordHint("");
    formRef.current?.reset();
    clearAuthError();
  };

  const handleForgotPassword = () => {
    setForgotPasswordHint("又忘了？先别慌，找回密码功能还在路上，先联系管理员吧。");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");

    try {
      if (mode === "register") {
        const username = String(formData.get("username") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        await register(username, email, password);
        return;
      }

      const identifier = String(formData.get("identifier") ?? "").trim();
      await login(identifier, password);
    } catch {
      // authError is already handled by the auth context.
    }
  };

  return (
    <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
      <DialogContent
        className={cn(
          "max-w-[calc(100%-2rem)] gap-0 border-0 bg-transparent p-0 shadow-none sm:max-w-[400px]",
          "[&>button]:hidden",
        )}
      >
        <DialogTitle className="sr-only">登录 EggCloud</DialogTitle>
        <DialogDescription className="sr-only">
          Sign in or create an EggCloud account to access the control panel.
        </DialogDescription>
        <div className="relative w-full">
          <DialogClose className="absolute -right-1 -top-1 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0b0d12]/90 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-emerald-500/40 focus:outline-none [&_svg]:size-4">
            <X />
            <span className="sr-only">关闭</span>
          </DialogClose>

          <div
            className={cn(
              "rounded-3xl border border-white/10 bg-[#0b0d12]/98 p-8 shadow-[0_18px_48px_rgba(0,0,0,0.36)] backdrop-blur-md sm:p-9",
            )}
          >
            <div className="mb-8">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                  <Shield className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {mode === "login" ? "登录 EggCloud" : "创建账号"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {mode === "login"
                    ? "使用邮箱或用户名继续访问控制台。"
                    : "填写用户名、邮箱和密码，快速创建新账号。"}
                </p>
              </div>
            </div>

            <form
              key={`${mode}-${formResetToken}`}
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {authError ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-300"
                >
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{authError}</span>
                </motion.div>
              ) : null}

              {mode === "register" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="nav-register-display-name"
                      className="flex items-center gap-2 text-sm font-medium text-zinc-300"
                    >
                      <UserRound className="h-4 w-4 text-emerald-300" />
                      用户名
                    </label>
                    <input
                      id="nav-register-display-name"
                      name="username"
                      autoComplete="username"
                      placeholder="例如 Rimon12"
                      required
                      disabled={submitting}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition-colors placeholder:text-zinc-600 focus:border-emerald-400/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="nav-register-email"
                      className="flex items-center gap-2 text-sm font-medium text-zinc-300"
                    >
                      <UserRound className="h-4 w-4 text-emerald-300" />
                      邮箱
                    </label>
                    <input
                      id="nav-register-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      required
                      disabled={submitting}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition-colors placeholder:text-zinc-600 focus:border-emerald-400/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </div>
                </div>
              ) : null}

              {mode === "login" ? (
                <div className="space-y-2">
                  <label
                    htmlFor="nav-login-identifier"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-300"
                  >
                    <UserRound className="h-4 w-4 text-emerald-300" />
                    邮箱或用户名
                  </label>
                  <input
                    id="nav-login-identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="name@example.com 或 Rimon12"
                    required
                    disabled={submitting}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition-colors placeholder:text-zinc-600 focus:border-emerald-400/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="nav-login-pass"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-300"
                  >
                    <KeyRound className="h-4 w-4 text-emerald-300" />
                    密码
                  </label>
                  {mode === "login" ? (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-medium text-emerald-300 transition-colors hover:text-emerald-200"
                    >
                      忘记密码？
                    </button>
                  ) : null}
                </div>
                <input
                  key={`password-${mode}-${formResetToken}`}
                  id="nav-login-pass"
                  name="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder="********"
                  required
                  disabled={submitting}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition-colors placeholder:text-zinc-600 focus:border-emerald-400/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                />
                {mode === "login" && forgotPasswordHint ? (
                  <p className="text-xs leading-5 text-zinc-400">
                    {forgotPasswordHint}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 font-semibold text-black transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{mode === "login" ? "正在登录" : "正在注册"}</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>{mode === "login" ? "登录" : "注册"}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-zinc-500">
              <button
                type="button"
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                className="transition-colors hover:text-white"
              >
                {mode === "login" ? "没有账号？去注册" : "已有账号？去登录"}
              </button>
              <span className="inline-flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                SQLite Ready
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ClassProps = {
  mutedTextClass: string;
  userButtonClass: string;
};

export type NavbarAccountLocale = "zh-CN" | "zh-TW" | "en";

export function isNavbarAccountLocale(value: string): value is NavbarAccountLocale {
  return value === "zh-CN" || value === "zh-TW" || value === "en";
}

function localeLabel(locale: NavbarAccountLocale): string {
  if (locale === "zh-TW") return "繁體中文";
  if (locale === "en") return "English";
  return "简体中文";
}

function themePrefLabel(themePreference: string | undefined, themeMounted: boolean): string {
  const pref = themeMounted ? (themePreference ?? "system") : "system";
  if (pref === "light") return "浅色";
  if (pref === "dark") return "深色";
  return "跟随系统";
}

type AccountProfileCardProps = {
  user: UserPublic;
  mutedTextClass: string;
  locale: NavbarAccountLocale;
  onLocaleChange: (next: NavbarAccountLocale) => void;
  themePreference: string | undefined;
  onThemeChange: (theme: string) => void;
  themeMounted: boolean;
  isDark: boolean;
  isMinecraft: boolean;
  /** 為 true 時語言／主題使用子選單，在帳號面板右側展開（僅在已置於 DropdownMenu 內時使用）。 */
  embedSubmenus?: boolean;
  onNavigate?: () => void;
  onLogout: () => void;
};

function AccountProfileCard({
  user,
  mutedTextClass,
  locale,
  onLocaleChange,
  themePreference,
  onThemeChange,
  themeMounted,
  isDark,
  isMinecraft,
  embedSubmenus = false,
  onNavigate,
  onLogout,
}: AccountProfileCardProps) {
  const label = user.displayName || user.username;
  const uidText = user.uid?.trim() || String(user.id);
  const metaLine = `UID ${uidText}`;
  const showAdminConsole = isDashboardAdminUser(user);
  const displayCurrency = normalizeSupportedCurrency(user.preferredCurrency, "CNY");
  const balanceText = typeof user.balance === "number"
    ? formatCurrencyAmount(user.balance, displayCurrency)
    : null;
  const bonusCreditText =
    typeof user.bonusCredit === "number"
      ? formatCurrencyAmount(user.bonusCredit, displayCurrency)
      : null;

  const cardShell = isDark
    ? isMinecraft
      ? "border-emerald-950/55 bg-[#030806]/98"
      : "border-cyan-950/50 bg-[#03070a]/98"
    : isMinecraft
      ? "border-emerald-900/25 bg-emerald-950/[0.12]"
      : "border-cyan-900/20 bg-slate-950/[0.06]";

  const avatarShell = isDark
    ? isMinecraft
      ? "bg-emerald-950/80 text-emerald-400/95"
      : "bg-cyan-950/80 text-cyan-400/95"
    : isMinecraft
      ? "bg-emerald-900/30 text-emerald-600"
      : "bg-cyan-900/25 text-cyan-600";

  const balanceAccent = isDark
    ? isMinecraft
      ? "text-emerald-400/90"
      : "text-cyan-400/90"
    : isMinecraft
      ? "text-emerald-600"
      : "text-cyan-600";
  const bonusAccent = isDark
    ? isMinecraft
      ? "text-lime-300/90"
      : "text-violet-300/90"
    : isMinecraft
      ? "text-lime-600"
      : "text-violet-600";

  const balanceRow = isDark ? "border border-slate-500/45" : "border border-slate-300";
  const rowHover = isDark ? "hover:bg-white/[0.06] hover:text-white" : "hover:bg-black/[0.04] hover:text-slate-900";
  const rowText = isDark ? "text-slate-300" : "text-slate-600";
  const rowIcon = isDark ? "text-slate-500" : "text-slate-500";
  const metaMuted = isDark ? "text-slate-500" : "text-slate-500";
  const titleText = isDark ? "text-white" : "text-slate-900";
  const dividerClass = isDark ? "bg-white/10" : "bg-slate-200";

  const rowClass = `w-full rounded-lg px-3 py-2 text-left transition-colors flex items-center gap-2 ${rowText} ${rowHover}`;

  const flyoutPanel = cn(
    "z-[100] w-[11rem] min-w-0 rounded-lg border p-1.5 shadow-xl outline-none",
    cardShell,
  );

  const flyoutHead = cn(
    "px-1.5 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wider",
    metaMuted,
  );

  const radioChecked = isMinecraft
    ? isDark
      ? "data-[state=checked]:border-emerald-500/35 data-[state=checked]:bg-emerald-500/[0.12] data-[state=checked]:text-emerald-100"
      : "data-[state=checked]:border-emerald-300/80 data-[state=checked]:bg-emerald-500/10 data-[state=checked]:text-emerald-900"
    : isDark
      ? "data-[state=checked]:border-cyan-500/35 data-[state=checked]:bg-cyan-500/[0.12] data-[state=checked]:text-cyan-100"
      : "data-[state=checked]:border-cyan-300/80 data-[state=checked]:bg-cyan-500/10 data-[state=checked]:text-cyan-900";

  const flyoutRadioItem = cn(
    "rounded-md border border-transparent py-1.5 pr-2 pl-7 text-xs outline-none transition-colors",
    isDark
      ? "text-slate-200 focus:border-white/10 focus:bg-white/[0.07] focus:text-white"
      : "text-slate-800 focus:border-slate-200 focus:bg-slate-100",
    radioChecked,
  );

  const subTriggerOpen = isDark ? "data-[state=open]:bg-white/[0.08]" : "data-[state=open]:bg-black/[0.06]";

  const localeFlyoutBody = (
    <>
      <div className={flyoutHead}>界面语言</div>
      <DropdownMenuRadioGroup
        value={locale}
        onValueChange={(v) => {
          if (isNavbarAccountLocale(v)) onLocaleChange(v);
        }}
      >
        <DropdownMenuRadioItem value="zh-CN" className={flyoutRadioItem}>
          简体中文
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="zh-TW" className={flyoutRadioItem}>
          繁體中文
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="en" className={flyoutRadioItem}>
          English
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </>
  );

  const themeFlyoutBody = (
    <>
      <div className={flyoutHead}>主题</div>
      <DropdownMenuRadioGroup
        value={themeMounted ? (themePreference ?? "system") : "system"}
        onValueChange={onThemeChange}
      >
        <DropdownMenuRadioItem value="light" className={flyoutRadioItem}>
          浅色
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark" className={flyoutRadioItem}>
          深色
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="system" className={flyoutRadioItem}>
          跟随系统
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </>
  );

  const localeRowTrigger = (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <Languages className={`h-4 w-4 shrink-0 ${rowIcon}`} />
        语言
      </span>
      <span className={`shrink-0 text-xs ${metaMuted}`}>{localeLabel(locale)}</span>
    </>
  );

  const themeRowTrigger = (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <Moon className={`h-4 w-4 shrink-0 ${rowIcon}`} />
        主题
      </span>
      <span className={`shrink-0 text-xs ${metaMuted}`}>
        {themePrefLabel(themePreference, themeMounted)}
      </span>
    </>
  );

  return (
    <div className={`rounded-xl border p-4 shadow-lg ${cardShell}`}>
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${avatarShell}`}
        >
          <UserRound className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`truncate text-sm font-bold ${titleText}`}>{label}</div>
          <div className={`truncate font-mono text-xs ${metaMuted}`} title={metaLine}>
            {metaLine}
          </div>
        </div>
        <Link
          to="/dashboard?tab=settings"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${rowText} ${rowHover}`}
          onClick={() => onNavigate?.()}
          title="個人設定"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>

      <div className={`mb-4 flex items-center justify-between rounded-lg p-3 ${balanceRow}`}>
        <span className={`text-xs font-medium ${mutedTextClass}`}>目前餘額</span>
        <span className={`flex items-baseline gap-1 font-mono ${balanceAccent}`}>
          <span className="text-sm font-bold">{balanceText ?? "—"}</span>
          {bonusCreditText ? (
            <span className={`text-[11px] font-medium ${bonusAccent}`}>/ {bonusCreditText}</span>
          ) : null}
        </span>
      </div>

      <div className="space-y-2">
        <Link to="/dashboard?tab=overview" className={rowClass} onClick={() => onNavigate?.()}>
          <LayoutDashboard className={`h-4 w-4 shrink-0 ${rowIcon}`} />
          用戶控制台
        </Link>
        {showAdminConsole ? (
          <Link to="/admin" className={rowClass} onClick={() => onNavigate?.()}>
            <Shield className={`h-4 w-4 shrink-0 ${rowIcon}`} />
            管理控制台
          </Link>
        ) : null}
        {embedSubmenus ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className={cn(
                rowClass,
                "flex w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent outline-none",
                subTriggerOpen,
              )}
            >
              {localeRowTrigger}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              side="right"
              align="start"
              sideOffset={8}
              alignOffset={0}
              avoidCollisions={false}
              className={flyoutPanel}
            >
              {localeFlyoutBody}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={`${rowClass} justify-between`}>
                {localeRowTrigger}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="start"
              sideOffset={8}
              alignOffset={0}
              avoidCollisions={false}
              collisionPadding={8}
              className={flyoutPanel}
            >
              {localeFlyoutBody}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {embedSubmenus ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className={cn(
                rowClass,
                "flex w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent outline-none",
                subTriggerOpen,
              )}
            >
              {themeRowTrigger}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              side="right"
              align="start"
              sideOffset={8}
              alignOffset={0}
              avoidCollisions={false}
              className={flyoutPanel}
            >
              {themeFlyoutBody}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={`${rowClass} justify-between`}>
                {themeRowTrigger}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="start"
              sideOffset={8}
              alignOffset={0}
              avoidCollisions={false}
              collisionPadding={8}
              className={flyoutPanel}
            >
              {themeFlyoutBody}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className={`my-2 h-px ${dividerClass}`} />

        <button
          type="button"
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-400 transition-colors hover:bg-red-500/10 ${isDark ? "" : "hover:text-red-600"}`}
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          退出登录
        </button>
      </div>
    </div>
  );
}

type AccountMenuPrefs = {
  locale: NavbarAccountLocale;
  onLocaleChange: (next: NavbarAccountLocale) => void;
  themePreference: string | undefined;
  onThemeChange: (theme: string) => void;
  themeMounted: boolean;
};

type DesktopProps = ClassProps & AccountMenuPrefs & { isDark: boolean };

export function NavbarUserDesktop({
  mutedTextClass,
  userButtonClass,
  locale,
  onLocaleChange,
  themePreference,
  onThemeChange,
  themeMounted,
  isDark,
}: DesktopProps) {
  const { user, ready, openLoginModal, logout } = useUserAuth();
  const location = useLocation();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  useCloseDropdownOnOutsideScroll(accountMenuOpen, setAccountMenuOpen);

  const isMinecraft =
    location.pathname === "/minecraft" || location.pathname.startsWith("/minecraft/");

  if (!ready) {
    return (
      <div
        className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm font-medium opacity-60 ${userButtonClass}`}
      >
        <Loader2 className={`h-4 w-4 animate-spin ${mutedTextClass}`} />
        <span className={mutedTextClass}>加载中</span>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${userButtonClass}`}
        onClick={openLoginModal}
      >
        <UserRound className={`h-4.5 w-4.5 ${mutedTextClass}`} />
        <span>登录</span>
      </button>
    );
  }

  const label = user.displayName || user.username;

  return (
    <DropdownMenu open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${userButtonClass}`}
        >
          <UserRound className={`h-4.5 w-4.5 ${mutedTextClass}`} />
          <span>{label}</span>
          <ChevronDown className={`h-4 w-4 ${mutedTextClass}`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[280px] border-0 bg-transparent p-2 shadow-none"
      >
        <AccountProfileCard
          user={user}
          mutedTextClass={mutedTextClass}
          locale={locale}
          onLocaleChange={onLocaleChange}
          themePreference={themePreference}
          onThemeChange={onThemeChange}
          themeMounted={themeMounted}
          isDark={isDark}
          isMinecraft={isMinecraft}
          embedSubmenus
          onNavigate={() => setAccountMenuOpen(false)}
          onLogout={() => {
            setAccountMenuOpen(false);
            void logout();
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type MobileProps = ClassProps &
  AccountMenuPrefs & {
    onNavigate?: () => void;
    isDark: boolean;
  };

export function NavbarUserMobile({
  mutedTextClass,
  userButtonClass,
  locale,
  onLocaleChange,
  themePreference,
  onThemeChange,
  themeMounted,
  onNavigate,
  isDark,
}: MobileProps) {
  const { user, ready, openLoginModal, logout } = useUserAuth();
  const location = useLocation();

  const isMinecraft =
    location.pathname === "/minecraft" || location.pathname.startsWith("/minecraft/");

  const handleLoginClick = () => {
    onNavigate?.();
    openLoginModal();
  };

  if (!ready) {
    return (
      <div
        className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium opacity-60 ${userButtonClass}`}
      >
        <span className={`flex items-center gap-2.5 ${mutedTextClass}`}>
          <Loader2 className="h-4 w-4 animate-spin" />
          加载中
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${userButtonClass}`}
        onClick={handleLoginClick}
      >
        <span className="flex items-center gap-2.5">
          <UserRound className={`h-4.5 w-4.5 ${mutedTextClass}`} />
          <span>登录</span>
        </span>
        <ChevronDown className={`h-4 w-4 ${mutedTextClass}`} />
      </button>
    );
  }

  return (
    <div className="mt-1">
      <AccountProfileCard
        user={user}
        mutedTextClass={mutedTextClass}
        locale={locale}
        onLocaleChange={onLocaleChange}
        themePreference={themePreference}
        onThemeChange={onThemeChange}
        themeMounted={themeMounted}
        isDark={isDark}
        isMinecraft={isMinecraft}
        onNavigate={onNavigate}
        onLogout={() => {
          onNavigate?.();
          void logout();
        }}
      />
    </div>
  );
}
