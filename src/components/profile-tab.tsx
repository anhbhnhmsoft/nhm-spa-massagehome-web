"use client";

import React, { FC, useMemo, useState } from "react";
import {
  RefreshCcw,
  Settings,
  Wallet,
  User as UserIcon,
  ClipboardList,
  Heart,
  Ticket,
  ChevronRight,
  MapPin,
  Info,
  Headphones,
  Bell,
  LogOut,
  Building2,
  HandCoins,
  LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import GradientBackground from "@/components/styles/gradient-background";
import { useProfile } from "@/features/user/hooks";
import { _BookingStatus, _BookingStatusMap } from "@/features/service/const";
import { useGetSupport } from "@/features/config/hooks";
import useApplicationStore from "@/lib/store";
import { _LanguagesMap } from "@/lib/const";
import { useLogout } from "@/features/auth/hooks";
import SelectLanguage from "./select-language";
import { useRouter } from "next/navigation";
import { formatBalance, openAboutPage } from "@/lib/utils";
import { ListLocationModal } from "./location";
import SupportModal from "./support-modal";
import LogoutModal from "./dialog-logout";

type UserProfileCardProps = {
  user: ReturnType<typeof useProfile>["user"];
  dashboardData: ReturnType<typeof useProfile>["dashboardData"];
  refreshProfile: ReturnType<typeof useProfile>["refreshProfile"];
};
// --- USER PROFILE CARD ---
export const UserProfileCard: FC<UserProfileCardProps> = ({
  user,
  dashboardData,
  refreshProfile,
}) => {
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full">
      <GradientBackground className="mx-auto max-w-[1024px] rounded-b-[30px] px-4 pt-10 pb-6 text-white md:px-8">
        {/* TOP: Avatar + Info + Actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {/* Avatar */}
            {user?.profile?.avatar_url && !imageError ? (
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full border-2 border-white shadow-sm">
                <Image
                  src={user.profile.avatar_url}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 border-white bg-slate-200">
                <UserIcon size={26} className="text-slate-400" />
              </div>
            )}

            {/* User info */}
            <div className="ml-3 sm:ml-4 flex flex-col gap-1">
              <h2 className="text-sm sm:text-base md:text-lg font-bold leading-tight">
                {user?.name ?? "-"}
              </h2>

              <p className="text-[11px] sm:text-xs opacity-80 font-medium">
                ID: {user?.id ?? "-"}
              </p>

              {user?.referrer && (
                <p className="text-[11px] sm:text-xs text-teal-100">
                  {t("profile.referral_by")}: {user.referrer.name}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={refreshProfile}
              className="rounded-full p-2 transition-all duration-500 hover:rotate-180 hover:bg-white/10"
            >
              <RefreshCcw size={20} />
            </button>

            <Link
              href="/info"
              className="rounded-full p-2 transition-colors hover:bg-white/10"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>

        {/* BOTTOM: Stats + Wallet */}
        <div className="mt-4 sm:mt-8 flex items-center gap-4 sm:gap-6">
          {/* Stats */}
          <div className="flex flex-1 items-center justify-around md:justify-start md:gap-20">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-base sm:text-lg md:text-xl font-bold">
                {dashboardData?.wallet_balance
                  ? formatBalance(dashboardData?.wallet_balance)
                  : "-"}{" "}
                {t("common.currency")}{" "}
              </span>
              <span className="text-[11px] sm:text-xs text-teal-50 opacity-80">
                {t("profile.balance")}
              </span>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <span className="text-base sm:text-lg md:text-xl font-bold">
                {dashboardData?.coupon_user_count ?? "0"}
              </span>
              <span className="text-[11px] sm:text-xs text-teal-50 opacity-80">
                {t("profile.coupon")}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden h-10 w-px bg-white/20 md:block" />

          {/* Wallet button */}
          <Link
            href="/wallet"
            className="flex items-center gap-2 sm:gap-3 rounded-full bg-white/20 px-3 py-2 sm:px-4 transition-all hover:bg-white/30"
          >
            <Wallet size={18} />
            <span className="text-xs sm:text-sm font-medium">
              {t("profile.wallet")}
            </span>
          </Link>
        </div>
      </GradientBackground>
    </header>
  );
};

// --- ORDER BOARD ---
type OrderBoardProfileProps = {
  dashboardData: ReturnType<typeof useProfile>["dashboardData"];
};
const ORDER_MENU_ITEMS = [
  {
    status: _BookingStatus.PENDING,
    icon: Wallet,
    label: _BookingStatusMap[_BookingStatus.PENDING],
  },
  {
    status: _BookingStatus.CONFIRMED,
    icon: ClipboardList,
    label: _BookingStatusMap[_BookingStatus.CONFIRMED],
  },
  {
    status: _BookingStatus.ONGOING,
    icon: Heart,
    label: _BookingStatusMap[_BookingStatus.ONGOING],
  },
  {
    status: _BookingStatus.COMPLETED,
    icon: Ticket,
    label: _BookingStatusMap[_BookingStatus.COMPLETED],
  },
];
export const OrderBoardProfile = ({
  dashboardData,
}: OrderBoardProfileProps) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">
          {t("profile.my_order")}
        </h3>
        <Link
          href="/orders"
          className="flex items-center text-sm font-medium text-blue-600 hover:underline"
        >
          {t("common.see_more")}
          <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {ORDER_MENU_ITEMS.map((item) => {
          const count = dashboardData?.booking_count?.[item.status] || 0;
          return (
            <Link
              key={item.status}
              href={`/orders?status=${item.status}`}
              className="relative flex flex-col items-center  rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <div className="mb-3 rounded-full bg-slate-50 p-3 group-hover:bg-white transition-colors shadow-sm">
                <item.icon size={24} className="text-gray-600" />
              </div>
              <span className="text-center text-xs font-medium text-gray-500 group-hover:text-gray-900">
                {t(item.label)}
              </span>
              {count > 0 && (
                <span className="absolute top-1 right-2 md:right-6 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm border border-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// --- FEATURE LIST ---
interface FeatureItem {
  id: string;
  label: string;
  onClick: () => void;
  isImage?: boolean;
  icon: any; // Chúng ta sẽ ép kiểu khi sử dụng bên dưới
  color?: string;
}

export const FeatureList = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const [modalLangVisible, setModalLangVisible] = useState(false);
  const {
    visible: visibleSupport,
    openSupportModal,
    closeSupportModal,
    supportChanel,
  } = useGetSupport();
  const selectedLang = useApplicationStore((state) => state.language);
  const langConfig = useMemo(
    () => _LanguagesMap.find((lang) => lang.code === selectedLang),
    [selectedLang],
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Hỗ trợ

  // Quản lý địa chỉ
  const [visibleLocation, setVisibleLocation] = useState(false);

  const [showLogout, setShowLogout] = useState(false);
  const logout = useLogout();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace("/");
    } finally {
      setIsLoggingOut(false);
      setShowLogout(false);
    }
  };
  const features: FeatureItem[] = [
    {
      id: "location",
      icon: MapPin,
      label: "profile.manage_address",
      color: "text-blue-500",
      onClick: () => setVisibleLocation(true),
    },
    {
      id: "language",
      isImage: true,
      icon: langConfig?.icon,
      label: "profile.language",
      onClick: () => setModalLangVisible(true),
    },
    {
      id: "about",
      icon: Info,
      label: "profile.app_info",
      color: "text-blue-500",
      onClick: () => openAboutPage(),
    },
    {
      id: "support",
      icon: Headphones,
      label: "profile.support",
      color: "text-blue-500",
      onClick: () => openSupportModal(),
    },
    {
      id: "notification",
      icon: Bell,
      label: "profile.notification",
      color: "text-blue-500",
      onClick: () => router.push("/notification"),
    },
    {
      id: "logout",
      icon: LogOut,
      label: "profile.log_out",
      color: "text-red-500",
      onClick: () => setShowLogout(true),
    },
  ];

  return (
    <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm border border-gray-100 max-w-[1024px] mx-auto mt-2">
      <div className="mb-5 w-full">
        <h3 className="text-lg font-bold text-gray-800">
          {t("profile.common_features")}
        </h3>
      </div>

      <div className="flex w-full flex-wrap gap-y-4 sm:gap-y-6">
        {features.map((item) => {
          const IconComponent = item.icon as LucideIcon;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="w-1/4 sm:w-1/5 md:w-1/4 lg:w-1/6 flex flex-col items-center gap-2 p-2 rounded-xl transition-all hover:bg-slate-50 active:scale-95 group"
            >
              {/* Icon */}
              <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gray-50 group-hover:bg-white shadow-sm transition-colors border border-transparent group-hover:border-gray-100">
                {item.isImage ? (
                  item.icon ? (
                    <Image
                      src={item.icon}
                      alt="lang"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-7 h-7 bg-gray-200 animate-pulse rounded-full" />
                  )
                ) : (
                  IconComponent && (
                    <IconComponent size={24} className={item.color} />
                  )
                )}
              </div>

              {/* Label */}
              <span className="w-full text-center text-xs sm:text-sm font-semibold text-gray-600 group-hover:text-gray-900 line-clamp-2 break-words">
                {t(item.label)}
              </span>
            </button>
          );
        })}
      </div>

      <ListLocationModal
        visible={visibleLocation}
        onClose={() => setVisibleLocation(false)}
      />

      {/* Hỗ trợ khách hàng */}
      <SupportModal
        isVisible={visibleSupport}
        onClose={closeSupportModal}
        supportChanel={supportChanel || []}
      />
      <LogoutModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
      {modalLangVisible && (
        <SelectLanguage
          visible={modalLangVisible}
          onClose={() => setModalLangVisible(false)}
        />
      )}
    </div>
  );
};

export const RegisterPartnerOrAffiliate = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="flex  gap-4 w-full flex-row">
      {/* Đăng ký làm đối tác */}
      <button
        className="flex-1 flex items-center rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-gray-100 hover:border-blue-200 transition-all active:scale-[0.98] group min-w-0"
        onClick={() => router.push("/partner-register-type")}
      >
        <div className="mr-3 sm:mr-4 rounded-full bg-blue-50 p-2.5 sm:p-3 group-hover:bg-blue-100 transition-colors">
          <Building2 size={22} className="text-blue-600" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <h4 className="font-bold text-sm sm:text-base text-gray-800 line-clamp-1">
            {t("profile.join_partner")}
          </h4>
          <p className="text-[11px] sm:text-xs text-gray-400 line-clamp-1 mt-0.5">
            {t("profile.join_partner_desc")}
          </p>
        </div>
      </button>

      {/* Affiliate */}
      <button
        onClick={() => router.push("/affiliate")}
        className="flex-1 flex items-center rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-gray-100 hover:border-blue-200 transition-all active:scale-[0.98] group min-w-0"
      >
        <div className="mr-3 sm:mr-4 rounded-full bg-blue-50 p-2.5 sm:p-3 group-hover:bg-blue-100 transition-colors">
          <HandCoins size={22} className="text-blue-600" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <h4 className="font-bold text-sm sm:text-base text-gray-800 line-clamp-1">
            {t("profile.partner_commission")}
          </h4>
          <p className="text-[11px] sm:text-xs text-gray-400 line-clamp-1 mt-0.5">
            {t("profile.partner_commission_desc")}
          </p>
        </div>
      </button>
    </div>
  );
};
