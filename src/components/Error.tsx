import { AlertTriangle } from "lucide-react";

import { Button } from "./ui/button";

type ErrorProps = {
  content: string;
  onRetry?: () => void;
};

export function Error({ content, onRetry }: ErrorProps) {
  return (
    <div
      role="alert"
      className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-6 p-6 md:p-10"
    >
      <div
        aria-hidden="true"
        className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)] ring-1 ring-red-500/20"
      >
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>

      <div className="space-y-2 text-center">
        <h3 className="text-xl font-semibold text-white">
          Unable to load {content}
        </h3>
        <p className="text-muted-foreground text-sm">
          An error occurred while fetching the data. Please try again.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => (onRetry ? onRetry() : window.location.reload())}
          className="border-amber-500/20 bg-amber-500/5 text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400"
        >
          Retry
        </Button>
      </div>
    </div>
  );
}
