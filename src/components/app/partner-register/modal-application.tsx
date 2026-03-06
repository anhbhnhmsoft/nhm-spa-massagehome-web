"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Info,
  User,
  Briefcase,
  BadgeCheck,
  Star,
  Link as LinkIcon,
} from "lucide-react";
import { _UserRole } from "@/features/auth/const";
import useAuthStore from "@/features/auth/store/auth-store";
import {
  _ReviewApplicationStatus,
  _ReviewApplicationStatusMap,
} from "@/features/user/const";
import Image from "next/image";

type ModalApplicationProps = {
  isVisible: boolean;
  onClose: () => void;
  data: any; // Thay bằng type CheckApplyPartnerResponse['data']['review_application'] của bạn
};

const statusMap = (status: _ReviewApplicationStatus) => {
  switch (status) {
    case _ReviewApplicationStatus.PENDING:
      return {
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
        text: _ReviewApplicationStatusMap[status],
      };
    case _ReviewApplicationStatus.APPROVED:
      return {
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        text: _ReviewApplicationStatusMap[status],
      };
    case _ReviewApplicationStatus.REJECTED:
      return {
        bgColor: "bg-red-100",
        textColor: "text-red-600",
        text: _ReviewApplicationStatusMap[status],
      };
    default:
      return { bgColor: "bg-gray-100", textColor: "text-gray-600", text: "" };
  }
};

const ModalApplication = ({
  isVisible,
  onClose,
  data,
}: ModalApplicationProps) => {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);

  if (!isVisible || !data) return null;

  const statusMapping = statusMap(data.status);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl sm:h-[90vh] sm:rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white sticky top-0 z-10">
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
          <h2 className="text-lg font-bold text-slate-900">
            {t("profile.partner_form.modal_application.title")}
          </h2>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
          {/* Status Banner */}
          <div
            className={`flex flex-col p-5 rounded-2xl mb-8 ${statusMapping.bgColor}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Info size={20} className={statusMapping.textColor} />
              <span className={`font-bold ${statusMapping.textColor}`}>
                {t(statusMapping.text)}
              </span>
            </div>
            {data.reason_cancel && (
              <p className="text-sm text-slate-600 italic mt-1">
                {t("profile.partner_form.modal_application.reason")}:{" "}
                {data.reason_cancel}
              </p>
            )}
          </div>

          {/* Section 1: Thông tin cơ bản */}
          <section className="mb-10">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">
              {t("profile.partner_form.modal_application.information")}
            </h3>

            <div className="divide-y divide-gray-50 border-y border-gray-50">
              {data.role === _UserRole.KTV ? (
                <>
                  <InfoRow
                    icon={<User size={18} />}
                    label={t("profile.partner_form.modal_application.nickname")}
                    value={data.nickname}
                  />
                  <InfoRow
                    icon={<Briefcase size={18} />}
                    label={t(
                      "profile.partner_form.modal_application.experience",
                    )}
                    value={`${data.experience} ${t("common.year")}`}
                  />
                  <InfoRow
                    icon={<BadgeCheck size={18} />}
                    label={t("profile.partner_form.modal_application.role")}
                    value={t("profile.partner_form.modal_application.ktv")}
                  />
                  <InfoRow
                    icon={<Star size={18} />}
                    label={t("profile.partner_form.modal_application.leader")}
                    value={data.is_leader ? t("common.yes") : t("common.no")}
                  />
                  <InfoRow
                    icon={<LinkIcon size={18} />}
                    label={t(
                      "profile.partner_form.modal_application.referrer_id",
                    )}
                    value={data.referrer_id || t("common.no")}
                  />
                </>
              ) : (
                <InfoRow
                  icon={<BadgeCheck size={18} />}
                  label={t("profile.partner_form.modal_application.role")}
                  value={t("profile.partner_form.modal_application.agency")}
                />
              )}
            </div>
          </section>

          {/* Section 2: Bio đa ngôn ngữ */}
          <section className="mb-10 rounded-2xl bg-slate-50 p-6">
            <h3 className="mb-5 text-xs font-black uppercase tracking-widest text-slate-400">
              {t("profile.partner_form.modal_application.bio")}
            </h3>
            <div className="space-y-6">
              {[
                { label: "Tiếng Việt", key: "vi", color: "border-blue-500" },
                { label: "English", key: "en", color: "border-slate-300" },
                { label: "中文", key: "cn", color: "border-slate-300" },
              ].map((lang) => (
                <div key={lang.key} className={`border-l-4 ${lang.color} pl-4`}>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    {lang.label}
                  </span>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {data.bio?.[lang.key] || "---"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Giấy tờ xác thực */}
          <section className="mb-10">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">
              {t("profile.partner_form.modal_application.identity")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <ImageItem
                label={t("profile.partner_form.modal_application.cccd_front")}
                uri={data.cccd_front}
                token={token}
              />
              <ImageItem
                label={t("profile.partner_form.modal_application.cccd_back")}
                uri={data.cccd_back}
                token={token}
              />
              <ImageItem
                label={t(
                  "profile.partner_form.modal_application.face_with_identity_card",
                )}
                uri={data.face_with_identity_card}
                token={token}
              />
              {data.role === _UserRole.KTV && (
                <ImageItem
                  label={t(
                    "profile.partner_form.modal_application.certificate",
                  )}
                  uri={data.certificate}
                  token={token}
                />
              )}
            </div>
          </section>

          {/* Section 4: Gallery */}
          {data.role === _UserRole.KTV && data.gallery?.length > 0 && (
            <section className="mb-10">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                {t("profile.partner_form.modal_application.gallery")} (
                {data.gallery.length})
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {data.gallery.map((img: string, idx: number) => (
                  <Image
                    key={idx}
                    width={400}
                    height={400}
                    src={img}
                    alt="Gallery"
                    className="h-40 w-40 shrink-0 rounded-2xl object-cover shadow-sm border border-slate-100"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component: Hàng thông tin
const InfoRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-3.5">
    <div className="flex items-center gap-3 text-slate-500">
      <span className="text-slate-400">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className="text-sm font-bold text-slate-900">{value}</span>
  </div>
);

// Sub-component: Hiển thị ảnh kèm Token
const ImageItem = ({
  label,
  uri,
  token,
}: {
  label: string;
  uri: string;
  token: string | null;
}) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    if (uri && token) {
      fetch(uri, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.blob())
        .then((blob) => setImgSrc(URL.createObjectURL(blob)));
    }
  }, [uri, token]);

  if (!imgSrc) return null;
  return (
    <div className="space-y-2">
      <span className="text-[11px] text-slate-500 font-medium">{label}</span>
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={label}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400 italic">
            N/A
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalApplication;
