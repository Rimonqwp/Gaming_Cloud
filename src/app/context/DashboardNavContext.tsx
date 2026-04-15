import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { USER_DASHBOARD_NAV_TABS, type UserDashboardTabId } from "../config/userDashboardNavTabs";
import {
  DEFAULT_SUPPORTED_CURRENCY,
  normalizeSupportedCurrency,
  type SupportedCurrency,
} from "../lib/currency";
import { getUserPreferences, patchUserPreferences, type UserAccountPreferences } from "../lib/userAuth";
import { useUserAuth } from "./UserAuthContext";

const STORAGE_KEY = "eggcloud.dashboardNavbarMode";
const PLACEMENT_KEY = "eggcloud.dashboardNavPlacement";
const ACTIVE_TAB_KEY = "eggcloud.dashboardActiveTab";
const MAIN_NAVBAR_HIDDEN_KEY = "eggcloud.mainNavbarHidden";
const PREFERRED_CURRENCY_KEY = "eggcloud.preferredCurrency";
const PREVIEW_BASE_CURRENCY_KEY = "eggcloud.previewBaseCurrency";

const VALID_TAB_IDS = new Set<string>(USER_DASHBOARD_NAV_TABS.map((tab) => tab.id));

export type DashboardNavbarMode = "site" | "console";
export type DashboardNavPlacement = "navbar_embed" | "below_navbar" | "bottom_float";

type DashboardNavContextValue = {
  activeTab: UserDashboardTabId;
  setActiveTab: (tab: UserDashboardTabId) => void;
  dashboardNavbarMode: DashboardNavbarMode;
  setDashboardNavbarMode: (mode: DashboardNavbarMode) => void;
  dashboardNavPlacement: DashboardNavPlacement;
  setDashboardNavPlacement: (placement: DashboardNavPlacement) => void;
  mainNavbarHidden: boolean;
  setMainNavbarHidden: (hidden: boolean) => void;
  preferredCurrency: SupportedCurrency;
  setPreferredCurrency: (currency: SupportedCurrency) => void;
  previewBaseCurrency: SupportedCurrency;
  setPreviewBaseCurrency: (currency: SupportedCurrency) => void;
  dashboardAuxDrawerOpen: boolean;
  setDashboardAuxDrawerOpen: (open: boolean) => void;
};

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null);

function readStoredMode(): DashboardNavbarMode {
  if (typeof window === "undefined") {
    return "console";
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) === "site" ? "site" : "console";
  } catch {
    return "console";
  }
}

function readStoredPlacement(): DashboardNavPlacement {
  if (typeof window === "undefined") {
    return "navbar_embed";
  }

  try {
    const raw = window.localStorage.getItem(PLACEMENT_KEY);
    if (raw === "navbar_embed" || raw === "below_navbar" || raw === "bottom_float") {
      return raw;
    }
  } catch {
    /* ignore */
  }

  return "navbar_embed";
}

function readStoredMainNavbarHidden(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(MAIN_NAVBAR_HIDDEN_KEY) === "true";
  } catch {
    return false;
  }
}

function readStoredActiveTab(): UserDashboardTabId {
  if (typeof window === "undefined") {
    return "overview";
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_TAB_KEY);
    if (raw && VALID_TAB_IDS.has(raw)) {
      return raw as UserDashboardTabId;
    }
  } catch {
    /* ignore */
  }

  return "overview";
}

function readStoredCurrency(key: string): SupportedCurrency {
  if (typeof window === "undefined") {
    return DEFAULT_SUPPORTED_CURRENCY;
  }

  try {
    return normalizeSupportedCurrency(window.localStorage.getItem(key), DEFAULT_SUPPORTED_CURRENCY);
  } catch {
    return DEFAULT_SUPPORTED_CURRENCY;
  }
}

export function DashboardNavProvider({ children }: { children: ReactNode }) {
  const { token, ready } = useUserAuth();
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;

  const [activeTab, setActiveTabState] = useState<UserDashboardTabId>(readStoredActiveTab);
  const [dashboardNavbarMode, setDashboardNavbarModeState] =
    useState<DashboardNavbarMode>(readStoredMode);
  const [dashboardNavPlacement, setDashboardNavPlacementState] =
    useState<DashboardNavPlacement>(readStoredPlacement);
  const [mainNavbarHidden, setMainNavbarHiddenState] = useState(readStoredMainNavbarHidden);
  const [preferredCurrency, setPreferredCurrencyState] =
    useState<SupportedCurrency>(() => readStoredCurrency(PREFERRED_CURRENCY_KEY));
  const [previewBaseCurrency, setPreviewBaseCurrencyState] =
    useState<SupportedCurrency>(() => readStoredCurrency(PREVIEW_BASE_CURRENCY_KEY));
  const [dashboardAuxDrawerOpen, setDashboardAuxDrawerOpenState] = useState(false);

  useEffect(() => {
    if (!ready || !token) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { preferences } = await getUserPreferences(token);
        if (cancelled) {
          return;
        }

        if (preferences.dashboardNavbarMode === "site" || preferences.dashboardNavbarMode === "console") {
          setDashboardNavbarModeState(preferences.dashboardNavbarMode);
          try {
            window.localStorage.setItem(STORAGE_KEY, preferences.dashboardNavbarMode);
          } catch {
            /* ignore */
          }
        }

        if (
          preferences.dashboardNavPlacement === "navbar_embed" ||
          preferences.dashboardNavPlacement === "below_navbar" ||
          preferences.dashboardNavPlacement === "bottom_float"
        ) {
          setDashboardNavPlacementState(preferences.dashboardNavPlacement);
          try {
            window.localStorage.setItem(PLACEMENT_KEY, preferences.dashboardNavPlacement);
          } catch {
            /* ignore */
          }
        }

        if (preferences.dashboardActiveTab && VALID_TAB_IDS.has(preferences.dashboardActiveTab)) {
          setActiveTabState(preferences.dashboardActiveTab as UserDashboardTabId);
          try {
            window.localStorage.setItem(ACTIVE_TAB_KEY, preferences.dashboardActiveTab);
          } catch {
            /* ignore */
          }
        }

        if (typeof preferences.mainNavbarHidden === "boolean") {
          setMainNavbarHiddenState(preferences.mainNavbarHidden);
          try {
            window.localStorage.setItem(
              MAIN_NAVBAR_HIDDEN_KEY,
              preferences.mainNavbarHidden ? "true" : "false",
            );
          } catch {
            /* ignore */
          }
        }

        const nextPreferredCurrency = normalizeSupportedCurrency(
          preferences.preferredCurrency,
          DEFAULT_SUPPORTED_CURRENCY,
        );
        setPreferredCurrencyState(nextPreferredCurrency);
        try {
          window.localStorage.setItem(PREFERRED_CURRENCY_KEY, nextPreferredCurrency);
        } catch {
          /* ignore */
        }

        const nextPreviewBaseCurrency = normalizeSupportedCurrency(
          preferences.previewBaseCurrency,
          DEFAULT_SUPPORTED_CURRENCY,
        );
        setPreviewBaseCurrencyState(nextPreviewBaseCurrency);
        try {
          window.localStorage.setItem(PREVIEW_BASE_CURRENCY_KEY, nextPreviewBaseCurrency);
        } catch {
          /* ignore */
        }
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, token]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.newValue === null) {
        return;
      }

      if (event.key === STORAGE_KEY) {
        setDashboardNavbarModeState(event.newValue === "site" ? "site" : "console");
        return;
      }

      if (event.key === PLACEMENT_KEY) {
        if (
          event.newValue === "navbar_embed" ||
          event.newValue === "below_navbar" ||
          event.newValue === "bottom_float"
        ) {
          setDashboardNavPlacementState(event.newValue);
        }
        return;
      }

      if (event.key === ACTIVE_TAB_KEY && VALID_TAB_IDS.has(event.newValue)) {
        setActiveTabState(event.newValue as UserDashboardTabId);
        return;
      }

      if (event.key === MAIN_NAVBAR_HIDDEN_KEY) {
        setMainNavbarHiddenState(event.newValue === "true");
        return;
      }

      if (event.key === PREFERRED_CURRENCY_KEY) {
        setPreferredCurrencyState(
          normalizeSupportedCurrency(event.newValue, DEFAULT_SUPPORTED_CURRENCY),
        );
        return;
      }

      if (event.key === PREVIEW_BASE_CURRENCY_KEY) {
        setPreviewBaseCurrencyState(
          normalizeSupportedCurrency(event.newValue, DEFAULT_SUPPORTED_CURRENCY),
        );
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persistRemote = useCallback(async (patch: Partial<UserAccountPreferences>) => {
    const currentToken = tokenRef.current;
    if (!currentToken) {
      return;
    }

    try {
      await patchUserPreferences(currentToken, patch);
    } catch {
      /* ignore */
    }
  }, []);

  const setActiveTab = useCallback(
    (tab: UserDashboardTabId) => {
      setActiveTabState(tab);
      try {
        window.localStorage.setItem(ACTIVE_TAB_KEY, tab);
      } catch {
        /* ignore */
      }
      void persistRemote({ dashboardActiveTab: tab });
    },
    [persistRemote],
  );

  const setDashboardNavbarMode = useCallback(
    (mode: DashboardNavbarMode) => {
      setDashboardNavbarModeState(mode);
      try {
        window.localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        /* ignore */
      }
      void persistRemote({ dashboardNavbarMode: mode });
    },
    [persistRemote],
  );

  const setDashboardNavPlacement = useCallback(
    (placement: DashboardNavPlacement) => {
      setDashboardNavPlacementState(placement);
      try {
        window.localStorage.setItem(PLACEMENT_KEY, placement);
      } catch {
        /* ignore */
      }
      void persistRemote({ dashboardNavPlacement: placement });
    },
    [persistRemote],
  );

  const setMainNavbarHidden = useCallback(
    (hidden: boolean) => {
      setMainNavbarHiddenState(hidden);
      if (!hidden) {
        setDashboardAuxDrawerOpenState(false);
      }
      try {
        window.localStorage.setItem(MAIN_NAVBAR_HIDDEN_KEY, hidden ? "true" : "false");
      } catch {
        /* ignore */
      }
      void persistRemote({ mainNavbarHidden: hidden });
    },
    [persistRemote],
  );

  const setPreferredCurrency = useCallback(
    (currency: SupportedCurrency) => {
      setPreferredCurrencyState(currency);
      try {
        window.localStorage.setItem(PREFERRED_CURRENCY_KEY, currency);
      } catch {
        /* ignore */
      }
      void persistRemote({ preferredCurrency: currency });
    },
    [persistRemote],
  );

  const setPreviewBaseCurrency = useCallback(
    (currency: SupportedCurrency) => {
      setPreviewBaseCurrencyState(currency);
      try {
        window.localStorage.setItem(PREVIEW_BASE_CURRENCY_KEY, currency);
      } catch {
        /* ignore */
      }
      void persistRemote({ previewBaseCurrency: currency });
    },
    [persistRemote],
  );

  const setDashboardAuxDrawerOpen = useCallback((open: boolean) => {
    setDashboardAuxDrawerOpenState(open);
  }, []);

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      dashboardNavbarMode,
      setDashboardNavbarMode,
      dashboardNavPlacement,
      setDashboardNavPlacement,
      mainNavbarHidden,
      setMainNavbarHidden,
      preferredCurrency,
      setPreferredCurrency,
      previewBaseCurrency,
      setPreviewBaseCurrency,
      dashboardAuxDrawerOpen,
      setDashboardAuxDrawerOpen,
    }),
    [
      activeTab,
      setActiveTab,
      dashboardNavbarMode,
      setDashboardNavbarMode,
      dashboardNavPlacement,
      setDashboardNavPlacement,
      mainNavbarHidden,
      setMainNavbarHidden,
      preferredCurrency,
      setPreferredCurrency,
      previewBaseCurrency,
      setPreviewBaseCurrency,
      dashboardAuxDrawerOpen,
      setDashboardAuxDrawerOpen,
    ],
  );

  return <DashboardNavContext.Provider value={value}>{children}</DashboardNavContext.Provider>;
}

export function useDashboardNav(): DashboardNavContextValue {
  const context = useContext(DashboardNavContext);
  if (!context) {
    throw new Error("useDashboardNav must be used within DashboardNavProvider");
  }
  return context;
}
