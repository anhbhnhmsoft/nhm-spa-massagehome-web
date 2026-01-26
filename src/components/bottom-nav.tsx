"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Briefcase, Users, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TabIcon } from "./tab-icon";
import { useCheckAuth } from "@/features/auth/hooks";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const isAuthenticated = useCheckAuth();

  const tabs = [
    { name: t("tab.home"), href: "/", icon: Home },
    { name: t("tab.services"), href: "/services", icon: Briefcase },
    { name: t("tab.masseurs"), href: "/masseurs", icon: Users },
    { name: t("tab.profile"), href: "/profile", icon: User, protected: true },
  ];

  const handlePress = (e: React.MouseEvent, tab: (typeof tabs)[0]) => {
    if (tab.protected && !isAuthenticated) {
      e.preventDefault();
      router.push("/auth/index");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 sm:pb-6">
      {/* Container chính: Bo tròn, đổ bóng và Glassmorphism */}
      <nav className="w-full max-w-md bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-2xl rounded-2xl overflow-hidden md:max-w-lg">
        <div className="flex justify-around items-center h-16 px-2">
          {tabs.map((tab) => {
            const isFocused = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={(e) => handlePress(e, tab)}
                className="group flex-1 flex flex-col items-center justify-center active:scale-90 transition-transform duration-150"
              >
                <TabIcon focused={isFocused} icon={tab.icon} label={tab.name} />

                {/* Chỉ báo dòng kẻ nhỏ dưới chân icon khi active */}
                {isFocused && (
                  <div className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Lớp đệm để xử lý Safe Area trên iPhone (nếu không dùng padding ở trên) */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
