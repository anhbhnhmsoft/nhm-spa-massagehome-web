"use client";

import { useEffect, useState } from "react";
import QueryProvider from "./query-provider";
import { initI18n } from "./i18n";
import { Toaster } from "@/components/ui/sonner";
import { HydrateAuthProvider } from "@/features/auth/providers";
import FullScreenLoading from "@/components/app/full-screen-loading";
import { useLocation } from "@/features/app/hooks/use-location";

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

  // wrapper component so that useLocation runs inside QueryProvider context
  const LocationInitializer = ({ children }: { children: React.ReactNode }) => {
    useLocation();
    return <>{children}</>;
  };

  return (
    <QueryProvider>
      <LocationInitializer>
        <HydrateAuthProvider>
          {children}
          <Toaster position="top-right" />
        </HydrateAuthProvider>
      </LocationInitializer>
    </QueryProvider>
  );
}
