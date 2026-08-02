import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import {
  FetchError,
  type RequestMethod,
  type ServiceApiMapping,
  type ServiceList,
} from "@/lib/objects";
import { toast } from "sonner";

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;
const WALLET_API_URL = import.meta.env.VITE_WALLET_API_URL;
const CONSOLE_URL = import.meta.env.VITE_CONSOLE_URL;

const appApiMapping: ServiceApiMapping = {
  auth: AUTH_API_URL,
  wallet: WALLET_API_URL,
};

async function fetcher<Request, Response>(
  app: ServiceList,
  url: string,
  variables: Request | undefined,
  method: RequestMethod,
  textOnlyResponse: boolean,
): Promise<Response> {
  try {
    const res = await fetch(`${appApiMapping[app]}${url}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: variables ? JSON.stringify(variables) : undefined,
      credentials: "include",
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new FetchError(msg || res.statusText, res.status);
    }

    if (textOnlyResponse) {
      return (await res.text()) as unknown as Response;
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof FetchError) throw err;
    const message =
      err instanceof Error ? err.message : "Network request failed";
    throw new FetchError(message, 0);
  }
}

export function useDataQuery<Request, Response>(
  app: ServiceList,
  key: QueryKey,
  url: string,
  textOnlyResponse: boolean,
  options?: {
    invalidateKey?: QueryKey[];
    staleTime?: number;
    refetchInterval?: number;
    onSuccess?: (data: Response) => void;
    skipAuthErrorHandling?: boolean;
    enabled?: boolean;
    isQuery?: boolean;
    variables?: Request;
  },
) {
  const { logout } = useAuth();

  return useQuery<Response, Error>({
    queryKey: options?.variables
      ? [...key, options.variables, url, app, textOnlyResponse]
      : [...key, url, app, textOnlyResponse],
    queryFn: () =>
      fetcher<Request, Response>(
        app,
        url,
        options?.variables,
        options?.isQuery ? "QUERY" : "GET",
        textOnlyResponse,
      ),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 30 * 60 * 1000,
    refetchInterval: options?.refetchInterval,
    retry: (failureCount, error) => {
      if (error instanceof FetchError) {
        if (
          error.status === 401 ||
          error.status === 404 ||
          error.status === 0
        ) {
          return false;
        }
      }
      return failureCount < 3;
    },
    meta: {
      onSuccess: options?.onSuccess,
      invalidateKey: options?.invalidateKey,
      skipAuthErrorHandling: options?.skipAuthErrorHandling,
      logout,
    },
  });
}

export function useDataMutation<Request, Response>(
  app: ServiceList,
  url: string,
  textOnlyResponse: boolean,
  options?: {
    invalidateKey?: QueryKey[];
    onSuccess?: (data: Response) => void;
    key?: QueryKey;
  },
) {
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  return useMutation<Response, FetchError, Request>({
    mutationFn: (variables) =>
      fetcher<Request, Response>(app, url, variables, "POST", textOnlyResponse),
    onSuccess: (data) => {
      if (options?.onSuccess) options.onSuccess(data);
      if (options?.invalidateKey) {
        for (const key of options.invalidateKey) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
    },
    onError: (error) => {
      if (error instanceof FetchError) {
        if (error.status === 401 || error.status === 0) {
          queryClient.clear();
          logout();
          toast.error(error.message);
          window.location.href = `${CONSOLE_URL}/login?redirect=Manager`;
          return;
        }
        toast.error(error.message);
      }
    },
  });
}
