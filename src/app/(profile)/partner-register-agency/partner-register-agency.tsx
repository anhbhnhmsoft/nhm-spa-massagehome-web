"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { CheckSquare, Square, ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { _PartnerFileType } from "@/features/user/const";
import { ContractFileType } from "@/features/file/const";
import { useProvinces } from "@/features/location/hooks/use-query";
import { getFilesByType } from "@/features/user/hooks/use-partner-register-form";
import { usePartnerRegisterAgency } from "@/features/user/hooks/use-parter-rester-agency";

import ImageSlot from "@/components/app/partner-register/image-slot";
import { LocationSelector } from "@/components/app/partner-register/location-selector";
import { useImagePicker } from "@/features/app/hooks/use-image-picker";
import ProvinceSelector from "@/components/app/partner-register/province-selector";

const LanguageTextArea = ({
  lang,
  placeholder,
  value,
  onChangeText,
  error,
}: any) => (
  <div className="relative mb-4">
    <div
      className={cn(
        "min-h-[120px] rounded-xl border bg-white px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-blue-500/20",
        error ? "border-red-500" : "border-gray-200",
      )}
    >
      <textarea
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[100px] resize-none text-base text-gray-900 outline-none placeholder:text-gray-400"
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

export default function PartnerRegisterAgencyPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: provincesData, isLoading: isLoadingProvinces } = useProvinces();
  const { pickImage } = useImagePicker();

  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  const { form, onSubmit, onInvalidSubmit } = usePartnerRegisterAgency();

  const {
    control,
    formState: { errors },
    setValue,
    handleSubmit,
  } = form;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* HEADER */}
      <div className="sticky top-0 z-30 flex items-center border-b bg-white/80 backdrop-blur-md px-4 py-4">
        <button
          onClick={() => router.back()}
          className="mr-4 p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-900">
          {t("profile.partner_register.agency_title")}
        </h1>
      </div>

      <main className="mx-auto max-w-2xl px-4 pt-6">
        {/* SECTION: CCCD */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
            {t("profile.partner_form.id_title")}
            <span className="text-red-500">*</span>
          </h2>

          <Controller
            control={control}
            name="file_uploads"
            render={({ field: { value = [], onChange } }) => {
              const idFrontFile = getFilesByType(
                value,
                _PartnerFileType.IDENTITY_CARD_FRONT,
              )[0];
              const idBackFile = getFilesByType(
                value,
                _PartnerFileType.IDENTITY_CARD_BACK,
              )[0];

              return (
                <div className="grid grid-cols-2 gap-4">
                  <ImageSlot
                    uri={idFrontFile?.file.uri || null}
                    label={t("profile.partner_form.id_front")}
                    onAdd={() =>
                      pickImage((uri, file) => {
                        const filtered = value.filter(
                          (f) =>
                            f.type_upload !==
                            _PartnerFileType.IDENTITY_CARD_FRONT,
                        );
                        onChange([
                          ...filtered,
                          {
                            type_upload: _PartnerFileType.IDENTITY_CARD_FRONT,
                            file: {
                              uri,
                              name: file?.name,
                              type: file?.type,
                              rawFile: file,
                            },
                          },
                        ]);
                      })
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
                    uri={idBackFile?.file.uri || null}
                    label={t("profile.partner_form.id_back")}
                    onAdd={() =>
                      pickImage((uri, file) => {
                        const filtered = value.filter(
                          (f) =>
                            f.type_upload !==
                            _PartnerFileType.IDENTITY_CARD_BACK,
                        );
                        onChange([
                          ...filtered,
                          {
                            type_upload: _PartnerFileType.IDENTITY_CARD_BACK,
                            file: {
                              uri,
                              name: file?.name,
                              type: file?.type,
                              rawFile: file,
                            },
                          },
                        ]);
                      })
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

        {/* SECTION: FACE WITH ID */}
        <section className="mb-8">
          <h2 className="mb-4 font-bold text-slate-900">
            {t("profile.partner_form.face_with_id")}{" "}
            <span className="text-red-500">*</span>
          </h2>
          <Controller
            control={control}
            name="file_uploads"
            render={({ field: { value = [], onChange } }) => {
              const faceWithCardFile = getFilesByType(
                value,
                _PartnerFileType.FACE_WITH_IDENTITY_CARD,
              )[0];
              return (
                <div className="w-1/2">
                  <ImageSlot
                    uri={faceWithCardFile?.file.uri || null}
                    label={t("profile.partner_form.add_photo")}
                    onAdd={() =>
                      pickImage((uri, file) => {
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
                            file: {
                              uri,
                              name: file?.name,
                              type: file?.type,
                              rawFile: file,
                            },
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
                </div>
              );
            }}
          />
        </section>

        {/* SECTION: BIO (Đa ngôn ngữ) */}
        <section className="mb-8">
          <h2 className="mb-4 font-bold text-slate-900">
            {t("profile.partner_form.field_bio_label")}
          </h2>
          <div className="space-y-2">
            {["vi", "en", "cn"].map((lang) => (
              <Controller
                key={lang}
                control={control}
                name={`bio.${lang}` as any}
                render={({ field, fieldState }) => (
                  <LanguageTextArea
                    lang={lang.toUpperCase()}
                    placeholder={t(
                      `profile.partner_form.bio_placeholder_${lang}`,
                    )}
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
            ))}
          </div>
        </section>

        {/* SECTION: LOCATION */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-2 font-bold text-slate-900">
              {t("profile.partner_form.field_city_label")}{" "}
              <span className="text-red-500">*</span>
            </h2>
            <ProvinceSelector
              control={control as any}
              name="province_code"
              provinces={provincesData?.data || []}
              isLoading={isLoadingProvinces}
              error={errors.province_code?.message}
            />
          </div>

          <LocationSelector
            control={control}
            name="address"
            setValue={setValue}
            error={errors.address?.message}
          />
        </section>
      </main>

      {/* FIXED FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-start gap-3">
            <button
              type="button"
              onClick={() => setIsAgreed(!isAgreed)}
              className="mt-0.5 transition-transform active:scale-90"
            >
              {isAgreed ? (
                <CheckSquare className="text-blue-600 fill-blue-50" size={22} />
              ) : (
                <Square className="text-gray-400" size={22} />
              )}
            </button>

            <div className="text-sm leading-5 text-gray-600">
              {t("auth.i_agree_to")}{" "}
              <button
                className="font-bold text-blue-600 hover:underline"
                onClick={() =>
                  router.push(
                    `/term-pdf?type=${ContractFileType.POLICY_FOR_AGENCY}`,
                  )
                }
              >
                {t("auth.terms_and_conditions")}
              </button>{" "}
              {t("common.and")}{" "}
              <button
                className="font-bold text-blue-600 hover:underline"
                onClick={() =>
                  router.push(
                    `/term-pdf?type=${ContractFileType.POLICY_PRIVACY}`,
                  )
                }
              >
                {t("auth.privacy_policy")}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit(onSubmit, onInvalidSubmit)}
            disabled={!isAgreed}
            className={cn(
              "w-full rounded-xl py-4 font-bold text-white transition-all transform active:scale-[0.98]",
              isAgreed
                ? "bg-blue-600 shadow-lg shadow-blue-200 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed",
            )}
          >
            {t("profile.partner_form.button_submit")}
          </button>
        </div>
      </footer>
    </div>
  );
}
