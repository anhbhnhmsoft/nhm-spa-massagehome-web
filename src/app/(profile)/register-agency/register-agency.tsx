"use client";

import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MapPin, CheckSquare, Square, Loader2 } from "lucide-react";
import {
  addOrUpdateFile,
  appendFile,
  cn,
  getErrorsFileType,
  removeFileByType,
} from "@/lib/utils";
import { InputField } from "@/components/app/partner-register/input-field";
import ModalApplication, {
  CardPendingApplication,
  CardReasonRejectApplication,
} from "@/components/app/partner-register/register-application";
import HeaderBack from "@/components/header-back";
import { useImagePicker } from "@/features/app/hooks/use-image-picker";
import { _PartnerFileType } from "@/features/user/const";
import { useCheckPartnerRegister } from "@/features/user/hooks/use-check-partner-register";
import { useRegisterAgency } from "@/features/user/hooks/use-register-agency";
import { getFilesByType } from "@/features/user/hooks/use-register-technical";
import ImageSlot from "@/components/app/partner-register/image-slot";
import { ListLocationModal } from "@/components/location";

export default function PartnerRegisterAgencyScreen() {
  const { t } = useTranslation();
  const { pickImage } = useImagePicker();
  const { showForm, reviewApplication } = useCheckPartnerRegister();
  const { form, onSubmit, loading } = useRegisterAgency();

  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  const [showModalApplication, setShowModalApplication] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  const {
    control,
    setValue,
    formState: { errors },
    handleSubmit,
  } = form;

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <HeaderBack title={t("profile.partner_register.agency_title")} />

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Status Pending */}
        {!showForm && (
          <CardPendingApplication
            data={reviewApplication}
            setShowModalApplication={setShowModalApplication}
          />
        )}

        {/* Form Registration */}
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-32">
            {/* Hiển thị lý do từ chối nếu có */}
            <CardReasonRejectApplication
              data={reviewApplication}
              setShowModalApplication={setShowModalApplication}
            />

            {/* Section: Ảnh CCCD */}
            <section className="space-y-4">
              <label className="text-sm font-semibold text-slate-700">
                {t("profile.partner_form.id_cccd_title_exclude")}
                <span className="text-red-500">*</span>
              </label>

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
                  const errorIdFront = getErrorsFileType(
                    errors,
                    _PartnerFileType.IDENTITY_CARD_FRONT,
                  );
                  const errorIdBack = getErrorsFileType(
                    errors,
                    _PartnerFileType.IDENTITY_CARD_BACK,
                  );

                  return (
                    <div>
                      <div className="flex flex-row items-start gap-4 ">
                        {/* Slot Front */}
                        <ImageSlot
                          uri={idFront?.preview || null}
                          label={t("profile.partner_form.id_cccd_front")}
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
                        {/* Slot Back */}
                        <ImageSlot
                          uri={idBack?.preview || null}
                          label={t("profile.partner_form.id_cccd_back")}
                          onAdd={() => {
                            pickImage((preview, file) => {
                              if (!file || !preview) return;
                              const updatedArray = appendFile(
                                value,
                                _PartnerFileType.IDENTITY_CARD_BACK,
                                file,
                                preview,
                              );
                              onChange(updatedArray);
                            });
                          }}
                          onRemove={() =>
                            onChange(
                              removeFileByType(
                                value,
                                _PartnerFileType.IDENTITY_CARD_BACK,
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
                      </div>
                    </div>
                  );
                }}
              />
            </section>

            {/* Section: Thông tin cá nhân */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700">
                {t("profile.partner_form.real_name")}
                <span className="text-red-500">*</span>
              </label>

              <InputField
                placeholder={t("profile.partner_form.real_name")}
                error={errors.nickname?.message}
                control={control}
                name="nickname"
              />

              {/* Địa chỉ (Custom Card replacement) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {t("profile.partner_form.address")}
                  <span className="text-red-500">*</span>
                </label>

                <Controller
                  control={control}
                  name="address"
                  render={({ field: { value } }) => (
                    <div
                      onClick={() => setShowLocationModal(true)}
                      className="flex cursor-pointer items-center rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-400"
                    >
                      <div className="mr-3 rounded-full bg-blue-100 p-2 text-blue-600">
                        <MapPin size={20} />
                      </div>
                      <div className="flex-1">
                        {value ? (
                          <p className="text-sm font-medium text-slate-800">
                            {value}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400">
                            {t("location.placeholder_address")}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                />
                {errors.address && (
                  <p className="text-xs text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>

            {/* Footer / Nút Submit (Fixed Bottom) */}
            <div className="fixed max-w-[750px] mx-auto bottom-0 left-0 right-0 border-t border-slate-100 bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
              <div className="mx-auto max-w-2xl">
                {/* Checkbox Điều khoản */}
                <div className="mb-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAgreed(!isAgreed)}
                    className="mt-1 flex-shrink-0"
                  >
                    {isAgreed ? (
                      <CheckSquare className="text-blue-600" size={20} />
                    ) : (
                      <Square className="text-slate-400" size={20} />
                    )}
                  </button>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {t("auth.i_agree_to")}{" "}
                    <span className="cursor-pointer font-bold text-blue-600 underline">
                      {t("auth.terms_and_conditions_register_agency")}{" "}
                    </span>
                    {t("common.and")}{" "}
                    <span className="cursor-pointer font-bold text-blue-600 underline">
                      {t("auth.privacy_policy")}
                    </span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!isAgreed || loading}
                  className={cn(
                    "flex w-full items-center justify-center rounded-xl py-4 text-base font-bold text-white transition-all shadow-lg",
                    isAgreed && !loading
                      ? "bg-primary-color-2"
                      : "bg-slate-400 cursor-not-allowed",
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("profile.partner_form.button_submit")
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
      <ModalApplication
        isVisible={showModalApplication}
        onClose={() => setShowModalApplication(false)}
        data={reviewApplication}
      />

      <ListLocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={(location) => {
          setValue("address", location.address);
          setValue("latitude", Number(location.latitude));
          setValue("longitude", Number(location.longitude));
          setShowLocationModal(false);
        }}
      />
    </main>
  );
}
