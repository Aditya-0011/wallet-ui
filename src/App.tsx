import { Suspense, lazy } from "react";

import { FetchError } from "@/lib/objects";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { toast } from "sonner";

const CONSOLE_URL = import.meta.env.VITE_CONSOLE_URL;

import { Loading } from "@/components/Loading";
import { AuthProvider } from "@/contexts/AuthContext";
import { RootLayout } from "@/layouts/Root";
import NotFound from "@/pages/NotFound";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Categories = lazy(() => import("@/pages/Categories"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 0 } },
  queryCache: new QueryCache({
    onSuccess: (data: unknown, query) => {
      const meta = query.meta as Record<string, unknown> | undefined;
      if (meta?.onSuccess && typeof meta.onSuccess === "function")
        meta.onSuccess(data);
      if (meta?.invalidateKey && Array.isArray(meta.invalidateKey)) {
        for (const key of meta.invalidateKey) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
    },
    onError: (error, query) => {
      if (error instanceof FetchError) {
        const meta = query.meta as Record<string, unknown> | undefined;
        const { message, status } = error;
        if (status === 401 || status === 0) {
          if (!meta?.skipAuthErrorHandling) {
            queryClient.clear();
            if (meta?.logout && typeof meta.logout === "function")
              meta.logout();
            toast.error(message);
            window.location.href = `${CONSOLE_URL}/login?redirect=Wallet`;
            return;
          }
        }
        toast.error(message);
      }
    },
  }),
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <AuthProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="flex h-screen w-full items-center justify-center text-center">
                <Loading />
              </div>
            }
          >
            <Routes>
              <Route element={<RootLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* <Route path="/transactions" element={<Transactions />} /> */}
                <Route path="/categories" element={<Categories />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
