"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { Trash2, Loader2 } from "lucide-react";
import dayjs from "dayjs";

// Hooks & Consts (Giữ nguyên logic của bạn)
import { _Gender } from "@/features/auth/const";
import { useEditProfile, useLockAccount } from "@/features/auth/hooks";
import { cn } from "@/lib/utils";
import HeaderBack from "@/components/header-back";

export default function EditInfoComponent() {
  const { t } = useTranslation();
  const router = useRouter();

  const { handleLockAccount, isPending } = useLockAccount();
  const { form, onSubmit } = useEditProfile();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-8">
      {/* Header - Mobile Style */}

      <HeaderBack title={t("profile.edit_info")} />

      <main className="max-w-2xl mx-auto p-4 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <FormInput label={t("common.full_name")} error={errors.name?.message}>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Nhập họ và tên"
                  className={cn(
                    "w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-primary-color-2",
                    errors.name?.message && "border-red-500",
                  )}
                />
              )}
            />
          </FormInput>

          {/* Gender Field */}
          <FormInput label={t("common.gender")} error={errors.gender?.message}>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <div className="flex gap-4">
                  {[
                    { label: t("common.male"), value: _Gender.MALE },
                    { label: t("common.female"), value: _Gender.FEMALE },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => onChange(item.value)}
                      className={cn(
                        "flex-1 flex items-center justify-center rounded-lg border py-3 font-medium transition-all",
                        value === item.value
                          ? "border-primary-color-2 bg-blue-50 text-primary-color-2"
                          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </FormInput>

          {/* Date of Birth */}
          <FormInput
            label={t("common.date_of_birth")}
            error={errors.date_of_birth?.message}
          >
            <Controller
              control={control}
              name="date_of_birth"
              render={({ field: { value, onChange } }) => (
                <input
                  type="date"
                  value={value ? dayjs(value).format("YYYY-MM-DD") : ""}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    onChange(date.toISOString());
                  }}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-primary-color-2"
                />
              )}
            />
          </FormInput>

          {/* Bio Field */}
          <FormInput label={t("common.bio")} error={errors.bio?.message}>
            <Controller
              control={control}
              name="bio"
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Giới thiệu đôi chút về bản thân..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-primary-color-2 resize-none"
                />
              )}
            />
          </FormInput>

          <hr className="my-6 border-gray-200" />
          <h2 className="mb-4 text-lg font-bold text-slate-800">
            {t("common.security")}
          </h2>

          {/* Old Password */}
          <FormInput
            label={t("common.old_password")}
            error={errors.old_password?.message}
          >
            <Controller
              control={control}
              name="old_password"
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-primary-color-2"
                />
              )}
            />
          </FormInput>

          {/* New Password */}
          <FormInput
            label={t("common.new_password")}
            error={errors.new_password?.message}
          >
            <Controller
              control={control}
              name="new_password"
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  placeholder={t("common.new_password_placeholder")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-primary-color-2"
                />
              )}
            />
          </FormInput>

          {/* Delete Account */}
          <button
            type="button"
            onClick={handleLockAccount}
            disabled={isPending}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-3 text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={18} />
            <span className="font-bold">{t("profile.delete_account")}</span>
          </button>

          {/* Action Buttons - Fixed bottom on mobile, normal on desktop */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-4 md:static md:border-none md:px-0">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-lg bg-gray-100 text-primary-color-2 font-bold hover:bg-gray-200 transition-colors"
            >
              {t("common.back")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {t("common.save")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// Helper Component
const FormInput = ({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);
