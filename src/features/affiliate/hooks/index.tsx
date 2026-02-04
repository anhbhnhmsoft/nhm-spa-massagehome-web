import {
  useQueryGetConfigAffiliate,
  useQueryMatchAffiliate,
} from "@/features/affiliate/hooks/use-query";
import { useEffect } from "react";
import { getMessageError } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/features/auth/store";
import useToast from "@/features/app/hooks/use-toast";
import { useReferralStore } from "@/features/affiliate/store";
import { useRouter } from "next/navigation";

export const useAffiliateUser = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const queryConfig = useQueryGetConfigAffiliate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // handle error
    if (queryConfig.error) {
      const message = getMessageError(queryConfig.error, t);
      if (message) {
        alert(message);
        router.back();
      }
    }
  }, [queryConfig.error]);

  return {
    config: queryConfig.data,
    affiliate_link: user?.affiliate_link || "",
  };
};

export const useCheckMatchAffiliate = () => {
  const router = useRouter();
  const { data } = useQueryMatchAffiliate();
  const setUserReferral = useReferralStore((state) => state.setUserReferral);
  const { success } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!data) return;

    const handleSaveReferral = () => {
      // 1. Kiểm tra status là true và need_register là true
      if (data?.status && !!data?.user_referral) {
        if (data?.need_register) {
          setUserReferral(data.user_referral);
        } else {
          success({
            message: t("affiliate.referred_by", {
              name: data.user_referral.name,
            }),
          });
        }
      }
    };

    handleSaveReferral();
  }, [data]);
};
