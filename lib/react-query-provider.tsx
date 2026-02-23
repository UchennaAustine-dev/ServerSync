"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { queryClient as defaultQueryClient } from "./config/query-client";

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  // Use useState to ensure the query client is only created once per component instance
  // This prevents the client from being recreated on every render
  const [queryClient] = useState(() => defaultQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
