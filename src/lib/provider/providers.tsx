"use client";

import { useEffect, useState } from "react";
import QueryProvider from "./query-provider";
import { initI18n } from "./i18n";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      await initI18n(); // 👈 ĐỢI THẬT
      setReady(true);
    }
    init();
  }, []);

  if (!ready) return null;
  return <QueryProvider>{children}</QueryProvider>;
}
