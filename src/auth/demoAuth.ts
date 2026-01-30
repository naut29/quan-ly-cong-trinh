import { users } from "@/data/mockData";

export const DEMO_USERS = users;

const DEMO_SESSION_KEY = "demo_auth_session";

export interface DemoSession {
  userId: string;
  createdAt: string;
}

export const demoSignIn = (userId: string): DemoSession | null => {
  const user = DEMO_USERS.find((u) => u.id === userId);
  if (!user) return null;

  const session: DemoSession = {
    userId,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  return session;
};

export const demoGetSession = (): DemoSession | null => {
  const raw = localStorage.getItem(DEMO_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoSession;
  } catch {
    localStorage.removeItem(DEMO_SESSION_KEY);
    return null;
  }
};

export const demoSignOut = () => {
  localStorage.removeItem(DEMO_SESSION_KEY);
};
