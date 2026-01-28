"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mars,
  Venus,
  CheckSquare,
  Square,
  ChevronDown,
  Check,
} from "lucide-react";

import { useHandleRegister } from "@/features/auth/hooks";
import { useReferralStore } from "@/features/affiliate/store";
import { _Gender } from "@/features/auth/const";
import { _LanguagesMap } from "@/lib/const";
import { cn } from "@/lib/utils";
import { ContractFileType } from "@/features/file/const";

// Giả định bạn có SelectLanguageModal phiên bản Web,
// nếu chưa có mình sẽ render một dropdown đơn giản.

export default function RegisterComponent() {
  const { t } = useTranslation();
  const router = useRouter();
  const user_referral = useReferralStore((state) => state.user_referral);
  const { form, onSubmit, loading } = useHandleRegister();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [modalLangVisible, setModalLangVisible] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;

  useEffect(() => {
    if (user_referral) {
      setValue("referral_code", user_referral.id);
    }
  }, [user_referral, setValue]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-inter">
      <main className="flex w-full max-w-[1024px] overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-2xl md:flex-row">
        {/* Cột trái: Hình ảnh/Gradient (Ẩn trên mobile) */}
        <div className="hidden w-1/2 bg-gradient-to-br from-primary-color-2 to-indigo-600 p-12 md:flex flex-col justify-center items-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            {t("auth.register_title")}
          </h2>
          <p className="text-white/80 text-center text-lg leading-relaxed">
            {t("auth.register_description")}
          </p>
        </div>

        {/* Cột phải: Form đăng ký */}
        <div className="flex flex-1 flex-col p-6 md:p-12 max-h-[90vh] overflow-y-auto">
          <div className="md:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {t("auth.register_title")}
            </h1>
            <p className="text-gray-500 mt-2">
              {t("auth.register_description")}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                {t("common.name")} *
              </label>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder={t("common.name")}
                    className={cn(
                      "h-12 w-full rounded-2xl border bg-gray-50 px-4 outline-none transition-all focus:border-primary-color-2 focus:bg-white focus:ring-4 focus:ring-primary-color-2/10",
                      errors.name ? "border-red-500" : "border-gray-200",
                    )}
                  />
                )}
              />
              {errors.name && (
                <p className="text-xs text-red-500 ml-1">
                  {errors.name.message as string}
                </p>
              )}
            </div>

            {/* Referral Code */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                {t("common.referral_code")}
              </label>
              <Controller
                control={control}
                name="referral_code"
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    readOnly={!!user_referral}
                    placeholder={t("common.referral_code")}
                    className={cn(
                      "h-12 w-full rounded-2xl border bg-gray-50 px-4 outline-none transition-all",
                      user_referral
                        ? "opacity-60 cursor-not-allowed"
                        : "focus:border-primary-color-2 focus:bg-white",
                      errors.referral_code
                        ? "border-red-500"
                        : "border-gray-200",
                    )}
                  />
                )}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                {t("common.password")} *
              </label>
              <div className="relative">
                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <input
                      {...field}
                      type={passwordVisible ? "text" : "password"}
                      placeholder="**********"
                      className={cn(
                        "h-12 w-full rounded-2xl border bg-gray-50 px-4 outline-none transition-all focus:border-primary-color-2 focus:bg-white",
                        errors.password ? "border-red-500" : "border-gray-200",
                      )}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 ml-1">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            {/* Gender Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                {t("common.gender")} *
              </label>
              <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                  <div className="flex gap-4">
                    <GenderCard
                      label={t("common.male")}
                      icon={Mars}
                      isActive={value === _Gender.MALE}
                      onPress={() => onChange(_Gender.MALE)}
                    />
                    <GenderCard
                      label={t("common.female")}
                      icon={Venus}
                      isActive={value === _Gender.FEMALE}
                      onPress={() => onChange(_Gender.FEMALE)}
                    />
                  </div>
                )}
              />
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                {t("common.language")} *
              </label>
              <Controller
                control={control}
                name="language"
                render={({ field: { value, onChange } }) => {
                  const langConfig = _LanguagesMap.find(
                    (l) => l.code === value,
                  );
                  return (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setModalLangVisible(!modalLangVisible)}
                        className="flex h-12 w-full items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 transition-all hover:bg-white focus:border-primary-color-2"
                      >
                        <div className="flex items-center gap-3">
                          {langConfig?.icon && (
                            <Image
                              src={langConfig.icon}
                              alt="flag"
                              width={24}
                              height={24}
                              className="rounded-sm"
                            />
                          )}
                          <span className="font-medium text-gray-700">
                            {langConfig?.label}
                          </span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "text-gray-400 transition-transform",
                            modalLangVisible && "rotate-180",
                          )}
                          size={20}
                        />
                      </button>

                      {/* Simple Web Dropdown (Thay thế SelectLanguageModal nếu cần) */}
                      {modalLangVisible && (
                        <div className="absolute z-10 mt-2 w-full rounded-2xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2">
                          {_LanguagesMap.map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => {
                                onChange(lang.code);
                                setModalLangVisible(false);
                              }}
                              className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors"
                            >
                              <Image
                                src={lang.icon}
                                alt={lang.label}
                                width={24}
                                height={24}
                              />
                              <span className="flex-1 text-left font-medium">
                                {lang.label}
                              </span>
                              {value === lang.code && (
                                <Check
                                  className="text-primary-color-2"
                                  size={18}
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            </div>

            {/* Terms and Conditions */}
            <div className="pt-2">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setIsAgreed(!isAgreed)}
                  className={cn(
                    "mt-1 shrink-0 transition-colors",
                    isAgreed ? "text-primary-color-2" : "text-gray-300",
                  )}
                >
                  {isAgreed ? (
                    <CheckSquare
                      size={22}
                      fill="currentColor"
                      className="text-white fill-primary-color-2"
                    />
                  ) : (
                    <Square size={22} />
                  )}
                </button>
                <p className="text-sm leading-6 text-gray-600">
                  {t("auth.i_agree_to")}{" "}
                  <Link
                    href={`/term-or-use-pdf?type=${ContractFileType.TERM_OF_USE}`}
                    className="font-bold text-primary-color-2 hover:underline"
                  >
                    {t("auth.terms_and_conditions")}
                  </Link>{" "}
                  {t("common.and")}{" "}
                  <Link
                    href={`/term-or-use-pdf?type=${ContractFileType.POLICY_PRIVACY}`}
                    className="font-bold text-primary-color-2 hover:underline"
                  >
                    {t("auth.privacy_policy")}
                  </Link>
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isAgreed}
              className={cn(
                "mt-6 flex h-14 w-full items-center justify-center rounded-full text-lg font-bold text-white transition-all duration-300",
                !loading && isAgreed
                  ? "bg-primary-color-2 shadow-lg shadow-primary-color-2/30 hover:brightness-110 active:scale-95"
                  : "bg-gray-200 cursor-not-allowed text-gray-400",
              )}
            >
              {loading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                t("common.continue")
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

// --- SUB COMPONENT: GENDER CARD (Web Version) ---
const GenderCard = ({
  label,
  isActive,
  onPress,
  icon: IconComponent,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon: any;
}) => {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 py-6 transition-all duration-300",
        isActive
          ? "border-primary-color-2 bg-blue-50/50 ring-4 ring-primary-color-2/5"
          : "border-gray-100 bg-white hover:border-gray-200",
      )}
    >
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full transition-colors",
          isActive
            ? "bg-primary-color-2/10 text-primary-color-2"
            : "bg-gray-50 text-gray-400",
        )}
      >
        <IconComponent size={32} />
      </div>
      <span
        className={cn(
          "font-bold",
          isActive ? "text-gray-900" : "text-gray-500",
        )}
      >
        {label}
      </span>
      {isActive && (
        <div className="absolute right-2 top-2 rounded-full bg-primary-color-2 p-1">
          <Check size={12} strokeWidth={4} className="text-white" />
        </div>
      )}
    </button>
  );
};
