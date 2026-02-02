"use client";

import React from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Copy, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

// Giả định các hooks/utils của bạn đã sẵn sàng cho Web
import useCopyClipboard from "@/features/app/hooks/use-copy-clipboard";
import { useAffiliateUser } from "@/features/affiliate/hooks";
import { formatBalance } from "@/lib/utils";
import { Skeleton } from "@/components/skeleton";

const ReferralPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const copyToClipboard = useCopyClipboard();
  const { config, affiliate_link } = useAffiliateUser();

  // Màu sắc chủ đạo (Thay đổi theo DefaultColor của bạn)
  const PRIMARY_COLOR = "#007AFF";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("affiliate.title"),
          text: t("affiliate.title_1"),
          url: affiliate_link,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback khi trình duyệt không hỗ trợ Web Share API
      copyToClipboard(affiliate_link);
      alert(t("common.copied_to_clipboard"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* Container giới hạn 750px */}
      <div className="w-full max-w-[750px] bg-white shadow-sm flex flex-col min-h-screen">
        {/* --- HEADER --- */}
        <header className="sticky top-0 z-50 flex items-center bg-white px-4 py-4 border-b border-gray-100">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-slate-900" />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg pr-10 text-slate-900">
            {t("affiliate.title")}
          </h1>
        </header>

        {/* --- CONTENT --- */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            {/* Banner Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-full aspect-video relative rounded-2xl overflow-hidden bg-gray-100 mb-6 shadow-sm">
                <Image
                  src="/assets/images/affliate.jpg" // Đảm bảo đường dẫn đúng trong thư mục public
                  alt="Affiliate Banner"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <p className="text-gray-600 text-lg font-semibold mb-1 text-center">
                {t("affiliate.title_1")}
              </p>

              {config ? (
                <h2 className="text-blue-600 text-4xl font-extrabold text-center">
                  {t("affiliate.title_2", {
                    percent: formatBalance(config.commission_rate) || "0",
                  })}
                </h2>
              ) : (
                <Skeleton className="w-64 h-12 rounded-lg" />
              )}
            </div>

            {/* QR & Link Section */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">
                {t("affiliate.referral_link")}
              </h3>

              {/* QR Code */}
              <div className="flex justify-center items-center p-6 bg-white border border-gray-50 rounded-2xl w-fit mx-auto mb-8 shadow-sm">
                {affiliate_link ? (
                  <QRCodeSVG
                    value={affiliate_link}
                    size={200}
                    fgColor={PRIMARY_COLOR}
                    level="H"
                    includeMargin={false}
                  />
                ) : (
                  <Skeleton className="w-[200px] h-[200px]" />
                )}
              </div>

              {/* Link Display */}
              <div className="flex items-center bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100">
                <p className="text-gray-500 font-medium flex-1 truncate mr-3 text-sm">
                  {affiliate_link}
                </p>
                <button
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-400"
                  onClick={() => copyToClipboard(affiliate_link)}
                >
                  <Copy size={20} />
                </button>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                <Share2 size={22} />
                {t("affiliate.share")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;
