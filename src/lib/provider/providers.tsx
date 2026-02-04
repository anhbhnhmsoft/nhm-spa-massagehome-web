"use client";

import QueryProvider from "./query-provider";
import { initI18n } from "./i18n";
import { Toaster } from "@/components/ui/sonner";
import AuthBootstrap from "./auth-bootstrap";

initI18n();
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthBootstrap>
        {children}
        <Toaster position="top-right" />
      </AuthBootstrap>
    </QueryProvider>
  );
}
