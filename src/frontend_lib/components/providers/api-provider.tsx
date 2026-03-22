"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";
import { queryClientConfig } from "@/frontend_lib/api/config";

export function ApiProvider({ children }: { children: ReactNode }) {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: queryClientConfig }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
