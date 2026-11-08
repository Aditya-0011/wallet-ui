import { LogOut, ShieldOff } from "lucide-react";

import { useLogout } from "@/hooks/use-logout";
import { CONSOLE_HOME_URL } from "@/lib/env";

import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export function NoAccess({ email }: { email: string | null }) {
  const { logout, isPending } = useLogout();

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-neutral-950 p-6 text-white">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div
          aria-hidden="true"
          className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 shadow-[0_0_30px_-10px] ring-1 shadow-amber-500/20 ring-amber-500/20"
        >
          <ShieldOff className="h-10 w-10 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Wallet isn't available</h1>
          <p className="text-muted-foreground text-sm break-words">
            {email ? `${email} doesn't` : "Your account doesn't"} have access to
            Wallet right now. It may not have been shared with you, or it is
            under maintenance.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {CONSOLE_HOME_URL && (
            <a
              href={CONSOLE_HOME_URL}
              className={cn(
                buttonVariants(),
                "bg-amber-500 text-neutral-950 hover:bg-amber-400",
              )}
            >
              Open Console
            </a>
          )}
          <Button
            variant="outline"
            onClick={logout}
            disabled={isPending}
            className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
          >
            <LogOut aria-hidden="true" />
            {isPending ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </div>
    </main>
  );
}
