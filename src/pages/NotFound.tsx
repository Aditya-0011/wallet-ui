import { Link } from "react-router";

import { Home, ArrowLeft } from "lucide-react";

import { isNotFoundError, useDataQuery } from "@/api/handler";

import { Loading } from "@/components/Loading";
import { Error } from "@/components/Error";

export default function NotFound() {
  const { data, isLoading, error } = useDataQuery<null, string>(
    "auth",
    ["random"],
    "/random",
    true,
    { staleTime: 15 * 1000, skipAuthErrorHandling: true },
  );

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-center">
        <Loading content="custom slur" />
      </div>
    );
  }

  const content = isNotFoundError(error) ? error?.message : data;

  if (!content) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-center">
        <Error content="custom slur" />
      </div>
    );
  }

  const separator = content.indexOf(":");
  const prefix = separator === -1 ? content : content.slice(0, separator);
  const message = separator === -1 ? "" : content.slice(separator + 1);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950">
      <div className="mx-auto max-w-7xl px-1 text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-amber-500">404</h1>
          <h2 className="mt-4 text-2xl font-semibold text-white">{prefix}</h2>
          <p className="mt-2 text-neutral-400">{message}</p>
        </div>

        <div className="flex flex-row justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-amber-400"
          >
            <Home aria-hidden="true" className="h-4 w-4" />
            Go Home
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </main>
  );
}
