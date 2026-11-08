const errors: string[] = [];

function readUrl(name: string): string {
  const raw: unknown = import.meta.env[name];
  if (typeof raw !== "string" || raw.trim() === "") {
    errors.push(`${name} is not set`);
    return "";
  }
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("unsupported protocol");
    }
    return url.toString().replace(/\/+$/, "");
  } catch {
    errors.push(`${name} must be an absolute http(s) URL`);
    return "";
  }
}

export const APP_NAME = "Wallet";

export const API_URLS = {
  auth: readUrl("VITE_AUTH_API_URL"),
  wallet: readUrl("VITE_WALLET_API_URL"),
} as const;

export type ServiceList = keyof typeof API_URLS;

export const PROJECT_SLUG = "wallet";

const CONSOLE_URL = readUrl("VITE_CONSOLE_URL");

export function loginUrl(next: string): string {
  const url = new URL("/login", CONSOLE_URL || window.location.origin);
  url.searchParams.set("redirect", PROJECT_SLUG);
  if (next.startsWith("/") && !next.startsWith("//")) {
    url.searchParams.set("next", next);
  }
  return url.toString();
}

export const CONSOLE_HOME_URL = CONSOLE_URL || null;

export const ENV_ERRORS: readonly string[] = errors;
