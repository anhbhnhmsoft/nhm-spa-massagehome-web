"use client";

import React, { FC, Fragment, useState, useEffect } from "react";
import { ServiceCategoryItem } from "@/features/user/types";
import { TFunction } from "i18next";
import { cn, formatBalance } from "@/lib/utils";
import {
  X,
  Clock,
  Users,
  ImageOff,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

interface Props {
  isVisible: boolean;
  serviceData: ServiceCategoryItem | null;
  onDismiss: () => void;
  t: TFunction;
  handlePrepareBooking: (option: {
    id: string;
    price: string;
    duration: number;
  }) => void;
}

const ServicesModal: FC<Props> = ({
  isVisible,
  serviceData,
  onDismiss,
  t,
  handlePrepareBooking,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // lock scroll when modal is open
  useEffect(() => {
    if (isVisible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50">
      <div className="relative w-full max-w-[750px] bg-white rounded-t-3xl p-4 overflow-y-auto max-h-[90vh] no-scrollbar">
        {/* close icon */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {serviceData ? (
          <div className="px-2 pb-8 pt-2 mt-10">
            {/* cover image */}
            <div className="relative">
              {serviceData.image_url && !imageError ? (
                <Image
                  src={
                    imageError
                      ? "/images/placeholder.jpg"
                      : serviceData.image_url
                  }
                  alt={serviceData.name}
                  width={600}
                  height={300}
                  className="w-full h-48 object-cover rounded-2xl"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-48 rounded-2xl flex items-center justify-center bg-gray-200">
                  <ImageOff className="h-8 w-8 text-slate-400" />
                </div>
              )}
            </div>

            {/* title */}
            <h2 className="text-title-lg font-inter-bold mt-5">
              {serviceData.name}
            </h2>

            {/* booking count */}
            <div className="flex items-center mt-2 gap-2">
              <Users size={16} className="text-slate-500" />
              <span className="text-sm text-slate-500">
                {serviceData.booking_count.toLocaleString()}{" "}
                {t("services.bookings")}
              </span>
            </div>

            {/* description */}
            <p className="text-subtitle text-slate-500 mt-2 leading-6">
              {serviceData.description}
            </p>

            <div className="h-[1px] w-full bg-slate-100 my-4" />

            {/* options list */}
            {serviceData.prices.map((option) => {
              const isSelected = selectedId === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedId(option.id)}
                  className={cn(
                    "flex items-center p-4 mb-3 rounded-2xl border-2 w-full",
                    isSelected
                      ? "border-primary-color-2 bg-blue-50/30"
                      : "border-slate-100 bg-white",
                  )}
                >
                  {/* clock icon */}
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mr-4">
                      <Clock
                        size={22}
                        className={
                          isSelected ? "text-primary-color-2" : "text-slate-500"
                        }
                      />
                    </div>

                    <div className="flex flex-col items-start flex-1">
                      <span className="text-title font-inter-bold text-slate-700 text-left w-full">
                        {option.duration} {t("common.minute")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="text-title font-inter-bold text-slate-700 mr-3">
                      {formatBalance(option.price)} {t("common.currency")}
                    </span>
                    {isSelected ? (
                      <CheckCircle size={24} className="text-primary-color-2" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                    )}
                  </div>
                </button>
              );
            })}

            {/* footer action */}
            <div className="mt-8">
              <div className="w-full bg-slate-100 rounded-2xl py-4 px-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-slate-700 text-title">
                    {t("common.price")}
                  </span>
                  <span className="text-primary-color-2 text-title">
                    {formatBalance(
                      serviceData.prices.find((opt) => opt.id === selectedId)
                        ?.price ?? 0,
                    )}{" "}
                    {t("common.currency")}
                  </span>
                </div>

                <button
                  disabled={!selectedId}
                  onClick={() => {
                    const option = serviceData.prices.find(
                      (opt) => opt.id === selectedId,
                    );
                    if (option) {
                      handlePrepareBooking({
                        id: option.id,
                        price: option.price,
                        duration: option.duration,
                      });
                    }
                  }}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-xl",
                    selectedId ? "bg-primary-color-2" : "bg-slate-300",
                  )}
                >
                  <span className="text-white text-base font-inter-bold mr-2">
                    {t("common.book_now")}
                  </span>
                  <ChevronRight size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Fragment />
        )}
      </div>
    </div>
  );
};

export default ServicesModal;
