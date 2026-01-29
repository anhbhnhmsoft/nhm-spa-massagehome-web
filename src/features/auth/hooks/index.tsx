"use client";

import { useCallback, useEffect, useState } from "react";
import useAuthStore from "../store";
import { _AuthStatus, _Gender } from "../const";
import { useRouter } from "next/navigation";
import {
  useAuthenticateMutation,
  useLoginMutation,
  useLogoutMutation,
  useProfileMutation,
  useRegisterMutation,
  useResendRegisterOTPMutation,
  useSetLanguageMutation,
  useVerifyRegisterOTPMutation,
} from "@/features/auth/hooks/use-mutation";
import useToast from "@/features/app/hooks/use-toast";
import { useTranslation } from "react-i18next";
import useApplicationStore from "@/lib/store";
import { queryClient } from "@/lib/provider/query-provider";
import { _LanguageCode } from "@/lib/const";
import useErrorToast from "@/features/app/hooks/use-error-toast";
import {
  AuthenticateRequest,
  LoginRequest,
  RegisterRequest,
  VerifyRegisterOTPRequest,
} from "../types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useReferralStore } from "@/features/affiliate/store";

/**
 * Hàm để xác thực user xem là login hay register
 */
export const useHandleAuthenticate = () => {
  const { t } = useTranslation();
  const router = useRouter();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();
  // set phone_authen vào auth store khi submit form
  const setPhoneAuthen = useAuthStore((state) => state.setPhoneAuthen);
  // set expire_minutes vào auth store khi submit form
  const setExpireMinutes = useAuthStore((state) => state.setExpireMinutes);
  // mutate function để gọi API xác thực user
  const { mutate, isPending } = useAuthenticateMutation();
  // form hook để validate và submit form
  const form = useForm<AuthenticateRequest>({
    resolver: zodResolver(
      z.object({
        phone: z
          .string()
          .min(1, { error: t("auth.error.phone_required") })
          .regex(/^[0-9]+$/, { error: t("auth.error.phone_invalid") })
          .min(9, { error: t("auth.error.phone_min") })
          .max(12, { error: t("auth.error.phone_max") }),
      }),
    ),
    defaultValues: {
      phone: "",
    },
  });
  // handle submit form
  const onSubmit = useCallback(
    (data: AuthenticateRequest) => {
      mutate(data, {
        onSuccess: (res) => {
          // Nếu cần đăng ký thì redirect đến màn hình xác thực OTP
          const needRegister = res.data?.need_register || false;
          setPhoneAuthen(data.phone);
          if (needRegister) {
            // Lưu expire_minutes vào auth store khi submit form
            const expireMinutes = res.data?.expire_minutes || null;
            setExpireMinutes(expireMinutes);
            // Nếu cần đăng ký thì redirect đến màn hình xác thực OTP
            router.replace("/verify-otp");
          } else {
            // Nếu không cần đăng ký thì redirect đến màn hình login
            router.replace("/login");
          }
        },
        onError: (err) => {
          handleError(err);
        },
      });
    },
    [handleError, mutate, setExpireMinutes, setPhoneAuthen, router],
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
  // set phone_authen vào auth store khi submit form
  const phone = useAuthStore((state) => state.phone_authen);
  // handle success toast khi gọi API thành công
  const { success, error } = useToast();
  // set login vào auth store khi submit form
  const login = useAuthStore((state) => state.login);
  // form hook để validate và submit form
  const form = useForm<LoginRequest>({
    resolver: zodResolver(
      z.object({
        phone: z
          .string()
          .min(1, { error: t("auth.error.phone_required") })
          .regex(/^[0-9]+$/, { error: t("auth.error.phone_invalid") })
          .min(9, { error: t("auth.error.phone_min") })
          .max(12, { error: t("auth.error.phone_max") }),
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
      phone: phone || "",
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
            await login(res.data);

            success({
              message: t("auth.success.login_success"),
            });

            router.push("/");
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

  return {
    form,
    onSubmit,
    loading: isPending,
  };
};

/**
 * Hàm để xác thực OTP đăng ký
 */
export const useHandleVerifyRegisterOtp = () => {
  const { t } = useTranslation();
  const router = useRouter();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();
  // handle success toast khi gọi API thành công
  const { success } = useToast();

  // set phone_authen vào auth store khi submit form
  const phoneAuthen = useAuthStore((state) => state.phone_authen);

  // set token_register vào auth store khi submit form
  const setTokenRegister = useAuthStore((state) => state.setTokenRegister);

  // mutate function để gọi API xác thực user
  const mutationVerifyRegisterOTP = useVerifyRegisterOTPMutation();

  // form hook để validate và submit form
  const form = useForm<VerifyRegisterOTPRequest>({
    mode: "onChange",
    resolver: zodResolver(
      z.object({
        phone: z
          .string()
          .min(1, { error: t("auth.error.phone_required") })
          .regex(/^[0-9]+$/, { error: t("auth.error.phone_invalid") })
          .min(9, { error: t("auth.error.phone_min") })
          .max(12, { error: t("auth.error.phone_max") }),
        otp: z
          .string()
          .min(1, { error: t("auth.error.otp_required") })
          .regex(/^[0-9]+$/, { error: t("auth.error.otp_invalid") })
          .min(6, { error: t("auth.error.otp_min") })
          .max(6, { error: t("auth.error.otp_max") }),
      }),
    ),
    defaultValues: {
      phone: "",
      otp: "",
    },
  });

  // set phone_authen vào form khi submit form
  useEffect(() => {
    if (phoneAuthen) {
      form.setValue("phone", phoneAuthen);
    }
  }, [phoneAuthen]);

  // handle submit form
  const onSubmit = useCallback(
    (data: VerifyRegisterOTPRequest) => {
      mutationVerifyRegisterOTP.mutate(data, {
        onSuccess: (res) => {
          setTokenRegister(res.data.token);
          success({
            message: t("auth.success.verify_register_otp"),
          });
          router.replace("/register");
        },
        onError: (err) => {
          handleError(err);
        },
      });
    },
    [
      handleError,
      mutationVerifyRegisterOTP,
      router,
      setTokenRegister,
      success,
      t,
    ],
  );

  /**
   * ---------- Resend OTP Logic ----------
   */
  // mutate function để gọi API resend OTP register
  const mutationResendRegisterOTP = useResendRegisterOTPMutation();
  // Timer để đếm ngược thời gian resend OTP
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // handle resend OTP
  const resendOTP = () => {
    if (phoneAuthen && timer === 0) {
      mutationResendRegisterOTP.mutate(
        {
          phone: phoneAuthen,
        },
        {
          onSuccess: () => {
            success({
              message: t("auth.success.resend_otp"),
            });
            setTimer(60);
          },
          onError: (err) => {
            console.log(err);
            handleError(err);
          },
        },
      );
    }
  };

  return {
    phoneAuthen,
    timer,
    form,
    onSubmit,
    resendOTP,
    loading:
      mutationVerifyRegisterOTP.isPending ||
      mutationResendRegisterOTP.isPending,
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
  // handle success toast khi gọi API thành công
  const { success, error } = useToast();
  // Lấy token_register từ auth store khi submit form verify OTP
  const tokenRegister = useAuthStore((state) => state.token_register);

  const login = useAuthStore((state) => state.login);

  // mutate function để gọi API đăng ký user
  const mutationRegister = useRegisterMutation();

  // form hook để validate và submit form
  const form = useForm<RegisterRequest>({
    resolver: zodResolver(
      z.object({
        token: z.string().min(1),
        name: z.string().min(1, { error: t("auth.error.name_required") }),
        password: z
          .string()
          .min(1, { message: t("auth.error.password_invalid") })
          .min(8, { message: t("auth.error.password_invalid") })
          .regex(/[a-z]/, { message: t("auth.error.password_invalid") })
          .regex(/[A-Z]/, { message: t("auth.error.password_invalid") })
          .regex(/[0-9]/, { message: t("auth.error.password_invalid") }),
        referral_code: z.string().optional().nullable(),
        gender: z.enum(_Gender, {
          error: t("auth.error.gender_invalid"),
        }),
        language: z.enum(_LanguageCode, {
          error: t("auth.error.language_invalid"),
        }),
      }),
    ),
    defaultValues: {
      token: tokenRegister || "",
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
            await login(res.data); // ✅ không .then

            success({
              message: t("auth.success.register_success"),
            });

            clearUserReferral();
            router.push("/");
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
      router,
      success,
      t,
    ],
  );

  return {
    form,
    onSubmit,
    loading: mutationRegister.isPending,
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
        router.replace("/auth/index");
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
// /**
//  * Hook để lấy profile user
//  */
// export const useGetProfile = () => {
//   const { t } = useTranslation();
//   const setUser = useAuthStore((state) => state.setUser);
//   const logout = useAuthStore((state) => state.logout);
//   const { mutate } = useProfileMutation();
//   const { error } = useToast();

//   return useCallback(() => {
//     mutate(undefined, {
//       onSuccess: (res) => {
//         setUser(res.data.user);
//       },
//       onError: () => {
//         // Token hết hạn hoặc không hợp lệ
//         error({
//           message: t('common_error.invalid_or_expired_token'),
//         });
//         logout();
//       },
//     });
//   }, []);
// };

/**
 * Hook để hydrate auth state từ local storage
 */
export const useHydrateAuth = () => {
  const _hydrated = useAuthStore((state) => state._hydrated);
  const status = useAuthStore((state) => state.status);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const { mutate } = useProfileMutation();
  const { error } = useToast();
  const { t } = useTranslation();

  const [complete, setComplete] = useState(false);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useAuthStore.getState().hydrate();
  }, []);

  useEffect(() => {
    // Nếu chưa hydrate xong từ local storage thì chưa làm gì cả
    if (!_hydrated) {
      return;
    }

    const initAuth = () => {
      //  Nếu trạng thái là đã đăng nhập, cần verify token
      if (status === _AuthStatus.AUTHORIZED) {
        mutate(undefined, {
          onSuccess: (res) => {
            // Cập nhật thông tin user mới nhất
            setUser(res.data.user);
          },
          onError: () => {
            // Token hết hạn hoặc không hợp lệ
            error({
              message: t("common_error.invalid_or_expired_token"),
            });
            logout();
          },
          onSettled: () => {
            // Dù thành công hay thất bại đều phải cho app chạy tiếp
            setComplete(true);
          },
        });
      } else {
        // Nếu chưa đăng nhập (GUEST), cho qua luôn
        setComplete(true);
      }
    };

    initAuth();
  }, [_hydrated, t]);

  return complete;
};

/**
 * Hook để set ngôn ngữ user
 */
export const useSetLanguageUser = (onClose?: () => void) => {
  const { t, i18n } = useTranslation();

  const selectedLang = useApplicationStore((s) => s.language);
  const setLanguageStore = useApplicationStore((s) => s.setLanguage);

  const { mutate, isPending } = useSetLanguageMutation();
  const { error: errorToast } = useToast(!!onClose);

  const isAuthenticated = useCheckAuth();

  const syncLanguage = useCallback(
    async (lang: _LanguageCode) => {
      setLanguageStore(lang);

      await i18n.changeLanguage(lang);

      queryClient.clear();
      queryClient.invalidateQueries();
    },
    [setLanguageStore, i18n, queryClient],
  );

  const setLanguage = useCallback(
    async (lang: _LanguageCode) => {
      if (isAuthenticated) {
        mutate(
          { lang },
          {
            onSuccess: async () => {
              await syncLanguage(lang);
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
      }

      onClose?.();
    },
    [
      isAuthenticated,
      mutate,
      syncLanguage,
      onClose,
      t,
      errorToast, // ✅ BẮT BUỘC
    ],
  );

  return {
    setLanguage,
    selectedLang,
    isPending,
  };
};

// /**
//  * Hook để kiểm tra xem user có đang hoạt động hay không
//  */
// export const useHeartbeat = () => {
//   const status = useAuthStore((state) => state.status);
//   useHeartbeatQuery(status === _AuthStatus.AUTHORIZED);
// };

// /**
//  * Xử lý thay đổi avatar
//  */
// export const useChangeAvatar = () => {
//   const { t } = useTranslation();

//   const [permission, requestPermission] = useCameraPermissions();

//   const editAvatar = useEditAvatar();

//   // Xử lý khi nhấn nút chụp ảnh
//   const takePictureCamera = useCallback(async () => {
//     if (!permission?.granted) {
//       const res = await requestPermission();
//       if (!res.granted) {
//         Alert.alert(t('permission.camera.title'), t('permission.camera.message'));
//         return false;
//       }
//     } else {
//       // Nếu có quyền chụp ảnh thì chuyển sang màn hình chụp ảnh
//       router.push('/take-picture-avatar');

//       return true;
//     }
//   }, [permission?.granted, t]);

//   // Xử lý khi nhấn nút chọn ảnh từ thư viện
//   const chooseImageFormLib = useCallback(async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert(t('permission.picture_lib.title'), t('permission.picture_lib.message'));
//       return false;
//     } else {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         quality: 0.5,
//       });
//       if (!result.canceled) {
//         const form = new FormData();
//         form.append('file', {
//           uri: result.assets[0].uri,
//           name: 'avatar.jpg',
//           type: 'image/jpg',
//         } as any);
//         editAvatar(form, false);
//       }
//     }
//   }, [t]);

//   // Trả về hàm xử lý xoóa avatar và thay đổi avatar
//   const deleteAvatar = useCallback(() => {
//     editAvatar(undefined, false, true);
//   }, [editAvatar]);

//   return {
//     takePictureCamera,
//     chooseImageFormLib,
//     deleteAvatar,
//   };
// };

// /**
//  * Hook để chỉnh sửa avatar
//  */
// export const useEditAvatar = () => {
//   const { mutate: editAvatar } = useMutationEditAvatar();
//   const { mutate: deleteAvatar } = useMutationDeleteAvatar();
//   const errorHandle = useErrorToast();
//   const setUser = useAuthStore((state) => state.setUser);
//   const setLoading = useApplicationStore((state) => state.setLoading);

//   return useCallback(
//     (data: FormData | undefined, routerBack: boolean = true, isDelete: boolean = false) => {
//       setLoading(true);
//       // Xử lý khi xóa avatar
//       if (isDelete) {
//         deleteAvatar(undefined, {
//           onSuccess: (res) => {
//             setUser(res.data.user);
//             if (routerBack) {
//               router.back();
//             }
//           },
//           onError: (error) => {
//             errorHandle(error);
//           },
//           onSettled: () => {
//             setLoading(false);
//           },
//         });
//       } else if (data) {
//         // Xử lý khi chỉnh sửa avatar
//         editAvatar(data, {
//           onSuccess: (res) => {
//             setUser(res.data.user);
//             if (routerBack) {
//               router.back();
//             }
//           },
//           onError: (error) => {
//             errorHandle(error);
//           },
//           onSettled: () => {
//             setLoading(false);
//           },
//         });
//       }
//     },
//     []
//   );
// };

// /**
//  * Hook để chỉnh sửa thông tin profile
//  */
// export const useEditProfile = () => {
//   const { t } = useTranslation();
//   const errorHandle = useErrorToast();
//   const setUser = useAuthStore((state) => state.setUser);
//   const user = useAuthStore((state) => state.user);
//   const setLoading = useApplicationStore((state) => state.setLoading);

//   const { mutate: editProfile } = useMutationEditProfile();

//   const form = useForm<EditProfileRequest>({
//     defaultValues: {
//       name: user?.name,
//       date_of_birth: user?.profile.date_of_birth || undefined,
//       gender: user?.profile.gender || undefined,
//       bio: user?.profile.bio || undefined,
//     },
//     resolver: zodResolver(
//       z
//         .object({
//           name: z
//             .string()
//             .min(4, t('profile.error.invalid_name'))
//             .max(255)
//             .optional()
//             .or(z.literal('')),

//           // Lưu ý: Form dùng Date object để DatePicker hoạt động
//           date_of_birth: z
//             .string()
//             .optional()
//             .refine((val) => dayjs(val).isValid(), {
//               error: t('profile.error.invalid_date_of_birth'),
//             })
//             .refine(
//               (val) => {
//                 const inputTime = dayjs(val);
//                 // Ngày sinh phải trước ngày hiện tại
//                 return inputTime.isBefore(dayjs());
//               },
//               {
//                 error: t('profile.error.invalid_date_of_birth'), // "Ngày sinh phải trước ngày hiện tại"
//               }
//             ),

//           gender: z.enum(_Gender).optional(),
//           bio: z.string().optional(),

//           // Thêm password vào schema
//           old_password: z
//             .string()
//             .min(8, 'Mật khẩu cũ tối thiểu 8 ký tự')
//             .optional()
//             .or(z.literal('')),
//           new_password: z
//             .string()
//             .min(8, 'Mật khẩu mới tối thiểu 8 ký tự')
//             .optional()
//             .or(z.literal('')),
//         })
//         // Validate logic chéo: Nếu nhập mật khẩu mới thì bắt buộc nhập mật khẩu cũ
//         .refine(
//           (data) => {
//             return !(data.new_password && !data.old_password);
//           },
//           {
//             message: t('profile.error.old_password_required'),
//             path: ['old_password'], // Hiển thị lỗi ở trường old_password
//           }
//         )
//     ),
//   });

//   useEffect(() => {
//     // Cập nhật giá trị mặc định khi user thay đổi
//     form.reset({
//       name: user?.name,
//       date_of_birth: user?.profile.date_of_birth || undefined,
//       gender: user?.profile.gender || undefined,
//       bio: user?.profile.bio || undefined,
//     });
//   }, [user]);

//   // handle submit form
//   const onSubmit = useCallback((data: EditProfileRequest) => {
//     setLoading(true);
//     // Xử lý submit form
//     editProfile(data, {
//       onSuccess: (res) => {
//         setUser(res.data.user);
//         router.back();
//       },
//       onError: (error) => {
//         errorHandle(error);
//       },
//       onSettled: () => {
//         setLoading(false);
//       },
//     });
//   }, []);

//   return {
//     form,
//     onSubmit,
//   };
// };

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

// /**
//  * Hook để xóa tài khoản
//  */

// export const useLockAccount = () => {
//   const { t } = useTranslation(); // Khởi tạo hàm dịch t
//   const { mutate, isPending } = useLockAccountMutation();
//   const logout = useAuthStore((s) => s.logout);
//   const handleError = useErrorToast();
//   const setLoading = useApplicationStore((s) => s.setLoading);

//   const handleLockAccount = () => {
//     Alert.alert(
//       t('profile.delete_account_confirm_title'), // Tiêu đề: Xác nhận xóa tài khoản
//       t('profile.delete_account_warning'), // Nội dung cảnh báo hành động không thể hoàn tác
//       [
//         {
//           text: t('common.cancel'), // Chữ: Hủy
//           style: 'cancel',
//         },
//         {
//           text: t('profile.delete_account'), // Chữ: Xóa tài khoản
//           style: 'destructive',
//           onPress: () => {
//             setLoading(true);

//             mutate(undefined, {
//               onSuccess: () => {
//                 setLoading(false);

//                 // Thông báo sau khi API thành công
//                 Alert.alert(
//                   t('header_app.notification'), // Tiêu đề: Thông báo
//                   t('profile.delete_account_success'), // Nội dung: Tài khoản đã được xóa...
//                   [
//                     {
//                       text: 'Ok', // Chữ: OK
//                       onPress: () => {
//                         logout();
//                       },
//                     },
//                   ]
//                 );
//               },
//               onError: (error) => {
//                 setLoading(false);
//                 handleError(error);
//               },
//             });
//           },
//         },
//       ],
//       { cancelable: true }
//     );
//   };

//   return {
//     handleLockAccount,
//     isPending,
//   };
// };
