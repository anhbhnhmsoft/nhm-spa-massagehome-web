"use client";

import QueryProvider from "./query-provider";
import { initI18n } from "./i18n";

initI18n();
export default function Providers({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
