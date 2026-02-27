import { users } from "@/data/mockData";
import { DEMO_STORAGE_PREFIX } from "@/lib/demoStorage";

export const DEMO_USERS = users;
export const DEFAULT_DEMO_USER_ID = "user-super";

const LEGACY_DEMO_SESSION_KEY = "demo_auth_session";
export const DEMO_SESSION_KEY = `${DEMO_STORAGE_PREFIX}session`;

export interface DemoSession {
  userId: string;
  createdAt: string;
}

const getSessionStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

export const demoSignIn = (userId: string): DemoSession | null => {
  const user = DEMO_USERS.find((u) => u.id === userId);
  if (!user) return null;

  const session: DemoSession = {
    userId,
    createdAt: new Date().toISOString(),
  };
  const storage = getSessionStorage();
  storage?.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  storage?.removeItem(LEGACY_DEMO_SESSION_KEY);
  return session;
};

export const demoGetSession = (): DemoSession | null => {
  const storage = getSessionStorage();
  const raw = storage?.getItem(DEMO_SESSION_KEY) ?? storage?.getItem(LEGACY_DEMO_SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as DemoSession;
    storage?.setItem(DEMO_SESSION_KEY, raw);
    storage?.removeItem(LEGACY_DEMO_SESSION_KEY);
    return session;
  } catch {
    storage?.removeItem(DEMO_SESSION_KEY);
    storage?.removeItem(LEGACY_DEMO_SESSION_KEY);
    return null;
  }
};

export const purgeDemoSession = () => {
  const storage = getSessionStorage();
  storage?.removeItem(DEMO_SESSION_KEY);
  storage?.removeItem(LEGACY_DEMO_SESSION_KEY);
};

export const demoSignOut = purgeDemoSession;
