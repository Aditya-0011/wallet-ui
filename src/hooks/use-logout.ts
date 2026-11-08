import { useQueryClient } from "@tanstack/react-query";

import { useDataMutation } from "@/api/handler";
import { authStore } from "@/lib/auth";
import type { SimpleResponse } from "@/lib/objects";

export function useLogout() {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useDataMutation<null, SimpleResponse>(
    "auth",
    "/logout",
    false,
    {
      onSuccess: () => {
        queryClient.clear();
        authStore.logout();
      },
    },
  );
  return { logout: () => mutate(null), isPending };
}
