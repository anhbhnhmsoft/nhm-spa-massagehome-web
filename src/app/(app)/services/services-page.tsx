"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/header-app";
import useDebounce from "@/features/app/hooks/use-debounce";
import { useGetCategoryList } from "@/features/service/hooks";
import { useTranslation } from "react-i18next";
import { CategoryCard, CategorySkeletonCard } from "@/components/category-card";
import Empty from "@/components/emty";
// Import icon từ thư viện bạn dùng (ví dụ lucide-react hoặc heroicons)
import { RotateCw } from "lucide-react";

export default function ServicesPageComponent() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    pagination,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching, // Trạng thái khi đang refetch
    isLoading,
    setFilter,
  } = useGetCategoryList({
    page: 1,
    per_page: 10,
  });

  const debouncedSearch = useDebounce(
    (text: string) => {
      setFilter({ keyword: text });
    },
    500,
    [],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Hàm xử lý Refetch
  const handleRefetch = async () => {
    if (isRefetching) return;
    await refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showSearch={true}
        forSearch={"service"}
        textSearch={keyword}
        setTextSearch={(text: string) => {
          setKeyword(text);
          if (text && text.length > 2) {
            debouncedSearch(text);
          }
          if (text.trim().length === 0) {
            setFilter({ keyword: "" });
          }
        }}
      />

      <main className="mx-auto max-w-[1024px] p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">
              {pagination?.meta?.total || 0}
            </span>
            <span className="text-slate-500 font-medium">
              {t("services.total_services")}
            </span>
          </div>

          {/* --- NÚT REFETCH --- */}
          <button
            onClick={handleRefetch}
            disabled={isRefetching || isLoading}
            className="p-2 hover:bg-gray-200 rounded-full transition-all active:scale-95 disabled:opacity-50"
            title="Làm mới"
          >
            <RotateCw
              size={20}
              className={`text-slate-600 ${isRefetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Khi đang Refetch hoặc Load lần đầu, dùng Skeleton */}
          {isLoading || (isRefetching && !isFetchingNextPage) ? (
            Array.from({ length: 6 }).map((_, index) => (
              <CategorySkeletonCard key={`skeleton-${index}`} />
            ))
          ) : data && data.length > 0 ? (
            <>
              {data.map((item: any, index: number) => (
                <CategoryCard item={item} key={`${item.id}-${index}`} />
              ))}

              {isFetchingNextPage &&
                Array.from({ length: 2 }).map((_, index) => (
                  <CategorySkeletonCard key={`next-skeleton-${index}`} />
                ))}
            </>
          ) : (
            <div className="col-span-full py-20">
              <Empty />
            </div>
          )}
        </div>

        <div ref={loadMoreRef} className="h-10 w-full" />
      </main>
    </div>
  );
}
