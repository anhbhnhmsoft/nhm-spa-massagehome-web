"use client";

import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import HeaderBack from "@/components/header-back";
import NotificationItem from "@/components/app/notification_card";
import { useNotificationScreen } from "@/features/notification/hook";
import Empty from "@/components/emty";

export default function NotificationScreen() {
  const { t } = useTranslation();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    handleReadNotification,
  } = useNotificationScreen();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HeaderBack title={t("profile.notification")} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-4">
        {/* Render List */}
        {data && data.length > 0 ? (
          <div className="flex flex-col space-y-1">
            {data.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onRead={handleReadNotification}
              />
            ))}
          </div>
        ) : (
          !isRefetching && !isFetchingNextPage && <Empty />
        )}
        <div
          ref={loadMoreRef}
          className="flex h-20 items-center justify-center"
        >
          {(isFetchingNextPage || isRefetching) && (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-color-2 border-t-transparent" />
          )}
        </div>
      </main>
    </div>
  );
}
