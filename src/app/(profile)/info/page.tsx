"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Camera, User as UserIcon, ChevronLeft } from "lucide-react";
import dayjs from "dayjs";
import useAuthStore from "@/features/auth/store";
import { _Gender, _GenderMap } from "@/features/auth/const";
import { useChangeAvatar } from "@/features/auth/hooks";

export default function UserProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [imageError, setImageError] = useState(false);
  const { chooseImageFormLib, deleteAvatar } = useChangeAvatar();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* Container giới hạn 750px tương tự các màn hình trước */}
      <div className="w-full max-w-[750px] bg-white shadow-sm flex flex-col min-h-screen">
        {/* --- HEADER --- */}
        <header className="sticky top-0 z-50 flex items-center bg-white px-4 py-4 border-b border-gray-100">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-slate-900" />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg pr-10 text-slate-900">
            {t("profile.user_info_title")}
          </h1>
        </header>

        {/* --- CONTENT --- */}
        {user ? (
          <main className="flex-1 overflow-y-auto pb-20">
            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center py-10">
              <div className="relative group">
                <div className="h-32 w-32 relative rounded-full border-4 border-gray-50 shadow-md overflow-hidden bg-slate-100">
                  {user.profile.avatar_url && !imageError ? (
                    <Image
                      src={user.profile.avatar_url}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <UserIcon size={48} />
                    </div>
                  )}
                </div>

                {/* Nút đổi ảnh */}
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute bottom-1 right-1 rounded-full border-2 border-white bg-blue-600 p-2 text-white shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera size={18} />
                </button>
              </div>
            </div>

            {/* Info List */}
            <div className="px-6 space-y-1">
              <InfoItem
                label={t("common.full_name")}
                value={user.name || t("common.unknown")}
              />
              <InfoItem
                label={t("common.phone")}
                value={user.phone || t("common.unknown")}
              />
              <InfoItem
                label={t("common.gender")}
                value={
                  t(_GenderMap[user.profile.gender || _Gender.MALE]) ||
                  t("common.unknown")
                }
              />
              <InfoItem
                label={t("common.date_of_birth")}
                value={
                  user.profile.date_of_birth
                    ? dayjs(user.profile.date_of_birth).format("DD/MM/YYYY")
                    : t("common.unknown")
                }
              />

              {/* Bio Section */}
              <div className="flex flex-col items-start gap-1 py-5 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  {t("common.bio")}
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {user.profile.bio || t("common.unknown")}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 px-6">
              <button
                onClick={() => router.push("/info/edit-info")}
                className="w-full rounded-2xl bg-blue-50 py-4 text-center font-bold text-blue-600 hover:bg-blue-100 transition-colors active:scale-[0.99]"
              >
                {t("profile.edit_info")}
              </button>
            </div>
          </main>
        ) : (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Giả lập Bottom Sheet bằng Overlay Modal trên Web 
         Bạn có thể thay thế bằng component BottomEditAvatar bản Web của bạn
      */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center p-0 sm:p-4">
          <div className="w-full max-w-[750px] bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">{t("profile.edit_avatar")}</h3>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-2 bg-gray-100 rounded-full"
              >
                <ChevronLeft size={20} className="rotate-[-90deg]" />
              </button>
            </div>
            {/* Các option edit/delete avatar ở đây */}
            <div className="space-y-3">
              <button
                className="w-full py-4 text-left font-medium border-b border-gray-50 hover:text-blue-600"
                onClick={() =>
                  chooseImageFormLib().finally(() =>
                    setIsAvatarModalOpen(false),
                  )
                }
              >
                {t("profile.choose_from_lib")}
              </button>
              {user?.profile.avatar_url && (
                <button
                  className="w-full py-4 text-left font-medium text-red-500 hover:bg-red-50"
                  onClick={() => {
                    deleteAvatar();
                    setIsAvatarModalOpen(false);
                  }}
                >
                  {t("profile.delete_avatar_title")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component phụ cho Web
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-5 group">
      <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-slate-700 font-semibold">{value}</span>
    </div>
  );
}
