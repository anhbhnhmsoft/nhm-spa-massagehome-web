"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { useHandleAuthenticate } from "@/features/auth/hooks";
import { cn } from "@/lib/utils";

export default function AuthPageComponent() {
  const { t } = useTranslation();
  const { form, onSubmit, loading } = useHandleAuthenticate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4 font-inter">
      {/* Container chính: Card layout tương tự mobile view nhưng rộng hơn trên web */}
      <main className="flex w-full  flex-col overflow-hidden ">
        {/* --- CONTENT --- */}
        <div className="flex-1 max-w-md mx-auto w-full h-screen">
          {/* Title & Description */}
          <div className="mb-10">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
              {t("auth.auth_title")}
            </h1>
            <p className="text-base leading-relaxed text-gray-500">
              {t("auth.auth_description")}
            </p>
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <div className="flex flex-col gap-2">
                  <div
                    className={cn(
                      "group flex h-14 w-full items-center overflow-hidden rounded-2xl border bg-white transition-all duration-200 focus-within:ring-2",
                      errors.phone
                        ? "border-red-500 focus-within:ring-red-100"
                        : "border-gray-200 focus-within:border-primary-color-2 focus-within:ring-primary-color-2/10",
                    )}
                  >
                    <input
                      className="h-full w-full bg-transparent px-4 text-lg font-medium text-gray-900 outline-none placeholder:text-gray-400"
                      placeholder={t("auth.placeholder_phone")}
                      type="tel"
                      inputMode="numeric"
                      autoFocus
                      value={value || ""}
                      onChange={onChange}
                      onBlur={onBlur}
                    />
                  </div>

                  {/* Error Message */}
                  {errors.phone && (
                    <p className="ml-1 text-sm font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                      {errors.phone.message as string}
                    </p>
                  )}
                </div>
              )}
            />
          </form>
        </div>

        {/* --- FOOTER BUTTON --- */}
        <div className="mt-12">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className={cn(
              "flex h-14 max-w-xs w-full m-auto mt-20 items-center justify-center rounded-full text-lg font-bold text-white transition-all duration-300 active:scale-[0.98]",
              !loading ? "bg-primary-color-2 " : " bg-gray-300",
            )}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{t("common.loading")}</span>
              </div>
            ) : (
              t("common.continue")
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
