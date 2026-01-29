"use client";

import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useHandleVerifyRegisterOtp } from "@/features/auth/hooks";
import { cn } from "@/lib/utils";

export default function VerifyOtp() {
  const { t } = useTranslation();
  const { phoneAuthen, timer, form, onSubmit, resendOTP, loading } =
    useHandleVerifyRegisterOtp();

  const { handleSubmit, setValue, watch } = form;

  const otpValue: string = watch("otp") || "";
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    const v = value.slice(-1);
    if (!/^\d*$/.test(v)) return;

    const next = otpValue.split("");
    next[index] = v;

    setValue("otp", next.join(""), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    if (v && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-dvh w-full flex flex-col pt-10 bg-white">
      {/* App Container */}
      <div className="mx-auto flex min-h-dvh w-full max-w-[750px] flex-col">
        {/* CONTENT */}
        <div className=" px-5 pt-6">
          {/* Title */}
          <h1 className="mb-3 text-center text-2xl font-bold text-gray-900">
            {t("auth.auth_verify_title")}
          </h1>

          {/* Description */}
          <p className="mb-1 text-center text-gray-500">
            {t("auth.auth_verify_description")}
          </p>

          <p className="mb-8 text-center font-bold text-primary-color-2">
            {phoneAuthen}
          </p>

          {/* OTP INPUT */}
          <div className="flex justify-center gap-2">
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                ref={(el: HTMLInputElement | null) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otpValue[i] || ""}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className={cn(
                  "h-14 w-12 rounded-xl border text-center text-2xl font-medium outline-none transition",
                  otpValue[i]
                    ? "border-primary-color-2"
                    : "border-gray-300 focus:border-primary-color-2",
                )}
              />
            ))}
          </div>

          {/* RESEND */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={resendOTP}
              disabled={timer > 0 || loading}
              className={cn(
                "text-base font-medium",
                timer > 0
                  ? "text-primary-color-2"
                  : "text-gray-400 hover:text-primary-color-2",
              )}
            >
              {timer > 0
                ? `${t("auth.resend_otp")} (${timer})`
                : t("auth.resend_otp")}
            </button>
          </div>
        </div>

        <div className=" m-auto w-full px-5 pb-[env(safe-area-inset-bottom)] max-w-[480px]">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={otpValue.length !== 6 || loading}
            className={cn(
              "flex m-auto h-14 w-full items-center justify-center rounded-full text-lg font-bold text-white transition active:scale-[0.98]",
              otpValue.length === 6 && !loading
                ? "bg-primary-color-2"
                : "cursor-not-allowed bg-gray-200",
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
