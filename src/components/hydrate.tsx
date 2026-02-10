"use client";

import { useLocation } from "@/features/app/hooks/use-location";
import { useHydrateAuth } from "@/features/auth/hooks";

export default function AuthHydrator({
  children,
}: {
  children: React.ReactNode;
}) {
  const complete = useHydrateAuth();
  // Lấy vị trí người dùng khi ứng dụng được mở
  useLocation();

  if (!complete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* Spinner hoặc logo của bạn */}
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
