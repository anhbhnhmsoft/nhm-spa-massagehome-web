"use client";

import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { useHandleAuthenticate } from "@/features/auth/hooks";
import { cn } from "@/lib/utils";
import { _TypeAuthenticate } from "@/features/auth/const";
import {
  ArrowLeft,
  AtSign,
  ChevronRight,
  Loader2,
  PhoneIcon,
} from "lucide-react";

export default function AuthPageComponent() {
  const { t } = useTranslation();
  const { form, onSubmit, loading } = useHandleAuthenticate();
  const [showSelection, setShowSelection] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = form;

  const typeAuthenticate = watch("type_authenticate");
  const username = watch("username");
  const isPhone = typeAuthenticate === _TypeAuthenticate.PHONE;
  const inputLabel = isPhone ? t("common.phone") : t("common.email");
  const inputPlaceholder = isPhone
    ? t("auth.placeholder_phone")
    : t("common.email");
  const inputKeyboardType = isPhone ? "tel" : "email";

  const handleSelectMethod = useCallback(
    (type: _TypeAuthenticate) => {
      setValue("type_authenticate", type);
      setValue("username", "");
      setShowSelection(false);
    },
    [setValue],
  );

  const handleGoBack = () => {
    setShowSelection(true);
    setValue("username", "");
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-inter">
      {showSelection ? (
        // ===== SELECTION SCREEN =====
        <main className="flex w-full flex-col px-5 pt-8 pb-6 max-w-[750px] mx-auto">
          {/* Header with Icon */}
          <div className="mb-12 flex flex-col items-center text-center">
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
              {t("common.welcome_back")}
            </h1>

            <p className="px-2 text-base leading-6 text-gray-500">
              {t("common.choose_method")}
            </p>
          </div>

          {/* Phone Option */}
          <button
            onClick={() => handleSelectMethod(_TypeAuthenticate.PHONE)}
            className="group mb-4 flex items-center overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 hover:shadow-md active:scale-95"
            style={{
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="flex-shrink-0">
              <div className="m-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <PhoneIcon
                  size={28}
                  className="text-blue-600"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            <div className="flex-1">
              <h2 className="mb-1 text-lg font-semibold text-gray-900">
                {t("common.login_phone")}
              </h2>
            </div>

            <div className="mr-5 flex-shrink-0">
              <ChevronRight
                size={24}
                className="text-gray-300"
                strokeWidth={2}
              />
            </div>

            {/* Bottom Border Accent */}
            <div className="absolute bottom-0 left-0 h-1 w-full scale-x-0 bg-blue-600 transition-transform duration-300 group-focus:scale-x-100" />
          </button>

          {/* Email Option */}
          <button
            onClick={() => handleSelectMethod(_TypeAuthenticate.EMAIL)}
            className="group mb-8 flex items-center overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 hover:shadow-md active:scale-95"
            style={{
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="flex-shrink-0">
              <div className="m-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                <AtSign size={28} className="text-red-500" strokeWidth={1.5} />
              </div>
            </div>

            <div className="flex-1">
              <h2 className="mb-1 text-lg font-semibold text-gray-900">
                {t("common.email")}
              </h2>
            </div>

            <div className="mr-5 flex-shrink-0">
              <ChevronRight
                size={24}
                className="text-gray-300"
                strokeWidth={2}
              />
            </div>

            {/* Bottom Border Accent */}
            <div className="absolute bottom-0 left-0 h-1 w-full scale-x-0 bg-red-500 transition-transform duration-300 group-focus:scale-x-100" />
          </button>
        </main>
      ) : (
        // ===== INPUT SCREEN =====
        <main className="flex w-full flex-col justify-between px-5 pt-6 pb-8 max-w-[750px] mx-auto">
          {/* Header Section */}
          <div className="flex-1">
            {/* Back Button */}
            <button
              onClick={handleGoBack}
              disabled={loading}
              className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors duration-200 hover:bg-gray-200 disabled:opacity-50"
            >
              <ArrowLeft size={20} className="text-gray-900" />
            </button>

            {/* Title & Description */}
            <div className="mb-8">
              <h1 className="mb-3 text-3xl font-bold text-gray-900">
                {isPhone
                  ? t("auth.auth_title_phone")
                  : t("auth.auth_title_email")}
              </h1>
              <p className="text-base leading-6 text-gray-500">
                {isPhone
                  ? t("auth.auth_description_phone")
                  : t("auth.auth_description_email")}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Input Field */}
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      {inputLabel} *
                    </label>

                    <input
                      type={inputKeyboardType}
                      inputMode={isPhone ? "numeric" : "email"}
                      placeholder={inputPlaceholder}
                      value={value || ""}
                      onChange={onChange}
                      onBlur={onBlur}
                      disabled={loading}
                      autoFocus
                      autoComplete={isPhone ? "tel" : "email"}
                      className={cn(
                        "h-14 w-full rounded-2xl border bg-white px-4 text-lg font-medium text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400",
                        errors.username
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          : "border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100",
                      )}
                    />

                    {/* Error Message */}
                    {errors.username && (
                      <p className="ml-1 animate-in fade-in slide-in-from-top-1 text-sm font-medium text-red-500">
                        {errors.username.message as string}
                      </p>
                    )}
                  </div>
                )}
              />
            </form>
          </div>

          {/* Footer Section */}
          <div className="border-t border-gray-100 pt-4">
            {/* Continue Button */}
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={loading || !username || !isValid}
              className={cn(
                "flex h-14 w-full items-center justify-center rounded-full text-lg font-bold transition-all duration-300 active:scale-95",
                loading || !username || !isValid
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-primary-color-2 text-white hover:bg-blue-700 active:bg-blue-800",
              )}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  <span>{t("common.loading")}</span>
                </div>
              ) : (
                t("common.continue")
              )}
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
