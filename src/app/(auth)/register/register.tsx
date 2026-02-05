"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import Image from "next/image";
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
import { usePreviewPdf } from "@/features/app/hooks";

export default function RegisterComponent() {
  const { t } = useTranslation();
  const user_referral = useReferralStore((state) => state.user_referral);
  const { form, onSubmit, loading } = useHandleRegister();
  const { handlePreviewPdf } = usePreviewPdf();

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
    // SafeAreaView tương đương trên Web: h-screen và flex-col
    <div className="relative flex h-screen w-full flex-col bg-white font-inter">
      {/* ScrollView Area: Chứa nội dung form */}
      <main className="flex-1 overflow-y-auto px-5 pt-4">
        <div className="mx-auto w-full max-w-md pb-32">
          {/* pb-32 để không bị nút đè lên nội dung cuối */}
          {/* --- HEADER --- */}
          <div className="mb-8 w-full text-center">
            <h1 className="mb-3 text-2xl font-bold text-gray-900">
              {t("auth.register_title")}
            </h1>
            <p className="px-4 text-base leading-6 text-gray-500">
              {t("auth.register_description")}
            </p>
          </div>
          {/* --- FORM CONTENT --- */}
          <form className="flex flex-col gap-4">
            {/* Name Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
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
                      "h-12 w-full rounded-2xl border bg-white px-4 outline-none transition-all",
                      errors.name
                        ? "border-red-500"
                        : "border-gray-200 focus:border-primary-color-2",
                    )}
                  />
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-500">
                  {errors.name.message as string}
                </p>
              )}
            </div>

            {/* Referral Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                {t("common.referral_code")}
              </label>
              <Controller
                control={control}
                name="referral_code"
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    disabled={!!user_referral}
                    placeholder={t("common.referral_code")}
                    className={cn(
                      "h-12 w-full rounded-2xl border bg-white px-4 outline-none",
                      !!user_referral
                        ? "bg-gray-50 text-gray-400"
                        : "border-gray-200 focus:border-primary-color-2",
                    )}
                  />
                )}
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
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
                        "h-12 w-full rounded-2xl border bg-white px-4 outline-none transition-all",
                        errors.password
                          ? "border-red-500"
                          : "border-gray-200 focus:border-primary-color-2",
                      )}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 opacity-60"
                >
                  {passwordVisible ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            {/* Gender Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                {t("common.gender")} *
              </label>
              <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                  <div className="flex flex-row justify-between gap-4">
                    <GenderCard
                      label={t("common.male")}
                      isActive={value === _Gender.MALE}
                      onPress={() => onChange(_Gender.MALE)}
                    />
                    <GenderCard
                      label={t("common.female")}
                      isActive={value === _Gender.FEMALE}
                      onPress={() => onChange(_Gender.FEMALE)}
                    />
                  </div>
                )}
              />
            </div>

            {/* Language Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
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
                        className="flex h-12 w-full items-center justify-between rounded-2xl border border-gray-300 bg-white px-3"
                      >
                        <div className="flex flex-row items-center gap-2">
                          {langConfig?.icon && (
                            <Image
                              src={langConfig.icon}
                              alt="flag"
                              width={24}
                              height={24}
                              className="mr-2"
                            />
                          )}
                          <span className="font-medium">
                            {langConfig?.label}
                          </span>
                        </div>
                        <ChevronDown size={16} className="text-gray-400" />
                      </button>

                      {modalLangVisible && (
                        <div className="absolute bottom-full z-50 mb-2 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                          {_LanguagesMap.map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => {
                                onChange(lang.code);
                                setModalLangVisible(false);
                              }}
                              className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-gray-50"
                            >
                              <Image
                                src={lang.icon}
                                alt={lang.label}
                                width={24}
                                height={24}
                              />
                              <span className="flex-1 text-left text-sm font-medium">
                                {lang.label}
                              </span>
                              {value === lang.code && (
                                <Check
                                  className="text-primary-color-2"
                                  size={16}
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

            {/* Terms & Conditions */}
            <div className="mt-4 flex flex-row items-start gap-3 px-1 pb-4">
              <button
                type="button"
                onClick={() => setIsAgreed(!isAgreed)}
                className={cn(
                  "mt-0.5 shrink-0",
                  isAgreed ? "text-primary-color-2" : "text-gray-400",
                )}
              >
                {isAgreed ? <CheckSquare size={22} /> : <Square size={22} />}
              </button>
              <div className="flex-1 text-sm leading-5 text-gray-600">
                {t("auth.i_agree_to")}{" "}
                <button
                  type="button"
                  onClick={() => handlePreviewPdf(ContractFileType.TERM_OF_USE)}
                  className="font-bold text-primary-color-2 underline"
                >
                  {t("auth.terms_and_conditions")}
                </button>{" "}
                {t("common.and")}{" "}
                <button
                  type="button"
                  onClick={() =>
                    handlePreviewPdf(ContractFileType.POLICY_PRIVACY)
                  }
                  className="font-bold text-primary-color-2 underline"
                >
                  {t("auth.privacy_policy")}
                </button>
                .
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* --- FIXED/STICKY FOOTER BUTTON --- */}
      <div className="sticky bottom-0 border-t border-gray-100 bg-white px-5 py-6  pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="mx-auto w-full max-w-md">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading || !isAgreed}
            className={cn(
              "flex h-14 w-full items-center justify-center rounded-full text-lg font-bold text-white transition-all active:scale-[0.98]",
              !loading && isAgreed
                ? "bg-primary-color-2"
                : "bg-[#E0E0E0] cursor-not-allowed",
            )}
          >
            {loading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              t("common.continue")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENT (GENDER CARD) ---
const GenderCard = ({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <button
    type="button"
    onClick={onPress}
    className={cn(
      "relative flex aspect-[0.85] flex-1 flex-col items-center justify-center rounded-2xl border transition-all",
      isActive ? "border-blue-300 bg-blue-100" : "border-gray-200 bg-white",
    )}
  >
    <div
      className={cn(
        "mb-3 flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20",
        isActive ? "bg-blue-200" : "bg-gray-100",
      )}
    >
      {label === "Nam" || label === "Male" ? (
        <Mars
          size={40}
          className={isActive ? "text-blue-400" : "text-[#9CA3AF]"}
        />
      ) : (
        <Venus
          size={40}
          className={isActive ? "text-blue-400" : "text-[#9CA3AF]"}
        />
      )}
    </div>
    <span
      className={cn(
        "text-base font-medium sm:text-lg",
        isActive ? "text-gray-900" : "text-gray-500",
      )}
    >
      {label}
    </span>
    {isActive && (
      <div className="absolute right-3 top-3 rounded-full bg-blue-400 p-1">
        <Check size={12} className="text-white" strokeWidth={4} />
      </div>
    )}
  </button>
);
