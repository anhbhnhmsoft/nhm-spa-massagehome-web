import { useQueryCheckApplyPartner } from "@/features/user/hooks/use-query";
import { useEffect } from "react";
import useToast from "@/features/app/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export const useCheckPartnerRegister = () => {
  const { t } = useTranslation();
  const queryCheck = useQueryCheckApplyPartner();
  const { error: errorToast } = useToast();
  const router = useRouter();

  const showForm = Boolean(queryCheck.data?.can_apply);

  useEffect(() => {
    if (queryCheck.isError) {
      errorToast({
        message: t("profile.partner_form.error_check_application"),
      });
      router.back();
    }
  }, [queryCheck.isError, t, router]);

  return {
    showForm,
    reviewApplication: queryCheck.data?.review_application || null,
  };
};
