import { Link } from "react-router";

import { ArrowLeft, Home } from "lucide-react";

import { useDataQuery } from "@/api/handler";
import { type FetchError } from "@/lib/objects";

import { Error } from "@/components/Error";
import { Loading } from "@/components/Loading";

export default function NotFound() {
  const { data, isLoading, isError, error } = useDataQuery<null, string>(
    "auth",
    ["random"],
    "/random",
    true,
    { staleTime: 15 * 1000 },
  );

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-center">
        <Loading content="custom slur" />
      </div>
    );
  }

  const is404Error =
    isError &&
    error &&
    "status" in error &&
    (error as FetchError).status === 404;
  const content = is404Error ? (error as FetchError).message : data;

  if (!content) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-center">
        <Error content="custom slur" />
      </div>
    );
  }

  const [preffix, message] = content.split(":");
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950">
      <div className="mx-auto max-w-7xl px-1 text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-amber-500">404</h1>
          <h2 className="mt-4 text-2xl font-semibold text-white">{preffix}</h2>
          <p className="mt-2 text-neutral-400">{message}</p>
        </div>

        <div className="flex flex-row justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-amber-400"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
