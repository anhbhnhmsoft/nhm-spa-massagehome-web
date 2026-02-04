import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { _UserRole } from "@/features/auth/const";
import useApplicationStore from "@/lib/store";
import { _PartnerFileType, _ReviewApplicationStatus } from "../const";
import { ApplyPartnerRequest } from "../types";
import useToast from "@/features/app/hooks/use-toast";
import { useMutationApplyPartner } from "./use-mutation";
import { useRouter } from "next/navigation";
import { useQueryCheckApplyPartner } from "./use-query";

const countByType = (
  files: { type_upload: _PartnerFileType }[],
  type: _PartnerFileType,
) => files.filter((f) => f.type_upload === type).length;

const addFileError = (
  ctx: z.RefinementCtx,
  type: _PartnerFileType,
  message: string,
) => {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ["file_uploads", type],
    message,
  });
};

const buildApplyPartnerFormData = (data: ApplyPartnerRequest): FormData => {
  const fd = new FormData();
  fd.append("role", String(data.role));
  fd.append("province_code", data.province_code);
  fd.append("address", data.address);
  if (data.latitude) {
    fd.append("latitude", data.latitude);
  }

  if (data.longitude) {
    fd.append("longitude", data.longitude);
  }

  // ===== BIO (MULTI LANG) =====
  fd.append("bio[vi]", data.bio.vi);

  if (data.bio.en) {
    fd.append("bio[en]", data.bio.en);
  }

  if (data.bio.cn) {
    fd.append("bio[cn]", data.bio.cn);
  }

  // ===== FILE UPLOADS =====
  data.file_uploads.forEach((item, index) => {
    fd.append(`file_uploads[${index}][type_upload]`, String(item.type_upload));

    // Web: Append trực tiếp đối tượng File
    if (item.file instanceof File) {
      fd.append(`file_uploads[${index}][file]`, item.file);
    }
  });

  return fd;
};

export const usePartnerRegisterAgency = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const setLoading = useApplicationStore((s) => s.setLoading);
  const { mutate } = useMutationApplyPartner();
  const {
    error: errorToast,
    success: successToast,
    info: infoToast,
  } = useToast();

  const queryCheck = useQueryCheckApplyPartner();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (queryCheck.error) {
      errorToast({
        message: t("profile.partner_form.error_check_apply_partner"),
      });
    } else if (queryCheck.data) {
      const data = queryCheck.data;
      if (!data.can_apply && !hasNavigatedRef.current) {
        switch (data.apply_status) {
          case _ReviewApplicationStatus.PENDING:
            infoToast({
              message: t("profile.partner_form.info_apply_pending"),
            });
            break;
          case _ReviewApplicationStatus.APPROVED:
            infoToast({
              message: t("profile.partner_form.info_apply_approved"),
            });
            break;
          case _ReviewApplicationStatus.REJECTED:
            errorToast({
              message: t("profile.partner_form.info_apply_rejected"),
            });
            break;
        }
        hasNavigatedRef.current = true;
        setTimeout(() => {
          router.back();
        }, 3000);
      }
    }
  }, [queryCheck.data, queryCheck.error]);
  // hàm validate và xử lý form đăng ký đối tác
  const schemas = z
    .object({
      role: z.union([z.literal(_UserRole.KTV), z.literal(_UserRole.AGENCY)]),

      province_code: z
        .string()
        .min(1, t("profile.partner_form.error_city_required")),
      address: z
        .string()
        .min(1, t("profile.partner_form.error_location_required")),

      latitude: z
        .string()
        .min(1, t("profile.partner_form.error_location_required")),

      longitude: z
        .string()
        .min(1, t("profile.partner_form.error_location_required")),

      bio: z.object({
        vi: z.string().min(20, t("profile.error.bio_required")),
        en: z.string().optional(),
        cn: z.string().optional(),
      }),

      file_uploads: z.array(
        z.object({
          type_upload: z.enum(_PartnerFileType),
          file: z.instanceof(File),
          preview: z.string().optional(),
        }),
      ),
    })
    .superRefine((data, ctx) => {
      const files = data.file_uploads;
      //    Mặt trước
      if (countByType(files, _PartnerFileType.IDENTITY_CARD_FRONT) !== 1) {
        addFileError(
          ctx,
          _PartnerFileType.IDENTITY_CARD_FRONT,
          t("profile.partner_form.alert_missing_id_message"),
        );
      }

      // Mặt sau
      if (countByType(files, _PartnerFileType.IDENTITY_CARD_BACK) !== 1) {
        addFileError(
          ctx,
          _PartnerFileType.IDENTITY_CARD_BACK,
          t("profile.partner_form.alert_missing_id_message"),
        );
      }
      // CCCD và mặt
      if (countByType(files, _PartnerFileType.FACE_WITH_IDENTITY_CARD) !== 1) {
        addFileError(
          ctx,
          _PartnerFileType.FACE_WITH_IDENTITY_CARD,
          t("profile.partner_form.alert_missing_face_with_card_message"),
        );
      }
    });

  type PartnerFormValues = z.infer<typeof schemas>;

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(schemas) as any,
    defaultValues: {
      role: _UserRole.AGENCY,
      province_code: "",
      address: "",
      latitude: undefined,
      longitude: undefined,
      bio: {
        vi: "",
        en: "",
        cn: "",
      },
      file_uploads: [],
    },
    mode: "onSubmit",
  });

  const onInvalidSubmit = (errors: any) => {
    const fileErrors = errors?.file_uploads;
    if (!fileErrors) return;
    const firstError = fileErrors.find((e: any) => e?.message);

    if (firstError?.message) {
      errorToast({ message: firstError.message });
    }
  };
  const onSubmit = useCallback(
    async (data: any) => {
      setLoading(true);
      const formData = buildApplyPartnerFormData(data);
      mutate(formData, {
        onSuccess: (res) => {
          setLoading(false);
          successToast({ message: t("profile.partner_form.register_success") });
          if (!hasNavigatedRef.current) {
            hasNavigatedRef.current = true;
            setTimeout(() => {
              router.back();
            }, 3000);
          }
        },
        onError: (error) => {
          setLoading(false);
          errorToast({ message: error.message });
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    },
    [errorToast, mutate, router, setLoading, successToast, t],
  );

  return {
    form,
    onSubmit,
    onInvalidSubmit,
  };
};
