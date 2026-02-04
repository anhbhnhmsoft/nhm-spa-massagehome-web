"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/header-app";
import useDebounce from "@/features/app/hooks/use-debounce";
import { useLocationUser } from "@/features/app/hooks/use-get-user-location";
import { useGetListKTV } from "@/features/user/hooks";
import { KTVServiceCard, KTVServiceCardSkeleton } from "@/components/ktv-card";
import Empty from "@/components/emty";
import { ListKTVItem } from "@/features/user/types";
import { X } from "lucide-react";

export default function MasseursPageComponent() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState("");
  const locationUser = useLocationUser();

  const {
    data,
    pagination,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    isLoading,
    setFilter,
    params,
  } = useGetListKTV();

  // Đồng bộ vị trí người dùng
  useEffect(() => {
    if (locationUser) {
      setFilter({
        lat: locationUser.lat,
        lng: locationUser.lng,
      });
    }
  }, [locationUser, setFilter]);

  const searchCallback = useCallback(
    (text: string) => {
      setFilter({ keyword: text });
    },
    [setFilter],
  );

  const debouncedSearch = useDebounce(searchCallback, 500);

  return (
    <div className="min-h-screen bg-base-color-3">
      {/* --- HEADER --- */}
      <Header
        showSearch={true}
        forSearch={"massage"}
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

      <main className="mx-auto max-w-[1024px] p-4 sm:p-6 lg:p-8">
        {/* --- TITLE & TOTAL --- */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-2">
            <span className="text-xl font-bold text-blue-600 sm:text-2xl">
              {pagination?.meta?.total || 0}
            </span>
            <h1 className="text-lg font-semibold text-slate-700 sm:text-xl">
              {t("services.total_masseurs")}
            </h1>
          </div>

          {params?.filter?.category_id && params?.filter?.category_name && (
            <button
              type="button"
              onClick={() =>
                setFilter({
                  category_id: undefined,
                  category_name: undefined,
                })
              }
              className="flex items-center gap-2 rounded-xl bg-blue-200 px-3 py-2 text-blue-600 hover:bg-blue-300 transition"
            >
              <span className="text-xs font-inter-bold">
                {params.filter.category_name}
              </span>
              <X size={12} />
            </button>
          )}
        </div>

        {/* --- CONTENT AREA --- */}
        {isLoading || isRefetching ? (
          // Grid Skeleton: 1 cột trên mobile, 2 cột trên tablet/laptop
          <div className="grid grid-cols-1 ">
            {Array.from({ length: 6 }).map((_, index) => (
              <KTVServiceCardSkeleton key={`ktv-skeleton-${index}`} />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <>
            {/* Grid thực tế */}
            <div className="grid grid-cols-1">
              {data.map((item: ListKTVItem) => (
                <KTVServiceCard item={item} key={item.id} />
              ))}
            </div>

            {/* Nút Load More (Thay thế onEndReached của FlatList) */}
            {hasNextPage && (
              <div className="mt-8 flex justify-center pb-10">
                <button
                  disabled={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                  className="rounded-full bg-white px-8 py-2 text-sm font-medium text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-50 disabled:opacity-50"
                >
                  {isFetchingNextPage
                    ? t("common.loading")
                    : t("common.load_more")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-20">
            <Empty />
          </div>
        )}
      </main>
    </div>
  );
}
