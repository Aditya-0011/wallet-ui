import { useSyncExternalStore } from "react";

import { authStore } from "@/lib/auth";

export function useAuth() {
  const { isAuthenticated, isVerifying, identity, access } =
    useSyncExternalStore(authStore.subscribe, authStore.getSnapshot);
  return {
    isAuthenticated,
    isVerifying,
    identity,
    access,
    logout: authStore.logout,
  };
}
