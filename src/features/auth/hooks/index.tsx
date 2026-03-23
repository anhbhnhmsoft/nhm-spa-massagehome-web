"use client";

import { useCallback, useEffect } from "react";
import useAuthStore from "../store/auth-store";
import { _AuthStatus, _Gender, _TypeAuthenticate, _UserRole } from "../const";
import { useRouter } from "next/navigation";
import {
  useAuthenticateMutation,
  useForgotPasswordMutation,
  useLockAccountMutation,
  useLoginMutation,
  useLogoutMutation,
  useMutationDeleteAvatar,
  useMutationEditAvatar,
  useMutationEditProfile,
  useProfileMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useSetLanguageMutation,
} from "@/features/auth/hooks/use-mutation";
import useToast from "@/features/app/hooks/use-toast";
import { useTranslation } from "react-i18next";
import useApplicationStore from "@/lib/store";
import { queryClient } from "@/lib/provider/query-provider";
import { _LanguageCode } from "@/lib/const";
import useErrorToast from "@/features/app/hooks/use-error-toast";
import {
  AuthenticateRequest,
  EditProfileRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "../types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useReferralStore } from "@/features/affiliate/store";
import dayjs from "dayjs";
import { useFormAuthStore } from "../store/form-auth-store";

/**
 * Hàm để xác thực user xem là login hay register
 */
export const useHandleAuthenticate = () => {
  const { t } = useTranslation();
  const router = useRouter();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();
  const { error: errorToast } = useToast();
  const updateStateForm = useFormAuthStore((state) => state.updateState);
  // mutate function để gọi API xác thực user
  const { mutate, isPending } = useAuthenticateMutation();
  // form hook để validate và submit form
  const form = useForm<AuthenticateRequest>({
    resolver: zodResolver(
      z.object({
        username: z
          .string()
          .min(1, { message: t("auth.error.username_required") })
          .superRefine((val, ctx) => {
            const typeAuth = form.getValues("type_authenticate");

            if (typeAuth === _TypeAuthenticate.PHONE) {
              if (!/^[0-9]{9,12}$/.test(val)) {
                ctx.addIssue({
                  code: "custom",
                  message: t("auth.error.phone_invalid"),
                });
              }
            } else if (typeAuth === _TypeAuthenticate.EMAIL) {
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                ctx.addIssue({
                  code: "custom",
                  message: t("auth.error.email_invalid"),
                });
              }
            } else {
              ctx.addIssue({
                code: "custom",
                message: t("auth.error.invalid_username_or_email"),
              });
            }
          }),
        type_authenticate: z.enum(_TypeAuthenticate),
      }),
    ),
    defaultValues: {
      username: "",
      type_authenticate: _TypeAuthenticate.PHONE,
    },
  });
  // handle submit form
  const onSubmit = useCallback(
    (data: AuthenticateRequest) => {
      mutate(data, {
        onSuccess: (res) => {
          const dataResponse = res.data;
          const caseHandle = dataResponse.case;
          // Lưu username_authenticate và type_authenticate vào auth store khi submit form
          updateStateForm({
            username_authenticate: data.username,
            type_authenticate: data.type_authenticate,
          });
          // case need_login: redirect về màn hình login
          if (caseHandle === "need_login") {
            router.push("/login");
          }
          // case need_re_enter_register: redirect về màn hình register
          else if (caseHandle === "need_re_enter_register") {
            router.replace("/register");
          }
          // case need_register hoặc need_re_enter_otp: redirect về màn hình verify OTP
          else if (
            caseHandle === "need_register" ||
            caseHandle === "need_re_enter_otp"
          ) {
            if (dataResponse.last_sent_at && dataResponse.retry_after_seconds) {
              updateStateForm({
                case_verify_otp: "register",
                last_sent_at: dataResponse.last_sent_at,
                retry_after_seconds: dataResponse.retry_after_seconds,
              });
              router.replace("/verify-otp");
            } else {
              errorToast({
                message: t("common_error.unknown_error"),
              });
            }
          }
        },
        onError: (err) => {
          handleError(err);
        },
      });
    },
    [mutate, updateStateForm, router, errorToast, t, handleError],
  );

  return {
    form,
    onSubmit,
    loading: isPending,
  };
};

/**
 * Hàm để đăng nhập user
 */
export const useHandleLogin = () => {
  const { t } = useTranslation();
  const router = useRouter();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();
  // lấy username_authenticate và type_authenticate từ auth store
  const username = useFormAuthStore((state) => state.username_authenticate);
  const typeAuthenticate = useFormAuthStore((state) => state.type_authenticate);

  // handle success toast khi gọi API thành công
  const { success, error } = useToast();
  // set login vào auth store khi submit form
  const login = useAuthStore((state) => state.login);

  const updateStateForm = useFormAuthStore((state) => state.updateState);

  const { mutate: mutateForgotPassword, isPending: pendingForgotPassword } =
    useForgotPasswordMutation();
  // form hook để validate và submit form

  const form = useForm<LoginRequest>({
    resolver: zodResolver(
      z.object({
        username: z
          .string()
          .min(1, { message: t("auth.error.username_required") })
          .superRefine((val, ctx) => {
            const typeAuth = form.getValues("type_authenticate");

            if (typeAuth === _TypeAuthenticate.PHONE) {
              if (!/^[0-9]{9,12}$/.test(val)) {
                ctx.addIssue({
                  code: "custom",
                  message: t("auth.error.phone_invalid"),
                });
              }
            } else if (typeAuth === _TypeAuthenticate.EMAIL) {
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                ctx.addIssue({
                  code: "custom",
                  message: t("auth.error.email_invalid"),
                });
              }
            }
          }),
        type_authenticate: z.enum(_TypeAuthenticate),
        password: z
          .string()
          .min(1, { message: t("auth.error.password_invalid") })
          .min(8, { message: t("auth.error.password_invalid") })
          .regex(/[a-z]/, { message: t("auth.error.password_invalid") })
          .regex(/[A-Z]/, { message: t("auth.error.password_invalid") })
          .regex(/[0-9]/, { message: t("auth.error.password_invalid") }),
      }),
    ),
    defaultValues: {
      username: username || "",
      type_authenticate: typeAuthenticate,
      password: "",
    },
  });
  // mutate function để gọi API xác thực user
  const { mutate, isPending } = useLoginMutation();
  // handle submit form
  const onSubmit = useCallback(
    (data: LoginRequest) => {
      mutate(data, {
        onSuccess: async (res) => {
          try {
            if (res.data.user.role !== _UserRole.CUSTOMER) {
              error({
                message: t("auth.error.only_customer_web"),
              });
              return;
            }
            await login(res.data);
            success({
              message: t("auth.success.login_success"),
            });

            router.replace("/");
            router.refresh();
          } catch {
            error({
              message: t("auth.error.register_failed"),
            });
          }
        },

        onError: (err) => {
          handleError(err);
        },
      });
    },
    [error, handleError, login, mutate, router, success, t],
  );

  const onForgotPassword = useCallback(() => {
    if (!username) {
      error({ message: t("auth.error.phone_required") });
      return;
    }
    mutateForgotPassword(
      { username, type_authenticate: typeAuthenticate },
      {
        onSuccess: (res) => {
          const dataResponse = res.data;
          const caseHandle = dataResponse.case;
          // case nếu đã verify otp trước đó, chuyển hướng đến reset password
          if (caseHandle === "need_re_enter_reset_password") {
            router.replace("/reset-password");
          }
          // case nếu chưa verify otp, chuyển hướng đến verify otp
          else if (
            caseHandle === "success" ||
            caseHandle === "need_re_enter_otp"
          ) {
            if (dataResponse.last_sent_at && dataResponse.retry_after_seconds) {
              updateStateForm({
                case_verify_otp: "forgot_password",
                last_sent_at: dataResponse.last_sent_at,
                retry_after_seconds: dataResponse.retry_after_seconds,
              });
              router.replace("/verify-otp");
            } else {
              error({
                message: t("common_error.unknown_error"),
              });
            }
          }
        },
        onError: (err) => {
          handleError(err);
        },
      },
    );
  }, [
    handleError,
    mutateForgotPassword,
    username,
    typeAuthenticate,
    router,
    t,
    updateStateForm,
    error,
  ]);

  return {
    form,
    onSubmit,
    loading: isPending || pendingForgotPassword,
    onForgotPassword,
  };
};

/**
 * Hàm để đăng ký user
 */
export const useHandleRegister = () => {
  const { t } = useTranslation();
  const router = useRouter();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();
  const clearUserReferral = useReferralStore(
    (state) => state.clearUserReferral,
  );
  const { success, error } = useToast();

  const username = useFormAuthStore((state) => state.username_authenticate);
  const typeAuthenticate = useFormAuthStore((state) => state.type_authenticate);

  const resetState = useFormAuthStore((state) => state.resetState);

  const login = useAuthStore((state) => state.login);

  const mutationRegister = useRegisterMutation();

  // form hook để validate và submit form
  const form = useForm<RegisterRequest>({
    resolver: zodResolver(
      z.object({
        username: z
          .string()
          .min(1)
          .superRefine((val, ctx) => {
            if (/^[0-9]{1,}$/.test(val) && !/^[0-9]{9,12}$/.test(val)) {
              ctx.addIssue({
                code: "custom",
                message: t("auth.error.phone_invalid"),
              });
            } else if (
              !/^[0-9]{9,12}$/.test(val) &&
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
            ) {
              ctx.addIssue({
                code: "custom",
                message: t("auth.error.invalid_username_or_email"),
              });
            }
          }),
        type_authenticate: z.enum(_TypeAuthenticate),
        name: z.string().min(1, { error: t("auth.error.name_required") }),
        password: z
          .string()
          .min(1, { message: t("auth.error.password_invalid") })
          .min(8, { message: t("auth.error.password_invalid") })
          .regex(/[a-z]/, { message: t("auth.error.password_invalid") })
          .regex(/[A-Z]/, { message: t("auth.error.password_invalid") })
          .regex(/[0-9]/, { message: t("auth.error.password_invalid") }),
        referral_code: z.string().optional().nullable(),
        gender: z.enum(_Gender),
        language: z.enum(_LanguageCode),
      }),
    ),
    defaultValues: {
      username: username || "",
      type_authenticate: typeAuthenticate,
      name: "",
      password: "",
      gender: _Gender.MALE,
      language: _LanguageCode.VI,
    },
  });

  // handle submit form
  const onSubmit = useCallback(
    async (data: RegisterRequest) => {
      mutationRegister.mutate(data, {
        onSuccess: async (res) => {
          try {
            success({
              message: t("auth.success.register_success"),
            });

            clearUserReferral();
            resetState();
            await login(res.data);
            router.replace("/");
            router.refresh();
          } catch {
            error({
              message: t("auth.error.register_failed"),
            });
          }
        },
        onError: (err) => {
          handleError(err);
        },
      });
    },
    [
      clearUserReferral,
      error,
      handleError,
      login,
      mutationRegister,
      resetState,
      router,
      success,
      t,
    ],
  );

  return {
    form,
    onSubmit,
    loading: mutationRegister.isPending,
    router,
  };
};

/**
 * Hook để kiểm tra xem user có đang được xác thực hay không
 */
export const useCheckAuth = () => {
  const status = useAuthStore((state) => state.status);
  return status === _AuthStatus.AUTHORIZED;
};

// /**
//  * Hook để kiểm tra xem user có đang được xác thực hay không, nếu không thì push về màn hình auth
//  */
type RedirectTarget = string | (() => void);

export const useCheckAuthToRedirect = () => {
  const isAuthorized = useCheckAuth();
  const router = useRouter();

  return useCallback(
    (redirectTo: RedirectTarget) => {
      if (!isAuthorized) {
        router.replace("/welcome");
        return;
      }
      if (typeof redirectTo === "function") {
        redirectTo();
      } else {
        router.push(redirectTo);
      }
    },
    [isAuthorized, router],
  );
};
/**
 * Hook để lấy profile user
 */
export const useGetProfile = () => {
  const { t } = useTranslation();
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const { mutate } = useProfileMutation();
  const { error } = useToast();
  return useCallback(() => {
    mutate(undefined, {
      onSuccess: (res) => {
        setUser(res.data.user);
      },
      onError: () => {
        // Token hết hạn hoặc không hợp lệ
        error({
          message: t("common_error.invalid_or_expired_token"),
        });
        logout();
      },
    });
  }, [error, logout, mutate, setUser, t]);
};

/**
 * Hook để set ngôn ngữ user
 */
export const useSetLanguageUser = (onClose?: () => void) => {
  const { t, i18n } = useTranslation();

  const selectedLang = useApplicationStore((s) => s.language);
  const setLanguageStore = useApplicationStore((s) => s.setLanguage);

  const { mutate, isPending } = useSetLanguageMutation();
  const { error: errorToast } = useToast();

  const isAuthenticated = useCheckAuth();

  const syncLanguage = useCallback(
    async (lang: _LanguageCode) => {
      await setLanguageStore(lang);

      await i18n.changeLanguage(lang);

      queryClient.clear();
      queryClient.invalidateQueries();
    },
    [setLanguageStore, i18n],
  );

  const setLanguage = useCallback(
    async (lang: _LanguageCode) => {
      if (isAuthenticated) {
        mutate(
          { lang },
          {
            onSuccess: async () => {
              await syncLanguage(lang);
              onClose?.();
            },
            onError: () => {
              errorToast({
                message: t("common_error.failed_to_set_language"),
              });
            },
          },
        );
      } else {
        await syncLanguage(lang);
        onClose?.();
      }
    },
    [isAuthenticated, mutate, syncLanguage, onClose, t, errorToast],
  );

  return {
    setLanguage,
    selectedLang,
    isPending,
  };
};

/**
 * Xử lý thay đổi avatar
 */
export const useChangeAvatar = () => {
  const { t } = useTranslation();
  const editAvatar = useEditAvatar(); // Giả định hook này đã sẵn sàng

  // 1. Xử lý chọn ảnh (và chụp ảnh trên Mobile Web)
  const chooseImageFormLib = useCallback(async () => {
    // Tạo một input file ẩn
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*"; // Chỉ nhận file ảnh

    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Kiểm tra dung lượng (Ví dụ: < 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ảnh quá lớn, vui lòng chọn ảnh dưới 5MB");
        return;
      }

      const formData = new FormData();
      formData.append("file", file); // Web gửi file trực tiếp, không cần đóng gói URI

      try {
        await editAvatar(formData, false);
      } catch (error) {
        console.error("Lỗi khi upload:", error);
      }
    };

    input.click(); // Kích hoạt trình chọn file
  }, [editAvatar]);

  // 2. Xử lý xóa ảnh
  const deleteAvatar = useCallback(() => {
    if (confirm(t("profile.delete_avatar_desc"))) {
      editAvatar(undefined, true);
    }
  }, [editAvatar, t]);

  return {
    chooseImageFormLib,
    deleteAvatar,
    // takePictureCamera: Không cần thiết trên Web
  };
};

/**
 * Hook để chỉnh sửa avatar
 */
export const useEditAvatar = () => {
  const { mutate: editAvatar } = useMutationEditAvatar();
  const { mutate: deleteAvatar } = useMutationDeleteAvatar();
  const errorHandle = useErrorToast();
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useApplicationStore((state) => state.setLoading);

  return useCallback(
    (data: FormData | undefined, isDelete: boolean = false) => {
      setLoading(true);
      // Xử lý khi xóa avatar
      if (isDelete) {
        deleteAvatar(undefined, {
          onSuccess: (res) => {
            setUser(res.data.user);
          },
          onError: (error) => {
            errorHandle(error);
          },
          onSettled: () => {
            setLoading(false);
          },
        });
      } else if (data) {
        // Xử lý khi chỉnh sửa avatar
        editAvatar(data, {
          onSuccess: (res) => {
            setUser(res.data.user);
          },
          onError: (error) => {
            errorHandle(error);
          },
          onSettled: () => {
            setLoading(false);
          },
        });
      }
    },
    [deleteAvatar, editAvatar, errorHandle, setLoading, setUser],
  );
};

/**
 * Hook để chỉnh sửa thông tin profile
 */
export const useEditProfile = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const errorHandle = useErrorToast();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const setLoading = useApplicationStore((state) => state.setLoading);

  const { mutate: editProfile } = useMutationEditProfile();

  const form = useForm<EditProfileRequest>({
    defaultValues: {
      name: user?.name,
      date_of_birth: user?.profile.date_of_birth || undefined,
      gender: user?.profile.gender || undefined,
      bio: user?.profile.bio || undefined,
    },
    resolver: zodResolver(
      z
        .object({
          name: z
            .string()
            .min(4, t("profile.error.invalid_name"))
            .max(255)
            .optional()
            .or(z.literal("")),

          // Lưu ý: Form dùng Date object để DatePicker hoạt động
          date_of_birth: z
            .string()
            .optional()
            .refine((val) => dayjs(val).isValid(), {
              error: t("profile.error.invalid_date_of_birth"),
            })
            .refine(
              (val) => {
                const inputTime = dayjs(val);
                // Ngày sinh phải trước ngày hiện tại
                return inputTime.isBefore(dayjs());
              },
              {
                error: t("profile.error.invalid_date_of_birth"), // "Ngày sinh phải trước ngày hiện tại"
              },
            ),

          gender: z.enum(_Gender).optional(),
          bio: z.string().optional(),

          // Thêm password vào schema
          old_password: z
            .string()
            .min(8, "Mật khẩu cũ tối thiểu 8 ký tự")
            .optional()
            .or(z.literal("")),
          new_password: z
            .string()
            .min(8, "Mật khẩu mới tối thiểu 8 ký tự")
            .optional()
            .or(z.literal("")),
        })
        // Validate logic chéo: Nếu nhập mật khẩu mới thì bắt buộc nhập mật khẩu cũ
        .refine(
          (data) => {
            return !(data.new_password && !data.old_password);
          },
          {
            message: t("profile.error.old_password_required"),
            path: ["old_password"], // Hiển thị lỗi ở trường old_password
          },
        ),
    ),
  });

  useEffect(() => {
    // Cập nhật giá trị mặc định khi user thay đổi
    form.reset({
      name: user?.name,
      date_of_birth: user?.profile.date_of_birth || undefined,
      gender: user?.profile.gender || undefined,
      bio: user?.profile.bio || undefined,
    });
  }, [user, form]);

  // handle submit form
  const onSubmit = useCallback(
    (data: EditProfileRequest) => {
      setLoading(true);
      // Xử lý submit form
      editProfile(data, {
        onSuccess: (res) => {
          setUser(res.data.user);
          router.back();
        },
        onError: (error) => {
          errorHandle(error);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    },
    [editProfile, errorHandle, setLoading, setUser, router],
  );

  return {
    form,
    onSubmit,
  };
};

export const useLogout = () => {
  const mutationLogout = useLogoutMutation();
  const logout = useAuthStore((s) => s.logout);
  const setLoading = useApplicationStore((s) => s.setLoading);
  const handleError = useErrorToast();

  return () => {
    setLoading(true);
    mutationLogout.mutate(undefined, {
      onSuccess: () => {
        logout();
      },
      onError: (error) => {
        // Xử lý khi có lỗi xảy ra
        handleError(error);
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  };
};

/**
 * Hook để xóa tài khoản
 */

export const useLockAccount = () => {
  const { t } = useTranslation();
  const { mutate, isPending } = useLockAccountMutation();
  const logout = useAuthStore((s) => s.logout);
  const setLoading = useApplicationStore((s) => s.setLoading);
  const handleError = useErrorToast();

  const handleLockAccount = () => {
    const confirmed = window.confirm(
      `${t("profile.delete_account_confirm_title")}\n\n${t(
        "profile.delete_account_warning",
      )}`,
    );

    if (!confirmed) return;

    setLoading(true);

    mutate(undefined, {
      onSuccess: () => {
        setLoading(false);

        window.alert(t("profile.delete_account_success"));
        logout();
      },
      onError: (error) => {
        setLoading(false);
        handleError(error);
      },
    });
  };

  return {
    handleLockAccount,
    isPending,
  };
};

/**
 * Hook để reset password
 */
export const useResetPassword = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const handleError = useErrorToast();
  const { success } = useToast();

  // Get username_authenticate và type_authenticate từ auth store (should be set during forgot password flow)
  const username = useFormAuthStore((state) => state.username_authenticate);
  const typeAuthenticate = useFormAuthStore((state) => state.type_authenticate);

  const resetState = useFormAuthStore((state) => state.resetState);

  const form = useForm<ResetPasswordRequest>({
    resolver: zodResolver(
      z.object({
        username: z
          .string()
          .min(1, { message: t("auth.error.username_required") })
          .superRefine((val, ctx) => {
            const typeAuth = form.getValues("type_authenticate");

            if (typeAuth === _TypeAuthenticate.PHONE) {
              if (!/^[0-9]{9,12}$/.test(val)) {
                ctx.addIssue({
                  code: "custom",
                  message: t("auth.error.phone_invalid"),
                });
              }
            } else if (typeAuth === _TypeAuthenticate.EMAIL) {
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                ctx.addIssue({
                  code: "custom",
                  message: t("auth.error.email_invalid"),
                });
              }
            }
          }),
        type_authenticate: z.nativeEnum(_TypeAuthenticate),
        password: z
          .string()
          .min(1, { message: t("auth.error.password_invalid") })
          .min(8, { message: t("auth.error.password_invalid") })
          .regex(/[a-z]/, { message: t("auth.error.password_invalid") })
          .regex(/[A-Z]/, { message: t("auth.error.password_invalid") })
          .regex(/[0-9]/, { message: t("auth.error.password_invalid") }),
      }),
    ),
    defaultValues: {
      username: username || "",
      type_authenticate: typeAuthenticate,
      password: "",
    },
  });

  const { mutate, isPending } = useResetPasswordMutation();

  const onSubmit = useCallback(
    (data: ResetPasswordRequest) => {
      mutate(data, {
        onSuccess: () => {
          success({
            message: t("auth.success.reset_password_success"),
          });
          resetState();
          router.replace("auth");
        },
        onError: (err) => {
          handleError(err);
        },
      });
    },
    [mutate, success, t, resetState, router, handleError],
  );

  return {
    form,
    onSubmit,
    loading: isPending,
  };
};
