"use client";

import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { useHandleLogin } from "@/features/auth/hooks";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormInput } from "@/components/ui/form-input";

export default function LoginPage() {
  const { t } = useTranslation();
  const { form, onSubmit, onForgotPassword, loading } = useHandleLogin();

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
          <h1 className="mb-2 text-2xl font-bold text-gray-900 text-center ">
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
              <FormInput
                id="password"
                required
                description={t("common.password_description")}
                placeholder={t("common.password")}
                label={t("common.password")}
                error={errors.password?.message}
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                type={"password"}
                isPassword={true}
              />
            )}
          />
        </div>

        {/* ===== FOOTER BUTTONS ===== */}
        <div className="flex flex-col gap-4 mt-10">
          {/* Forgot Password Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={onForgotPassword}
              disabled={loading}
              className={cn(
                "font-semibold transition-all",
                !loading
                  ? "text-primary-color-2"
                  : "text-gray-400 cursor-not-allowed",
              )}
            >
              {t("auth.forgot_password")}
            </button>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className={cn(
              "flex h-14 w-full max-w-lg mx-auto items-center justify-center rounded-full text-lg font-bold text-white transition-all active:scale-[0.98]",
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
