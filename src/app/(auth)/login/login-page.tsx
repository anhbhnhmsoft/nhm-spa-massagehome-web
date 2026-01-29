"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { useHandleLogin } from "@/features/auth/hooks";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { t } = useTranslation();
  const { form, onSubmit, loading } = useHandleLogin();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="flex min-h-screen w-full bg-white font-inter">
      <main className="flex w-full flex-col justify-between px-5 pt-6 pb-8 max-w-[750px] mx-auto">
        {/* ===== CONTENT ===== */}
        <div>
          {/* Title */}
          <h1 className="mb-2 text-2xl font-bold text-gray-900 text-center">
            {t("auth.login_title")}
          </h1>

          <p className="mb-10 text-center text-base leading-6 text-gray-500">
            {t("auth.login_description")}
          </p>

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <div className="space-y-2 max-w-md m-auto">
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="**********"
                    value={value || ""}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={cn(
                      "h-12 w-full rounded-2xl border bg-white px-4 pr-12 text-base outline-none transition-all",
                      errors.password
                        ? "border-red-500"
                        : "border-gray-200 focus:border-primary-color-2 focus:ring-2 focus:ring-primary-color-2/10",
                    )}
                  />

                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {passwordVisible ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message as string}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        {/* ===== FOOTER BUTTON ===== */}
        <div className="mt-10">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className={cn(
              "flex h-14 max-w-xs w-full m-auto mt-20 items-center justify-center rounded-full text-lg font-bold text-white transition-all active:scale-[0.98]",
              !loading
                ? "bg-primary-color-2"
                : "bg-gray-300 cursor-not-allowed",
            )}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
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
