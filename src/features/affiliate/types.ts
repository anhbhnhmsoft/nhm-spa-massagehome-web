import { _UserRole } from "@/features/auth/const";
import { ResponseDataSuccessType } from "@/lib/types";
import { BannerItem } from "../commercial/types";

export type UserReferral = {
  id: string;
  name: string;
};

export type ConfigAffiliate = {
  target_role: _UserRole;
  banner: BannerItem | null;
};
export type ConfigAffiliateResponse = ResponseDataSuccessType<ConfigAffiliate>;
export type MatchAffiliateResponse = ResponseDataSuccessType<{
  status: boolean;
  need_register?: boolean;
  user_referral?: UserReferral;
}>;
