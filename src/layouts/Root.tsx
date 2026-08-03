import { useDataQuery } from "@/api/handler";
import { Loading } from "@/components/Loading";
import { Navigation } from "@/components/Navigation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { type UserSummaryResponse } from "@/lib/objects";
import { useEffect } from "react";
import { Outlet, useSearchParams } from "react-router";
import { Toaster } from "sonner";

const CONSOLE_URL = import.meta.env.VITE_CONSOLE_URL;

export function RootLayout() {
  const { isAuthenticated, login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const authParam = searchParams.get("auth");

  const { isError } = useDataQuery<null, UserSummaryResponse>(
    "wallet",
    ["session", "validate"],
    "/user/summary",
    false,
    {
      enabled: authParam === "success",
      skipAuthErrorHandling: true,
      onSuccess: () => {
        login();
        setSearchParams(
          (prev) => {
            prev.delete("auth");
            return prev;
          },
          { replace: true },
        );
      },
    },
  );

  useEffect(() => {
    if (authParam === "success") {
      if (isError) {
        console.error("Session validation failed.");
        setSearchParams(
          (prev) => {
            prev.delete("auth");
            return prev;
          },
          { replace: true },
        );
      }
    } else if (!isAuthenticated) {
      window.location.href = `${CONSOLE_URL}/login?redirect=Wallet`;
    }
  }, [authParam, isError, isAuthenticated, setSearchParams]);

  if (authParam === "success" || !isAuthenticated) {
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
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center bg-neutral-950/50 px-4 backdrop-blur-sm">
            <SidebarTrigger className="h-10 w-10 text-white hover:bg-neutral-800" />
          </header>

          <div className="flex flex-1 flex-col p-4">
            <Toaster richColors expand />
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
