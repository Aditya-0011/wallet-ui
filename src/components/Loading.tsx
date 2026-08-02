import { Cpu, Loader2 } from "lucide-react";

export function Loading({ content }: { content?: string } = {}) {
  const isBuilding = !content;

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full shadow-[0_0_30px_-10px] ring-1 ${
          isBuilding
            ? "bg-sky-500/10 shadow-sky-500/20 ring-sky-500/20"
            : "bg-amber-500/10 shadow-amber-500/20 ring-amber-500/20"
        }`}
      >
        {isBuilding ? (
          <Cpu className="h-10 w-10 animate-pulse text-sky-500" />
        ) : (
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        )}
      </div>

      <div className="space-y-2 text-center">
        <h3 className="text-xl font-semibold text-white">
          {content ? `Loading ${content}...` : "Building page..."}
        </h3>
        <p className="text-muted-foreground text-sm">
          {content
            ? "Fetching latest information from the server."
            : "Upgrade your machine for a faster build time."}
        </p>
      </div>
    </div>
  );
}
