import { ResponseDataSuccessType } from "@/lib/types";

export type BannerItem = {
  id: string;
  image_url: string;
};

export type BannerResponse = ResponseDataSuccessType<BannerItem[]>;

// đây là respone demo sau mới sửa
export type CommercialCouponResponse = ResponseDataSuccessType<{
  coupons: string;
}>;

export type CollectCouponResponse = ResponseDataSuccessType<{
  need_login?: boolean;
  already_collected?: boolean;
}>;
