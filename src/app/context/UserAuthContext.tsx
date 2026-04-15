import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getUserSession,
  loginUser as loginUserApi,
  registerUser as registerUserApi,
  logoutUser as logoutUserApi,
  type UserPublic,
} from "../lib/userAuth";

const STORAGE_KEY = "user.auth.token";

type UserAuthState = {
  user: UserPublic | null;
  token: string | null;
  ready: boolean;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  openLoginModal: () => void;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: string;
  clearAuthError: () => void;
  submitting: boolean;
  updateUser: (patch: Partial<UserPublic> | ((current: UserPublic | null) => UserPublic | null)) => void;
};

const UserAuthContext = createContext<UserAuthState | null>(null);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const session = await getUserSession(saved);
        if (cancelled) return;
        setToken(saved);
        setUser(session.user);
      } catch {
        if (!cancelled) {
          window.localStorage.removeItem(STORAGE_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    setAuthError("");
    setSubmitting(true);
    try {
      const result = await loginUserApi(identifier, password);
      window.localStorage.setItem(STORAGE_KEY, result.token);
      setToken(result.token);
      setUser(result.user);
      setLoginModalOpen(false);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "登入失敗");
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setAuthError("");
    setSubmitting(true);
    try {
      const result = await registerUserApi(username, email, password);
      window.localStorage.setItem(STORAGE_KEY, result.token);
      setToken(result.token);
      setUser(result.user);
      setLoginModalOpen(false);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Registration failed.");
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const t = token ?? window.localStorage.getItem(STORAGE_KEY);
    if (t) {
      try {
        await logoutUserApi(t);
      } catch {
        // 仍清除前端狀態
      }
    }
    window.localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  const openLoginModal = useCallback(() => {
    setAuthError("");
    setLoginModalOpen(true);
  }, []);

  const clearAuthError = useCallback(() => setAuthError(""), []);

  const updateUser = useCallback(
    (
      patch: Partial<UserPublic> | ((current: UserPublic | null) => UserPublic | null),
    ) => {
      setUser((current) => {
        if (typeof patch === "function") {
          return patch(current);
        }
        if (!current) {
          return current;
        }
        return { ...current, ...patch };
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      loginModalOpen,
      setLoginModalOpen,
      openLoginModal,
      login,
      register,
      logout,
      authError,
      clearAuthError,
      submitting,
      updateUser,
    }),
    [
      user,
      token,
      ready,
      loginModalOpen,
      login,
      register,
      logout,
      authError,
      submitting,
      openLoginModal,
      updateUser,
    ],
  );

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) {
    throw new Error("useUserAuth must be used within UserAuthProvider");
  }
  return ctx;
}
