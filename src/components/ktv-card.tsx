"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Star,
  Briefcase,
  User,
  CheckCircle,
  ShieldCheck,
  Award,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ListKTVItem } from "@/features/user/types"; // Hoặc thư viện i18n bạn đang dùng

import StarRating from "@/components/star-rating";
import useCalculateDistance from "@/features/app/hooks/use-calculate-distance";
import { useSetKtv } from "@/features/user/hooks";
import { formatDistance } from "@/lib/utils";

export const KTVHomePageCard = ({ item }: { item: ListKTVItem }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  // Giả định hook setKtv của bạn xử lý logic chọn KTV
  // const setKtv = useSetKtv();

  const handlePress = () => {
    console.log("Selected KTV ID:", item.id);
    // setKtv(item.id);
  };

  return (
    <button
      onClick={handlePress}
      className="group relative flex w-full flex-col rounded-xl border border-slate-100 bg-white p-2 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
    >
      {/* --- AVATAR --- */}
      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg bg-slate-100 sm:aspect-video lg:aspect-square">
        {item.profile?.avatar_url && !imageError ? (
          <Image
            src={item.profile.avatar_url}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200">
            <User size={24} className="text-slate-400" />
          </div>
        )}

        {/* Icon Verified */}
        <div className="absolute right-1 top-1 rounded-full bg-blue-500 p-0.5 shadow-sm">
          <CheckCircle size={10} className="text-white" />
        </div>
      </div>

      {/* --- INFO --- */}
      <div className="flex flex-col items-center w-full">
        <h3 className="w-full truncate text-center font-bold text-sm text-slate-800">
          {item.name}
        </h3>

        {/* Rating */}
        <div className="mb-2 mt-1 flex items-center justify-center space-x-1">
          <Star size={10} className="fill-yellow-500 text-yellow-500" />
          <span className="font-bold text-[10px] text-slate-700">
            {item.rating || 0}
          </span>
          <span className="text-[10px] text-slate-400">
            ({item.review_count || 0})
          </span>
        </div>

        {/* Services Count */}
        <div className="flex w-full items-center justify-center gap-1 rounded bg-blue-50 px-1 py-1.5 transition-colors group-hover:bg-blue-100">
          <Briefcase size={10} className="text-blue-600" />
          <span className="truncate font-medium text-[10px] text-blue-600">
            {item.service_count} {t("common.service")}
          </span>
        </div>
      </div>
    </button>
  );
};

/**
 * Card hiển thị thông tin của massager trong trang dịch vụ
 * @param item
 * @constructor
 */
export const KTVServiceCard = ({ item }: { item: ListKTVItem }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const calculateDistance = useCalculateDistance();
  const setKtv = useSetKtv();

  const distance = calculateDistance(
    item.review_application.latitude,
    item.review_application.longitude,
  );

  return (
    <div
      className="group mb-3 flex w-full flex-row rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
      onClick={() => setKtv(item.id)}
    >
      {/* Avatar Section */}
      <div className="relative mr-3 h-20 w-20 shrink-0 sm:h-24 sm:w-24">
        {item.profile?.avatar_url && !imageError ? (
          <div className="relative w-24 h-24 overflow-hidden rounded-full">
            <Image
              src={item.profile.avatar_url}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
              sizes="112px"
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-200">
            <User size={32} className="text-slate-400" />
          </div>
        )}

        {/* Verified Badge */}
        <div className="absolute bottom-0 right-0 rounded-full bg-white p-0.5 shadow-sm">
          <div className="rounded-full bg-blue-500 p-1">
            <ShieldCheck size={10} className="text-white" />
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800 sm:text-lg">
                {item.name}
              </h3>
              <div className="mt-0.5 flex flex-row items-center gap-1">
                {/* Giả sử StarRating là component Web của bạn */}
                <StarRating rating={item.rating} size={12} />
                <span className="font-bold text-xs text-slate-700 ml-1">
                  {item.rating}
                </span>
                <span className="text-xs text-slate-400">
                  ({item.review_count || 0})
                </span>
              </div>
            </div>
          </div>

          {/* Details Row - Responsive: Wrap on very small screens */}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex flex-row items-center gap-1">
              <Award size={12} className="text-slate-500" />
              <span className="text-[10px] text-slate-500 sm:text-xs">
                {item.review_application.experience} {t("common.year")}
              </span>
            </div>

            {distance && (
              <div className="flex flex-row items-center gap-1">
                <MapPin size={12} className="text-slate-500" />
                <span className="text-[10px] text-slate-500 sm:text-xs">
                  {formatDistance(distance)}
                </span>
              </div>
            )}

            <div className="flex flex-row items-center gap-1">
              <TrendingUp size={12} className="text-slate-500" />
              <span className="text-[10px] text-slate-500 sm:text-xs">
                {item.jobs_received_count} {t("common.jobs_received_count")}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button Section */}
        <div className="mt-3 flex w-full flex-row items-center justify-end border-t border-slate-50 pt-2">
          <button className="rounded-lg bg-primary-color-2 px-4 py-2 shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800">
            <span className="font-bold text-xs text-white">
              {t("services.btn_booking")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Card Skeleton hiển thị thông tin của massager trong trang dịch vụ
 */

export const KTVServiceCardSkeleton = () => {
  return (
    <div className="mb-3 flex w-full animate-pulse flex-row rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="mr-3 h-20 w-20 shrink-0 rounded-full bg-slate-200 sm:h-24 sm:w-24" />

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="mb-2 h-5 w-32 rounded-lg bg-slate-200 sm:w-48" />
          <div className="h-4 w-20 rounded-lg bg-slate-200" />
        </div>

        <div className="mt-2 flex flex-row items-center gap-3">
          <div className="h-4 w-16 rounded-lg bg-slate-200" />
          <div className="h-4 w-16 rounded-lg bg-slate-200" />
          <div className="h-4 w-16 rounded-lg bg-slate-200" />
        </div>

        <div className="mt-3 flex w-full flex-row items-center justify-end pt-2">
          <div className="h-8 w-20 rounded-md bg-slate-200" />
        </div>
      </div>
    </div>
  );
};
