import { Suspense, lazy } from "react";

import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

import { queryClient } from "@/api/query-client";

import { RootLayout } from "@/layouts/Root";
import { Loading } from "@/components/Loading";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Categories = lazy(() => import("@/pages/Categories"));
const Transactions = lazy(() => import("@/pages/Transactions"));
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster richColors position="top-right" />
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
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/categories" element={<Categories />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
