import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  describeError,
  isNotFoundError,
  shouldRetry,
  type RequestMeta,
} from "@/api/handler";
import { authStore, recheckSession } from "@/lib/auth";
import { FetchError } from "@/lib/errors";

function endSession() {
  queryClient.clear();
  authStore.logout();
  toast.error("Your session has ended. Please log in again.", {
    id: "session-ended",
  });
}

function handleError(error: unknown, meta: RequestMeta | undefined) {
  if (
    error instanceof FetchError &&
    error.status === 401 &&
    !meta?.skipAuthErrorHandling
  ) {
    endSession();
    return;
  }
  if (
    error instanceof FetchError &&
    error.status === 403 &&
    !meta?.skipAuthErrorHandling
  ) {
    void recheckSession();
  }
  const message = describeError(error);
  toast.error(message, { id: message });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 0,
      staleTime: 5 * 60 * 1000,
      retry: shouldRetry,
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (isNotFoundError(error)) return;
      handleError(error, query.meta as RequestMeta | undefined);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      handleError(error, mutation.meta as RequestMeta | undefined);
    },
  }),
});
