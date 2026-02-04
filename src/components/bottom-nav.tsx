"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Users, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TabIcon } from "./tab-icon";
import { useCheckAuthToRedirect } from "@/features/auth/hooks";
import { useCallback } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const checkAuth = useCheckAuthToRedirect();

  const tabs = [
    { name: t("tab.home"), href: "/", icon: Home },
    { name: t("tab.services"), href: "/services", icon: Briefcase },
    { name: t("tab.masseurs"), href: "/masseurs", icon: Users },
    { name: t("tab.profile"), href: "/profile", icon: User, protected: true },
  ];

  const handlePress = useCallback(
    (e: React.MouseEvent, tab: (typeof tabs)[0]) => {
      if (!tab.protected) return;

      e.preventDefault();

      checkAuth(tab.href);
    },
    [checkAuth],
  );

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[750px] flex justify-center">
      {/* Container chính */}
      <nav className="w-full bg-white backdrop-blur-lg border border-gray-200/50 shadow-2xl  overflow-hidden">
        <div className="flex justify-around items-center h-16 px-2">
          {tabs.map((tab) => {
            const isFocused = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={(e) => handlePress(e, tab)}
                className="relative group flex-1 flex flex-col items-center justify-center active:scale-90 transition-transform duration-150"
              >
                <TabIcon focused={isFocused} icon={tab.icon} label={tab.name} />

                {isFocused && (
                  <div className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Safe area */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
