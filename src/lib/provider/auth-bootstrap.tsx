// components/AuthBootstrap.tsx
"use client";

import { ReactNode } from "react";
import { useHydrateAuth } from "@/features/auth/hooks";
import FullScreenLoading from "@/components/app/full-screen-loading";
export default function AuthBootstrap({ children }: { children: ReactNode }) {
  const complete = useHydrateAuth();

  return (
    <>
      <FullScreenLoading loading={!complete} whiteBg />
      {complete && children}
    </>
  );
}
