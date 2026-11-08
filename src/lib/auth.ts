import { API_URLS, PROJECT_SLUG } from "@/lib/env";
import { readStorage, writeStorage } from "@/lib/storage";

const STORAGE_KEY = "isAuthenticated";
const ROLE_ADMIN = 1;

export type Identity = {
  user_id: number;
  email: string;
  role: number;
  must_change_password: boolean;
  projects: string[];
};

export type Access = "granted" | "denied" | "password-change";

export type AuthSnapshot = {
  isAuthenticated: boolean;
  isVerifying: boolean;
  identity: Identity | null;
  access: Access | null;
};

function readHint(): boolean {
  return readStorage("localStorage", STORAGE_KEY) === "true";
}

function writeHint(value: boolean) {
  writeStorage("localStorage", STORAGE_KEY, String(value));
}

function accessOf(identity: Identity): Access {
  if (identity.must_change_password) return "password-change";
  if (
    identity.role === ROLE_ADMIN ||
    identity.projects.includes(PROJECT_SLUG)
  ) {
    return "granted";
  }
  return "denied";
}

let snapshot: AuthSnapshot = {
  isAuthenticated: readHint(),
  isVerifying: true,
  identity: null,
  access: null,
};

const listeners = new Set<() => void>();

function update(next: Partial<AuthSnapshot>) {
  snapshot = { ...snapshot, ...next };
  for (const listener of listeners) listener();
}

function signIn(identity: Identity) {
  writeHint(true);
  update({ isAuthenticated: true, identity, access: accessOf(identity) });
}

function signOut() {
  writeHint(false);
  update({ isAuthenticated: false, identity: null, access: null });
}

export const authStore = {
  getSnapshot: (): AuthSnapshot => snapshot,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  logout: signOut,
};

window.addEventListener("storage", (event) => {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  const isAuthenticated = event.newValue === "true";
  if (isAuthenticated === snapshot.isAuthenticated) return;
  if (isAuthenticated) {
    void recheckSession();
  } else {
    update({ isAuthenticated: false, identity: null, access: null });
  }
});

let verification: Promise<void> | null = null;

export function verifySession(): Promise<void> {
  verification ??= (async () => {
    try {
      const res = await fetch(`${API_URLS.auth}/session`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const body = (await res.json()) as Identity;
        signIn({
          user_id: body.user_id,
          email: body.email,
          role: body.role,
          must_change_password: body.must_change_password,
          projects: body.projects ?? [],
        });
      } else if (res.status === 401) {
        signOut();
      }
    } catch {
      verification = null;
    } finally {
      update({ isVerifying: false });
    }
  })();
  return verification;
}

export function recheckSession(): Promise<void> {
  if (verification && snapshot.isVerifying) return verification;
  verification = null;
  update({ isVerifying: true });
  return verifySession();
}
