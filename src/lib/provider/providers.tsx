"use client";

import { useEffect, useState } from "react";
import QueryProvider from "./query-provider";
import { initI18n } from "./i18n";
import { Toaster } from "@/components/ui/sonner";
import { HydrateAuthProvider } from "@/features/auth/providers";
import FullScreenLoading from "@/components/app/full-screen-loading";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    const initializeI18n = async () => {
      await initI18n();
      setIsI18nReady(true);
    };
    initializeI18n();
  }, []);

  if (!isI18nReady) {
    return <FullScreenLoading loading={true} />;
  }

  return (
    <QueryProvider>
      <HydrateAuthProvider>
        {children}
        <Toaster position="top-right" />
      </HydrateAuthProvider>
    </QueryProvider>
  );
}
