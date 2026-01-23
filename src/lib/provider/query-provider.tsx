"use client";

import { useEffect, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";

// Tạo QueryClient (giống Expo)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  },
});

type Props = {
  children: ReactNode;
};

export default function QueryProvider({ children }: Props) {
  useEffect(() => {
    // Khi tab active / inactive
    const onVisibilityChange = () => {
      focusManager.setFocused(document.visibilityState === "visible");
    };

    window.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
