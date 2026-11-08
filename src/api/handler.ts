import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import { API_URLS, type ServiceList } from "@/lib/env";
import { FetchError } from "@/lib/errors";

export type RequestMethod = "GET" | "POST" | "QUERY";
type ResponseKind = "json" | "text" | "blob";

export type BlobResponse = {
  file_data: Blob;
  file_name: string;
  content_type: string;
};

export type RequestMeta = {
  skipAuthErrorHandling?: boolean;
};

export const OFFLINE_MESSAGE =
  "You appear to be offline. Check your connection and try again.";
export const RATE_LIMIT_MESSAGE = "Too many attempts, try again in a minute.";

const MAX_RETRIES = 2;

export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  return (
    error instanceof FetchError && (error.status === 0 || error.status >= 500)
  );
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof FetchError && error.status === 404;
}

export function describeError(error: unknown): string {
  if (error instanceof FetchError) {
    if (error.status === 0) return OFFLINE_MESSAGE;
    if (error.status === 429) return RATE_LIMIT_MESSAGE;
    return error.message || `Request failed (${error.status})`;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong";
}

export function parseContentDispositionFilename(
  header: string | null,
): string | null {
  if (!header) return null;
  let name: string | null = null;
  const extended = /filename\*\s*=\s*([^']*)'[^']*'([^;]+)/i.exec(header);
  if (extended) {
    try {
      name = decodeURIComponent(extended[2].trim().replace(/^"|"$/g, ""));
    } catch {
      name = null;
    }
  }
  if (!name) {
    const quoted = /filename\s*=\s*"((?:\\.|[^"\\])*)"/i.exec(header);
    if (quoted) name = quoted[1].replace(/\\(.)/g, "$1");
  }
  if (!name) {
    const plain = /filename\s*=\s*([^;]+)/i.exec(header);
    if (plain) name = plain[1].trim();
  }
  if (!name) return null;
  const safe = name.replace(/[/\\]/g, "_").trim();
  return safe || null;
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text);
    return typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

async function readErrorMessage(res: Response): Promise<string> {
  const text = (await res.text().catch(() => "")).trim();
  const body = text.startsWith("{") ? parseJsonObject(text) : null;
  if (typeof body?.message === "string" && body.message) return body.message;
  if (typeof body?.error === "string" && body.error) return body.error;
  return text || res.statusText || `Request failed (${res.status})`;
}

export async function apiFetch<TResponse>(
  app: ServiceList,
  url: string,
  {
    method = "GET",
    body,
    kind = "json",
    signal,
  }: {
    method?: RequestMethod;
    body?: unknown;
    kind?: ResponseKind;
    signal?: AbortSignal;
  } = {},
): Promise<TResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URLS[app]}${url}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "GET" ? undefined : JSON.stringify(body ?? {}),
      credentials: "include",
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new FetchError(OFFLINE_MESSAGE, 0);
  }

  if (!res.ok) {
    throw new FetchError(await readErrorMessage(res), res.status);
  }

  if (kind === "blob") {
    const file: BlobResponse = {
      file_name:
        parseContentDispositionFilename(
          res.headers.get("Content-Disposition"),
        ) ?? "download",
      content_type:
        res.headers.get("Content-Type") || "application/octet-stream",
      file_data: await res.blob(),
    };
    return file as TResponse;
  }

  if (kind === "text") {
    return (await res.text()) as TResponse;
  }

  try {
    return (await res.json()) as TResponse;
  } catch {
    throw new FetchError("Invalid response from server", res.status);
  }
}

export function useDataQuery<Request, Response>(
  app: ServiceList,
  key: QueryKey,
  url: string,
  textOnlyResponse: boolean,
  options?: {
    staleTime?: number;
    refetchInterval?: number;
    skipAuthErrorHandling?: boolean;
    enabled?: boolean;
    isQuery?: boolean;
    variables?: Request;
    keepPreviousData?: boolean;
    isBlob?: boolean;
  },
) {
  const variables = options?.variables;
  const isQuery = options?.isQuery ?? false;
  const kind: ResponseKind = options?.isBlob
    ? "blob"
    : textOnlyResponse
      ? "text"
      : "json";
  const meta: RequestMeta = {
    skipAuthErrorHandling: options?.skipAuthErrorHandling,
  };

  return useQuery<Response, FetchError>({
    queryKey: [...key, app, url, kind, isQuery ? (variables ?? null) : null],
    queryFn: ({ signal }) =>
      apiFetch<Response>(app, url, {
        method: isQuery ? "QUERY" : "GET",
        body: isQuery ? variables : undefined,
        kind,
        signal,
      }),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime,
    refetchInterval: options?.refetchInterval,
    placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
    meta,
  });
}

export function useDataMutation<Request, Response>(
  app: ServiceList,
  url: string,
  textOnlyResponse: boolean,
  options?: {
    invalidateKey?: QueryKey[];
    onSuccess?: (data: Response, variables: Request) => void;
    skipAuthErrorHandling?: boolean;
  },
) {
  const queryClient = useQueryClient();
  const meta: RequestMeta = {
    skipAuthErrorHandling: options?.skipAuthErrorHandling,
  };

  const mutation = useMutation<Response, FetchError, Request>({
    mutationFn: (variables) =>
      apiFetch<Response>(app, url, {
        method: "POST",
        body: variables,
        kind: textOnlyResponse ? "text" : "json",
      }),
    onSuccess: async (data, variables) => {
      options?.onSuccess?.(data, variables);
      if (options?.invalidateKey) {
        await Promise.all(
          options.invalidateKey.map((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
          ),
        );
      }
    },
    meta,
  });

  const submit = (variables: Request): Promise<boolean> =>
    mutation.mutateAsync(variables).then(
      () => true,
      () => false,
    );

  return { ...mutation, submit };
}
