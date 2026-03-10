"use client";

import React, { useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckSquare, Square } from "lucide-react";
import { _PartnerFileType } from "@/features/user/const";
import ImageSlot from "@/components/app/partner-register/image-slot";
import { useImagePicker } from "@/features/app/hooks/use-image-picker";
import { InputField } from "@/components/app/partner-register/input-field";
import HeaderBack from "@/components/header-back";
import { ContractFileType } from "@/features/file/const";
import ModalApplication, {
  CardPendingApplication,
  CardReasonRejectApplication,
} from "@/components/app/partner-register/register-application";
import {
  getFilesByType,
  useRegisterTechnical,
} from "@/features/user/hooks/use-register-technical";
import { useCheckPartnerRegister } from "@/features/user/hooks/use-check-partner-register";
import useUserServiceStore from "@/features/user/stores";
import {
  addOrUpdateFile,
  appendFile,
  getErrorsFileType,
  removeFileByType,
  removeSpecificFile,
  updateSpecificFile,
} from "@/lib/utils";
import { usePreviewPdf } from "@/features/app/hooks";

export default function PartnerRegisterIndividualPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { handlePreviewPdf } = usePreviewPdf();
  const forWho = useUserServiceStore((state) => state.forWho);
  const searchParams = useSearchParams();

  const referrer_id_param = searchParams?.get("referrer_id");

  const isLeader = forWho === "1";

  const { pickImage } = useImagePicker();

  const { showForm, reviewApplication } = useCheckPartnerRegister();

  const { form, onSubmit, loading } = useRegisterTechnical({
    isLeader: isLeader,
    referrer_id: referrer_id_param || "",
  });
  const [isAgreed, setIsAgreed] = useState<boolean>(false);

  const [showModalApplication, setShowModalApplication] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = form;

  // Tên tiêu đề header
  const title = useMemo(() => {
    if (isLeader) {
      return "profile.partner_form.title_technician_leader";
    }
    return "profile.partner_form.title";
  }, [isLeader]);

  return (
    <div className="min-h-screen w-full bg-white pb-32">
      <HeaderBack
        title={title}
        onBack={() => {
          router.back();
        }}
      />
      <main className="mx-auto max-w-2xl px-4 mt-6 space-y-8 flex-1 pb-32">
        {/* Status Pending */}
        {!showForm && reviewApplication && (
          <CardPendingApplication
            data={reviewApplication}
            setShowModalApplication={setShowModalApplication}
          />
        )}

        {/* Form */}
        {showForm && (
          <div>
            {/* Hiển thị lý do từ chối */}
            <CardReasonRejectApplication
              data={reviewApplication}
              setShowModalApplication={setShowModalApplication}
            />

            {/* Ảnh CCCD (trước và sau và ảnh chụp cùng cccd) */}
            <section>
              <p className="mb-2 font-bold text-slate-900">
                {t("profile.partner_form.id_title")}
                <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="file_uploads"
                render={({ field: { value = [], onChange } }) => {
                  const idFront = getFilesByType(
                    value,
                    _PartnerFileType.IDENTITY_CARD_FRONT,
                  )[0];
                  const idBack = getFilesByType(
                    value,
                    _PartnerFileType.IDENTITY_CARD_BACK,
                  )[0];
                  const faceFile = getFilesByType(
                    value,
                    _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                  )[0];

                  const errorIdFront = getErrorsFileType(
                    errors,
                    _PartnerFileType.IDENTITY_CARD_FRONT,
                  );
                  const errorIdBack = getErrorsFileType(
                    errors,
                    _PartnerFileType.IDENTITY_CARD_BACK,
                  );
                  const errorFaceId = getErrorsFileType(
                    errors,
                    _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                  );

                  return (
                    <div>
                      <div className="flex flex-wrap gap-3">
                        <ImageSlot
                          uri={idFront?.preview || null}
                          label={t("profile.partner_form.id_front")}
                          onAdd={() =>
                            pickImage((preview, file) => {
                              if (!file || !preview) return;
                              const newFilesArray = addOrUpdateFile(
                                value,
                                _PartnerFileType.IDENTITY_CARD_FRONT,
                                file,
                                preview,
                              );
                              onChange(newFilesArray);
                            })
                          }
                          onRemove={() =>
                            onChange(
                              removeFileByType(
                                value,
                                _PartnerFileType.IDENTITY_CARD_FRONT,
                              ),
                            )
                          }
                        />
                        <ImageSlot
                          uri={idBack?.preview || null}
                          label={t("profile.partner_form.id_back")}
                          onAdd={() =>
                            pickImage((preview, file) => {
                              if (!file || !preview) return;
                              const newFilesArray = addOrUpdateFile(
                                value,
                                _PartnerFileType.IDENTITY_CARD_BACK,
                                file,
                                preview,
                              );
                              onChange(newFilesArray);
                            })
                          }
                          onRemove={() =>
                            onChange(
                              removeFileByType(
                                value,
                                _PartnerFileType.IDENTITY_CARD_BACK,
                              ),
                            )
                          }
                        />
                        <ImageSlot
                          uri={faceFile?.preview || null}
                          label={t("profile.partner_form.face_with_id")}
                          onAdd={() =>
                            pickImage((preview, file) => {
                              if (!file || !preview) return;
                              const newFilesArray = addOrUpdateFile(
                                value,
                                _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                                file,
                                preview,
                              );
                              onChange(newFilesArray);
                            })
                          }
                          onRemove={() =>
                            onChange(
                              removeFileByType(
                                value,
                                _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="mt-2 flex flex-col gap-1">
                        {errorIdFront && (
                          <p className="text-xs text-red-500">{errorIdFront}</p>
                        )}
                        {errorIdBack && (
                          <p className="text-xs text-red-500">{errorIdBack}</p>
                        )}
                        {errorFaceId && (
                          <p className="text-xs text-red-500">{errorFaceId}</p>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
            </section>

            {/* List ảnh KTV_IMAGE_DISPLAY */}
            <section>
              <p className="mb-2 font-bold text-slate-900">
                {t("profile.partner_form.images_title")}
                <span className="text-red-500">*</span>
              </p>
              <p className="mb-2 text-xs text-gray-500">
                {t("profile.partner_form.images_min_note")}
              </p>
              <p className="mb-2 text-xs text-red-500">
                {t("profile.partner_form.images_warning")}
              </p>
              <Controller
                control={control}
                name="file_uploads"
                render={({ field: { value = [], onChange } }) => {
                  const imageDisplayFiles = getFilesByType(
                    value,
                    _PartnerFileType.KTV_IMAGE_DISPLAY,
                  );
                  const errorsFile = getErrorsFileType(
                    errors,
                    _PartnerFileType.KTV_IMAGE_DISPLAY,
                  );
                  return (
                    <div>
                      <div className="flex flex-wrap gap-3">
                        {imageDisplayFiles.map((item, index) => (
                          <ImageSlot
                            key={index}
                            uri={item.preview || null}
                            label={t("profile.partner_form.add_photo")}
                            onAdd={() =>
                              pickImage((preview, file) => {
                                if (!file || !preview) return;
                                const updatedArray = updateSpecificFile(
                                  value,
                                  item,
                                  file,
                                  preview,
                                );
                                onChange(updatedArray);
                              })
                            }
                            onRemove={() => {
                              const updatedArray = removeSpecificFile(
                                value,
                                item,
                              );
                              onChange(updatedArray);
                            }}
                          />
                        ))}
                        {imageDisplayFiles.length < 5 && (
                          <ImageSlot
                            uri={null}
                            label={t("profile.partner_form.add_photo")}
                            onAdd={() =>
                              pickImage((preview, file) => {
                                if (!file || !preview) return;
                                const updatedArray = appendFile(
                                  value,
                                  _PartnerFileType.KTV_IMAGE_DISPLAY,
                                  file,
                                  preview,
                                );
                                onChange(updatedArray);
                              })
                            }
                          />
                        )}
                      </div>
                      {errorsFile && (
                        <p className="mt-1 text-xs text-red-500">
                          {errorsFile}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
            </section>

            {/* Ảnh đại diện */}
            <section>
              <p className="mb-2 font-bold text-slate-900">
                {t("profile.partner_form.avatar")}
                <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="avatar"
                render={({ field: { value, onChange } }) => {
                  return (
                    <div className="my-2">
                      <ImageSlot
                        uri={value?.preview || null}
                        label={t("profile.partner_form.avatar")}
                        onAdd={() =>
                          pickImage((preview, file) => {
                            if (file) {
                              Object.assign(file, { preview });
                              onChange(file);
                            }
                          })
                        }
                      />
                      {errors.avatar?.message && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.avatar?.message as string}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
            </section>

            {/* Thông tin chi tiết */}
            <div className="space-y-6">
              {/* Tên hiển thị */}
              <div>
                <label className="mb-1 block font-bold text-slate-900">
                  {t("common.nickname")} *
                </label>
                <InputField
                  control={control}
                  name="nickname"
                  error={errors.nickname?.message}
                  placeholder={t(
                    "profile.partner_form.field_nickname_placeholder",
                  )}
                />
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="mb-1 block font-bold text-slate-900">
                  {t("profile.partner_form.field_dob_label")} *
                </label>
                <Controller
                  control={control}
                  name="dob"
                  render={({ field: { onChange, value } }) => (
                    <div className="relative">
                      <input
                        type="date"
                        className={`w-full rounded-xl border bg-white px-4 py-3 outline-none ${errors.dob ? "border-red-500" : "border-gray-200"}`}
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                      />
                      {errors.dob?.message && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.dob?.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Mã giới thiệu */}
              <div>
                <label className="mb-1 block font-bold text-slate-900">
                  {t("profile.partner_form.follow_agency_label")}
                </label>
                <InputField
                  control={control}
                  name="referrer_id"
                  disabled={!!referrer_id_param}
                  error={errors.referrer_id?.message}
                  placeholder={t(
                    "profile.partner_form.follow_agency_placeholder",
                  )}
                />
              </div>

              {/* Kinh nghiệm */}
              <div>
                <label className="mb-1 block font-bold text-slate-900">
                  {t("common.years_of_experience")} *
                </label>
                <InputField
                  control={control}
                  name="experience"
                  type="number"
                  error={errors.experience?.message}
                  placeholder={t(
                    "profile.partner_form.field_experience_placeholder",
                  )}
                />
              </div>

              {/* Bio */}
              <div>
                <label className="mb-2 block font-bold text-slate-900">
                  {t("profile.partner_form.field_bio_label")} *
                </label>
                <Controller
                  control={control}
                  name="bio"
                  render={({ field: { value, onChange } }) => (
                    <div className="relative">
                      <textarea
                        className={`min-h-[100px] w-full rounded-xl border bg-white px-4 py-3 outline-none ${errors.bio ? "border-red-500" : "border-gray-200"}`}
                        placeholder={t("profile.partner_form.field_bio_label")}
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                      />
                      {errors.bio?.message && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.bio?.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {showForm && (
        <footer className="fixed max-w-[750px] mx-auto bottom-0 left-0 right-0 border-t bg-white p-4 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex items-start gap-3 mb-4">
            <button onClick={() => setIsAgreed(!isAgreed)} className="mt-1">
              {isAgreed ? (
                <CheckSquare className="text-blue-600" />
              ) : (
                <Square className="text-gray-400" />
              )}
            </button>
            <p className="text-sm text-gray-600">
              {t("auth.i_agree_to")}{" "}
              <span
                className="cursor-pointer font-bold text-blue-600 underline"
                onClick={() =>
                  handlePreviewPdf(ContractFileType.POLICY_FOR_KTV)
                }
              >
                {t("auth.terms_and_conditions_register_technical")}{" "}
              </span>
              {t("common.and")}{" "}
              <span
                className="cursor-pointer font-bold text-blue-600 underline"
                onClick={() =>
                  handlePreviewPdf(ContractFileType.POLICY_PRIVACY)
                }
              >
                {t("auth.privacy_policy")}
              </span>
            </p>
          </div>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={!isAgreed || loading}
            className={`w-full rounded-xl py-4 font-bold text-white transition-all ${!loading && isAgreed ? "bg-primary-color-2" : "bg-gray-300 cursor-not-allowed"}`}
          >
            {loading
              ? t("common.loading")
              : t("profile.partner_form.button_submit")}
          </button>
        </footer>
      )}

      {/* Modal Đơn Đăng ký */}
      <ModalApplication
        isVisible={showModalApplication}
        onClose={() => setShowModalApplication(false)}
        data={reviewApplication}
      />
    </div>
  );
}
