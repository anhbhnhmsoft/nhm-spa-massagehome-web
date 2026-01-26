"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Bath, Medal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CategoryItem } from "@/features/service/types";

export const CategoryCard = ({ item }: { item: CategoryItem }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // Giả định logic Store của bạn
  // const setFilter = useKTVSearchStore((state) => state.setFilter);

  const handlePress = () => {
    // setFilter({ category_id: item.id, category_name: item.name });
    router.push("/masseurs");
  };

  return (
    <button
      onClick={handlePress}
      className="group flex w-full flex-row rounded-xl border border-slate-100 bg-white p-3 text-left shadow-sm transition-all hover:border-blue-100 hover:shadow-md active:scale-[0.99]"
    >
      {/* --- PHẦN ẢNH --- */}
      <div className="relative shrink-0">
        <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-slate-100 sm:h-28 sm:w-28">
          {item.image_url && !imageError ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
              sizes="112px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200">
              <Bath size={32} className="text-slate-400" />
            </div>
          )}
        </div>

        {/* Badge Featured */}
        {item.is_featured && (
          <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 shadow-sm ring-2 ring-white">
            <Medal size={16} className="text-orange-500" />
          </div>
        )}
      </div>

      {/* --- PHẦN THÔNG TIN --- */}
      <div className="ml-4 flex flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="mb-1 font-bold text-blue-900 line-clamp-1 sm:text-lg">
            {item.name}
          </h3>
          <p className="text-xs leading-relaxed text-slate-500 line-clamp-2 sm:text-sm">
            {item.description}
          </p>
        </div>

        <div className="flex justify-end mt-2">
          <div className="rounded-lg bg-primary-color-2 px-4 py-1.5 transition-colors group-hover:bg-blue-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white sm:text-xs">
              {t("common.book_now")}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export const CategorySkeletonCard = () => {
  return (
    <div className="flex w-full flex-row rounded-xl border border-slate-100 bg-white p-3 shadow-sm mb-3 animate-pulse">
      {/* Image Skeleton */}
      <div className="h-24 w-24 shrink-0 rounded-lg bg-slate-200 sm:h-28 sm:w-28" />

      {/* Content Skeleton */}
      <div className="ml-4 flex flex-1 flex-col justify-between py-1">
        <div>
          <div className="mb-2 h-5 w-1/2 rounded bg-slate-200" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-3/4 rounded bg-slate-100" />
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="flex justify-end">
          <div className="h-7 w-24 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
};
