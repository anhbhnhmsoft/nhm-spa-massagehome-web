"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import HeaderBack from "@/components/header-back";
import {
  CouponItem,
  HeaderWallet,
  TransactionItem,
  WithdrawModal,
} from "@/components/app/wallet";
import { useWallet } from "@/features/payment/hooks";
import { _UserRole } from "@/features/auth/const";
import { cn } from "@/lib/utils";
import Empty from "@/components/emty";
import { ListTransactionItem } from "@/features/payment/types";
import { CouponUserItem } from "@/features/service/types";

export default function WalletPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [visibleWithdraw, setVisibleWithdraw] = useState(false);
  const toTabWallet = searchParams?.get("toTabWallet") === "coupon";

  const {
    tab,
    setTab,
    queryWallet,
    queryTransactionList,
    queryCouponUserList,
    goToDepositScreen,
    refresh,
  } = useWallet(_UserRole.CUSTOMER);

  // Xử lý chuyển tab khi có params từ URL (giống useEffect bên Expo)
  useEffect(() => {
    if (toTabWallet) {
      setTab("coupon");
      // Xóa param trên URL sau khi đã thực hiện để tránh trigger lại
      const params = new URLSearchParams(searchParams);
      params.delete("toTabWallet");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [toTabWallet, setTab, pathname, router, searchParams]);

  // Logic Infinite Scroll dùng chung cho cả 2 tab
  useEffect(() => {
    const handleScroll = () => {
      const isNearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;

      if (isNearBottom) {
        if (
          tab === "transaction" &&
          queryTransactionList.hasNextPage &&
          !queryTransactionList.isFetchingNextPage
        ) {
          queryTransactionList.fetchNextPage();
        }
        if (
          tab === "coupon" &&
          queryCouponUserList.hasNextPage &&
          !queryCouponUserList.isFetchingNextPage
        ) {
          queryCouponUserList.fetchNextPage();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tab, queryTransactionList, queryCouponUserList]);

  // Dữ liệu hiển thị tùy theo Tab
  const listData =
    tab === "transaction"
      ? queryTransactionList.data
      : queryCouponUserList.data;
  const isRefetching =
    tab === "transaction"
      ? queryTransactionList.isRefetching
      : queryCouponUserList.isRefetching;
  const isFetchingNextPage =
    tab === "transaction"
      ? queryTransactionList.isFetchingNextPage
      : queryCouponUserList.isFetchingNextPage;

  return (
    <div className="min-h-screen bg-white">
      <HeaderBack title="wallet.title" />

      <main className="mx-auto max-w-2xl px-4 pt-4 pb-24">
        {/* Header thông tin ví & Switcher Tab */}
        <HeaderWallet
          queryWallet={queryWallet}
          setTab={setTab}
          tab={tab}
          t={t}
          goToDepositScreen={goToDepositScreen}
          setVisibleWithdraw={setVisibleWithdraw}
        />

        {/* Render List Content */}
        <div className="mt-6 flex flex-col gap-3">
          {listData && listData.length > 0 ? (
            <>
              {listData.map((item, index) =>
                tab === "transaction" ? (
                  <TransactionItem
                    item={item as ListTransactionItem}
                    key={`trans-${item.id}-${index}`}
                  />
                ) : (
                  <CouponItem
                    item={item as CouponUserItem}
                    key={`coupon-${item.id}-${index}`}
                  />
                ),
              )}

              {/* Loading khi tải thêm trang */}
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-color-2 border-t-transparent" />
                </div>
              )}
            </>
          ) : (
            // Chỉ hiện Empty khi đã load xong mà không có data
            !(
              queryTransactionList.isLoading || queryCouponUserList.isLoading
            ) && <Empty />
          )}
        </div>
      </main>

      {/* Modal rút tiền */}
      <WithdrawModal
        isVisible={visibleWithdraw}
        onClose={() => setVisibleWithdraw(false)}
      />

      {/* Nút Refresh nổi (Web thay cho RefreshControl) */}
      <button
        onClick={() => refresh()}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-color-2 text-white shadow-xl transition-all active:scale-90",
          isRefetching && "animate-spin",
        )}
        aria-label="Refresh"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
          <path d="M21 3v5h-5"></path>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
          <path d="M8 16H3v5"></path>
        </svg>
      </button>
    </div>
  );
}
