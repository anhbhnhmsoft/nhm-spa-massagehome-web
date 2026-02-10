"use client";

import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { CheckSquare, Square } from "lucide-react";
import {
  getFilesByType,
  usePartnerRegisterForm,
} from "@/features/user/hooks/use-partner-register-form";
import {
  _PartnerFileType,
  _ReviewApplicationStatus,
} from "@/features/user/const";
import ImageSlot from "@/components/app/partner-register/image-slot";
import { useImagePicker } from "@/features/app/hooks/use-image-picker";
import { InputField } from "@/components/app/partner-register/input-field";
import HeaderBack from "@/components/header-back";
import { usePreviewPdf } from "@/features/app/hooks";
import { ContractFileType } from "@/features/file/const";
import useUserServiceStore from "@/features/user/stores";
import { _UserRole } from "@/features/auth/const";
import ModalApplication from "@/components/app/partner-register/modal-application";

// Helper component cho TextArea đa ngôn ngữ
const LanguageTextArea = ({
  lang,
  placeholder,
  value,
  onChangeText,
  error,
}: any) => (
  <div className="relative mb-4">
    <div
      className={`min-h-[100px] rounded-xl border bg-white px-4 py-3 ${error ? "border-red-500" : "border-gray-200"}`}
    >
      <textarea
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[100px] resize-none pr-8 pt-1 text-base text-gray-900 outline-none placeholder:text-gray-400"
      />
    </div>
    <div className="absolute right-3 top-3 rounded-md bg-gray-100 px-2 py-1">
      <span className="text-[10px] font-bold text-gray-500 uppercase">
        {lang}
      </span>
    </div>
    {error && <p className="ml-1 mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export default function PartnerRegisterIndividualPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { handlePreviewPdf } = usePreviewPdf();
  const referrer_id_param = searchParams?.get("referrer_id");

  const forWho = useUserServiceStore((s) => s.forWho);
  const setForWho = useUserServiceStore((s) => s.setForWho);
  // Xác định role dựa trên forWho
  const isLeader = forWho === "leader-ktv";
  const isAgency = forWho === "agency";

  const { pickImage } = useImagePicker();
  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  const [showModalCancel, setShowModalCancel] = useState(false);
  const {
    form,
    onSubmit,
    onInvalidSubmit,
    loading,
    router,
    reviewApplication,
    showForm,
  } = usePartnerRegisterForm(forWho);

  const {
    control,
    formState: { errors },
    setValue,
    handleSubmit,
  } = form;

  useEffect(() => {
    if (referrer_id_param) {
      setValue("referrer_id", referrer_id_param, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (isAgency) {
      setValue("role", _UserRole.AGENCY);
    } else {
      setValue("role", _UserRole.KTV);
      if (isLeader) setValue("is_leader", true);
    }
  }, [forWho, referrer_id_param, setValue, isAgency, isLeader]);

  // Helper function để cập nhật ảnh (tránh lặp code)
  const handleImageUpdate = (
    type: _PartnerFileType,
    onChange: any,
    currentValues: any[],
    isMultiple = false,
  ) => {
    pickImage((preview, file) => {
      if (!file) return;
      if (isMultiple) {
        onChange([...currentValues, { type_upload: type, file, preview }]);
      } else {
        const filtered = currentValues.filter((f) => f.type_upload !== type);
        onChange([...filtered, { type_upload: type, file, preview }]);
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-white pb-32">
      <HeaderBack
        title={
          isAgency
            ? "profile.partner_register.agency_title"
            : isLeader
              ? "profile.partner_form.title_technician_leader"
              : "profile.partner_form.title"
        }
        onBack={() => {
          setForWho("ktv");
          router.back();
        }}
      />
      <main className="mx-auto max-w-2xl px-4 mt-6 space-y-8 flex-1 pb-32">
        {/* 1. ẢNH DỊCH VỤ (KTV_IMAGE_DISPLAY) */}
        {!showForm &&
          reviewApplication &&
          reviewApplication?.status === _ReviewApplicationStatus.PENDING && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
              <div className="max-w-md">
                <p className="font-bold text-lg text-blue-600">
                  {/* KTV */}
                  {reviewApplication?.role === _UserRole.KTV &&
                    !reviewApplication?.is_leader &&
                    t("profile.partner_form.status_pending_for_ktv")}

                  {/* KTV Leader */}
                  {reviewApplication?.role === _UserRole.KTV &&
                    reviewApplication?.is_leader &&
                    t("profile.partner_form.status_pending_for_ktv_leader")}

                  {/* Agency */}
                  {reviewApplication?.role === _UserRole.AGENCY &&
                    t("profile.partner_form.status_pending_for_agency")}
                </p>
              </div>

              <button
                onClick={() => setShowModalCancel(true)}
                className="mt-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95"
              >
                {t("profile.partner_form.show_application")}
              </button>
            </div>
          )}
        {showForm && (
          <div>
            {reviewApplication?.status ===
              _ReviewApplicationStatus.REJECTED && (
              <section className="mb-2 items-start gap-3 p-4 border border-gray-200">
                <div className="flex flex-col items-start gap-3 ">
                  <h3 className="font-bold text-red-500">
                    {t("profile.partner_form.cancel_reason_title")}
                  </h3>

                  <button
                    type="button"
                    onClick={() => setShowModalCancel(true)}
                    className="items-center justify-center rounded-xl bg-primary-color-2 px-3 py-1 shadow-blue-200 font-bold text-white "
                  >
                    {t("profile.partner_form.show_application")}
                  </button>
                </div>
              </section>
            )}
            {!isAgency && (
              <section>
                <p className="mb-2 font-bold text-slate-900">
                  {t("profile.partner_form.images_title")}{" "}
                  <span className="text-red-500">*</span>
                </p>
                <Controller
                  control={control}
                  name="file_uploads"
                  render={({ field: { value = [], onChange } }) => {
                    const displayFiles = getFilesByType(
                      value,
                      _PartnerFileType.KTV_IMAGE_DISPLAY,
                    );
                    return (
                      <div className="flex flex-wrap gap-3">
                        {displayFiles.map((item, index) => (
                          <ImageSlot
                            key={index}
                            uri={item.preview || null}
                            label={t("common.degree")}
                            onRemove={() =>
                              onChange(value.filter((f) => f !== item))
                            }
                            onAdd={() =>
                              pickImage((preview, file) => {
                                if (!file) return;
                                const updated = value.map((f) =>
                                  f === item ? { ...f, file, preview } : f,
                                );
                                onChange(updated);
                              })
                            }
                          />
                        ))}
                        {displayFiles.length < 5 && (
                          <ImageSlot
                            uri={null}
                            label={t("profile.partner_form.add_photo")}
                            onAdd={() =>
                              handleImageUpdate(
                                _PartnerFileType.KTV_IMAGE_DISPLAY,
                                onChange,
                                value,
                                true,
                              )
                            }
                          />
                        )}
                      </div>
                    );
                  }}
                />
              </section>
            )}

            {/* 2. CCCD MẶT TRƯỚC/SAU */}
            <section>
              <p className="mb-2 font-bold text-slate-900">
                {t("profile.partner_form.id_title")}{" "}
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

                  return (
                    <div className="flex flex-wrap gap-3">
                      <ImageSlot
                        uri={idFront?.preview || null}
                        label={t("profile.partner_form.id_front")}
                        onAdd={() =>
                          handleImageUpdate(
                            _PartnerFileType.IDENTITY_CARD_FRONT,
                            onChange,
                            value,
                          )
                        }
                        onRemove={() =>
                          onChange(
                            value.filter(
                              (f) =>
                                f.type_upload !==
                                _PartnerFileType.IDENTITY_CARD_FRONT,
                            ),
                          )
                        }
                      />
                      <ImageSlot
                        uri={idBack?.preview || null}
                        label={t("profile.partner_form.id_back")}
                        onAdd={() =>
                          handleImageUpdate(
                            _PartnerFileType.IDENTITY_CARD_BACK,
                            onChange,
                            value,
                          )
                        }
                        onRemove={() =>
                          onChange(
                            value.filter(
                              (f) =>
                                f.type_upload !==
                                _PartnerFileType.IDENTITY_CARD_BACK,
                            ),
                          )
                        }
                      />
                    </div>
                  );
                }}
              />
            </section>

            {/* 3. ẢNH CHÂN DUNG + CCCD */}
            <section>
              <p className="mb-2 font-bold text-slate-900">
                {t("profile.partner_form.face_with_id")}{" "}
                <span className="text-red-500">*</span>
              </p>
              <Controller
                control={control}
                name="file_uploads"
                render={({ field: { value = [], onChange } }) => {
                  const faceFile = getFilesByType(
                    value,
                    _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                  )[0];
                  return (
                    <ImageSlot
                      uri={faceFile?.preview || null}
                      label={t("profile.partner_form.add_photo")}
                      onAdd={() =>
                        handleImageUpdate(
                          _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                          onChange,
                          value,
                        )
                      }
                      onRemove={() =>
                        onChange(
                          value.filter(
                            (f) =>
                              f.type_upload !==
                              _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                          ),
                        )
                      }
                    />
                  );
                }}
              />
            </section>

            {/* 4. BẰNG CẤP CHUYÊN MÔN */}
            {!isAgency && (
              <section>
                <p className="mb-2 font-bold text-slate-900">
                  {t("profile.partner_form.degrees_title")}{" "}
                  <span className="text-red-500">*</span>
                </p>
                <Controller
                  control={control}
                  name="file_uploads"
                  render={({ field: { value = [], onChange } }) => {
                    const degreeFile = getFilesByType(
                      value,
                      _PartnerFileType.LICENSE,
                    )[0];
                    return (
                      <ImageSlot
                        uri={degreeFile?.preview || null}
                        label={t("profile.partner_form.add_photo")}
                        onAdd={() =>
                          handleImageUpdate(
                            _PartnerFileType.LICENSE,
                            onChange,
                            value,
                          )
                        }
                        onRemove={() =>
                          onChange(
                            value.filter(
                              (f) => f.type_upload !== _PartnerFileType.LICENSE,
                            ),
                          )
                        }
                      />
                    );
                  }}
                />
              </section>
            )}

            {/* 5. THÔNG TIN CHI TIẾT */}
            <div className="space-y-6">
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

              {!isAgency && (
                <>
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
                </>
              )}

              {/* Bio Đa ngôn ngữ */}
              <div>
                <label className="mb-2 block font-bold text-slate-900">
                  {t("profile.partner_form.field_bio_label")} *
                </label>
                {["vi", "en", "cn"].map((lang) => (
                  <Controller
                    key={lang}
                    control={control}
                    name={`bio.${lang}` as any}
                    render={({ field, fieldState }) => (
                      <LanguageTextArea
                        lang={lang.toUpperCase()}
                        placeholder={t(
                          `profile.partner_form.bio_placeholder_${lang}` as any,
                        )}
                        value={field.value}
                        onChangeText={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                ))}
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
                  handlePreviewPdf(ContractFileType.POLICY_PRIVACY)
                }
              >
                {t("auth.terms_and_conditions")}
              </span>
            </p>
          </div>
          <button
            onClick={handleSubmit(onSubmit, onInvalidSubmit)}
            disabled={!isAgreed || loading}
            className={`w-full rounded-xl py-4 font-bold text-white transition-all ${!loading && isAgreed ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}
          >
            {loading
              ? t("common.loading")
              : t("profile.partner_form.button_submit")}
          </button>
        </footer>
      )}

      {/* Modal Đơn Đăng ký */}
      <ModalApplication
        isVisible={showModalCancel}
        onClose={() => setShowModalCancel(false)}
        data={reviewApplication}
      />
    </div>
  );
}
