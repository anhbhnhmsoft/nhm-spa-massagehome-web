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
    formState: { errors, isValid },
  } = form;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-inter">
      {/* Container chính: Bo góc lớn, đổ bóng sâu, giới hạn 1024px */}
      <main className="flex w-full max-w-[1024px] overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-2xl shadow-gray-200/50 md:flex-row">
        {/* Cột trái: Gradient & Branding (Ẩn trên mobile) */}
        <div
          className="hidden w-1/2 flex-col justify-center bg-gradient-to-br from-primary-color-2 to-indigo-600 p-12 text-white md:flex"
          style={{ backgroundColor: "var(--primary-color-2, #2563eb)" }}
        >
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight">
            {t("auth.auth_title")}
          </h1>
          <p className="text-lg leading-relaxed text-white/80">
            {t("auth.auth_description")}
          </p>
          <div className="mt-12 h-1 w-20 rounded-full bg-white/30" />
        </div>

        {/* Cột phải: Form nhập liệu */}
        <div className="flex flex-1 flex-col justify-between p-8 py-12 md:p-16">
          <div className="w-full">
            {/* Header chỉ hiện trên Mobile */}
            <div className="mb-10 text-center md:hidden">
              <h1 className="mb-2 text-3xl font-extrabold text-gray-900">
                {t("auth.auth_title")}
              </h1>
              <p className="text-gray-500">{t("auth.auth_description")}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  {t("auth.placeholder_phone")} *
                </label>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <div className="relative">
                      <input
                        className={cn(
                          "h-14 w-full rounded-2xl border bg-gray-50 px-5 text-lg font-medium outline-none transition-all duration-200",
                          errors.phone
                            ? "border-red-500 bg-red-50/30 focus:border-red-500"
                            : "border-gray-200 focus:border-primary-color-2 focus:bg-white focus:ring-4 focus:ring-primary-color-2/10",
                        )}
                        placeholder="0xxx xxx xxx"
                        type="tel"
                        autoFocus
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    </div>
                  )}
                />
                {errors.phone && (
                  <p className="ml-1 text-sm font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                    {errors.phone.message as string}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Footer Button Section */}
          <div className="mt-12 space-y-4">
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className={cn(
                "flex h-16 w-full items-center justify-center rounded-[20px] text-lg font-bold text-white transition-all duration-300 active:scale-[0.98]",
                !loading
                  ? "bg-primary-color-2 shadow-lg shadow-primary-color-2/25 hover:brightness-110"
                  : "cursor-not-allowed bg-gray-200",
              )}
              style={{
                backgroundColor: !loading
                  ? "var(--primary-color-2, #2563eb)"
                  : undefined,
              }}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{t("common.loading")}</span>
                </div>
              ) : (
                t("common.continue")
              )}
            </button>

            <p className="text-center text-sm text-gray-400">
              {t("auth.auth_footer_note") || "Security verified by NHM System"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
