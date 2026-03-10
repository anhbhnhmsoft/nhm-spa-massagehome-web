import { useTranslation } from "react-i18next";
import useErrorToast from "@/features/app/hooks/use-error-toast";
import useToast from "@/features/app/hooks/use-toast";
import {
  useResendForgotPasswordOTPMutation,
  useResendRegisterOTPMutation,
  useVerifyForgotPasswordOTPMutation,
  useVerifyRegisterOTPMutation,
} from "@/features/auth/hooks/use-mutation";
import { useForm } from "react-hook-form";
import { ResendOTPResponse, VerifyOTPRequest } from "@/features/auth/types";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";

import { useRouter } from "next/navigation";
import { useFormAuthStore } from "../store/form-auth-store";

/**
 * Hàm để xác thực OTP
 */
export const useHandleVerifyOtp = () => {
  const router = useRouter();
  const { t } = useTranslation();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();
  // handle success toast khi gọi API thành công
  const { success: successToast, error: errorToast } = useToast();

  // set phone_authen vào auth store khi submit form
  const phone = useFormAuthStore((state) => state.phone_authenticate);

  const caseVerifyOtp = useFormAuthStore((state) => state.case_verify_otp);

  // mutate function để gọi API xác thực đăng ký
  const {
    mutateAsync: verifyRegisterOTP,
    isPending: loadingVerifyOTPRegister,
  } = useVerifyRegisterOTPMutation();

  // mutate function để gọi API xác thực quên mật khẩu
  const {
    mutateAsync: verifyForgotPasswordOTP,
    isPending: loadingVerifyOTPForgotPassword,
  } = useVerifyForgotPasswordOTPMutation();

  // form hook để validate và submit form
  const form = useForm<VerifyOTPRequest>({
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
    if (phone) {
      form.setValue("phone", phone);
    }
  }, [form, phone]);

  // handle submit form
  const onSubmit = useCallback(
    async (data: VerifyOTPRequest) => {
      if (!caseVerifyOtp) return;

      try {
        switch (caseVerifyOtp) {
          case "register":
            await verifyRegisterOTP(data);
            successToast({ message: t("auth.success.verify_otp") });
            router.replace("/register");
            break;
          case "forgot_password":
            await verifyForgotPasswordOTP(data);
            successToast({ message: t("auth.success.verify_otp") });
            router.replace("/reset-password");
            break;
          default:
            errorToast({ message: t("common_error.unknown_error") });
            return;
        }
      } catch (error) {
        handleError(error);
      }
    },
    [
      caseVerifyOtp,
      errorToast,
      handleError,
      router,
      successToast,
      t,
      verifyForgotPasswordOTP,
      verifyRegisterOTP,
    ],
  );

  return {
    phone,
    form,
    onSubmit,
    loading: loadingVerifyOTPRegister || loadingVerifyOTPForgotPassword,
  };
};

/**
 * Resend OTP Logic
 */
export const useHandleResendOtp = () => {
  const { t } = useTranslation();
  const { success: successToast, error: errorToast } = useToast();
  const handleError = useErrorToast();

  // Form state
  const phone = useFormAuthStore((state) => state.phone_authenticate);
  const lastSentAt = useFormAuthStore((state) => state.last_sent_at);
  const retryAfterSeconds = useFormAuthStore(
    (state) => state.retry_after_seconds,
  );
  const setFormAuthStore = useFormAuthStore((state) => state.updateState);
  const caseVerifyOtp = useFormAuthStore((state) => state.case_verify_otp);

  // mutate function để gọi API resend OTP đăng ký
  const {
    mutateAsync: resendOTPRegister,
    isPending: loadingResendOTPRegister,
  } = useResendRegisterOTPMutation();

  const {
    mutateAsync: resendOTPForgotPassword,
    isPending: loadingResendOTPForgotPassword,
  } = useResendForgotPasswordOTPMutation();

  const calculateTime = useCallback(() => {
    if (!lastSentAt || !retryAfterSeconds) {
      return 60;
    }

    const lastSent = dayjs(lastSentAt);
    const now = dayjs();
    const nextAllowedTime = lastSent.add(retryAfterSeconds, "second");

    const diff = nextAllowedTime.diff(now, "second");

    return diff > 0 ? diff : 0;
  }, [lastSentAt, retryAfterSeconds]);

  const [secondsLeft, setSecondsLeft] = useState(calculateTime);

  useEffect(() => {
    // schedule the initial calculation asynchronously to avoid
    // calling setState synchronously inside the effect body
    const initial = calculateTime();
    const timeout = setTimeout(() => setSecondsLeft(initial), 0);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(timer);
    };
  }, [calculateTime, lastSentAt, retryAfterSeconds]);

  // handle resend OTP
  const resendOTP = useCallback(async () => {
    if (!phone || !caseVerifyOtp || secondsLeft > 0) return;
    try {
      let response: ResendOTPResponse | undefined;
      // 2. Chỉ switch để chọn API cần gọi
      switch (caseVerifyOtp) {
        case "register":
          response = await resendOTPRegister({ phone });
          break;
        case "forgot_password":
          response = await resendOTPForgotPassword({ phone });
          break;
        default:
          errorToast({ message: t("common_error.unknown_error") });
          return;
      }

      const data = response?.data;
      if (data?.last_sent_at) {
        setFormAuthStore({
          last_sent_at: data.last_sent_at,
        });
      }

      successToast({
        message: t("auth.success.resend_otp"),
      });
    } catch (error) {
      handleError(error);
    }
  }, [
    phone,
    caseVerifyOtp,
    secondsLeft,
    successToast,
    t,
    resendOTPRegister,
    resendOTPForgotPassword,
    errorToast,
    setFormAuthStore,
    handleError,
  ]);

  return {
    resendOTP,
    secondsLeft,
    loading: loadingResendOTPRegister || loadingResendOTPForgotPassword,
  };
};
