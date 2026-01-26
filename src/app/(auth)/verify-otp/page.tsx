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

    const currentOtp = otpValue.split("");
    currentOtp[index] = v;
    const newOtp = currentOtp.join("");

    setValue("otp", newOtp, {
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-inter">
      {/* Container chính: Đồng bộ max-width 1024px và bo góc 32px */}
      <main className="flex w-full max-w-[1024px] overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-2xl shadow-gray-200/50 md:flex-row">
        {/* Cột trái: Gradient đồng bộ với màn Register/Auth */}
        <div
          className="hidden w-1/2 flex-col justify-center bg-gradient-to-br from-primary-color-2 to-indigo-600 p-12 text-white md:flex"
          style={{ backgroundColor: "var(--primary-color-2, #2563eb)" }}
        >
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight">
            {t("auth.auth_verify_title")}
          </h1>
          <p className="text-lg leading-relaxed text-white/80">
            {t("auth.auth_verify_description")}
          </p>
          <div className="mt-8 flex items-center gap-2">
            <div className="h-1 w-12 rounded-full bg-white" />
            <span className="text-sm font-bold uppercase tracking-widest opacity-60">
              Security First
            </span>
          </div>
        </div>

        {/* Cột phải: Form OTP */}
        <div className="flex flex-1 flex-col justify-between p-8 py-12 md:p-16">
          <div className="w-full">
            {/* Header Mobile */}
            <div className="mb-10 text-center md:hidden">
              <h1 className="mb-2 text-3xl font-extrabold text-gray-900">
                {t("auth.auth_verify_title")}
              </h1>
              <p className="text-gray-500">
                {t("auth.auth_verify_description")}
              </p>
            </div>

            {/* Thông tin số điện thoại */}
            <div className="mb-10 text-center md:text-left">
              <p className="text-gray-500 text-base">
                {t("auth.otp_sent_to") || "Mã xác thực đã được gửi đến"}
              </p>
              <span className="mt-1 block text-2xl font-bold text-primary-color-2 tracking-tight">
                {phoneAuthen}
              </span>
            </div>

            {/* OTP Input Group */}
            <div className="flex justify-center gap-2 md:justify-start md:gap-3">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otpValue[i] || ""}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className={cn(
                    "h-14 w-11 md:h-16 md:w-14 rounded-2xl border-2 text-center text-2xl font-bold transition-all duration-300 outline-none",
                    otpValue[i]
                      ? "border-primary-color-2 bg-white ring-4 ring-primary-color-2/10 shadow-sm"
                      : "border-gray-100 bg-gray-50/50 focus:border-primary-color-2 focus:bg-white focus:ring-4 focus:ring-primary-color-2/10",
                  )}
                />
              ))}
            </div>

            {/* Resend Section */}
            <div className="mt-8 text-center md:text-left">
              <button
                type="button"
                onClick={resendOTP}
                disabled={timer > 0 || loading}
                className={cn(
                  "text-base font-semibold transition-all hover:opacity-80 active:scale-95",
                  timer > 0
                    ? "text-primary-color-2"
                    : "text-gray-400 hover:text-primary-color-2",
                )}
              >
                {timer > 0
                  ? `${t("auth.resend_otp")} (${timer}s)`
                  : t("auth.resend_otp")}
              </button>
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-12">
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={otpValue.length !== 6 || loading}
              className={cn(
                "flex h-16 w-full items-center justify-center rounded-[20px] text-lg font-bold text-white transition-all duration-300 active:scale-[0.98]",
                otpValue.length === 6 && !loading
                  ? "bg-primary-color-2 shadow-lg shadow-primary-color-2/25 hover:brightness-110"
                  : "cursor-not-allowed bg-gray-200",
              )}
              style={{
                backgroundColor:
                  otpValue.length === 6 && !loading
                    ? "var(--primary-color-2, #2563eb)"
                    : undefined,
              }}
            >
              {loading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                t("common.continue")
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
