"use client";

import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { CheckSquare, Square } from "lucide-react";
import { useProvinces } from "@/features/location/hooks/use-query";
import { LocationSelector } from "@/components/app/partner-register/location-selector";
import {
  getFilesByType,
  usePartnerRegisterForm,
} from "@/features/user/hooks/use-partner-register-form";
import { _PartnerFileType } from "@/features/user/const";
import ImageSlot from "@/components/app/partner-register/image-slot";
import { useImagePicker } from "@/features/app/hooks/use-image-picker";
import { InputField } from "@/components/app/partner-register/input-field";
import ProvinceSelector from "@/components/app/partner-register/province-selector";
import HeaderBack from "@/components/header-back";
import { usePreviewPdf } from "@/features/app/hooks";
import { ContractFileType } from "@/features/file/const";
import useUserServiceStore from "@/features/user/stores";

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

  const isLeader = useUserServiceStore((state) => state.is_leader);
  const setIsLeader = useUserServiceStore((state) => state.setIsLeader);

  const { data: provincesData, isLoading: isLoadingProvinces } = useProvinces();
  const { pickImage } = useImagePicker();

  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  const { form, onSubmit, onInvalidSubmit, loading, router } =
    usePartnerRegisterForm();

  const {
    control,
    formState: { errors },
    setValue,
    handleSubmit,
  } = form;

  useEffect(() => {
    if (referrer_id_param) {
      setValue("referrer_id", referrer_id_param, { shouldValidate: true });
    }
    if (isLeader) {
      setValue("is_leader", true);
    }
  }, [referrer_id_param, isLeader, setValue]);

  return (
    <div className="min-h-screen w-full bg-white pb-32">
      {/* Header */}
      <HeaderBack
        title={
          isLeader
            ? "profile.partner_form.title_technician_leader"
            : "profile.partner_form.title"
        }
        onBack={() => {
          if (isLeader) {
            setIsLeader(false);
            router.back();
          } else {
            router.back();
          }
        }}
      />

      <main className="mx-auto max-w-2xl px-4 mt-6 space-y-8 flex-1 pb-32">
        <div className="flex-1">
          {/* 1. ẢNH DỊCH VỤ (DEMO) */}
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
                        // ✅ Dùng preview để hiển thị trên Next.js
                        uri={item.preview || null}
                        label={t("common.degree")}
                        onRemove={() =>
                          onChange(value.filter((f) => f !== item))
                        }
                        onAdd={() => {}}
                      />
                    ))}
                    <ImageSlot
                      uri={null}
                      label={t("profile.partner_form.add_photo")}
                      onAdd={() =>
                        pickImage((preview, file) => {
                          // ✅ Hook trả về cả preview và file
                          if (!file) return;
                          onChange([
                            ...value,
                            {
                              type_upload: _PartnerFileType.KTV_IMAGE_DISPLAY,
                              file: file, // File object để upload
                              preview: preview, // String URL để hiển thị
                            },
                          ]);
                        })
                      }
                    />
                  </div>
                );
              }}
            />
            <p className="mt-2 text-xs text-gray-500">
              {t("profile.partner_form.images_min_note")}
            </p>
            <p className="text-xs text-red-500">
              {t("profile.partner_form.images_warning")}
            </p>
          </section>

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

                const updateIdImage = (
                  type: _PartnerFileType,
                  preview: string,
                  file: File,
                ) => {
                  const filtered = value.filter((f) => f.type_upload !== type);
                  onChange([...filtered, { type_upload: type, file, preview }]);
                };

                return (
                  <div className="flex flex-wrap gap-3">
                    <ImageSlot
                      uri={idFront?.preview || null} // ✅ Dùng preview
                      label={t("profile.partner_form.id_front")}
                      onAdd={() =>
                        pickImage(
                          (preview, file) =>
                            file &&
                            updateIdImage(
                              _PartnerFileType.IDENTITY_CARD_FRONT,
                              preview,
                              file,
                            ),
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
                      uri={idBack?.preview || null} // ✅ Dùng preview
                      label={t("profile.partner_form.id_back")}
                      onAdd={() =>
                        pickImage(
                          (preview, file) =>
                            file &&
                            updateIdImage(
                              _PartnerFileType.IDENTITY_CARD_BACK,
                              preview,
                              file,
                            ),
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
                      pickImage((preview, file) => {
                        if (!file) return;
                        const filtered = value.filter(
                          (f) =>
                            f.type_upload !==
                            _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                        );
                        onChange([
                          ...filtered,
                          {
                            type_upload:
                              _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                            file,
                            preview,
                          },
                        ]);
                      })
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
          <section>
            <p className="mb-2 font-bold text-slate-900">
              {t("profile.partner_form.degrees_title")}{" "}
              <span className="text-red-500">*</span>
            </p>
            <Controller
              control={control}
              name="file_uploads"
              render={({ field: { value = [], onChange } }) => {
                const degrees = getFilesByType(value, _PartnerFileType.LICENSE);
                return (
                  <div className="flex flex-wrap gap-3">
                    {degrees.map((item, index) => (
                      <ImageSlot
                        key={index}
                        uri={item.preview || null} // ✅ Hiển thị bằng preview
                        label={t("profile.partner_form.degree_photo")}
                        onRemove={() =>
                          onChange(value.filter((f) => f !== item))
                        }
                        onAdd={() => {}}
                      />
                    ))}
                    <ImageSlot
                      uri={null}
                      label={t("profile.partner_form.add_photo")}
                      onAdd={() =>
                        pickImage((preview, file) => {
                          if (!file) return;
                          onChange([
                            ...value,
                            {
                              type_upload: _PartnerFileType.LICENSE,
                              file,
                              preview,
                            },
                          ]);
                        })
                      }
                    />
                  </div>
                );
              }}
            />
          </section>

          {/* 5. THÔNG TIN KHÁC */}
          <div className="space-y-6">
            {/* Referrer ID */}
            <div>
              <label className="mb-1 block font-bold text-slate-900">
                {t("profile.partner_form.follow_agency_label")}
              </label>
              <InputField
                control={control}
                name="referrer_id"
                placeholder={t(
                  "profile.partner_form.follow_agency_placeholder",
                )}
                disabled={!!referrer_id_param}
                error={errors.referrer_id?.message}
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
                placeholder={t(
                  "profile.partner_form.field_experience_placeholder",
                )}
                error={errors.experience?.message}
              />
            </div>
            {/* nick nảm */}
            <div>
              <label className="mb-1 block font-bold text-slate-900">
                {t("common.nickname")} *
              </label>
              <InputField
                control={control}
                name="nickname"
                placeholder={t(
                  "profile.partner_form.field_nickname_placeholder",
                )}
                error={errors.nickname?.message}
              />
            </div>

            {/* Bio đa ngôn ngữ */}
            <div>
              <label className="mb-2 block font-bold text-slate-900">
                {t("profile.partner_form.field_bio_label")}
              </label>
              {["vi", "en", "cn"].map((lang) => (
                <Controller
                  key={lang}
                  control={control}
                  name={`bio.${lang}` as any}
                  render={({ field, fieldState }) => (
                    <LanguageTextArea
                      lang={lang.toUpperCase()}
                      placeholder={
                        t(
                          `profile.partner_form.bio_placeholder_${lang}` as any,
                        ) || `Describe in ${lang.toUpperCase()}...`
                      }
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              ))}
            </div>

            {/* Vị trí */}
            <ProvinceSelector
              control={control}
              name="province_code"
              provinces={provincesData?.data || []}
              isLoading={isLoadingProvinces}
              error={errors.province_code?.message}
            />

            <LocationSelector
              control={control}
              name="address"
              setValue={setValue}
              error={errors.address?.message}
            />
          </div>
        </div>
      </main>

      {/* Footer cố định */}
      <footer className="fixed max-w-[750px] m-auto bottom-0 left-0 right-0 border-t bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="mx-auto max-w-[750px]">
          <div className="mb-4 flex items-start gap-3">
            <button
              onClick={() => setIsAgreed(!isAgreed)}
              className="mt-1 flex-shrink-0"
            >
              {isAgreed ? (
                <CheckSquare className="text-blue-600 fill-blue-50" />
              ) : (
                <Square className="text-gray-400" />
              )}
            </button>
            <div className="text-sm text-gray-600">
              {t("auth.i_agree_to")}{" "}
              <span
                className="cursor-pointer font-bold text-blue-600 underline"
                onClick={() =>
                  handlePreviewPdf(ContractFileType.POLICY_PRIVACY)
                }
              >
                {t("auth.terms_and_conditions")}
              </span>
            </div>
          </div>
          <button
            onClick={handleSubmit(onSubmit, onInvalidSubmit)}
            disabled={!isAgreed || loading}
            className={`w-full rounded-xl py-4 font-bold text-white transition-all  ${!loading && isAgreed ? "bg-blue-600 hover:bg-blue-700 shadow-md" : "bg-gray-300 cursor-not-allowed"}`}
          >
            {t("profile.partner_form.button_submit")}
          </button>
        </div>
      </footer>
    </div>
  );
}
