import { useEffect } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router";

import { useAuth } from "@/contexts/AuthContext";
import { loginUrl } from "@/lib/env";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loading } from "@/components/Loading";
import { Navigation } from "@/components/Navigation";
import { NoAccess } from "@/components/NoAccess";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function RootLayout() {
  const { isAuthenticated, isVerifying, identity, access } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname, search } = useLocation();
  const hasAuthParam = searchParams.has("auth");
  const mustLeave =
    !isVerifying && (!isAuthenticated || access === "password-change");

  useEffect(() => {
    if (isVerifying || !hasAuthParam) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("auth");
        return next;
      },
      { replace: true },
    );
  }, [isVerifying, hasAuthParam, setSearchParams]);

  useEffect(() => {
    if (!mustLeave) return;
    const params = new URLSearchParams(search);
    params.delete("auth");
    const query = params.toString();
    window.location.assign(loginUrl(pathname + (query ? `?${query}` : "")));
  }, [mustLeave, pathname, search]);

  if (access === "denied") {
    return <NoAccess email={identity?.email ?? null} />;
  }

  if (!isAuthenticated || access === "password-change") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-center">
        <Loading content="session" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider className="bg-neutral-950" defaultOpen={false}>
        <Navigation />
        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center bg-neutral-950/50 px-4 backdrop-blur-sm">
            <SidebarTrigger
              aria-label="Toggle navigation"
              className="h-10 w-10 text-white hover:bg-neutral-800"
            />
          </header>

          <main className="flex flex-1 flex-col p-4">
            <ErrorBoundary key={pathname}>
              <Outlet />
            </ErrorBoundary>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
