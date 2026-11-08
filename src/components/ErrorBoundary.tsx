import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        role="alert"
        className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 p-6 text-center text-white"
      >
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-neutral-400">
          This page failed to render. Reloading usually fixes it, especially
          right after a new version was deployed.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md border border-neutral-600 px-4 py-2 text-sm font-medium hover:bg-neutral-800"
        >
          Reload
        </button>
      </div>
    );
  }
}
