"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useListBannerQuery } from "@/features/commercial/hooks/use-query";
import { Skeleton } from "../skeleton";
import { useGetListKTVHomepage } from "@/features/user/hooks";
import { KTVHomePageCard } from "@/components/ktv-card";
import { normalizeListToLength } from "@/lib/utils";
import { useGetCategoryList } from "@/features/service/hooks";
import { CategoryCard, CategorySkeletonCard } from "../category-card";
import Empty from "../emty";

export function CarouselBanner({
  bannerQuery,
}: {
  bannerQuery: ReturnType<typeof useListBannerQuery>;
}) {
  const { data: banners, isLoading, isFetching } = bannerQuery;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000 }),
  ]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => {
      setIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  // Loading Skeleton cũng phải giữ đúng tỷ lệ
  if (isLoading || isFetching || !banners || banners.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1024px]">
        <Skeleton className="w-full aspect-[1024/617] rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1024px] relative ">
      <div
        ref={emblaRef}
        // Sử dụng aspect-ratio để chiều cao tự động tính theo chiều rộng
        className="overflow-hidden rounded-2xl aspect-[1024/617] w-full"
      >
        <div className="flex h-full">
          {banners.map((item, i) => (
            <div key={item.id} className="relative flex-[0_0_100%] h-full">
              <Image
                src={item.image_url}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              i === index ? "bg-white w-5" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
export function InviteSection() {
  const { t } = useTranslation();
  return (
    <div className="grid  gap-4 grid-cols-2  ">
      {/* Button 1 */}
      <button className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3 transition-hover hover:bg-slate-100 text-left">
        <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white shadow-sm">
          <Image
            src="/assets/images/image_ktv.png"
            alt="KTV"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="text-base font-bold  text-slate-800 md:text-2xl">
            {t("homepage.invite_ktv.title")}
          </h3>
          <p className="text-sm text-slate-500 md:text-xl ">
            {t("homepage.invite_ktv.description")}
          </p>
        </div>
      </button>

      {/* Button 2 */}
      <button className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3 transition-hover hover:bg-slate-100 text-left">
        <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white shadow-sm">
          <Image
            src="/assets/images/image_agency.png"
            alt="Agency"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="text-base font-bold  text-slate-800 md:text-2xl">
            {t("homepage.invite_partner.title")}
          </h3>
          <p className="text-sm text-slate-500 md:text-xl">
            {t("homepage.invite_partner.description")}
          </p>
        </div>
      </button>
    </div>
  );
}

export function KTVSection({
  queryKTV,
}: {
  queryKTV: ReturnType<typeof useGetListKTVHomepage>;
}) {
  const { t } = useTranslation();
  const { data: ktvList, isLoading } = queryKTV;

  const [emblaRef] = useEmblaCarousel(
    {
      align: "start",
      loop: true,
      dragFree: true,
    },
    [
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
      }),
    ],
  );
  const displayList = useMemo(() => {
    if (!ktvList || ktvList.length === 0) return [];

    return ktvList.length >= 12
      ? ktvList.slice(0, 12)
      : normalizeListToLength(ktvList, 12);
  }, [ktvList]);
  // Loading
  if (isLoading || !ktvList) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-7 w-64 rounded bg-gray-200" />
          <div className="h-5 w-20 rounded bg-gray-200" />
        </div>

        {/* Grid skeleton giống item */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {/* Item 1 */}
          <Skeleton className="aspect-[3/4] rounded-2xl" />
          <Skeleton className="aspect-[3/4] rounded-2xl" />
          <Skeleton className="aspect-[3/4] rounded-2xl" />

          {/* Tablet trở lên */}
          <Skeleton className="hidden aspect-[3/4] rounded-2xl sm:block" />

          {/* Desktop */}
          <Skeleton className="hidden aspect-[3/4] rounded-2xl lg:block" />
          <Skeleton className="hidden aspect-[3/4] rounded-2xl lg:block" />
        </div>
      </div>
    );
  }

  // Nhân bản nếu < 12

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between px-1 mb-4 sm:items-center">
        {/* Tiêu đề: Tự động co giãn từ text-lg (mobile) lên text-2xl (desktop) */}
        <h2 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl md:text-2xl">
          {t("homepage.technician_suggest")}
        </h2>

        {/* Nút Xem tất cả: Nhỏ gọn trên mobile, rõ ràng trên desktop */}
        <button
          className=" text-sm font-semibold text-blue-600
                              transition-colors duration-200
                              hover:text-blue-700 hover:underline
                              active:opacity-70
                              sm:text-base md:text-lg
                            "
        >
          {t("common.see_all")}
        </button>
      </div>

      {/* Embla Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3">
          {displayList.map((ktv, index) => (
            <div
              key={`${ktv.id}-${index}`}
              className="
                flex-[0_0_140px]
                sm:flex-[0_0_160px]
                md:flex-[0_0_180px]
              "
            >
              <KTVHomePageCard item={ktv} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const CategorySection = ({
  queryCategory,
}: {
  queryCategory: ReturnType<typeof useGetCategoryList>;
}) => {
  const { t } = useTranslation();
  const { data, isLoading, isFetching } = queryCategory;

  return (
    <div className="mb-10 mt-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 md:text-xl">
          {t("homepage.services")}
        </h2>
        <Link
          href="/services"
          className="text-xs font-bold text-blue-600 transition-colors hover:text-blue-700 md:text-sm"
        >
          {t("common.see_all")}
        </Link>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
        {/* Loading */}
        {isLoading || isFetching ? (
          Array.from({ length: 6 }).map((_, i) => (
            <CategorySkeletonCard key={i} />
          ))
        ) : data && data.length > 0 ? (
          data.map((item) => <CategoryCard key={item.id} item={item} />)
        ) : (
          <div className="col-span-full py-10 text-center text-slate-500">
            <Empty />
          </div>
        )}
      </div>
    </div>
  );
};
