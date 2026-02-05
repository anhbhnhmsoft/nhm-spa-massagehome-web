"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";

import Link from "next/link";
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
import { useRouter } from "next/navigation";

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

  // Skeleton giữ đúng tỷ lệ width * 0.6
  if (isLoading || isFetching || !banners || banners.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[750px]">
        <Skeleton className="w-full aspect-[5/3] rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[750px] relative">
      <div
        ref={emblaRef}
        className="overflow-hidden rounded-2xl aspect-[5/3] w-full"
      >
        <div className="flex h-full">
          {banners.map((item, i) => (
            <div key={item.id} className="relative flex-[0_0_100%] h-full">
              <Image
                src={item.image_url}
                alt=""
                fill
                sizes="(max-width: 750px) 100vw, 750px"
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
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <div className="grid  gap-4 grid-cols-2  px-4">
      {/* Button 1 */}
      <button
        className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3 transition-hover hover:bg-slate-100 text-left "
        onClick={() => router.push("/partner-register-individual")}
      >
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
          <p className="text-xs text-slate-500 md:text-xl ">
            {t("homepage.invite_ktv.description")}
          </p>
        </div>
      </button>

      {/* Button 2 */}
      <button
        className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3 transition-hover hover:bg-slate-100 text-left"
        onClick={() => router.push("/partner-register-agency")}
      >
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
          <p className="text-xs text-slate-500 md:text-xl">
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
      dragFree: false, // QUAN TRỌNG → snap theo page
    },
    [
      Autoplay({
        delay: 3000,
        stopOnInteraction: true,
      }),
    ],
  );

  const displayList = useMemo(() => {
    if (!ktvList || ktvList.length === 0) return [];

    return ktvList.length >= 8
      ? ktvList.slice(0, 8)
      : normalizeListToLength(ktvList, 8);
  }, [ktvList]);
  // Loading
  if (isLoading || !ktvList) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        <Skeleton className="aspect-[3/4] rounded-2xl" />
        <Skeleton className="aspect-[3/4] rounded-2xl" />
        <Skeleton className="aspect-[3/4] rounded-2xl" />
        <Skeleton className="hidden aspect-[3/4] rounded-2xl sm:block" />
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
        <div className="flex">
          {displayList.map((ktv, index) => (
            <div
              key={`${ktv.id}-${index}`}
              className="
          shrink-0
          w-[33.333%]   /* 3 item trên mobile */
          sm:w-[25%]    /* 4 item trên màn lớn (≤750px) */
          px-1
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
      <div className="grid grid-cols-1 gap-3">
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
export function AppDownloadSection() {
  const { t } = useTranslation();
  return (
    <section className="mt-6 px-4 lg:px-8">
      <div className="flex w-full items-center justify-center gap-3">
        {/* Nút Google Play */}
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-white py-3 shadow-sm transition-all active:scale-95 sm:max-w-[200px]"
        >
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src="/assets/images/ch-play-apk.png"
              alt="Google Play"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-base text-slate-500">
              {t("common.prefix")}
            </span>
            <span className="text-sm font-bold text-blue-600">Google Play</span>
          </div>
        </a>

        {/* Nút App Store */}
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-white py-3 shadow-sm transition-all active:scale-95 sm:max-w-[200px]"
        >
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src="/assets/images/app-store-1.png"
              alt="App Store"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-base text-slate-500">
              {" "}
              {t("common.prefix")}
            </span>
            <span className="text-sm font-bold text-[#005bb7]">App Store</span>
          </div>
        </a>
      </div>
    </section>
  );
}
