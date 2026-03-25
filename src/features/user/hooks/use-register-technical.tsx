import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { _PartnerFileType } from "@/features/user/const";
import useToast from "@/features/app/hooks/use-toast";
import { useEffect } from "react";
import { useApplyTechnicalRequest } from "./use-mutation";
import { ApplyTechnicalRequest } from "../types";
import { useRouter } from "next/navigation";

export const getFilesByType = (
  files: ApplyTechnicalRequest["file_uploads"] = [],
  type: _PartnerFileType,
) => {
  if (!Array.isArray(files)) return [];
  return files.filter((f) => f.type_upload === type);
};

// Cập nhật hàm đếm file (giúp code sạch hơn trong superRefine)
const countByType = (
  files: { type_upload: _PartnerFileType }[] = [],
  type: _PartnerFileType,
) => files.filter((f) => f.type_upload === type).length;

const buildFormData = (data: ApplyTechnicalRequest): FormData => {
  const formData = new FormData();
  formData.append("nickname", data.nickname);
  formData.append("experience", String(data.experience));
  formData.append("bio", data.bio);
  formData.append("dob", data.dob);
  formData.append("is_leader", data.is_leader ? "1" : "0");
  if (data.referrer_id) {
    formData.append("referrer_id", String(data.referrer_id));
  }
  if (data.avatar) {
    formData.append("avatar", data.avatar as any);
  }
  if (data.file_uploads && data.file_uploads.length > 0) {
    data.file_uploads.forEach((item, index) => {
      formData.append(
        `file_uploads[${index}][type_upload]`,
        String(item.type_upload),
      );

      if (item.file) {
        formData.append(`file_uploads[${index}][file]`, item.file as any);
      }
    });
  }
  return formData;
};

const addFileError = (
  ctx: z.RefinementCtx,
  type: _PartnerFileType,
  message: string,
) => {
  ctx.addIssue({
    code: "custom",
    path: ["file_uploads", type],
    message: message,
    params: { type_upload: type }, // Gắn thêm params nếu cần phân loại lỗi sau này
  });
};

export const useRegisterTechnical = ({
  isLeader,
  referrer_id,
}: {
  isLeader: boolean;
  referrer_id: string;
}) => {
  const { t } = useTranslation();
  const route = useRouter();

  // mutation apply partner
  const { mutate, isPending } = useApplyTechnicalRequest();
  // toast
  const { error: errorToast, success: successToast } = useToast();

  // Form data
  const form = useForm<ApplyTechnicalRequest>({
    defaultValues: {
      nickname: "",
      experience: 1,
      referrer_id: "",
      bio: "",
      file_uploads: [],
    },
    resolver: zodResolver(
      z
        .object({
          nickname: z
            .string(
              t("profile.partner_form.error_invalid_nickname_length", {
                min: 4,
                max: 255,
              }),
            )
            .min(
              4,
              t("profile.partner_form.error_invalid_nickname_length", {
                min: 4,
                max: 255,
              }),
            )
            .max(
              255,
              t("profile.partner_form.error_invalid_nickname_length", {
                min: 4,
                max: 255,
              }),
            ),
          referrer_id: z
            .string()
            .optional()
            .refine(
              (val) => !val || val.trim() === "" || /^\d+$/.test(val.trim()),
              {
                message: t("profile.partner_form.error_agency_id_invalid"),
              },
            ),
          is_leader: z.boolean().optional(),

          experience: z
            .number(
              t("profile.partner_form.error_invalid_experience", {
                min: 1,
                max: 20,
              }),
            )
            .min(
              1,
              t("profile.partner_form.error_invalid_experience", {
                min: 1,
                max: 20,
              }),
            )
            .max(
              20,
              t("profile.partner_form.error_invalid_experience", {
                min: 1,
                max: 20,
              }),
            ),

          bio: z
            .string()
            .min(
              10,
              t("profile.partner_form.error_bio_required", {
                min: 10,
                max: 1000,
              }),
            )
            .max(
              1000,
              t("profile.partner_form.error_bio_required", {
                min: 10,
                max: 1000,
              }),
            ),

          dob: z
            .string(t("profile.partner_form.error_invalid_dob"))
            .regex(
              /^\d{4}-\d{2}-\d{2}$/,
              t("profile.partner_form.error_invalid_dob"),
            ),

          avatar: z
            .any()
            .refine(
              (file) => file != null,
              t("profile.partner_form.error_avatar_required"),
            ),

          file_uploads: z.array(
            z.object({
              type_upload: z.enum(_PartnerFileType),
              file: z.instanceof(File),
            }),
          ),
        })
        .superRefine((data, ctx) => {
          // xử lý file
          const files = data.file_uploads;
          //  CCCD  Mặt trước
          if (countByType(files, _PartnerFileType.IDENTITY_CARD_FRONT) !== 1) {
            addFileError(
              ctx,
              _PartnerFileType.IDENTITY_CARD_FRONT,
              t("profile.partner_form.error_missing_id_front"),
            );
          }

          // CCCD  Mặt sau
          if (countByType(files, _PartnerFileType.IDENTITY_CARD_BACK) !== 1) {
            addFileError(
              ctx,
              _PartnerFileType.IDENTITY_CARD_BACK,
              t("profile.partner_form.error_missing_id_back"),
            );
          }
          // Ảnh mặt chụp cùng CCCD
          if (
            countByType(files, _PartnerFileType.FACE_WITH_IDENTITY_CARD) !== 1
          ) {
            addFileError(
              ctx,
              _PartnerFileType.FACE_WITH_IDENTITY_CARD,
              t("profile.partner_form.alert_missing_face_with_card_message"),
            );
          }
          // ảnh gallery
          const galleryCount = countByType(
            files,
            _PartnerFileType.KTV_IMAGE_DISPLAY,
          );
          if (galleryCount < 3 || galleryCount > 5) {
            addFileError(
              ctx,
              _PartnerFileType.KTV_IMAGE_DISPLAY,
              t("profile.partner_form.alert_images_display_message", {
                min: 3,
                max: 5,
              }),
            );
          }
        }),
    ),
  });

  // Cập nhật giá trị is_leader khi thay đổi
  useEffect(() => {
    if (referrer_id && referrer_id.trim() !== "") {
      form.setValue("referrer_id", referrer_id, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    form.setValue("is_leader", isLeader);
  }, [form, isLeader, referrer_id]);

  // Xử lý submit form
  const onSubmit = (data: ApplyTechnicalRequest) => {
    const formData = buildFormData(data);
    mutate(formData, {
      onSuccess: () => {
        successToast({ message: t("profile.partner_form.register_success") });
        route.back();
      },
      onError: (error) => {
        errorToast({ message: error.message });
      },
    });
  };

  return {
    form,
    onSubmit,
    loading: isPending || form.formState.isSubmitting,
  };
};
