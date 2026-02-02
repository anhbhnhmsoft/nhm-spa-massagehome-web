"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X, ExternalLink, Copy, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
// Giả định bạn đã config các consts này dùng chung được cho web
import { _ConfigKey, _ConfigKeyLabel } from "@/features/config/consts";
import Image from "next/image";

type SupportItem = {
  key: _ConfigKey;
  value: string;
};

type Props = {
  isVisible: boolean;
  onClose: () => void;
  supportChanel: SupportItem[];
};

const SupportModal = ({ isVisible, onClose, supportChanel }: Props) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Khóa cuộn trang khi modal mở
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible]);

  const getInfo = useCallback(
    (key: _ConfigKey) => {
      // Lưu ý: Next.js dùng path tĩnh hoặc import, hãy đảm bảo ảnh nằm trong /public/icons/...
      switch (key) {
        case _ConfigKey.SP_ZALO:
          return {
            label: t(_ConfigKeyLabel[key]),
            icon: "/assets/icon/zalo.png",
          };
        case _ConfigKey.SP_FACEBOOK:
          return {
            label: t(_ConfigKeyLabel[key]),
            icon: "/assets/icon/facebook.png",
          };
        case _ConfigKey.SP_WECHAT:
          return {
            label: t(_ConfigKeyLabel[key]),
            icon: "/assets/icon/wechat.png",
          };
        case _ConfigKey.SP_PHONE:
          return {
            label: t(_ConfigKeyLabel[key]),
            icon: "/assets/icon/phone.png",
          };
        default:
          return { label: "", icon: "" };
      }
    },
    [t],
  );

  const handlePress = async (key: _ConfigKey, value: string) => {
    switch (key) {
      case _ConfigKey.SP_PHONE:
        window.location.assign(`tel:${value}`);
        break;
      case _ConfigKey.SP_WECHAT:
        // Logic Copy trên Web
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          alert(t("common.copied")); // Hoặc dùng toast
        } catch (err) {
          console.error("Failed to copy!", err);
        }
        break;
      default:
        // Mở link Zalo/Facebook ở tab mới
        window.open(value, "_blank", "noopener,noreferrer");
        break;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[2147483647] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {t("support.title")}
            </h3>
            <p className="text-slate-400 text-sm">{t("support.description")}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* List Items */}
        <div className="space-y-4">
          {supportChanel?.map((item) => {
            if (!item.value?.trim()) return null;
            const info = getInfo(item.key);

            return (
              <button
                key={item.key}
                onClick={() => handlePress(item.key, item.value)}
                className="w-full flex flex-row items-center bg-blue-50/50 hover:bg-blue-100 p-4 rounded-2xl border border-slate-100 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-slate-100 flex items-center justify-center mr-4 shrink-0 shadow-sm">
                  <Image
                    src={info.icon}
                    alt={info.label}
                    className="w-full h-full object-cover"
                    width={48}
                    height={48}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-700 leading-tight">
                    {info.label}
                  </h4>
                  <p className="text-slate-400 text-xs truncate">
                    {item.value}
                  </p>
                </div>

                <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm group-hover:shadow transition-shadow">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {t("common.open")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
